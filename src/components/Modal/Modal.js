import React from 'react';
import { Modal as RNModal, View, Text, StyleSheet, Pressable } from 'react-native';

export default function Modal({ visible, title, message, onClose }) {
    return (
        <RNModal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.card}>
                    {title ? <Text style={styles.title}>{title}</Text> : null}
                    {message ? <Text style={styles.message}>{message}</Text> : null}

                    <Pressable onPress={onClose} style={styles.button}>
                        <Text style={styles.buttonText}>Fechar</Text>
                    </Pressable>
                </View>
            </View>
        </RNModal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    card: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 10,
        color: '#121212',
    },
    message: {
        fontSize: 15,
        color: '#374151',
        marginBottom: 18,
    },
    button: {
        alignSelf: 'flex-end',
        backgroundColor: '#E91E63',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    buttonText: {
        color: '#FFF',
        fontWeight: '700',
    },
});
