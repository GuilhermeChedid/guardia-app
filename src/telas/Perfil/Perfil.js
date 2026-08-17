import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';

import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { cepMask } from '../../utils/masks';
import { MESSAGES } from '../../constants/messages';

export default function ProfileScreen() {
    const [profile, setProfile] = useState({
        maritalStatus: '',
        address: '',
        cep: '',
    });

    const updateField = (field, value) => setProfile((prev) => ({ ...prev, [field]: value }));

    const handleSave = () => {
        if (!profile.maritalStatus || !profile.address || !profile.cep) {
            Alert.alert('Atenção', MESSAGES.MSG01);
            return;
        }

        Alert.alert('Sucesso', `${MESSAGES.MSG09} ${MESSAGES.MSG10}`);
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Perfil</Text>

            <Input
                label="Estado civil"
                value={profile.maritalStatus}
                onChangeText={(value) => updateField('maritalStatus', value)}
                placeholder="Solteiro(a), Casado(a)..."
            />

            <Input
                label="Endereço"
                value={profile.address}
                onChangeText={(value) => updateField('address', value)}
                placeholder="Rua, número, bairro"
            />

            <Input
                label="CEP"
                value={cepMask(profile.cep)}
                onChangeText={(value) => updateField('cep', value.replace(/\D/g, ''))}
                placeholder="00000-000"
                keyboardType="numeric"
            />

            <Button title="Salvar perfil" onPress={handleSave} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 24,
        backgroundColor: '#F7F7F7',
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 20,
        color: '#121212',
        textAlign: 'center',
    },
});
