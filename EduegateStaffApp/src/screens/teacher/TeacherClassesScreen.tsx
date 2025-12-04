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
    FlatList,
    Dimensions,
    Animated,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { apiClient } from '../../services/api/client';
import { API_CONFIG } from '../../constants/config';
import { theme } from '../../constants/theme';

interface Student {
    StudentIID: number;
    StudentFullName: string;
    AdmissionNumber: string;
    StudentProfileImageUrl: string;
}

interface TeacherClass {
    ClassID: number;
    SectionID: number;
    ClassName: string;
    SectionName: string;
    StudentDetails?: Student[];
}

const { width } = Dimensions.get('window');

const COLORS = ['#60A5FA', '#A78BFA', '#F87171', '#34D399', '#FBBF24', '#06B6D4'];

export const TeacherClassesScreen: React.FC = () => {
    const navigation = useNavigation();
    const [classes, setClasses] = useState<TeacherClass[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [expandedClass, setExpandedClass] = useState<number | null>(null);
    const [loadingStudents, setLoadingStudents] = useState<number | null>(null);
    const [colorMap, setColorMap] = useState<{ [key: number]: string }>({});

    useFocusEffect(
        useCallback(() => {
            loadClasses();
        }, [])
    );

    const getColorForClass = (classId: number) => {
        return colorMap[classId] || COLORS[0];
    };

    const initializeColorMap = (classesToColor: TeacherClass[]) => {
        const newColorMap: { [key: number]: string } = {};
        classesToColor.forEach((classData, index) => {
            newColorMap[classData.ClassID] = COLORS[index % COLORS.length];
        });
        setColorMap(newColorMap);
    };

    const loadClasses = async (isRefresh: boolean = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const response = await apiClient.get<TeacherClass[]>(
                `${API_CONFIG.SchoolServiceUrl}/GetTeacherClass`
            );

            const classesData = response.data || [];
            setClasses(classesData);
            initializeColorMap(classesData);
        } catch (error) {
            console.error('Error loading classes:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        loadClasses(true);
    };

    const loadStudents = async (classData: TeacherClass) => {
        try {
            setLoadingStudents(classData.ClassID);

            const response = await apiClient.get<Student[]>(
                `${API_CONFIG.SchoolServiceUrl}/GetStudentsByTeacherClassAndSection`,
                {
                    params: {
                        classID: classData.ClassID,
                        sectionID: classData.SectionID,
                    },
                }
            );

            setClasses(prev =>
                prev.map(cls =>
                    cls.ClassID === classData.ClassID
                        ? { ...cls, StudentDetails: response.data || [] }
                        : cls
                )
            );
        } catch (error) {
            console.error('Error loading students:', error);
        } finally {
            setLoadingStudents(null);
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.backButton}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Class details</Text>
            <View style={{ width: 24 }} />
        </View>
    );

    const toggleClass = (classData: TeacherClass) => {
        if (expandedClass === classData.ClassID) {
            setExpandedClass(null);
        } else {
            setExpandedClass(classData.ClassID);
            if (!classData.StudentDetails || classData.StudentDetails.length === 0) {
                loadStudents(classData);
            }
        }
    };

    const extractClassNumber = (className: string) => {
        const match = className.match(/\d+/);
        return match ? match[0] : className;
    };

    const ClassCard = ({ classData }: { classData: TeacherClass }) => {
        const isExpanded = expandedClass === classData.ClassID;
        const bgColor = getColorForClass(classData.ClassID);
        const classNumber = extractClassNumber(classData.ClassName);

        return (
            <View style={styles.classCardWrapper}>
                <TouchableOpacity
                    style={styles.classCard}
                    onPress={() => toggleClass(classData)}
                >
                    <View style={styles.classCardHeader}>
                        {/* Class Icon */}
                        <View
                            style={[
                                styles.classIcon,
                                { backgroundColor: bgColor },
                            ]}
                        >
                            <Text style={styles.classIconText}>
                                {classNumber}
                            </Text>
                        </View>

                        {/* Class Info */}
                        <View style={styles.classInfo}>
                            <Text style={styles.className}>
                                {classData.ClassName}
                            </Text>
                            <Text style={styles.sectionName}>
                                Section - {classData.SectionName}
                            </Text>
                        </View>

                        {/* Chevron */}
                        <View style={styles.chevron}>
                            <Text
                                style={[
                                    styles.chevronText,
                                    { transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] },
                                ]}
                            >
                                ▼
                            </Text>
                        </View>
                    </View>

                    {/* Expanded Content */}
                    {isExpanded && (
                        <View style={styles.expandedContent}>
                            {loadingStudents === classData.ClassID ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator
                                        size="small"
                                        color={theme.colors.primary}
                                    />
                                </View>
                            ) : classData.StudentDetails && classData.StudentDetails.length > 0 ? (
                                <View>
                                    {classData.StudentDetails.map((student, index) => (
                                        <View key={student.StudentIID}>
                                            <TouchableOpacity
                                                style={styles.studentItem}
                                                onPress={() => {
                                                    navigation.navigate('ClassStudents', {
                                                        studentId: student.StudentIID,
                                                    });
                                                }}
                                            >
                                                <Image
                                                    source={{
                                                        uri: student.StudentProfileImageUrl ||
                                                            'https://via.placeholder.com/60',
                                                    }}
                                                    style={styles.studentImage}
                                                    defaultSource={require('../../assets/images/profile_img.png')}
                                                />
                                                <View style={styles.studentInfo}>
                                                    <Text style={styles.studentName}>
                                                        {student.StudentFullName}
                                                    </Text>
                                                    <Text style={styles.studentAdmission}>
                                                        {student.AdmissionNumber}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                            {index < classData.StudentDetails!.length - 1 && (
                                                <View style={styles.studentDivider} />
                                            )}
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <Text style={styles.noStudentsText}>
                                    No students found
                                </Text>
                            )}
                        </View>
                    )}
                </TouchableOpacity>
            </View>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Classes Found</Text>
            <Text style={styles.emptyMessage}>
                You don't have any classes assigned yet
            </Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.container}>
                {renderHeader()}
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {renderHeader()}

            <FlatList
                data={classes}
                renderItem={({ item }) => <ClassCard classData={item} />}
                keyExtractor={item => `${item.ClassID}-${item.SectionID}`}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[theme.colors.primary]}
                    />
                }
                contentContainerStyle={
                    classes.length === 0
                        ? { flex: 1 }
                        : { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 20 }
                }
                ListEmptyComponent={renderEmptyState}
                scrollEnabled={true}
            />
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
    classCardWrapper: {
        marginBottom: 12,
    },
    classCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    classCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    classIcon: {
        width: 50,
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    classIconText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    classInfo: {
        flex: 1,
    },
    className: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 2,
    },
    sectionName: {
        fontSize: 13,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    chevron: {
        padding: 8,
    },
    chevronText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '600',
    },
    expandedContent: {
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    studentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    studentImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
        backgroundColor: '#E5E7EB',
    },
    studentInfo: {
        flex: 1,
    },
    studentName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 2,
    },
    studentAdmission: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    studentDivider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 8,
    },
    loadingContainer: {
        paddingVertical: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noStudentsText: {
        textAlign: 'center',
        color: '#9CA3AF',
        fontSize: 14,
        paddingVertical: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
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

export default TeacherClassesScreen;
