import React, { useState } from 'react';
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import MobileFrame from '../../components/MobileFrame/MobileFrame';
import BottomNav from '../../components/BottomNav/BottomNav';

export default function PerfilScreen() {
    const [screen, setScreen] = useState('main'); // 'main' | 'editProfile' | 'settings'
    const [securitySection, setSecuritySection] = useState(null); // null | 'password' | 'pin'
    const [passwordStep, setPasswordStep] = useState('form'); // 'form' | 'forgot' | 'verify' | 'new'
    const [pinStep, setPinStep] = useState('form'); // 'form' | 'forgot' | 'verify' | 'new'

    // Profile form states
    const [name, setName] = useState('Maria Clara Santos');
    const [email, setEmail] = useState('mariaclara@email.com');
    const [phone, setPhone] = useState('(11) 98765-4321');
    const [address, setAddress] = useState('Rua das Flores, 42 — São Paulo, SP');
    const [maritalStatus, setMaritalStatus] = useState('Solteira');
    const [cpf] = useState('***.456.***-00');

    // Settings states
    const [themeLight, setThemeLight] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [recoveryEmail, setRecoveryEmail] = useState('mariaclara@email.com');
    const [verificationCode, setVerificationCode] = useState('');

    // PIN states
    const [currentPin, setCurrentPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');

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
            <View style={styles.screen}>
                {screen === 'main' && (
                    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.mainContent}>
                        <View style={styles.avatarSection}>
                            <View style={styles.largeAvatar}>
                                <Text style={styles.largeAvatarText}>M</Text>
                            </View>
                            <Text style={styles.userName}>Maria Clara Santos</Text>
                            <Text style={styles.userEmail}>mariaclara@email.com</Text>
                            <Text style={styles.userPhone}>(11) 98765-4321</Text>
                        </View>

                        <View style={styles.menuCard}>
                            <Pressable
                                style={styles.menuItem}
                                onPress={() => setScreen('editProfile')}
                            >
                                <View style={styles.menuIconBox}>
                                    <MaterialCommunityIcons name="square-edit-outline" size={20} color="#60A5FA" />
                                </View>
                                <View style={styles.menuTextWrap}>
                                    <Text style={styles.menuTitle}>Editar perfil</Text>
                                    <Text style={styles.menuSubtitle}>Nome, e-mail, endereço e mais</Text>
                                </View>
                                <MaterialCommunityIcons name="chevron-right" size={20} color="#71717A" />
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
                                <View style={styles.menuIconBox}>
                                    <MaterialCommunityIcons name="cog-outline" size={20} color="#94A3B8" />
                                </View>
                                <View style={styles.menuTextWrap}>
                                    <Text style={styles.menuTitle}>Configurações</Text>
                                    <Text style={styles.menuSubtitle}>Tema, senha e conta</Text>
                                </View>
                                <MaterialCommunityIcons name="chevron-right" size={20} color="#71717A" />
                            </Pressable>
                        </View>

                        <Text style={styles.footerVersion}>Guardiã v1.0 · Com você, sempre</Text>
                    </ScrollView>
                )}

                {screen === 'editProfile' && (
                    <View style={styles.subScreen}>
                        <View style={styles.headerRow}>
                            <Pressable style={styles.backBtn} onPress={() => setScreen('main')}>
                                <MaterialCommunityIcons name="chevron-left" size={22} color="#FFFFFF" />
                            </Pressable>
                            <Text style={styles.headerTitle}>Editar Perfil</Text>
                            <View style={styles.backSpacer} />
                        </View>

                        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.formContent}>
                            <View style={styles.avatarCenterWrap}>
                                <View style={styles.mediumAvatar}>
                                    <Text style={styles.mediumAvatarText}>M</Text>
                                </View>
                                <Text style={styles.avatarHint}>Toque para alterar a foto</Text>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>NOME COMPLETO</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={name}
                                    onChangeText={setName}
                                    placeholderTextColor="#71717A"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>E-MAIL</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholderTextColor="#71717A"
                                    keyboardType="email-address"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>TELEFONE</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={phone}
                                    onChangeText={setPhone}
                                    placeholderTextColor="#71717A"
                                    keyboardType="phone-pad"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>ENDEREÇO</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={address}
                                    onChangeText={setAddress}
                                    placeholderTextColor="#71717A"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>ESTADO CIVIL</Text>
                                <View style={styles.selectInput}>
                                    <Text style={styles.selectText}>{maritalStatus}</Text>
                                    <MaterialCommunityIcons name="chevron-down" size={18} color="#71717A" />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>CPF</Text>
                                <TextInput
                                    style={[styles.textInput, styles.disabledInput]}
                                    value={cpf}
                                    editable={false}
                                />
                                <Text style={styles.inputSubHint}>O CPF não pode ser alterado</Text>
                            </View>

                            <Pressable style={styles.primaryButton} onPress={() => setScreen('main')}>
                                <Text style={styles.primaryButtonText}>Salvar alterações</Text>
                            </Pressable>
                        </ScrollView>
                    </View>
                )}

                {screen === 'settings' && (
                    <View style={styles.subScreen}>
                        <View style={styles.headerRow}>
                            <Pressable style={styles.backBtn} onPress={() => setScreen('main')}>
                                <MaterialCommunityIcons name="chevron-left" size={22} color="#FFFFFF" />
                            </Pressable>
                            <Text style={styles.headerTitle}>Configurações</Text>
                            <View style={styles.backSpacer} />
                        </View>

                        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.settingsContent}>
                            {/* Aparência */}
                            <Text style={styles.sectionHeader}>APARÊNCIA</Text>
                            <View style={styles.settingsCard}>
                                <View style={styles.settingsRow}>
                                    <View style={styles.settingIconBox}>
                                        <MaterialCommunityIcons name="white-balance-sunny" size={18} color="#94A3B8" />
                                    </View>
                                    <View style={styles.settingTextWrap}>
                                        <Text style={styles.settingTitle}>Tema claro</Text>
                                        <Text style={styles.settingSubtitle}>Desativado</Text>
                                    </View>
                                    <Switch
                                        value={themeLight}
                                        onValueChange={setThemeLight}
                                        trackColor={{ false: '#374151', true: '#C83C59' }}
                                        thumbColor="#FFFFFF"
                                    />
                                </View>
                            </View>

                            {/* Segurança */}
                            <Text style={styles.sectionHeader}>SEGURANÇA</Text>
                            <View style={styles.settingsCard}>
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
                                    <View style={styles.settingIconBox}>
                                        <MaterialCommunityIcons name="lock-outline" size={18} color="#94A3B8" />
                                    </View>
                                    <View style={styles.settingTextWrap}>
                                        <Text style={styles.settingTitle}>Redefinir senha</Text>
                                        <Text style={styles.settingSubtitle}>Altere sua senha de acesso</Text>
                                    </View>
                                    <MaterialCommunityIcons
                                        name={securitySection === 'password' ? 'chevron-down' : 'chevron-right'}
                                        size={18}
                                        color="#71717A"
                                    />
                                </Pressable>

                                {securitySection === 'password' && (
                                    <View style={styles.accordionBody}>
                                        {passwordStep === 'form' && (
                                            <>
                                                <TextInput
                                                    style={styles.subTextInput}
                                                    placeholder="Senha atual"
                                                    placeholderTextColor="#71717A"
                                                    secureTextEntry
                                                    value={currentPassword}
                                                    onChangeText={setCurrentPassword}
                                                />
                                                <TextInput
                                                    style={styles.subTextInput}
                                                    placeholder="Nova senha"
                                                    placeholderTextColor="#71717A"
                                                    secureTextEntry
                                                    value={newPassword}
                                                    onChangeText={setNewPassword}
                                                />
                                                <TextInput
                                                    style={styles.subTextInput}
                                                    placeholder="Confirmar nova senha"
                                                    placeholderTextColor="#71717A"
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
                                                    <MaterialCommunityIcons name="chevron-left" size={16} color="#FFFFFF" />
                                                    <Text style={styles.innerBackText}>Recuperar senha</Text>
                                                </Pressable>
                                                <Text style={styles.innerDescText}>
                                                    Enviaremos um código de 6 dígitos para o seu e-mail cadastrado.
                                                </Text>
                                                <TextInput
                                                    style={styles.subTextInput}
                                                    value={recoveryEmail}
                                                    onChangeText={setRecoveryEmail}
                                                    placeholderTextColor="#71717A"
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
                                                    <MaterialCommunityIcons name="chevron-left" size={16} color="#FFFFFF" />
                                                    <Text style={styles.innerBackText}>Verificar código</Text>
                                                </Pressable>
                                                <Text style={styles.innerDescText}>
                                                    Digite o código de 6 dígitos enviado para {recoveryEmail}
                                                </Text>

                                                <View style={styles.codeBoxesRow}>
                                                    {[0, 1, 2, 3, 4, 5].map((i) => (
                                                        <View key={i} style={styles.codeBoxItem} />
                                                    ))}
                                                </View>

                                                <TextInput
                                                    style={styles.subTextInputCenter}
                                                    value={verificationCode}
                                                    onChangeText={setVerificationCode}
                                                    placeholder="000000"
                                                    placeholderTextColor="#71717A"
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
                                                    style={styles.subTextInput}
                                                    placeholder="Nova senha"
                                                    placeholderTextColor="#71717A"
                                                    secureTextEntry
                                                    value={newPassword}
                                                    onChangeText={setNewPassword}
                                                />
                                                <TextInput
                                                    style={styles.subTextInput}
                                                    placeholder="Confirmar nova senha"
                                                    placeholderTextColor="#71717A"
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
                                    <View style={styles.settingIconBox}>
                                        <MaterialCommunityIcons name="view-grid-outline" size={18} color="#94A3B8" />
                                    </View>
                                    <View style={styles.settingTextWrap}>
                                        <Text style={styles.settingTitle}>Editar PIN de provas</Text>
                                        <Text style={styles.settingSubtitle}>Altere o PIN da área de evidências</Text>
                                    </View>
                                    <MaterialCommunityIcons
                                        name={securitySection === 'pin' ? 'chevron-down' : 'chevron-right'}
                                        size={18}
                                        color="#71717A"
                                    />
                                </Pressable>

                                {securitySection === 'pin' && (
                                    <View style={styles.accordionBody}>
                                        {pinStep === 'form' && (
                                            <>
                                                <TextInput
                                                    style={styles.subTextInput}
                                                    placeholder="PIN atual (4 dígitos)"
                                                    placeholderTextColor="#71717A"
                                                    secureTextEntry
                                                    keyboardType="number-pad"
                                                    maxLength={4}
                                                    value={currentPin}
                                                    onChangeText={setCurrentPin}
                                                />
                                                <TextInput
                                                    style={styles.subTextInput}
                                                    placeholder="Novo PIN"
                                                    placeholderTextColor="#71717A"
                                                    secureTextEntry
                                                    keyboardType="number-pad"
                                                    maxLength={4}
                                                    value={newPin}
                                                    onChangeText={setNewPin}
                                                />
                                                <TextInput
                                                    style={styles.subTextInput}
                                                    placeholder="Confirmar novo PIN"
                                                    placeholderTextColor="#71717A"
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
                                                    <MaterialCommunityIcons name="chevron-left" size={16} color="#FFFFFF" />
                                                    <Text style={styles.innerBackText}>Recuperar PIN</Text>
                                                </Pressable>
                                                <Text style={styles.innerDescText}>
                                                    Enviaremos um código de 6 dígitos para o seu e-mail cadastrado.
                                                </Text>
                                                <TextInput
                                                    style={styles.subTextInput}
                                                    value={recoveryEmail}
                                                    onChangeText={setRecoveryEmail}
                                                    placeholderTextColor="#71717A"
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
                                                    <MaterialCommunityIcons name="chevron-left" size={16} color="#FFFFFF" />
                                                    <Text style={styles.innerBackText}>Verificar código</Text>
                                                </Pressable>
                                                <Text style={styles.innerDescText}>
                                                    Código enviado para {recoveryEmail}
                                                </Text>

                                                <View style={styles.codeBoxesRow}>
                                                    {[0, 1, 2, 3, 4, 5].map((i) => (
                                                        <View key={i} style={styles.codeBoxItem} />
                                                    ))}
                                                </View>

                                                <TextInput
                                                    style={styles.subTextInputCenter}
                                                    value={verificationCode}
                                                    onChangeText={setVerificationCode}
                                                    placeholder="000000"
                                                    placeholderTextColor="#71717A"
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
                                                    style={styles.subTextInput}
                                                    placeholder="Novo PIN"
                                                    placeholderTextColor="#71717A"
                                                    secureTextEntry
                                                    keyboardType="number-pad"
                                                    maxLength={4}
                                                    value={newPin}
                                                    onChangeText={setNewPin}
                                                />
                                                <TextInput
                                                    style={styles.subTextInput}
                                                    placeholder="Confirmar novo PIN"
                                                    placeholderTextColor="#71717A"
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
                            <View style={styles.settingsCard}>
                                <Pressable style={styles.settingsRow} onPress={() => setScreen('main')}>
                                    <View style={styles.settingIconBoxRed}>
                                        <MaterialCommunityIcons name="logout" size={18} color="#FF3366" />
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