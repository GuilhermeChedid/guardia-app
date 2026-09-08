import React from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function MobileFrame({ children, backgroundColor = '#0D0D0F', useThemeColors = true }) {
    const { isLight, colors } = useTheme();
    const frameColor = useThemeColors && isLight ? colors.background : backgroundColor;

    return (
        <SafeAreaView style={[styles.screen, { backgroundColor: useThemeColors && isLight ? colors.background : '#050505' }]}>
            <KeyboardAvoidingView
                style={styles.keyboardFrame}
                behavior={Platform.OS === 'ios' ? 'padding' : Platform.OS === 'android' ? 'height' : undefined}
            >
                <View style={[styles.frame, { backgroundColor: frameColor }]}>{children}</View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#050505',
        alignItems: 'center',
    },
    keyboardFrame: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
    },
    frame: {
        flex: 1,
        width: '100%',
        maxWidth: 390,
        minHeight: '100%',
        position: 'relative',
        overflow: 'hidden',
    },
});
