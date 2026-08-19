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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import MobileFrame from '../../components/MobileFrame/MobileFrame';

const logoGuardia = require('../../assets/imagens/logo_guardia.png');

export default function LoginScreen() {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    return (
        <MobileFrame backgroundColor="#0B0B0C">
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
                            <Text style={styles.brandTitle}>Guardia</Text>
                            <Text style={styles.brandSubtitle}>Sua seguranca, sempre com voce</Text>
                        </View>
                    </View>

                    <View style={styles.bottomSection}>
                        <Text style={styles.welcomeTitle}>Bem-vinda de volta</Text>
                        <Text style={styles.welcomeSubtitle}>Entre com sua conta para continuar</Text>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>E-mail <Text style={styles.required}>*</Text></Text>
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
                            <Text style={styles.label}>Senha <Text style={styles.required}>*</Text></Text>
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
                                    <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
                                </Pressable>
                            </View>
                        </View>

                        <Pressable style={styles.forgotWrap}>
                            <Text style={styles.forgotPassword}>Esqueci minha senha</Text>
                        </Pressable>

                        <Pressable style={styles.btnPrimary} onPress={() => navigation.navigate('Home')}>
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
                    </View>
                </View>
            </KeyboardAvoidingView>
        </MobileFrame>
    );
}

const styles = StyleSheet.create({
    keyboardView: {
        flex: 1,
    },
    appContainer: {
        flex: 1,
        backgroundColor: '#0B0B0C',
    },
    topSection: {
        backgroundColor: '#4A1224',
        minHeight: 280,
        height: '38%',
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
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
    },
    input: {
        height: 52,
        color: '#FFFFFF',
        paddingLeft: 46,
        paddingRight: 46,
        fontSize: 14,
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
});
