import React from 'react';
import { Platform } from 'react-native';
import { createNativeBottomTabNavigator } from '@bottom-tabs/react-navigation';
import { HomeScreen } from '../screens/home/HomeScreen';
import { AcademicsScreen } from '../screens/academics/AcademicsScreen';
import { HRScreen } from '../screens/staff/HRScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { PlaceholderScreen } from '../components/PlaceholderScreen';

const Tab = createNativeBottomTabNavigator();

const ProfileScreen = () => (
    <PlaceholderScreen
        screenName="Profile"
        message="View and edit your profile"
    />
);

export const TabNavigator: React.FC = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: Platform.OS === 'ios' ? '#007AFF' : '#7C3AED',
            }}
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeScreen}
                options={{
                    title: 'Home',
                    tabBarIcon: () => Platform.select({
                        ios: { sfSymbol: 'house.fill' },
                        android: { source: require('../assets/images/home.png') },
                    }),
                }}
            />
            <Tab.Screen
                name="AcademicsTab"
                component={AcademicsScreen}
                options={{
                    title: 'Academics',
                    tabBarIcon: () => Platform.select({
                        ios: { sfSymbol: 'book.fill' },
                        android: { source: require('../assets/images/mywards.png') },
                    }),
                }}
            />
            <Tab.Screen
                name="HRTab"
                component={HRScreen}
                options={{
                    title: 'HR',
                    tabBarIcon: () => Platform.select({
                        ios: { sfSymbol: 'person.2.fill' },
                        android: { source: require('../assets/images/enroll.png') },
                    }),
                }}
            />
            <Tab.Screen
                name="NotificationsTab"
                component={NotificationsScreen}
                options={{
                    title: 'Alerts',
                    tabBarIcon: () => Platform.select({
                        ios: { sfSymbol: 'bell.fill' },
                        android: { source: require('../assets/images/notification.png') },
                    }),
                }}
            />
            <Tab.Screen
                name="ProfileTab"
                component={ProfileScreen}
                options={{
                    title: 'Profile',
                    tabBarIcon: () => Platform.select({
                        ios: { sfSymbol: 'person.circle.fill' },
                        android: { source: require('../assets/images/profile.png') },
                    }),
                }}
            />
        </Tab.Navigator>
    );
};

export default TabNavigator;
