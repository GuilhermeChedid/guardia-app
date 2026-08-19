import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';

import MobileFrame from '../../components/MobileFrame/MobileFrame';
import BottomNav from '../../components/BottomNav/BottomNav';
import { MESSAGES } from '../../constants/messages';

const CARDS = [
    { title: 'Compartilhar Local', subtitle: 'Com contatos', color: '#E03168', bg: 'rgba(224,49,104,0.12)', icon: 'map-marker' },
    { title: 'Gravar Evidencia', subtitle: 'Seguro e criptografado', color: '#EB5757', bg: 'rgba(235,87,87,0.12)', icon: 'record-circle' },
    { title: 'Alertar Contatos', subtitle: 'Enviar mensagem', color: '#F2994A', bg: 'rgba(242,153,74,0.12)', icon: 'bell-outline' },
    { title: 'Conteudo Informativo', subtitle: 'Apoio e emergencias', color: '#27AE60', bg: 'rgba(39,174,96,0.12)', icon: 'shield-half-full' },
];

export default function HomeScreen() {
    return (
        <MobileFrame backgroundColor="#0D0D0F">
            <View style={styles.container}>
                <View style={styles.userHeader}>
                    <View>
                        <Text style={styles.greeting}>Bem-vinda de volta</Text>
                        <Text style={styles.name}>Maria Clara</Text>
                    </View>
                    <View style={styles.avatar}><Text style={styles.avatarText}>M</Text></View>
                </View>

                <View style={styles.sosContainer}>
                    <Text style={styles.sosTitle}>PRESSIONE EM CASO DE EMERGENCIA</Text>
                    <Pressable
                        style={styles.sosButton}
                        onPress={() => Alert.alert('Alerta', MESSAGES.MSG12)}
                    >
                        <Feather name="phone-call" size={28} color="#FFFFFF" />
                        <Text style={styles.sosLabel}>SOS</Text>
                        <Text style={styles.sosSubtitle}>Pressione para acionar ajuda</Text>
                    </Pressable>
                </View>

                <View style={styles.grid}>
                    {CARDS.map((card) => (
                        <View key={card.title} style={styles.actionCard}>
                            <View style={[styles.iconWrap, { backgroundColor: card.bg }]}> 
                                <MaterialCommunityIcons name={card.icon} size={18} color={card.color} />
                            </View>
                            <View>
                                <Text style={styles.cardTitle}>{card.title}</Text>
                                <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>RESUMO DE SEGURANCA</Text>
                    <View style={styles.summaryMetrics}>
                        <Metric label="Contatos" value="4 ativos" active />
                        <View style={styles.divider} />
                        <Metric label="Localizacao" value="Inativa" />
                        <View style={styles.divider} />
                        <Metric label="Gravacoes" value="3 salvas" active />
                    </View>
                </View>
            </View>
            <BottomNav active="Home" />
        </MobileFrame>
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
        paddingBottom: 92,
        backgroundColor: '#0D0D0F',
    },
    userHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 28,
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
        marginBottom: 32,
    },
    sosTitle: {
        fontSize: 11,
        fontWeight: '600',
        color: '#7D7D85',
        letterSpacing: 1.2,
        marginBottom: 22,
    },
    sosButton: {
        width: 175,
        height: 175,
        borderRadius: 88,
        backgroundColor: '#C21852',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    sosLabel: {
        marginTop: 4,
        fontSize: 26,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 2,
    },
    sosSubtitle: {
        marginTop: 4,
        fontSize: 11,
        color: 'rgba(255,255,255,0.85)',
        textAlign: 'center',
        maxWidth: 110,
        lineHeight: 14,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    actionCard: {
        width: '48.3%',
        backgroundColor: '#17171A',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        borderRadius: 18,
        padding: 14,
        marginBottom: 12,
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
