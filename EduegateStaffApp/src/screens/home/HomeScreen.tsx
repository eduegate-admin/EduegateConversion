import React, { useEffect, useState, useCallback, useRef } from 'react';
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
    Modal,
    Animated,
    TouchableWithoutFeedback,
    StatusBar,
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
    const [showSidebar, setShowSidebar] = useState(false);
    const slideAnim = useRef(new Animated.Value(-width * 0.8)).current;

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

    const openSidebar = () => {
        setShowSidebar(true);
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
        }).start();
    };

    const closeSidebar = () => {
        Animated.timing(slideAnim, {
            toValue: -width * 0.8,
            duration: 200,
            useNativeDriver: true,
        }).start(() => setShowSidebar(false));
    };

    const handleLogout = async () => {
        closeSidebar();
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

    const sidebarMenuItems = [
        { id: 'home', title: 'Home', icon: require('../../assets/images/home.svg'), screen: 'Home', iconColor: '#3B82F6' },
        { id: 'academics', title: 'Academics', icon: require('../../assets/images/academics.svg'), screen: 'Academics', iconColor: '#8B5CF6' },
        { id: 'hr', title: 'HR', icon: require('../../assets/images/hr.svg'), screen: 'HR', iconColor: '#22C55E' },
        { id: 'attendance', title: 'My Attendance', icon: require('../../assets/images/Attandence.svg'), screen: 'StaffAttendance', iconColor: '#F59E0B' },
        { id: 'leave', title: 'My Leave', icon: require('../../assets/images/myleave.svg'), screen: 'StaffLeaveList', iconColor: '#06B6D4' },
        { id: 'timetable', title: 'Timetable', icon: require('../../assets/images/timetable.svg'), screen: 'StaffTimetable', iconColor: '#EC4899' },
        { id: 'notifications', title: 'Notifications', icon: require('../../assets/images/notifications.svg'), screen: 'Notifications', iconColor: '#EF4444' },
        { id: 'profile', title: 'Profile', icon: require('../../assets/images/Profile.svg'), screen: 'Profile', iconColor: '#6366F1' },
    ];

    const handleSidebarNavigation = (screen: string) => {
        closeSidebar();
        setTimeout(() => {
            if (screen !== 'Home') {
                navigation.navigate(screen as never);
            }
        }, 200);
    };

    const renderSidebar = () => (
        <Modal
            visible={showSidebar}
            transparent
            animationType="none"
            onRequestClose={closeSidebar}
        >
            <View style={styles.sidebarOverlay}>
                <TouchableWithoutFeedback onPress={closeSidebar}>
                    <View style={styles.sidebarBackdrop} />
                </TouchableWithoutFeedback>
                <Animated.View
                    style={[
                        styles.sidebarContainer,
                        { transform: [{ translateX: slideAnim }] },
                    ]}
                >
                    {/* Profile Header */}
                    <View style={styles.sidebarHeader}>
                        <View style={styles.sidebarProfileRow}>
                            <View style={styles.sidebarProfileImageContainer}>
                                <Image
                                    source={
                                        dashboardData.profile?.EmployeeProfileImageUrl
                                            ? { uri: dashboardData.profile.EmployeeProfileImageUrl }
                                            : require('../../assets/images/profile_img.png')
                                    }
                                    style={styles.sidebarProfileImage}
                                />
                            </View>
                            <View style={styles.sidebarProfileInfo}>
                                <Text style={styles.sidebarProfileName} numberOfLines={1}>
                                    {dashboardData.profile?.EmployeeName || user?.name || 'User'}
                                </Text>
                                <Text style={styles.sidebarProfileDesignation} numberOfLines={1}>
                                    {dashboardData.profile?.Designation || 'Staff'}
                                </Text>
                                <View style={styles.sidebarCodeBadge}>
                                    <Text style={styles.sidebarCodeText}>
                                        {dashboardData.profile?.EmployeeCode || user?.employeeCode || '---'}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.sidebarCloseBtn} onPress={closeSidebar}>
                                <Text style={styles.sidebarCloseBtnText}>×</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Menu Items */}
                    <ScrollView style={styles.sidebarMenu} showsVerticalScrollIndicator={false}>
                        {sidebarMenuItems.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.sidebarMenuItem}
                                onPress={() => handleSidebarNavigation(item.screen)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.sidebarMenuIconContainer, { backgroundColor: `${item.iconColor}20` }]}>
                                    <Image
                                        source={item.icon}
                                        style={[styles.sidebarMenuIcon, { tintColor: item.iconColor }]}
                                        resizeMode="contain"
                                    />
                                </View>
                                <Text style={styles.sidebarMenuItemText}>{item.title}</Text>
                                <Image
                                    source={require('../../assets/images/Polygonright.png')}
                                    style={styles.sidebarChevron}
                                    resizeMode="contain"
                                />
                            </TouchableOpacity>
                        ))}

                        {/* Sign Out */}
                        <TouchableOpacity
                            style={[styles.sidebarMenuItem, styles.sidebarSignOut]}
                            onPress={handleLogout}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.sidebarMenuIconContainer, { backgroundColor: '#FEE2E2' }]}>
                                <Image
                                    source={require('../../assets/images/right-from-bracket.svg')}
                                    style={[styles.sidebarMenuIcon, { tintColor: '#EF4444' }]}
                                    resizeMode="contain"
                                />
                            </View>
                            <Text style={[styles.sidebarMenuItemText, { color: '#EF4444' }]}>Sign Out</Text>
                        </TouchableOpacity>
                    </ScrollView>

                    {/* Footer */}
                    <View style={styles.sidebarFooter}>
                        <Text style={styles.sidebarFooterText}>Powered by</Text>
                        <Image
                            source={require('../../assets/images/eduegate_logo.png')}
                            style={styles.sidebarFooterLogo}
                            resizeMode="contain"
                        />
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={openSidebar}>
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
                style={[styles.quickAccessCard, { flex: 1 }]}
                onPress={() => navigation.navigate('Academics')}
            >
                <LinearGradient
                    colors={['#378ba6', '#1967ae']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientCard}
                >
                    <View style={styles.quickAccessContent}>
                        <Image source={require('../../assets/images/academics.svg')} style={styles.quickAccessIcon} />
                        <Text style={styles.quickAccessTitle}>Academics</Text>
                    </View>
                </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.quickAccessCard, { flex: 1 }]}
                onPress={() => navigation.navigate('HR')}
            >
                <LinearGradient
                    colors={['#21aa68', '#1a8a54']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientCard}
                >
                    <View style={styles.quickAccessContent}>
                        <Image source={require('../../assets/images/hr.svg')} style={styles.quickAccessIcon} />
                        <Text style={styles.quickAccessTitle}>HR</Text>
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );

    const MenuGridItem = ({ title, icon, onPress, bgColor, badgeCount, isSignOut }: any) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.menuIconWrapper}>
                <View style={[styles.menuIconContainer, { backgroundColor: bgColor }]}>
                    {isSignOut ? (
                        <View style={styles.signOutInnerCircle} />
                    ) : (
                        <Image source={icon} style={styles.menuIconImage} resizeMode="contain" />
                    )}
                </View>
                {badgeCount > 0 && (
                    <View style={styles.menuBadge}>
                        <Text style={styles.menuBadgeText}>{badgeCount}</Text>
                    </View>
                )}
            </View>
            <Text style={styles.menuTitle}>{title}</Text>
        </TouchableOpacity>
    );

    const renderMenuGrid = () => (
        <View style={styles.menuGridCard}>
            <View style={styles.menuGrid}>
                {!user?.isDriver && (
                    <>
                        <MenuGridItem
                            title="Classes"
                            icon={require('../../assets/images/classes.svg')}
                            bgColor="#8B5CF6"
                            onPress={() => navigation.navigate('TeacherClasses')}
                            badgeCount={dashboardData.counts.myClass}
                        />
                        <MenuGridItem
                            title="Assignments"
                            icon={require('../../assets/images/assignments.svg')}
                            bgColor="#22C55E"
                            onPress={() => navigation.navigate('Assignments')}
                            badgeCount={dashboardData.counts.assignments}
                        />
                        <MenuGridItem
                            title="Lesson plan"
                            icon={require('../../assets/images/lessonplan.svg')}
                            bgColor="#3B82F6"
                            onPress={() => navigation.navigate('LessonPlan')}
                            badgeCount={dashboardData.counts.lessonPlans}
                        />
                    </>
                )}

                <MenuGridItem
                    title="Circulars"
                    icon={require('../../assets/images/circulars.svg')}
                    bgColor="#F472B6"
                    onPress={() => navigation.navigate('Circulars')}
                    badgeCount={dashboardData.counts.circulars}
                />

                <MenuGridItem
                    title="Pending notifications"
                    icon={require('../../assets/images/notifications.svg')}
                    bgColor="#F59E0B"
                    onPress={() => navigation.navigate('Notifications')}
                    badgeCount={dashboardData.counts.notifications}
                />

                <MenuGridItem
                    title="Pickup verification"
                    icon={require('../../assets/images/scan.svg')}
                    bgColor="#06B6D4"
                    onPress={() => navigation.navigate('PickupVerification')}
                />

                <MenuGridItem
                    title="Employee leave request"
                    icon={require('../../assets/images/leaverequest.svg')}
                    bgColor="#3B82F6"
                    onPress={() => navigation.navigate('StaffLeaveList')}
                />

                {user?.isDriver && (
                    <>
                        <MenuGridItem
                            title="Driver Tracking"
                            icon={require('../../assets/images/transportbus.svg')}
                            bgColor="#F59E0B"
                            onPress={() => navigation.navigate('VehicleTracking')}
                        />
                        <MenuGridItem
                            title="Routes details"
                            icon={require('../../assets/images/routedetails.svg')}
                            bgColor="#8B5CF6"
                            onPress={() => navigation.navigate('DriverSchedule')}
                        />
                    </>
                )}

                <MenuGridItem
                    title="Communication"
                    icon={require('../../assets/images/homenotifications.svg')}
                    bgColor="#3B82F6"
                    onPress={() => navigation.navigate('Inbox')}
                />

                <MenuGridItem
                    title="Sign Out"
                    icon={require('../../assets/images/signout.png')}
                    bgColor="#EF4444"
                    isSignOut={true}
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
        </View>
    );

    return (
        <View style={styles.container}>
            {renderSidebar()}
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
        gap: 12,
    },
    quickAccessCard: {
        height: 85,
        borderRadius: 13,
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
        width: 48,
        height: 48,
        marginRight: 12,
        tintColor: '#fff',
    },
    quickAccessTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    menuGridCard: {
        marginHorizontal: 16,
        marginBottom: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingTop: 20,
        paddingBottom: 8,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    menuGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    menuItem: {
        width: '33.33%',
        alignItems: 'center',
        marginBottom: 28,
    },
    menuIconWrapper: {
        position: 'relative',
        marginBottom: 10,
    },
    menuIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
    },
    menuIconImage: {
        width: 28,
        height: 28,
        tintColor: '#FFFFFF',
    },
    signOutInnerCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
    },
    menuTitle: {
        fontSize: 12,
        color: '#374151',
        textAlign: 'center',
        fontWeight: '500',
        paddingHorizontal: 8,
        lineHeight: 16,
    },
    menuBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#EF4444',
        borderRadius: 12,
        minWidth: 22,
        height: 22,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 2,
        borderColor: '#F5F5F5',
    },
    menuBadgeText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
    },
    content: {
        flex: 1,
    },
    // Sidebar Styles
    sidebarOverlay: {
        flex: 1,
        flexDirection: 'row',
    },
    sidebarBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    sidebarContainer: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: width * 0.8,
        backgroundColor: '#FFFFFF',
    },
    sidebarHeader: {
        backgroundColor: '#7C3AED',
        paddingTop: 60,
        paddingBottom: 24,
        paddingHorizontal: 20,
    },
    sidebarProfileRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sidebarProfileImageContainer: {
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
    sidebarProfileImage: {
        width: '100%',
        height: '100%',
        borderRadius: 30,
    },
    sidebarProfileInfo: {
        flex: 1,
        marginLeft: 14,
    },
    sidebarProfileName: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 3,
    },
    sidebarProfileDesignation: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 8,
    },
    sidebarCodeBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    sidebarCodeText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    sidebarCloseBtn: {
        position: 'absolute',
        top: -10,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sidebarCloseBtnText: {
        fontSize: 24,
        color: '#FFFFFF',
        fontWeight: '300',
        marginTop: -2,
    },
    sidebarMenu: {
        flex: 1,
        paddingTop: 8,
    },
    sidebarMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    sidebarMenuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sidebarMenuIcon: {
        width: 22,
        height: 22,
    },
    sidebarMenuItemText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
        color: '#1F2937',
        marginLeft: 14,
    },
    sidebarChevron: {
        width: 8,
        height: 12,
        tintColor: '#9CA3AF',
    },
    sidebarSignOut: {
        marginTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        borderBottomWidth: 0,
    },
    sidebarFooter: {
        paddingVertical: 20,
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sidebarFooterText: {
        fontSize: 12,
        color: '#9CA3AF',
        marginRight: 8,
    },
    sidebarFooterLogo: {
        width: 80,
        height: 24,
    },
});

export default HomeScreen;
