import React from 'react';
import { Image, Platform, Pressable, StyleSheet, Text } from 'react-native';
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

import { navigationRef } from '../navigation/AppNavigator';
import { ACTIVE_SOS_SESSION_KEY, stopSosTracking } from './sosTracking';

export const SOS_WIDGET_ID = 'guardia-sos';
export const PENDING_SOS_STORAGE_KEY = '@guardia/pending-sos';
export const SOS_WIDGET_ENABLED_KEY = '@guardia/sos-widget-enabled';

export function SosBubble({ close }) {
    const [customization, setCustomization] = React.useState({});
    const [isActive, setIsActive] = React.useState(false);

    React.useEffect(() => {
        let mounted = true;
        Promise.all([
            AsyncStorage.getItem('@guardia/settings_customization'),
            AsyncStorage.getItem(ACTIVE_SOS_SESSION_KEY),
        ]).then(([savedCustomization, activeSession]) => {
            if (!mounted) return;
            setCustomization(savedCustomization ? JSON.parse(savedCustomization) : {});
            setIsActive(Boolean(activeSession));
        }).catch((error) => {
            console.error('Erro ao carregar personalização do widget:', error);
        });
        return () => {
            mounted = false;
        };
    }, []);

    const handlePress = async () => {
        const activeSession = await AsyncStorage.getItem(ACTIVE_SOS_SESSION_KEY);
        const pendingSos = await AsyncStorage.getItem(PENDING_SOS_STORAGE_KEY);
        if (activeSession || pendingSos === 'true') {
            try {
                if (activeSession) {
                    await stopSosTracking();
                }
            } catch (error) {
                console.error('Erro ao encerrar SOS pelo widget:', error);
            }
            await AsyncStorage.setItem(PENDING_SOS_STORAGE_KEY, 'false');
            setIsActive(false);
            if (navigationRef.isReady()) {
                navigationRef.navigate('Home', { stopSos: true });
            }
            await openApp();
            return;
        }

        await AsyncStorage.setItem(PENDING_SOS_STORAGE_KEY, 'true');
        setIsActive(true);
        if (navigationRef.isReady()) {
            navigationRef.navigate('Home', { startSos: true });
        }
        await openApp();
    };

    return (
        <Pressable
            style={[styles.bubble, isActive && styles.bubbleActive]}
            onPress={handlePress}
            accessibilityLabel={isActive ? 'Cancelar SOS' : 'Ativar SOS'}
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

export function disableSosWidget() {
    if (Platform.OS === 'android') {
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
