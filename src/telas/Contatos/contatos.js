import React, { useCallback, useRef, useState } from 'react';
import {
    Animated,
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
    KeyboardAvoidingView,
    Platform,
    Linking
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import MobileFrame from '../../components/MobileFrame/MobileFrame';
import BottomNav from '../../components/BottomNav/BottomNav';
import { useTheme } from '../../context/ThemeContext';
import { useUserProfile } from '../../context/UserProfileContext';
import api from '../../services/api';
import { phoneMask } from '../../utils/masks';

export default function ContatosScreen() {
    const navigation = useNavigation();
    const { colors } = useTheme();
    const { refreshProfile } = useUserProfile();
    const [contacts, setContacts] = useState([]);

    // Modal states
    const [isAddVisible, setAddVisible] = useState(false);
    const [isOptionsVisible, setOptionsVisible] = useState(false);
    const [isEditVisible, setEditVisible] = useState(false);
    const [isRemoveVisible, setRemoveVisible] = useState(false);

    // Selection and Form states
    const [selectedContact, setSelectedContact] = useState(null);
    const [formData, setFormData] = useState({ name: '', relation: '', phone: '' });
    const [userId, setUserId] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const optionsSheetAnim = useRef(new Animated.Value(320)).current;
    const alertScaleAnim = useRef(new Animated.Value(1)).current;
    const feedbackTimer = useRef(null);

    const showFeedback = useCallback((message, type = 'success') => {
        setFeedback({ message, type });
        clearTimeout(feedbackTimer.current);
        feedbackTimer.current = setTimeout(() => setFeedback(null), 3500);
    }, []);

    const loadContacts = useCallback(async () => {
        try {
            const storedUser = await AsyncStorage.getItem('@guardia/auth_user');
            const user = storedUser ? JSON.parse(storedUser) : null;
            if (!user?.id) return;
            setUserId(user.id);
            const response = await api.get(`/auth/contacts/${user.id}`);
            setContacts(response.data.contacts.map((contact) => ({
                ...contact,
                initials: contact.nome.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
                name: contact.nome,
                relation: contact.relacao,
                phone: contact.telefone,
                color: '#C83C59',
            })));
        } catch (error) {
            console.error('Erro ao carregar contatos:', error);
            showFeedback(error.response?.data?.message || 'Não foi possível carregar os contatos.', 'error');
        }
    }, [showFeedback]);

    useFocusEffect(useCallback(() => {
        loadContacts();
    }, [loadContacts]));

    const saveContact = async (isEdit = false) => {
        if (!userId || !formData.name.trim() || !formData.relation.trim() || !formData.phone.trim()) {
            showFeedback('Preencha todos os campos do contato.', 'error');
            return;
        }
        try {
            setIsSaving(true);
            const path = isEdit
                ? `/auth/contacts/${userId}/${selectedContact.id}`
                : `/auth/contacts/${userId}`;
            const response = await (isEdit ? api.put(path, {
                nome: formData.name, relacao: formData.relation, telefone: formData.phone,
            }) : api.post(path, {
                nome: formData.name, relacao: formData.relation, telefone: formData.phone,
            }));
            const contact = response.data.contact;
            const mapped = {
                ...contact,
                initials: contact.nome.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
                name: contact.nome, relation: contact.relacao, phone: contact.telefone, color: '#C83C59',
            };
            setContacts((current) => isEdit
                ? current.map((item) => item.id === mapped.id ? mapped : item)
                : [...current, mapped]);
            setAddVisible(false);
            setEditVisible(false);
            setFormData({ name: '', relation: '', phone: '' });
            refreshProfile();
            showFeedback(isEdit ? 'Contato atualizado com sucesso.' : 'Contato criado com sucesso.');
        } catch (error) {
            showFeedback(error.response?.data?.message || 'Não foi possível salvar o contato.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const removeContact = async () => {
        try {
            setIsRemoving(true);
            await api.delete(`/auth/contacts/${userId}/${selectedContact.id}`);
            setContacts((current) => current.filter((item) => item.id !== selectedContact.id));
            setRemoveVisible(false);
            refreshProfile();
            showFeedback('Contato excluído com sucesso.');
        } catch (error) {
            showFeedback(error.response?.data?.message || 'Não foi possível remover o contato.', 'error');
        } finally {
            setIsRemoving(false);
        }
    };

    React.useEffect(() => () => clearTimeout(feedbackTimer.current), []);

    const handleAlertPressIn = () => {
        Animated.spring(alertScaleAnim, {
            toValue: 0.94,
            useNativeDriver: true,
        }).start();
    };

    const handleAlertPressOut = () => {
        Animated.spring(alertScaleAnim, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    const openOptions = (contact) => {
        setSelectedContact(contact);
        setOptionsVisible(true);
        optionsSheetAnim.setValue(320);
        requestAnimationFrame(() => {
            Animated.spring(optionsSheetAnim, {
                toValue: 0,
                useNativeDriver: true,
                damping: 20,
                stiffness: 180,
            }).start();
        });
    };

    const closeOptions = () => {
        Animated.timing(optionsSheetAnim, {
            toValue: 320,
            duration: 180,
            useNativeDriver: true,
        }).start(() => setOptionsVisible(false));
    };

    const openEdit = () => {
        setFormData({
            name: selectedContact.name,
            relation: selectedContact.relation,
            phone: selectedContact.phone
        });
        setOptionsVisible(false);
        setTimeout(() => setEditVisible(true), 300);
    };

    const openRemove = () => {
        setOptionsVisible(false);
        setTimeout(() => setRemoveVisible(true), 300);
    };

    const callContact = async (contact) => {
        const phone = String(contact.phone || '').replace(/\D/g, '');
        if (!phone) {
            showFeedback('Este contato não possui um telefone válido.', 'error');
            return;
        }

        const phoneUrl = `tel:${phone}`;
        try {
            const canOpen = await Linking.canOpenURL(phoneUrl);
            if (!canOpen) {
                showFeedback('Não foi possível abrir o aplicativo de telefone neste dispositivo.', 'error');
                return;
            }
            await Linking.openURL(phoneUrl);
        } catch (error) {
            console.error('Erro ao abrir telefone do contato:', error);
            showFeedback('Não foi possível iniciar a ligação.', 'error');
        }
    };

    const renderContact = ({ item }) => (
        <View style={[styles.contactCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.avatar, { backgroundColor: item.color }]}>
                <Text style={styles.avatarText}>{item.initials}</Text>
            </View>
            <View style={styles.contactInfo}>
                <Text style={[styles.contactName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.contactDetails, { color: colors.muted }]}>{item.relation} · {item.phone}</Text>
            </View>
            <View style={styles.actionButtons}>
                <Pressable
                    style={[styles.iconBtn, { backgroundColor: colors.border }]}
                    onPress={() => callContact(item)}
                    accessibilityLabel={`Ligar para ${item.name}`}
                >
                    <MaterialCommunityIcons name="phone-outline" size={20} color="#C83C59" />
                </Pressable>
                <Pressable style={[styles.iconBtn, { backgroundColor: colors.border }]} onPress={() => openOptions(item)}>
                    <MaterialCommunityIcons name="dots-horizontal" size={20} color="#8E8E93" />
                </Pressable>
            </View>
        </View>
    );

    const renderAlertButton = () => (
        <Animated.View style={{ transform: [{ scale: alertScaleAnim }] }}>
            <Pressable
                style={styles.alertBtn}
                onPressIn={handleAlertPressIn}
                onPressOut={handleAlertPressOut}
                onPress={() => navigation.navigate('Home', { startSos: true })}
            >
                <MaterialCommunityIcons name="bell-ring-outline" size={22} color="#FFFFFF" style={styles.alertIcon} />
                <Text style={styles.alertBtnText}>Alertar todos os contatos agora</Text>
            </Pressable>
        </Animated.View>
    );

    return (
        <MobileFrame backgroundColor="#0D0D0D">
            <View style={[styles.appContainer, { backgroundColor: colors.background }]}>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.screenTitle, { color: colors.text }]}>Contatos de Confiança</Text>
                    <Pressable style={styles.addBtn} onPress={() => { setFormData({ name: '', relation: '', phone: '' }); setAddVisible(true); }}>
                        <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
                    </Pressable>
                </View>

                {feedback && (
                    <View style={[
                        styles.feedback,
                        { backgroundColor: feedback.type === 'error' ? '#FDECEF' : '#E8F7EF' },
                    ]}>
                        <MaterialCommunityIcons
                            name={feedback.type === 'error' ? 'alert-circle-outline' : 'check-circle-outline'}
                            size={22}
                            color={feedback.type === 'error' ? '#C83C59' : '#21864A'}
                        />
                        <Text style={[
                            styles.feedbackText,
                            { color: feedback.type === 'error' ? '#A52D47' : '#176B3A' },
                        ]}>
                            {feedback.message}
                        </Text>
                        <Pressable onPress={() => setFeedback(null)} accessibilityLabel="Fechar aviso">
                            <MaterialCommunityIcons name="close" size={18} color={feedback.type === 'error' ? '#A52D47' : '#176B3A'} />
                        </Pressable>
                    </View>
                )}

                {/* Lista de Contatos */}
                <FlatList
                    data={contacts}
                    keyExtractor={(item) => item.id}
                    renderItem={renderContact}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={(
                        <View style={styles.emptyContactsState}>
                            <MaterialCommunityIcons name="account-multiple-outline" size={36} color={colors.muted} />
                            <Text style={[styles.emptyContactsText, { color: colors.muted }]}>
                                Nenhum contato salvo ainda.
                            </Text>
                            <Text style={[styles.emptyContactsHint, { color: colors.muted }]}>
                                Adicione um contato de confiança para receber alertas de emergência.
                            </Text>
                        </View>
                    )}
                    ListFooterComponent={contacts.length > 0 ? renderAlertButton : null}
                />

                <BottomNav active="Contatos" />
            </View>

            {/* Modal: Novo Contato */}
            <Modal visible={isAddVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardAvoid}>
                        <View style={[styles.bottomSheet, { backgroundColor: colors.surface }]}>
                            <View style={styles.dragIndicator} />
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Novo contato de confiança</Text>

                            <TextInput value={formData.name} onChangeText={(name) => setFormData({ ...formData, name })} style={[styles.input, { backgroundColor: colors.input, color: colors.text, borderColor: colors.border }]} placeholder="Nome completo *" placeholderTextColor={colors.muted} />
                            <TextInput value={formData.relation} onChangeText={(relation) => setFormData({ ...formData, relation })} style={[styles.input, { backgroundColor: colors.input, color: colors.text, borderColor: colors.border }]} placeholder="Relação (ex: Mãe, Irmã, Amiga) *" placeholderTextColor={colors.muted} />
                            <TextInput value={formData.phone} onChangeText={(phone) => setFormData({ ...formData, phone: phoneMask(phone) })} style={[styles.input, { backgroundColor: colors.input, color: colors.text, borderColor: colors.border }]} placeholder="Telefone *" placeholderTextColor={colors.muted} keyboardType="phone-pad" />

                            <View style={styles.modalActions}>
                                <Pressable style={[styles.cancelBtn, { backgroundColor: colors.border }]} onPress={() => setAddVisible(false)}>
                                    <Text style={styles.cancelBtnText}>Cancelar</Text>
                                </Pressable>
                                <Pressable style={[styles.primaryBtn, isSaving && styles.disabledBtn]} onPress={() => saveContact()} disabled={isSaving}>
                                    <Text style={styles.primaryBtnText}>{isSaving ? 'Salvando...' : 'Adicionar'}</Text>
                                </Pressable>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

            {/* Modal: Opções do Contato */}
            <Modal visible={isOptionsVisible} transparent animationType="none" onRequestClose={closeOptions}>
                <View style={styles.modalOverlay}>
                    <Pressable style={styles.modalBackdrop} onPress={closeOptions} />
                    <Animated.View
                        style={[styles.bottomSheet, { backgroundColor: colors.surface, transform: [{ translateY: optionsSheetAnim }] }]}
                        onStartShouldSetResponder={() => true}
                    >
                        <View style={styles.dragIndicator} />

                        {selectedContact && (
                            <View style={styles.optionsHeader}>
                                <View style={[styles.avatar, { backgroundColor: selectedContact.color, marginRight: 16 }]}>
                                    <Text style={styles.avatarText}>{selectedContact.initials}</Text>
                                </View>
                                <View>
                                    <Text style={[styles.contactName, { color: colors.text }]}>{selectedContact.name}</Text>
                                    <Text style={[styles.contactDetails, { color: colors.muted }]}>{selectedContact.relation} · {selectedContact.phone}</Text>
                                </View>
                            </View>
                        )}

                        <View style={[styles.divider, { backgroundColor: colors.border }]} />

                        <Pressable style={styles.optionRow} onPress={openEdit}>
                            <MaterialCommunityIcons name="square-edit-outline" size={22} color={colors.text} />
                            <Text style={[styles.optionText, { color: colors.text }]}>Editar contato</Text>
                        </Pressable>

                        <View style={[styles.divider, { backgroundColor: colors.border }]} />

                        <Pressable style={styles.optionRow} onPress={openRemove}>
                            <MaterialCommunityIcons name="account-remove-outline" size={22} color="#C83C59" />
                            <Text style={[styles.optionText, { color: '#C83C59' }]}>Remover contato</Text>
                        </Pressable>
                    </Animated.View>
                </View>
            </Modal>

            {/* Modal: Editar Contato */}
            <Modal visible={isEditVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardAvoid}>
                        <View style={[styles.bottomSheet, { backgroundColor: colors.surface }]}>
                            <View style={styles.dragIndicator} />
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Editar contato</Text>

                            <TextInput
                                style={[styles.input, { backgroundColor: colors.input, color: colors.text, borderColor: colors.border }]}
                                value={formData.name}
                                onChangeText={(t) => setFormData({ ...formData, name: t })}
                                placeholderTextColor={colors.muted}
                            />
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.input, color: colors.text, borderColor: colors.border }]}
                                value={formData.relation}
                                onChangeText={(t) => setFormData({ ...formData, relation: t })}
                                placeholderTextColor={colors.muted}
                            />
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.input, color: colors.text, borderColor: colors.border }]}
                                value={formData.phone}
                                onChangeText={(t) => setFormData({ ...formData, phone: phoneMask(t) })}
                                placeholderTextColor={colors.muted}
                                keyboardType="phone-pad"
                            />

                            <View style={styles.modalActions}>
                                <Pressable style={[styles.cancelBtn, { backgroundColor: colors.border }]} onPress={() => setEditVisible(false)}>
                                    <Text style={styles.cancelBtnText}>Cancelar</Text>
                                </Pressable>
                                <Pressable style={[styles.primaryBtn, isSaving && styles.disabledBtn]} onPress={() => saveContact(true)} disabled={isSaving}>
                                    <Text style={styles.primaryBtnText}>{isSaving ? 'Salvando...' : 'Salvar'}</Text>
                                </Pressable>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

            {/* Modal: Remover Contato */}
            <Modal visible={isRemoveVisible} transparent animationType="fade">
                <View style={styles.modalOverlayCenter}>
                    <View style={[styles.dialogBox, { backgroundColor: colors.surface }]}>
                        <View style={styles.dialogIconContainer}>
                            <MaterialCommunityIcons name="account-remove-outline" size={32} color="#C83C59" />
                        </View>
                        <Text style={[styles.dialogTitle, { color: colors.text }]}>Remover contato?</Text>
                        <Text style={styles.dialogText}>
                            <Text style={{ fontWeight: '700', color: colors.text }}>{selectedContact?.name}</Text> será removido da sua lista de confiança.
                        </Text>

                        <View style={styles.modalActions}>
                            <Pressable style={[styles.cancelBtn, { backgroundColor: colors.border }]} onPress={() => setRemoveVisible(false)}>
                                <Text style={styles.cancelBtnText}>Cancelar</Text>
                            </Pressable>
                            <Pressable style={[styles.primaryBtn, isRemoving && styles.disabledBtn]} onPress={removeContact} disabled={isRemoving}>
                                <Text style={styles.primaryBtnText}>{isRemoving ? 'Removendo...' : 'Remover'}</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </MobileFrame>
    );
}

const styles = StyleSheet.create({
    appContainer: {
        flex: 1,
        backgroundColor: '#0D0D0D',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 24,
    },
    screenTitle: {
        fontSize: 26,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    addBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#C83C59',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#C83C59',
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 5,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    emptyContactsState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
        paddingHorizontal: 20,
    },
    emptyContactsText: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 12,
        textAlign: 'center',
    },
    emptyContactsHint: {
        fontSize: 12,
        lineHeight: 18,
        marginTop: 6,
        textAlign: 'center',
    },
    feedback: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginBottom: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 9,
    },
    feedbackText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
    },
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1C1C1E',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    avatar: {
        width: 46,
        height: 46,
        borderRadius: 23,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    contactInfo: {
        flex: 1,
        marginLeft: 12,
    },
    contactName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    contactDetails: {
        fontSize: 13,
        color: '#8E8E93',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    iconBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#2C2C2E',
        alignItems: 'center',
        justifyContent: 'center',
    },
    alertBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#C83C59',
        borderRadius: 16,
        paddingVertical: 18,
        marginTop: 16,
        shadowColor: '#C83C59',
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 6,
    },
    alertIcon: {
        marginRight: 8,
    },
    alertBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    disabledBtn: {
        opacity: 0.65,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.28)',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    modalOverlayCenter: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    keyboardAvoid: {
        width: '100%',
        alignItems: 'center',
    },
    bottomSheet: {
        backgroundColor: '#1C1C1E',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 40,
        width: '100%',
        maxWidth: 400,
    },
    dragIndicator: {
        width: 40,
        height: 4,
        backgroundColor: '#3A3A3C',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        color: '#FFFFFF',
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#0D0D0D',
        borderRadius: 12,
        color: '#FFFFFF',
        fontSize: 15,
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 12,
        width: '100%',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
        gap: 12,
        width: '100%',
    },
    cancelBtn: {
        flex: 1,
        backgroundColor: '#2C2C2E',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    cancelBtnText: {
        color: '#8E8E93',
        fontSize: 15,
        fontWeight: '600',
    },
    primaryBtn: {
        flex: 1,
        backgroundColor: '#C83C59',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    primaryBtnText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    optionsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        width: '100%',
    },
    divider: {
        height: 1,
        backgroundColor: '#2C2C2E',
        marginVertical: 16,
        width: '100%',
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        width: '100%',
    },
    optionText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#FFFFFF',
        marginLeft: 16,
    },
    dialogBox: {
        backgroundColor: '#1C1C1E',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        width: '100%',
        maxWidth: 340,
    },
    dialogIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(200, 60, 89, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    dialogTitle: {
        fontSize: 20,
        fontWeight: '700',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        color: '#FFFFFF',
        marginBottom: 12,
    },
    dialogText: {
        fontSize: 15,
        color: '#8E8E93',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    }
});