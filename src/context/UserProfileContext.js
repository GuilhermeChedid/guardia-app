import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_STORAGE_KEY = '@guardia/profile';
const DEFAULT_PROFILE = {
    name: 'Maria Clara Santos',
    email: 'mariaclara@email.com',
    phone: '(11) 98765-4321',
};

const UserProfileContext = createContext(null);

export function UserProfileProvider({ children }) {
    const [profile, setProfile] = useState(DEFAULT_PROFILE);

    useEffect(() => {
        AsyncStorage.getItem(PROFILE_STORAGE_KEY)
            .then((storedProfile) => {
                if (storedProfile) setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(storedProfile) });
            })
            .catch(() => undefined);
    }, []);

    const updateProfile = (changes) => {
        setProfile((currentProfile) => {
            const nextProfile = { ...currentProfile, ...changes };
            AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(nextProfile));
            return nextProfile;
        });
    };

    const value = useMemo(() => ({ profile, updateProfile }), [profile]);

    return <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>;
}

export function useUserProfile() {
    const context = useContext(UserProfileContext);
    if (!context) throw new Error('useUserProfile must be used inside UserProfileProvider');
    return context;
}
