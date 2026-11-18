import axios from 'axios';

const defaultApiUrl = 'https://guardia-app-tan.vercel.app/api';

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
