import React from 'react';
import { Platform, StyleSheet, View, Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/home/HomeScreen';
import { AcademicsScreen } from '../screens/academics/AcademicsScreen';
import { HRScreen } from '../screens/staff/HRScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { PlaceholderScreen } from '../components/PlaceholderScreen';

const Tab = createBottomTabNavigator();

// Tab bar icons
const tabIcons = {
    home: require('../assets/images/home.svg'),
    academics: require('../assets/images/academics.svg'),
    hr: require('../assets/images/hr.svg'),
    notifications: require('../assets/images/notifications.svg'),
    profile: require('../assets/images/Profile.svg'),
};

interface TabIconProps {
    focused: boolean;
    icon: any;
}

const TabIcon: React.FC<TabIconProps> = ({ focused, icon }) => (
    <Image
        source={icon}
        style={[
            styles.tabIcon,
            { tintColor: focused ? '#7C3AED' : '#9CA3AF' }
        ]}
        resizeMode="contain"
    />
);

// iOS-specific translucent tab bar background (blur effect fallback)
const IOSTabBarBackground = () => (
    <View
        style={[
            StyleSheet.absoluteFill,
            {
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                borderTopWidth: 0.5,
                borderTopColor: 'rgba(0, 0, 0, 0.1)',
            }
        ]}
    />
);

// Profile placeholder screen for now
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
                headerShown: false,
                tabBarActiveTintColor: '#7C3AED',
                tabBarInactiveTintColor: '#9CA3AF',
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    marginBottom: Platform.OS === 'ios' ? 0 : 8,
                },
                tabBarStyle: Platform.select({
                    ios: {
                        position: 'absolute',
                        borderTopWidth: 0,
                        elevation: 0,
                        backgroundColor: 'transparent',
                        height: 88,
                        paddingTop: 8,
                    },
                    android: {
                        backgroundColor: '#FFFFFF',
                        borderTopWidth: 0,
                        elevation: 16,
                        height: 64,
                        paddingTop: 8,
                        paddingBottom: 8,
                        // Material Design 3 shadow
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: -4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                    },
                }),
                tabBarBackground: Platform.OS === 'ios' ? IOSTabBarBackground : undefined,
                // Android ripple effect
                tabBarItemStyle: Platform.select({
                    android: {
                        paddingVertical: 4,
                    },
                }),
            }}
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeScreen}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={tabIcons.home} />
                    ),
                }}
            />
            <Tab.Screen
                name="AcademicsTab"
                component={AcademicsScreen}
                options={{
                    tabBarLabel: 'Academics',
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={tabIcons.academics} />
                    ),
                }}
            />
            <Tab.Screen
                name="HRTab"
                component={HRScreen}
                options={{
                    tabBarLabel: 'HR',
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={tabIcons.hr} />
                    ),
                }}
            />
            <Tab.Screen
                name="NotificationsTab"
                component={NotificationsScreen}
                options={{
                    tabBarLabel: 'Alerts',
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={tabIcons.notifications} />
                    ),
                }}
            />
            <Tab.Screen
                name="ProfileTab"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={tabIcons.profile} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    tabIcon: {
        width: 24,
        height: 24,
    },
});

export default TabNavigator;
