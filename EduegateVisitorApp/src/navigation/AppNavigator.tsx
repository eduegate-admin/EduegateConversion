import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { PickupVerificationScreen } from '../screens/home/PickupVerificationScreen';
import { InspectionScreen } from '../screens/home/InspectionScreen';
import { authService } from '../services/auth/authService';

export type RootStackParamList = {
    Login: undefined;
    Home: undefined;
    PickupVerification: undefined;
    Inspection: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList>('Login');

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const isAuthenticated = await authService.isAuthenticated();
            setInitialRoute(isAuthenticated ? 'Home' : 'Login');
        } catch (error) {
            console.error('Auth check failed:', error);
            setInitialRoute('Login');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#6845D1" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName={initialRoute}
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="PickupVerification" component={PickupVerificationScreen} options={{ headerShown: true, title: 'Pickup Verification' }} />
                <Stack.Screen name="Inspection" component={InspectionScreen} options={{ headerShown: true, title: 'Inspection' }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};
