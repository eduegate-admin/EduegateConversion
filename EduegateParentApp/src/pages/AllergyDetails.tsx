import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { studentService, Student } from '../services/student/studentService';
import { theme } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BottomMenu } from '../components/BottomMenu';

interface StudentAllergy {
    StudentID: number;
    Allergies: Array<{
        AllergyName: string;
        AllergySeverityName: string;
    }>;
}

export const AllergyDetails = () => {
    const navigation = useNavigation();
    const [students, setStudents] = useState<Student[]>([]);
    const [studentAllergies, setStudentAllergies] = useState<StudentAllergy[]>([]);
    const [userName, setUserName] = useState('');
    const [userLoginID, setUserLoginID] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [expandedStudent, setExpandedStudent] = useState<number | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);

            // Get user details
            const callContext = await AsyncStorage.getItem('callContext');
            if (callContext) {
                const context = JSON.parse(callContext);
                setUserName(context.UserName || '');
                setUserLoginID(context.LoginID || '');
            }

            // Get students and their allergies
            const [studentsData, allergiesData] = await Promise.all([
                studentService.getMyStudents(),
                studentService.getStudentAllergies(),
            ]);

            setStudents(studentsData);
            setStudentAllergies(allergiesData);

            // Expand first student by default
            if (studentsData.length > 0) {
                setExpandedStudent(studentsData[0].StudentIID);
            }
        } catch (error) {
            console.error('Failed to load allergy data', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStudentAllergies = (studentID: number) => {
        const studentAllergy = studentAllergies.find(sa => sa.StudentID === studentID);
        return studentAllergy?.Allergies || [];
    };

    const toggleStudent = (studentID: number) => {
        setExpandedStudent(expandedStudent === studentID ? null : studentID);
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Allergy Details</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* User Info */}
                <View style={styles.userInfoCard}>
                    <Text style={styles.userName}>{userName}</Text>
                    <Text style={styles.userLoginID}>{userLoginID}</Text>
                    <Text style={styles.userRole}>Parent</Text>
                </View>

                {/* Students List */}
                {students.map((student) => {
                    const allergies = getStudentAllergies(student.StudentIID);
                    const isExpanded = expandedStudent === student.StudentIID;

                    return (
                        <View key={student.StudentIID} style={styles.studentCard}>
                            <TouchableOpacity
                                style={styles.studentHeader}
                                onPress={() => toggleStudent(student.StudentIID)}
                            >
                                <View style={styles.studentInfo}>
                                    <Text style={styles.studentName}>
                                        {student.FirstName} {student.MiddleName} {student.LastName}
                                    </Text>
                                    <View style={styles.studentBadges}>
                                        <View style={styles.badge}>
                                            <Text style={styles.badgeText}>{student.AdmissionNumber}</Text>
                                        </View>
                                        <View style={styles.badge}>
                                            <Text style={styles.badgeText}>{student.ClassName}</Text>
                                        </View>
                                    </View>
                                </View>
                                <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
                            </TouchableOpacity>

                            {isExpanded && (
                                <View style={styles.studentContent}>
                                    <Text style={styles.sectionTitle}>Selected Student Allergies</Text>

                                    {allergies.length > 0 ? (
                                        <View style={styles.allergiesList}>
                                            {allergies.map((allergy, index) => (
                                                <View key={index} style={styles.allergyBadge}>
                                                    <Text style={styles.allergyText}>
                                                        {allergy.AllergyName} - {allergy.AllergySeverityName}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>
                                    ) : (
                                        <View style={styles.noAllergies}>
                                            <Text style={styles.noAllergiesText}>
                                                No allergies recorded for this student
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>
                    );
                })}

                {students.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>ℹ️</Text>
                        <Text style={styles.emptyText}>No students found</Text>
                    </View>
                )}
            </ScrollView>
            <BottomMenu />
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
        backgroundColor: '#fff',
        paddingTop: 40,
        paddingBottom: 15,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        marginRight: 15,
        padding: 5,
    },
    backArrow: {
        fontSize: 24,
        color: '#333',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    content: {
        padding: 16,
    },
    userInfoCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    userLoginID: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    userRole: {
        fontSize: 14,
        color: '#666',
    },
    studentCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        overflow: 'hidden',
    },
    studentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    studentInfo: {
        flex: 1,
    },
    studentName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    studentBadges: {
        flexDirection: 'row',
        gap: 8,
    },
    badge: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
    },
    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    expandIcon: {
        fontSize: 16,
        color: '#666',
        marginLeft: 12,
    },
    studentContent: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    allergiesList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    allergyBadge: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 16,
    },
    allergyText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
    noAllergies: {
        backgroundColor: '#f0f0f0',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    noAllergiesText: {
        color: '#666',
        fontSize: 14,
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
    },
});

export default AllergyDetails;
