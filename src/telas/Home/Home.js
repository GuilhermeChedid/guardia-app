import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import MobileFrame from '../../components/MobileFrame/MobileFrame';
import BottomNav from '../../components/BottomNav/BottomNav';
import { MESSAGES } from '../../constants/messages';
import { useTheme } from '../../context/ThemeContext';

const CARDS = [
    { title: 'Guardar Evidência', subtitle: 'Seguro e criptografado', color: '#EB5757', bg: 'rgba(235,87,87,0.12)', icon: 'record-circle' },
    { title: 'Conteúdo Informativo', subtitle: 'Apoio e emergências', color: '#27AE60', bg: 'rgba(39,174,96,0.12)', icon: 'shield-half-full' },
];

export default function HomeScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { colors } = useTheme();
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const [sosCountdown, setSosCountdown] = useState(null);
    const [sosPulse, setSosPulse] = useState(false);
    const [sosDispatched, setSosDispatched] = useState(false);

    useEffect(() => {
        if (sosCountdown === null) return undefined;

        const countdownTimer = setTimeout(() => {
            if (sosCountdown === 1) {
                setSosCountdown(null);
                setSosDispatched(true);
                Alert.alert('Alerta', MESSAGES.MSG12);
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
        } else {
            Alert.alert('Aviso', `A função "${title}" estará disponível em breve.`);
        }
    };

    const handleSosPress = () => {
        if (sosCountdown !== null) {
            setSosCountdown(null);
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
                                : 'SOS disparado · Contatos alertados'}
                        </Text>
                    </View>
                )}
                <View style={styles.userHeader}>
                    <View>
                        <Text style={[styles.greeting, { color: colors.muted }]}>Bem-vinda de volta</Text>
                        <Text style={[styles.name, { color: colors.text }]}>Maria Clara</Text>
                    </View>
                    <Pressable onPress={() => navigation.navigate('Perfil')} style={styles.avatar}>
                        <Text style={styles.avatarText}>M</Text>
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
                                {sosCountdown !== null ? 'Toque para cancelar' : 'Pressione para acionar ajuda'}
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
                            <Metric label="Contatos" value="4 salvos" active />
                            <View style={styles.divider} />
                            <Metric label="Localização" value="Inativa" />
                            <View style={styles.divider} />
                            <Metric label="Evidências" value="3 salvas" active />
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
                    <Text style={[styles.cardTitle, { color: colors.text }]}>{card.title}</Text>
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
        fontSize: 13.5,
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