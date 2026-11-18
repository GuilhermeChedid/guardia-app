import React from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, ToastAndroid } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    canDrawOverlays,
    closeBubble,
    openApp,
    requestPermission,
    setBubbleRendererForBubble,
    showBubble,
} from 'expo-draw-over-apps';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import api from './api';
import { ACTIVE_SOS_SESSION_KEY, startSosTracking, stopSosTracking } from './sosTracking';

export const SOS_WIDGET_ID = 'guardia-sos';
export const PENDING_SOS_STORAGE_KEY = '@guardia/pending-sos';
export const SOS_WIDGET_ENABLED_KEY = '@guardia/sos-widget-enabled';
let runtimeCustomization = null;

async function activateSosFromWidget(user) {
    const foregroundPermission = await Location.getForegroundPermissionsAsync();
    const backgroundPermission = await Location.getBackgroundPermissionsAsync();
    if (foregroundPermission.status !== 'granted' || backgroundPermission.status !== 'granted') {
        throw new Error('Ative as permissoes de localizacao nas configuracoes do app.');
    }

    const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
    });
    const { latitude, longitude, accuracy } = location.coords;
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        throw new Error('Nao foi possivel obter sua localizacao.');
    }
    if (accuracy && accuracy > 500) {
        throw new Error('A localizacao esta imprecisa. Ative o GPS e tente novamente.');
    }

    const contactsResponse = await api.get(`/auth/contacts/${user.id}`);
    const telegramContacts = (contactsResponse.data?.contacts || [])
        .filter((contact) => contact.telegram_vinculado);
    if (!telegramContacts.length) {
        throw new Error('Vincule um contato ao Telegram antes de usar o widget SOS.');
    }

    await api.post('/admin/reports/sos/events', { usuario_id: user.id });
    const sosResponse = await api.post('/auth/sos/telegram', {
        usuario_id: user.id,
        nome: user.nome || 'Usuaria',
        latitude,
        longitude,
        accuracy,
    });
    const sessionId = sosResponse.data?.session_id;
    if (!sessionId) throw new Error('O servidor nao confirmou o acionamento do SOS.');

    try {
        await startSosTracking(sessionId);
    } catch (error) {
        await api.post(`/auth/sos/telegram/${sessionId}/stop`).catch((stopError) => {
            console.error('Erro ao cancelar SOS sem rastreamento:', stopError);
        });
        throw error;
    }

    await AsyncStorage.removeItem(PENDING_SOS_STORAGE_KEY);
}

export function SosBubble({ close }) {
    const [customization, setCustomization] = React.useState({});
    const [isActive, setIsActive] = React.useState(false);
    const [isWorking, setIsWorking] = React.useState(false);
    const actionLockRef = React.useRef(false);

    React.useEffect(() => {
        let mounted = true;
        Promise.all([
            AsyncStorage.getItem('@guardia/settings_customization'),
            AsyncStorage.getItem(ACTIVE_SOS_SESSION_KEY),
        ]).then(([savedCustomization, activeSession]) => {
            if (!mounted) return;
            setCustomization(runtimeCustomization || (savedCustomization ? JSON.parse(savedCustomization) : {}));
            setIsActive(Boolean(activeSession));
        }).catch((error) => {
            console.error('Erro ao carregar personalização do widget:', error);
        });
        return () => {
            mounted = false;
        };
    }, []);

    const handlePress = async () => {
        if (actionLockRef.current) return;
        actionLockRef.current = true;
        setIsWorking(true);
        try {
            const activeSession = await AsyncStorage.getItem(ACTIVE_SOS_SESSION_KEY);
            const storedUser = await AsyncStorage.getItem('@guardia/auth_user');
            const user = storedUser ? JSON.parse(storedUser) : null;
            if (!user?.id) {
                await AsyncStorage.multiRemove([SOS_WIDGET_ENABLED_KEY, PENDING_SOS_STORAGE_KEY]);
                disableSosWidget();
                await openApp();
                return;
            }

            if (activeSession) {
                await stopSosTracking();
                await AsyncStorage.removeItem(PENDING_SOS_STORAGE_KEY);
                setIsActive(false);
                ToastAndroid.show('SOS encerrado.', ToastAndroid.SHORT);
                return;
            }

            await AsyncStorage.removeItem(PENDING_SOS_STORAGE_KEY);
            await activateSosFromWidget(user);
            setIsActive(true);
            ToastAndroid.show('SOS ativado. Seus contatos receberam o alerta.', ToastAndroid.LONG);
        } catch (error) {
            setIsActive(false);
            console.error('Erro ao processar toque no widget SOS:', error);
            ToastAndroid.show(error.message || 'Nao foi possivel ativar o SOS.', ToastAndroid.LONG);
        } finally {
            actionLockRef.current = false;
            setIsWorking(false);
        }
    };

    return (
        <Pressable
            style={[styles.bubble, isActive && styles.bubbleActive]}
            onPress={handlePress}
            disabled={isWorking}
            accessibilityLabel={isWorking ? 'SOS em andamento' : isActive ? 'Encerrar SOS' : 'Ativar SOS'}
        >
            {customization.widgetPhoto ? (
                <Image source={{ uri: customization.widgetPhoto }} style={styles.widgetImage} />
            ) : (
                <MaterialCommunityIcons name="alarm-light-outline" size={27} color="#FFFFFF" />
            )}
            <Text style={styles.label}>{customization.widgetName || (isActive ? 'SOS ativo' : 'SOS')}</Text>
        </Pressable>
    );
}

export function configureSosWidget() {
    if (Platform.OS === 'android') {
        setBubbleRendererForBubble(SOS_WIDGET_ID, SosBubble);
    }
}

export async function enableSosWidget() {
    if (Platform.OS !== 'android') {
        return { enabled: false, reason: 'unsupported-platform' };
    }

    if (!canDrawOverlays()) {
        const permissionGranted = await requestPermission();
        if (!permissionGranted || !canDrawOverlays()) {
            return { enabled: false, reason: 'permission-denied' };
        }
    }

    await showBubble(SOS_WIDGET_ID, { edgeHideEnabled: true });
    return { enabled: true };
}

export async function restoreSosWidget() {
    if (Platform.OS !== 'android' || !canDrawOverlays()) {
        return false;
    }

    await showBubble(SOS_WIDGET_ID, { edgeHideEnabled: true });
    return true;
}

export async function refreshSosWidget(customization) {
    if (Platform.OS !== 'android') return false;
    runtimeCustomization = { ...customization };
    setBubbleRendererForBubble(SOS_WIDGET_ID, SosBubble);
    if (canDrawOverlays()) {
        closeBubble(SOS_WIDGET_ID);
        await new Promise((resolve) => setTimeout(resolve, 100));
        await showBubble(SOS_WIDGET_ID, { edgeHideEnabled: true });
        return true;
    }
    return false;
}

export function disableSosWidget() {
    if (Platform.OS === 'android') {
        runtimeCustomization = null;
        closeBubble(SOS_WIDGET_ID);
    }
}

const styles = StyleSheet.create({
    bubble: {
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: 'rgba(200, 60, 89, 0.52)',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
    },
    bubbleActive: {
        backgroundColor: 'rgba(39, 174, 96, 0.52)',
    },
    label: {
        color: '#FFFFFF',
        fontSize: 9,
        fontWeight: '800',
        marginTop: 1,
    },
    widgetImage: {
        width: 34,
        height: 34,
        borderRadius: 17,
        marginBottom: 2,
    },
});
