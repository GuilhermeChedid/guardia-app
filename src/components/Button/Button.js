import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

export default function Button({ title, onPress, variant = 'primary', disabled = false }) {
    return (
        <Pressable
            style={[styles.button, styles[variant], disabled && styles.disabled]}
            onPress={onPress}
            disabled={disabled}
        >
            <Text style={styles.text}>{title}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
    },
    primary: {
        backgroundColor: '#E91E63',
    },
    secondary: {
        backgroundColor: '#121212',
    },
    disabled: {
        opacity: 0.5,
    },
    text: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 16,
    },
});
