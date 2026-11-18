const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const nativeModules = new Set([
    'react-native-pdf',
    'expo-draw-over-apps',
    'expo-dynamic-app-icon',
]);
const webStubPath = path.resolve(__dirname, 'src/mocks/nativeWebStub.js');
const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (platform === 'web' && nativeModules.has(moduleName)) {
        return {
            filePath: webStubPath,
            type: 'sourceFile',
        };
    }

    return defaultResolveRequest
        ? defaultResolveRequest(context, moduleName, platform)
        : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
