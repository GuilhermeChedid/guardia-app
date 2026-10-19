import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function FeedbackBanner({ feedback, onClose }) {
    if (!feedback) return null;

    const isError = feedback.type === 'error';
    return (
        <View style={[styles.banner, isError ? styles.error : styles.success]}>
            <MaterialCommunityIcons
                name={isError ? 'alert-circle-outline' : 'check-circle-outline'}
                size={20}
                color="#FFFFFF"
            />
            <Text style={styles.text}>{feedback.message}</Text>
            {onClose && (
                <Pressable onPress={onClose} accessibilityLabel="Fechar mensagem">
                    <MaterialCommunityIcons name="close" size={18} color="#FFFFFF" />
                </Pressable>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    banner: {
        position: 'absolute',
        top: 16,
        left: 16,
        right: 16,
        zIndex: 30,
        elevation: 30,
        minHeight: 48,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    success: { backgroundColor: '#2E8B57' },
    error: { backgroundColor: '#B83B4A' },
    text: { flex: 1, color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
});
