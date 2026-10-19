import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { getAssetUrl } from '../services/api';

const PROFILE_STORAGE_KEY = '@guardia/profile';
const DEFAULT_PROFILE = {
    name: '',
    email: '',
    phone: '',
    photoUrl: '',
    cpf: '',
    maritalStatus: '',
    address: '',
    street: '',
    postalCode: '',
    addressNumber: '',
    addressComplement: '',
    neighborhood: '',
    city: '',
    state: '',
    contactsCount: 0,
    evidenceCount: 0,
};

const UserProfileContext = createContext(null);

export function UserProfileProvider({ children }) {
    const [profile, setProfile] = useState(DEFAULT_PROFILE);

    const refreshProfile = useCallback(async () => {
        try {
            const storedUser = await AsyncStorage.getItem('@guardia/auth_user');
            const user = storedUser ? JSON.parse(storedUser) : null;

            if (!user?.id) {
                return;
            }

            const response = await api.get(`/auth/profile/${user.id}`);
            const data = response.data.profile;
            const addressParts = [
                data.logradouro,
                data.numero,
                data.complemento,
                data.bairro,
                data.cidade,
                data.estado_uf,
                data.cep,
            ].filter(Boolean);

            setProfile({
                ...DEFAULT_PROFILE,
                name: data.nome || '',
                email: data.email || '',
                phone: data.telefone || '',
                photoUrl: getAssetUrl(data.url_foto_perfil || ''),
                cpf: data.cpf || '',
                maritalStatus: data.estado_civil || '',
                address: addressParts.join(', '),
                street: data.logradouro || '',
                postalCode: data.cep || '',
                addressNumber: data.numero || '',
                addressComplement: data.complemento || '',
                neighborhood: data.bairro || '',
                city: data.cidade || '',
                state: data.estado_uf || '',
                contactsCount: data.contatos_count || 0,
                evidenceCount: data.evidencias_count || 0,
            });
        } catch (error) {
            console.error('Erro ao carregar perfil:', error);
        }
    }, []);

    useEffect(() => {
        refreshProfile();
    }, [refreshProfile]);

    const updateProfile = (changes) => {
        setProfile((currentProfile) => {
            const nextProfile = { ...currentProfile, ...changes };
            AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(nextProfile));
            return nextProfile;
        });
    };

    const value = useMemo(() => ({ profile, updateProfile, refreshProfile }), [profile, refreshProfile]);

    return <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>;
}

export function useUserProfile() {
    const context = useContext(UserProfileContext);
    if (!context) throw new Error('useUserProfile must be used inside UserProfileProvider');
    return context;
}
