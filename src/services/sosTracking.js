import { Platform } from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';

import api from './api';

export const SOS_LOCATION_TASK = 'guardia-sos-location-task';
export const ACTIVE_SOS_SESSION_KEY = '@guardia/active-sos-session';

if (!TaskManager.isTaskDefined(SOS_LOCATION_TASK)) {
    TaskManager.defineTask(SOS_LOCATION_TASK, async ({ data, error }) => {
        if (error) {
            console.error('Erro na tarefa de localização SOS:', error);
            return;
        }

        const sessionId = await AsyncStorage.getItem(ACTIVE_SOS_SESSION_KEY);
        const location = data?.locations?.[data.locations.length - 1];
        const { latitude, longitude } = location?.coords || {};
        if (!sessionId || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            return;
        }

        try {
            await api.patch(`/auth/sos/telegram/${sessionId}/location`, {
                latitude,
                longitude,
            });
        } catch (requestError) {
            console.error('Erro ao enviar atualização de localização SOS:', requestError);
        }
    });
}

export async function startSosTracking(sessionId) {
    if (!sessionId) {
        throw new Error('Sessão SOS inválida.');
    }

    if (Platform.OS === 'web') {
        throw new Error('O rastreamento SOS está disponível apenas no aplicativo.');
    }

    const backgroundPermission = await Location.requestBackgroundPermissionsAsync();
    if (backgroundPermission.status !== 'granted') {
        throw new Error('Permissão de localização em segundo plano não concedida.');
    }

    await AsyncStorage.setItem(ACTIVE_SOS_SESSION_KEY, sessionId);
    const taskRegistered = await TaskManager.isTaskRegisteredAsync(SOS_LOCATION_TASK);
    if (!taskRegistered) {
        await Location.startLocationUpdatesAsync(SOS_LOCATION_TASK, {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 10000,
            distanceInterval: 10,
            pausesUpdatesAutomatically: false,
            foregroundService: {
                notificationTitle: 'SOS ativo',
                notificationBody: 'O Guardia está compartilhando sua localização em tempo real.',
                notificationColor: '#C83C59',
            },
            showsBackgroundLocationIndicator: true,
        });
    }
}

export async function stopSosTracking() {
    const sessionId = await AsyncStorage.getItem(ACTIVE_SOS_SESSION_KEY);
    const taskRegistered = await TaskManager.isTaskRegisteredAsync(SOS_LOCATION_TASK);
    if (taskRegistered) {
        await Location.stopLocationUpdatesAsync(SOS_LOCATION_TASK);
    }
    await AsyncStorage.removeItem(ACTIVE_SOS_SESSION_KEY);

    if (sessionId) {
        await api.post(`/auth/sos/telegram/${sessionId}/stop`);
    }
}
