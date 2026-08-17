import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

export default function Input({ label, value, onChangeText, placeholder, secureTextEntry = false, keyboardType = 'default' }) {
    return (
        <View style={styles.container}>
            {label ? <Text style={styles.label}>{label}</Text> : null}
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                style={styles.input}
                placeholderTextColor="#9CA3AF"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 14,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        color: '#1F1F1F',
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 15,
        backgroundColor: '#FFF',
    },
});
