import React, { useEffect, useRef, useState } from 'react';
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
    Modal,
    Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';

import MobileFrame from '../../components/MobileFrame/MobileFrame';
import BottomNav from '../../components/BottomNav/BottomNav';
import { useTheme } from '../../context/ThemeContext';
import { useUserProfile } from '../../context/UserProfileContext';
import { MARITAL_STATUS_OPTIONS } from '../../constants/profileOptions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';
import { phoneMask } from '../../utils/masks';
import { cepMask } from '../../utils/masks';
import FeedbackBanner from '../../components/FeedbackBanner/FeedbackBanner';
import * as Location from 'expo-location';
import { setAppIcon } from 'expo-dynamic-app-icon';
import {
    disableSosWidget,
    enableSosWidget,
    SOS_WIDGET_ENABLED_KEY,
} from '../../services/sosWidget';

const passwordRules = [
    { label: 'Mínimo 8 caracteres', test: (password) => password.length >= 8 },
    { label: '1 letra maiúscula', test: (password) => /[A-Z]/.test(password) },
    { label: '1 letra minúscula', test: (password) => /[a-z]/.test(password) },
    { label: '1 número', test: (password) => /\d/.test(password) },
    { label: '1 caractere especial (!@#$%&*_.-)', test: (password) => /[!@#$%&*_.-]/.test(password) },
];

export default function PerfilScreen() {
    const navigation = useNavigation();
    const { isLight, colors, toggleTheme } = useTheme();
    const { profile, refreshProfile } = useUserProfile();

    useEffect(() => {
        if (Platform.OS === 'web' && typeof document !== 'undefined') {
            const styleId = 'custom-scrollbar-style';
            if (!document.getElementById(styleId)) {
                const style = document.createElement('style');
                style.id = styleId;
                style.innerHTML = `
                    ::-webkit-scrollbar {
                        width: 6px;
                    }
                    ::-webkit-scrollbar-track {
                        background: #0B0B0C;
                    }
                    ::-webkit-scrollbar-thumb {
                        background: #2A2A2E;
                        border-radius: 3px;
                    }
                    ::-webkit-scrollbar-thumb:hover {
                        background: #3A3A3F;
                    }
                `;
                document.head.appendChild(style);
            }
        }
    }, []);

    const handleWidgetToggle = async (enabled) => {
        if (isUpdatingWidget) return;

        if (!enabled) {
            disableSosWidget();
            await AsyncStorage.setItem(SOS_WIDGET_ENABLED_KEY, 'false');
            setIsWidgetEnabled(false);
            setFeedback({ type: 'success', message: 'Widget SOS desativado.' });
            return;
        }

        try {
            setIsUpdatingWidget(true);
            const permission = await Location.requestBackgroundPermissionsAsync();
            if (permission.status !== 'granted') {
                setFeedback({
                    type: 'error',
                    message: 'Permita a localização em segundo plano para ativar o widget SOS.',
                });
                return;
            }

            const result = await enableSosWidget();
            if (!result.enabled) {
                setFeedback({
                    type: 'error',
                    message: 'Permita a exibição sobre outros aplicativos para ativar o widget SOS.',
                });
                return;
            }

            await AsyncStorage.setItem(SOS_WIDGET_ENABLED_KEY, 'true');
            setIsWidgetEnabled(true);
            setFeedback({ type: 'success', message: 'Widget SOS ativado.' });
        } catch (error) {
            console.error('Erro ao ativar widget SOS:', error);
            setFeedback({ type: 'error', message: 'Não foi possível ativar o widget SOS.' });
        } finally {
            setIsUpdatingWidget(false);
        }
    };

    const handleDisguiseChange = async (optionId) => {
        const iconName = {
            'shield-check': 'guardia',
            calculator: 'calculator',
            'book-open-page-variant': 'guide',
            'folder-heart': 'files',
        }[optionId];

        setSelectedDisguise(optionId);
        try {
            if (Platform.OS !== 'web') {
                await setAppIcon(iconName);
            }
        } catch (error) {
            console.error('Erro ao alterar ícone do aplicativo:', error);
            setFeedback({
                type: 'error',
                message: 'Não foi possível alterar o ícone neste dispositivo.',
            });
        }
    };

    const inputThemeStyle = {
        backgroundColor: colors.input,
        borderColor: colors.border,
        color: colors.text,
    };
    const [screen, setScreen] = useState('main'); // 'main' | 'editProfile' | 'settings'
    const [securitySection, setSecuritySection] = useState(null); // null | 'password' | 'pin'
    const [passwordStep, setPasswordStep] = useState('form'); // 'form' | 'forgot' | 'verify' | 'new'
    const [pinStep, setPinStep] = useState('form'); // 'form' | 'forgot' | 'verify' | 'new'

    // Profile form states
    const [name, setName] = useState(profile.name);
    const [email, setEmail] = useState(profile.email);
    const [phone, setPhone] = useState(profile.phone);
    const [address, setAddress] = useState(profile.street);
    const [postalCode, setPostalCode] = useState(profile.postalCode);
    const [addressNumber, setAddressNumber] = useState(profile.addressNumber);
    const [addressComplement, setAddressComplement] = useState(profile.addressComplement);
    const [neighborhood, setNeighborhood] = useState(profile.neighborhood);
    const [city, setCity] = useState(profile.city);
    const [state, setState] = useState(profile.state);
    const [isAddressEditorVisible, setAddressEditorVisible] = useState(false);
    const [maritalStatus, setMaritalStatus] = useState(profile.maritalStatus);
    const [isMaritalPickerVisible, setMaritalPickerVisible] = useState(false);
    const [cpf, setCpf] = useState(profile.cpf);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [profileSaveMessage, setProfileSaveMessage] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [isSavingPhoto, setIsSavingPhoto] = useState(false);
    const profileSaveTimer = useRef(null);

    // Settings states
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [recoveryEmail, setRecoveryEmail] = useState(profile.email);
    const [verificationCode, setVerificationCode] = useState('');

    // Personalização do disfarce do aplicativo e do widget SOS
    const [selectedDisguise, setSelectedDisguise] = useState('shield-check');
    const [widgetName, setWidgetName] = useState('Família');
    const [widgetPhoto, setWidgetPhoto] = useState(null);
    const [isWidgetEnabled, setIsWidgetEnabled] = useState(false);
    const [isUpdatingWidget, setIsUpdatingWidget] = useState(false);
    const [isSavingCustomization, setIsSavingCustomization] = useState(false);

    // PIN states
    const [currentPin, setCurrentPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [showCurrentPin, setShowCurrentPin] = useState(false);
    const [showNewPin, setShowNewPin] = useState(false);
    const [showConfirmPin, setShowConfirmPin] = useState(false);
    const [showRecoveredPin, setShowRecoveredPin] = useState(false);
    const [showRecoveredConfirmPin, setShowRecoveredConfirmPin] = useState(false);
    const [showRecoveredPassword, setShowRecoveredPassword] = useState(false);
    const [showRecoveredConfirmPassword, setShowRecoveredConfirmPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);

    useEffect(() => {
        setName(profile.name);
        setEmail(profile.email);
        setPhone(profile.phone);
        setAddress(profile.street);
        setPostalCode(profile.postalCode);
        setAddressNumber(profile.addressNumber);
        setAddressComplement(profile.addressComplement);
        setNeighborhood(profile.neighborhood);
        setCity(profile.city);
        setState(profile.state);
        setMaritalStatus(profile.maritalStatus);
        setCpf(profile.cpf);
        setRecoveryEmail(profile.email);
    }, [profile]);

    useEffect(() => {
        let isMounted = true;

        const loadCustomization = async () => {
            try {
                const [saved, savedWidgetState] = await Promise.all([
                    AsyncStorage.getItem('@guardia/settings_customization'),
                    AsyncStorage.getItem(SOS_WIDGET_ENABLED_KEY),
                ]);
                if (!isMounted) return;

                if (saved) {
                    const customization = JSON.parse(saved);
                    if (customization.disguise) setSelectedDisguise(customization.disguise);
                    if (customization.widgetName) setWidgetName(customization.widgetName);
                    if (customization.widgetPhoto) setWidgetPhoto(customization.widgetPhoto);
                }
                setIsWidgetEnabled(savedWidgetState === 'true');
            } catch (error) {
                console.error('Erro ao carregar personalização:', error);
            }
        };

        loadCustomization();
        return () => {
            isMounted = false;
        };
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            refreshProfile();
        }, [refreshProfile])
    );

    const handlePickWidgetPhoto = async () => {
        try {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
                setFeedback({
                    type: 'error',
                    message: 'Permita o acesso às fotos para escolher a imagem do widget SOS.',
                });
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.85,
            });

            if (result.canceled || !result.assets?.[0]?.uri) return;
            setWidgetPhoto(result.assets[0].uri);
        } catch (error) {
            console.error('Erro ao escolher foto do widget:', error);
            setFeedback({ type: 'error', message: 'Não foi possível selecionar essa foto.' });
        }
    };

    const handleSaveCustomization = async () => {
        try {
            setIsSavingCustomization(true);
            await AsyncStorage.setItem(
                '@guardia/settings_customization',
                JSON.stringify({
                    disguise: selectedDisguise,
                    widgetName,
                    widgetPhoto,
                    widgetEnabled: isWidgetEnabled,
                }),
            );
            setFeedback({
                type: 'success',
                message: 'Personalização salva neste dispositivo.',
            });
        } catch (error) {
            console.error('Erro ao salvar personalização:', error);
            setFeedback({
                type: 'error',
                message: 'Não foi possível salvar a personalização.',
            });
        } finally {
            setIsSavingCustomization(false);
        }
    };

const solicitarCodigoSenha = async () => {
    try {
        const response = await api.post('/auth/password-recovery/request', {
            email: recoveryEmail.trim().toLowerCase(),
        });

        setVerificationCode('');
        setPasswordStep('verify');
        setFeedback({
            type: 'success',
            message: response.data.message || 'Solicitação processada. Confira seu e-mail.',
        });
    } catch (error) {
        setFeedback({
            type: 'error',
            message: error.response?.data?.message || 'Não foi possível solicitar o código.',
        });
    }
};

const verificarCodigoSenha = async () => {
    try {
        const response = await api.post('/auth/password-recovery/verify', {
            email: recoveryEmail.trim().toLowerCase(),
            code: verificationCode.trim(),
        });

        setPasswordStep('new');
        setFeedback({
            type: 'success',
            message: response.data.message || 'Código validado.',
        });
    } catch (error) {
        setFeedback({
            type: 'error',
            message: error.response?.data?.message || 'Não foi possível validar o código.',
        });
    }
};


const redefinirSenhaRecuperada = async () => {
    if (!newPassword || !confirmPassword) {
        setFeedback({
            type: 'error',
            message: 'Preencha os campos da nova senha.',
        });
        return;
    }

    if (newPassword !== confirmPassword) {
        setFeedback({
            type: 'error',
            message: 'A nova senha e a confirmação não coincidem.',
        });
        return;
    }

    const senhaForte = passwordRules.every((rule) => rule.test(newPassword));
    if (!senhaForte) {
        setFeedback({
            type: 'error',
            message: 'A senha deve atender a todos os requisitos.',
        });
        return;
    }

    try {
        const response = await api.post('/auth/password-recovery/reset', {
            email: recoveryEmail.trim().toLowerCase(),
            code: verificationCode.trim(),
            newPassword,
            confirmPassword,
        });

        setFeedback({
            type: 'success',
            message: response.data.message || 'Senha redefinida com sucesso.',
        });

        resetPasswordFlow();
    } catch (error) {
        setFeedback({
            type: 'error',
            message:
                error.response?.data?.message ||
                'Não foi possível redefinir a senha.',
        });
    }
};


const salvarSenhaAtual = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
        setFeedback({
            type: 'error',
            message: 'Preencha todos os campos de senha.',
        });
        return;
    }

    if (newPassword !== confirmPassword) {
        setFeedback({
            type: 'error',
            message: 'A nova senha e a confirmação não coincidem.',
        });
        return;
    }

    try {
        const storedUser = await AsyncStorage.getItem('@guardia/auth_user');
        const usuario = storedUser ? JSON.parse(storedUser) : null;

        if (!usuario?.id) {
            setFeedback({
                type: 'error',
                message: 'Sessão expirada. Faça login novamente.',
            });
            return;
        }

        const response = await api.put('/auth/password', {
            usuarioId: usuario.id,
            currentPassword,
            newPassword,
            confirmPassword,
        });

        setFeedback({
            type: 'success',
            message: response.data.message || 'Senha alterada com sucesso.',
        });

        resetPasswordFlow();
    } catch (error) {
        console.error(
            'Erro ao alterar senha:',
            error.response?.data || error.message
        );

        setFeedback({
            type: 'error',
            message:
                error.response?.data?.message ||
                error.response?.data?.erro ||
                'Não foi possível alterar a senha.',
        });
    }
};


const salvarPinAtual = async () => {
    if (!currentPin || !newPin || !confirmPin) {
        setFeedback({
            type: 'error',
            message: 'Preencha todos os campos de PIN.',
        });
        return;
    }

    if (!/^\d{4}$/.test(currentPin) || !/^\d{4}$/.test(newPin)) {
        setFeedback({
            type: 'error',
            message: 'O PIN deve conter exatamente 4 dígitos.',
        });
        return;
    }

    if (newPin !== confirmPin) {
        setFeedback({
            type: 'error',
            message: 'O novo PIN e a confirmação não coincidem.',
        });
        return;
    }

    try {
        const storedUser = await AsyncStorage.getItem('@guardia/auth_user');
        const usuario = storedUser ? JSON.parse(storedUser) : null;

        if (!usuario?.id) {
            setFeedback({
                type: 'error',
                message: 'Sessão expirada. Faça login novamente.',
            });
            return;
        }

        const response = await api.put('/auth/pin', {
            usuarioId: usuario.id,
            currentPin,
            newPin,
            confirmPin,
        });

        setFeedback({
            type: 'success',
            message: response.data.message || 'PIN alterado com sucesso.',
        });

        resetPinFlow();
    } catch (error) {
        console.error(
            'Erro ao alterar PIN:',
            error.response?.data || error.message
        );

        setFeedback({
            type: 'error',
            message:
                error.response?.data?.message ||
                'Não foi possível alterar o PIN.',
        });
    }
};

const solicitarCodigoPin = async () => {
    try {
        const response = await api.post('/auth/pin-recovery/request', {
            email: recoveryEmail.trim().toLowerCase(),
        });

        setVerificationCode('');
        setPinStep('verify');
        setFeedback({
            type: 'success',
            message: response.data.message || 'Solicitação processada. Confira seu e-mail.',
        });
    } catch (error) {
        setFeedback({
            type: 'error',
            message: error.response?.data?.message || 'Não foi possível solicitar o código.',
        });
    }
};

const verificarCodigoPin = async () => {
    try {
        const response = await api.post('/auth/pin-recovery/verify', {
            email: recoveryEmail.trim().toLowerCase(),
            code: verificationCode.trim(),
        });

        setPinStep('new');
        setFeedback({
            type: 'success',
            message: response.data.message || 'Código validado.',
        });
    } catch (error) {
        setFeedback({
            type: 'error',
            message: error.response?.data?.message || 'Não foi possível validar o código.',
        });
    }
};

const redefinirPinRecuperado = async () => {
    try {
        const response = await api.post('/auth/pin-recovery/reset', {
            email: recoveryEmail.trim().toLowerCase(),
            code: verificationCode.trim(),
            newPin,
            confirmPin,
        });

        setFeedback({
            type: 'success',
            message: response.data.message || 'PIN redefinido com sucesso.',
        });
        resetPinFlow();
    } catch (error) {
        setFeedback({
            type: 'error',
            message: error.response?.data?.message || 'Não foi possível redefinir o PIN.',
        });
    }
};

    const resetPasswordFlow = () => {
        setSecuritySection(null);
        setPasswordStep('form');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setVerificationCode('');
    };

    const resetPinFlow = () => {
        setSecuritySection(null);
        setPinStep('form');
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
        setVerificationCode('');
    };

    const handleCancelProfileEdit = () => {
        setName(profile.name);
        setEmail(profile.email);
        setPhone(profile.phone);
        setAddress(profile.street);
        setPostalCode(profile.postalCode);
        setAddressNumber(profile.addressNumber);
        setAddressComplement(profile.addressComplement);
        setNeighborhood(profile.neighborhood);
        setCity(profile.city);
        setState(profile.state);
        setMaritalStatus(profile.maritalStatus);
        setCpf(profile.cpf);
        setScreen('main');
    };

    const handleSaveProfile = async () => {
        try {
            const storedUser = await AsyncStorage.getItem('@guardia/auth_user');
            const user = storedUser ? JSON.parse(storedUser) : null;

            if (!user?.id) {
                setFeedback({ type: 'error', message: 'Sessão expirada. Faça login novamente.' });
                return;
            }

            if (!postalCode.trim() || !address.trim() || !addressNumber.trim() || !neighborhood.trim() || !city.trim() || !state.trim()) {
                setFeedback({ type: 'error', message: 'Preencha CEP, logradouro, número, bairro, cidade e UF.' });
                return;
            }

            setIsSavingProfile(true);
            const response = await api.put(`/auth/profile/${user.id}`, {
                nome: name,
                email,
                telefone: phone,
                estado_civil: maritalStatus,
                logradouro: address,
                cep: postalCode,
                numero: addressNumber,
                complemento: addressComplement,
                bairro: neighborhood,
                cidade: city,
                estado_uf: state,
            });

            if (!response.data?.success) {
                throw new Error(response.data?.message || 'Não foi possível salvar o endereço.');
            }

            await AsyncStorage.setItem(
                '@guardia/auth_user',
                JSON.stringify({ ...user, nome: name.trim(), email: email.trim().toLowerCase() })
            );
            await refreshProfile();
            setProfileSaveMessage('Informações atualizadas com sucesso.');
            clearTimeout(profileSaveTimer.current);
            profileSaveTimer.current = setTimeout(() => {
                setProfileSaveMessage('');
            }, 3500);
            setScreen('main');
        } catch (error) {
            console.error('Erro ao salvar perfil:', error);
            setFeedback({ type: 'error', message: error.response?.data?.message || 'Não foi possível salvar as alterações.' });
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handlePickProfilePhoto = async () => {
        try {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
                setFeedback({ type: 'error', message: 'Permita o acesso às fotos para escolher sua foto de perfil.' });
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.85,
            });
            if (result.canceled || !result.assets?.[0]?.uri) return;

            const selectedPhoto = result.assets[0];

            const storedUser = await AsyncStorage.getItem('@guardia/auth_user');
            const user = storedUser ? JSON.parse(storedUser) : null;
            if (!user?.id) {
                setFeedback({ type: 'error', message: 'Sessão expirada. Faça login novamente.' });
                return;
            }

            setIsSavingPhoto(true);
            const formData = new FormData();
            if (Platform.OS === 'web' && selectedPhoto.file) {
                formData.append('photo', selectedPhoto.file);
            } else {
                formData.append('photo', {
                    uri: selectedPhoto.uri,
                    name: `profile-${user.id}.jpg`,
                    type: selectedPhoto.mimeType || 'image/jpeg',
                });
            }
            const response = await api.post(`/auth/profile/${user.id}/photo`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            await refreshProfile();
            setFeedback({ type: 'success', message: response.data.message || 'Foto de perfil atualizada.' });
        } catch (error) {
            console.error('Erro ao atualizar foto de perfil:', error);
            const message = error.response?.data?.message
                || (error.code === 'ERR_NETWORK'
                    ? 'Não foi possível conectar ao servidor. Verifique se o backend está ligado.'
                    : error.message || 'Não foi possível atualizar a foto de perfil.');
            setFeedback({ type: 'error', message });
        } finally {
            setIsSavingPhoto(false);
        }
    };

    const handleDeleteProfilePhoto = async () => {
        try {
            const storedUser = await AsyncStorage.getItem('@guardia/auth_user');
            const user = storedUser ? JSON.parse(storedUser) : null;
            if (!user?.id) {
                setFeedback({ type: 'error', message: 'Sessão expirada. Faça login novamente.' });
                return;
            }

            setIsSavingPhoto(true);
            const response = await api.delete(`/auth/profile/${user.id}/photo`);
            await refreshProfile();
            setFeedback({ type: 'success', message: response.data.message || 'Foto de perfil removida.' });
        } catch (error) {
            console.error('Erro ao remover foto de perfil:', error);
            const message = error.response?.data?.message
                || (error.code === 'ERR_NETWORK'
                    ? 'Não foi possível conectar ao servidor. Verifique se o backend está ligado.'
                    : error.message || 'Não foi possível remover a foto de perfil.');
            setFeedback({ type: 'error', message });
        } finally {
            setIsSavingPhoto(false);
        }
    };

    const getInitials = (value) => value
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('');

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('@guardia/auth_user');
            setProfileSaveMessage('Você saiu da conta com sucesso.');
            clearTimeout(profileSaveTimer.current);
            profileSaveTimer.current = setTimeout(() => {
                navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            }, 900);
        } catch (error) {
            console.error('Erro ao sair da conta:', error);
            setProfileSaveMessage('Não foi possível sair da conta. Tente novamente.');
        }
    };

    useEffect(() => () => clearTimeout(profileSaveTimer.current), []);

    return (
        <MobileFrame backgroundColor="#0C0D10">
            <FeedbackBanner feedback={feedback} onClose={() => setFeedback(null)} />
            <View style={[styles.screen, { backgroundColor: colors.background }]}>
                {screen === 'main' && (
                    <ScrollView style={[styles.scrollContainer, Platform.OS === 'web' && styles.webScrollContainer]} contentContainerStyle={styles.mainContent} showsVerticalScrollIndicator keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
                        <View style={styles.avatarSection}>
                            <View style={styles.largeAvatar}>
                                {profile.photoUrl ? (
                                    <Image source={{ uri: profile.photoUrl }} style={styles.largeProfileAvatarImage} />
                                ) : (
                                    <Text style={styles.largeAvatarText}>{getInitials(profile.name)}</Text>
                                )}
                            </View>

                            <View style={[styles.settingsRow, styles.widgetToggleRow]}>
                                <View style={[styles.settingIconBox, { backgroundColor: colors.surfaceStrong }]}>
                                    <MaterialCommunityIcons name="alarm-light-outline" size={20} color="#C83C59" />
                                </View>
                                <View style={styles.settingTextWrap}>
                                    <Text style={[styles.settingTitle, { color: colors.text }]}>Ativar widget SOS</Text>
                                    <Text style={[styles.settingSubtitle, { color: colors.muted }]}>
                                        Exibir o botão flutuante sobre outros aplicativos
                                    </Text>
                                </View>
                                <Switch
                                    value={isWidgetEnabled}
                                    onValueChange={handleWidgetToggle}
                                    disabled={isUpdatingWidget}
                                    trackColor={{ false: '#374151', true: '#C83C59' }}
                                    thumbColor="#FFFFFF"
                                />
                            </View>
                            <Text style={[styles.userName, { color: colors.text }]}>{profile.name}</Text>
                            <Text style={[styles.userEmail, { color: colors.muted }]}>{profile.email}</Text>
                            <Text style={[styles.userPhone, { color: colors.muted }]}>{phoneMask(profile.phone)}</Text>
                        </View>

                        <View style={[styles.menuCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <Pressable
                                style={styles.menuItem}
                                onPress={() => setScreen('editProfile')}
                            >
                                <View style={[styles.menuIconBox, { backgroundColor: colors.surfaceStrong }]}>
                                    <MaterialCommunityIcons name="square-edit-outline" size={20} color="#60A5FA" />
                                </View>
                                <View style={styles.menuTextWrap}>
                                    <Text style={[styles.menuTitle, { color: colors.text }]}>Editar perfil</Text>
                                    <Text style={[styles.menuSubtitle, { color: colors.muted }]}>Nome, e-mail, endereço e mais</Text>
                                </View>
                                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.muted} />
                            </Pressable>

                            <View style={styles.divider} />

                            <Pressable
                                style={styles.menuItem}
                                onPress={() => {
                                    setScreen('settings');
                                    setSecuritySection(null);
                                    setPasswordStep('form');
                                    setPinStep('form');
                                }}
                            >
                                <View style={[styles.menuIconBox, { backgroundColor: colors.surfaceStrong }]}>
                                    <MaterialCommunityIcons name="cog-outline" size={20} color={colors.muted} />
                                </View>
                                <View style={styles.menuTextWrap}>
                                    <Text style={[styles.menuTitle, { color: colors.text }]}>Configurações</Text>
                                    <Text style={[styles.menuSubtitle, { color: colors.muted }]}>Tema, senha e conta</Text>
                                </View>
                                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.muted} />
                            </Pressable>
                        </View>

                        {profileSaveMessage ? (
                            <View style={[
                                styles.profileSaveNotice,
                                profileSaveMessage.startsWith('Não') && styles.profileErrorNotice,
                            ]}>
                                <MaterialCommunityIcons
                                    name={profileSaveMessage.startsWith('Não') ? 'alert-circle-outline' : 'check-circle-outline'}
                                    size={18}
                                    color={profileSaveMessage.startsWith('Não') ? '#F87171' : '#4ADE80'}
                                />
                                <Text style={[
                                    styles.profileSaveNoticeText,
                                    profileSaveMessage.startsWith('Não') && styles.profileErrorNoticeText,
                                ]}>
                                    {profileSaveMessage}
                                </Text>
                            </View>
                        ) : null}
                        <Text style={styles.footerVersion}>Guardiã v1.0 · Com você, sempre</Text>
                    </ScrollView>
                )}

                {screen === 'editProfile' && (
                    <View style={[styles.subScreen, { backgroundColor: colors.background }]}>
                        <View style={styles.headerRow}>
                            <Pressable
                                style={[styles.backBtn, { backgroundColor: colors.surfaceStrong }]}
                                onPress={() => setScreen('main')}
                            >
                                <MaterialCommunityIcons name="chevron-left" size={22} color={colors.text} />
                            </Pressable>
                            <Text style={[styles.headerTitle, { color: colors.text }]}>Editar Perfil</Text>
                            <View style={styles.backSpacer} />
                        </View>

                        <ScrollView style={[styles.scrollContainer, Platform.OS === 'web' && styles.webScrollContainer]} contentContainerStyle={styles.formContent} showsVerticalScrollIndicator keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
                            <Pressable style={styles.avatarCenterWrap} onPress={handlePickProfilePhoto} disabled={isSavingPhoto}>
                                <View style={styles.mediumAvatar}>
                                    {profile.photoUrl ? (
                                        <Image source={{ uri: profile.photoUrl }} style={styles.profileAvatarImage} />
                                    ) : (
                                        <Text style={styles.mediumAvatarText}>{getInitials(name)}</Text>
                                    )}
                                </View>
                                <Text style={styles.avatarHint}>{isSavingPhoto ? 'Salvando foto...' : 'Toque para adicionar ou alterar a foto'}</Text>
                            </Pressable>
                            {profile.photoUrl && (
                                <Pressable onPress={handleDeleteProfilePhoto} disabled={isSavingPhoto}>
                                    <Text style={styles.removePhotoText}>Remover foto</Text>
                                </Pressable>
                            )}

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>NOME COMPLETO</Text>
                                <TextInput
                                    style={[styles.textInput, inputThemeStyle]}
                                    value={name}
                                    onChangeText={setName}
                                    placeholderTextColor={colors.muted}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>E-MAIL</Text>
                                <TextInput
                                    style={[styles.textInput, inputThemeStyle]}
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholderTextColor={colors.muted}
                                    keyboardType="email-address"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>TELEFONE</Text>
                                <TextInput
                                    style={[styles.textInput, inputThemeStyle]}
                                    value={phone}
                                    onChangeText={setPhone}
                                    placeholderTextColor={colors.muted}
                                    keyboardType="phone-pad"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>ENDEREÇO</Text>
                                <Pressable
                                    style={[styles.addressEditorRow, { backgroundColor: colors.input, borderColor: colors.border }]}
                                    onPress={() => setAddressEditorVisible(true)}
                                >
                                    <Text style={[styles.addressEditorText, { color: address ? colors.text : colors.muted }]} numberOfLines={1}>
                                        {address || 'Adicionar endereço'}
                                    </Text>
                                    <MaterialCommunityIcons name="chevron-right" size={21} color={colors.muted} />
                                </Pressable>
                                <Text style={styles.inputSubHint}>Toque na seta para editar todos os campos</Text>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>ESTADO CIVIL</Text>
                                <Pressable
                                    style={[styles.selectInput, { backgroundColor: colors.input, borderColor: colors.border }]}
                                    onPress={() => setMaritalPickerVisible(true)}
                                >
                                    <Text style={[styles.selectText, { color: colors.text }]}>{maritalStatus}</Text>
                                    <MaterialCommunityIcons name="chevron-down" size={18} color={colors.muted} />
                                </Pressable>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>CPF</Text>
                                <TextInput
                                    style={[styles.textInput, styles.disabledInput, inputThemeStyle, { color: colors.muted }]}
                                    value={cpf ? cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '***.$2.***-$4') : ''}
                                    editable={false}
                                />
                                <Text style={styles.inputSubHint}>O CPF não pode ser alterado</Text>
                            </View>

                            <View style={styles.profileEditActions}>
                                <Pressable
                                    style={styles.secondaryButton}
                                    onPress={handleCancelProfileEdit}
                                    disabled={isSavingProfile}
                                >
                                    <Text style={styles.secondaryButtonText}>Cancelar</Text>
                                </Pressable>
                                <Pressable
                                    style={[styles.primaryButton, styles.profileSaveButton]}
                                    onPress={handleSaveProfile}
                                    disabled={isSavingProfile}
                                >
                                    <Text style={styles.primaryButtonText}>
                                        {isSavingProfile ? 'Salvando...' : 'Salvar alterações'}
                                    </Text>
                                </Pressable>
                            </View>
                        </ScrollView>
                    </View>
                )}

                {screen === 'settings' && (
                    <View style={[styles.subScreen, { backgroundColor: colors.background }]}>
                        <View style={styles.headerRow}>
                            <Pressable
                                style={[styles.backBtn, { backgroundColor: colors.surfaceStrong }]}
                                onPress={() => setScreen('main')}
                            >
                                <MaterialCommunityIcons name="chevron-left" size={22} color={colors.text} />
                            </Pressable>
                            <Text style={[styles.headerTitle, { color: colors.text }]}>Configurações</Text>
                            <View style={styles.backSpacer} />
                        </View>

                        <ScrollView style={[styles.scrollContainer, Platform.OS === 'web' && styles.webScrollContainer]} contentContainerStyle={styles.settingsContent} showsVerticalScrollIndicator keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
                            {/* Aparência */}
                            <Text style={styles.sectionHeader}>APARÊNCIA</Text>
                            <View style={[styles.settingsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <View style={styles.settingsRow}>
                                    <View style={[styles.settingIconBox, { backgroundColor: colors.surfaceStrong }]}>
                                        <MaterialCommunityIcons name="white-balance-sunny" size={18} color={colors.muted} />
                                    </View>
                                    <View style={styles.settingTextWrap}>
                                        <Text style={[styles.settingTitle, { color: colors.text }]}>Tema claro</Text>
                                        <Text style={[styles.settingSubtitle, { color: colors.muted }]}>{isLight ? 'Ativado' : 'Desativado'}</Text>
                                    </View>
                                    <Switch
                                        value={isLight}
                                        onValueChange={toggleTheme}
                                        trackColor={{ false: '#374151', true: '#C83C59' }}
                                        thumbColor="#FFFFFF"
                                    />
                                </View>
                            </View>

                            {/* Disfarce do aplicativo */}
                            <Text style={styles.sectionHeader}>DISFARCE DO APLICATIVO</Text>
                            <View style={[styles.settingsCard, styles.disguiseCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <View style={styles.disguiseHeading}>
                                    <View style={[styles.settingIconBox, { backgroundColor: colors.surfaceStrong }]}>
                                        <MaterialCommunityIcons name="shield-outline" size={20} color="#FF3366" />
                                    </View>
                                    <View style={styles.settingTextWrap}>
                                        <Text style={[styles.settingTitle, { color: colors.text }]}>Disfarce do aplicativo</Text>
                                        <Text style={[styles.settingSubtitle, { color: colors.muted }]}>
                                            Escolha um ícone discreto para a tela inicial
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.disguiseOptions}>
                                    {[
                                        { id: 'shield-check', label: 'Guardiã', icon: 'shield-check', color: '#C83C59' },
                                        { id: 'calculator', label: 'Calculadora', icon: 'calculator-variant', color: '#8B8BA7' },
                                        { id: 'book-open-page-variant', label: 'Guia', icon: 'book-open-page-variant', color: '#3979E5' },
                                        { id: 'folder-heart', label: 'Arquivos', icon: 'folder-heart', color: '#3979E5' },
                                    ].map((option) => {
                                        const selected = selectedDisguise === option.id;
                                        return (
                                            <Pressable
                                                key={option.id}
                                                accessibilityRole="button"
                                                accessibilityState={{ selected }}
                                                onPress={() => handleDisguiseChange(option.id)}
                                                style={[
                                                    styles.disguiseOption,
                                                    { backgroundColor: colors.surfaceStrong, borderColor: colors.border },
                                                    selected && styles.disguiseOptionSelected,
                                                ]}
                                            >
                                                <View style={[
                                                    styles.disguiseIconPreview,
                                                    { backgroundColor: option.color },
                                                    selected && option.id !== 'shield-check' && styles.disguiseIconSelected,
                                                ]}>
                                                    <MaterialCommunityIcons name={option.icon} size={25} color="#FFFFFF" />
                                                </View>
                                                <Text
                                                    numberOfLines={1}
                                                    style={[
                                                        styles.disguiseOptionLabel,
                                                        { color: selected ? colors.text : colors.muted },
                                                    ]}
                                                >
                                                    {option.label}
                                                </Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            </View>
                            <Text style={styles.settingsHint}>
                                A escolha fica salva neste dispositivo e altera o ícone real após a instalação de um build nativo.
                            </Text>

                            {/* Widget SOS */}
                            <Text style={styles.sectionHeader}>WIDGET SOS</Text>
                            <View style={[styles.settingsCard, styles.widgetCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <Text style={styles.widgetPreviewLabel}>PRÉVIA</Text>
                                <View style={styles.widgetPreviewRow}>
                                    <View style={styles.widgetPreviewTile}>
                                        {widgetPhoto ? (
                                            <Image source={{ uri: widgetPhoto }} style={styles.widgetPreviewImage} />
                                        ) : (
                                            <MaterialCommunityIcons name="image-outline" size={28} color={colors.muted} />
                                        )}
                                        <View style={styles.widgetNameOverlay}>
                                            <Text style={styles.widgetNameOverlayText} numberOfLines={1}>{widgetName}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.widgetPreviewDescription}>
                                        <Text style={[styles.settingTitle, { color: colors.text }]}>SOS camuflado</Text>
                                        <Text style={[styles.widgetDescriptionText, { color: colors.muted }]}>
                                            O widget fica sobre outros aplicativos e pode iniciar o SOS sem abrir a tela principal.
                                        </Text>
                                        <Pressable
                                            style={[styles.choosePhotoButton, { backgroundColor: colors.surfaceStrong, borderColor: colors.border }]}
                                            onPress={handlePickWidgetPhoto}
                                        >
                                            <MaterialCommunityIcons name="upload-outline" size={16} color={colors.text} />
                                            <Text style={[styles.choosePhotoText, { color: colors.text }]}>Escolher foto</Text>
                                        </Pressable>
                                    </View>
                                </View>

                                <Text style={styles.widgetPreviewLabel}>NOME EXIBIDO</Text>
                                <View style={styles.widgetNamesRow}>
                                    {['Família', 'Fotos', 'Agenda', 'Favoritos'].map((label) => {
                                        const selected = widgetName === label;
                                        return (
                                            <Pressable
                                                key={label}
                                                onPress={() => setWidgetName(label)}
                                                style={[
                                                    styles.widgetNameOption,
                                                    { backgroundColor: colors.surfaceStrong, borderColor: colors.border },
                                                    selected && styles.widgetNameOptionSelected,
                                                ]}
                                            >
                                                <Text
                                                    numberOfLines={1}
                                                    style={[
                                                        styles.widgetNameOptionText,
                                                        { color: selected ? colors.text : colors.muted },
                                                    ]}
                                                >
                                                    {label}
                                                </Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>

                                <Pressable
                                    style={[styles.primaryButton, isSavingCustomization && styles.buttonDisabled]}
                                    onPress={handleSaveCustomization}
                                    disabled={isSavingCustomization}
                                >
                                    <Text style={styles.primaryButtonText}>
                                        {isSavingCustomization ? 'Salvando...' : 'Salvar personalização'}
                                    </Text>
                                </Pressable>
                            </View>
                            <Text style={styles.settingsHint}>
                                O widget flutuante funciona no Android após a autorização de sobreposição. Toque uma vez para expandir e novamente para confirmar o SOS.
                            </Text>

                            {/* Segurança */}
                            <Text style={styles.sectionHeader}>SEGURANÇA</Text>
                            <View style={[styles.settingsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                {/* Redefinir senha */}
                                <Pressable
                                    style={styles.settingsRowAccordion}
                                    onPress={() => {
                                        if (securitySection === 'password') {
                                            resetPasswordFlow();
                                        } else {
                                            setSecuritySection('password');
                                            setPasswordStep('form');
                                            setPinStep('form');
                                        }
                                    }}
                                >
                                    <View style={[styles.settingIconBox, { backgroundColor: colors.surfaceStrong }]}>
                                        <MaterialCommunityIcons name="lock-outline" size={18} color={colors.muted} />
                                    </View>
                                    <View style={styles.settingTextWrap}>
                                        <Text style={[styles.settingTitle, { color: colors.text }]}>Redefinir senha</Text>
                                        <Text style={[styles.settingSubtitle, { color: colors.muted }]}>Altere sua senha de acesso</Text>
                                    </View>
                                    <MaterialCommunityIcons
                                        name={securitySection === 'password' ? 'chevron-down' : 'chevron-right'}
                                        size={18}
                                        color={colors.muted}
                                    />
                                </Pressable>

                                {securitySection === 'password' && (
                                    <View style={styles.accordionBody}>
                                        {passwordStep === 'form' && (
                                            <>
                                                <View style={[styles.pinInputWrap, inputThemeStyle]}>
                                                    <TextInput
                                                        style={[styles.subTextInput, styles.pinTextInput, inputThemeStyle]}
                                                        placeholder="Senha atual"
                                                        placeholderTextColor={colors.muted}
                                                        secureTextEntry={!showCurrentPassword}
                                                        value={currentPassword}
                                                        onChangeText={setCurrentPassword}
                                                    />
                                                    <Pressable
                                                        style={styles.pinEyeButton}
                                                        onPress={() => setShowCurrentPassword((prev) => !prev)}
                                                        accessibilityLabel={showCurrentPassword ? 'Ocultar senha atual' : 'Mostrar senha atual'}
                                                    >
                                                        <MaterialCommunityIcons name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'} size={19} color={colors.muted} />
                                                    </Pressable>
                                                </View>
                                                <View style={[styles.pinInputWrap, inputThemeStyle]}>
                                                    <TextInput
                                                        style={[styles.subTextInput, styles.pinTextInput, inputThemeStyle]}
                                                        placeholder="Nova senha"
                                                        placeholderTextColor={colors.muted}
                                                        secureTextEntry={!showRecoveredPassword}
                                                        value={newPassword}
                                                        onChangeText={setNewPassword}
                                                    />
                                                    <Pressable
                                                        style={styles.pinEyeButton}
                                                        onPress={() => setShowRecoveredPassword((prev) => !prev)}
                                                        accessibilityLabel={showRecoveredPassword ? 'Ocultar nova senha' : 'Mostrar nova senha'}
                                                    >
                                                        <MaterialCommunityIcons name={showRecoveredPassword ? 'eye-off-outline' : 'eye-outline'} size={19} color={colors.muted} />
                                                    </Pressable>
                                                </View>
                                                <View style={[styles.pinInputWrap, inputThemeStyle]}>
                                                    <TextInput
                                                        style={[styles.subTextInput, styles.pinTextInput, inputThemeStyle]}
                                                        placeholder="Confirmar nova senha"
                                                        placeholderTextColor={colors.muted}
                                                        secureTextEntry={!showRecoveredConfirmPassword}
                                                        value={confirmPassword}
                                                        onChangeText={setConfirmPassword}
                                                    />
                                                    <Pressable
                                                        style={styles.pinEyeButton}
                                                        onPress={() => setShowRecoveredConfirmPassword((prev) => !prev)}
                                                        accessibilityLabel={showRecoveredConfirmPassword ? 'Ocultar confirmação da senha' : 'Mostrar confirmação da senha'}
                                                    >
                                                        <MaterialCommunityIcons name={showRecoveredConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={19} color={colors.muted} />
                                                    </Pressable>
                                                </View>
                                                <Pressable
                                                    style={styles.primaryButton}
                                                    onPress={salvarSenhaAtual}
                                                >
                                                    <Text style={styles.primaryButtonText}>Salvar nova senha</Text>
                                                </Pressable>
                                                <Pressable onPress={() => setPasswordStep('forgot')}>
                                                    <Text style={styles.linkTextCentered}>Esqueceu a senha?</Text>
                                                </Pressable>
                                            </>
                                        )}

                                        {passwordStep === 'forgot' && (
                                            <View style={styles.innerFlowBox}>
                                                <Pressable style={styles.innerBackRow} onPress={() => setPasswordStep('form')}>
                                                    <MaterialCommunityIcons name="chevron-left" size={16} color={colors.text} />
                                                    <Text style={styles.innerBackText}>Recuperar senha</Text>
                                                </Pressable>
                                                <Text style={styles.innerDescText}>
                                                    Enviaremos um código de 6 dígitos para o seu e-mail cadastrado.
                                                </Text>
                                                <TextInput
                                                    style={[styles.subTextInput, inputThemeStyle]}
                                                    value={recoveryEmail}
                                                    onChangeText={setRecoveryEmail}
                                                    placeholderTextColor={colors.muted}
                                                    keyboardType="email-address"
                                                />
                                                <Pressable
                                                    style={styles.primaryButton}
                                                    onPress={solicitarCodigoSenha}
                                                >
                                                    <Text style={styles.primaryButtonText}>Enviar código</Text>
                                                </Pressable>
                                            </View>
                                        )}

                                        {passwordStep === 'verify' && (
                                            <View style={styles.innerFlowBox}>
                                                <Pressable style={styles.innerBackRow} onPress={() => setPasswordStep('forgot')}>
                                                    <MaterialCommunityIcons name="chevron-left" size={16} color={colors.text} />
                                                    <Text style={styles.innerBackText}>Verificar código</Text>
                                                </Pressable>
                                                <Text style={styles.innerDescText}>
                                                    Digite o código de 6 dígitos enviado para {recoveryEmail}
                                                </Text>

                                                <TextInput
                                                    style={[styles.subTextInputCenter, inputThemeStyle]}
                                                    value={verificationCode}
                                                    onChangeText={setVerificationCode}
                                                    placeholder="000000"
                                                    placeholderTextColor={colors.muted}
                                                    keyboardType="number-pad"
                                                    maxLength={6}
                                                />

                                                <Pressable
                                                    style={styles.primaryButton}
                                                    onPress={verificarCodigoSenha}
                                                >
                                                    <Text style={styles.primaryButtonText}>Verificar código</Text>
                                                </Pressable>

                                                <Text style={styles.resendPrompt}>
                                                    Não recebeu? <Text style={styles.resendLink}>Reenviar</Text>
                                                </Text>
                                            </View>
                                        )}

                                        {passwordStep === 'new' && (
                                            <View style={styles.innerFlowBox}>
                                                <View style={styles.verifiedRow}>
                                                    <MaterialCommunityIcons name="check-circle" size={16} color="#22C55E" />
                                                    <Text style={styles.verifiedText}>Identidade verificada</Text>
                                                </View>
                                                <Text style={styles.innerDescText}>Crie uma nova senha segura para sua conta.</Text>
                                                <View style={[styles.pinInputWrap, inputThemeStyle]}>
                                                    <TextInput
                                                        style={[styles.subTextInput, styles.pinTextInput, inputThemeStyle]}
                                                        placeholder="Nova senha"
                                                        placeholderTextColor={colors.muted}
                                                        secureTextEntry={!showRecoveredPassword}
                                                        value={newPassword}
                                                        onChangeText={setNewPassword}
                                                    />
                                                    <Pressable
                                                        style={styles.pinEyeButton}
                                                        onPress={() => setShowRecoveredPassword((prev) => !prev)}
                                                        accessibilityLabel={showRecoveredPassword ? 'Ocultar nova senha' : 'Mostrar nova senha'}
                                                    >
                                                        <MaterialCommunityIcons name={showRecoveredPassword ? 'eye-off-outline' : 'eye-outline'} size={19} color={colors.muted} />
                                                    </Pressable>
                                                </View>
                                                <View style={[styles.pinInputWrap, inputThemeStyle]}>
                                                    <TextInput
                                                        style={[styles.subTextInput, styles.pinTextInput, inputThemeStyle]}
                                                        placeholder="Confirmar nova senha"
                                                        placeholderTextColor={colors.muted}
                                                        secureTextEntry={!showRecoveredConfirmPassword}
                                                        value={confirmPassword}
                                                        onChangeText={setConfirmPassword}
                                                    />
                                                    <Pressable
                                                        style={styles.pinEyeButton}
                                                        onPress={() => setShowRecoveredConfirmPassword((prev) => !prev)}
                                                        accessibilityLabel={showRecoveredConfirmPassword ? 'Ocultar confirmação da senha' : 'Mostrar confirmação da senha'}
                                                    >
                                                        <MaterialCommunityIcons name={showRecoveredConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={19} color={colors.muted} />
                                                    </Pressable>
                                                </View>
                                                <View style={styles.passwordRules}>
                                                    {passwordRules.map((rule) => (
                                                        <PasswordRule
                                                            key={rule.label}
                                                            label={rule.label}
                                                            valid={rule.test(newPassword)}
                                                        />
                                                    ))}
                                                </View>
                                                <Pressable
                                                    style={styles.primaryButton}
                                                    onPress={redefinirSenhaRecuperada}
                                                >
                                                    <Text style={styles.primaryButtonText}>Redefinir senha</Text>
                                                </Pressable>
                                            </View>
                                        )}
                                    </View>
                                )}

                                <View style={styles.cardDivider} />

                                {/* Editar PIN de provas */}
                                <Pressable
                                    style={styles.settingsRowAccordion}
                                    onPress={() => {
                                        if (securitySection === 'pin') {
                                            resetPinFlow();
                                        } else {
                                            setSecuritySection('pin');
                                            setPinStep('form');
                                            setPasswordStep('form');
                                        }
                                    }}
                                >
                                    <View style={[styles.settingIconBox, { backgroundColor: colors.surfaceStrong }]}>
                                        <MaterialCommunityIcons name="view-grid-outline" size={18} color={colors.muted} />
                                    </View>
                                    <View style={styles.settingTextWrap}>
                                        <Text style={[styles.settingTitle, { color: colors.text }]}>Editar PIN de provas</Text>
                                        <Text style={[styles.settingSubtitle, { color: colors.muted }]}>Altere o PIN da área de evidências</Text>
                                    </View>
                                    <MaterialCommunityIcons
                                        name={securitySection === 'pin' ? 'chevron-down' : 'chevron-right'}
                                        size={18}
                                        color={colors.muted}
                                    />
                                </Pressable>

                                {securitySection === 'pin' && (
                                    <View style={styles.accordionBody}>
                                        {pinStep === 'form' && (
                                            <>
                                                <View style={[styles.pinInputWrap, inputThemeStyle]}>
                                                    <TextInput
                                                        style={[styles.subTextInput, styles.pinTextInput, inputThemeStyle]}
                                                        placeholder="PIN atual (4 dígitos)"
                                                        placeholderTextColor={colors.muted}
                                                        secureTextEntry={!showCurrentPin}
                                                        keyboardType="number-pad"
                                                        maxLength={4}
                                                        value={currentPin}
                                                        onChangeText={setCurrentPin}
                                                    />
                                                    <Pressable
                                                        style={styles.pinEyeButton}
                                                        onPress={() => setShowCurrentPin((prev) => !prev)}
                                                        accessibilityLabel={showCurrentPin ? 'Ocultar PIN atual' : 'Mostrar PIN atual'}
                                                    >
                                                        <MaterialCommunityIcons name={showCurrentPin ? 'eye-off-outline' : 'eye-outline'} size={19} color={colors.muted} />
                                                    </Pressable>
                                                </View>
                                                <View style={[styles.pinInputWrap, inputThemeStyle]}>
                                                    <TextInput
                                                        style={[styles.subTextInput, styles.pinTextInput, inputThemeStyle]}
                                                        placeholder="Novo PIN"
                                                        placeholderTextColor={colors.muted}
                                                        secureTextEntry={!showNewPin}
                                                        keyboardType="number-pad"
                                                        maxLength={4}
                                                        value={newPin}
                                                        onChangeText={setNewPin}
                                                    />
                                                    <Pressable
                                                        style={styles.pinEyeButton}
                                                        onPress={() => setShowNewPin((prev) => !prev)}
                                                        accessibilityLabel={showNewPin ? 'Ocultar novo PIN' : 'Mostrar novo PIN'}
                                                    >
                                                        <MaterialCommunityIcons name={showNewPin ? 'eye-off-outline' : 'eye-outline'} size={19} color={colors.muted} />
                                                    </Pressable>
                                                </View>
                                                <View style={[styles.pinInputWrap, inputThemeStyle]}>
                                                    <TextInput
                                                        style={[styles.subTextInput, styles.pinTextInput, inputThemeStyle]}
                                                        placeholder="Confirmar novo PIN"
                                                        placeholderTextColor={colors.muted}
                                                        secureTextEntry={!showConfirmPin}
                                                        keyboardType="number-pad"
                                                        maxLength={4}
                                                        value={confirmPin}
                                                        onChangeText={setConfirmPin}
                                                    />
                                                    <Pressable
                                                        style={styles.pinEyeButton}
                                                        onPress={() => setShowConfirmPin((prev) => !prev)}
                                                        accessibilityLabel={showConfirmPin ? 'Ocultar confirmação do PIN' : 'Mostrar confirmação do PIN'}
                                                    >
                                                        <MaterialCommunityIcons name={showConfirmPin ? 'eye-off-outline' : 'eye-outline'} size={19} color={colors.muted} />
                                                    </Pressable>
                                                </View>
                                                <Pressable
                                                    style={styles.primaryButton}
                                                    onPress={salvarPinAtual}
                                                >
                                                    <Text style={styles.primaryButtonText}>Salvar novo PIN</Text>
                                                </Pressable>
                                                <Pressable onPress={() => setPinStep('forgot')}>
                                                    <Text style={styles.linkTextCentered}>Esqueceu o PIN?</Text>
                                                </Pressable>
                                            </>
                                        )}

                                        {pinStep === 'forgot' && (
                                            <View style={styles.innerFlowBox}>
                                                <Pressable style={styles.innerBackRow} onPress={() => setPinStep('form')}>
                                                    <MaterialCommunityIcons name="chevron-left" size={16} color={colors.text} />
                                                    <Text style={styles.innerBackText}>Recuperar PIN</Text>
                                                </Pressable>
                                                <Text style={styles.innerDescText}>
                                                    Enviaremos um código de 6 dígitos para o seu e-mail cadastrado.
                                                </Text>
                                                <TextInput
                                                    style={[styles.subTextInput, inputThemeStyle]}
                                                    value={recoveryEmail}
                                                    onChangeText={setRecoveryEmail}
                                                    placeholderTextColor={colors.muted}
                                                    keyboardType="email-address"
                                                />
                                                <Pressable
                                                    style={styles.primaryButton}
                                                    onPress={solicitarCodigoPin}
                                                >
                                                    <Text style={styles.primaryButtonText}>Enviar código</Text>
                                                </Pressable>
                                            </View>
                                        )}

                                        {pinStep === 'verify' && (
                                            <View style={styles.innerFlowBox}>
                                                <Pressable style={styles.innerBackRow} onPress={() => setPinStep('forgot')}>
                                                    <MaterialCommunityIcons name="chevron-left" size={16} color={colors.text} />
                                                    <Text style={styles.innerBackText}>Verificar código</Text>
                                                </Pressable>
                                                <Text style={styles.innerDescText}>
                                                    Código enviado para {recoveryEmail}
                                                </Text>

                                                <TextInput
                                                    style={[styles.subTextInputCenter, inputThemeStyle]}
                                                    value={verificationCode}
                                                    onChangeText={setVerificationCode}
                                                    placeholder="000000"
                                                    placeholderTextColor={colors.muted}
                                                    keyboardType="number-pad"
                                                    maxLength={6}
                                                />

                                                <Pressable
                                                    style={styles.primaryButton}
                                                    onPress={verificarCodigoPin}
                                                >
                                                    <Text style={styles.primaryButtonText}>Verificar código</Text>
                                                </Pressable>

                                                <Text style={styles.resendPrompt}>
                                                    Não recebeu? <Text style={styles.resendLink}>Reenviar</Text>
                                                </Text>
                                            </View>
                                        )}

                                        {pinStep === 'new' && (
                                            <View style={styles.innerFlowBox}>
                                                <View style={styles.verifiedRow}>
                                                    <MaterialCommunityIcons name="check-circle" size={16} color="#22C55E" />
                                                    <Text style={styles.verifiedText}>Identidade verificada</Text>
                                                </View>
                                                <Text style={styles.innerDescText}>
                                                    Crie um novo PIN de 4 dígitos para proteger suas evidências.
                                                </Text>
                                                <View style={[styles.pinInputWrap, inputThemeStyle]}>
                                                    <TextInput
                                                        style={[styles.subTextInput, styles.pinTextInput, inputThemeStyle]}
                                                        placeholder="Novo PIN"
                                                        placeholderTextColor={colors.muted}
                                                        secureTextEntry={!showRecoveredPin}
                                                        keyboardType="number-pad"
                                                        maxLength={4}
                                                        value={newPin}
                                                        onChangeText={setNewPin}
                                                    />
                                                    <Pressable
                                                        style={styles.pinEyeButton}
                                                        onPress={() => setShowRecoveredPin((prev) => !prev)}
                                                        accessibilityLabel={showRecoveredPin ? 'Ocultar novo PIN' : 'Mostrar novo PIN'}
                                                    >
                                                        <MaterialCommunityIcons name={showRecoveredPin ? 'eye-off-outline' : 'eye-outline'} size={19} color={colors.muted} />
                                                    </Pressable>
                                                </View>
                                                <View style={[styles.pinInputWrap, inputThemeStyle]}>
                                                    <TextInput
                                                        style={[styles.subTextInput, styles.pinTextInput, inputThemeStyle]}
                                                        placeholder="Confirmar novo PIN"
                                                        placeholderTextColor={colors.muted}
                                                        secureTextEntry={!showRecoveredConfirmPin}
                                                        keyboardType="number-pad"
                                                        maxLength={4}
                                                        value={confirmPin}
                                                        onChangeText={setConfirmPin}
                                                    />
                                                    <Pressable
                                                        style={styles.pinEyeButton}
                                                        onPress={() => setShowRecoveredConfirmPin((prev) => !prev)}
                                                        accessibilityLabel={showRecoveredConfirmPin ? 'Ocultar confirmação do PIN' : 'Mostrar confirmação do PIN'}
                                                    >
                                                        <MaterialCommunityIcons name={showRecoveredConfirmPin ? 'eye-off-outline' : 'eye-outline'} size={19} color={colors.muted} />
                                                    </Pressable>
                                                </View>
                                                <Pressable
                                                    style={styles.primaryButton}
                                                    onPress={redefinirPinRecuperado}
                                                >
                                                    <Text style={styles.primaryButtonText}>Redefinir PIN</Text>
                                                </Pressable>
                                            </View>
                                        )}
                                    </View>
                                )}
                            </View>

                            {/* Conta */}
                            <Text style={styles.sectionHeader}>CONTA</Text>
                            <View style={[styles.settingsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <Pressable
                                    style={styles.settingsRow}
                                    onPress={handleLogout}
                                >
                                    <View
                                        style={[
                                            styles.settingIconBoxRed,
                                            { backgroundColor: isLight ? '#FCE7EC' : '#2A121A' },
                                        ]}
                                    >
                                        <MaterialCommunityIcons
                                            name="logout"
                                            size={18}
                                            color={isLight ? '#ff0835' : '#FF3366'}
                                        />
                                    </View>
                                    <View style={styles.settingTextWrap}>
                                        <Text style={styles.settingTitleRed}>Sair da conta</Text>
                                    </View>
                                </Pressable>
                            </View>

                            {profileSaveMessage ? (
                                <View style={[
                                    styles.profileSaveNotice,
                                    profileSaveMessage.startsWith('Não') && styles.profileErrorNotice,
                                ]}>
                                    <MaterialCommunityIcons
                                        name={profileSaveMessage.startsWith('Não') ? 'alert-circle-outline' : 'check-circle-outline'}
                                        size={18}
                                        color={profileSaveMessage.startsWith('Não') ? '#F87171' : '#4ADE80'}
                                    />
                                    <Text style={[
                                        styles.profileSaveNoticeText,
                                        profileSaveMessage.startsWith('Não') && styles.profileErrorNoticeText,
                                    ]}>
                                        {profileSaveMessage}
                                    </Text>
                                </View>
                            ) : null}

                            <Text style={styles.footerVersionSettings}>Guardiã v1.0 · Com você, sempre</Text>
                        </ScrollView>
                    </View>
                )}

                <BottomNav active="Perfil" />
            </View>

            <Modal
                visible={isMaritalPickerVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setMaritalPickerVisible(false)}
            >
                <View style={styles.maritalModalOverlay}>
                    <View style={[styles.maritalModal, { backgroundColor: colors.surface }]}>
                        <View style={styles.maritalModalHeader}>
                            <Text style={[styles.maritalModalTitle, { color: colors.text }]}>Estado civil</Text>
                            <Pressable onPress={() => setMaritalPickerVisible(false)}>
                                <MaterialCommunityIcons name="close" size={22} color={colors.muted} />
                            </Pressable>
                        </View>
                        {MARITAL_STATUS_OPTIONS.map((option) => (
                            <Pressable
                                key={option}
                                style={[styles.maritalOption, maritalStatus === option && styles.maritalOptionActive]}
                                onPress={() => {
                                    setMaritalStatus(option);
                                    setMaritalPickerVisible(false);
                                }}
                            >
                                <Text style={[styles.maritalOptionText, { color: colors.text }]}>{option}</Text>
                                {maritalStatus === option && <MaterialCommunityIcons name="check" size={18} color="#C83C59" />}
                            </Pressable>
                        ))}
                    </View>
                </View>
            </Modal>

            <Modal
                visible={isAddressEditorVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setAddressEditorVisible(false)}
            >
                <View style={styles.addressModalOverlay}>
                    <View style={[styles.addressModal, { backgroundColor: colors.surface }]}>
                        <View style={styles.maritalModalHeader}>
                            <Text style={[styles.maritalModalTitle, { color: colors.text }]}>Editar endereço</Text>
                            <Pressable onPress={() => setAddressEditorVisible(false)}>
                                <MaterialCommunityIcons name="close" size={22} color={colors.muted} />
                            </Pressable>
                        </View>
                        <ScrollView keyboardShouldPersistTaps="handled">
                            <Text style={styles.inputLabel}>CEP</Text>
                            <TextInput style={[styles.textInput, inputThemeStyle, styles.addressModalInput]} value={postalCode} onChangeText={(value) => setPostalCode(cepMask(value))} keyboardType="numeric" />
                            <Text style={styles.inputLabel}>LOGRADOURO</Text>
                            <TextInput style={[styles.textInput, inputThemeStyle, styles.addressModalInput]} value={address} onChangeText={setAddress} />
                            <Text style={styles.inputLabel}>NÚMERO</Text>
                            <TextInput style={[styles.textInput, inputThemeStyle, styles.addressModalInput]} value={addressNumber} onChangeText={setAddressNumber} />
                            <Text style={styles.inputLabel}>COMPLEMENTO</Text>
                            <TextInput style={[styles.textInput, inputThemeStyle, styles.addressModalInput]} value={addressComplement} onChangeText={setAddressComplement} />
                            <Text style={styles.inputLabel}>BAIRRO</Text>
                            <TextInput style={[styles.textInput, inputThemeStyle, styles.addressModalInput]} value={neighborhood} onChangeText={setNeighborhood} />
                            <Text style={styles.inputLabel}>CIDADE</Text>
                            <TextInput style={[styles.textInput, inputThemeStyle, styles.addressModalInput]} value={city} onChangeText={setCity} />
                            <Text style={styles.inputLabel}>UF</Text>
                            <TextInput style={[styles.textInput, inputThemeStyle, styles.addressModalInput]} value={state} onChangeText={(value) => setState(value.toUpperCase().slice(0, 2))} maxLength={2} autoCapitalize="characters" />
                            <Pressable style={styles.primaryButton} onPress={() => setAddressEditorVisible(false)}>
                                <Text style={styles.primaryButtonText}>Concluir edição</Text>
                            </Pressable>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </MobileFrame>
    );
}

function PasswordRule({ label, valid }) {
    return (
        <View style={styles.passwordRuleRow}>
            <MaterialCommunityIcons
                name={valid ? 'check-circle' : 'circle-outline'}
                size={15}
                color={valid ? '#4CAF50' : '#7C7C82'}
            />
            <Text style={[styles.passwordRuleText, valid && styles.passwordRuleTextValid]}>
                {label}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#0C0D10',
    },
    scrollContainer: {
        flex: 1,
        width: '100%',
        minHeight: 0,
    },
    // React Native Web precisa de overflow vertical explícito para rolar com a roda do mouse.
    webScrollContainer: {
        overflowY: 'auto',
        overflowX: 'hidden',
        overscrollBehaviorY: 'contain',
    },
    mainContent: {
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 100,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    largeAvatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#C83C59',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        shadowColor: '#C83C59',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
    },
    largeAvatarText: {
        color: '#FFFFFF',
        fontSize: 36,
        fontWeight: '700',
    },
    largeProfileAvatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 45,
    },
    userName: {
        color: '#F8FAFC',
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 4,
    },
    userEmail: {
        color: '#94A3B8',
        fontSize: 13,
        marginBottom: 2,
    },
    userPhone: {
        color: '#94A3B8',
        fontSize: 13,
    },
    menuCard: {
        width: '100%',
        backgroundColor: '#111318',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#1C1E24',
        paddingVertical: 6,
        marginBottom: 40,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    menuIconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#1A1D24',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    menuTextWrap: {
        flex: 1,
    },
    menuTitle: {
        color: '#F8FAFC',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    menuSubtitle: {
        color: '#94A3B8',
        fontSize: 11,
    },
    divider: {
        height: 1,
        backgroundColor: '#1C1E24',
        marginHorizontal: 16,
    },
    footerVersion: {
        color: '#71717A',
        fontSize: 11,
        textAlign: 'center',
    },
    profileSaveNotice: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        gap: 8,
        marginBottom: 12,
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(74, 222, 128, 0.35)',
        backgroundColor: 'rgba(22, 101, 52, 0.18)',
    },
    profileSaveNoticeText: {
        color: '#86EFAC',
        fontSize: 12,
        fontWeight: '600',
    },
    profileErrorNotice: {
        borderColor: 'rgba(248, 113, 113, 0.35)',
        backgroundColor: 'rgba(127, 29, 29, 0.18)',
    },
    profileErrorNoticeText: {
        color: '#FCA5A5',
    },
    subScreen: {
        flex: 1,
        width: '100%',
        backgroundColor: '#0C0D10',
    },
    headerRow: {
        height: 56,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#1C1E24',
        flexShrink: 0,
    },
    backBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backSpacer: {
        width: 32,
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        color: '#F8FAFC',
        fontSize: 16,
        fontWeight: '700',
    },
    formContent: {
        padding: 20,
        paddingBottom: 280,
    },
    avatarCenterWrap: {
        alignItems: 'center',
        marginBottom: 24,
    },
    mediumAvatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#C83C59',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        shadowColor: '#C83C59',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
    },
    mediumAvatarText: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: '700',
    },
    profileAvatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 36,
    },
    avatarHint: {
        color: '#94A3B8',
        fontSize: 12,
    },
    removePhotoText: {
        color: '#F87171',
        fontSize: 12,
        fontWeight: '600',
        marginTop: -16,
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        color: '#94A3B8',
        fontSize: 11,
        fontWeight: '700',
        marginBottom: 6,
        letterSpacing: 0.5,
    },
    textInput: {
        height: 48,
        backgroundColor: '#111318',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#1C1E24',
        paddingHorizontal: 14,
        color: '#F8FAFC',
        fontSize: 14,
    },
    addressEditorRow: {
        minHeight: 48,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    addressEditorText: {
        flex: 1,
        fontSize: 14,
        marginRight: 10,
    },
    addressModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    addressModal: {
        width: '100%',
        maxWidth: 390,
        maxHeight: '92%',
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        padding: 20,
    },
    addressModalInput: {
        marginBottom: 14,
    },
    disabledInput: {
        color: '#71717A',
    },
    inputSubHint: {
        color: '#71717A',
        fontSize: 11,
        marginTop: 4,
    },
    selectInput: {
        height: 48,
        backgroundColor: '#111318',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#1C1E24',
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    selectText: {
        color: '#F8FAFC',
        fontSize: 14,
    },
    maritalModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    maritalModal: {
        borderRadius: 18,
        padding: 18,
    },
    maritalModalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    maritalModalTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    maritalOption: {
        minHeight: 46,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(127,127,127,0.18)',
        paddingVertical: 8,
    },
    maritalOptionActive: {
        backgroundColor: 'rgba(200,60,89,0.08)',
    },
    maritalOptionText: {
        fontSize: 14,
    },
    primaryButton: {
        height: 48,
        backgroundColor: '#C83C59',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        shadowColor: '#C83C59',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
    profileEditActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 10,
    },
    secondaryButton: {
        flex: 1,
        height: 48,
        backgroundColor: '#2C2C2E',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryButtonText: {
        color: '#D1D5DB',
        fontSize: 15,
        fontWeight: '700',
    },
    profileSaveButton: {
        flex: 1,
        marginTop: 0,
    },
    settingsContent: {
        padding: 20,
        paddingBottom: 280,
    },
    sectionHeader: {
        color: '#94A3B8',
        fontSize: 11,
        fontWeight: '700',
        marginBottom: 8,
        marginTop: 12,
        letterSpacing: 0.5,
    },
    settingsCard: {
        backgroundColor: '#111318',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#1C1E24',
        overflow: 'hidden',
        marginBottom: 10,
    },
    settingsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    settingsRowAccordion: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    settingIconBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#1A1D24',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    settingIconBoxRed: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#2A121A',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    settingTextWrap: {
        flex: 1,
    },
    settingTitle: {
        color: '#F8FAFC',
        fontSize: 14,
        fontWeight: '600',
    },
    settingTitleRed: {
        color: '#FF3366',
        fontSize: 14,
        fontWeight: '600',
    },
    settingSubtitle: {
        color: '#94A3B8',
        fontSize: 11,
        marginTop: 2,
    },
    cardDivider: {
        height: 1,
        backgroundColor: '#1C1E24',
        marginHorizontal: 16,
    },
    accordionBody: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 4,
    },
    subTextInput: {
        height: 44,
        backgroundColor: '#0C0D10',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#1F2937',
        paddingHorizontal: 12,
        color: '#F8FAFC',
        fontSize: 13,
        marginBottom: 10,
    },
    subTextInputCenter: {
        height: 44,
        backgroundColor: '#0C0D10',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#1F2937',
        paddingHorizontal: 12,
        color: '#F8FAFC',
        fontSize: 13,
        textAlign: 'center',
        marginBottom: 10,
    },
    passwordRules: {
        marginTop: 2,
        marginBottom: 12,
        paddingLeft: 4,
        gap: 4,
    },
    passwordRuleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    passwordRuleText: {
        color: '#7C7C82',
        fontSize: 12,
        marginLeft: 6,
    },
    passwordRuleTextValid: {
        color: '#4CAF50',
    },
    pinInputWrap: {
        position: 'relative',
        borderRadius: 10,
        marginBottom: 10,
    },
    pinTextInput: {
        marginBottom: 0,
        paddingRight: 44,
    },
    pinEyeButton: {
        position: 'absolute',
        right: 0,
        top: 0,
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    linkTextCentered: {
        color: '#C83C59',
        fontSize: 13,
        textAlign: 'center',
        marginTop: 12,
        fontWeight: '600',
    },
    innerFlowBox: {
        marginTop: 4,
    },
    innerBackRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    innerBackText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    innerDescText: {
        color: '#94A3B8',
        fontSize: 12,
        lineHeight: 18,
        marginBottom: 12,
    },
    resendPrompt: {
        color: '#94A3B8',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 12,
    },
    resendLink: {
        color: '#C83C59',
        fontWeight: '600',
    },
    verifiedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    verifiedText: {
        color: '#22C55E',
        fontSize: 13,
        fontWeight: '600',
    },
    disguiseCard: {
        paddingHorizontal: 12,
        paddingTop: 14,
        paddingBottom: 14,
    },
    disguiseHeading: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    disguiseOptions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 6,
    },
    disguiseOption: {
        flex: 1,
        minWidth: 0,
        minHeight: 84,
        borderRadius: 13,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 3,
        paddingVertical: 9,
    },
    disguiseOptionSelected: {
        borderColor: '#C83C59',
        backgroundColor: 'rgba(200,60,89,0.10)',
    },
    disguiseIconPreview: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 7,
    },
    disguiseIconSelected: {
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.55)',
    },
    disguiseOptionLabel: {
        fontSize: 9,
        fontWeight: '500',
        textAlign: 'center',
    },
    settingsHint: {
        color: '#71717A',
        fontSize: 10,
        lineHeight: 16,
        marginHorizontal: 4,
        marginTop: -2,
        marginBottom: 10,
    },
    widgetCard: {
        padding: 14,
    },
    widgetPreviewLabel: {
        color: '#71717A',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.4,
        marginBottom: 10,
    },
    widgetPreviewRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        marginBottom: 22,
    },
    widgetPreviewTile: {
        width: 112,
        height: 112,
        borderRadius: 22,
        backgroundColor: '#20171D',
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    widgetPreviewImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    widgetNameOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        minHeight: 34,
        paddingHorizontal: 8,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.72)',
    },
    widgetNameOverlayText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '600',
    },
    widgetPreviewDescription: {
        flex: 1,
        minWidth: 0,
        paddingTop: 2,
    },
    widgetDescriptionText: {
        fontSize: 11,
        lineHeight: 19,
        marginTop: 5,
        marginBottom: 10,
    },
    choosePhotoButton: {
        alignSelf: 'flex-start',
        minHeight: 34,
        borderRadius: 10,
        borderWidth: 1,
        paddingHorizontal: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    choosePhotoText: {
        fontSize: 11,
        fontWeight: '600',
    },
    widgetNamesRow: {
        flexDirection: 'row',
        gap: 6,
        marginBottom: 18,
    },
    widgetNameOption: {
        flex: 1,
        minWidth: 0,
        minHeight: 34,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    widgetNameOptionSelected: {
        borderColor: '#C83C59',
        backgroundColor: 'rgba(200,60,89,0.08)',
    },
    widgetNameOptionText: {
        fontSize: 10,
        textAlign: 'center',
    },
    buttonDisabled: {
        opacity: 0.65,
    },
    footerVersionSettings: {
        color: '#71717A',
        fontSize: 11,
        textAlign: 'center',
        marginTop: 20,
    },
});