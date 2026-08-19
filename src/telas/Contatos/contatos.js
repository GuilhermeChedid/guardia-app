import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import MobileFrame from '../../components/MobileFrame/MobileFrame';
import BottomNav from '../../components/BottomNav/BottomNav';

export default function ContatosScreen() {
    return (
        <MobileFrame backgroundColor="#0D0D0F">
            <View style={styles.container}>
                <Text style={styles.title}>Contatos</Text>
                <Text style={styles.subtitle}>Area de contatos de confianca e apoio da Guardia.</Text>
            </View>
            <BottomNav active="Contatos" />
        </MobileFrame>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        paddingBottom: 90,
        backgroundColor: '#0D0D0F',
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#F3F4F6',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: '#A1A1AA',
        lineHeight: 22,
    },
});
