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

export const SOS_WIDGET_ID = 'guardia-sos';
export const PENDING_SOS_STORAGE_KEY = '@guardia/pending-sos';

export function SosBubble({ close }) {
    const handlePress = async () => {
        await AsyncStorage.setItem(PENDING_SOS_STORAGE_KEY, 'true');
        if (navigationRef.isReady()) {
            navigationRef.navigate('Home', { startSos: true });
        }
        close();
        await openApp();
    };

    return (
        <Pressable style={styles.bubble} onPress={handlePress} accessibilityLabel="Acionar SOS">
            <MaterialCommunityIcons name="alarm-light-outline" size={27} color="#FFFFFF" />
            <Text style={styles.label}>SOS</Text>
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
        backgroundColor: '#C83C59',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
        elevation: 8,
    },
    label: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '800',
        marginTop: 1,
    },
});
