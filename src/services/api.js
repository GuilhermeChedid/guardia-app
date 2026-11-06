import axios from 'axios';
import { Platform } from 'react-native';

const localApiUrl = Platform.OS === 'android'
    ? 'http://10.0.2.2:3000/api'
    : Platform.OS === 'ios'
        ? 'http://192.168.1.15:3000/api'
        : 'http://localhost:3000/api';

const defaultApiUrl = __DEV__
    ? localApiUrl
    : 'https://guardia-app-tan.vercel.app/api';

const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL || defaultApiUrl,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getAssetUrl = (assetPath) => {
    if (!assetPath || assetPath.startsWith('http')) return assetPath;
    const baseUrl = api.defaults.baseURL.replace(/\/api$/, '');
    return `${baseUrl}${assetPath}`;
};

export default api;
