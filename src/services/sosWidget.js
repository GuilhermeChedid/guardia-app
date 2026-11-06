import React from 'react';
import { Platform, Pressable, StyleSheet, Text } from 'react-native';
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
    const [expanded, setExpanded] = React.useState(false);

    const handlePress = async () => {
        if (!expanded) {
            setExpanded(true);
            return;
        }

        const activeSession = await AsyncStorage.getItem(ACTIVE_SOS_SESSION_KEY);
        if (activeSession) {
            try {
                await stopSosTracking();
            } catch (error) {
                console.error('Erro ao encerrar SOS pelo widget:', error);
            }
            await AsyncStorage.setItem(PENDING_SOS_STORAGE_KEY, 'false');
            if (navigationRef.isReady()) {
                navigationRef.navigate('Home', { stopSos: true });
            }
            close();
            await openApp();
            return;
        }

        await AsyncStorage.setItem(PENDING_SOS_STORAGE_KEY, 'true');
        if (navigationRef.isReady()) {
            navigationRef.navigate('Home', { startSos: true });
        }
        close();
        await openApp();
    };

    return (
        <Pressable
            style={[styles.bubble, expanded && styles.bubbleExpanded]}
            onPress={handlePress}
            accessibilityLabel={expanded ? 'Confirmar ativação do SOS' : 'Abrir widget SOS'}
        >
            <MaterialCommunityIcons name="alarm-light-outline" size={27} color="#FFFFFF" />
            {expanded ? <Text style={styles.label}>TOQUE NOVAMENTE</Text> : null}
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
        backgroundColor: 'rgba(200, 60, 89, 0.72)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
        elevation: 8,
    },
    bubbleExpanded: {
        width: 118,
        borderRadius: 34,
    },
    label: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '800',
        marginTop: 1,
    },
});
