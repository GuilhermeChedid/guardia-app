import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    ScrollView,
    Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import MobileFrame from '../../components/MobileFrame/MobileFrame';

export default function CadastroScreen() {
    const navigation = useNavigation();

    // Injeta estilo moderno e discreto para a barra de rolagem no navegador (Web)
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

    // Form states
    const [name, setName] = useState('');
    const [cpf, setCpf] = useState('');
    const [maritalStatus, setMaritalStatus] = useState('');
    const [phone, setPhone] = useState('');
    const [cep, setCep] = useState('');
    const [street, setStreet] = useState('');
    const [number, setNumber] = useState('');
    const [complement, setComplement] = useState('');
    const [neighborhood, setNeighborhood] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <MobileFrame backgroundColor="#0B0B0C">
            <View style={styles.screen}>
                <ScrollView
                    style={styles.scrollContainer}
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={true}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.header}>
                        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
                            <Text style={styles.backArrow}>‹</Text>
                        </Pressable>

                        <View style={styles.headerText}>
                            <Text style={styles.headerTitle}>Criar conta</Text>
                            <Text style={styles.headerSubtitle}>Preencha seus dados para continuar</Text>
                        </View>

                        <View style={styles.logoBox}>
                            <MaterialCommunityIcons name="shield-outline" size={24} color="#FFFFFF" />
                        </View>
                    </View>

                    <View style={styles.formWrap}>
                        <Section title="DADOS PESSOAIS" />

                        <InputRow
                            label="Nome completo"
                            placeholder="Maria Clara Santos"
                            icon="👤"
                            value={name}
                            onChangeText={setName}
                        />
                        <InputRow
                            label="CPF"
                            placeholder="000.000.000-00"
                            icon="🪪"
                            value={cpf}
                            onChangeText={setCpf}
                            keyboardType="numeric"
                        />
                        <InputRow
                            label="Estado civil"
                            placeholder="Selecione"
                            icon="❤"
                            right="⌄"
                            value={maritalStatus}
                            onChangeText={setMaritalStatus}
                        />
                        <InputRow
                            label="Telefone"
                            placeholder="(11) 99999-0000"
                            icon="📞"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                        />

                        <Section title="ENDEREÇO" />

                        <InputRow
                            label="CEP"
                            placeholder="00000-000"
                            icon="📍"
                            value={cep}
                            onChangeText={setCep}
                            keyboardType="numeric"
                        />
                        <InputRow
                            label="Logradouro"
                            placeholder="Rua, Avenida, Travessa..."
                            icon="📍"
                            value={street}
                            onChangeText={setStreet}
                        />

                        <View style={styles.rowFields}>
                            <View style={styles.halfGroup}>
                                <Text style={styles.label}>Número <Text style={styles.required}>*</Text></Text>
                                <View style={styles.inputWrap}>
                                    <Text style={styles.iconLeft}>📍</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nº"
                                        placeholderTextColor="#555"
                                        value={number}
                                        onChangeText={setNumber}
                                    />
                                </View>
                            </View>
                            <View style={styles.halfGroup}>
                                <Text style={styles.label}>Complemento</Text>
                                <View style={styles.inputWrap}>
                                    <Text style={styles.iconLeft}>📍</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Apto, sala..."
                                        placeholderTextColor="#555"
                                        value={complement}
                                        onChangeText={setComplement}
                                    />
                                </View>
                            </View>
                        </View>

                        <InputRow
                            label="Bairro"
                            placeholder="Bairro"
                            icon="📍"
                            value={neighborhood}
                            onChangeText={setNeighborhood}
                        />

                        <View style={styles.rowFields}>
                            <View style={styles.cityGroup}>
                                <Text style={styles.label}>Cidade <Text style={styles.required}>*</Text></Text>
                                <View style={styles.inputWrap}>
                                    <Text style={styles.iconLeft}>📍</Text>
                                    <TextInput
                                        style={[styles.input, { paddingRight: 30 }]}
                                        placeholder="Selecione"
                                        placeholderTextColor="#555"
                                        value={city}
                                        onChangeText={setCity}
                                    />
                                    <Text style={styles.iconRight}>⌄</Text>
                                </View>
                            </View>
                            <View style={styles.stateGroup}>
                                <Text style={styles.label}>Estado <Text style={styles.required}>*</Text></Text>
                                <View style={styles.inputWrap}>
                                    <TextInput
                                        style={[styles.input, { paddingLeft: 16 }]}
                                        placeholder="UF"
                                        placeholderTextColor="#555"
                                        value={state}
                                        onChangeText={setState}
                                        maxLength={2}
                                    />
                                </View>
                            </View>
                        </View>

                        <Section title="ACESSO" />

                        <InputRow
                            label="E-mail"
                            placeholder="seu@email.com"
                            icon="✉"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                        />

                        <View style={styles.group}>
                            <Text style={styles.label}>Senha <Text style={styles.required}>*</Text></Text>
                            <View style={styles.inputWrap}>
                                <Text style={styles.iconLeft}>🔒</Text>
                                <TextInput
                                    style={styles.input}
                                    secureTextEntry={!showPassword}
                                    placeholder="Crie uma senha segura"
                                    placeholderTextColor="#555"
                                    value={password}
                                    onChangeText={setPassword}
                                />
                                <Pressable style={styles.iconRightPressable} onPress={() => setShowPassword((prev) => !prev)}>
                                    <Text>{showPassword ? '🙈' : '👁️'}</Text>
                                </Pressable>
                            </View>
                            <View style={styles.rules}>
                                <Text style={styles.rule}>• Mínimo 8 caracteres</Text>
                                <Text style={styles.rule}>• 1 letra maiúscula</Text>
                                <Text style={styles.rule}>• 1 letra minúscula</Text>
                                <Text style={styles.rule}>• 1 número</Text>
                                <Text style={styles.rule}>• 1 caractere especial (!@#$%&*_-)</Text>
                            </View>
                        </View>

                        <View style={styles.group}>
                            <Text style={styles.label}>Confirmação da senha <Text style={styles.required}>*</Text></Text>
                            <View style={styles.inputWrap}>
                                <Text style={styles.iconLeft}>🔒</Text>
                                <TextInput
                                    style={styles.input}
                                    secureTextEntry={!showConfirmPassword}
                                    placeholder="Repita sua senha"
                                    placeholderTextColor="#555"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                />
                                <Pressable style={styles.iconRightPressable} onPress={() => setShowConfirmPassword((prev) => !prev)}>
                                    <Text>{showConfirmPassword ? '🙈' : '👁️'}</Text>
                                </Pressable>
                            </View>
                        </View>

                        <Section title="PIN DE PROVAS" />

                        <View style={styles.pinInfoBox}>
                            <MaterialCommunityIcons name="lock-outline" size={16} color="#D6395B" style={styles.pinInfoIcon} />
                            <Text style={styles.pinInfoText}>
                                Este PIN de <Text style={styles.boldText}>4 dígitos</Text> protege o acesso à sua área de evidências. Guarde-o com segurança.
                            </Text>
                        </View>

                        <View style={styles.group}>
                            <Text style={styles.label}>PIN de acesso às provas <Text style={styles.required}>*</Text></Text>
                            <View style={styles.inputWrap}>
                                <Text style={styles.iconLeft}>🔒</Text>
                                <TextInput
                                    style={styles.input}
                                    secureTextEntry
                                    placeholder="4 dígitos"
                                    placeholderTextColor="#555"
                                    keyboardType="numeric"
                                    maxLength={4}
                                    value={pin}
                                    onChangeText={setPin}
                                />
                            </View>
                        </View>

                        <View style={styles.group}>
                            <Text style={styles.label}>Confirmar PIN <Text style={styles.required}>*</Text></Text>
                            <View style={styles.inputWrap}>
                                <Text style={styles.iconLeft}>🔒</Text>
                                <TextInput
                                    style={styles.input}
                                    secureTextEntry
                                    placeholder="Repito o PIN"
                                    placeholderTextColor="#555"
                                    keyboardType="numeric"
                                    maxLength={4}
                                    value={confirmPin}
                                    onChangeText={setConfirmPin}
                                />
                            </View>
                        </View>

                        <Text style={styles.terms}>Ao cadastrar, você concorda com nossos <Text style={styles.termsLink}>Termos de Uso</Text></Text>

                        <Pressable style={styles.submitButton}>
                            <Text style={styles.submitText}>Criar minha conta</Text>
                        </Pressable>

                        <Pressable onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.loginLink}>Já tem uma conta? <Text style={styles.loginLinkAccent}>Entrar</Text></Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </View>
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

function InputRow({ label, placeholder, icon, right, value, onChangeText, keyboardType, maxLength }) {
    return (
        <View style={styles.group}>
            <Text style={styles.label}>{label} <Text style={styles.required}>*</Text></Text>
            <View style={styles.inputWrap}>
                <Text style={styles.iconLeft}>{icon}</Text>
                <TextInput
                    style={[styles.input, right ? { paddingRight: 36 } : null]}
                    placeholder={placeholder}
                    placeholderTextColor="#555"
                    value={value}
                    onChangeText={onChangeText}
                    keyboardType={keyboardType}
                    maxLength={maxLength}
                />
                {right ? <Text style={styles.iconRight}>{right}</Text> : null}
            </View>
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
        backgroundColor: '#0B0B0C',
    },
    scrollContainer: {
        flex: 1,
    },
    content: {
        flexGrow: 1,
        paddingBottom: 100,
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
        width: 44,
        height: 44,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        borderRadius: 14,
        backgroundColor: 'rgba(0,0,0,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
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
    rowFields: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 18,
    },
    halfGroup: {
        flex: 1,
        marginBottom: 0,
    },
    cityGroup: {
        flex: 2,
        marginBottom: 0,
    },
    stateGroup: {
        flex: 1,
        marginBottom: 0,
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
    iconRightPressable: {
        position: 'absolute',
        right: 16,
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
    },
    input: {
        height: 52,
        color: '#FFFFFF',
        paddingLeft: 46,
        paddingRight: 46,
        fontSize: 14,
    },
    pinInfoBox: {
        backgroundColor: 'rgba(91, 27, 44, 0.25)',
        borderWidth: 1,
        borderColor: 'rgba(214, 57, 91, 0.3)',
        borderRadius: 12,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
    },
    pinInfoIcon: {
        marginRight: 10,
    },
    pinInfoText: {
        flex: 1,
        color: '#C0C0C5',
        fontSize: 12,
        lineHeight: 18,
    },
    boldText: {
        fontWeight: '700',
        color: '#EAEAEA',
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