import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MyWards from '../pages/MyWards';
import ClassTeachers from '../pages/ClassTeachers';
import Circulars from '../pages/Circulars';
import ReportCard from '../pages/ReportCard';
import Assignments from '../pages/Assignments';
import Notes from '../pages/Notes';
import StudentAttendance from '../pages/StudentAttendance';
import StudentFeeDue from '../pages/StudentFeeDue';
import StudentLeave from '../pages/StudentLeave';
import StudentProfile from '../pages/StudentProfile';
import Library from '../pages/Library';
import CounselorCorner from '../pages/CounselorCorner';
import ApplicationStatus from '../pages/ApplicationStatus';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { authService } from '../services/auth/authService';
import { theme } from '../constants/theme';
import { PlaceholderScreen } from '../screens/PlaceholderScreen';

export type RootStackParamList = {
    Login: undefined;
    Home: undefined;
    MyWards: undefined;
    StudentProfile: { studentId: number };
    Circulars: undefined;
    ReportCard: undefined;
    Assignments: undefined;
    ClassTeachers: undefined;
    Notes: undefined;
    StudentAttendance: undefined;
    StudentFeeDue: undefined;
    StudentLeave: undefined;
    Library: undefined;
    CounselorCorner: undefined;
    ApplicationStatus: undefined;
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
                <ActivityIndicator size="large" color={theme.colors.primary} />
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
                <Stack.Screen name="MyWards" component={MyWards} />
                <Stack.Screen name="StudentProfile" component={StudentProfile} />
                <Stack.Screen name="Circulars" component={Circulars} />
                <Stack.Screen name="ReportCard" component={ReportCard} />
                <Stack.Screen name="Assignments" component={Assignments} />
                <Stack.Screen name="ClassTeachers" component={ClassTeachers} />
                <Stack.Screen name="Notes" component={Notes} />
                <Stack.Screen name="StudentAttendance" component={StudentAttendance} />
                <Stack.Screen name="StudentFeeDue" component={StudentFeeDue} />
                <Stack.Screen name="StudentLeave" component={StudentLeave} />
                <Stack.Screen name="Library" component={Library} />
                <Stack.Screen name="CounselorCorner" component={CounselorCorner} />
                <Stack.Screen name="ApplicationStatus" component={ApplicationStatus} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};
