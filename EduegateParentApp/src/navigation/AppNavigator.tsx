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
import EarlyPickup from '../pages/EarlyPickup';
import PickupRequest from '../pages/PickupRequest';
import AllergyDetails from '../pages/AllergyDetails';
import Notifications from '../pages/Notifications';
import PaymentHistory from '../pages/PaymentHistory';
import Transport from '../pages/Transport';
import DriverDetails from '../pages/DriverDetails';
import Communications from '../pages/Communications';
import Tickets from '../pages/Tickets';
import TimeTable from '../pages/TimeTable';
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
    EarlyPickup: undefined;
    PickupRequest: undefined;
    AllergyDetails: undefined;
    Notifications: undefined;
    PaymentHistory: undefined;
    Transport: undefined;
    DriverDetails: undefined;
    Communications: undefined;
    Tickets: undefined;
    TimeTable: undefined;
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
                <Stack.Screen name="EarlyPickup" component={EarlyPickup} />
                <Stack.Screen name="PickupRequest" component={PickupRequest} />
                <Stack.Screen name="AllergyDetails" component={AllergyDetails} />
                <Stack.Screen name="Notifications" component={Notifications} />
                <Stack.Screen name="PaymentHistory" component={PaymentHistory} />
                <Stack.Screen name="Transport" component={Transport} />
                <Stack.Screen name="DriverDetails" component={DriverDetails} />
                <Stack.Screen name="Communications" component={Communications} />
                <Stack.Screen name="Tickets" component={Tickets} />
                <Stack.Screen name="TimeTable" component={TimeTable} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};
