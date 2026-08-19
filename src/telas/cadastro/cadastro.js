import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    Image,
    ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import MobileFrame from '../../components/MobileFrame/MobileFrame';

const logoGuardia = require('../../assets/imagens/logo_guardia.png');

export default function CadastroScreen() {
    const navigation = useNavigation();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <MobileFrame backgroundColor="#0B0B0C">
            <ScrollView style={styles.appContainer} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.backArrow}>‹</Text>
                    </Pressable>

                    <View style={styles.headerText}>
                        <Text style={styles.headerTitle}>Criar conta</Text>
                        <Text style={styles.headerSubtitle}>Preencha seus dados para continuar</Text>
                    </View>

                    <View style={styles.logoBox}>
                        <Image source={logoGuardia} style={styles.customLogo} resizeMode="contain" />
                    </View>
                </View>

                <View style={styles.formWrap}>
                    <Section title="DADOS PESSOAIS" />

                    <InputRow label="Nome completo" placeholder="Maria Clara Santos" icon="👤" />
                    <InputRow label="CPF" placeholder="000.000.000-00" icon="🪪" />
                    <InputRow label="Estado civil" placeholder="Selecione" icon="❤" right="⌄" />
                    <InputRow label="Telefone" placeholder="(11) 99999-0000" icon="📞" />
                    <InputRow label="Endereco completo" placeholder="Rua das Flores, 123 — Sao Paulo/SP" icon="📍" />

                    <Section title="ACESSO" />

                    <InputRow label="E-mail" placeholder="seu@email.com" icon="✉" />

                    <View style={styles.group}>
                        <Text style={styles.label}>Senha <Text style={styles.required}>*</Text></Text>
                        <View style={styles.inputWrap}>
                            <Text style={styles.iconLeft}>🔒</Text>
                            <TextInput
                                style={styles.input}
                                secureTextEntry={!showPassword}
                                placeholder="Crie uma senha segura"
                                placeholderTextColor="#555"
                            />
                            <Pressable style={styles.iconRight} onPress={() => setShowPassword((prev) => !prev)}>
                                <Text>{showPassword ? '🙈' : '👁️'}</Text>
                            </Pressable>
                        </View>
                        <View style={styles.rules}>
                            <Text style={styles.rule}>• Minimo 8 caracteres</Text>
                            <Text style={styles.rule}>• 1 letra maiuscula</Text>
                            <Text style={styles.rule}>• 1 letra minuscula</Text>
                            <Text style={styles.rule}>• 1 numero</Text>
                            <Text style={styles.rule}>• 1 caractere especial (!@#$%&*_-)</Text>
                        </View>
                    </View>

                    <View style={styles.group}>
                        <Text style={styles.label}>Confirmacao da senha <Text style={styles.required}>*</Text></Text>
                        <View style={styles.inputWrap}>
                            <Text style={styles.iconLeft}>🔒</Text>
                            <TextInput
                                style={styles.input}
                                secureTextEntry={!showConfirmPassword}
                                placeholder="Repita sua senha"
                                placeholderTextColor="#555"
                            />
                            <Pressable style={styles.iconRight} onPress={() => setShowConfirmPassword((prev) => !prev)}>
                                <Text>{showConfirmPassword ? '🙈' : '👁️'}</Text>
                            </Pressable>
                        </View>
                    </View>

                    <Text style={styles.terms}>Ao cadastrar, voce concorda com nossos <Text style={styles.termsLink}>Termos de Uso</Text></Text>

                    <Pressable style={styles.submitButton}>
                        <Text style={styles.submitText}>Criar minha conta</Text>
                    </Pressable>

                    <Pressable onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.loginLink}>Ja tem uma conta? <Text style={styles.loginLinkAccent}>Entrar</Text></Text>
                    </Pressable>
                </View>
            </ScrollView>
        </MobileFrame>
    );
}

function Section({ title }) {
    return (
        <View style={styles.sectionDivider}>
            <View style={styles.sectionLine} />
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.sectionLine} />
        </View>
    );
}

function InputRow({ label, placeholder, icon, right }) {
    return (
        <View style={styles.group}>
            <Text style={styles.label}>{label} <Text style={styles.required}>*</Text></Text>
            <View style={styles.inputWrap}>
                <Text style={styles.iconLeft}>{icon}</Text>
                <TextInput style={styles.input} placeholder={placeholder} placeholderTextColor="#555" />
                {right ? <Text style={styles.iconRight}>{right}</Text> : null}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    appContainer: {
        flex: 1,
        backgroundColor: '#0B0B0C',
    },
    content: {
        paddingBottom: 40,
    },
    header: {
        backgroundColor: '#5B1B2C',
        paddingHorizontal: 24,
        paddingTop: 30,
        paddingBottom: 20,
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
    backArrow: {
        color: '#FFFFFF',
        fontSize: 24,
        lineHeight: 24,
        marginTop: -2,
    },
    headerText: {
        flex: 1,
        marginHorizontal: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
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
    },
    customLogo: {
        width: 48,
        height: 48,
    },
    formWrap: {
        paddingHorizontal: 24,
    },
    sectionDivider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 20,
    },
    sectionLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#1F1F22',
    },
    sectionTitle: {
        paddingHorizontal: 12,
        color: '#555',
        fontSize: 10,
        letterSpacing: 1,
        fontWeight: '600',
    },
    group: {
        marginBottom: 18,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#EAEAEA',
        marginBottom: 8,
    },
    required: {
        color: '#D6395B',
    },
    inputWrap: {
        height: 52,
        borderRadius: 12,
        backgroundColor: '#171719',
        borderWidth: 1,
        borderColor: 'transparent',
        justifyContent: 'center',
    },
    iconLeft: {
        position: 'absolute',
        left: 16,
        color: '#555',
        fontSize: 16,
    },
    iconRight: {
        position: 'absolute',
        right: 16,
        color: '#555',
        fontSize: 14,
    },
    input: {
        height: 52,
        color: '#FFFFFF',
        paddingLeft: 46,
        paddingRight: 46,
        fontSize: 14,
    },
    rules: {
        marginTop: 12,
        paddingLeft: 4,
        gap: 4,
    },
    rule: {
        color: '#7C7C82',
        fontSize: 12,
    },
    terms: {
        marginTop: 6,
        marginBottom: 24,
        color: '#7C7C82',
        fontSize: 13,
        lineHeight: 20,
    },
    termsLink: {
        color: '#D6395B',
        fontWeight: '600',
    },
    submitButton: {
        backgroundColor: '#A62B4F',
        borderRadius: 14,
        height: 54,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    submitText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    loginLink: {
        textAlign: 'center',
        color: '#7C7C82',
        fontSize: 14,
        marginBottom: 10,
    },
    loginLinkAccent: {
        color: '#D6395B',
        fontWeight: '600',
    },
});
