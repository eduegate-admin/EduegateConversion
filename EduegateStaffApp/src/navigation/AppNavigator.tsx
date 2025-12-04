import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { AttendanceClassesScreen } from '../screens/teacher/AttendanceClassesScreen';
import { PlaceholderScreen } from '../components/PlaceholderScreen';
import { RootStackParamList } from '../types/navigation';
import { authService } from '../services/auth/authService';

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
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
                <ActivityIndicator size="large" color="#5D3A7C" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName={initialRoute}
                screenOptions={{
                    headerShown: false,
                    cardStyle: { backgroundColor: '#fff' },
                    animation: 'slide_from_right',
                }}
            >
                {/* ========== AUTH SCREENS ========== */}
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                />

                <Stack.Screen
                    name="BiometricAuth"
                    children={() => (
                        <PlaceholderScreen
                            screenName="Biometric Authentication"
                            message="This screen will allow fingerprint/face ID login"
                        />
                    )}
                />

                <Stack.Screen
                    name="IdentityLogin"
                    children={() => (
                        <PlaceholderScreen
                            screenName="Identity Login"
                            message="SSO login integration"
                        />
                    )}
                />

                <Stack.Screen
                    name="Register"
                    children={() => (
                        <PlaceholderScreen
                            screenName="Register"
                            message="New user registration"
                        />
                    )}
                />

                <Stack.Screen
                    name="ResetPassword"
                    children={() => (
                        <PlaceholderScreen
                            screenName="Reset Password"
                            message="Password recovery via email"
                        />
                    )}
                />

                <Stack.Screen
                    name="ChangePassword"
                    children={() => (
                        <PlaceholderScreen
                            screenName="Change Password"
                            message="Update your password"
                        />
                    )}
                />

                {/* ========== MAIN APP SCREENS ========== */}
                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{
                        gestureEnabled: false, // Prevent swipe back from home
                    }}
                />

                {/* ========== TEACHER SCREENS ========== */}
                <Stack.Screen
                    name="TeacherClasses"
                    children={() => (
                        <PlaceholderScreen
                            screenName="Teacher Classes"
                            message="View and manage your classes"
                        />
                    )}
                />

                <Stack.Screen
                    name="Assignments"
                    children={() => (
                        <PlaceholderScreen
                            screenName="Assignments"
                            message="Create and manage assignments"
                        />
                    )}
                />

                <Stack.Screen
                    name="LessonPlan"
                    children={() => (
                        <PlaceholderScreen
                            screenName="Lesson Plan"
                            message="Create and view lesson plans"
                        />
                    )}
                />

                <Stack.Screen
                    name="Topics"
                    children={() => (
                        <PlaceholderScreen
                            screenName="Topics"
                            message="Track topic coverage"
                        />
                    )}
                />

                {/* ========== ATTENDANCE SCREENS ========== */}
                <Stack.Screen
                    name="AttendanceClasses"
                    component={AttendanceClassesScreen}
                />

                {/* ========== STAFF SCREENS ========== */}
                <Stack.Screen
                    name="Profile"
                    children={() => (
                        <PlaceholderScreen
                            screenName="Profile"
                            message="View and edit your profile"
                        />
                    )}
                />

                <Stack.Screen
                    name="StaffAttendance"
                    children={() => (
                        <PlaceholderScreen
                            screenName="Staff Attendance"
                            message="Mark your attendance"
                        />
                    )}
                />

                <Stack.Screen
                    name="StaffLeaveList"
                    children={() => (
                        <PlaceholderScreen
                            screenName="Staff Leave"
                            message="View and apply for leave"
                        />
                    )}
                />

                <Stack.Screen
                    name="StaffTimetable"
                    children={() => (
                        <PlaceholderScreen
                            screenName="Timetable"
                            message="View your weekly schedule"
                        />
                    )}
                />

                {/* ========== COMMUNICATION SCREENS ========== */}
                <Stack.Screen
                    name="Inbox"
                    children={() => (
                        <PlaceholderScreen
                            screenName="Inbox"
                            message="View your messages"
                        />
                    )}
                />

                <Stack.Screen
                    name="Circulars"
                    children={() => (
                        <PlaceholderScreen
                            screenName="Circulars"
                            message="View school circulars"
                        />
                    )}
                />

                {/* ========== DRIVER SCREENS ========== */}
                <Stack.Screen
                    name="DriverSchedule"
                    children={() => (
                        <PlaceholderScreen
                            screenName="Driver Schedule"
                            message="View your driving schedule"
                        />
                    )}
                />

                <Stack.Screen
                    name="VehicleTracking"
                    children={() => (
                        <PlaceholderScreen
                            screenName="Vehicle Tracking"
                            message="Track vehicle location"
                        />
                    )}
                />

                {/* ========== NEW HOME SCREEN ROUTES ========== */}
                <Stack.Screen
                    name="Academics"
                    children={() => (
                        <PlaceholderScreen
                            screenName="Academics"
                            message="Academics Dashboard"
                        />
                    )}
                />
                <Stack.Screen
                    name="HR"
                    children={() => (
                        <PlaceholderScreen
                            screenName="HR"
                            message="HR Dashboard"
                        />
                    )}
                />
                <Stack.Screen
                    name="Notifications"
                    children={() => (
                        <PlaceholderScreen
                            screenName="Notifications"
                            message="View all notifications"
                        />
                    )}
                />
                <Stack.Screen
                    name="PickupVerification"
                    children={() => (
                        <PlaceholderScreen
                            screenName="Pickup Verification"
                            message="Verify student pickup"
                        />
                    )}
                />
                {/* Add more screens as placeholders... */}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
