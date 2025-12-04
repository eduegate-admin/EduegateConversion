import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    RefreshControl,
    Dimensions,
    Alert,
    ImageBackground,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { authService, User } from '../../services/auth/authService';
import { homeService } from '../../services/home/homeService';
import { StaffProfile, AttendanceStatus, BoilerPlate, HomeDashboardData } from '../../types/models/home';
import { theme } from '../../constants/theme';

const { width } = Dimensions.get('window');

export const HomeScreen: React.FC = () => {
    const navigation = useNavigation();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [dashboardData, setDashboardData] = useState<HomeDashboardData>({
        profile: null,
        attendance: null,
        boilerPlates: [],
        counts: {
            myClass: 0,
            assignments: 0,
            lessonPlans: 0,
            notifications: 0,
            circulars: 0,
        },
    });
    const [showAttendanceCard, setShowAttendanceCard] = useState(true);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        try {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);

            if (currentUser) {
                const [
                    profile,
                    attendance,
                    boilerPlates,
                    myClassCount,
                    assignmentsCount,
                    lessonPlansCount,
                    notificationsCount,
                    circularsCount
                ] = await Promise.all([
                    homeService.getStaffDetailForHome(),
                    homeService.getTodayStaffAttendance(),
                    homeService.getPageInfo(),
                    homeService.getMyClassCount(),
                    homeService.getEmployeeAssignmentsCount(),
                    homeService.getMyLessonPlanCount(),
                    homeService.getMyNotificationCount(),
                    homeService.getLatestStaffCircularCount()
                ]);

                setDashboardData({
                    profile,
                    attendance,
                    boilerPlates,
                    counts: {
                        myClass: myClassCount,
                        assignments: assignmentsCount,
                        lessonPlans: lessonPlansCount,
                        notifications: notificationsCount,
                        circulars: circularsCount
                    }
                });
            }
        } catch (error) {
            console.error('Error loading home data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const refreshAttendance = async () => {
        try {
            const attendance = await homeService.getTodayStaffAttendance();
            setDashboardData(prev => ({ ...prev, attendance }));
        } catch (error) {
            console.error('Error refreshing attendance:', error);
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => { /* Toggle Menu */ }}>
                <Image source={require('../../assets/images/menu.png')} style={styles.menuIcon} />
            </TouchableOpacity>

            <Image
                source={require('../../assets/images/pearl_logo.png')}
                style={styles.logo}
                resizeMode="contain"
            />

            <TouchableOpacity style={styles.notificationBtn} onPress={() => navigation.navigate('Notifications')}>
                <Image source={require('../../assets/images/notification.png')} style={styles.notificationIcon} />
                {dashboardData.counts.notifications > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{dashboardData.counts.notifications}</Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );

    const renderWelcomeSection = () => (
        <View style={styles.welcomeSection}>
            <View style={styles.profileContainer}>
                <Image
                    source={
                        dashboardData.profile?.EmployeeProfileImageUrl
                            ? { uri: dashboardData.profile.EmployeeProfileImageUrl }
                            : require('../../assets/images/profile_img.png')
                    }
                    style={styles.profileImage}
                />
            </View>
            <View style={styles.welcomeTextContainer}>
                <Text style={styles.welcomeLabel}>Welcome</Text>
                <Text style={styles.employeeName}>{dashboardData.profile?.EmployeeName || user?.name}</Text>
                <View style={styles.employeeCodeBadge}>
                    <Text style={styles.employeeCode}>{dashboardData.profile?.EmployeeCode || user?.employeeCode}</Text>
                </View>
            </View>
        </View>
    );

    const renderBanner = () => {
        if (dashboardData.boilerPlates.length === 0) return null;

        // Just showing the first banner for now, can be made into a carousel
        const banner = dashboardData.boilerPlates[0];
        return (
            <View style={styles.bannerContainer}>
                <ImageBackground
                    source={require('../../assets/images/banner_slider_1.png')} // Fallback or dynamic
                    style={styles.bannerImage}
                    imageStyle={{ borderRadius: 12 }}
                >
                    <View style={styles.bannerContent}>
                        <Text style={styles.bannerTitle}>{banner.Title}</Text>
                        {/* Render HTML content if needed, stripped for now */}
                        <Text style={styles.bannerText} numberOfLines={2}>
                            {(banner.Content || '').replace(/<[^>]+>/g, '')}
                        </Text>
                    </View>
                </ImageBackground>
            </View>
        );
    };

    const renderAttendanceCard = () => {
        if (!showAttendanceCard || !dashboardData.attendance) return null;

        return (
            <View style={styles.attendanceCard}>
                <View style={styles.attendanceHeader}>
                    <Text style={styles.attendanceDate}>{dashboardData.attendance.AttendenceDate}</Text>
                </View>
                <View style={styles.attendanceBody}>
                    <View style={styles.statusRow}>
                        <Text style={styles.statusLabel}>Attendance Status:</Text>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>{dashboardData.attendance.PresentStatus}</Text>
                        </View>
                    </View>
                    <View style={styles.attendanceActions}>
                        <TouchableOpacity style={styles.refreshBtn} onPress={refreshAttendance}>
                            <Text style={styles.refreshBtnText}>Refresh</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.closeBtn}
                            onPress={() => setShowAttendanceCard(false)}
                        >
                            <Text style={styles.closeBtnText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    const renderQuickAccess = () => (
        <View style={styles.quickAccessContainer}>
            <TouchableOpacity
                style={styles.quickAccessCard}
                onPress={() => navigation.navigate('Academics')}
            >
                <LinearGradient
                    colors={['#AF70FF', '#694399']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientCard}
                >
                    <View style={styles.quickAccessContent}>
                        <Image source={require('../../assets/images/hr.svg')} style={styles.quickAccessIcon} />
                        <Text style={styles.quickAccessTitle}>Academics</Text>
                    </View>
                </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.quickAccessCard}
                onPress={() => navigation.navigate('HR')}
            >
                <LinearGradient
                    colors={['#4B9DE9', '#3CCFFD']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientCard}
                >
                    <View style={styles.quickAccessContent}>
                        <Image source={require('../../assets/images/academics.svg')} style={styles.quickAccessIcon} />
                        <Text style={styles.quickAccessTitle}>HR</Text>
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );

    const MenuGridItem = ({ title, icon, onPress, gradientColors, badgeCount }: any) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.menuIconContainer}
            >
                <Image source={icon} style={styles.menuIconImage} resizeMode="contain" />
            </LinearGradient>
            <Text style={styles.menuTitle}>{title}</Text>
            {badgeCount > 0 && (
                <View style={styles.menuBadge}>
                    <Text style={styles.menuBadgeText}>{badgeCount}</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    const renderMenuGrid = () => (
        <View style={styles.menuGrid}>
            {!user?.isDriver && (
                <>
                    <MenuGridItem
                        title="Classes"
                        icon={require('../../assets/images/classes.svg')}
                        gradientColors={['#AF70FF', '#694399']}
                        onPress={() => navigation.navigate('TeacherClasses')}
                        badgeCount={dashboardData.counts.myClass}
                    />
                    <MenuGridItem
                        title="Assignments"
                        icon={require('../../assets/images/assignments.svg')}
                        gradientColors={['#97DA77', '#50743F']}
                        onPress={() => navigation.navigate('Assignments')}
                        badgeCount={dashboardData.counts.assignments}
                    />
                    <MenuGridItem
                        title="Lesson plan"
                        icon={require('../../assets/images/lessonplan.svg')}
                        gradientColors={['#708FFF', '#4062D9']}
                        onPress={() => navigation.navigate('LessonPlan')}
                        badgeCount={dashboardData.counts.lessonPlans}
                    />
                </>
            )}

            <MenuGridItem
                title="Circulars"
                icon={require('../../assets/images/circulars.svg')}
                gradientColors={['#FF8170', '#CF402C']}
                onPress={() => navigation.navigate('Circulars')}
                badgeCount={dashboardData.counts.circulars}
            />

            <MenuGridItem
                title="Pending notifications"
                icon={require('../../assets/images/notifications.svg')}
                gradientColors={['#FFA370', '#E3BF00']}
                onPress={() => navigation.navigate('Notifications')}
                badgeCount={dashboardData.counts.notifications}
            />

            <MenuGridItem
                title="Pickup verification"
                icon={require('../../assets/images/scan.svg')}
                gradientColors={['#4B9DE9', '#3CCFFD']}
                onPress={() => navigation.navigate('PickupVerification')}
            />

            <MenuGridItem
                title="Employee leave request"
                icon={require('../../assets/images/leaverequest.svg')}
                gradientColors={['#4B9DE9', '#3CCFFD']}
                onPress={() => navigation.navigate('StaffLeaveList')}
            />

            {user?.isDriver && (
                <>
                    <MenuGridItem
                        title="Driver Tracking"
                        icon={require('../../assets/images/transportbus.svg')}
                        gradientColors={['#FFA370', '#E3BF00']}
                        onPress={() => navigation.navigate('VehicleTracking')}
                    />
                    <MenuGridItem
                        title="Routes details"
                        icon={require('../../assets/images/routedetails.svg')}
                        gradientColors={['#8B4FD7', '#694399']}
                        onPress={() => navigation.navigate('DriverSchedule')}
                    />
                </>
            )}

            <MenuGridItem
                title="Communication"
                icon={require('../../assets/images/homenotifications.svg')}
                gradientColors={['#708FFF', '#4062D9']}
                onPress={() => navigation.navigate('Inbox')}
            />

            <MenuGridItem
                title="Sign Out"
                icon={require('../../assets/images/signout.png')}
                gradientColors={['#FF5252', '#D32F2F']}
                onPress={() => {
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
                                        routes: [{ name: 'Login' }],
                                    });
                                },
                            },
                        ]
                    );
                }}
            />
        </View>
    );

    return (
        <View style={styles.container}>
            {renderHeader()}
            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
            >
                {renderWelcomeSection()}
                {renderBanner()}
                {renderAttendanceCard()}
                {renderQuickAccess()}
                {renderMenuGrid()}
                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 10,
        backgroundColor: '#F5F5F5',
    },
    menuIcon: {
        width: 24,
        height: 24,
        tintColor: '#333',
    },
    logo: {
        width: 150,
        height: 40,
    },
    notificationBtn: {
        position: 'relative',
        padding: 4,
    },
    notificationIcon: {
        width: 24,
        height: 24,
        tintColor: '#333',
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: theme.colors.danger,
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    welcomeSection: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
    },
    profileContainer: {
        marginRight: 16,
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: '#fff',
    },
    welcomeTextContainer: {
        flex: 1,
    },
    welcomeLabel: {
        fontSize: 18,
        color: '#333',
        fontWeight: '300',
    },
    employeeName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    employeeCodeBadge: {
        backgroundColor: '#5D3A7C',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    employeeCode: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    bannerContainer: {
        marginHorizontal: 16,
        marginBottom: 16,
        height: 120,
        borderRadius: 12,
        overflow: 'hidden',
    },
    bannerImage: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
    },
    bannerContent: {
        padding: 16,
    },
    bannerTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10
    },
    bannerText: {
        color: '#fff',
        fontSize: 12,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10
    },
    attendanceCard: {
        marginHorizontal: 16,
        marginBottom: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    attendanceHeader: {
        backgroundColor: '#5D3A7C',
        padding: 12,
    },
    attendanceDate: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    attendanceBody: {
        padding: 16,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    statusLabel: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
        marginRight: 8,
    },
    statusBadge: {
        backgroundColor: '#E0E0E0',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    attendanceActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    refreshBtn: {
        flex: 1,
        backgroundColor: '#E0E0E0',
        padding: 10,
        borderRadius: 6,
        alignItems: 'center',
    },
    refreshBtnText: {
        color: '#333',
        fontWeight: '600',
    },
    closeBtn: {
        flex: 1,
        backgroundColor: '#3F51B5',
        padding: 10,
        borderRadius: 6,
        alignItems: 'center',
    },
    closeBtnText: {
        color: '#fff',
        fontWeight: '600',
    },
    quickAccessContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 16,
        gap: 16,
    },
    quickAccessCard: {
        flex: 1,
        height: 80,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 3,
    },
    gradientCard: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    quickAccessContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quickAccessIcon: {
        width: 32,
        height: 32,
        marginRight: 12,
        tintColor: '#fff',
    },
    quickAccessTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    menuGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 8,
    },
    menuItem: {
        width: '33.33%',
        alignItems: 'center',
        marginBottom: 24,
        position: 'relative',
    },
    menuIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    menuIconImage: {
        width: 30,
        height: 30,
        tintColor: '#fff',
    },
    menuTitle: {
        fontSize: 12,
        color: '#333',
        textAlign: 'center',
        fontWeight: '600',
        paddingHorizontal: 4,
    },
    menuBadge: {
        position: 'absolute',
        top: 0,
        right: 20,
        backgroundColor: theme.colors.danger,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#F5F5F5',
    },
    menuBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
    },
});

export default HomeScreen;
