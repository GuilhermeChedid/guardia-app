import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';

import Button from '../../components/Button/Button';
import { MESSAGES } from '../../constants/messages';

export default function SupportScreen() {
    const requestSupport = () => Alert.alert('Sucesso', MESSAGES.MSG13);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Suporte</Text>
            <Text style={styles.text}>Entre em contato com ajuda especializada e recursos de acolhimento.</Text>

            <Button title="Solicitar apoio" onPress={requestSupport} />
            <Button title="Voltar" variant="secondary" onPress={() => { }} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
        backgroundColor: '#F7F7F7',
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 12,
        color: '#121212',
        textAlign: 'center',
    },
    text: {
        fontSize: 16,
        color: '#374151',
        textAlign: 'center',
        marginBottom: 24,
    },
});
