import React, { useState } from 'react';
import {
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import MobileFrame from '../../components/MobileFrame/MobileFrame';
import BottomNav from '../../components/BottomNav/BottomNav';

const INITIAL_CONTACTS = [
    { id: '1', initials: 'AS', name: 'Ana Souza', relation: 'Mãe', phone: '(11) 99234-5678', color: '#C83C59' },
    { id: '2', initials: 'CR', name: 'Camila Reis', relation: 'Irmã', phone: '(11) 98765-4321', color: '#2C2C2E' },
    { id: '3', initials: 'DM', name: 'Delegacia da Mulher', relation: 'Emergência', phone: '180', color: '#3A70B6' },
    { id: '4', initials: 'FL', name: 'Fernanda Lima', relation: 'Amiga', phone: '(21) 97654-3210', color: '#C83C59' },
];

export default function ContatosScreen() {
    const navigation = useNavigation();
    const [contacts, setContacts] = useState(INITIAL_CONTACTS);

    // Modal states
    const [isAddVisible, setAddVisible] = useState(false);
    const [isOptionsVisible, setOptionsVisible] = useState(false);
    const [isEditVisible, setEditVisible] = useState(false);
    const [isRemoveVisible, setRemoveVisible] = useState(false);

    // Selection and Form states
    const [selectedContact, setSelectedContact] = useState(null);
    const [formData, setFormData] = useState({ name: '', relation: '', phone: '' });

    const openOptions = (contact) => {
        setSelectedContact(contact);
        setOptionsVisible(true);
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

    const renderContact = ({ item }) => (
        <View style={styles.contactCard}>
            <View style={[styles.avatar, { backgroundColor: item.color }]}>
                <Text style={styles.avatarText}>{item.initials}</Text>
            </View>
            <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{item.name}</Text>
                <Text style={styles.contactDetails}>{item.relation} · {item.phone}</Text>
            </View>
            <View style={styles.actionButtons}>
                <Pressable style={styles.iconBtn}>
                    <MaterialCommunityIcons name="phone-outline" size={20} color="#C83C59" />
                </Pressable>
                <Pressable style={styles.iconBtn} onPress={() => openOptions(item)}>
                    <MaterialCommunityIcons name="dots-horizontal" size={20} color="#8E8E93" />
                </Pressable>
            </View>
        </View>
    );

    return (
        <MobileFrame backgroundColor="#0D0D0D">
            <View style={styles.appContainer}>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.screenTitle}>Contatos de Confiança</Text>
                    <Pressable style={styles.addBtn} onPress={() => setAddVisible(true)}>
                        <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
                    </Pressable>
                </View>

                {/* Lista de Contatos */}
                <FlatList
                    data={contacts}
                    keyExtractor={(item) => item.id}
                    renderItem={renderContact}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListFooterComponent={
                        <Pressable style={styles.alertBtn}>
                            <MaterialCommunityIcons name="bell-ring-outline" size={22} color="#FFFFFF" style={styles.alertIcon} />
                            <Text style={styles.alertBtnText}>Alertar todos os contatos agora</Text>
                        </Pressable>
                    }
                />

                <BottomNav active="Contatos" />
            </View>

            {/* Modal: Novo Contato */}
            <Modal visible={isAddVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardAvoid}>
                        <View style={styles.bottomSheet}>
                            <View style={styles.dragIndicator} />
                            <Text style={styles.modalTitle}>Novo contato de confiança</Text>

                            <TextInput style={styles.input} placeholder="Nome completo *" placeholderTextColor="#8E8E93" />
                            <TextInput style={styles.input} placeholder="Relação (ex: Mãe, Irmã, Amiga) *" placeholderTextColor="#8E8E93" />
                            <TextInput style={styles.input} placeholder="Telefone *" placeholderTextColor="#8E8E93" keyboardType="phone-pad" />

                            <View style={styles.modalActions}>
                                <Pressable style={styles.cancelBtn} onPress={() => setAddVisible(false)}>
                                    <Text style={styles.cancelBtnText}>Cancelar</Text>
                                </Pressable>
                                <Pressable style={styles.primaryBtn} onPress={() => setAddVisible(false)}>
                                    <Text style={styles.primaryBtnText}>Adicionar</Text>
                                </Pressable>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

            {/* Modal: Opções do Contato */}
            <Modal visible={isOptionsVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.bottomSheet}>
                        <View style={styles.dragIndicator} />

                        {selectedContact && (
                            <View style={styles.optionsHeader}>
                                <View style={[styles.avatar, { backgroundColor: selectedContact.color, marginRight: 16 }]}>
                                    <Text style={styles.avatarText}>{selectedContact.initials}</Text>
                                </View>
                                <View>
                                    <Text style={styles.contactName}>{selectedContact.name}</Text>
                                    <Text style={styles.contactDetails}>{selectedContact.relation} · {selectedContact.phone}</Text>
                                </View>
                            </View>
                        )}

                        <View style={styles.divider} />

                        <Pressable style={styles.optionRow} onPress={openEdit}>
                            <MaterialCommunityIcons name="square-edit-outline" size={22} color="#FFFFFF" />
                            <Text style={styles.optionText}>Editar contato</Text>
                        </Pressable>

                        <View style={styles.divider} />

                        <Pressable style={styles.optionRow} onPress={openRemove}>
                            <MaterialCommunityIcons name="account-remove-outline" size={22} color="#C83C59" />
                            <Text style={[styles.optionText, { color: '#C83C59' }]}>Remover contato</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {/* Modal: Editar Contato */}
            <Modal visible={isEditVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardAvoid}>
                        <View style={styles.bottomSheet}>
                            <View style={styles.dragIndicator} />
                            <Text style={styles.modalTitle}>Editar contato</Text>

                            <TextInput
                                style={styles.input}
                                value={formData.name}
                                onChangeText={(t) => setFormData({ ...formData, name: t })}
                                placeholderTextColor="#8E8E93"
                            />
                            <TextInput
                                style={styles.input}
                                value={formData.relation}
                                onChangeText={(t) => setFormData({ ...formData, relation: t })}
                                placeholderTextColor="#8E8E93"
                            />
                            <TextInput
                                style={styles.input}
                                value={formData.phone}
                                onChangeText={(t) => setFormData({ ...formData, phone: t })}
                                placeholderTextColor="#8E8E93"
                                keyboardType="phone-pad"
                            />

                            <View style={styles.modalActions}>
                                <Pressable style={styles.cancelBtn} onPress={() => setEditVisible(false)}>
                                    <Text style={styles.cancelBtnText}>Cancelar</Text>
                                </Pressable>
                                <Pressable style={styles.primaryBtn} onPress={() => setEditVisible(false)}>
                                    <Text style={styles.primaryBtnText}>Salvar</Text>
                                </Pressable>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

            {/* Modal: Remover Contato */}
            <Modal visible={isRemoveVisible} transparent animationType="fade">
                <View style={styles.modalOverlayCenter}>
                    <View style={styles.dialogBox}>
                        <View style={styles.dialogIconContainer}>
                            <MaterialCommunityIcons name="account-remove-outline" size={32} color="#C83C59" />
                        </View>
                        <Text style={styles.dialogTitle}>Remover contato?</Text>
                        <Text style={styles.dialogText}>
                            <Text style={{ fontWeight: '700', color: '#FFFFFF' }}>{selectedContact?.name}</Text> será removido da sua lista de confiança.
                        </Text>

                        <View style={styles.modalActions}>
                            <Pressable style={styles.cancelBtn} onPress={() => setRemoveVisible(false)}>
                                <Text style={styles.cancelBtnText}>Cancelar</Text>
                            </Pressable>
                            <Pressable style={styles.primaryBtn} onPress={() => setRemoveVisible(false)}>
                                <Text style={styles.primaryBtnText}>Remover</Text>
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
        fontSize: 22,
        fontWeight: '700',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
        alignItems: 'center',
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