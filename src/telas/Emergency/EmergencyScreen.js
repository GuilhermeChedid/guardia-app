import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import Button from '../../components/Button/Button';
import { MESSAGES } from '../../constants/messages';

export default function EmergencyScreen() {
    const triggerEmergency = () => {
        Alert.alert('Alerta', MESSAGES.MSG12);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Botão de pânico</Text>
            <Text style={styles.subtitle}>Ative o alerta em caso de risco imediato.</Text>

            <Button title="Enviar alerta" onPress={triggerEmergency} />
            <Button title="Ver perfil" variant="secondary" onPress={() => { }} />
            <Button title="Suporte" variant="secondary" onPress={() => { }} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
        backgroundColor: '#121212',
    },
    title: {
        fontSize: 30,
        fontWeight: '800',
        color: '#FFF',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#E5E7EB',
        textAlign: 'center',
        marginBottom: 20,
    },
});
