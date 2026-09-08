import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text } from 'react-native';

import AppNavigator from './navigation/AppNavigator';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { PostsProvider } from './context/PostsContext';
import { UserProfileProvider } from './context/UserProfileContext';

export default function App() {
    return (
        <ThemeProvider>
            <PostsProvider>
                <UserProfileProvider>
                    <ThemedApp />
                </UserProfileProvider>
            </PostsProvider>
        </ThemeProvider>
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
