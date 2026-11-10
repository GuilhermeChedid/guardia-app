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
    Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Asset } from 'expo-asset';

import MobileFrame from '../../components/MobileFrame/MobileFrame';
import PdfModal from '../../components/PdfModal/PdfModal';
import { useTheme } from '../../context/ThemeContext';
import { MARITAL_STATUS_OPTIONS } from '../../constants/profileOptions';
import { MESSAGES } from '../../constants/messages';
import { cepMask, cpfMask, phoneMask } from '../../utils/masks';
import { isValidCPF, isValidCEP } from '../../utils/validators';
import FeedbackBanner from '../../components/FeedbackBanner/FeedbackBanner';

const TERMS_FILE = require('../../../assets/termos-de-uso.pdf');

const BRAZILIAN_STATES = [
    ['AC', 'Acre'], ['AL', 'Alagoas'], ['AP', 'Amapá'],
    ['AM', 'Amazonas'], ['BA', 'Bahia'], ['CE', 'Ceará'],
    ['DF', 'Distrito Federal'], ['ES', 'Espírito Santo'],
    ['GO', 'Goiás'], ['MA', 'Maranhão'], ['MT', 'Mato Grosso'],
    ['MS', 'Mato Grosso do Sul'], ['MG', 'Minas Gerais'],
    ['PA', 'Pará'], ['PB', 'Paraíba'], ['PR', 'Paraná'],
    ['PE', 'Pernambuco'], ['PI', 'Piauí'], ['RJ', 'Rio de Janeiro'],
    ['RN', 'Rio Grande do Norte'], ['RS', 'Rio Grande do Sul'],
    ['RO', 'Rondônia'], ['RR', 'Roraima'], ['SC', 'Santa Catarina'],
    ['SP', 'São Paulo'], ['SE', 'Sergipe'], ['TO', 'Tocantins'],
];

const LOCAL_MESSAGES = {
    INVALID_NAME:
        'Nome inválido. Informe pelo menos 3 caracteres, utilizando apenas letras e espaços.',
    INVALID_MARITAL_STATUS: 'Selecione um estado civil válido.',
    INVALID_STATE: 'Selecione um estado válido.',
    INVALID_PHONE: 'Informe um telefone válido.',
    INVALID_CEP: 'Informe um CEP válido.',
    CEP_NOT_FOUND: 'CEP não encontrado.',
    PASSWORD_MISMATCH: 'As senhas não coincidem.',
    PIN_INVALID: 'O PIN deve conter exatamente 4 números.',
    PIN_MISMATCH: 'Os PINs não coincidem.',
};

export default function CadastroScreen() {
    const navigation = useNavigation();
    const { colors } = useTheme();

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

    // Estados do formulário
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
    const [isTermsVisible, setTermsVisible] = useState(false);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');

    const [termsAccepted, setTermsAccepted] = useState(false);

    const [feedback, setFeedback] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});

    const feedbackTimer = React.useRef(null);
    const navigationTimer = React.useRef(null);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showPin, setShowPin] = useState(false);
    const [showConfirmPin, setShowConfirmPin] = useState(false);

    // Mensagens de feedback
    const showFeedback = (message, type = 'error') => {
        setFeedback({ message, type });

        clearTimeout(feedbackTimer.current);

        feedbackTimer.current = setTimeout(() => {
            setFeedback(null);
        }, 3500);
    };

    useEffect(() => {
        return () => {
            clearTimeout(feedbackTimer.current);
            clearTimeout(navigationTimer.current);
        };
    }, []);

    // Remove erro de um campo após sua correção
    const clearFieldError = (field) => {
        setFieldErrors((current) => {
            if (!current[field]) return current;

            const next = { ...current };
            delete next[field];

            return next;
        });
    };

    // Abre os Termos de Uso em PDF (dentro do app no celular, em outra aba na web)
    const openTerms = () => {
        if (Platform.OS === 'web') {
            Linking.openURL(Asset.fromModule(TERMS_FILE).uri);
            return;
        }

        setTermsVisible(true);
    };

    // RN04 / RN07 - Validação do nome
    const validateNameField = (value) => {
        const normalizedName = value.trim();

        if (!normalizedName) {
            return MESSAGES.MSG02;
        }

        if (
            normalizedName.length < 3 ||
            !/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(normalizedName)
        ) {
            return LOCAL_MESSAGES.INVALID_NAME;
        }

        return null;
    };

    // RN01 / RN07 - Validação do e-mail
    const validateEmail = (value) => {
        const emailValue = value.trim();

        if (!emailValue) {
            return MESSAGES.MSG02;
        }

        const emailRegex =
            /^[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)*@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/;

        if (/\s/.test(emailValue) || !emailRegex.test(emailValue)) {
            return MESSAGES.MSG04;
        }

        return null;
    };

    // RN02 / RN07 - Validação da senha
    const validatePassword = (value) => {
        if (!value) {
            return MESSAGES.MSG02;
        }

        const requirements = [
            value.length >= 8,
            /[A-Z]/.test(value),
            /[a-z]/.test(value),
            /\d/.test(value),
            /[!@#$%&*_-]/.test(value),
            !/\s/.test(value),
        ];

        if (requirements.some((valid) => !valid)) {
            return MESSAGES.MSG06;
        }

        return null;
    };

    // RN03 / RN07 - Validação do CPF
    const validateCPFField = (value) => {
        const digits = value.replace(/\D/g, '');

        if (!digits) {
            return MESSAGES.MSG02;
        }

        if (digits.length !== 11 || !isValidCPF(digits)) {
            return MESSAGES.MSG05;
        }

        return null;
    };

    // RN05 / RN07 - Validação do estado civil
    const validateMaritalStatus = (value) => {
        if (!value) {
            return MESSAGES.MSG02;
        }

        if (!MARITAL_STATUS_OPTIONS.includes(value)) {
            return LOCAL_MESSAGES.INVALID_MARITAL_STATUS;
        }

        return null;
    };

    // RN06 / RN07 - Validação da UF
    const validateState = (value) => {
        if (!value) {
            return MESSAGES.MSG02;
        }

        const validStates = BRAZILIAN_STATES.map(([uf]) => uf);

        if (!validStates.includes(value)) {
            return LOCAL_MESSAGES.INVALID_STATE;
        }

        return null;
    };

    // RN06 - Consulta automática do CEP
    const handleCepChange = async (value) => {
        const formattedCep = cepMask(value);
        const cepDigits = formattedCep.replace(/\D/g, '');

        setCep(formattedCep);
        clearFieldError('cep');

        if (cepDigits.length !== 8) {
            return;
        }

        try {
            const response = await fetch(
                `https://viacep.com.br/ws/${cepDigits}/json/`
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const address = await response.json();

            if (address.erro) {
                setFieldErrors((current) => ({
                    ...current,
                    cep: LOCAL_MESSAGES.CEP_NOT_FOUND,
                }));

                showFeedback(LOCAL_MESSAGES.CEP_NOT_FOUND);
                return;
            }

            setStreet(address.logradouro || '');
            setNeighborhood(address.bairro || '');
            setCity(address.localidade || '');
            setState(address.uf || '');

            setFieldErrors((current) => {
                const next = { ...current };

                delete next.street;
                delete next.neighborhood;
                delete next.city;
                delete next.state;

                return next;
            });

        } catch (error) {
            console.error('Erro ao consultar CEP:', error);

            // MSG08 - Erro ao carregar. Tente novamente
            showFeedback(MESSAGES.MSG08);
        }
    };

    // Cadastro do usuário
    const handleRegister = async () => {
        if (loading) return;

        const errors = {};

        // RN04 - Nome
        const nameError = validateNameField(name);
        if (nameError) errors.name = nameError;

        // RN03 - CPF
        const cpfError = validateCPFField(cpf);
        if (cpfError) errors.cpf = cpfError;

        // RN05 - Estado civil
        const maritalError = validateMaritalStatus(maritalStatus);
        if (maritalError) errors.maritalStatus = maritalError;

        // RN07 - Telefone
        const phoneDigits = phone.replace(/\D/g, '');

        if (!phoneDigits) {
            errors.phone = MESSAGES.MSG02;
        } else if (phoneDigits.length !== 10 && phoneDigits.length !== 11) {
            errors.phone = LOCAL_MESSAGES.INVALID_PHONE;
        }

        // RN06 - CEP
        const cepDigits = cep.replace(/\D/g, '');

        if (!cepDigits) {
            errors.cep = MESSAGES.MSG02;
        } else if (!isValidCEP(cep)) {
            errors.cep = LOCAL_MESSAGES.INVALID_CEP;
        }

        // RN06 / RN07 - Logradouro
        if (!street.trim()) {
            errors.street = MESSAGES.MSG02;
        }

        // RN06 / RN07 - Número
        if (!number.trim()) {
            errors.number = MESSAGES.MSG02;
        }

        // RN06 / RN07 - Bairro
        if (!neighborhood.trim()) {
            errors.neighborhood = MESSAGES.MSG02;
        }

        // RN06 / RN07 - Cidade
        if (!city.trim()) {
            errors.city = MESSAGES.MSG02;
        }

        // RN06 - Estado
        const stateError = validateState(state);
        if (stateError) errors.state = stateError;

        // RN01 - E-mail
        const emailError = validateEmail(email);
        if (emailError) errors.email = emailError;

        // RN02 - Senha
        const passwordError = validatePassword(password);
        if (passwordError) errors.password = passwordError;

        // RN02 - Confirmação de senha
        if (!confirmPassword) {
            errors.confirmPassword = MESSAGES.MSG02;
        } else if (password !== confirmPassword) {
            errors.confirmPassword = LOCAL_MESSAGES.PASSWORD_MISMATCH;
        }

        // PIN de segurança
        if (!pin) {
            errors.pin = MESSAGES.MSG02;
        } else if (!/^\d{4}$/.test(pin)) {
            errors.pin = LOCAL_MESSAGES.PIN_INVALID;
        }

        // Confirmação do PIN
        if (!confirmPin) {
            errors.confirmPin = MESSAGES.MSG02;
        } else if (pin !== confirmPin) {
            errors.confirmPin = LOCAL_MESSAGES.PIN_MISMATCH;
        }

        // RN09 - Aceite obrigatório dos termos
        if (!termsAccepted) {
            errors.terms = MESSAGES.MSG03;
        }

        setFieldErrors(errors);

        // Impede o envio caso existam erros
        const errorMessages = Object.values(errors);

        if (errorMessages.length > 0) {
            // RN07 - Se houver campo obrigatório vazio, destaca a MSG02 no banner
            showFeedback(
                errorMessages.includes(MESSAGES.MSG02)
                    ? MESSAGES.MSG02
                    : errorMessages[0]
            );
            return;
        }

        let registered = false;

        try {
            setLoading(true);

            await api.post('/auth/register', {
                nome: name.trim(),

                cpf: cpf.replace(/\D/g, ''),

                estado_civil: maritalStatus,

                telefone: phoneDigits,

                email: email.trim().toLowerCase(),

                senha: password,

                pin_provas: pin,

                cep: cepDigits,

                logradouro: street.trim(),

                numero: number.trim(),

                complemento: complement.trim(),

                bairro: neighborhood.trim(),

                cidade: city.trim(),

                estado_uf: state,

                termos_aceitos: true,
            });

            registered = true;

            // MSG01 - Conta criada com sucesso
            showFeedback(MESSAGES.MSG01, 'success');

            // Aguarda para que o usuário consiga ler a MSG01 antes de sair da tela
            navigationTimer.current = setTimeout(() => {
                navigation.navigate('Login');
            }, 1500);

        } catch (error) {
            console.error('Erro no cadastro:', error);

            const status = error.response?.status;

            if (!error.response || status >= 500) {
                // MSG14 - Sistema indisponível, tente novamente
                showFeedback(MESSAGES.MSG14);

            } else {
                // MSG07 - Erro ao cadastrar. Tente novamente mais tarde
                // Obs.: o documento ainda não define mensagem específica
                // para e-mail/CPF já cadastrado (status 409).
                showFeedback(MESSAGES.MSG07);
            }

        } finally {
            // Mantém o botão bloqueado após o sucesso para evitar cadastro duplicado
            if (!registered) {
                setLoading(false);
            }
        }
    };

    return (
        <MobileFrame backgroundColor="#0B0B0C">

            <FeedbackBanner
                feedback={feedback}
                onClose={() => setFeedback(null)}
            />

            <View style={[styles.screen, { backgroundColor: colors.background }]}>

                <ScrollView
                    style={styles.scrollContainer}
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={true}
                    keyboardShouldPersistTaps="handled"
                    automaticallyAdjustKeyboardInsets
                >

                    {/* CABEÇALHO */}
                    <View style={styles.header}>

                        <Pressable
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <MaterialCommunityIcons
                                name="chevron-left"
                                size={24}
                                color="#8B8B93"
                            />
                        </Pressable>

                        <View style={styles.headerText}>
                            <Text style={styles.headerTitle}>
                                Criar conta
                            </Text>

                            <Text style={styles.headerSubtitle}>
                                Preencha seus dados para continuar
                            </Text>
                        </View>

                        <View style={styles.logoBox}>
                            <MaterialCommunityIcons
                                name="shield-outline"
                                size={24}
                                color="#8B8B93"
                            />
                        </View>

                    </View>

                    <View style={styles.formWrap}>

                        {/* DADOS PESSOAIS */}
                        <Section title="DADOS PESSOAIS" />

                        <InputRow
                            label="Nome completo"
                            placeholder="Maria Clara Santos"
                            icon="account-outline"
                            value={name}
                            onChangeText={(value) => {
                                setName(value);
                                clearFieldError('name');
                            }}
                            error={fieldErrors.name}
                        />

                        <InputRow
                            label="CPF"
                            placeholder="000.000.000-00"
                            icon="card-account-details-outline"
                            value={cpf}
                            onChangeText={(value) => {
                                setCpf(cpfMask(value));
                                clearFieldError('cpf');
                            }}
                            keyboardType="numeric"
                            maxLength={14}
                            error={fieldErrors.cpf}
                        />

                        {/* ESTADO CIVIL */}
                        <View style={styles.group}>

                            <Text style={styles.label}>
                                Estado civil <Text style={styles.required}>*</Text>
                            </Text>

                            <Pressable
                                style={[
                                    styles.inputWrap,
                                    fieldErrors.maritalStatus && styles.inputWrapError
                                ]}
                                onPress={() => {
                                    setMaritalPickerVisible(true);
                                    clearFieldError('maritalStatus');
                                }}
                            >
                                <MaterialCommunityIcons
                                    name="heart-outline"
                                    size={18}
                                    color="#8B8B93"
                                    style={styles.iconLeft}
                                />

                                <Text
                                    style={[
                                        styles.selectorValue,
                                        {
                                            color: maritalStatus
                                                ? colors.text
                                                : colors.muted
                                        }
                                    ]}
                                >
                                    {maritalStatus || 'Selecione'}
                                </Text>

                                <MaterialCommunityIcons
                                    name="chevron-down"
                                    size={18}
                                    color="#8B8B93"
                                    style={styles.iconRight}
                                />
                            </Pressable>

                            <FieldError message={fieldErrors.maritalStatus} />

                        </View>

                        <InputRow
                            label="Telefone"
                            placeholder="(11) 99999-0000"
                            icon="phone-outline"
                            value={phone}
                            onChangeText={(value) => {
                                setPhone(phoneMask(value));
                                clearFieldError('phone');
                            }}
                            keyboardType="phone-pad"
                            maxLength={15}
                            error={fieldErrors.phone}
                        />

                        {/* ENDEREÇO */}
                        <Section title="ENDEREÇO" />

                        <InputRow
                            label="CEP"
                            placeholder="00000-000"
                            icon="map-marker-outline"
                            value={cep}
                            onChangeText={handleCepChange}
                            keyboardType="numeric"
                            maxLength={9}
                            error={fieldErrors.cep}
                        />

                        <InputRow
                            label="Logradouro"
                            placeholder="Rua, Avenida, Travessa..."
                            icon="map-marker-outline"
                            value={street}
                            onChangeText={(value) => {
                                setStreet(value);
                                clearFieldError('street');
                            }}
                            error={fieldErrors.street}
                        />

                        {/* NÚMERO E COMPLEMENTO */}
                        <View style={styles.rowFields}>

                            <View style={styles.halfGroup}>

                                <Text style={styles.label}>
                                    Número <Text style={styles.required}>*</Text>
                                </Text>

                                <View
                                    style={[
                                        styles.inputWrap,
                                        fieldErrors.number && styles.inputWrapError
                                    ]}
                                >
                                    <MaterialCommunityIcons
                                        name="map-marker-outline"
                                        size={18}
                                        color="#8B8B93"
                                        style={styles.iconLeft}
                                    />

                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nº"
                                        placeholderTextColor="#555"
                                        value={number}
                                        onChangeText={(value) => {
                                            setNumber(value);
                                            clearFieldError('number');
                                        }}
                                    />
                                </View>

                                <FieldError message={fieldErrors.number} />

                            </View>

                            <View style={styles.halfGroup}>

                                <Text style={styles.label}>
                                    Complemento
                                </Text>

                                <View style={styles.inputWrap}>

                                    <MaterialCommunityIcons
                                        name="map-marker-outline"
                                        size={18}
                                        color="#8B8B93"
                                        style={styles.iconLeft}
                                    />

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
                            onChangeText={(value) => {
                                setNeighborhood(value);
                                clearFieldError('neighborhood');
                            }}
                            error={fieldErrors.neighborhood}
                        />

                        {/* CIDADE E ESTADO */}
                        <View style={styles.rowFields}>

                            <View style={styles.cityGroup}>

                                <Text style={styles.label}>
                                    Cidade <Text style={styles.required}>*</Text>
                                </Text>

                                <View
                                    style={[
                                        styles.inputWrap,
                                        fieldErrors.city && styles.inputWrapError
                                    ]}
                                >
                                    <MaterialCommunityIcons
                                        name="map-marker-outline"
                                        size={18}
                                        color="#8B8B93"
                                        style={styles.iconLeft}
                                    />

                                    <TextInput
                                        style={styles.input}
                                        placeholder="Selecione"
                                        placeholderTextColor="#555"
                                        value={city}
                                        onChangeText={(value) => {
                                            setCity(value);
                                            clearFieldError('city');
                                        }}
                                    />

                                </View>

                                <FieldError message={fieldErrors.city} />

                            </View>

                            <View style={styles.stateGroup}>

                                <Text style={styles.label}>
                                    Estado <Text style={styles.required}>*</Text>
                                </Text>

                                <Pressable
                                    style={[
                                        styles.inputWrap,
                                        fieldErrors.state && styles.inputWrapError
                                    ]}
                                    onPress={() => {
                                        setStatePickerVisible(true);
                                        clearFieldError('state');
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.input,
                                            styles.stateValue,
                                            {
                                                color: state
                                                    ? colors.text
                                                    : colors.muted
                                            }
                                        ]}
                                    >
                                        {state || 'UF'}
                                    </Text>

                                    <MaterialCommunityIcons
                                        name="chevron-down"
                                        size={18}
                                        color="#8B8B93"
                                        style={styles.iconRight}
                                    />

                                </Pressable>

                                <FieldError message={fieldErrors.state} />

                            </View>

                        </View>

                        {/* ACESSO */}
                        <Section title="ACESSO" />

                        <InputRow
                            label="E-mail"
                            placeholder="seu@email.com"
                            icon="email-outline"
                            value={email}
                            onChangeText={(value) => {
                                setEmail(value);
                                clearFieldError('email');
                            }}
                            keyboardType="email-address"
                            error={fieldErrors.email}
                        />

                        {/* SENHA */}
                        <View style={styles.group}>

                            <Text style={styles.label}>
                                Senha <Text style={styles.required}>*</Text>
                            </Text>

                            <View
                                style={[
                                    styles.inputWrap,
                                    fieldErrors.password && styles.inputWrapError
                                ]}
                            >

                                <MaterialCommunityIcons
                                    name="lock-outline"
                                    size={18}
                                    color="#8B8B93"
                                    style={styles.iconLeft}
                                />

                                <TextInput
                                    style={styles.input}
                                    secureTextEntry={!showPassword}
                                    placeholder="Crie uma senha segura"
                                    placeholderTextColor="#555"
                                    value={password}
                                    onChangeText={(value) => {
                                        setPassword(value);
                                        clearFieldError('password');
                                    }}
                                />

                                <Pressable
                                    style={styles.iconRightPressable}
                                    onPress={() => setShowPassword((prev) => !prev)}
                                >
                                    <MaterialCommunityIcons
                                        name={
                                            showPassword
                                                ? 'eye-off-outline'
                                                : 'eye-outline'
                                        }
                                        size={19}
                                        color="#8B8B93"
                                    />
                                </Pressable>

                            </View>

                            <FieldError message={fieldErrors.password} />

                            {/* REQUISITOS DA SENHA */}
                            <View style={styles.rules}>

                                <PasswordRule
                                    label="Mínimo 8 caracteres"
                                    valid={password.length >= 8}
                                />

                                <PasswordRule
                                    label="1 letra maiúscula"
                                    valid={/[A-Z]/.test(password)}
                                />

                                <PasswordRule
                                    label="1 letra minúscula"
                                    valid={/[a-z]/.test(password)}
                                />

                                <PasswordRule
                                    label="1 número"
                                    valid={/\d/.test(password)}
                                />

                                <PasswordRule
                                    label="1 caractere especial (!@#$%&*_-)"
                                    valid={/[!@#$%&*_-]/.test(password)}
                                />

                                <PasswordRule
                                    label="Não possuir espaços"
                                    valid={
                                        password.length > 0 &&
                                        !/\s/.test(password)
                                    }
                                />

                            </View>

                        </View>

                        {/* CONFIRMAÇÃO DA SENHA */}
                        <View style={styles.group}>

                            <Text style={styles.label}>
                                Confirmação da senha <Text style={styles.required}>*</Text>
                            </Text>

                            <View
                                style={[
                                    styles.inputWrap,
                                    fieldErrors.confirmPassword && styles.inputWrapError
                                ]}
                            >

                                <MaterialCommunityIcons
                                    name="lock-outline"
                                    size={18}
                                    color="#8B8B93"
                                    style={styles.iconLeft}
                                />

                                <TextInput
                                    style={styles.input}
                                    secureTextEntry={!showConfirmPassword}
                                    placeholder="Repita sua senha"
                                    placeholderTextColor="#555"
                                    value={confirmPassword}
                                    onChangeText={(value) => {
                                        setConfirmPassword(value);
                                        clearFieldError('confirmPassword');
                                    }}
                                />

                                <Pressable
                                    style={styles.iconRightPressable}
                                    onPress={() => setShowConfirmPassword((prev) => !prev)}
                                >
                                    <MaterialCommunityIcons
                                        name={
                                            showConfirmPassword
                                                ? 'eye-off-outline'
                                                : 'eye-outline'
                                        }
                                        size={19}
                                        color="#8B8B93"
                                    />
                                </Pressable>

                            </View>

                            <FieldError message={fieldErrors.confirmPassword} />

                        </View>

                        {/* PIN DE PROVAS */}
                        <Section title="PIN DE PROVAS" />

                        <View style={styles.pinInfoBox}>

                            <MaterialCommunityIcons
                                name="lock-outline"
                                size={16}
                                color="#8B8B93"
                                style={styles.pinInfoIcon}
                            />

                            <Text style={styles.pinInfoText}>
                                Este PIN de{' '}
                                <Text style={styles.boldText}>4 dígitos</Text>
                                {' '}protege o acesso à sua área de evidências.
                                Guarde-o com segurança.
                            </Text>

                        </View>

                        {/* PIN */}
                        <View style={styles.group}>

                            <Text style={styles.label}>
                                PIN de acesso às provas <Text style={styles.required}>*</Text>
                            </Text>

                            <View
                                style={[
                                    styles.inputWrap,
                                    fieldErrors.pin && styles.inputWrapError
                                ]}
                            >

                                <MaterialCommunityIcons
                                    name="lock-outline"
                                    size={18}
                                    color="#8B8B93"
                                    style={styles.iconLeft}
                                />

                                <TextInput
                                    style={styles.input}
                                    secureTextEntry={!showPin}
                                    placeholder="4 dígitos"
                                    placeholderTextColor="#555"
                                    keyboardType="numeric"
                                    maxLength={4}
                                    value={pin}
                                    onChangeText={(value) => {
                                        setPin(
                                            value.replace(/\D/g, '').slice(0, 4)
                                        );
                                        clearFieldError('pin');
                                    }}
                                />

                                <Pressable
                                    style={styles.iconRightPressable}
                                    onPress={() => setShowPin((prev) => !prev)}
                                >
                                    <MaterialCommunityIcons
                                        name={
                                            showPin
                                                ? 'eye-off-outline'
                                                : 'eye-outline'
                                        }
                                        size={19}
                                        color="#8B8B93"
                                    />
                                </Pressable>

                            </View>

                            <FieldError message={fieldErrors.pin} />

                        </View>

                        {/* CONFIRMAÇÃO DO PIN */}
                        <View style={styles.group}>

                            <Text style={styles.label}>
                                Confirmar PIN <Text style={styles.required}>*</Text>
                            </Text>

                            <View
                                style={[
                                    styles.inputWrap,
                                    fieldErrors.confirmPin && styles.inputWrapError
                                ]}
                            >

                                <MaterialCommunityIcons
                                    name="lock-outline"
                                    size={18}
                                    color="#8B8B93"
                                    style={styles.iconLeft}
                                />

                                <TextInput
                                    style={styles.input}
                                    secureTextEntry={!showConfirmPin}
                                    placeholder="Repita o PIN"
                                    placeholderTextColor="#555"
                                    keyboardType="numeric"
                                    maxLength={4}
                                    value={confirmPin}
                                    onChangeText={(value) => {
                                        setConfirmPin(
                                            value.replace(/\D/g, '').slice(0, 4)
                                        );
                                        clearFieldError('confirmPin');
                                    }}
                                />

                                <Pressable
                                    style={styles.iconRightPressable}
                                    onPress={() => setShowConfirmPin((prev) => !prev)}
                                >
                                    <MaterialCommunityIcons
                                        name={
                                            showConfirmPin
                                                ? 'eye-off-outline'
                                                : 'eye-outline'
                                        }
                                        size={19}
                                        color="#8B8B93"
                                    />
                                </Pressable>

                            </View>

                            <FieldError message={fieldErrors.confirmPin} />

                        </View>

                        {/* TERMOS DE USO - RN09 */}
                        <Pressable
                            style={[
                                styles.termsRow,
                                fieldErrors.terms && styles.termsRowError
                            ]}
                            onPress={() => {
                                setTermsAccepted((prev) => !prev);
                                clearFieldError('terms');
                            }}
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
                                Ao cadastrar você concorda com os{' '}
                                <Text
                                    style={styles.termsLink}
                                    onPress={openTerms}
                                >
                                    Termos de Uso
                                </Text>
                                {' '}e a{' '}
                                <Text
                                    style={styles.termsLink}
                                    onPress={openTerms}
                                >
                                    Política de Privacidade
                                </Text>
                                {' '}*
                            </Text>

                        </Pressable>

                        <FieldError message={fieldErrors.terms} />

                        {/* BOTÃO DE CADASTRO */}
                        <Pressable
                            style={[
                                styles.submitButton,
                                loading && { opacity: 0.6 }
                            ]}
                            onPress={handleRegister}
                            disabled={loading}
                        >

                            <Text style={styles.submitText}>
                                {loading
                                    ? 'Criando conta...'
                                    : 'Criar minha conta'}
                            </Text>

                        </Pressable>

                        {/* LOGIN */}
                        <Pressable
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Text style={styles.loginLink}>
                                Já tem uma conta?{' '}
                                <Text style={styles.loginLinkAccent}>
                                    Entrar
                                </Text>
                            </Text>
                        </Pressable>

                    </View>

                </ScrollView>

            </View>

            {/* MODAL DE ESTADOS */}
            <Modal
                visible={isStatePickerVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setStatePickerVisible(false)}
            >

                <View style={styles.stateModalOverlay}>

                    <View
                        style={[
                            styles.stateModal,
                            { backgroundColor: colors.surface }
                        ]}
                    >

                        <View style={styles.stateModalHeader}>

                            <Text
                                style={[
                                    styles.stateModalTitle,
                                    { color: colors.text }
                                ]}
                            >
                                Selecione o estado
                            </Text>

                            <Pressable
                                onPress={() => setStatePickerVisible(false)}
                            >
                                <MaterialCommunityIcons
                                    name="close"
                                    size={22}
                                    color={colors.muted}
                                />
                            </Pressable>

                        </View>

                        <ScrollView
                            showsVerticalScrollIndicator
                            keyboardShouldPersistTaps="handled"
                        >

                            {BRAZILIAN_STATES.map(([uf, stateName]) => (

                                <Pressable
                                    key={uf}
                                    style={[
                                        styles.stateOption,
                                        state === uf && styles.stateOptionActive
                                    ]}
                                    onPress={() => {
                                        setState(uf);
                                        clearFieldError('state');
                                        setStatePickerVisible(false);
                                    }}
                                >

                                    <Text
                                        style={[
                                            styles.stateUf,
                                            { color: colors.text }
                                        ]}
                                    >
                                        {uf}
                                    </Text>

                                    <Text
                                        style={[
                                            styles.stateName,
                                            { color: colors.muted }
                                        ]}
                                    >
                                        {stateName}
                                    </Text>

                                    {state === uf && (
                                        <MaterialCommunityIcons
                                            name="check"
                                            size={18}
                                            color="#C83C59"
                                        />
                                    )}

                                </Pressable>

                            ))}

                        </ScrollView>

                    </View>

                </View>

            </Modal>

            {/* MODAL DE ESTADO CIVIL */}
            <Modal
                visible={isMaritalPickerVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setMaritalPickerVisible(false)}
            >

                <View style={styles.stateModalOverlay}>

                    <View
                        style={[
                            styles.stateModal,
                            { backgroundColor: colors.surface }
                        ]}
                    >

                        <View style={styles.stateModalHeader}>

                            <Text
                                style={[
                                    styles.stateModalTitle,
                                    { color: colors.text }
                                ]}
                            >
                                Estado civil
                            </Text>

                            <Pressable
                                onPress={() => setMaritalPickerVisible(false)}
                            >
                                <MaterialCommunityIcons
                                    name="close"
                                    size={22}
                                    color={colors.muted}
                                />
                            </Pressable>

                        </View>

                        {MARITAL_STATUS_OPTIONS.map((option) => (

                            <Pressable
                                key={option}
                                style={[
                                    styles.stateOption,
                                    maritalStatus === option &&
                                    styles.stateOptionActive
                                ]}
                                onPress={() => {
                                    setMaritalStatus(option);
                                    clearFieldError('maritalStatus');
                                    setMaritalPickerVisible(false);
                                }}
                            >

                                <Text
                                    style={[
                                        styles.stateName,
                                        { color: colors.text }
                                    ]}
                                >
                                    {option}
                                </Text>

                                {maritalStatus === option && (
                                    <MaterialCommunityIcons
                                        name="check"
                                        size={18}
                                        color="#C83C59"
                                    />
                                )}

                            </Pressable>

                        ))}

                    </View>

                </View>

            </Modal>

            {/* MODAL DOS TERMOS DE USO (PDF) */}
            <PdfModal
                visible={isTermsVisible}
                onClose={() => setTermsVisible(false)}
                title="Termos de Uso"
                file={TERMS_FILE}
            />

        </MobileFrame>
    );
}

// COMPONENTE: DIVISOR DE SEÇÕES
function Section({ title }) {
    return (
        <View style={styles.sectionDivider}>

            <View style={styles.sectionLine} />

            <Text style={styles.sectionTitle}>
                {title}
            </Text>

            <View style={styles.sectionLine} />

        </View>
    );
}

// COMPONENTE: CAMPO DE ENTRADA
function InputRow({
    label,
    placeholder,
    icon,
    right,
    value,
    onChangeText,
    keyboardType,
    maxLength,
    error
}) {
    return (
        <View style={styles.group}>

            <Text style={styles.label}>
                {label} <Text style={styles.required}>*</Text>
            </Text>

            <View
                style={[
                    styles.inputWrap,
                    error && styles.inputWrapError
                ]}
            >

                <MaterialCommunityIcons
                    name={icon}
                    size={18}
                    color="#8B8B93"
                    style={styles.iconLeft}
                />

                <TextInput
                    style={[
                        styles.input,
                        right ? { paddingRight: 36 } : null
                    ]}
                    placeholder={placeholder}
                    placeholderTextColor="#555"
                    value={value}
                    onChangeText={onChangeText}
                    keyboardType={keyboardType}
                    maxLength={maxLength}
                    autoCapitalize={
                        keyboardType === 'email-address'
                            ? 'none'
                            : 'sentences'
                    }
                />

                {right ? (
                    <MaterialCommunityIcons
                        name={right}
                        size={18}
                        color="#8B8B93"
                        style={styles.iconRight}
                    />
                ) : null}

            </View>

            <FieldError message={error} />

        </View>
    );
}

// COMPONENTE: MENSAGEM DE ERRO
function FieldError({ message }) {
    if (!message) return null;

    return (
        <Text style={styles.fieldError}>
            {message}
        </Text>
    );
}

// COMPONENTE: REQUISITOS DA SENHA
function PasswordRule({ label, valid }) {
    return (
        <View style={styles.ruleRow}>

            <MaterialCommunityIcons
                name={valid ? 'check-circle' : 'circle-outline'}
                size={15}
                color={valid ? '#4CAF50' : '#7C7C82'}
            />

            <Text
                style={[
                    styles.rule,
                    valid && styles.ruleValid
                ]}
            >
                {label}
            </Text>

        </View>
    );
}

// ESTILIZAÇÃO ORIGINAL DO GUARDIÃ
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

    inputWrapError: {
        borderColor: '#EF4444',
    },

    fieldError: {
        color: '#F87171',
        fontSize: 11,
        marginTop: 5,
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

    input: {
        height: 52,
        color: '#FFFFFF',
        paddingLeft: 46,
        paddingRight: 46,
        fontSize: 14,
    },

    selectorValue: {
        flex: 1,
        height: 52,
        paddingLeft: 46,
        paddingRight: 46,
        fontSize: 14,
        lineHeight: 52,
        textAlignVertical: 'center',
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
        width: '100%',
        maxWidth: 342,
        alignSelf: 'center',
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

    ruleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },

    rule: {
        color: '#7C7C82',
        fontSize: 12,
    },

    ruleValid: {
        color: '#4CAF50',
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

    termsRowError: {
        borderWidth: 1,
        borderColor: '#EF4444',
        borderRadius: 8,
        padding: 8,
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

});