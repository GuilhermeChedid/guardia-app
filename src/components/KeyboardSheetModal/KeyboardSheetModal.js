import React, { useEffect, useRef, useState } from 'react';
import {
    Keyboard,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';

/**
 * Bottom sheet em Modal que sobe junto com o teclado.
 *
 * Em vez de depender do KeyboardAvoidingView (que falha dentro de Modal em
 * vários aparelhos Android), o componente mede a altura do teclado e empurra o
 * sheet por conta própria. Se o Android já redimensionou a janela sozinho, o
 * componente percebe pela altura do overlay e NÃO soma o espaço de novo.
 *
 * Uso:
 *   <KeyboardSheetModal
 *       visible={isAddVisible}
 *       onClose={() => setAddVisible(false)}
 *       sheetStyle={{ backgroundColor: colors.surface }}
 *   >
 *       <View style={styles.dragIndicator} />
 *       ...
 *   </KeyboardSheetModal>
 */
export default function KeyboardSheetModal({
    visible,
    onClose,
    children,
    sheetStyle,
    animationType = 'slide',
}) {
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [overlayHeight, setOverlayHeight] = useState(0);
    const keyboardOpenRef = useRef(false);
    const baseHeightRef = useRef(0);

    useEffect(() => {
        if (!visible) return undefined;

        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

        const showSub = Keyboard.addListener(showEvent, (event) => {
            keyboardOpenRef.current = true;
            setKeyboardHeight(event.endCoordinates.height);
        });
        const hideSub = Keyboard.addListener(hideEvent, () => {
            keyboardOpenRef.current = false;
            setKeyboardHeight(0);
        });

        return () => {
            showSub.remove();
            hideSub.remove();
            keyboardOpenRef.current = false;
            setKeyboardHeight(0);
        };
    }, [visible]);

    const handleOverlayLayout = (event) => {
        const height = event.nativeEvent.layout.height;
        setOverlayHeight(height);
        // Altura "de repouso" (sem teclado) para detectar se a janela encolheu sozinha
        if (!keyboardOpenRef.current) {
            baseHeightRef.current = height;
        }
    };

    // Quanto a própria janela já encolheu por causa do teclado (Android com resize)
    const alreadyResizedBy = Math.max(0, baseHeightRef.current - overlayHeight);
    const extraPadding = Math.max(0, keyboardHeight - alreadyResizedBy);

    const availableHeight = overlayHeight ? overlayHeight - extraPadding : 0;
    const maxSheetHeight = availableHeight ? Math.round(availableHeight * 0.92) : '90%';

    return (
        <Modal
            visible={visible}
            transparent
            animationType={animationType}
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View
                style={[styles.overlay, { paddingBottom: extraPadding }]}
                onLayout={handleOverlayLayout}
            >
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
                <View style={[styles.sheet, { maxHeight: maxSheetHeight }, sheetStyle]}>
                    <ScrollView
                        style={styles.scrollView}
                        keyboardShouldPersistTaps="always"
                        keyboardDismissMode="on-drag"
                        showsVerticalScrollIndicator={false}
                        bounces={false}
                        contentContainerStyle={styles.content}
                    >
                        {children}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.28)',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    sheet: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#1C1C1E',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 24,
        paddingTop: 12,
        minHeight: 0,
    },
    scrollView: {
        flexShrink: 1,
    },
    content: {
        paddingBottom: 40,
    },
});
