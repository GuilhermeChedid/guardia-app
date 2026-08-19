import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const ITEMS = [
    { key: 'Home', label: 'Inicio', icon: 'home' },
    { key: 'Contatos', label: 'Contatos', icon: 'account-group' },
    { key: 'Provas', label: 'Provas', icon: 'file-document-outline' },
    { key: 'Informacoes', label: 'Informacoes', icon: 'shield-half-full' },
    { key: 'Perfil', label: 'Perfil', icon: 'account-outline' },
];

export default function BottomNav({ active }) {
    const navigation = useNavigation();

    return (
        <View style={styles.bottomNav}>
            {ITEMS.map((item) => {
                const isActive = item.key === active;
                return (
                    <Pressable
                        key={item.key}
                        style={styles.navItem}
                        onPress={() => navigation.navigate(item.key)}
                    >
                        <MaterialCommunityIcons
                            name={item.icon}
                            size={20}
                            color={isActive ? '#E03168' : '#6E6E76'}
                        />
                        <Text style={[styles.label, isActive && styles.labelActive]}>{item.label}</Text>
                        {isActive ? <View style={styles.activeDot} /> : null}
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    bottomNav: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#121215',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.06)',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 18,
        paddingHorizontal: 10,
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
        position: 'relative',
    },
    label: {
        fontSize: 10,
        fontWeight: '500',
        color: '#6E6E76',
    },
    labelActive: {
        color: '#E03168',
    },
    activeDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#E03168',
        position: 'absolute',
        bottom: -6,
    },
});
