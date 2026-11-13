import React, { useEffect } from 'react';
import { AppState } from 'react-native';
import { createNavigationContainerRef, NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from '../telas/Login/login';
import RegisterScreen from '../telas/cadastro/cadastro';
import HomeScreen from '../telas/Home/Home';
import ContatosScreen from '../telas/Contatos/contatos';
import ProvasScreen from '../telas/Provas/provas';
import InformacoesScreen from '../telas/Support/InformacoesScreen';
import PerfilScreen from '../telas/Perfil/Perfil';
import AdminScreen from '../telas/adm/adm';

const Stack = createStackNavigator();
export const navigationRef = createNavigationContainerRef();
const AUTH_USER_KEY = '@guardia/auth_user';
const SESSION_DURATION_MS = 10 * 60 * 1000;

export default function AppNavigator() {
    useEffect(() => {
        let checking = false;
        const expireSessionIfNeeded = async () => {
            if (checking) return;
            checking = true;
            try {
                const storedUser = await AsyncStorage.getItem(AUTH_USER_KEY);
                const user = storedUser ? JSON.parse(storedUser) : null;
                if (!user?.loginAt || Date.now() - user.loginAt < SESSION_DURATION_MS) return;
                await AsyncStorage.removeItem(AUTH_USER_KEY);
                if (navigationRef.isReady() && navigationRef.getCurrentRoute()?.name !== 'Login') {
                    navigationRef.reset({ index: 0, routes: [{ name: 'Login' }] });
                }
            } catch (error) {
                console.error('Erro ao validar a sessão:', error);
            } finally {
                checking = false;
            }
        };

        expireSessionIfNeeded();
        const interval = setInterval(expireSessionIfNeeded, 30000);
        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') expireSessionIfNeeded();
        });
        return () => {
            clearInterval(interval);
            subscription.remove();
        };
    }, []);

    return (
        <NavigationContainer ref={navigationRef}>
            <Stack.Navigator
                initialRouteName="Login"
                screenOptions={{
                    headerShown: false,
                    animation: 'none',
                }}
            >
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Contatos" component={ContatosScreen} />
                <Stack.Screen name="Provas" component={ProvasScreen} />
                <Stack.Screen name="Informacoes" component={InformacoesScreen} />
                <Stack.Screen name="Perfil" component={PerfilScreen} />
                <Stack.Screen name="Admin" component={AdminScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
