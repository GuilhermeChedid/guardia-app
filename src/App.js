import React, { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Animated, SafeAreaView, StyleSheet, Text, View, AppState } from 'react-native';
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
    const [showResumeOverlay, setShowResumeOverlay] = useState(false);
    const overlayOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextState) => {
            if (nextState !== 'active') return;

            setShowResumeOverlay(true);
            overlayOpacity.setValue(1);
            Animated.timing(overlayOpacity, {
                toValue: 0,
                duration: 420,
                useNativeDriver: true,
            }).start(({ finished }) => {
                if (finished) setShowResumeOverlay(false);
            });
        });

        return () => subscription.remove();
    }, [overlayOpacity]);

    return (
        <SafeAreaView style={[styles.container, isLight && styles.lightContainer]}>
            <StatusBar style={isLight ? 'dark' : 'light'} />
            <AppNavigator />
            <Text style={styles.helper}>Guardia App</Text>
            {showResumeOverlay && (
                <Animated.View
                    pointerEvents="none"
                    style={[
                        styles.resumeOverlay,
                        { opacity: overlayOpacity, backgroundColor: isLight ? '#F6F7FB' : '#121212' },
                    ]}
                >
                    <View style={[styles.resumeMark, { backgroundColor: isLight ? '#C83C59' : '#E84C6A' }]} />
                </Animated.View>
            )}
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
    resumeOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },
    resumeMark: {
        width: 42,
        height: 6,
        borderRadius: 3,
    },
});
