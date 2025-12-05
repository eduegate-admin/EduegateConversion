import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Dimensions, StatusBar, Animated } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { authService, User } from '../../services/auth/authService';
import { studentService, Student } from '../../services/student/studentService';
import { theme } from '../../constants/theme';
import LinearGradient from 'react-native-linear-gradient';
import SideMenu from '../../components/SideMenu';
import { BottomMenu } from '../../components/BottomMenu';

// Import SVGs
import MenuIcon from '../../assets/images/magicoon-Bold.svg';
import NotificationIcon from '../../assets/images/Notifications_icon.svg';
import MyWardsIcon from '../../assets/images/mywards.svg';
import ApplicationsIcon from '../../assets/images/studentapplication.svg';
import CommunicationsIcon from '../../assets/images/homenotifications.svg';
import CircularsIcon from '../../assets/images/mycirculars.svg';
import TransportIcon from '../../assets/images/transport.svg';
import OnlineStoreIcon from '../../assets/images/homeOnlineStore.svg';
import LibraryIcon from '../../assets/images/library.svg';
import CounselorIcon from '../../assets/images/councellor.svg';
import FeePaymentIcon from '../../assets/images/fee_payment.svg';
import PaymentHistoryIcon from '../../assets/images/payment-history.svg';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;
const CARD_ASPECT_RATIO = 2.5; // Wider aspect ratio to avoid cropping text
const CARD_HEIGHT = CARD_WIDTH / CARD_ASPECT_RATIO;

export const HomeScreen = () => {
    // ... existing hook logic ... 

    const navigation = useNavigation<any>();
    const [user, setUser] = useState<User | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [feeDue, setFeeDue] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [menuVisible, setMenuVisible] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);
    const [pickupRequestCount, setPickupRequestCount] = useState(0);
    const [pickupRegisterCount, setPickupRegisterCount] = useState(0);
    const [activeSlide, setActiveSlide] = useState(0);
    const scrollX = React.useRef(new Animated.Value(0)).current;

    // Banners
    const banners = [
        require('../../assets/images/Component 1.png'),
        require('../../assets/images/Component 2.png'),
        require('../../assets/images/Component 3.png'),
    ];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const userData = await authService.getCurrentUser();
            setUser(userData);

            const myStudents = await studentService.getMyStudents();
            setStudents(myStudents);

            // Calculate total fee due for all students
            let totalDue = 0;
            for (const student of myStudents) {
                const due = await studentService.getFeeDueAmount(student.StudentIID);
                totalDue += due;
            }
            setFeeDue(totalDue);

            // Fetch dashboard counts
            const pickupReq = await studentService.getPickupRequestCount();
            setPickupRequestCount(pickupReq);

            const pickupReg = await studentService.getPickupRegisterCount();
            setPickupRegisterCount(pickupReg);

            const notifCount = await studentService.getNotificationCount();
            setNotificationCount(notifCount);

        } catch (error) {
            console.error('Failed to load data', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        await authService.logout();
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
    };

    const QuickAccessItem = ({ icon: Icon, label, onPress, color1, color2 }: any) => (
        <TouchableOpacity style={styles.quickAccessItem} onPress={onPress}>
            <View style={styles.iconWrapper}>
                <LinearGradient
                    colors={[color1, color2]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.iconBackground}
                >
                    <Icon width={40} height={40} fill="#fff" />
                </LinearGradient>
            </View>
            <Text style={styles.quickAccessLabel}>{label}</Text>
        </TouchableOpacity>
    );

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={theme.colors.secondary} />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => setMenuVisible(true)}>
                        <MenuIcon width={30} height={30} fill={theme.colors.white} />
                    </TouchableOpacity>

                    <Image
                        source={require('../../assets/images/pearl_logo.png')}
                        style={styles.headerLogo}
                        resizeMode="contain"
                    />

                    <TouchableOpacity style={styles.notificationContainer} onPress={() => navigation.navigate('Notifications')}>
                        <NotificationIcon width={25} height={25} fill={theme.colors.white} />
                        {notificationCount > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{notificationCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.welcomeSection}>
                    <Text style={styles.welcomeLabel}>Welcome</Text>
                    <View style={styles.userIdContainer}>
                        <Text style={styles.userId}>{user?.LoginUserID || 'ID: 12345'}</Text>
                    </View>
                    <Text style={styles.userName}>{user?.Name || 'Parent Name'}!</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.carouselContainer}>
                    <Animated.ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        decelerationRate="fast"
                        snapToInterval={CARD_WIDTH + 12} // CARD_WIDTH + SPACING
                        snapToAlignment="start"
                        contentContainerStyle={{
                            paddingHorizontal: (width - CARD_WIDTH) / 2 - 6, // Centering logic
                        }}
                        onScroll={Animated.event(
                            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                            {
                                useNativeDriver: true,
                                listener: (e: any) => {
                                    const slide = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + 12));
                                    if (slide !== activeSlide) {
                                        setActiveSlide(slide);
                                    }
                                }
                            }
                        )}
                        scrollEventThrottle={16}
                    >
                        {banners.map((banner, index) => {
                            const ITEM_SIZE = CARD_WIDTH + 12;
                            const inputRange = [
                                (index - 1) * ITEM_SIZE,
                                index * ITEM_SIZE,
                                (index + 1) * ITEM_SIZE,
                            ];
                            const scale = scrollX.interpolate({
                                inputRange,
                                outputRange: [0.9, 1, 0.9],
                                extrapolate: 'clamp',
                            });
                            const opacity = scrollX.interpolate({
                                inputRange,
                                outputRange: [0.6, 1, 0.6],
                                extrapolate: 'clamp',
                            });

                            return (
                                <View key={index} style={styles.bannerSlide}>
                                    <Animated.View style={[styles.bannerCard, { transform: [{ scale }], opacity }]}>
                                        <Image source={banner} style={styles.bannerImage} resizeMode="cover" />
                                    </Animated.View>
                                </View>
                            );
                        })}
                    </Animated.ScrollView>
                    {/* Pagination Dots */}
                    <View style={styles.pagination}>
                        {banners.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.dot,
                                    index === activeSlide ? styles.activeDot : styles.inactiveDot,
                                ]}
                            />
                        ))}
                    </View>
                </View>

                <View style={styles.paddedContent}>
                    {/* Quick Access Grid */}
                    <View style={styles.section}>
                        <View style={styles.gridContainer}>
                            <QuickAccessItem
                                icon={MyWardsIcon}
                                label="My Wards"
                                color1="#AF70FF" color2="#694399"
                                onPress={() => navigation.navigate('MyWards')}
                            />
                            <QuickAccessItem
                                icon={ApplicationsIcon}
                                label="Applications"
                                color1="#97DA77" color2="#50743F"
                                onPress={() => navigation.navigate('ApplicationStatus')}
                            />
                            <QuickAccessItem
                                icon={CommunicationsIcon}
                                label="Communications"
                                color1="#708FFF" color2="#4062D9"
                                onPress={() => navigation.navigate('Communications')}
                            />
                            <QuickAccessItem
                                icon={CircularsIcon}
                                label="Circulars"
                                color1="#FF8170" color2="#CF402C"
                                onPress={() => navigation.navigate('Circulars')}
                            />
                            <QuickAccessItem
                                icon={CircularsIcon} // Placeholder icon
                                label="Time Table"
                                color1="#20c997" color2="#148060" // Teal color
                                onPress={() => navigation.navigate('TimeTable')}
                            />
                            <QuickAccessItem
                                icon={TransportIcon}
                                label="Transport"
                                color1="#FFA370" color2="#E3BF00"
                                onPress={() => navigation.navigate('Transport')}
                            />
                            <QuickAccessItem
                                icon={OnlineStoreIcon}
                                label="Online Store"
                                color1="#4B9DE9" color2="#3CCFFD"
                                onPress={() => navigation.navigate('OnlineStore')}
                            />
                            <QuickAccessItem
                                icon={LibraryIcon}
                                label="Library"
                                color1="#FF8170" color2="#CF402C"
                                onPress={() => navigation.navigate('Library')}
                            />
                            <QuickAccessItem
                                icon={CounselorIcon}
                                label="Counsellor Corner"
                                color1="#708FFF" color2="#4062D9"
                                onPress={() => navigation.navigate('CounselorCorner')}
                            />
                        </View>
                    </View>

                    {/* Daily Pickup Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Daily Pickup</Text>
                        <View style={styles.pickupRow}>
                            <TouchableOpacity
                                style={[styles.pickupCard, { backgroundColor: '#1A7F80' }]}
                                onPress={() => navigation.navigate('EarlyPickup')}
                            >
                                <LinearGradient
                                    colors={['#1A7F80', '#2E9F9F']}
                                    style={styles.pickupGradient}
                                >
                                    <View style={styles.pickupContent}>
                                        <Text style={styles.pickupLabel}>Early Pickup Request</Text>
                                        <View style={styles.pickupCountCircle}>
                                            <Text style={[styles.pickupCount, { color: '#1A7F80' }]}>{pickupRequestCount}</Text>
                                        </View>
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.pickupCard, { backgroundColor: '#7D45B2' }]}
                                onPress={() => navigation.navigate('PickupRequest')}
                            >
                                <LinearGradient
                                    colors={['#7D45B2', '#9B6AD6']}
                                    style={styles.pickupGradient}
                                >
                                    <View style={styles.pickupContent}>
                                        <Text style={styles.pickupLabel}>Pickup Request</Text>
                                        <View style={styles.pickupCountCircle}>
                                            <Text style={[styles.pickupCount, { color: '#7D45B2' }]}>{pickupRegisterCount}</Text>
                                        </View>
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Fee Payment Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Fee Payment</Text>
                        <View style={styles.feeContainer}>
                            <View style={styles.feeDueCard}>
                                <View style={styles.feeDueHeader}>
                                    <View style={styles.feeIconCircle}>
                                        <Text style={{ fontSize: 20 }}>💰</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.feeDueLabel}>Fee Dues</Text>
                                        <Text style={styles.feeDueSubLabel}>Total amount of fee for all wards</Text>
                                    </View>
                                </View>
                                <Text style={styles.feeAmount}>QAR {feeDue.toFixed(2)}</Text>
                            </View>

                            <View style={styles.feeButtonsRow}>
                                <TouchableOpacity
                                    style={styles.feeButton}
                                    onPress={() => navigation.navigate('FeePayment')}
                                >
                                    <LinearGradient
                                        colors={['#FFC107', '#FF9800']}
                                        style={styles.feeButtonGradient}
                                    >
                                        <FeePaymentIcon width={30} height={30} fill="#fff" />
                                        <Text style={styles.feeButtonText}>Fee Payment</Text>
                                    </LinearGradient>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.feeButton}
                                    onPress={() => navigation.navigate('PaymentHistory')}
                                >
                                    <LinearGradient
                                        colors={['#FF5722', '#F44336']}
                                        style={styles.feeButtonGradient}
                                    >
                                        <PaymentHistoryIcon width={30} height={30} fill="#fff" />
                                        <Text style={styles.feeButtonText}>Payment History</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom Menu */}
            <BottomMenu />

            {/* Side Menu */}
            <SideMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        backgroundColor: theme.colors.primary,
        paddingTop: 40, // For status bar
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerLogo: {
        height: 40,
        width: 120,
    },
    notificationContainer: {
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: theme.colors.danger,
        borderRadius: 10,
        width: 18,
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
        alignItems: 'flex-start',
    },
    welcomeLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 24,
        fontWeight: '300',
    },
    userIdContainer: {
        backgroundColor: '#fff',
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 4,
        marginVertical: 4,
    },
    userId: {
        color: '#000',
        fontSize: 14,
        fontWeight: 'bold',
    },
    userName: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    content: {
        paddingHorizontal: 0,
        paddingBottom: 100, // Accommodate bottom menu
    },
    carouselContainer: {
        height: CARD_HEIGHT + 30, // Card height + pagination space
        marginTop: 20,
        marginBottom: 20,
    },
    bannerSlide: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        marginHorizontal: 6, // Half of spacing (12)
        justifyContent: 'center',
    },
    bannerCard: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
    },
    bannerImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    pagination: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 8, // Inside the card or below? M3 usually inside if hero, or below. Let's put it inside.
        alignSelf: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: '#fff',
        width: 12,
        height: 12,
        borderRadius: 6,
        marginTop: -2,
    },
    inactiveDot: {
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    paddedContent: {
        paddingHorizontal: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        elevation: 2,
    },
    quickAccessItem: {
        width: '30%',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconWrapper: {
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    iconBackground: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quickAccessLabel: {
        fontSize: 12,
        color: '#333',
        textAlign: 'center',
        fontWeight: '600',
    },
    pickupRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    pickupCard: {
        width: '48%',
        height: 100,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 3,
    },
    pickupGradient: {
        flex: 1,
        padding: 16,
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
    },
    pickupContent: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pickupLabel: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
    pickupCountCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pickupCount: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    feeContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        elevation: 2,
    },
    feeDueCard: {
        backgroundColor: '#E3F2FD',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    feeDueHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    feeIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    feeDueLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    feeDueSubLabel: {
        fontSize: 12,
        color: '#666',
    },
    feeAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'right',
    },
    feeButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    feeButton: {
        width: '48%',
        height: 80,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 3,
    },
    feeButtonGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 8,
    },
    feeButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 8,
        textAlign: 'center',
    },
});
