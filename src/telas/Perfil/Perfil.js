import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import MobileFrame from '../../components/MobileFrame/MobileFrame';
import BottomNav from '../../components/BottomNav/BottomNav';

export default function PerfilScreen() {
    const navigation = useNavigation();
    const [perfil, setPerfil] = useState({
        nome: 'Maria Clara Santos',
        email: 'mariaclara@email.com',
        telefone: '(11) 98765-4321',
        endereco: 'Rua das Flores, 42 — Sao Paulo, SP',
        estadoCivil: 'Solteira',
        cpf: '***.456.***-00',
    });

    const updateField = (field, value) => setPerfil((prev) => ({ ...prev, [field]: value }));

    return (
        <MobileFrame backgroundColor="#0D0D0D">
            <View style={styles.appContainer}>
                <View style={styles.header}>
                    <View style={styles.navTop}>
                        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
                            <MaterialCommunityIcons name="chevron-left" size={20} color="#FFFFFF" />
                        </Pressable>
                        <Text style={styles.screenTitle}>Editar Perfil</Text>
                        <View style={styles.spacer} />
                    </View>
                </View>

                <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
                    <View style={styles.profileSection}>
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatar}><Text style={styles.avatarText}>M</Text></View>
                            <Pressable style={styles.editAvatarBtn}>
                                <MaterialCommunityIcons name="pencil" size={12} color="#FFFFFF" />
                            </Pressable>
                        </View>
                        <Text style={styles.avatarHint}>Toque para alterar a foto</Text>
                    </View>

                    <Field label="NOME COMPLETO" value={perfil.nome} onChangeText={(v) => updateField('nome', v)} />
                    <Field label="E-MAIL" value={perfil.email} onChangeText={(v) => updateField('email', v)} />
                    <Field label="TELEFONE" value={perfil.telefone} onChangeText={(v) => updateField('telefone', v)} />
                    <Field label="ENDERECO" value={perfil.endereco} onChangeText={(v) => updateField('endereco', v)} />
                    <Field label="ESTADO CIVIL" value={perfil.estadoCivil} onChangeText={(v) => updateField('estadoCivil', v)} />
                    <Field label="CPF" value={perfil.cpf} editable={false} helper="O CPF nao pode ser alterado" />

                    <Pressable style={styles.saveBtn}>
                        <Text style={styles.saveBtnText}>Salvar alteracoes</Text>
                    </Pressable>
                </ScrollView>

                <BottomNav active="Perfil" />
            </View>
        </MobileFrame>
    );
}

function Field({ label, helper, ...props }) {
    return (
        <View style={styles.formGroup}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                {...props}
                style={[styles.input, props.editable === false && styles.disabledInput]}
                placeholderTextColor="#8E8E93"
            />
            {helper ? <Text style={styles.helper}>{helper}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    appContainer: {
        flex: 1,
        backgroundColor: '#0D0D0D',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#2C2C2E',
    },
    navTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 15,
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#1C1C1E',
        alignItems: 'center',
        justifyContent: 'center',
    },
    screenTitle: {
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: 0.5,
        color: '#FFFFFF',
    },
    spacer: {
        width: 36,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    contentInner: {
        paddingTop: 24,
        paddingBottom: 100,
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 12,
    },
    avatar: {
        width: 86,
        height: 86,
        borderRadius: 43,
        backgroundColor: '#C83C59',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 32,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    editAvatarBtn: {
        position: 'absolute',
        right: -4,
        bottom: 0,
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: '#0D0D0D',
        backgroundColor: '#C83C59',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarHint: {
        fontSize: 13,
        color: '#8E8E93',
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 11,
        fontWeight: '600',
        color: '#8E8E93',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    input: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'transparent',
        backgroundColor: '#1C1C1E',
        color: '#FFFFFF',
        fontSize: 15,
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    disabledInput: {
        color: '#8E8E93',
    },
    helper: {
        marginTop: 6,
        fontSize: 11,
        color: '#8E8E93',
    },
    saveBtn: {
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
        backgroundColor: '#C83C59',
        marginTop: 4,
    },
    saveBtnText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
});
