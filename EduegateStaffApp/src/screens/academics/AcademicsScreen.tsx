import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    RefreshControl,
    ImageBackground,
    Dimensions,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { authService } from '../../services/auth/authService';
import { homeService } from '../../services/home/homeService';
import { theme } from '../../constants/theme';

const { width } = Dimensions.get('window');

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
                studentAttendanceCount: 0, // API endpoint not available
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
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.backButton}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Academics</Text>
            <View style={{ width: 24 }} />
        </View>
    );

    const renderBanner = () => (
        <View style={styles.bannerContainer}>
            <LinearGradient
                colors={['#6B46C1', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.banner}
            >
                <View style={styles.bannerContent}>
                    <Text style={styles.bannerText}>
                        "Empower Student Creativity with Assignments & Projects"
                    </Text>
                </View>
                <View style={styles.bannerDecorative}>
                    <View style={[styles.circle, { width: 70, height: 70, top: 20, right: 20 }]} />
                    <View style={[styles.circle, { width: 50, height: 50, bottom: 30, right: 100 }]} />
                </View>
            </LinearGradient>
        </View>
    );

    const AcademicCard = ({
        title,
        label,
        count,
        icon,
        gradientColors,
        onPress,
    }: {
        title: string;
        label: string;
        count: number;
        icon: any;
        gradientColors: string[];
        onPress: () => void;
    }) => (
        <TouchableOpacity style={styles.cardWrapper} onPress={onPress}>
            <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconCircle}
            >
                <Image source={icon} style={styles.cardIcon} resizeMode="contain" />
            </LinearGradient>
            <Text style={styles.cardTitle}>{title}</Text>
            <View style={styles.cardLabel}>
                <Text style={styles.cardLabelText}>{label}</Text>
                {count > 0 && (
                    <View style={styles.countBadge}>
                        <Text style={styles.countBadgeText}>{count}</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
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
                {renderBanner()}

                {/* Academic Cards Grid */}
                <View style={styles.cardsContainer}>
                    <View style={styles.row}>
                        <View style={styles.cardCol}>
                            <AcademicCard
                                title="Class"
                                label="Classes"
                                count={academicsData.myClassCount}
                                icon={require('../../assets/images/classes.svg')}
                                gradientColors={['#7C3AED', '#A78BFA']}
                                onPress={() => navigation.navigate('TeacherClasses')}
                            />
                        </View>
                        <View style={styles.cardCol}>
                            <AcademicCard
                                title="Assignments"
                                label="Total"
                                count={academicsData.assignmentsCount}
                                icon={require('../../assets/images/assignments.svg')}
                                gradientColors={['#22C55E', '#86EFAC']}
                                onPress={() => navigation.navigate('Assignments')}
                            />
                        </View>
                        <View style={styles.cardCol}>
                            <AcademicCard
                                title="Lesson plan"
                                label="Lessons"
                                count={academicsData.lessonPlansCount}
                                icon={require('../../assets/images/lessonplan.svg')}
                                gradientColors={['#3B82F6', '#93C5FD']}
                                onPress={() => navigation.navigate('LessonPlan')}
                            />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.cardCol}>
                            <AcademicCard
                                title="Circulars"
                                label="Circulars"
                                count={academicsData.circularsCount}
                                icon={require('../../assets/images/circulars.svg')}
                                gradientColors={['#EF4444', '#F87171']}
                                onPress={() => navigation.navigate('Circulars')}
                            />
                        </View>
                        <View style={styles.cardCol}>
                            <AcademicCard
                                title="Notifications"
                                label="Alerts"
                                count={academicsData.notificationsCount}
                                icon={require('../../assets/images/notifications.svg')}
                                gradientColors={['#F59E0B', '#FCD34D']}
                                onPress={() => navigation.navigate('Notifications')}
                            />
                        </View>
                        <View style={styles.cardCol}>
                            <AcademicCard
                                title="Student attendance"
                                label="Records"
                                count={academicsData.studentAttendanceCount}
                                icon={require('../../assets/images/student_attandance.svg')}
                                gradientColors={['#06B6D4', '#67E8F9']}
                                onPress={() => navigation.navigate('AttendanceClasses')}
                            />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.cardCol}>
                            <TouchableOpacity
                                style={styles.timeTableCard}
                                onPress={() => navigation.navigate('StaffTimetable')}
                            >
                                <LinearGradient
                                    colors={['#DC2626', '#FCA5A5']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.iconCircle}
                                >
                                    <Image
                                        source={require('../../assets/images/timetable.svg')}
                                        style={styles.cardIcon}
                                        resizeMode="contain"
                                    />
                                </LinearGradient>
                                <Text style={styles.cardTitle}>Time Table</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
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
    bannerContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 24,
    },
    banner: {
        borderRadius: 16,
        padding: 20,
        minHeight: 140,
        overflow: 'hidden',
        position: 'relative',
    },
    bannerContent: {
        flex: 1,
        justifyContent: 'center',
    },
    bannerText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        lineHeight: 26,
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
        backgroundColor: '#D4D34A',
        borderRadius: 50,
        opacity: 0.8,
    },
    cardsContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 16,
    },
    cardCol: {
        flex: 1,
    },
    cardWrapper: {
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    timeTableCard: {
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    iconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
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
        width: 30,
        height: 30,
        tintColor: '#fff',
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 4,
    },
    cardLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    cardLabelText: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    countBadge: {
        backgroundColor: '#EF4444',
        borderRadius: 12,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    countBadgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '700',
    },
});

export default AcademicsScreen;
