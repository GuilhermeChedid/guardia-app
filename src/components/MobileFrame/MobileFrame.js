import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';

export default function MobileFrame({ children, backgroundColor = '#0D0D0F' }) {
    return (
        <SafeAreaView style={styles.screen}>
            <View style={[styles.frame, { backgroundColor }]}>{children}</View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#050505',
        alignItems: 'center',
    },
    frame: {
        flex: 1,
        width: '100%',
        maxWidth: 390,
        minHeight: '100%',
        position: 'relative',
        overflow: 'hidden',
    },
});
