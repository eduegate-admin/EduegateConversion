import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { attendanceService } from '../../services/school/attendanceService';
import { TeacherClass } from '../../types/models/attendance';
import { theme } from '../../constants/theme';

export const AttendanceClassesScreen: React.FC = () => {
    const [classes, setClasses] = useState<TeacherClass[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const navigation = useNavigation();

    // Map to store consistent colors for each class
    const [classColorMap] = useState<Map<number, string>>(new Map());

    useEffect(() => {
        loadTeacherClasses();
    }, []);

    const loadTeacherClasses = async () => {
        try {
            setError('');
            const data = await attendanceService.getTeacherClasses();
            setClasses(data);
        } catch (err: any) {
            console.error('Error loading classes:', err);
            setError(err.response?.data?.message || 'Failed to load classes');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadTeacherClasses();
    };

    const extractClassNumber = (className: string): string => {
        const match = className.match(/\d+/);
        return match ? match[0] : className.substring(0, 2);
    };

    const getRandomBgColor = (classId: number): string => {
        if (!classColorMap.has(classId)) {
            const colors = [
                theme.colors.primary,
                theme.colors.success,
                theme.colors.info,
                theme.colors.warning,
                theme.colors.danger,
                theme.colors.secondary,
            ];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            classColorMap.set(classId, randomColor);
        }
        return classColorMap.get(classId)!;
    };

    const handleClassPress = (classItem: TeacherClass) => {
        navigation.navigate('AttendanceStudents', {
            classId: classItem.ClassID,
            sectionId: classItem.SectionID,
        });
    };

    const renderClassCard = ({ item }: { item: TeacherClass }) => {
        const backgroundColor = getRandomBgColor(item.ClassID);
        const classNumber = extractClassNumber(item.ClassName);

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => handleClassPress(item)}
                activeOpacity={0.7}
            >
                <View style={styles.cardContent}>
                    {/* Class Icon */}
                    <View style={[styles.iconContainer, { backgroundColor }]}>
                        <Text style={styles.iconText}>
                            {classNumber}
                            {item.SectionName}
                        </Text>
                    </View>

                    {/* Class Info */}
                    <View style={styles.infoContainer}>
                        <Text style={styles.className}>{item.ClassName}</Text>
                        <View style={styles.sectionRow}>
                            <Text style={styles.sectionLabel}>Section:</Text>
                            <Text style={styles.sectionValue}>{item.SectionName}</Text>
                        </View>
                        {item.SubjectName && (
                            <View style={styles.subjectRow}>
                                <Text style={styles.subjectLabel}>Subject:</Text>
                                <Text style={styles.subjectValue}>{item.SubjectName}</Text>
                            </View>
                        )}
                    </View>

                    {/* Arrow Icon */}
                    <View style={styles.arrowContainer}>
                        <Text style={styles.arrowIcon}>›</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyContent}>
                <Text style={styles.emptyIcon}>📚</Text>
                <Text style={styles.emptyTitle}>No Classes Found!</Text>
                <Text style={styles.emptyMessage}>
                    There are no classes assigned to you yet.
                </Text>
            </View>
        </View>
    );

    const renderError = () => (
        <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>Error Loading Classes</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadTeacherClasses}>
                <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Loading classes...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backIcon}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Attendance Classes</Text>
                <View style={styles.headerSpacer} />
            </View>

            {/* Content */}
            {error ? (
                renderError()
            ) : (
                <FlatList
                    data={classes}
                    renderItem={renderClassCard}
                    keyExtractor={(item) => `${item.ClassID}-${item.SectionID}`}
                    contentContainerStyle={styles.listContent}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    ListEmptyComponent={renderEmptyState}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            colors={[theme.colors.primary]}
                        />
                    }
                />
            )}
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
        paddingVertical: 16,
        paddingHorizontal: 16,
        paddingTop: 50,
        flexDirection: 'row',
        alignItems: 'center',
        ...theme.shadows.md,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backIcon: {
        fontSize: 32,
        color: '#fff',
        fontWeight: 'bold',
    },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    headerSpacer: {
        width: 40,
    },
    listContent: {
        padding: 16,
        flexGrow: 1,
    },
    row: {
        justifyContent: 'space-between',
    },
    card: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        marginHorizontal: 4,
        ...theme.shadows.sm,
    },
    cardContent: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    iconText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    infoContainer: {
        flex: 1,
    },
    className: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.dark,
        marginBottom: 4,
    },
    sectionRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionLabel: {
        fontSize: 14,
        color: theme.colors.gray[600],
        marginRight: 4,
    },
    sectionValue: {
        fontSize: 14,
        color: theme.colors.dark,
        fontWeight: '500',
    },
    subjectRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    subjectLabel: {
        fontSize: 12,
        color: theme.colors.gray[500],
        marginRight: 4,
    },
    subjectValue: {
        fontSize: 12,
        color: theme.colors.gray[700],
    },
    arrowContainer: {
        marginLeft: 8,
    },
    arrowIcon: {
        fontSize: 24,
        color: theme.colors.gray[400],
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: theme.colors.gray[600],
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyContent: {
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.dark,
        marginBottom: 8,
    },
    emptyMessage: {
        fontSize: 14,
        color: theme.colors.gray[600],
        textAlign: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    errorIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.danger,
        marginBottom: 8,
    },
    errorMessage: {
        fontSize: 14,
        color: theme.colors.gray[600],
        textAlign: 'center',
        marginBottom: 24,
    },
    retryButton: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default AttendanceClassesScreen;
