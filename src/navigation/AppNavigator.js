import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from '../telas/Login/login';
import RegisterScreen from '../telas/cadastro/cadastro';
import HomeScreen from '../telas/Home/Home';
import ContatosScreen from '../telas/Contatos/contatos';
import ProvasScreen from '../telas/Provas/provas';
import InformacoesScreen from '../telas/Support/InformacoesScreen';
import PerfilScreen from '../telas/Perfil/Perfil';

const Stack = createStackNavigator();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Contatos" component={ContatosScreen} />
                <Stack.Screen name="Provas" component={ProvasScreen} />
                <Stack.Screen name="Informacoes" component={InformacoesScreen} />
                <Stack.Screen name="Perfil" component={PerfilScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
