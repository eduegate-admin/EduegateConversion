import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    Alert,
    SafeAreaView,
} from 'react-native';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { authService, User } from '../../services/auth/authService';
import { homeService } from '../../services/home/homeService';

interface MenuItem {
    id: string;
    title: string;
    icon: any;
    screen?: string;
    iconColor: string;
    action?: () => void;
}

interface DrawerSidebarProps extends DrawerContentComponentProps {
    user: User | null;
    profile: any;
}

export const DrawerSidebar: React.FC<DrawerSidebarProps> = ({
    navigation,
    user,
    profile,
}) => {
    const handleLogout = () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                        await authService.logout();
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Login' as never }],
                        });
                    },
                },
            ]
        );
    };

    const menuItems: MenuItem[] = [
        {
            id: 'home',
            title: 'Home',
            icon: require('../../assets/images/home.svg'),
            screen: 'Home',
            iconColor: '#3B82F6',
        },
        {
            id: 'academics',
            title: 'Academics',
            icon: require('../../assets/images/academics.svg'),
            screen: 'Academics',
            iconColor: '#8B5CF6',
        },
        {
            id: 'hr',
            title: 'HR',
            icon: require('../../assets/images/hr.svg'),
            screen: 'HR',
            iconColor: '#22C55E',
        },
        {
            id: 'attendance',
            title: 'My Attendance',
            icon: require('../../assets/images/Attandence.svg'),
            screen: 'StaffAttendance',
            iconColor: '#F59E0B',
        },
        {
            id: 'leave',
            title: 'My Leave',
            icon: require('../../assets/images/myleave.svg'),
            screen: 'StaffLeaveList',
            iconColor: '#06B6D4',
        },
        {
            id: 'timetable',
            title: 'Timetable',
            icon: require('../../assets/images/timetable.svg'),
            screen: 'StaffTimetable',
            iconColor: '#EC4899',
        },
        {
            id: 'notifications',
            title: 'Notifications',
            icon: require('../../assets/images/notifications.svg'),
            screen: 'Notifications',
            iconColor: '#EF4444',
        },
        {
            id: 'profile',
            title: 'Profile',
            icon: require('../../assets/images/Profile.svg'),
            screen: 'Profile',
            iconColor: '#6366F1',
        },
    ];

    const handleMenuPress = (item: MenuItem) => {
        navigation.closeDrawer();
        if (item.action) {
            item.action();
        } else if (item.screen) {
            navigation.navigate(item.screen as never);
        }
    };

    const renderMenuItem = (item: MenuItem) => (
        <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => handleMenuPress(item)}
            activeOpacity={0.7}
        >
            <View style={[styles.menuIconContainer, { backgroundColor: `${item.iconColor}20` }]}>
                <Image
                    source={item.icon}
                    style={[styles.menuIcon, { tintColor: item.iconColor }]}
                    resizeMode="contain"
                />
            </View>
            <Text style={styles.menuItemText}>{item.title}</Text>
            <Image
                source={require('../../assets/images/Polygonright.png')}
                style={styles.chevronIcon}
                resizeMode="contain"
            />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Profile Header */}
            <View style={styles.profileSection}>
                <View style={styles.profileImageContainer}>
                    <Image
                        source={
                            profile?.EmployeeProfileImageUrl
                                ? { uri: profile.EmployeeProfileImageUrl }
                                : require('../../assets/images/profile_img.png')
                        }
                        style={styles.profileImage}
                    />
                </View>
                <View style={styles.profileInfo}>
                    <Text style={styles.profileName} numberOfLines={1}>
                        {profile?.EmployeeName || user?.name || 'User'}
                    </Text>
                    <Text style={styles.profileDesignation} numberOfLines={1}>
                        {profile?.DesignationName || 'Staff'}
                    </Text>
                    <View style={styles.employeeCodeBadge}>
                        <Text style={styles.employeeCode}>
                            {profile?.EmployeeCode || user?.employeeCode || '---'}
                        </Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => navigation.closeDrawer()}
                >
                    <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
            </View>

            {/* Menu Items */}
            <ScrollView
                style={styles.menuContainer}
                showsVerticalScrollIndicator={false}
            >
                {menuItems.map(renderMenuItem)}

                {/* Sign Out Button */}
                <TouchableOpacity
                    style={[styles.menuItem, styles.signOutItem]}
                    onPress={handleLogout}
                    activeOpacity={0.7}
                >
                    <View style={[styles.menuIconContainer, { backgroundColor: '#FEE2E2' }]}>
                        <Image
                            source={require('../../assets/images/right-from-bracket.svg')}
                            style={[styles.menuIcon, { tintColor: '#EF4444' }]}
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={[styles.menuItemText, { color: '#EF4444' }]}>Sign Out</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>Powered by</Text>
                <Image
                    source={require('../../assets/images/eduegate_logo.png')}
                    style={styles.footerLogo}
                    resizeMode="contain"
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    profileSection: {
        backgroundColor: '#7C3AED',
        paddingTop: 60,
        paddingBottom: 24,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileImageContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#FFFFFF',
        padding: 2,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    profileImage: {
        width: '100%',
        height: '100%',
        borderRadius: 30,
    },
    profileInfo: {
        flex: 1,
        marginLeft: 16,
    },
    profileName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    profileDesignation: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 8,
    },
    employeeCodeBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    employeeCode: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 16,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 24,
        color: '#FFFFFF',
        fontWeight: '300',
        marginTop: -2,
    },
    menuContainer: {
        flex: 1,
        paddingTop: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuIcon: {
        width: 22,
        height: 22,
    },
    menuItemText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
        color: '#1F2937',
        marginLeft: 14,
    },
    chevronIcon: {
        width: 8,
        height: 12,
        tintColor: '#9CA3AF',
    },
    signOutItem: {
        marginTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        borderBottomWidth: 0,
    },
    footer: {
        paddingVertical: 20,
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    footerText: {
        fontSize: 12,
        color: '#9CA3AF',
        marginRight: 8,
    },
    footerLogo: {
        width: 80,
        height: 24,
    },
});

export default DrawerSidebar;
