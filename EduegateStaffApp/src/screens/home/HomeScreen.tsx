import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { authService, User } from '../../services/auth/authService';
import { theme } from '../../constants/theme';

export const HomeScreen: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const navigation = useNavigation();

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await authService.logout();
                            navigation.navigate('Login');
                        } catch (error) {
                            console.error('Logout error:', error);
                        }
                    },
                },
            ]
        );
    };

    const QuickActionCard = ({ title, onPress, icon }: any) => (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <View style={styles.cardIcon}>
                <Text style={styles.cardIconText}>{icon}</Text>
            </View>
            <Text style={styles.cardTitle}>{title}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Welcome back,</Text>
                    <Text style={styles.userName}>{user?.name || 'Staff Member'}</Text>
                </View>
                <TouchableOpacity
                    style={styles.profileButton}
                    onPress={() => navigation.navigate('Profile')}
                >
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {user?.name?.charAt(0) || 'U'}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* User Info Badge */}
            {user?.isDriver && (
                <View style={styles.badgeContainer}>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>🚗 Driver Mode Active</Text>
                    </View>
                </View>
            )}

            {/* Content */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>

                <View style={styles.grid}>
                    <QuickActionCard
                        title="My Classes"
                        icon="📚"
                        onPress={() => navigation.navigate('TeacherClasses')}
                    />
                    <QuickActionCard
                        title="Attendance"
                        icon="✅"
                        onPress={() => navigation.navigate('AttendanceClasses')}
                    />
                    <QuickActionCard
                        title="Assignments"
                        icon="📝"
                        onPress={() => navigation.navigate('Assignments')}
                    />
                    <QuickActionCard
                        title="Messages"
                        icon="💬"
                        onPress={() => navigation.navigate('Inbox')}
                    />
                    <QuickActionCard
                        title="Timetable"
                        icon="🗓️"
                        onPress={() => navigation.navigate('StaffTimetable')}
                    />
                    <QuickActionCard
                        title="Leave"
                        icon="🏖️"
                        onPress={() => navigation.navigate('StaffLeaveList')}
                    />
                </View>

                {user?.isDriver && (
                    <>
                        <Text style={styles.sectionTitle}>Driver Actions</Text>
                        <View style={styles.grid}>
                            <QuickActionCard
                                title="My Schedule"
                                icon="🗺️"
                                onPress={() => navigation.navigate('DriverSchedule')}
                            />
                            <QuickActionCard
                                title="Track Vehicle"
                                icon="📍"
                                onPress={() => navigation.navigate('VehicleTracking')}
                            />
                        </View>
                    </>
                )}

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.light,
    },
    header: {
        backgroundColor: theme.colors.primary,
        padding: 20,
        paddingTop: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        ...theme.shadows.md,
    },
    greeting: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
    },
    userName: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 4,
    },
    profileButton: {
        padding: 4,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    avatarText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    badgeContainer: {
        padding: 16,
        paddingTop: 12,
        paddingBottom: 0,
    },
    badge: {
        backgroundColor: theme.colors.warning,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    badgeText: {
        color: theme.colors.dark,
        fontWeight: '600',
        fontSize: 14,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.dark,
        marginBottom: 16,
        marginTop: 8,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -8,
        marginBottom: 16,
    },
    card: {
        width: '50%',
        padding: 8,
    },
    cardIcon: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadows.sm,
    },
    cardIconText: {
        fontSize: 32,
    },
    cardTitle: {
        textAlign: 'center',
        marginTop: 8,
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.dark,
    },
    logoutButton: {
        backgroundColor: theme.colors.danger,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 32,
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default HomeScreen;
