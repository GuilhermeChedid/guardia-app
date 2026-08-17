import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    Image,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const logoGuardia = require('../../assets/imagens/logo_guardia.png');

export default function CadastroScreen() {
    const navigation = useNavigation();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <SafeAreaView style={styles.screen}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.appContainer}>
                    <View style={styles.header}>
                        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
                            <Text style={styles.backButtonText}>‹</Text>
                        </Pressable>

                        <View style={styles.headerText}>
                            <Text style={styles.headerTitle}>Criar conta</Text>
                            <Text style={styles.headerSubtitle}>Preencha seus dados para continuar</Text>
                        </View>

                        <View style={styles.logoBox}>
                            <Image source={logoGuardia} style={styles.customLogo} resizeMode="contain" />
                        </View>
                    </View>

                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.form}>
                            <View style={styles.sectionDivider}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.sectionText}>DADOS PESSOAIS</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>
                                    Nome completo <Text style={styles.required}>*</Text>
                                </Text>
                                <View style={styles.inputWrapper}>
                                    <Text style={styles.iconLeft}>👤</Text>
                                    <TextInput placeholder="Maria Clara Santos" placeholderTextColor="#555" style={styles.input} />
                                </View>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>
                                    CPF <Text style={styles.required}>*</Text>
                                </Text>
                                <View style={styles.inputWrapper}>
                                    <Text style={styles.iconLeft}>🪪</Text>
                                    <TextInput placeholder="000.000.000-00" placeholderTextColor="#555" style={styles.input} keyboardType="numeric" />
                                </View>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>
                                    Estado civil <Text style={styles.required}>*</Text>
                                </Text>
                                <View style={styles.inputWrapper}>
                                    <Text style={styles.iconLeft}>❤</Text>
                                    <TextInput placeholder="Selecione" placeholderTextColor="#555" style={styles.input} />
                                    <Text style={styles.iconRight}>⌄</Text>
                                </View>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>
                                    Telefone <Text style={styles.required}>*</Text>
                                </Text>
                                <View style={styles.inputWrapper}>
                                    <Text style={styles.iconLeft}>📞</Text>
                                    <TextInput placeholder="(11) 99999-0000" placeholderTextColor="#555" style={styles.input} keyboardType="phone-pad" />
                                </View>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>
                                    Endereço completo <Text style={styles.required}>*</Text>
                                </Text>
                                <View style={styles.inputWrapper}>
                                    <Text style={styles.iconLeft}>📍</Text>
                                    <TextInput placeholder="Rua das Flores, 123 — São Paulo/SP" placeholderTextColor="#555" style={styles.input} />
                                </View>
                            </View>

                            <View style={styles.sectionDivider}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.sectionText}>ACESSO</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>
                                    E-mail <Text style={styles.required}>*</Text>
                                </Text>
                                <View style={styles.inputWrapper}>
                                    <Text style={styles.iconLeft}>✉</Text>
                                    <TextInput placeholder="seu@email.com" placeholderTextColor="#555" style={styles.input} keyboardType="email-address" autoCapitalize="none" />
                                </View>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>
                                    Senha <Text style={styles.required}>*</Text>
                                </Text>
                                <View style={styles.inputWrapper}>
                                    <Text style={styles.iconLeft}>🔒</Text>
                                    <TextInput
                                        placeholder="Crie uma senha segura"
                                        placeholderTextColor="#555"
                                        secureTextEntry={!showPassword}
                                        style={styles.input}
                                    />
                                    <Pressable style={styles.iconRight} onPress={() => setShowPassword((prev) => !prev)}>
                                        <Text style={styles.iconText}>{showPassword ? '🙈' : '👁️'}</Text>
                                    </Pressable>
                                </View>

                                <View style={styles.passwordRules}>
                                    <Text style={styles.rule}>• Mínimo 8 caracteres</Text>
                                    <Text style={styles.rule}>• 1 letra maiúscula</Text>
                                    <Text style={styles.rule}>• 1 letra minúscula</Text>
                                    <Text style={styles.rule}>• 1 número</Text>
                                    <Text style={styles.rule}>• 1 caractere especial (!@#$%&*_-)</Text>
                                </View>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>
                                    Confirmação da senha <Text style={styles.required}>*</Text>
                                </Text>
                                <View style={styles.inputWrapper}>
                                    <Text style={styles.iconLeft}>🔒</Text>
                                    <TextInput
                                        placeholder="Repita sua senha"
                                        placeholderTextColor="#555"
                                        secureTextEntry={!showConfirmPassword}
                                        style={styles.input}
                                    />
                                    <Pressable style={styles.iconRight} onPress={() => setShowConfirmPassword((prev) => !prev)}>
                                        <Text style={styles.iconText}>{showConfirmPassword ? '🙈' : '👁️'}</Text>
                                    </Pressable>
                                </View>
                            </View>

                            <Text style={styles.termsText}>
                                Ao cadastrar, você concorda com nossos{' '}
                                <Text style={styles.termsLink}>Termos de Uso</Text>
                            </Text>

                            <Pressable style={styles.btnSubmit}>
                                <Text style={styles.btnText}>Criar minha conta</Text>
                            </Pressable>

                            <Text style={styles.loginLink}>
                                Já tem uma conta? <Text style={styles.loginLinkAccent}>Entrar</Text>
                            </Text>
                        </View>
                    </ScrollView>
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
        maxWidth: 414,
        width: '100%',
        alignSelf: 'center',
        backgroundColor: '#0B0B0C',
        flex: 1,
        overflow: 'hidden',
        boxShadow: '0 0 50px rgba(0,0,0,0.5)',
    },
    header: {
        backgroundColor: '#5B1B2C',
        paddingVertical: 30,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButtonText: {
        color: '#FFF',
        fontSize: 24,
        lineHeight: 24,
        marginTop: -2,
    },
    headerText: {
        flex: 1,
        marginHorizontal: 16,
    },
    headerTitle: {
        fontFamily: 'serif',
        fontSize: 20,
        fontWeight: '600',
        color: '#FFF',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
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
    },
    customLogo: {
        width: 48,
        height: 48,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 40,
    },
    form: {
        paddingHorizontal: 24,
    },
    sectionDivider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#1F1F22',
    },
    sectionText: {
        paddingHorizontal: 12,
        fontSize: 10,
        color: '#555',
        fontWeight: '600',
        letterSpacing: 1,
    },
    formGroup: {
        marginBottom: 18,
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
    inputWrapper: {
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
        color: '#555',
        zIndex: 1,
    },
    iconRight: {
        position: 'absolute',
        right: 16,
        zIndex: 1,
    },
    iconText: {
        fontSize: 14,
        color: '#555',
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
    passwordRules: {
        marginTop: 12,
    },
    rule: {
        color: '#666',
        fontSize: 11,
        marginBottom: 6,
    },
    termsText: {
        marginTop: 32,
        marginBottom: 20,
        color: '#666',
        textAlign: 'center',
        fontSize: 12,
    },
    termsLink: {
        color: '#A62B4F',
        fontWeight: '600',
    },
    btnSubmit: {
        width: '100%',
        backgroundColor: '#9E2648',
        borderRadius: 14,
        height: 54,
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 4px 30px rgba(166, 43, 79, 0.4)',
        marginBottom: 24,
    },
    btnText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '600',
    },
    loginLink: {
        color: '#666',
        textAlign: 'center',
        fontSize: 13,
        marginBottom: 12,
    },
    loginLinkAccent: {
        color: '#A62B4F',
        fontWeight: '600',
    },
});
