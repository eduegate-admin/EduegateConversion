import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { apiClient } from '../../services/api/client';
import { API_CONFIG } from '../../constants/config';
import { theme } from '../../constants/theme';

interface StaffProfile {
    EmployeeName: string;
    EmployeeCode: string;
    EmployeeProfileImageUrl?: string;
    Designation?: string;
    Department?: string;
}

interface HRCard {
    id: string;
    title: string;
    subtitle?: string;
    icon: string;
    colors: [string, string];
    route: string;
    params?: any;
}

const { width } = Dimensions.get('window');

export const HRScreen: React.FC = () => {
    const navigation = useNavigation();
    const [profile, setProfile] = useState<StaffProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStaffProfile();
    }, []);

    const loadStaffProfile = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get<StaffProfile>(
                `${API_CONFIG.SchoolServiceUrl}/GetStaffDetailForHome`
            );
            setProfile(response.data || null);
        } catch (error) {
            console.error('Error loading staff profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const hrCards: HRCard[] = [
        {
            id: 'leaves',
            title: 'My Leaves',
            icon: '📋',
            colors: ['#A77FD9', '#6B4AB8'],
            route: 'StaffLeaveList',
        },
        {
            id: 'attendance',
            title: 'My Attendance',
            icon: '✓',
            colors: ['#5DADE2', '#2E7FA3'],
            route: 'StaffAttendance',
        },
        {
            id: 'leaveRequest',
            title: 'Employee\nleaverequest',
            subtitle: 'Employee\nleave request',
            icon: '📄',
            colors: ['#F5A962', '#D68A4F'],
            route: 'StaffLeaveList',
        },
        {
            id: 'paySlip',
            title: 'Pay Slip',
            icon: '💰',
            colors: ['#F5D76E', '#D4A835'],
            route: 'SalarySlip',
        },
    ];

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.backButton}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>HR</Text>
            <View style={{ width: 24 }} />
        </View>
    );

    const renderBanner = () => (
        <View style={styles.bannerContainer}>
            <LinearGradient
                colors={['#6B4AB8', '#9B6FD9', '#7B5A9F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.banner}
            >
                {/* Left side with image placeholder */}
                <View style={styles.bannerImageWrapper}>
                    <Image
                        source={require('../../assets/images/profile_img.png')}
                        style={styles.bannerImage}
                    />
                </View>

                {/* Right side with text */}
                <View style={styles.bannerTextWrapper}>
                    <Text style={styles.bannerTitle}>
                        "Unlock the Power of Data-Driven Insights for Student Progress"
                    </Text>
                </View>

                {/* Decorative circles */}
                <View style={[styles.decorativeCircle, styles.circle1]} />
                <View style={[styles.decorativeCircle, styles.circle2]} />
                <View style={[styles.decorativeCircle, styles.circle3]} />
                <View style={[styles.decorativeCircle, styles.circle4]} />
            </LinearGradient>
        </View>
    );

    const renderCard = (card: HRCard) => (
        <TouchableOpacity
            key={card.id}
            style={styles.cardWrapper}
            onPress={() => {
                if (card.route === 'StaffLeaveList') {
                    // Map HR routes to actual screens
                    if (card.id === 'leaves') {
                        (navigation as any).navigate('StaffLeaveList');
                    } else if (card.id === 'attendance') {
                        (navigation as any).navigate('StaffAttendance');
                    } else if (card.id === 'leaveRequest') {
                        (navigation as any).navigate('StaffLeaveList');
                    } else if (card.id === 'paySlip') {
                        // Navigate to salary slip with employee ID if available
                        (navigation as any).navigate('SalarySlip', {
                            employeeId: profile?.EmployeeCode,
                        });
                    }
                }
            }}
        >
            <LinearGradient
                colors={card.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardCircle}
            >
                <Text style={styles.cardIcon}>{card.icon}</Text>
            </LinearGradient>
            <Text style={styles.cardTitle}>{card.title}</Text>
        </TouchableOpacity>
    );

    const renderCardsGrid = () => (
        <View style={styles.cardsContainer}>
            <View style={styles.cardsContent}>
                <View style={styles.cardsRow}>
                    {renderCard(hrCards[0])}
                    {renderCard(hrCards[1])}
                </View>
                <View style={styles.cardsRow}>
                    {renderCard(hrCards[2])}
                    {renderCard(hrCards[3])}
                </View>
            </View>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                {renderHeader()}
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {renderBanner()}
                {renderCardsGrid()}
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        fontSize: 24,
        color: '#1F2937',
        fontWeight: '600',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
    },
    content: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Banner Styles
    bannerContainer: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    banner: {
        borderRadius: 16,
        padding: 20,
        minHeight: 160,
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
        justifyContent: 'space-between',
    },
    bannerImageWrapper: {
        flex: 0.4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bannerImage: {
        width: 80,
        height: 100,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    bannerTextWrapper: {
        flex: 0.6,
        paddingLeft: 12,
    },
    bannerTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
        lineHeight: 20,
    },
    decorativeCircle: {
        position: 'absolute',
        borderRadius: 9999,
        opacity: 0.15,
    },
    circle1: {
        width: 40,
        height: 40,
        top: 20,
        left: 10,
        backgroundColor: '#00D4FF',
    },
    circle2: {
        width: 60,
        height: 60,
        bottom: 10,
        right: 20,
        backgroundColor: '#00D4FF',
    },
    circle3: {
        width: 30,
        height: 30,
        top: 50,
        right: 40,
        backgroundColor: '#00D4FF',
    },
    circle4: {
        width: 20,
        height: 20,
        bottom: 30,
        left: 30,
        backgroundColor: '#00D4FF',
    },

    // Cards Styles
    cardsContainer: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    cardsContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
    },
    cardsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 32,
    },
    cardWrapper: {
        alignItems: 'center',
        width: '45%',
    },
    cardCircle: {
        width: 76,
        height: 76,
        borderRadius: 38,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
    },
    cardIcon: {
        fontSize: 32,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default HRScreen;
