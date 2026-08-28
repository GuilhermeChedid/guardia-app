import React, { useState, useEffect } from 'react';
import {
    FlatList,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';

import MobileFrame from '../../components/MobileFrame/MobileFrame';
import BottomNav from '../../components/BottomNav/BottomNav';

const MOCK_FILES = [
    {
        id: '1',
        type: 'audio',
        name: 'Gravação_14h32.m4a',
        description: 'Conversa registrada na noite do dia 20',
        date: 'Hoje, 14:32',
        size: '2.4 MB',
        duration: '1:47',
        icon: 'microphone',
        iconColor: '#E6A23C',
        iconBg: 'rgba(230, 162, 60, 0.1)'
    },
    {
        id: '2',
        type: 'image',
        name: 'Foto_12h10.jpg',
        description: '',
        date: 'Hoje, 12:10',
        size: '3.8 MB',
        duration: null,
        icon: 'image-outline',
        iconColor: '#409EFF',
        iconBg: 'rgba(64, 158, 255, 0.1)'
    },
    {
        id: '3',
        type: 'video',
        name: 'Video_09h55.mp4',
        description: 'Vídeo do incidente na rua',
        date: 'Ontem, 09:55',
        size: '18.2 MB',
        duration: '0:32',
        icon: 'video-outline',
        iconColor: '#F56C6C',
        iconBg: 'rgba(245, 108, 108, 0.1)'
    },
];

const FILTERS = ['Todos', 'Fotos', 'Vídeos', 'Áudios', 'Arquivos'];

export default function ProvasScreen() {
    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pin, setPin] = useState('');

    // Main Screen States
    const [activeFilter, setActiveFilter] = useState('Todos');
    const [files, setFiles] = useState(MOCK_FILES);

    // Modal States
    const [isOptionsVisible, setOptionsVisible] = useState(false);
    const [isDeleteVisible, setDeleteVisible] = useState(false);
    const [isEditVisible, setEditVisible] = useState(false);

    // Selection and Form
    const [selectedFile, setSelectedFile] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });

    // --- PIN Logic ---
    useEffect(() => {
        if (pin.length === 4) {
            // Auto unlock for demo purposes when 4 digits are typed
            setTimeout(() => setIsAuthenticated(true), 300);
        }
    }, [pin]);

    const handlePinPress = (val) => {
        if (pin.length < 4) setPin(pin + val);
    };

    const handleBackspace = () => {
        if (pin.length > 0) setPin(pin.slice(0, -1));
    };

    // --- Modal Controls ---
    const openOptions = (file) => {
        setSelectedFile(file);
        setOptionsVisible(true);
    };

    const openEdit = () => {
        setFormData({
            name: selectedFile.name,
            description: selectedFile.description || ''
        });
        setOptionsVisible(false);
        setTimeout(() => setEditVisible(true), 300);
    };

    const openDelete = () => {
        setOptionsVisible(false);
        setTimeout(() => setDeleteVisible(true), 300);
    };

    // --- Render PIN Pad ---
    const renderPinPad = () => (
        <View style={styles.pinContainer}>
            <View style={styles.pinHeader}>
                <View style={styles.lockIconContainer}>
                    <Feather name="lock" size={28} color="#C83C59" />
                </View>
                <Text style={styles.screenTitleCenter}>Área Protegida</Text>
                <Text style={styles.pinSubtitle}>Digite seu PIN de 4 dígitos para acessar as evidências</Text>

                <View style={styles.pinDotsContainer}>
                    {[1, 2, 3, 4].map((_, idx) => (
                        <View
                            key={idx}
                            style={[styles.pinDot, pin.length > idx && styles.pinDotActive]}
                        />
                    ))}
                </View>
            </View>

            <View style={styles.keypad}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <Pressable key={num} style={styles.keypadBtn} onPress={() => handlePinPress(num.toString())}>
                        <Text style={styles.keypadTxt}>{num}</Text>
                    </Pressable>
                ))}
                <View style={styles.keypadBtnEmpty} />
                <Pressable style={styles.keypadBtn} onPress={() => handlePinPress('0')}>
                    <Text style={styles.keypadTxt}>0</Text>
                </Pressable>
                <Pressable style={styles.keypadBtn} onPress={handleBackspace}>
                    <Ionicons name="backspace-outline" size={24} color="#8E8E93" />
                </Pressable>
            </View>
        </View>
    );

    // --- Render Main Content ---
    const renderFileItem = ({ item }) => (
        <View style={styles.fileCard}>
            <View style={[styles.fileIconBox, { backgroundColor: item.iconBg }]}>
                <MaterialCommunityIcons name={item.icon} size={24} color={item.iconColor} />
            </View>
            <View style={styles.fileInfo}>
                <Text style={styles.fileName} numberOfLines={1}>{item.name}</Text>
                {item.description ? (
                    <Text style={styles.fileDescription} numberOfLines={1}>{item.description}</Text>
                ) : null}
                <Text style={styles.fileMeta}>
                    {item.date} · {item.size} {item.duration ? `· ${item.duration}` : ''}
                </Text>
            </View>
            <View style={styles.fileActions}>
                <Feather name="lock" size={14} color="#23A862" style={{ marginRight: 12 }} />
                <Pressable style={styles.optionsBtn} onPress={() => openOptions(item)}>
                    <MaterialCommunityIcons name="dots-horizontal" size={20} color="#8E8E93" />
                </Pressable>
            </View>
        </View>
    );

    return (
        <MobileFrame backgroundColor="#0D0D0D">
            <View style={styles.appContainer}>

                {!isAuthenticated ? (
                    renderPinPad()
                ) : (
                    <View style={{ flex: 1 }}>
                        <View style={styles.headerRow}>
                            <View>
                                <Text style={styles.screenTitle}>Provas e Evidências</Text>
                                <Text style={styles.screenSubtitle}>3 arquivos · Criptografados</Text>
                            </View>
                            <View style={styles.secureBadge}>
                                <Feather name="lock" size={12} color="#23A862" />
                                <Text style={styles.secureText}>Seguro</Text>
                            </View>
                        </View>

                        <Pressable style={styles.uploadArea}>
                            <Feather name="upload" size={24} color="#23A862" style={{ marginBottom: 8 }} />
                            <Text style={styles.uploadText}>Upload</Text>
                        </Pressable>

                        <View>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                                {FILTERS.map(f => (
                                    <Pressable
                                        key={f}
                                        style={[styles.filterPill, activeFilter === f && styles.filterPillActive]}
                                        onPress={() => setActiveFilter(f)}
                                    >
                                        <Text style={[styles.filterTxt, activeFilter === f && styles.filterTxtActive]}>
                                            {f}
                                        </Text>
                                    </Pressable>
                                ))}
                            </ScrollView>
                        </View>

                        <FlatList
                            data={files}
                            keyExtractor={(item) => item.id}
                            renderItem={renderFileItem}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                            ListFooterComponent={
                                <View style={styles.infoFooter}>
                                    <Feather name="alert-circle" size={16} color="#8E8E93" style={{ marginTop: 2 }} />
                                    <Text style={styles.infoFooterText}>
                                        Todas as evidências são criptografadas e armazenadas com segurança. Apenas você pode acessá-las.
                                    </Text>
                                </View>
                            }
                        />
                    </View>
                )}

                <BottomNav active="Provas" />
            </View>

            {/* Modal: Opções do Arquivo */}
            <Modal visible={isOptionsVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.bottomSheet}>
                        <View style={styles.dragIndicator} />

                        {selectedFile && (
                            <View style={styles.optionsHeader}>
                                <View style={[styles.fileIconBox, { backgroundColor: selectedFile.iconBg, marginRight: 16 }]}>
                                    <MaterialCommunityIcons name={selectedFile.icon} size={24} color={selectedFile.iconColor} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.fileName} numberOfLines={1}>{selectedFile.name}</Text>
                                    <Text style={styles.fileMeta}>{selectedFile.date} · {selectedFile.size}</Text>
                                </View>
                            </View>
                        )}

                        <View style={styles.divider} />

                        <Pressable style={styles.optionRow} onPress={openEdit}>
                            <Feather name="edit" size={20} color="#FFFFFF" />
                            <Text style={styles.optionText}>Renomear / Editar descrição</Text>
                        </Pressable>

                        <View style={styles.divider} />

                        <Pressable style={styles.optionRow} onPress={openDelete}>
                            <Feather name="trash-2" size={20} color="#C83C59" />
                            <Text style={[styles.optionText, { color: '#C83C59' }]}>Excluir evidência</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {/* Modal: Editar Evidência */}
            <Modal visible={isEditVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardAvoid}>
                        <View style={styles.bottomSheet}>
                            <View style={styles.dragIndicator} />
                            <Text style={styles.modalTitle}>Editar evidência</Text>

                            <Text style={styles.inputLabel}>NOME DO ARQUIVO</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.name}
                                onChangeText={(t) => setFormData({ ...formData, name: t })}
                                placeholderTextColor="#8E8E93"
                            />

                            <Text style={styles.inputLabel}>DESCRIÇÃO</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={formData.description}
                                onChangeText={(t) => setFormData({ ...formData, description: t })}
                                placeholderTextColor="#8E8E93"
                                multiline
                                textAlignVertical="top"
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

            {/* Modal: Excluir Evidência */}
            <Modal visible={isDeleteVisible} transparent animationType="fade">
                <View style={styles.modalOverlayCenter}>
                    <View style={styles.dialogBox}>
                        <View style={styles.dialogIconContainer}>
                            <Feather name="trash-2" size={32} color="#C83C59" />
                        </View>
                        <Text style={styles.dialogTitle}>Excluir evidência?</Text>
                        <Text style={styles.dialogText}>
                            "<Text style={{ fontWeight: '700', color: '#FFFFFF' }}>{selectedFile?.name}</Text>" será removida permanentemente.
                        </Text>

                        <View style={styles.modalActions}>
                            <Pressable style={styles.cancelBtn} onPress={() => setDeleteVisible(false)}>
                                <Text style={styles.cancelBtnText}>Cancelar</Text>
                            </Pressable>
                            <Pressable style={styles.primaryBtn} onPress={() => setDeleteVisible(false)}>
                                <Text style={styles.primaryBtnText}>Excluir</Text>
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
    // --- PIN SCREEN STYLES ---
    pinContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    pinHeader: {
        alignItems: 'center',
        marginBottom: 48,
    },
    lockIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(200, 60, 89, 0.3)',
        backgroundColor: 'rgba(200, 60, 89, 0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    screenTitleCenter: {
        fontSize: 24,
        fontWeight: '700',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        color: '#FFFFFF',
        marginBottom: 12,
    },
    pinSubtitle: {
        fontSize: 14,
        color: '#8E8E93',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 32,
    },
    pinDotsContainer: {
        flexDirection: 'row',
        gap: 16,
    },
    pinDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#2C2C2E',
    },
    pinDotActive: {
        backgroundColor: '#8E8E93',
    },
    keypad: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        width: 280,
        gap: 16,
    },
    keypadBtn: {
        width: 80,
        height: 56,
        borderRadius: 12,
        backgroundColor: '#1C1C1E',
        alignItems: 'center',
        justifyContent: 'center',
    },
    keypadBtnEmpty: {
        width: 80,
        height: 56,
    },
    keypadTxt: {
        fontSize: 22,
        fontWeight: '600',
        color: '#FFFFFF',
    },

    // --- MAIN SCREEN STYLES ---
    headerRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 20,
    },
    screenTitle: {
        fontSize: 22,
        fontWeight: '700',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    screenSubtitle: {
        fontSize: 13,
        color: '#8E8E93',
    },
    secureBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(35, 168, 98, 0.15)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(35, 168, 98, 0.3)',
    },
    secureText: {
        color: '#23A862',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 6,
    },
    uploadArea: {
        marginHorizontal: 20,
        backgroundColor: '#1C1C1E',
        borderRadius: 16,
        height: 100,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    uploadText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
    },
    filterScroll: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        gap: 10,
    },
    filterPill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#1C1C1E',
        borderWidth: 1,
        borderColor: '#2C2C2E',
    },
    filterPillActive: {
        backgroundColor: '#C83C59',
        borderColor: '#C83C59',
    },
    filterTxt: {
        color: '#8E8E93',
        fontSize: 14,
        fontWeight: '500',
    },
    filterTxtActive: {
        color: '#FFFFFF',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    fileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1C1C1E',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    fileIconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fileInfo: {
        flex: 1,
        marginLeft: 12,
        marginRight: 8,
    },
    fileName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 2,
    },
    fileDescription: {
        fontSize: 13,
        color: '#8E8E93',
        marginBottom: 4,
    },
    fileMeta: {
        fontSize: 12,
        color: '#8E8E93',
    },
    fileActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionsBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#2C2C2E',
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoFooter: {
        flexDirection: 'row',
        backgroundColor: '#151515',
        padding: 16,
        borderRadius: 12,
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#1C1C1E',
        alignItems: 'flex-start',
    },
    infoFooterText: {
        color: '#8E8E93',
        fontSize: 12,
        lineHeight: 18,
        marginLeft: 10,
        flex: 1,
    },

    // --- MODAL STYLES ---
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
    inputLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#8E8E93',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    input: {
        backgroundColor: '#0D0D0D',
        borderRadius: 12,
        color: '#FFFFFF',
        fontSize: 15,
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 20,
        width: '100%',
        borderWidth: 1,
        borderColor: '#2C2C2E',
    },
    textArea: {
        height: 100,
        paddingTop: 16,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
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
        marginVertical: 12,
        width: '100%',
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
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