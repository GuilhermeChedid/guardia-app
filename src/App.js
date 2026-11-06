import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import AppNavigator from './navigation/AppNavigator';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { PostsProvider } from './context/PostsContext';
import { UserProfileProvider } from './context/UserProfileContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureSosWidget, restoreSosWidget, SOS_WIDGET_ENABLED_KEY } from './services/sosWidget';

export default function App() {
    useEffect(() => {
        Promise.all([
            Feather.loadFont(),
            Ionicons.loadFont(),
            MaterialCommunityIcons.loadFont(),
        ]).catch((error) => {
            console.error('Não foi possível carregar as fontes dos ícones:', error);
        });

        configureSosWidget();
        AsyncStorage.getItem(SOS_WIDGET_ENABLED_KEY)
            .then((enabled) => {
                if (enabled === 'true') return restoreSosWidget();
                return false;
            })
            .catch((error) => {
                console.error('Não foi possível restaurar o widget SOS:', error);
            });
    }, []);

    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <PostsProvider>
                    <UserProfileProvider>
                        <ThemedApp />
                    </UserProfileProvider>
                </PostsProvider>
            </ThemeProvider>
        </SafeAreaProvider>
    );
}

function ThemedApp() {
    const { isLight } = useTheme();

    return (
        <SafeAreaView style={[styles.container, isLight && styles.lightContainer]}>
            <StatusBar style={isLight ? 'dark' : 'light'} />
            <AppNavigator />
            <Text style={styles.helper}>Guardia App</Text>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    lightContainer: {
        backgroundColor: '#F6F7FB',
    },
    helper: {
        display: 'none',
    },
});
