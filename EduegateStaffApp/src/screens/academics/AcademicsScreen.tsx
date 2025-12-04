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
    StatusBar,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { authService } from '../../services/auth/authService';
import { homeService } from '../../services/home/homeService';
import { theme } from '../../constants/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48 - 24) / 3; // 48 for padding, 24 for gaps

interface AcademicsData {
    myClassCount: number;
    assignmentsCount: number;
    lessonPlansCount: number;
    circularsCount: number;
    notificationsCount: number;
    studentAttendanceCount: number;
}

export const AcademicsScreen: React.FC = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [academicsData, setAcademicsData] = useState<AcademicsData>({
        myClassCount: 0,
        assignmentsCount: 0,
        lessonPlansCount: 0,
        circularsCount: 0,
        notificationsCount: 0,
        studentAttendanceCount: 0,
    });

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        try {
            const [
                myClassCount,
                assignmentsCount,
                lessonPlansCount,
                circularsCount,
                notificationsCount,
            ] = await Promise.all([
                homeService.getMyClassCount(),
                homeService.getEmployeeAssignmentsCount(),
                homeService.getMyLessonPlanCount(),
                homeService.getLatestStaffCircularCount(),
                homeService.getMyNotificationCount(),
            ]);

            setAcademicsData({
                myClassCount,
                assignmentsCount,
                lessonPlansCount,
                circularsCount,
                notificationsCount,
                studentAttendanceCount: 0,
            });
        } catch (error) {
            console.error('Error loading academics data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity
                style={styles.backButtonContainer}
                onPress={() => navigation.goBack()}
            >
                <Image
                    source={require('../../assets/images/back.svg')}
                    style={styles.backIcon}
                    resizeMode="contain"
                />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Academics</Text>
            <View style={styles.headerRight} />
        </View>
    );

    const renderBanner = () => (
        <View style={styles.bannerContainer}>
            <LinearGradient
                colors={['#7C3AED', '#9333EA']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.banner}
            >
                <View style={styles.bannerContent}>
                    <Text style={styles.bannerText}>
                        "Empower Student{'\n'}Creativity with{'\n'}Assignments & Projects"
                    </Text>
                </View>
                {/* Decorative Circles */}
                <View style={styles.bannerDecorative}>
                    <View style={[styles.circle, styles.circleTopRight]} />
                    <View style={[styles.circle, styles.circleBottomRight]} />
                </View>
            </LinearGradient>
        </View>
    );

    const AcademicCard = ({
        title,
        label,
        count,
        iconSource,
        iconBgColor,
        onPress,
    }: {
        title: string;
        label: string;
        count: number;
        iconSource: any;
        iconBgColor: string;
        onPress: () => void;
    }) => (
        <TouchableOpacity style={styles.cardWrapper} onPress={onPress} activeOpacity={0.7}>
            <View style={[styles.iconCircle, { backgroundColor: iconBgColor }]}>
                <Image source={iconSource} style={styles.cardIcon} resizeMode="contain" />
            </View>
            <Text style={styles.cardTitle} numberOfLines={2}>{title}</Text>
            <View style={styles.cardLabelRow}>
                <Text style={styles.cardLabelText}>{label}</Text>
                {count > 0 && (
                    <View style={styles.countBadge}>
                        <Text style={styles.countBadgeText}>{count}</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    const academicItems = [
        {
            title: 'Class',
            label: 'Classes',
            count: academicsData.myClassCount,
            iconSource: require('../../assets/images/classes.svg'),
            iconBgColor: '#8B5CF6',
            screen: 'TeacherClasses',
        },
        {
            title: 'Assignments',
            label: 'Total',
            count: academicsData.assignmentsCount,
            iconSource: require('../../assets/images/assignments.svg'),
            iconBgColor: '#22C55E',
            screen: 'Assignments',
        },
        {
            title: 'Lesson plan',
            label: 'Lessons',
            count: academicsData.lessonPlansCount,
            iconSource: require('../../assets/images/lessonplan.svg'),
            iconBgColor: '#3B82F6',
            screen: 'LessonPlan',
        },
        {
            title: 'Circulars',
            label: 'Circulars',
            count: academicsData.circularsCount,
            iconSource: require('../../assets/images/circulars.svg'),
            iconBgColor: '#EF4444',
            screen: 'Circulars',
        },
        {
            title: 'Notifications',
            label: 'Alerts',
            count: academicsData.notificationsCount,
            iconSource: require('../../assets/images/notifications.svg'),
            iconBgColor: '#F59E0B',
            screen: 'Notifications',
        },
        {
            title: 'Student attendance',
            label: 'Records',
            count: academicsData.studentAttendanceCount,
            iconSource: require('../../assets/images/student_attandance.svg'),
            iconBgColor: '#06B6D4',
            screen: 'AttendanceClasses',
        },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            {renderHeader()}
            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={['#7C3AED']}
                        tintColor="#7C3AED"
                    />
                }
            >
                {renderBanner()}

                {/* Academic Cards Grid */}
                <View style={styles.cardsContainer}>
                    <View style={styles.row}>
                        {academicItems.slice(0, 3).map((item, index) => (
                            <AcademicCard
                                key={index}
                                title={item.title}
                                label={item.label}
                                count={item.count}
                                iconSource={item.iconSource}
                                iconBgColor={item.iconBgColor}
                                onPress={() => navigation.navigate(item.screen as never)}
                            />
                        ))}
                    </View>
                    <View style={styles.row}>
                        {academicItems.slice(3, 6).map((item, index) => (
                            <AcademicCard
                                key={index}
                                title={item.title}
                                label={item.label}
                                count={item.count}
                                iconSource={item.iconSource}
                                iconBgColor={item.iconBgColor}
                                onPress={() => navigation.navigate(item.screen as never)}
                            />
                        ))}
                    </View>

                    {/* Time Table Card - Full Width Style */}
                    <View style={styles.timetableRow}>
                        <TouchableOpacity
                            style={styles.timeTableCard}
                            onPress={() => navigation.navigate('StaffTimetable' as never)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.iconCircle, { backgroundColor: '#DC2626' }]}>
                                <Image
                                    source={require('../../assets/images/timetable.svg')}
                                    style={styles.cardIcon}
                                    resizeMode="contain"
                                />
                            </View>
                            <Text style={styles.cardTitle}>Time Table</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.bottomSpacer} />
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    backButtonContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backIcon: {
        width: 20,
        height: 20,
        tintColor: '#1F2937',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        flex: 1,
        textAlign: 'center',
    },
    headerRight: {
        width: 40,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    bannerContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 20,
    },
    banner: {
        borderRadius: 16,
        padding: 24,
        minHeight: 150,
        overflow: 'hidden',
        position: 'relative',
    },
    bannerContent: {
        flex: 1,
        justifyContent: 'center',
        maxWidth: '70%',
    },
    bannerText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        lineHeight: 26,
        letterSpacing: 0.3,
    },
    bannerDecorative: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        right: 0,
    },
    circle: {
        position: 'absolute',
        backgroundColor: '#FACC15',
        borderRadius: 100,
    },
    circleTopRight: {
        width: 80,
        height: 80,
        top: -10,
        right: -10,
        opacity: 0.9,
    },
    circleBottomRight: {
        width: 60,
        height: 60,
        bottom: 20,
        right: 60,
        opacity: 0.85,
    },
    cardsContainer: {
        paddingHorizontal: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        gap: 12,
    },
    timetableRow: {
        flexDirection: 'row',
        marginTop: 4,
    },
    cardWrapper: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingVertical: 20,
        paddingHorizontal: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    timeTableCard: {
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingVertical: 20,
        paddingHorizontal: 24,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardIcon: {
        width: 28,
        height: 28,
        tintColor: '#FFFFFF',
    },
    cardTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 6,
        lineHeight: 18,
    },
    cardLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    cardLabelText: {
        fontSize: 11,
        color: '#6B7280',
        fontWeight: '500',
    },
    countBadge: {
        backgroundColor: '#EF4444',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    countBadgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
    },
    bottomSpacer: {
        height: 40,
    },
});

export default AcademicsScreen;
