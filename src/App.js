import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text } from 'react-native';

import AppNavigator from './navigation/AppNavigator';

export default function App() {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />
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
    helper: {
        display: 'none',
    },
});
