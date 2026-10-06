import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useNavigation, useRoute } from '@react-navigation/native';

import MobileFrame from '../../components/MobileFrame/MobileFrame';
import BottomNav from '../../components/BottomNav/BottomNav';
import { useTheme } from '../../context/ThemeContext';
import { useUserProfile } from '../../context/UserProfileContext';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

const CARDS = [
    { title: 'Guardar Evidência', subtitle: 'Seguro e criptografado', color: '#EB5757', bg: 'rgba(235,87,87,0.12)', icon: 'record-circle' },
    { title: 'Conteúdo Informativo', subtitle: 'Apoio e emergências', color: '#27AE60', bg: 'rgba(39,174,96,0.12)', icon: 'shield-half-full' },
];

const normalizeBrazilianPhone = (phone) => {
    const digits = String(phone || '').replace(/\D/g, '');
    if (digits.startsWith('55')) return digits;
    if (digits.startsWith('0')) return `55${digits.slice(1)}`;
    return `55${digits}`;
};

export default function HomeScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { colors } = useTheme();
    const { profile, refreshProfile } = useUserProfile();
    const nameFontSize = profile.name.length > 28 ? 18 : profile.name.length > 20 ? 21 : 26;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const [sosCountdown, setSosCountdown] = useState(null);
    const [sosPulse, setSosPulse] = useState(false);
    const [sosDispatched, setSosDispatched] = useState(false);

    const dispatchSos = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Localização necessária', 'Permita o acesso à localização para enviar o alerta com sua posição.');
                return;
            }

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.BestForNavigation,
                mayShowUserSettingsDialog: true,
            });
            const { latitude, longitude, accuracy } = location.coords;
            if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
                throw new Error('O GPS não retornou uma coordenada válida.');
            }
            if (accuracy && accuracy > 500) {
                Alert.alert(
                    'Localização imprecisa',
                    `O GPS informou uma precisão aproximada de ${Math.round(accuracy)} metros. Ative a localização precisa e tente novamente.`
                );
                return;
            }
            const mapsLink = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
            const stored = await AsyncStorage.getItem('@guardia/auth_user');
            const user = stored ? JSON.parse(stored) : null;
            const response = user?.id ? await api.get(`/auth/contacts/${user.id}`) : null;
            const contacts = response?.data?.contacts || [];
            if (user?.id) {
                await api.post('/admin/reports/sos/events', { usuario_id: user.id });
            }

            if (!contacts.length) {
                Alert.alert('Nenhum contato cadastrado', 'Cadastre um contato de confiança antes de acionar o SOS.');
                return;
            }

            const selectedContact = contacts.find((contact) => contact.nome?.trim().toLowerCase() === 'eu') || contacts[0];
            const phone = normalizeBrazilianPhone(selectedContact.telefone);
            if (phone.length < 12) {
                Alert.alert('Telefone inválido', `Corrija o telefone de ${selectedContact.nome} antes de usar o SOS.`);
                return;
            }

            const message = [
                '🚨 SOCORRO! A pessoa acionou um alerta de emergência.',
                `Nome: ${user?.nome || profile.name || 'Usuária'}`,
                `Localização atual: ${mapsLink}`,
                'Abra o link para ver a posição no mapa. Este alerta foi preparado pelo app Guardiã.',
            ].join('\n');
            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = Platform.OS === 'web'
                ? `https://web.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`
                : `https://wa.me/${phone}?text=${encodedMessage}`;

            if (Platform.OS !== 'web') {
                const canOpenWhatsApp = await Linking.canOpenURL(whatsappUrl);
                if (!canOpenWhatsApp) {
                    Alert.alert('WhatsApp não encontrado', 'Instale o WhatsApp ou use o link da localização para avisar seus contatos.');
                    return;
                }
            }

            await Linking.openURL(whatsappUrl);
            Alert.alert(
                'Mensagem preparada',
                `O WhatsApp foi aberto para ${selectedContact.nome}. Confirme o envio da mensagem.\nPrecisão do GPS: ${accuracy ? `${Math.round(accuracy)} m` : 'não informada'}.`
            );
        } catch (error) {
            console.error('Erro ao preparar alerta SOS:', error);
            Alert.alert('Erro no SOS', 'Não foi possível preparar a mensagem de emergência. Tente novamente.');
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            refreshProfile();
        }, [refreshProfile])
    );

    useEffect(() => {
        if (sosCountdown === null) return undefined;

        const countdownTimer = setTimeout(() => {
            if (sosCountdown === 1) {
                setSosCountdown(null);
                setSosDispatched(true);
                dispatchSos();
                return;
            }

            setSosCountdown((currentCountdown) => currentCountdown - 1);
        }, 1000);

        return () => clearTimeout(countdownTimer);
    }, [sosCountdown]);

    useEffect(() => {
        if (!route.params?.startSos) return;

        setSosDispatched(false);
        setSosCountdown(5);
        navigation.setParams({ startSos: false });
    }, [navigation, route.params?.startSos]);

    useEffect(() => {
        if (sosCountdown === null) {
            setSosPulse(false);
            return undefined;
        }

        const pulseTimer = setInterval(() => {
            setSosPulse((currentPulse) => !currentPulse);
        }, 450);

        return () => clearInterval(pulseTimer);
    }, [sosCountdown]);

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.92,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    const handleCardPress = (title) => {
        if (title === 'Conteúdo Informativo') {
            navigation.navigate('Informacoes');
        } else if (title === 'Guardar Evidência') {
            navigation.navigate('Provas');
        } else {
            Alert.alert('Aviso', `A função "${title}" estará disponível em breve.`);
        }
    };


    const handleSosPress = () => {
        if (sosCountdown !== null || sosDispatched) {
            setSosCountdown(null);
            setSosDispatched(false);
            return;
        }

        setSosDispatched(false);
        setSosCountdown(5);
    };

    return (
        <MobileFrame backgroundColor="#0D0D0F">
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                {(sosCountdown !== null || sosDispatched) && (
                    <View style={styles.sosStatusBar}>
                        <Text style={styles.sosStatusText}>
                            {sosCountdown !== null
                                ? `SOS será acionado em ${sosCountdown}s · Toque no botão para cancelar`
                                : 'SOS disparado · Toque no botão para cancelar'}
                        </Text>
                    </View>
                )}
                <View style={styles.userHeader}>
                    <View style={styles.userInfo}>
                        <Text style={[styles.greeting, { color: colors.muted }]}>Bem-vinda de volta</Text>
                        <Text
                            style={[styles.name, { color: colors.text, fontSize: nameFontSize }]}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {profile.name}
                        </Text>
                    </View>
                    <Pressable onPress={() => navigation.navigate('Perfil')} style={styles.avatar}>
                        <Text style={styles.avatarText}>{profile.name.charAt(0).toUpperCase()}</Text>
                    </Pressable>
                </View>

                <View style={styles.sosContainer}>
                    <Text style={styles.sosTitle}>PRESSIONE EM CASO DE EMERGÊNCIA</Text>
                    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                        <Pressable
                            style={[
                                styles.sosButton,
                                sosCountdown !== null && styles.sosButtonPending,
                                sosCountdown !== null && sosPulse && styles.sosButtonPulse,
                            ]}
                            onPressIn={handlePressIn}
                            onPressOut={handlePressOut}
                            onPress={handleSosPress}
                        >
                            <Feather name="phone-call" size={30} color="#FFFFFF" />
                            <Text style={styles.sosLabel}>{sosCountdown ?? 'SOS'}</Text>
                            <Text style={styles.sosSubtitle}>
                                {sosCountdown !== null || sosDispatched ? 'Toque para cancelar' : 'Pressione para acionar ajuda'}
                            </Text>
                        </Pressable>
                    </Animated.View>
                </View>

                <View style={styles.bottomSection}>
                    <View style={styles.grid}>
                        {CARDS.map((card) => (
                            <ActionCard
                                key={card.title}
                                card={card}
                                onPress={() => handleCardPress(card.title)}
                            />
                        ))}
                    </View>

                    <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={styles.summaryTitle}>RESUMO DE SEGURANÇA</Text>
                        <View style={styles.summaryMetrics}>
                            <Metric label="Contatos" value={`${profile.contactsCount} salvos`} active />
                            <View style={styles.divider} />
                            <Metric label="Localização" value="Inativa" />
                            <View style={styles.divider} />
                            <Metric label="Evidências" value={`${profile.evidenceCount} salvas`} active />
                        </View>
                    </View>
                </View>
            </View>
            <BottomNav active="Home" />
        </MobileFrame>
    );
}

function ActionCard({ card, onPress }) {
    const cardScale = useRef(new Animated.Value(1)).current;
    const { colors } = useTheme();

    const handlePressIn = () => {
        Animated.spring(cardScale, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(cardScale, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Animated.View style={[styles.cardWrapper, { transform: [{ scale: cardScale }] }]}>
            <Pressable
                style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={onPress}
            >
                <View style={[styles.iconWrap, { backgroundColor: card.bg }]}>
                    <MaterialCommunityIcons name={card.icon} size={18} color={card.color} />
                </View>
                <View>
                    <Text
                        style={[styles.cardTitle, { color: colors.text }]}
                        numberOfLines={1}
                    >
                        {card.title}
                    </Text>
                    <Text style={[styles.cardSubtitle, { color: colors.muted }]}>{card.subtitle}</Text>
                </View>
            </Pressable>
        </Animated.View>
    );
}

function Metric({ label, value, active = false }) {
    return (
        <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>{label}</Text>
            <Text style={[styles.metricValue, active ? styles.metricActive : styles.metricInactive]}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 85,
        backgroundColor: '#0D0D0F',
        justifyContent: 'space-between',
    },
    sosStatusBar: {
        minHeight: 28,
        marginTop: -24,
        marginHorizontal: -20,
        marginBottom: 8,
        paddingHorizontal: 12,
        backgroundColor: '#C21852',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sosStatusText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '600',
        textAlign: 'center',
    },
    userHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    userInfo: {
        flex: 1,
        minWidth: 0,
        marginRight: 12,
    },
    greeting: {
        fontSize: 13,
        color: '#7E7E86',
        marginBottom: 3,
    },
    name: {
        fontSize: 26,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    avatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#E03168',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 16,
    },
    sosContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 'auto',
    },
    sosTitle: {
        position: 'absolute',
        top: -45,
        zIndex: 1,
        fontSize: 11,
        fontWeight: '600',
        color: '#7D7D85',
        letterSpacing: 1.2,
        textAlign: 'center',
    },
    sosButton: {
        width: 230,
        height: 230,
        borderRadius: 130,
        marginTop: -15,
        backgroundColor: '#C21852',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
        shadowColor: '#C21852',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8,
    },
    sosButtonPending: {
        backgroundColor: '#9F2F4F',
    },
    sosButtonPulse: {
        backgroundColor: '#E04C78',
    },
    sosLabel: {
        marginTop: 4,
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 2,
    },
    sosSubtitle: {
        marginTop: 4,
        fontSize: 11,
        color: 'rgba(255,255,255,0.85)',
        textAlign: 'center',
        maxWidth: 120,
        lineHeight: 14,
    },
    bottomSection: {
        width: '100%',
        gap: 12,
    },
    grid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cardWrapper: {
        width: '48.3%',
    },
    actionCard: {
        width: '100%',
        height: 122,
        backgroundColor: '#17171A',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        borderRadius: 18,
        padding: 14,
        gap: 12,
    },
    iconWrap: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardTitle: {
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: '600',
        marginBottom: 3,
    },
    cardSubtitle: {
        fontSize: 11,
        color: '#7D7D85',
    },
    summaryCard: {
        backgroundColor: '#17171A',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        borderRadius: 18,
        padding: 16,
    },
    summaryTitle: {
        fontSize: 10.5,
        color: '#7D7D85',
        letterSpacing: 1.1,
        fontWeight: '600',
        marginBottom: 14,
    },
    summaryMetrics: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    metricItem: {
        flex: 1,
        gap: 4,
    },
    metricLabel: {
        color: '#7D7D85',
        fontSize: 11,
    },
    metricValue: {
        fontSize: 13,
        fontWeight: '600',
    },
    metricActive: {
        color: '#2ECC71',
    },
    metricInactive: {
        color: '#EB5757',
    },
    divider: {
        width: 1,
        height: 28,
        backgroundColor: 'rgba(255,255,255,0.07)',
        marginHorizontal: 8,
    },
});