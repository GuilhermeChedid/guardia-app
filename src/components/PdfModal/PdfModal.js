import React, { useEffect, useState } from 'react';
import {
    Modal,
    View,
    Text,
    Pressable,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Asset } from 'expo-asset';
import Pdf from 'react-native-pdf';

export default function PdfModal({ visible, onClose, title, file }) {
    const [uri, setUri] = useState(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        if (!visible || !file) return;

        let active = true;
        setUri(null);
        setFailed(false);

        (async () => {
            try {
                const asset = Asset.fromModule(file);
                await asset.downloadAsync();
                if (active) setUri(asset.localUri || asset.uri);
            } catch (error) {
                console.error('Erro ao carregar PDF:', error);
                if (active) setFailed(true);
            }
        })();

        return () => {
            active = false;
        };
    }, [visible, file]);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>{title}</Text>

                    <Pressable onPress={onClose} hitSlop={12}>
                        <MaterialCommunityIcons
                            name="close"
                            size={24}
                            color="#EAEAEA"
                        />
                    </Pressable>
                </View>

                {failed ? (
                    <Text style={styles.message}>
                        Não foi possível abrir o documento.
                    </Text>
                ) : uri ? (
                    <Pdf
                        source={{ uri }}
                        style={styles.pdf}
                        onError={(error) => {
                            console.error('Erro no leitor de PDF:', error);
                            setFailed(true);
                        }}
                    />
                ) : (
                    <ActivityIndicator
                        style={styles.loader}
                        color="#D6395B"
                    />
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0B0B0C',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#5B1B2C',
        paddingHorizontal: 24,
        paddingTop: 48,
        paddingBottom: 16,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
    pdf: {
        flex: 1,
        backgroundColor: '#0B0B0C',
    },
    loader: {
        flex: 1,
    },
    message: {
        color: '#F87171',
        textAlign: 'center',
        marginTop: 40,
        paddingHorizontal: 24,
    },
});