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
import { AcademicsScreen } from '../screens/academics/AcademicsScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { TeacherClassesScreen } from '../screens/teacher/TeacherClassesScreen';
import { AssignmentsScreen } from '../screens/academics/AssignmentsScreen';
import { ClassStudentsScreen } from '../screens/teacher/ClassStudentsScreen';
import { CircularsScreen } from '../screens/communications/CircularsScreen';
import { PickupVerificationScreen } from '../screens/staff/PickupVerificationScreen';
import { StaffLeaveScreen } from '../screens/staff/StaffLeaveScreen';
import { InboxScreen } from '../screens/communications/InboxScreen';
import { StudentAttendanceScreen } from '../screens/teacher/StudentAttendanceScreen';
import { HRScreen } from '../screens/staff/HRScreen';
import { PaySlipScreen } from '../screens/staff/PaySlipScreen';

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
                    component={TeacherClassesScreen}
                />

                <Stack.Screen
                    name="ClassStudents"
                    component={ClassStudentsScreen}
                />

                <Stack.Screen
                    name="Assignments"
                    component={AssignmentsScreen}
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
                    component={StaffLeaveScreen}
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
                    component={InboxScreen}
                />

                <Stack.Screen
                    name="Circulars"
                    component={CircularsScreen}
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
                    component={AcademicsScreen}
                />
                <Stack.Screen
                    name="Notifications"
                    component={NotificationsScreen}
                />

                <Stack.Screen
                    name="Notes"
                    children={() => (
                        <PlaceholderScreen
                            screenName="Notes"
                            message="View and manage notes"
                        />
                    )}
                />

                <Stack.Screen
                    name="StudentAttendance"
                    component={StudentAttendanceScreen}
                />

                <Stack.Screen
                    name="StudentLeaveRequest"
                    children={() => (
                        <PlaceholderScreen
                            screenName="Student Leave Applications"
                            message="Manage student leave requests"
                        />
                    )}
                />

                <Stack.Screen
                    name="StudentEarlyPickup"
                    children={() => (
                        <PlaceholderScreen
                            screenName="Student Early Pickup"
                            message="Manage early pickup requests"
                        />
                    )}
                />

                <Stack.Screen
                    name="PickupVerification"
                    component={PickupVerificationScreen}
                />

                <Stack.Screen
                    name="HR"
                    component={HRScreen}
                />

                <Stack.Screen
                    name="SalarySlip"
                    component={PaySlipScreen}
                />
                {/* Add more screens as placeholders... */}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
