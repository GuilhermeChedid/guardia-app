import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = '@guardia/theme-light';

const darkColors = {
    background: '#0C0D10',
    surface: '#171719',
    surfaceStrong: '#121215',
    border: '#292A2F',
    text: '#FFFFFF',
    muted: '#8E8E93',
    input: '#111318',
};

const lightColors = {
    background: '#F6F7FB',
    surface: '#FFFFFF',
    surfaceStrong: '#EEF0F5',
    border: '#DDE1EA',
    text: '#1F2937',
    muted: '#667085',
    input: '#FFFFFF',
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
    const [isLight, setIsLight] = useState(false);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        AsyncStorage.getItem(THEME_STORAGE_KEY)
            .then((value) => setIsLight(value === 'true'))
            .finally(() => setLoaded(true));
    }, []);

    const toggleTheme = (value) => {
        setIsLight(value);
        AsyncStorage.setItem(THEME_STORAGE_KEY, String(value));
    };

    const value = useMemo(
        () => ({ isLight, colors: isLight ? lightColors : darkColors, toggleTheme, loaded }),
        [isLight, loaded]
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used inside ThemeProvider');
    return context;
}
