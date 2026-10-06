import React, { useState, useEffect } from 'react';
import api from '../../services/api';

import {
    View,
    Text,
    TextInput,
    Pressable,
    Modal,
    StyleSheet,
    ScrollView,
    Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import MobileFrame from '../../components/MobileFrame/MobileFrame';
import { useTheme } from '../../context/ThemeContext';
import { MARITAL_STATUS_OPTIONS } from '../../constants/profileOptions';

const BRAZILIAN_STATES = [
    ['AC', 'Acre'], ['AL', 'Alagoas'], ['AP', 'Amapá'], ['AM', 'Amazonas'],
    ['BA', 'Bahia'], ['CE', 'Ceará'], ['DF', 'Distrito Federal'], ['ES', 'Espírito Santo'],
    ['GO', 'Goiás'], ['MA', 'Maranhão'], ['MT', 'Mato Grosso'], ['MS', 'Mato Grosso do Sul'],
    ['MG', 'Minas Gerais'], ['PA', 'Pará'], ['PB', 'Paraíba'], ['PR', 'Paraná'],
    ['PE', 'Pernambuco'], ['PI', 'Piauí'], ['RJ', 'Rio de Janeiro'], ['RN', 'Rio Grande do Norte'],
    ['RS', 'Rio Grande do Sul'], ['RO', 'Rondônia'], ['RR', 'Roraima'], ['SC', 'Santa Catarina'],
    ['SP', 'São Paulo'], ['SE', 'Sergipe'], ['TO', 'Tocantins'],
];

export default function CadastroScreen() {
    const navigation = useNavigation();
    const { colors } = useTheme();

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
    const [loading, setLoading] = useState(false);
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
    const [isStatePickerVisible, setStatePickerVisible] = useState(false);
    const [isMaritalPickerVisible, setMaritalPickerVisible] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleRegister = async () => {

    if (!termsAccepted) {
    alert('É necessário aceitar os Termos de Uso.');
    return;
    }    
    if (password !== confirmPassword) {
        alert('As senhas não coincidem.');
        return;
    }

    if (pin !== confirmPin) {
        alert('Os PINs não coincidem.');
        return;
    }

    if (pin.length !== 4) {
        alert('O PIN deve ter 4 dígitos.');
        return;
    }

    try {
        setLoading(true);

        const response = await api.post('/auth/register', {
            nome: name,
            cpf: cpf.replace(/\D/g, ''),
            estado_civil: maritalStatus,
            telefone: phone.replace(/\D/g, ''),
            email: email.trim(),
            senha: password,
            pin_provas: pin,
            cep: cep.replace(/\D/g, ''),
            logradouro: street,
            numero: number,
            complemento: complement,
            bairro: neighborhood,
            cidade: city,
            estado_uf: state,
            termos_aceitos: termsAccepted,
        });

        alert(response.data.message || 'Cadastro realizado com sucesso!');

        navigation.navigate('Login');
    } catch (error) {
        console.error('Erro no cadastro:', error);

        const message =
            error.response?.data?.message ||
            'Não foi possível realizar o cadastro.';

        alert(message);
    } finally {
        setLoading(false);
    }
};

    return (
        <MobileFrame backgroundColor="#0B0B0C">
            <View style={[styles.screen, { backgroundColor: colors.background }]}>
                <ScrollView
                    style={styles.scrollContainer}
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={true}
                    keyboardShouldPersistTaps="handled"
                    automaticallyAdjustKeyboardInsets
                >
                    <View style={styles.header}>
                        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
                            <MaterialCommunityIcons name="chevron-left" size={24} color="#8B8B93" />
                        </Pressable>

                        <View style={styles.headerText}>
                            <Text style={styles.headerTitle}>Criar conta</Text>
                            <Text style={styles.headerSubtitle}>Preencha seus dados para continuar</Text>
                        </View>

                        <View style={styles.logoBox}>
                            <MaterialCommunityIcons name="shield-outline" size={24} color="#8B8B93" />
                        </View>
                    </View>

                    <View style={styles.formWrap}>
                        <Section title="DADOS PESSOAIS" />

                        <InputRow
                            label="Nome completo"
                            placeholder="Maria Clara Santos"
                            icon="account-outline"
                            value={name}
                            onChangeText={setName}
                        />
                        <InputRow
                            label="CPF"
                            placeholder="000.000.000-00"
                            icon="card-account-details-outline"
                            value={cpf}
                            onChangeText={setCpf}
                            keyboardType="numeric"
                        />
                        <View style={styles.group}>
                            <Text style={styles.label}>Estado civil <Text style={styles.required}>*</Text></Text>
                            <Pressable style={styles.inputWrap} onPress={() => setMaritalPickerVisible(true)}>
                                <MaterialCommunityIcons name="heart-outline" size={18} color="#8B8B93" style={styles.iconLeft} />
                                <Text style={[styles.input, { color: maritalStatus ? colors.text : colors.muted }]}>
                                    {maritalStatus || 'Selecione'}
                                </Text>
                                <MaterialCommunityIcons name="chevron-down" size={18} color="#8B8B93" style={styles.iconRight} />
                            </Pressable>
                        </View>
                        <InputRow
                            label="Telefone"
                            placeholder="(11) 99999-0000"
                            icon="phone-outline"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                        />

                        <Section title="ENDEREÇO" />

                        <InputRow
                            label="CEP"
                            placeholder="00000-000"
                            icon="map-marker-outline"
                            value={cep}
                            onChangeText={setCep}
                            keyboardType="numeric"
                        />
                        <InputRow
                            label="Logradouro"
                            placeholder="Rua, Avenida, Travessa..."
                            icon="map-marker-outline"
                            value={street}
                            onChangeText={setStreet}
                        />

                        <View style={styles.rowFields}>
                            <View style={styles.halfGroup}>
                                <Text style={styles.label}>Número <Text style={styles.required}>*</Text></Text>
                                <View style={styles.inputWrap}>
                                    <MaterialCommunityIcons name="map-marker-outline" size={18} color="#8B8B93" style={styles.iconLeft} />
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
                                    <MaterialCommunityIcons name="map-marker-outline" size={18} color="#8B8B93" style={styles.iconLeft} />
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
                            icon="map-marker-outline"
                            value={neighborhood}
                            onChangeText={setNeighborhood}
                        />

                        <View style={styles.rowFields}>
                            <View style={styles.cityGroup}>
                                <Text style={styles.label}>Cidade <Text style={styles.required}>*</Text></Text>
                                <View style={styles.inputWrap}>
                                    <MaterialCommunityIcons name="map-marker-outline" size={18} color="#8B8B93" style={styles.iconLeft} />
                                    <TextInput
                                        style={[styles.input, { paddingRight: 30 }]}
                                        placeholder="Selecione"
                                        placeholderTextColor="#555"
                                        value={city}
                                        onChangeText={setCity}
                                    />
                                    <MaterialCommunityIcons name="chevron-down" size={18} color="#8B8B93" style={styles.iconRight} />
                                </View>
                            </View>
                            <View style={styles.stateGroup}>
                                <Text style={styles.label}>Estado <Text style={styles.required}>*</Text></Text>
                                <Pressable style={styles.inputWrap} onPress={() => setStatePickerVisible(true)}>
                                    <Text style={[styles.input, styles.stateValue, { color: state ? colors.text : colors.muted }]}>
                                        {state || 'UF'}
                                    </Text>
                                    <MaterialCommunityIcons name="chevron-down" size={18} color="#8B8B93" style={styles.iconRight} />
                                </Pressable>
                            </View>
                        </View>

                        <Section title="ACESSO" />

                        <InputRow
                            label="E-mail"
                            placeholder="seu@email.com"
                            icon="email-outline"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                        />

                        <View style={styles.group}>
                            <Text style={styles.label}>Senha <Text style={styles.required}>*</Text></Text>
                            <View style={styles.inputWrap}>
                                <MaterialCommunityIcons name="lock-outline" size={18} color="#8B8B93" style={styles.iconLeft} />
                                <TextInput
                                    style={styles.input}
                                    secureTextEntry={!showPassword}
                                    placeholder="Crie uma senha segura"
                                    placeholderTextColor="#555"
                                    value={password}
                                    onChangeText={setPassword}
                                />
                                <Pressable style={styles.iconRightPressable} onPress={() => setShowPassword((prev) => !prev)}>
                                    <MaterialCommunityIcons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={19} color="#8B8B93" />
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
                                <MaterialCommunityIcons name="lock-outline" size={18} color="#8B8B93" style={styles.iconLeft} />
                                <TextInput
                                    style={styles.input}
                                    secureTextEntry={!showConfirmPassword}
                                    placeholder="Repita sua senha"
                                    placeholderTextColor="#555"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                />
                                <Pressable style={styles.iconRightPressable} onPress={() => setShowConfirmPassword((prev) => !prev)}>
                                    <MaterialCommunityIcons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={19} color="#8B8B93" />
                                </Pressable>
                            </View>
                        </View>

                        <Section title="PIN DE PROVAS" />

                        <View style={styles.pinInfoBox}>
                            <MaterialCommunityIcons name="lock-outline" size={16} color="#8B8B93" style={styles.pinInfoIcon} />
                            <Text style={styles.pinInfoText}>
                                Este PIN de <Text style={styles.boldText}>4 dígitos</Text> protege o acesso à sua área de evidências. Guarde-o com segurança.
                            </Text>
                        </View>

                        <View style={styles.group}>
                            <Text style={styles.label}>PIN de acesso às provas <Text style={styles.required}>*</Text></Text>
                            <View style={styles.inputWrap}>
                                <MaterialCommunityIcons name="lock-outline" size={18} color="#8B8B93" style={styles.iconLeft} />
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
                                <MaterialCommunityIcons name="lock-outline" size={18} color="#8B8B93" style={styles.iconLeft} />
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

                        <Pressable
                            style={styles.termsRow}
                            onPress={() => setTermsAccepted((prev) => !prev)}
                        >
                            <View
                                style={[
                                    styles.checkbox,
                                    termsAccepted && styles.checkboxChecked,
                                ]}
                            >
                                {termsAccepted && (
                                    <MaterialCommunityIcons
                                        name="check"
                                        size={16}
                                        color="#FFFFFF"
                                    />
                                )}
                            </View>

                            <Text style={styles.terms}>
                                 Ao cadastar você concorda com a <Text style={styles.termsLink}>Política de Privacidade</Text>
                                {' '}*
                            </Text>
                        </Pressable>

                        <Pressable
                            style={styles.submitButton}
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            <Text style={styles.submitText}>
                                {loading ? 'Criando conta...' : 'Criar minha conta'}
                            </Text>
                        </Pressable>

                        <Pressable onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.loginLink}>Já tem uma conta? <Text style={styles.loginLinkAccent}>Entrar</Text></Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </View>

            <Modal
                visible={isStatePickerVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setStatePickerVisible(false)}
            >
                <View style={styles.stateModalOverlay}>
                    <View style={[styles.stateModal, { backgroundColor: colors.surface }]}>
                        <View style={styles.stateModalHeader}>
                            <Text style={[styles.stateModalTitle, { color: colors.text }]}>Selecione o estado</Text>
                            <Pressable onPress={() => setStatePickerVisible(false)}>
                                <MaterialCommunityIcons name="close" size={22} color={colors.muted} />
                            </Pressable>
                        </View>
                        <ScrollView showsVerticalScrollIndicator keyboardShouldPersistTaps="handled">
                            {BRAZILIAN_STATES.map(([uf, stateName]) => (
                                <Pressable
                                    key={uf}
                                    style={[styles.stateOption, state === uf && styles.stateOptionActive]}
                                    onPress={() => {
                                        setState(uf);
                                        setStatePickerVisible(false);
                                    }}
                                >
                                    <Text style={[styles.stateUf, { color: colors.text }]}>{uf}</Text>
                                    <Text style={[styles.stateName, { color: colors.muted }]}>{stateName}</Text>
                                    {state === uf && <MaterialCommunityIcons name="check" size={18} color="#C83C59" />}
                                </Pressable>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={isMaritalPickerVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setMaritalPickerVisible(false)}
            >
                <View style={styles.stateModalOverlay}>
                    <View style={[styles.stateModal, { backgroundColor: colors.surface }]}>
                        <View style={styles.stateModalHeader}>
                            <Text style={[styles.stateModalTitle, { color: colors.text }]}>Estado civil</Text>
                            <Pressable onPress={() => setMaritalPickerVisible(false)}>
                                <MaterialCommunityIcons name="close" size={22} color={colors.muted} />
                            </Pressable>
                        </View>
                        {MARITAL_STATUS_OPTIONS.map((option) => (
                            <Pressable
                                key={option}
                                style={[styles.stateOption, maritalStatus === option && styles.stateOptionActive]}
                                onPress={() => {
                                    setMaritalStatus(option);
                                    setMaritalPickerVisible(false);
                                }}
                            >
                                <Text style={[styles.stateName, { color: colors.text }]}>{option}</Text>
                                {maritalStatus === option && <MaterialCommunityIcons name="check" size={18} color="#C83C59" />}
                            </Pressable>
                        ))}
                    </View>
                </View>
            </Modal>
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
                <MaterialCommunityIcons name={icon} size={18} color="#8B8B93" style={styles.iconLeft} />
                <TextInput
                    style={[styles.input, right ? { paddingRight: 36 } : null]}
                    placeholder={placeholder}
                    placeholderTextColor="#555"
                    value={value}
                    onChangeText={onChangeText}
                    keyboardType={keyboardType}
                    maxLength={maxLength}
                />
                {right ? <MaterialCommunityIcons name={right} size={18} color="#8B8B93" style={styles.iconRight} /> : null}
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
    stateValue: {
        paddingLeft: 16,
        paddingTop: 15,
    },
    statePlaceholder: {
        color: '#555',
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
    stateModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    stateModal: {
        maxHeight: '78%',
        borderRadius: 18,
        padding: 18,
    },
    stateModalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    stateModalTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    stateOption: {
        minHeight: 46,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(127,127,127,0.18)',
        paddingVertical: 8,
    },
    stateOptionActive: {
        backgroundColor: 'rgba(200,60,89,0.08)',
    },
    stateUf: {
        width: 38,
        fontSize: 13,
        fontWeight: '700',
    },
    stateName: {
        flex: 1,
        fontSize: 14,
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
    termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 24,
    },

    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#555',
        backgroundColor: '#171719',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },

    checkboxChecked: {
        backgroundColor: '#A62B4F',
        borderColor: '#A62B4F',
    },

    terms: {
        flex: 1,
        color: '#7C7C82',
        fontSize: 13,
        lineHeight: 20,
    },

    termsLink: {
        color: '#D6395B',
        fontWeight: '600',
},
});