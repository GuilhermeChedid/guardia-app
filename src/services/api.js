import axios from 'axios';
import { Platform } from 'react-native';

const defaultApiUrl = Platform.OS === 'android'
    ? 'http://10.0.2.2:3000/api'
    : Platform.OS === 'ios'
        ? 'http://192.168.1.16:3000/api'
        : 'http://localhost:3000/api';

const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL || defaultApiUrl,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
