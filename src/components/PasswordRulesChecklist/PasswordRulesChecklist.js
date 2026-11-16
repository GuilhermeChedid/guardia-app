import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const PASSWORD_RULES = [
    { label: 'Mínimo 8 caracteres', test: (password) => password.length >= 8 },
    { label: '1 letra maiúscula', test: (password) => /[A-Z]/.test(password) },
    { label: '1 letra minúscula', test: (password) => /[a-z]/.test(password) },
    { label: '1 número', test: (password) => /\d/.test(password) },
    { label: '1 caractere especial (!@#$%&*_-)', test: (password) => /[!@#$%&*_-]/.test(password) },
    { label: 'Não possuir espaços', test: (password) => password.length > 0 && !/\s/.test(password) },
];

export default function PasswordRulesChecklist({ password, style }) {
    return (
        <View style={[styles.rules, style]}>
            {PASSWORD_RULES.map((rule) => {
                const valid = rule.test(password);
                return (
                    <View key={rule.label} style={styles.ruleRow}>
                        <MaterialCommunityIcons
                            name={valid ? 'check-circle' : 'circle-outline'}
                            size={15}
                            color={valid ? '#4CAF50' : '#7C7C82'}
                        />
                        <Text style={[styles.rule, valid && styles.ruleValid]}>{rule.label}</Text>
                    </View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    rules: {
        marginTop: 2,
        marginBottom: 12,
        paddingLeft: 4,
        gap: 4,
    },
    ruleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rule: {
        color: '#7C7C82',
        fontSize: 12,
        marginLeft: 6,
    },
    ruleValid: {
        color: '#4CAF50',
    },
});
