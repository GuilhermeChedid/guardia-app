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
    SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const logoGuardia = require('../../assets/imagens/logo_guardia.png');

export default function LoginScreen() {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    return (
        <SafeAreaView style={styles.screen}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.keyboardView}
            >
                <View style={styles.appContainer}>
                    <View style={styles.topSection}>
                        <View style={[styles.blob, styles.blob1]} />
                        <View style={[styles.blob, styles.blob2]} />

                        <View style={styles.logoContainer}>
                            <View style={styles.logoBox}>
                                <Image source={logoGuardia} style={styles.customLogo} resizeMode="contain" />
                            </View>
                            <Text style={styles.brandTitle}>Guardiã</Text>
                            <Text style={styles.brandSubtitle}>Sua segurança, sempre com você</Text>
                        </View>
                    </View>

                    <View style={styles.bottomSection}>
                        <Text style={styles.welcomeTitle}>Bem-vinda de volta</Text>
                        <Text style={styles.welcomeSubtitle}>Entre com sua conta para continuar</Text>

                        <View style={styles.form}>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>
                                    E-mail <Text style={styles.required}>*</Text>
                                </Text>
                                <View style={styles.inputContainer}>
                                    <Text style={styles.iconLeft}>✉</Text>
                                    <TextInput
                                        value={email}
                                        onChangeText={setEmail}
                                        placeholder="seu@email.com"
                                        placeholderTextColor="#555"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        style={styles.input}
                                    />
                                </View>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>
                                    Senha <Text style={styles.required}>*</Text>
                                </Text>
                                <View style={styles.inputContainer}>
                                    <Text style={styles.iconLeft}>🔒</Text>
                                    <TextInput
                                        value={password}
                                        onChangeText={setPassword}
                                        placeholder="••••••••"
                                        placeholderTextColor="#555"
                                        secureTextEntry={!showPassword}
                                        style={styles.input}
                                    />
                                    <Pressable onPress={() => setShowPassword((prev) => !prev)} style={styles.iconRight}>
                                        <Text style={styles.iconText}>{showPassword ? '🙈' : '👁️'}</Text>
                                    </Pressable>
                                </View>
                            </View>

                            <Pressable>
                                <Text style={styles.forgotPassword}>Esqueci minha senha</Text>
                            </Pressable>

                            <Pressable style={styles.btnPrimary}>
                                <Text style={styles.btnText}>Entrar</Text>
                            </Pressable>

                            <View style={styles.divider}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>ou</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            <Pressable onPress={() => navigation.navigate('Register')}>
                                <Text style={styles.registerText}>
                                    Não tem uma conta?{' '}
                                    <Text style={styles.registerLink}>Cadastre-se</Text>
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#000',
    },
    keyboardView: {
        flex: 1,
    },
    appContainer: {
        width: '100%',
        maxWidth: 414,
        alignSelf: 'center',
        backgroundColor: '#0B0B0C',
        flex: 1,
        overflow: 'hidden',
        boxShadow: '0 0 50px rgba(0,0,0,0.5)',
    },
    topSection: {
        backgroundColor: '#4A1224',
        height: '38%',
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    blob: {
        position: 'absolute',
        borderRadius: 999,
        backgroundColor: 'rgba(166, 43, 79, 0.4)',
        filter: 'blur(25px)',
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
        backgroundColor: 'rgba(133, 22, 50, 0.6)',
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
        backgroundColor: 'transparent',
        marginBottom: 16,
    },
    customLogo: {
        width: 48,
        height: 48,
    },
    brandTitle: {
        fontFamily: 'serif',
        fontSize: 32,
        fontWeight: '600',
        color: '#FFF',
        letterSpacing: 0.5,
        marginBottom: 6,
    },
    brandSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.65)',
        fontWeight: '400',
    },
    bottomSection: {
        backgroundColor: '#0B0B0C',
        paddingHorizontal: 24,
        paddingTop: 36,
        paddingBottom: 24,
        flex: 1,
    },
    welcomeTitle: {
        fontFamily: 'serif',
        fontSize: 22,
        fontWeight: '600',
        color: '#FFF',
        marginBottom: 6,
    },
    welcomeSubtitle: {
        fontSize: 14,
        color: '#7C7C82',
        marginBottom: 32,
    },
    form: {
        flex: 1,
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
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#171719',
        borderRadius: 12,
        height: 52,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    iconLeft: {
        position: 'absolute',
        left: 16,
        fontSize: 16,
        color: '#666',
        zIndex: 1,
    },
    iconRight: {
        position: 'absolute',
        right: 16,
        zIndex: 1,
    },
    iconText: {
        fontSize: 16,
        color: '#666',
    },
    input: {
        flex: 1,
        height: '100%',
        color: '#FFF',
        fontSize: 14,
        paddingLeft: 46,
        paddingRight: 46,
        fontFamily: 'System',
    },
    forgotPassword: {
        color: '#D6395B',
        fontSize: 13,
        textAlign: 'right',
        fontWeight: '500',
        marginTop: -6,
        marginBottom: 32,
    },
    btnPrimary: {
        backgroundColor: '#A62B4F',
        borderRadius: 14,
        height: 54,
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 8px 30px rgba(166, 43, 79, 0.3)',
        marginBottom: 20,
    },
    btnText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '600',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#1F1F22',
    },
    dividerText: {
        fontSize: 12,
        color: '#7C7C82',
        marginHorizontal: 12,
        textTransform: 'lowercase',
    },
    registerText: {
        textAlign: 'center',
        color: '#7C7C82',
        fontSize: 13,
    },
    registerLink: {
        color: '#D6395B',
        fontWeight: '600',
    },
});
