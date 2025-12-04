import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { AttendanceClassesScreen } from '../screens/teacher/AttendanceClassesScreen';
import { PlaceholderScreen } from '../components/PlaceholderScreen';
import { RootStackParamList } from '../types/navigation';

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Login"
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

                {/* Add more screens as placeholders... */}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
