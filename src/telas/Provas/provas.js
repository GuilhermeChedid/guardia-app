import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
    Animated,
    FlatList,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    KeyboardAvoidingView,
    Platform,
    Linking
} from 'react-native';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import MobileFrame from '../../components/MobileFrame/MobileFrame';
import { useTheme } from '../../context/ThemeContext';
import BottomNav from '../../components/BottomNav/BottomNav';
import api from '../../services/api';

const FILTERS = ['Todos', 'Fotos', 'Vídeos', 'Áudios', 'Arquivos'];
const UPLOAD_TYPES = {
    image: { label: 'Foto', extensions: ['jpg', 'jpeg', 'png'], maxBytes: 5 * 1024 * 1024, limit: '5 MB', mime: 'image/*' },
    video: { label: 'Vídeo', extensions: ['mp4', 'mov'], maxBytes: 30 * 1024 * 1024, limit: '30 MB', mime: 'video/*' },
    audio: { label: 'Áudio', extensions: ['mp3', 'wav', 'm4a'], maxBytes: 10 * 1024 * 1024, limit: '10 MB', mime: 'audio/*' },
    file: { label: 'Texto', extensions: ['txt'], maxBytes: 5 * 1024 * 1024, limit: '5 MB', mime: 'text/plain' },
};

export default function ProvasScreen() {
    const { colors } = useTheme();
    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pin, setPin] = useState('');
    const [pinError, setPinError] = useState('');

    // Main Screen States
    const [activeFilter, setActiveFilter] = useState('Todos');
    const [files, setFiles] = useState([]);
    const [userId, setUserId] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const feedbackTimer = useRef(null);
    const filteredFiles = activeFilter === 'Todos'
        ? files
        : files.filter((file) => {
            if (activeFilter === 'Fotos') return file.type === 'image';
            if (activeFilter === 'Vídeos') return file.type === 'video';
            if (activeFilter === 'Áudios') return file.type === 'audio';
            return !['image', 'video', 'audio'].includes(file.type);
        });

    // Modal States
    const [isOptionsVisible, setOptionsVisible] = useState(false);
    const [isDeleteVisible, setDeleteVisible] = useState(false);
    const [isEditVisible, setEditVisible] = useState(false);
    const [isHistoryVisible, setHistoryVisible] = useState(false);
    const [history, setHistory] = useState([]);
    const [uploadType, setUploadType] = useState('image');
    const [selectedUploads, setSelectedUploads] = useState([]);

    // Selection and Form
    const [selectedFile, setSelectedFile] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', content: '' });
    const optionsSheetAnim = useRef(new Animated.Value(320)).current;
    const editSheetAnim = useRef(new Animated.Value(320)).current;

    const showFeedback = useCallback((message, type = 'success') => {
        setFeedback({ message, type });
        clearTimeout(feedbackTimer.current);
        feedbackTimer.current = setTimeout(() => setFeedback(null), 3500);
    }, []);

    const decorateFile = (file) => {
        const type = file.type || 'file';
        const visuals = {
            image: ['image-outline', '#409EFF', 'rgba(64, 158, 255, 0.1)'],
            video: ['video-outline', '#F56C6C', 'rgba(245, 108, 108, 0.1)'],
            audio: ['microphone', '#E6A23C', 'rgba(230, 162, 60, 0.1)'],
            file: ['file-outline', '#8E8E93', 'rgba(142, 142, 147, 0.1)'],
        };
        const [icon, iconColor, iconBg] = visuals[type] || visuals.file;
        return {
            ...file,
            date: file.createdAt ? new Date(file.createdAt).toLocaleString('pt-BR') : 'Agora',
            icon, iconColor, iconBg,
        };
    };

    const loadEvidences = useCallback(async () => {
        try {
            const storedUser = await AsyncStorage.getItem('@guardia/auth_user');
            const user = storedUser ? JSON.parse(storedUser) : null;
            if (!user?.id) return;
            setUserId(user.id);
            const response = await api.get(`/auth/evidences/${user.id}`);
            setFiles(response.data.evidences.map(decorateFile));
        } catch (error) {
            console.error('Erro ao carregar evidências:', error);
            showFeedback(error.response?.data?.message || 'Não foi possível carregar as evidências.', 'error');
        }
    }, [showFeedback]);

    const loadHistory = useCallback(async () => {
        if (!userId) return;
        try {
            const response = await api.get(`/auth/evidences/${userId}/history`);
            setHistory(response.data.history);
        } catch (error) {
            showFeedback(error.response?.data?.message || 'Não foi possível carregar o histórico.', 'error');
        }
    }, [userId, showFeedback]);

    useFocusEffect(useCallback(() => {
        if (isAuthenticated) loadEvidences();
    }, [isAuthenticated, loadEvidences]));

    useEffect(() => () => clearTimeout(feedbackTimer.current), []);

    // --- PIN Logic ---
    useEffect(() => {
        if (pin.length !== 4) {
            return;
        }

        const verifyPin = async () => {
            try {
                const storedUser = await AsyncStorage.getItem('@guardia/auth_user');
                const user = storedUser ? JSON.parse(storedUser) : null;

                if (!user?.id) {
                    setPinError('Sua sessão expirou. Faça login novamente.');
                    setPin('');
                    return;
                }

                await api.post('/auth/verify-proof-pin', {
                    usuario_id: user.id,
                    pin,
                });
                setIsAuthenticated(true);
            } catch (error) {
                setPin('');
                setPinError(error.response?.data?.message || 'PIN incorreto. Tente novamente.');
            }
        };

        verifyPin();
    }, [pin]);

    const handlePinPress = (val) => {
        if (pin.length < 4) {
            setPinError('');
            setPin(pin + val);
        }
    };

    const handleBackspace = () => {
        if (pin.length > 0) setPin(pin.slice(0, -1));
    };

    // --- Modal Controls ---
    const openOptions = (file) => {
        setSelectedFile(file);
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
            name: selectedFile.name,
            description: selectedFile.description || '',
            content: selectedFile.content || '',
        });
        setOptionsVisible(false);
        editSheetAnim.setValue(320);
        setTimeout(() => {
            setEditVisible(true);
            requestAnimationFrame(() => {
                Animated.spring(editSheetAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    damping: 20,
                    stiffness: 180,
                }).start();
            });
        }, 300);
    };

    const openCreate = () => {
        setSelectedFile(null);
        setFormData({ name: '', description: '', content: '' });
        setUploadType('image');
        setSelectedUploads([]);
        editSheetAnim.setValue(320);
        setEditVisible(true);
        requestAnimationFrame(() => {
            Animated.spring(editSheetAnim, {
                toValue: 0,
                useNativeDriver: true,
                damping: 20,
                stiffness: 180,
            }).start();
        });
    };

    const pickEvidenceFiles = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: UPLOAD_TYPES[uploadType].mime,
            multiple: true,
            copyToCacheDirectory: true,
        });
        if (result.canceled) return;

        const rules = UPLOAD_TYPES[uploadType];
        const invalid = result.assets.filter((asset) => {
            const extension = asset.name.split('.').pop()?.toLowerCase();
            return !rules.extensions.includes(extension) || (asset.size ?? 0) > rules.maxBytes;
        });
        if (invalid.length) {
            showFeedback(
                `Arquivo inválido. ${rules.label}: formatos ${rules.extensions.join(', ').toUpperCase()} e tamanho máximo de ${rules.limit} por arquivo.`,
                'error'
            );
            setSelectedUploads([]);
            return;
        }
        setSelectedUploads(result.assets);
        setFormData((current) => ({ ...current, name: result.assets.length === 1 ? result.assets[0].name : `${result.assets.length} arquivos selecionados` }));
    };

    const pickMediaFromLibrary = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            showFeedback('Permita o acesso à biblioteca de fotos para selecionar arquivos.', 'error');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: uploadType === 'image' ? ['images'] : ['videos'],
            allowsMultipleSelection: true,
            selectionLimit: 20,
            quality: 1,
        });
        if (result.canceled) return;

        const rules = UPLOAD_TYPES[uploadType];
        const assets = result.assets.map((asset) => {
            const extension = (asset.fileName || asset.uri.split('.').pop() || (uploadType === 'image' ? 'jpg' : 'mp4'))
                .split('.')
                .pop()
                .toLowerCase();
            const name = asset.fileName || `evidencia-${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
            const size = asset.fileSize || 0;
            return {
                ...asset,
                name,
                size,
                mimeType: asset.mimeType || rules.mime,
            };
        });
        const invalid = assets.filter((asset) =>
            !rules.extensions.includes(asset.name.split('.').pop()?.toLowerCase()) ||
            (asset.size > 0 && asset.size > rules.maxBytes)
        );
        if (invalid.length) {
            showFeedback(
                `Arquivo inválido. ${rules.label}: formatos ${rules.extensions.join(', ').toUpperCase()} e tamanho máximo de ${rules.limit} por arquivo.`,
                'error'
            );
            return;
        }
        setSelectedUploads(assets);
        setFormData((current) => ({
            ...current,
            name: assets.length === 1 ? assets[0].name : `${assets.length} arquivos selecionados`,
        }));
    };

    const readAssetAsBase64 = async (asset) => {
        if (Platform.OS === 'web') {
            const response = await fetch(asset.uri);
            const blob = await response.blob();
            const buffer = await blob.arrayBuffer();
            const bytes = new Uint8Array(buffer);
            let binary = '';
            for (let index = 0; index < bytes.length; index += 1) {
                binary += String.fromCharCode(bytes[index]);
            }
            return btoa(binary);
        }

        return FileSystem.readAsStringAsync(asset.uri, {
            encoding: FileSystem.EncodingType.Base64,
        });
    };

    const saveEvidence = async () => {
        if (!userId || !formData.name.trim()) {
            showFeedback('Informe o nome da evidência.', 'error');
            return;
        }
        try {
            setIsSaving(true);
            const isDirectText = !selectedFile && uploadType === 'file';
            if (isDirectText && !formData.content.trim()) {
                showFeedback('Digite o conteúdo do arquivo TXT.', 'error');
                return;
            }
            const textSizeBytes = isDirectText ? new Blob([formData.content]).size : 0;
            if (isDirectText && textSizeBytes > UPLOAD_TYPES.file.maxBytes) {
                showFeedback('Texto muito grande. O tamanho máximo permitido para TXT é 5 MB.', 'error');
                return;
            }
            if (!selectedFile && !isDirectText && selectedUploads.length === 0) {
                showFeedback('Selecione pelo menos um arquivo antes de enviar.', 'error');
                return;
            }
            const uploads = selectedFile || isDirectText ? [null] : selectedUploads;
            const responses = [];
            for (const upload of uploads) {
                const textName = formData.name.toLowerCase().endsWith('.txt') ? formData.name : `${formData.name}.txt`;
                const payload = selectedFile
                    ? formData
                    : isDirectText
                        ? {
                            name: textName,
                            description: formData.description,
                            type: 'file',
                            sizeBytes: textSizeBytes,
                            size: `${(textSizeBytes / (1024 * 1024)).toFixed(2)} MB`,
                            content: formData.content,
                        }
                    : {
                        name: upload.name,
                        description: formData.description,
                        type: uploadType,
                        sizeBytes: upload.size || 0,
                        size: `${((upload.size || 0) / (1024 * 1024)).toFixed(2)} MB`,
                        url: upload.uri,
                        contentBase64: await readAssetAsBase64(upload),
                        mimeType: upload.mimeType || UPLOAD_TYPES[uploadType].mime,
                    };
                const response = selectedFile
                ? await api.put(`/auth/evidences/${userId}/${selectedFile.id}`, formData)
                : await api.post(`/auth/evidences/${userId}`, payload);
                responses.push(response.data.evidence);
            }
            const savedFiles = responses.map(decorateFile);
            setFiles((current) => selectedFile
                ? current.map((file) => file.id === savedFiles[0].id ? savedFiles[0] : file)
                : [...savedFiles, ...current]);
            closeEdit();
            await loadHistory();
            showFeedback(selectedFile ? 'Evidência atualizada com sucesso.' : `${savedFiles.length} evidência(s) criada(s) com sucesso.`);
        } catch (error) {
            showFeedback(error.response?.data?.message || 'Não foi possível salvar a evidência.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const deleteEvidence = async () => {
        try {
            setIsDeleting(true);
            await api.delete(`/auth/evidences/${userId}/${selectedFile.id}`);
            setFiles((current) => current.filter((file) => file.id !== selectedFile.id));
            setDeleteVisible(false);
            await loadHistory();
            showFeedback('Evidência excluída com sucesso.');
        } catch (error) {
            showFeedback(error.response?.data?.message || 'Não foi possível excluir a evidência.', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const downloadEvidence = async (file = selectedFile) => {
        if (!file) return;

        try {
            closeOptions();
            const safeName = (file.name || `evidencia-${file.id}`)
                .replace(/[<>:"/\\|?*]/g, '_');

            if (file.type === 'file' && typeof file.content === 'string') {
                if (Platform.OS === 'web') {
                    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
                    const downloadUrl = URL.createObjectURL(blob);
                    const anchor = document.createElement('a');
                    anchor.href = downloadUrl;
                    anchor.download = safeName.toLowerCase().endsWith('.txt') ? safeName : `${safeName}.txt`;
                    anchor.click();
                    URL.revokeObjectURL(downloadUrl);
                } else {
                    if (!FileSystem.documentDirectory) {
                        throw new Error('Diretório local indisponível para salvar a evidência.');
                    }
                    const fileUri = `${FileSystem.documentDirectory}${safeName.toLowerCase().endsWith('.txt') ? safeName : `${safeName}.txt`}`;
                    await FileSystem.writeAsStringAsync(fileUri, selectedFile.content, {
                        encoding: FileSystem.EncodingType.UTF8,
                    });
                    if (!(await Sharing.isAvailableAsync())) {
                        throw new Error('O compartilhamento de arquivos não está disponível neste dispositivo.');
                    }
                    await Sharing.shareAsync(fileUri, {
                        dialogTitle: 'Baixar evidência',
                        mimeType: 'text/plain',
                    });
                }
                showFeedback('Arquivo TXT preparado para download.');
                return;
            }

            if (file.contentBase64) {
                const mimeType = file.mimeType || 'application/octet-stream';
                if (Platform.OS === 'web') {
                    const binary = atob(file.contentBase64);
                    const bytes = new Uint8Array(binary.length);
                    for (let index = 0; index < binary.length; index += 1) {
                        bytes[index] = binary.charCodeAt(index);
                    }
                    const blob = new Blob([bytes], { type: mimeType });
                    const downloadUrl = URL.createObjectURL(blob);
                    const anchor = document.createElement('a');
                    anchor.href = downloadUrl;
                    anchor.download = safeName;
                    anchor.click();
                    URL.revokeObjectURL(downloadUrl);
                } else {
                    if (!FileSystem.documentDirectory) {
                        throw new Error('Diretório local indisponível para salvar a evidência.');
                    }
                    const fileUri = `${FileSystem.documentDirectory}${safeName}`;
                    await FileSystem.writeAsStringAsync(fileUri, file.contentBase64, {
                        encoding: FileSystem.EncodingType.Base64,
                    });
                    if (!(await Sharing.isAvailableAsync())) {
                        throw new Error('O compartilhamento de arquivos não está disponível neste dispositivo.');
                    }
                    await Sharing.shareAsync(fileUri, { dialogTitle: 'Baixar evidência', mimeType });
                }
                showFeedback('Arquivo preparado para download.');
                return;
            }

            if (!file.url || file.url.startsWith('blob:')) {
                throw new Error('Este anexo não possui um arquivo disponível para download. Faça o upload novamente.');
            }

            if (Platform.OS === 'web') {
                const anchor = document.createElement('a');
                anchor.href = file.url;
                anchor.download = safeName;
                anchor.target = '_blank';
                anchor.rel = 'noopener noreferrer';
                anchor.click();
            } else {
                await Sharing.shareAsync(file.url, {
                    dialogTitle: 'Baixar evidência',
                });
            }
            showFeedback('Arquivo preparado para download.');
        } catch (error) {
            console.error('Erro ao baixar evidência:', error);
            showFeedback(error.message || 'Não foi possível baixar a evidência.', 'error');
        }
    };

    const closeEdit = () => {
        Animated.timing(editSheetAnim, {
            toValue: 320,
            duration: 180,
            useNativeDriver: true,
        }).start(() => setEditVisible(false));
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
                <Text style={[styles.screenTitleCenter, { color: colors.text }]}>Área Protegida</Text>
                <Text style={[styles.pinSubtitle, { color: colors.muted }]}>Digite seu PIN de 4 dígitos para acessar as evidências</Text>

                <View style={styles.pinDotsContainer}>
                    {[1, 2, 3, 4].map((_, idx) => (
                        <View
                            key={idx}
                            style={[styles.pinDot, { backgroundColor: colors.border }, pin.length > idx && styles.pinDotActive]}
                        />
                    ))}
                </View>
                {pinError ? (
                    <View style={styles.pinErrorBox}>
                        <Feather name="alert-circle" size={16} color="#F87171" />
                        <Text style={styles.pinErrorText}>{pinError}</Text>
                    </View>
                ) : null}
            </View>

            <View style={styles.keypad}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <Pressable key={num} style={[styles.keypadBtn, { backgroundColor: colors.surface }]} onPress={() => handlePinPress(num.toString())}>
                        <Text style={[styles.keypadTxt, { color: colors.text }]}>{num}</Text>
                    </Pressable>
                ))}
                <View style={styles.keypadBtnEmpty} />
                <Pressable style={[styles.keypadBtn, { backgroundColor: colors.surface }]} onPress={() => handlePinPress('0')}>
                    <Text style={[styles.keypadTxt, { color: colors.text }]}>0</Text>
                </Pressable>
                <Pressable style={[styles.keypadBtn, { backgroundColor: colors.surfaceStrong }]} onPress={handleBackspace}>
                    <Ionicons name="backspace-outline" size={24} color={colors.muted} />
                </Pressable>
            </View>
        </View>
    );

    // --- Render Main Content ---
    const renderFileItem = ({ item }) => (
        <View style={[styles.fileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.fileIconBox, { backgroundColor: item.iconBg }]}>
                <MaterialCommunityIcons name={item.icon} size={24} color={item.iconColor} />
            </View>
            <View style={styles.fileInfo}>
                <Text style={[styles.fileName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                {item.description ? (
                    <Text style={[styles.fileDescription, { color: colors.muted }]} numberOfLines={1}>{item.description}</Text>
                ) : null}
                <Text style={[styles.fileMeta, { color: colors.muted }]}>
                    {item.date} · {item.size} {item.duration ? `· ${item.duration}` : ''}
                </Text>
            </View>
            <View style={styles.fileActions}>
                <Feather name="lock" size={14} color="#23A862" style={{ marginRight: 12 }} />
                <Pressable
                    style={[styles.optionsBtn, { backgroundColor: colors.border, marginRight: 8 }]}
                    onPress={() => downloadEvidence(item)}
                    accessibilityLabel={`Baixar ${item.name}`}
                >
                    <Feather name="download" size={16} color="#23A862" />
                </Pressable>
                <Pressable style={[styles.optionsBtn, { backgroundColor: colors.border }]} onPress={() => openOptions(item)}>
                    <MaterialCommunityIcons name="dots-horizontal" size={20} color="#8E8E93" />
                </Pressable>
            </View>
        </View>
    );

    return (
        <MobileFrame backgroundColor="#0D0D0D">
            <View style={[styles.appContainer, { backgroundColor: colors.background }]}>

                {!isAuthenticated ? (
                    renderPinPad()
                ) : (
                    <View style={{ flex: 1 }}>
                        <View style={styles.headerRow}>
                            <View>
                                <Text style={[styles.screenTitle, { color: colors.text }]}>Provas e Evidências</Text>
                                <Text style={[styles.screenSubtitle, { color: colors.muted }]}>
                                    {filteredFiles.length} {filteredFiles.length === 1 ? 'arquivo' : 'arquivos'} · Criptografados
                                </Text>
                            </View>
                            <View style={styles.secureBadge}>
                                <Feather name="lock" size={12} color="#23A862" />
                                <Text style={styles.secureText}>Seguro</Text>
                            </View>
                            <Pressable style={[styles.historyBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => { loadHistory(); setHistoryVisible(true); }}>
                                <Feather name="clock" size={16} color={colors.text} />
                                <Text style={[styles.historyBtnText, { color: colors.text }]}>Histórico</Text>
                            </Pressable>
                        </View>

                        {feedback && (
                            <View style={[styles.feedback, { backgroundColor: feedback.type === 'error' ? '#FDECEF' : '#E8F7EF' }]}>
                                <MaterialCommunityIcons
                                    name={feedback.type === 'error' ? 'alert-circle-outline' : 'check-circle-outline'}
                                    size={22}
                                    color={feedback.type === 'error' ? '#C83C59' : '#21864A'}
                                />
                                <Text style={[styles.feedbackText, { color: feedback.type === 'error' ? '#A52D47' : '#176B3A' }]}>
                                    {feedback.message}
                                </Text>
                                <Pressable onPress={() => setFeedback(null)} accessibilityLabel="Fechar aviso">
                                    <MaterialCommunityIcons name="close" size={18} color={feedback.type === 'error' ? '#A52D47' : '#176B3A'} />
                                </Pressable>
                            </View>
                        )}

                        <Pressable onPress={openCreate} style={[styles.uploadArea, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <Feather name="upload" size={24} color="#23A862" style={{ marginBottom: 8 }} />
                            <Text style={[styles.uploadText, { color: colors.text }]}>Upload</Text>
                        </Pressable>

                        <View>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                                {FILTERS.map(f => (
                                    <Pressable
                                        key={f}
                                        style={[styles.filterPill, { backgroundColor: colors.surface, borderColor: colors.border }, activeFilter === f && styles.filterPillActive]}
                                        onPress={() => setActiveFilter(f)}
                                    >
                                        <Text style={[styles.filterTxt, { color: colors.muted }, activeFilter === f && styles.filterTxtActive]}>
                                            {f}
                                        </Text>
                                    </Pressable>
                                ))}
                            </ScrollView>
                        </View>

                        <FlatList
                            data={filteredFiles}
                            keyExtractor={(item) => item.id}
                            renderItem={renderFileItem}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                <View style={styles.emptyFilesState}>
                                    <MaterialCommunityIcons name="file-search-outline" size={32} color={colors.muted} />
                                    <Text style={[styles.emptyFilesText, { color: colors.muted }]}>Nenhuma evidência nesta categoria.</Text>
                                </View>
                            }
                            ListFooterComponent={
                                <View style={[styles.infoFooter, { backgroundColor: colors.surfaceStrong, borderColor: colors.border }]}>
                                    <Feather name="alert-circle" size={16} color="#8E8E93" style={{ marginTop: 2 }} />
                                    <Text style={[styles.infoFooterText, { color: colors.muted }]}>
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
            <Modal visible={isOptionsVisible} transparent animationType="none" onRequestClose={closeOptions}>
                <View style={styles.modalOverlay}>
                    <Pressable style={styles.modalBackdrop} onPress={closeOptions} />
                    <Animated.View
                        style={[styles.bottomSheet, { backgroundColor: colors.surface, transform: [{ translateY: optionsSheetAnim }] }]}
                        onStartShouldSetResponder={() => true}
                    >
                        <View style={styles.dragIndicator} />

                        {selectedFile && (
                            <View style={styles.optionsHeader}>
                                <View style={[styles.fileIconBox, { backgroundColor: selectedFile.iconBg, marginRight: 16 }]}>
                                    <MaterialCommunityIcons name={selectedFile.icon} size={24} color={selectedFile.iconColor} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.fileName, { color: colors.text }]} numberOfLines={1}>{selectedFile.name}</Text>
                                    <Text style={[styles.fileMeta, { color: colors.muted }]}>{selectedFile.date} · {selectedFile.size}</Text>
                                </View>
                            </View>
                        )}

                        <View style={styles.divider} />

                        <Pressable style={styles.optionRow} onPress={downloadEvidence}>
                            <Feather name="download" size={20} color="#23A862" />
                            <Text style={[styles.optionText, { color: colors.text }]}>Baixar / Compartilhar arquivo</Text>
                        </Pressable>

                        <View style={styles.divider} />

                        <Pressable style={styles.optionRow} onPress={openEdit}>
                            <Feather name="edit" size={20} color="#FFFFFF" />
                            <Text style={[styles.optionText, { color: colors.text }]}>Renomear / Editar descrição</Text>
                        </Pressable>

                        <View style={styles.divider} />

                        <Pressable style={styles.optionRow} onPress={openDelete}>
                            <Feather name="trash-2" size={20} color="#C83C59" />
                            <Text style={[styles.optionText, { color: '#C83C59' }]}>Excluir evidência</Text>
                        </Pressable>
                    </Animated.View>
                </View>
            </Modal>

            <Modal visible={isHistoryVisible} transparent animationType="slide" onRequestClose={() => setHistoryVisible(false)}>
                <View style={styles.modalOverlay}>
                    <Pressable style={styles.modalBackdrop} onPress={() => setHistoryVisible(false)} />
                    <View style={[styles.bottomSheet, { backgroundColor: colors.surface }]}>
                        <View style={styles.dragIndicator} />
                        <View style={styles.historyHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Histórico de alterações</Text>
                            <Pressable
                                style={[styles.historyCloseBtn, { backgroundColor: colors.border }]}
                                onPress={() => setHistoryVisible(false)}
                                accessibilityLabel="Fechar histórico"
                            >
                                <MaterialCommunityIcons name="close" size={20} color={colors.text} />
                            </Pressable>
                        </View>
                        <ScrollView
                            style={styles.historyScroll}
                            contentContainerStyle={styles.historyScrollContent}
                            showsVerticalScrollIndicator
                            nestedScrollEnabled
                        >
                            {history.length === 0 ? (
                                <Text style={[styles.historyEmpty, { color: colors.muted }]}>Nenhuma alteração registrada.</Text>
                            ) : history.map((item) => (
                                <View key={item.id} style={[styles.historyRow, { borderBottomColor: colors.border }]}>
                                    <MaterialCommunityIcons name="history" size={20} color="#C83C59" />
                                    <View style={styles.historyInfo}>
                                        <Text style={[styles.historyAction, { color: colors.text }]}>
                                            {item.acao === 'criacao' ? 'Evidência criada' : item.acao === 'edicao' ? 'Evidência editada' : 'Evidência excluída'}
                                        </Text>
                                        <Text style={[styles.historyName, { color: colors.muted }]}>{item.nome_arquivo}</Text>
                                        <Text style={[styles.historyDate, { color: colors.muted }]}>
                                            {new Date(item.data_hora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'medium' })}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Modal: Editar Evidência */}
            <Modal visible={isEditVisible} transparent animationType="none" onRequestClose={closeEdit}>
                <View style={styles.modalOverlay}>
                    <Pressable style={styles.modalBackdrop} onPress={closeEdit} />
                    <Animated.View style={{ transform: [{ translateY: editSheetAnim }], width: '100%' }} onStartShouldSetResponder={() => true}>
                        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoid}>
                            <ScrollView
                                style={styles.formScroll}
                                contentContainerStyle={styles.formScrollContent}
                                keyboardShouldPersistTaps="handled"
                                showsVerticalScrollIndicator={false}
                            >
                            <View style={[styles.bottomSheet, { backgroundColor: colors.surface }]}>
                                <View style={styles.dragIndicator} />
                                <Text style={[styles.modalTitle, { color: colors.text }]}>{selectedFile ? 'Editar evidência' : 'Nova evidência'}</Text>

                                {!selectedFile && (
                                    <>
                                        <Text style={styles.inputLabel}>TIPO DE EVIDÊNCIA</Text>
                                        <View style={styles.typeSelector}>
                                            {Object.entries(UPLOAD_TYPES).map(([type, rule]) => (
                                                <Pressable
                                                    key={type}
                                                    style={[styles.typeOption, { borderColor: colors.border }, uploadType === type && styles.typeOptionActive]}
                                                    onPress={() => { setUploadType(type); setSelectedUploads([]); }}
                                                >
                                                    <Text style={[styles.typeOptionText, { color: colors.text }, uploadType === type && styles.typeOptionTextActive]}>
                                                        {rule.label}
                                                    </Text>
                                                </Pressable>
                                            ))}
                                        </View>
                                        <Text style={[styles.allowedFormats, { color: colors.muted }]}>
                                            {UPLOAD_TYPES[uploadType].extensions.join(', ').toUpperCase()} · máximo {UPLOAD_TYPES[uploadType].limit} por arquivo
                                        </Text>
                                        {uploadType === 'file' ? (
                                            <Text style={[styles.allowedFormats, { color: colors.muted }]}>
                                                Para Texto, digite o conteúdo abaixo e o app criará um arquivo .txt automaticamente.
                                            </Text>
                                        ) : (
                                            <View style={styles.filePickerActions}>
                                                <Pressable
                                                    style={[styles.chooseFileBtn, { borderColor: colors.border }]}
                                                    onPress={pickEvidenceFiles}
                                                >
                                                    <Feather name="paperclip" size={18} color="#23A862" />
                                                    <Text style={[styles.chooseFileText, { color: colors.text }]}>
                                                        {selectedUploads.length ? `${selectedUploads.length} arquivo(s) selecionado(s)` : 'Arquivos'}
                                                    </Text>
                                                </Pressable>
                                                {(uploadType === 'image' || uploadType === 'video') && (
                                                    <Pressable
                                                        style={[styles.chooseFileBtn, styles.galleryFileBtn]}
                                                        onPress={pickMediaFromLibrary}
                                                    >
                                                        <Feather name="image" size={18} color="#23A862" />
                                                        <Text style={[styles.chooseFileText, { color: colors.text }]}>Galeria</Text>
                                                    </Pressable>
                                                )}
                                            </View>
                                        )}
                                    </>
                                )}

                                <Text style={styles.inputLabel}>NOME DO ARQUIVO</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
                                    value={formData.name}
                                    onChangeText={(t) => setFormData({ ...formData, name: t })}
                                    placeholder="Digite o nome da evidência"
                                    placeholderTextColor="#8E8E93"
                                    editable
                                    autoCapitalize="sentences"
                                    returnKeyType="done"
                                />

                                <Text style={styles.inputLabel}>DESCRIÇÃO</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
                                    value={formData.description}
                                    onChangeText={(t) => setFormData({ ...formData, description: t })}
                                    placeholderTextColor="#8E8E93"
                                    multiline
                                    textAlignVertical="top"
                                />

                                {(!selectedFile && uploadType === 'file') && (
                                    <>
                                        <Text style={styles.inputLabel}>CONTEÚDO DO ARQUIVO TXT</Text>
                                        <TextInput
                                            style={[styles.input, styles.textArea, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
                                            value={formData.content}
                                            onChangeText={(content) => setFormData({ ...formData, content })}
                                            placeholder="Digite o conteúdo que será salvo no arquivo .txt"
                                            placeholderTextColor="#8E8E93"
                                            multiline
                                            textAlignVertical="top"
                                        />
                                    </>
                                )}

                                <View style={styles.modalActions}>
                                    <Pressable style={[styles.cancelBtn, { backgroundColor: colors.border }]} onPress={closeEdit}>
                                        <Text style={styles.cancelBtnText}>Cancelar</Text>
                                    </Pressable>
                                    <Pressable style={[styles.primaryBtn, isSaving && styles.disabledBtn]} onPress={saveEvidence} disabled={isSaving}>
                                        <Text style={styles.primaryBtnText}>{isSaving ? 'Salvando...' : selectedFile ? 'Salvar' : 'Criar'}</Text>
                                    </Pressable>
                                </View>
                            </View>
                            </ScrollView>
                        </KeyboardAvoidingView>
                    </Animated.View>
                </View>
            </Modal>

            {/* Modal: Excluir Evidência */}
            <Modal visible={isDeleteVisible} transparent animationType="fade">
                <View style={styles.modalOverlayCenter}>
                    <View style={[styles.dialogBox, { backgroundColor: colors.surface }]}>
                        <View style={styles.dialogIconContainer}>
                            <Feather name="trash-2" size={32} color="#C83C59" />
                        </View>
                        <Text style={[styles.dialogTitle, { color: colors.text }]}>Excluir evidência?</Text>
                        <Text style={styles.dialogText}>
                            "<Text style={{ fontWeight: '700', color: colors.text }}>{selectedFile?.name}</Text>" será removida permanentemente.
                        </Text>

                        <View style={styles.modalActions}>
                            <Pressable style={[styles.cancelBtn, { backgroundColor: colors.border }]} onPress={() => setDeleteVisible(false)}>
                                <Text style={styles.cancelBtnText}>Cancelar</Text>
                            </Pressable>
                            <Pressable style={[styles.primaryBtn, isDeleting && styles.disabledBtn]} onPress={deleteEvidence} disabled={isDeleting}>
                                <Text style={styles.primaryBtnText}>{isDeleting ? 'Excluindo...' : 'Excluir'}</Text>
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
        fontSize: 26,
        fontWeight: '700',
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
    pinErrorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 18,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(248, 113, 113, 0.35)',
        backgroundColor: 'rgba(127, 29, 29, 0.18)',
    },
    pinErrorText: {
        color: '#FCA5A5',
        fontSize: 13,
        fontWeight: '600',
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
        flexWrap: 'wrap',
        gap: 10,
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
    historyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 10,
    },
    filePickerActions: {
        flexDirection: 'row',
        gap: 16,
    },
    historyBtnText: {
        fontSize: 12,
        fontWeight: '600',
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
    emptyFilesState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    emptyFilesText: {
        fontSize: 13,
        marginTop: 10,
        textAlign: 'center',
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
    disabledBtn: {
        opacity: 0.65,
    },
    historyEmpty: {
        textAlign: 'center',
        paddingVertical: 20,
    },
    historyRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 12,
        borderBottomWidth: 1,
        gap: 10,
    },
    historyInfo: {
        flex: 1,
    },
    historyAction: {
        fontSize: 14,
        fontWeight: '700',
    },
    historyName: {
        fontSize: 12,
        marginTop: 3,
    },
    historyDate: {
        fontSize: 12,
        marginTop: 4,
    },
    historyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    historyCloseBtn: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    historyScroll: {
        maxHeight: 360,
    },
    historyScrollContent: {
        paddingBottom: 8,
    },

    // --- MODAL STYLES ---
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
        alignSelf: 'stretch',
    },
    formScroll: {
        width: '100%',
        alignSelf: 'stretch',
    },
    formScrollContent: {
        flexGrow: 1,
        justifyContent: 'flex-end',
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
        alignSelf: 'center',
        flexShrink: 0,
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
    typeSelector: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 6,
    },
    typeOption: {
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 9,
    },
    typeOptionActive: {
        backgroundColor: '#C83C59',
        borderColor: '#C83C59',
    },
    typeOptionText: {
        fontSize: 12,
        fontWeight: '600',
    },
    typeOptionTextActive: {
        color: '#FFFFFF',
    },
    allowedFormats: {
        fontSize: 11,
        marginBottom: 12,
    },
    chooseFileBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: 12,
        paddingVertical: 12,
        marginBottom: 16,
    },
    galleryFileBtn: {
        borderColor: '#23A862',
        borderWidth: 2,
    },
    chooseFileText: {
        fontSize: 14,
        fontWeight: '600',
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
        alignSelf: 'stretch',
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