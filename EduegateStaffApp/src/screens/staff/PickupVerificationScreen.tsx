import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    RefreshControl,
    ActivityIndicator,
    SafeAreaView,
    Dimensions,
    FlatList,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { apiClient } from '../../services/api/client';
import { API_CONFIG } from '../../constants/config';
import { theme } from '../../constants/theme';

interface PickupRequest {
    StudentID: number;
    StudentFullName: string;
    AdmissionNumber: string;
    StudentProfileImageUrl: string;
    Student: { Value: string };
    PickedByDescription: string;
    PickByFullName: string;
    RequestStatus: 'New' | 'Approved' | 'Rejected' | 'Picked' | 'Cancelled';
    PickupDate?: string;
}

interface TeacherClass {
    ClassID: number;
    SectionID: number;
    ClassName: string;
    SectionName: string;
    PickupRequests?: PickupRequest[];
}

interface InspectionStats {
    activeInspections: number;
    proceed: number;
    cancelled: number;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const STATUS_COLORS: {
    [key: string]: { bg: string; text: string };
} = {
    'New': { bg: '#FEF3C7', text: '#D97706' },
    'Approved': { bg: '#DCFCE7', text: '#16A34A' },
    'Rejected': { bg: '#FEE2E2', text: '#DC2626' },
    'Picked': { bg: '#DBEAFE', text: '#0284C7' },
    'Cancelled': { bg: '#FEE2E2', text: '#DC2626' },
};

export const PickupVerificationScreen: React.FC = () => {
    const navigation = useNavigation();
    const [classes, setClasses] = useState<TeacherClass[]>([]);
    const [expandedClass, setExpandedClass] = useState<number | null>(null);
    const [stats, setStats] = useState<InspectionStats>({
        activeInspections: 0,
        proceed: 0,
        cancelled: 0,
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async (isRefresh: boolean = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);

            const response = await apiClient.get<TeacherClass[]>(
                `${API_CONFIG.SchoolServiceUrl}/GetTeacherClass`
            );

            const classesData = Array.isArray(response.data) ? response.data : [];
            setClasses(classesData);

            // Calculate stats
            let activeCount = 0;
            let proceedCount = 0;
            let cancelledCount = 0;

            classesData.forEach(cls => {
                if (cls.PickupRequests && Array.isArray(cls.PickupRequests)) {
                    activeCount += cls.PickupRequests.length;
                    proceedCount += cls.PickupRequests.filter(
                        r => r.RequestStatus === 'Picked'
                    ).length;
                    cancelledCount += cls.PickupRequests.filter(
                        r => r.RequestStatus === 'Cancelled'
                    ).length;
                }
            });

            setStats({
                activeInspections: classesData.length,
                proceed: proceedCount,
                cancelled: cancelledCount,
            });
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        loadData(true);
    };

    const toggleClass = async (classData: TeacherClass) => {
        if (expandedClass === classData.ClassID) {
            setExpandedClass(null);
        } else {
            setExpandedClass(classData.ClassID);
            // Load pickup requests for this class
            await loadPickupRequests(classData);
        }
    };

    const loadPickupRequests = async (classData: TeacherClass) => {
        try {
            const date = new Date().toISOString().split('T')[0];
            const response = await apiClient.get(
                `${API_CONFIG.SchoolServiceUrl}/GetPickupRequestsByClassSectionDate`,
                {
                    params: {
                        classID: classData.ClassID,
                        sectionID: classData.SectionID,
                        date,
                    },
                }
            );

            setClasses(prev =>
                prev.map(cls =>
                    cls.ClassID === classData.ClassID
                        ? { ...cls, PickupRequests: response.data || [] }
                        : cls
                )
            );
        } catch (error) {
            console.error('Error loading pickup requests:', error);
        }
    };

    const extractClassNumber = (className: string) => {
        const match = className.match(/\d+/);
        return match ? match[0] : className;
    };

    const getStatusColor = (status: string) => {
        return STATUS_COLORS[status] || STATUS_COLORS['New'];
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.backButton}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Pickup Verification</Text>
            <View style={{ width: 24 }} />
        </View>
    );

    const StatsCard = ({
        title,
        value,
        backgroundColor,
    }: {
        title: string;
        value: number;
        backgroundColor: string;
    }) => (
        <LinearGradient
            colors={[backgroundColor, backgroundColor]}
            style={styles.statsCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <Text style={styles.statsValue}>{value}</Text>
            <Text style={styles.statsLabel}>{title}</Text>
        </LinearGradient>
    );

    const RequestItem = ({ request }: { request: PickupRequest }) => {
        const statusColor = getStatusColor(request.RequestStatus);
        return (
            <View style={styles.requestItem}>
                <Image
                    source={{
                        uri: request.StudentProfileImageUrl ||
                            'https://via.placeholder.com/50',
                    }}
                    style={styles.studentImage}
                />
                <View style={styles.requestInfo}>
                    <Text style={styles.studentName}>
                        {request.AdmissionNumber} - {request.StudentFullName}
                    </Text>
                    <Text style={styles.pickedBy}>
                        <Text style={{ fontWeight: '700', color: '#20722D' }}>
                            PICKED BY{' '}
                        </Text>
                        {request.PickByFullName}
                    </Text>
                </View>
                <View
                    style={[
                        styles.statusBadge,
                        { backgroundColor: statusColor.bg },
                    ]}
                >
                    <Text style={[styles.statusText, { color: statusColor.text }]}>
                        {request.RequestStatus}
                    </Text>
                </View>
            </View>
        );
    };

    const ClassCard = ({ classData }: { classData: TeacherClass }) => {
        const isExpanded = expandedClass === classData.ClassID;
        const classNumber = extractClassNumber(classData.ClassName);

        return (
            <View style={styles.classCardWrapper}>
                <TouchableOpacity
                    style={styles.classCardHeader}
                    onPress={() => toggleClass(classData)}
                >
                    <View style={styles.classIcon}>
                        <Text style={styles.classIconText}>{classNumber}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.className}>{classData.ClassName}</Text>
                        <Text style={styles.sectionName}>
                            Section: {classData.SectionName}
                        </Text>
                    </View>
                    <Text style={styles.chevron}>{isExpanded ? '▼' : '▶'}</Text>
                </TouchableOpacity>

                {isExpanded && (
                    <View style={styles.expandedContent}>
                        {classData.PickupRequests && classData.PickupRequests.length > 0 ? (
                            <FlatList
                                data={classData.PickupRequests}
                                renderItem={({ item }) => <RequestItem request={item} />}
                                keyExtractor={(item, idx) => `${item.StudentID}-${idx}`}
                                scrollEnabled={false}
                            />
                        ) : (
                            <Text style={styles.noRequestsText}>
                                No pickup requests for this class
                            </Text>
                        )}
                    </View>
                )}
            </View>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Classes Found</Text>
            <Text style={styles.emptyMessage}>
                There are no classes assigned to you
            </Text>
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

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[theme.colors.primary]}
                    />
                }
            >
                {/* Stats Section */}
                <View style={styles.statsContainer}>
                    <StatsCard
                        title="Active Inspections"
                        value={stats.activeInspections}
                        backgroundColor="#98BBEF"
                    />
                    <StatsCard
                        title="Active Inspection color"
                        value={1}
                        backgroundColor="#7EC59A"
                    />
                </View>

                {/* Stats Summary */}
                <View style={styles.summaryContainer}>
                    <View style={styles.summaryBox}>
                        <Text style={styles.summaryLabel}>Proceed:</Text>
                        <Text style={styles.summaryValue}>{stats.proceed}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.summaryBox}>
                        <Text style={styles.summaryLabel}>Cancelled:</Text>
                        <Text style={styles.summaryValue}>{stats.cancelled}</Text>
                    </View>
                </View>

                {/* Scan QR Button */}
                <TouchableOpacity style={styles.scanButton}>
                    <Text style={styles.scanButtonText}>Scan QR</Text>
                </TouchableOpacity>

                {/* Classes List */}
                <View style={styles.classesContainer}>
                    {classes.length > 0 ? (
                        classes.map((classData) => (
                            <ClassCard key={classData.ClassID} classData={classData} />
                        ))
                    ) : (
                        renderEmptyState()
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
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
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    statsCard: {
        flex: 1,
        borderRadius: 13,
        paddingVertical: 20,
        paddingHorizontal: 12,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    statsValue: {
        fontSize: 48,
        fontWeight: '600',
        color: '#2F2F2F',
        marginBottom: 4,
    },
    statsLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#2F2F2F',
        textAlign: 'center',
    },
    summaryContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 6,
        marginBottom: 16,
        paddingVertical: 12,
        paddingHorizontal: 16,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
    },
    summaryBox: {
        flex: 1,
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#2F2F2F',
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2F2F2F',
    },
    divider: {
        width: 1,
        backgroundColor: '#E5E7EB',
        marginHorizontal: 12,
    },
    scanButton: {
        backgroundColor: '#543177',
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 24,
        alignSelf: 'center',
        marginBottom: 20,
    },
    scanButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    classesContainer: {
        marginBottom: 24,
    },
    classCardWrapper: {
        marginBottom: 12,
        backgroundColor: '#fff',
        borderRadius: 8,
        overflow: 'hidden',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    classCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    classIcon: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#5F3787',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    classIconText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    className: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 2,
    },
    sectionName: {
        fontSize: 12,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    chevron: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 8,
    },
    expandedContent: {
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    requestItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    studentImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
        backgroundColor: '#E5E7EB',
    },
    requestInfo: {
        flex: 1,
    },
    studentName: {
        fontSize: 13,
        fontWeight: '600',
        color: '#2F2F2F',
        marginBottom: 4,
    },
    pickedBy: {
        fontSize: 12,
        color: '#2F2F2F',
        fontWeight: '600',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    noRequestsText: {
        textAlign: 'center',
        color: '#9CA3AF',
        fontSize: 13,
        paddingVertical: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyMessage: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },
});

export default PickupVerificationScreen;
