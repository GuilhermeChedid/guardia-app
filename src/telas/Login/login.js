import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import MobileFrame from '../../components/MobileFrame/MobileFrame';
import { useTheme } from '../../context/ThemeContext';

const logoGuardia = require('../../assets/imagens/logo_guardia.png');

export default function LoginScreen() {
    const navigation = useNavigation();
    const { colors } = useTheme();

    // Estados do fluxo
    const [currentView, setCurrentView] = useState('login'); // 'login', 'forgot_email', 'forgot_code', 'forgot_new_password'

    // Estados do Login
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Estados de Recuperação
    const [forgotEmail, setForgotEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Função para tratar o login e verificar credenciais de Administrador
    const handleLogin = () => {
        if (email.trim().toLowerCase() === 'admin@guardiao.com' && password === '1234') {
            // Redireciona para a tela de Administrador (certifique-se de registrar essa rota no seu Navigator)
            navigation.navigate('Admin');
        } else {
            // Fluxo padrão para usuários comuns
            navigation.navigate('Home');
        }
    };

    const renderLogin = () => (
        <>
            <Text style={[styles.welcomeTitle, { color: colors.text }]}>Bem-vinda de volta</Text>
            <Text style={[styles.welcomeSubtitle, { color: colors.muted }]}>Entre com sua conta para continuar</Text>

            <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>E-mail <Text style={styles.required}>*</Text></Text>
                <View style={[styles.inputContainer, { backgroundColor: colors.input, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="email-outline" size={19} color="#8B8B93" style={styles.iconLeft} />
                    <TextInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder="seu@email.com"
                        placeholderTextColor="#555"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        style={[styles.input, { color: colors.text }]}
                    />
                </View>
            </View>

            <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Senha <Text style={styles.required}>*</Text></Text>
                <View style={[styles.inputContainer, { backgroundColor: colors.input, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="lock-outline" size={19} color="#8B8B93" style={styles.iconLeft} />
                    <TextInput
                        value={password}
                        onChangeText={setPassword}
                        placeholder="••••••••"
                        placeholderTextColor="#555"
                        secureTextEntry={!showPassword}
                        style={[styles.input, { color: colors.text }]}
                    />
                    <Pressable onPress={() => setShowPassword((prev) => !prev)} style={styles.iconRight}>
                        <MaterialCommunityIcons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={19} color="#8B8B93" />
                    </Pressable>
                </View>
            </View>

            <Pressable style={styles.forgotWrap} onPress={() => setCurrentView('forgot_email')}>
                <Text style={styles.forgotPassword}>Esqueci minha senha</Text>
            </Pressable>

            {/* Botão de login atualizado com a validação do Admin */}
            <Pressable style={styles.btnPrimary} onPress={handleLogin}>
                <Text style={styles.btnText}>Entrar</Text>
            </Pressable>

            <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>ou</Text>
                <View style={styles.dividerLine} />
            </View>

            <Pressable onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerText}>
                    Nao tem uma conta? <Text style={styles.registerLink}>Cadastre-se</Text>
                </Text>
            </Pressable>
        </>
    );

    const renderForgotEmail = () => (
        <>
            <Pressable style={styles.backButton} onPress={() => setCurrentView('login')}>
                <Text style={styles.backButtonText}>{'< Voltar ao login'}</Text>
            </Pressable>

            <View style={[styles.stepIconBox, { borderColor: '#A62B4F' }]}>
                <Text style={styles.stepIconText}>🔒</Text>
            </View>

            <Text style={styles.stepTitle}>Esqueci minha senha</Text>
            <Text style={styles.stepSubtitle}>
                Informe seu e-mail cadastrado. Enviaremos um código para redefinir sua senha.
            </Text>

            <View style={styles.formGroup}>
                <Text style={styles.stepLabel}>E-MAIL</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        value={forgotEmail}
                        onChangeText={setForgotEmail}
                        placeholder="seu@email.com"
                        placeholderTextColor="#555"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        style={styles.inputNoIcon}
                    />
                </View>
            </View>

            <Pressable style={styles.btnPrimary} onPress={() => setCurrentView('forgot_code')}>
                <Text style={styles.btnText}>Enviar código</Text>
            </Pressable>
        </>
    );

    const renderForgotCode = () => (
        <>
            <Pressable style={styles.backButton} onPress={() => setCurrentView('forgot_email')}>
                <Text style={styles.backButtonText}>{'< Voltar'}</Text>
            </Pressable>

            <View style={[styles.stepIconBox, { borderColor: '#2E7D32' }]}>
                <Text style={[styles.stepIconText, { color: '#4CAF50' }]}>✉</Text>
            </View>

            <Text style={styles.stepTitle}>Verifique seu e-mail</Text>
            <Text style={styles.stepSubtitle}>
                Enviamos um código de 6 dígitos para{'\n'}
                <Text style={{ fontWeight: 'bold', color: '#EAEAEA' }}>{forgotEmail || 'seu@email.com'}</Text>
            </Text>

            <View style={styles.formGroup}>
                <Text style={styles.stepLabel}>CÓDIGO DE VERIFICAÇÃO</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        value={verificationCode}
                        onChangeText={setVerificationCode}
                        placeholder="1 2 3 4"
                        placeholderTextColor="#555"
                        keyboardType="number-pad"
                        maxLength={6}
                        style={[styles.inputNoIcon, styles.inputCentered]}
                    />
                </View>
            </View>

            <Pressable style={styles.btnPrimary} onPress={() => setCurrentView('forgot_new_password')}>
                <Text style={styles.btnText}>Verificar código</Text>
            </Pressable>

            <Pressable style={styles.resendWrap}>
                <Text style={styles.resendText}>
                    Não recebeu? <Text style={styles.resendLink}>Reenviar</Text>
                </Text>
            </Pressable>
        </>
    );

    const renderForgotNewPassword = () => (
        <>
            <Pressable style={styles.backButton} onPress={() => setCurrentView('forgot_code')}>
                <Text style={styles.backButtonText}>{'< Voltar'}</Text>
            </Pressable>

            <View style={[styles.stepIconBox, { borderColor: '#A62B4F' }]}>
                <Text style={styles.stepIconText}>🔒</Text>
            </View>

            <Text style={styles.stepTitle}>Nova senha</Text>
            <Text style={styles.stepSubtitle}>Crie uma nova senha segura para sua conta.</Text>

            <View style={styles.formGroup}>
                <Text style={styles.stepLabel}>NOVA SENHA</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        value={newPassword}
                        onChangeText={setNewPassword}
                        placeholder="••••••••"
                        placeholderTextColor="#555"
                        secureTextEntry={!showNewPassword}
                        style={styles.inputNoIcon}
                    />
                    <Pressable onPress={() => setShowNewPassword((prev) => !prev)} style={styles.iconRight}>
                        <MaterialCommunityIcons name={showNewPassword ? 'eye-off-outline' : 'eye-outline'} size={19} color="#8B8B93" />
                    </Pressable>
                </View>
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.stepLabel}>CONFIRMAR SENHA</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="••••••••"
                        placeholderTextColor="#555"
                        secureTextEntry={!showConfirmPassword}
                        style={styles.inputNoIcon}
                    />
                    <Pressable onPress={() => setShowConfirmPassword((prev) => !prev)} style={styles.iconRight}>
                        <MaterialCommunityIcons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={19} color="#8B8B93" />
                    </Pressable>
                </View>
            </View>

            <View style={styles.checklistContainer}>
                {[
                    'Mínimo 8 caracteres',
                    '1 letra maiúscula',
                    '1 letra minúscula',
                    '1 número',
                    '1 caractere especial (!@#$%&*_-)',
                ].map((item, index) => (
                    <View key={index} style={styles.checklistItem}>
                        <View style={styles.checklistDot} />
                        <Text style={styles.checklistText}>{item}</Text>
                    </View>
                ))}
            </View>

            <Pressable style={[styles.btnPrimary, { marginTop: 16 }]} onPress={() => setCurrentView('login')}>
                <Text style={styles.btnText}>Redefinir senha</Text>
            </Pressable>
        </>
    );

    return (
        <MobileFrame backgroundColor="#0B0B0C">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollGrow}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    automaticallyAdjustKeyboardInsets
                >
                    <View style={styles.appContainer}>
                        <View style={styles.topSection}>
                            <View style={[styles.blob, styles.blob1]} />
                            <View style={[styles.blob, styles.blob2]} />
                            <LinearGradient
                                colors={['transparent', colors.background]}
                                locations={[0.15, 1]}
                                style={styles.sectionFade}
                                pointerEvents="none"
                            />

                            <View style={styles.logoContainer}>
                                <View style={styles.logoBox}>
                                    <Image source={logoGuardia} style={styles.customLogo} resizeMode="contain" />
                                </View>
                                <Text style={styles.brandTitle}>Guardiã</Text>
                                <Text style={styles.brandSubtitle}>Sua segurança, sempre com você</Text>
                            </View>
                        </View>

                        <View style={[styles.bottomSection, { backgroundColor: colors.background }]}>
                            {currentView === 'login' && renderLogin()}
                            {currentView === 'forgot_email' && renderForgotEmail()}
                            {currentView === 'forgot_code' && renderForgotCode()}
                            {currentView === 'forgot_new_password' && renderForgotNewPassword()}
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </MobileFrame>
    );
}

const styles = StyleSheet.create({
    keyboardView: {
        flex: 1,
    },
    scrollGrow: {
        flexGrow: 1,
    },
    appContainer: {
        flex: 1,
        backgroundColor: '#0B0B0C',
    },
    topSection: {
        backgroundColor: '#4A1224',
        minHeight: 280,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    sectionFade: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: -1,
        height: 64,
        zIndex: 1,
    },
    blob: {
        position: 'absolute',
        borderRadius: 999,
        backgroundColor: 'rgba(166, 43, 79, 0.45)',
    },
    blob1: {
        width: 250,
        height: 250,
        top: -50,
        left: -100,
    },
    blob2: {
        width: 380,
        height: 380,
        top: -120,
        right: -150,
        backgroundColor: 'rgba(133, 22, 50, 0.7)',
    },
    logoContainer: {
        zIndex: 2,
        alignItems: 'center',
        marginTop: 20,
    },
    logoBox: {
        width: 64,
        height: 64,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    customLogo: {
        width: 48,
        height: 48,
    },
    brandTitle: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 6,
        letterSpacing: 0.5,
        color: '#FFFFFF',
    },
    brandSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.65)',
    },
    bottomSection: {
        flex: 1,
        backgroundColor: '#0B0B0C',
        paddingHorizontal: 24,
        paddingTop: 36,
        paddingBottom: 24,
    },
    welcomeTitle: {
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 6,
        color: '#FFFFFF',
    },
    welcomeSubtitle: {
        fontSize: 14,
        color: '#7C7C82',
        marginBottom: 32,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
        color: '#EAEAEA',
    },
    required: {
        color: '#D6395B',
    },
    inputContainer: {
        position: 'relative',
        justifyContent: 'center',
        backgroundColor: '#171719',
        borderRadius: 12,
        height: 52,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    iconLeft: {
        position: 'absolute',
        left: 16,
        color: '#666',
        fontSize: 16,
    },
    iconRight: {
        position: 'absolute',
        right: 14,
        padding: 4,
    },
    eyeText: {
        fontSize: 14,
        color: '#7C7C82'
    },
    input: {
        height: 52,
        color: '#FFFFFF',
        paddingLeft: 46,
        paddingRight: 46,
        fontSize: 14,
    },
    inputNoIcon: {
        height: 52,
        color: '#FFFFFF',
        paddingHorizontal: 16,
        fontSize: 14,
    },
    inputCentered: {
        textAlign: 'center',
        letterSpacing: 8,
        fontSize: 18,
        fontWeight: '600',
    },
    forgotWrap: {
        alignSelf: 'flex-end',
        marginTop: -6,
        marginBottom: 32,
    },
    forgotPassword: {
        color: '#D6395B',
        fontSize: 13,
        fontWeight: '500',
    },
    btnPrimary: {
        backgroundColor: '#A62B4F',
        borderRadius: 14,
        height: 54,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 32,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#1F1F22',
    },
    dividerText: {
        paddingHorizontal: 16,
        color: '#444',
        fontSize: 12,
        textTransform: 'uppercase',
    },
    registerText: {
        textAlign: 'center',
        fontSize: 14,
        color: '#7C7C82',
    },
    registerLink: {
        color: '#D6395B',
        fontWeight: '600',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    backButtonText: {
        color: '#7C7C82',
        fontSize: 13,
        fontWeight: '500',
    },
    stepIconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    stepIconText: {
        fontSize: 18,
        color: '#D6395B',
    },
    stepTitle: {
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 8,
        color: '#FFFFFF',
    },
    stepSubtitle: {
        fontSize: 14,
        color: '#7C7C82',
        marginBottom: 32,
        lineHeight: 20,
    },
    stepLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
        color: '#7C7C82',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    resendWrap: {
        alignItems: 'center',
        marginTop: 20,
    },
    resendText: {
        fontSize: 13,
        color: '#7C7C82',
    },
    resendLink: {
        color: '#D6395B',
        fontWeight: '600',
    },
    checklistContainer: {
        marginBottom: 24,
        paddingHorizontal: 4,
    },
    checklistItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    checklistDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#555',
        marginRight: 10,
    },
    checklistText: {
        color: '#7C7C82',
        fontSize: 13,
    },
});