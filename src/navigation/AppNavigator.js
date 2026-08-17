import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from '../telas/Login/login';
import RegisterScreen from '../telas/cadastro/cadastro';
import EmergencyScreen from '../telas/Emergency/EmergencyScreen';
import ProfileScreen from '../telas/Profile/ProfileScreen';
import SupportScreen from '../telas/Support/SupportScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="Emergency" component={EmergencyScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
                <Stack.Screen name="Support" component={SupportScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
