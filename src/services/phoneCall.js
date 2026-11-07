import { Linking, PermissionsAndroid, Platform } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';

export async function callPhoneNumber(phone) {
    const normalizedPhone = String(phone || '').replace(/[^\d+]/g, '');
    if (!normalizedPhone) return 'unavailable';

    if (Platform.OS === 'android') {
        const permission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CALL_PHONE,
            {
                title: 'Permissão para ligação',
                message: 'Permita que o Guardiã faça a ligação de emergência diretamente.',
                buttonPositive: 'Permitir',
                buttonNegative: 'Cancelar',
            },
        );

        if (permission === PermissionsAndroid.RESULTS.GRANTED) {
            await IntentLauncher.startActivityAsync('android.intent.action.CALL', {
                data: `tel:${normalizedPhone}`,
            });
            return 'direct';
        }
    }

    const phoneUrl = `tel:${normalizedPhone}`;
    if (await Linking.canOpenURL(phoneUrl)) {
        await Linking.openURL(phoneUrl);
        return 'dialer';
    }

    return 'unavailable';
}
