import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import MobileFrame from '../../components/MobileFrame/MobileFrame';
import BottomNav from '../../components/BottomNav/BottomNav';
import { useTheme } from '../../context/ThemeContext';
import { useUserProfile } from '../../context/UserProfileContext';
import { MARITAL_STATUS_OPTIONS } from '../../constants/profileOptions';

export default function PerfilScreen() {
    const navigation = useNavigation();
    const { isLight, colors, toggleTheme } = useTheme();
    const { profile, updateProfile } = useUserProfile();
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
    const [email, setEmail] = useState('mariaclara@email.com');
    const [phone, setPhone] = useState('(11) 98765-4321');
    const [address, setAddress] = useState('Rua das Flores, 42 — São Paulo, SP');
    const [maritalStatus, setMaritalStatus] = useState('Solteira');
    const [isMaritalPickerVisible, setMaritalPickerVisible] = useState(false);
    const [cpf] = useState('***.456.***-00');

    // Settings states
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [recoveryEmail, setRecoveryEmail] = useState('mariaclara@email.com');
    const [verificationCode, setVerificationCode] = useState('');

    // PIN states
    const [currentPin, setCurrentPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');

    useEffect(() => {
        setName(profile.name);
    }, [profile.name]);

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

    return (
        <MobileFrame backgroundColor="#0C0D10">
            <View style={[styles.screen, { backgroundColor: colors.background }]}>
                {screen === 'main' && (
                    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.mainContent} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
                        <View style={styles.avatarSection}>
                            <View style={styles.largeAvatar}>
                                <Text style={styles.largeAvatarText}>M</Text>
                            </View>
                            <Text style={[styles.userName, { color: colors.text }]}>{profile.name}</Text>
                            <Text style={[styles.userEmail, { color: colors.muted }]}>mariaclara@email.com</Text>
                            <Text style={[styles.userPhone, { color: colors.muted }]}>(11) 98765-4321</Text>
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

                        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
                            <View style={styles.avatarCenterWrap}>
                                <View style={styles.mediumAvatar}>
                                    <Text style={styles.mediumAvatarText}>M</Text>
                                </View>
                                <Text style={styles.avatarHint}>Toque para alterar a foto</Text>
                            </View>

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
                                <TextInput
                                    style={[styles.textInput, inputThemeStyle]}
                                    value={address}
                                    onChangeText={setAddress}
                                    placeholderTextColor={colors.muted}
                                />
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
                                    value={cpf}
                                    editable={false}
                                />
                                <Text style={styles.inputSubHint}>O CPF não pode ser alterado</Text>
                            </View>

                            <Pressable
                                style={styles.primaryButton}
                                onPress={() => {
                                    updateProfile({ name, email, phone });
                                    setScreen('main');
                                }}
                            >
                                <Text style={styles.primaryButtonText}>Salvar alterações</Text>
                            </Pressable>
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

                        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.settingsContent} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
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
                                                <TextInput
                                                    style={[styles.subTextInput, inputThemeStyle]}
                                                    placeholder="Senha atual"
                                                    placeholderTextColor={colors.muted}
                                                    secureTextEntry
                                                    value={currentPassword}
                                                    onChangeText={setCurrentPassword}
                                                />
                                                <TextInput
                                                    style={[styles.subTextInput, inputThemeStyle]}
                                                    placeholder="Nova senha"
                                                    placeholderTextColor={colors.muted}
                                                    secureTextEntry
                                                    value={newPassword}
                                                    onChangeText={setNewPassword}
                                                />
                                                <TextInput
                                                    style={[styles.subTextInput, inputThemeStyle]}
                                                    placeholder="Confirmar nova senha"
                                                    placeholderTextColor={colors.muted}
                                                    secureTextEntry
                                                    value={confirmPassword}
                                                    onChangeText={setConfirmPassword}
                                                />
                                                <Pressable
                                                    style={styles.primaryButton}
                                                    onPress={resetPasswordFlow}
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
                                                    onPress={() => setPasswordStep('verify')}
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

                                                <View style={styles.codeBoxesRow}>
                                                    {[0, 1, 2, 3, 4, 5].map((i) => (
                                                        <View key={i} style={[styles.codeBoxItem, { backgroundColor: colors.input, borderColor: colors.border }]} />
                                                    ))}
                                                </View>

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
                                                    onPress={() => setPasswordStep('new')}
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
                                                <TextInput
                                                    style={[styles.subTextInput, inputThemeStyle]}
                                                    placeholder="Nova senha"
                                                    placeholderTextColor={colors.muted}
                                                    secureTextEntry
                                                    value={newPassword}
                                                    onChangeText={setNewPassword}
                                                />
                                                <TextInput
                                                    style={[styles.subTextInput, inputThemeStyle]}
                                                    placeholder="Confirmar nova senha"
                                                    placeholderTextColor={colors.muted}
                                                    secureTextEntry
                                                    value={confirmPassword}
                                                    onChangeText={setConfirmPassword}
                                                />
                                                <Pressable
                                                    style={styles.primaryButton}
                                                    onPress={resetPasswordFlow}
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
                                                <TextInput
                                                    style={[styles.subTextInput, inputThemeStyle]}
                                                    placeholder="PIN atual (4 dígitos)"
                                                    placeholderTextColor={colors.muted}
                                                    secureTextEntry
                                                    keyboardType="number-pad"
                                                    maxLength={4}
                                                    value={currentPin}
                                                    onChangeText={setCurrentPin}
                                                />
                                                <TextInput
                                                    style={[styles.subTextInput, inputThemeStyle]}
                                                    placeholder="Novo PIN"
                                                    placeholderTextColor={colors.muted}
                                                    secureTextEntry
                                                    keyboardType="number-pad"
                                                    maxLength={4}
                                                    value={newPin}
                                                    onChangeText={setNewPin}
                                                />
                                                <TextInput
                                                    style={[styles.subTextInput, inputThemeStyle]}
                                                    placeholder="Confirmar novo PIN"
                                                    placeholderTextColor={colors.muted}
                                                    secureTextEntry
                                                    keyboardType="number-pad"
                                                    maxLength={4}
                                                    value={confirmPin}
                                                    onChangeText={setConfirmPin}
                                                />
                                                <Pressable
                                                    style={styles.primaryButton}
                                                    onPress={resetPinFlow}
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
                                                    onPress={() => setPinStep('verify')}
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

                                                <View style={styles.codeBoxesRow}>
                                                    {[0, 1, 2, 3, 4, 5].map((i) => (
                                                        <View key={i} style={[styles.codeBoxItem, { backgroundColor: colors.input, borderColor: colors.border }]} />
                                                    ))}
                                                </View>

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
                                                    onPress={() => setPinStep('new')}
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
                                                <TextInput
                                                    style={[styles.subTextInput, inputThemeStyle]}
                                                    placeholder="Novo PIN"
                                                    placeholderTextColor={colors.muted}
                                                    secureTextEntry
                                                    keyboardType="number-pad"
                                                    maxLength={4}
                                                    value={newPin}
                                                    onChangeText={setNewPin}
                                                />
                                                <TextInput
                                                    style={[styles.subTextInput, inputThemeStyle]}
                                                    placeholder="Confirmar novo PIN"
                                                    placeholderTextColor={colors.muted}
                                                    secureTextEntry
                                                    keyboardType="number-pad"
                                                    maxLength={4}
                                                    value={confirmPin}
                                                    onChangeText={setConfirmPin}
                                                />
                                                <Pressable
                                                    style={styles.primaryButton}
                                                    onPress={resetPinFlow}
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
                                    onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}
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
        </MobileFrame>
    );
}

const styles = StyleSheet.create({
    screen: {
        width: '100%',
        height: '100%',
        backgroundColor: '#0C0D10',
        display: 'flex',
        flexDirection: 'column',
    },
    scrollContainer: {
        flex: 1,
        width: '100%',
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
        paddingBottom: 100,
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
    avatarHint: {
        color: '#94A3B8',
        fontSize: 12,
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
    settingsContent: {
        padding: 20,
        paddingBottom: 100,
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
    codeBoxesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    codeBoxItem: {
        width: 42,
        height: 48,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#2D3748',
        backgroundColor: '#0C0D10',
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
    footerVersionSettings: {
        color: '#71717A',
        fontSize: 11,
        textAlign: 'center',
        marginTop: 20,
    },
});