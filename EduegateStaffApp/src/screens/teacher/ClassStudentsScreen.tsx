import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    ActivityIndicator,
    SafeAreaView,
    Dimensions,
} from 'react-native';
import { useNavigation, useFocusEffect, useRoute, RouteProp } from '@react-navigation/native';
import { apiClient } from '../../services/api/client';
import { API_CONFIG } from '../../constants/config';
import { theme } from '../../constants/theme';

interface StudentDetail {
    StudentIID: number;
    FirstName: string;
    MiddleName: string;
    LastName: string;
    AdmissionNumber: string;
    StudentProfileImageUrl: string;
    GenderName: string;
    DateOfBirth: string;
    StudentAge: number;
    BloodGroupName: string;
    EmailID: string;
    MobileNumber: string;
    ClassName: string;
    SectionName: string;
    AdmissionDate: string;
    Guardian?: {
        FatherFirstName: string;
        FatherMiddleName: string;
        FatherLastName: string;
        GuardianPhone: string;
        GaurdianEmail: string;
        MotherFirstName: string;
        MotherMiddleName: string;
        MotherLastName: string;
        MotherPhone: string;
        MotherEmailID: string;
    };
    StudentSiblings?: Array<{ Value: string }>;
}

type ClassStudentsScreenRouteProp = RouteProp<
    { ClassStudents: { studentID: number } },
    'ClassStudents'
>;

const { width } = Dimensions.get('window');

export const ClassStudentsScreen: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<ClassStudentsScreenRouteProp>();
    const [student, setStudent] = useState<StudentDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            const studentID = route.params?.studentID;
            if (studentID) {
                loadStudentDetails(studentID);
            }
        }, [route.params?.studentID])
    );

    const loadStudentDetails = async (studentID: number) => {
        try {
            setLoading(true);

            const response = await apiClient.get<StudentDetail>(
                `${API_CONFIG.SchoolServiceUrl}/GetStudentDetailsByStudentID`,
                {
                    params: {
                        studentID,
                    },
                }
            );

            setStudent(response.data || null);
        } catch (error) {
            console.error('Error loading student details:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            });
        } catch {
            return dateString;
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.backButton}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Class students</Text>
            <View style={{ width: 24 }} />
        </View>
    );

    const InfoRow = ({ label, value }: { label: string; value: string }) => (
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoColon}>:</Text>
            <Text style={styles.infoValue} numberOfLines={2}>
                {value}
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

    if (!student) {
        return (
            <SafeAreaView style={styles.container}>
                {renderHeader()}
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyTitle}>Student Not Found</Text>
                    <Text style={styles.emptyMessage}>
                        Unable to load student details
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    const fullName = `${student.FirstName} ${student.MiddleName} ${student.LastName}`.trim();
    const fatherName = student.Guardian
        ? `${student.Guardian.FatherFirstName} ${student.Guardian.FatherMiddleName} ${student.Guardian.FatherLastName}`.trim()
        : 'N/A';
    const motherName = student.Guardian
        ? `${student.Guardian.MotherFirstName} ${student.Guardian.MotherMiddleName} ${student.Guardian.MotherLastName}`.trim()
        : 'N/A';

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Student Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.profileHeader}>
                        <Image
                            source={{
                                uri: student.StudentProfileImageUrl ||
                                    'https://via.placeholder.com/80',
                            }}
                            style={styles.profileImage}
                        />
                        <View style={styles.profileInfo}>
                            <Text style={styles.studentName}>{fullName}</Text>
                            <Text style={styles.admissionNumber}>
                                {student.AdmissionNumber}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.cardDivider} />

                    <View style={styles.cardBody}>
                        <InfoRow label="Gender" value={student.GenderName || 'N/A'} />
                        <InfoRow
                            label="Date of birth"
                            value={student.DateOfBirth ? formatDate(student.DateOfBirth) : 'N/A'}
                        />
                        <InfoRow
                            label="Age"
                            value={student.StudentAge?.toString() || 'N/A'}
                        />
                        <InfoRow
                            label="Blood group"
                            value={student.BloodGroupName || 'N/A'}
                        />
                        <InfoRow label="Email" value={student.EmailID || 'N/A'} />
                        <InfoRow
                            label="Mobile number"
                            value={student.MobileNumber || 'N/A'}
                        />
                        <InfoRow label="Class" value={student.ClassName || 'N/A'} />
                        <InfoRow label="Section" value={student.SectionName || 'N/A'} />
                        <InfoRow
                            label="Admission date"
                            value={
                                student.AdmissionDate ? formatDate(student.AdmissionDate) : 'N/A'
                            }
                        />
                    </View>
                </View>

                {/* Father's Information Card */}
                {student.Guardian && (
                    <View style={styles.guardianCard}>
                        <View style={styles.guardianHeader}>
                            <Text style={styles.guardianTitle}>Father's Information</Text>
                        </View>

                        <View style={styles.cardBody}>
                            <InfoRow label="Father name" value={fatherName} />
                            <InfoRow
                                label="Father mobile no"
                                value={student.Guardian.GuardianPhone || 'N/A'}
                            />
                            <InfoRow
                                label="Father email"
                                value={student.Guardian.GaurdianEmail || 'N/A'}
                            />
                        </View>
                    </View>
                )}

                {/* Mother's Information Card */}
                {student.Guardian && (
                    <View style={styles.guardianCard}>
                        <View style={styles.guardianHeader}>
                            <Text style={styles.guardianTitle}>Mother's Information</Text>
                        </View>

                        <View style={styles.cardBody}>
                            <InfoRow label="Mother name" value={motherName} />
                            <InfoRow
                                label="Mother mobile no"
                                value={student.Guardian.MotherPhone || 'N/A'}
                            />
                            <InfoRow
                                label="Mother email"
                                value={student.Guardian.MotherEmailID || 'N/A'}
                            />
                        </View>
                    </View>
                )}

                {/* Siblings Card */}
                {student.StudentSiblings && student.StudentSiblings.length > 0 && (
                    <View style={styles.siblingsCard}>
                        <View style={styles.siblingsHeader}>
                            <Text style={styles.siblingsTitle}>Siblings</Text>
                        </View>

                        <View style={styles.cardBody}>
                            {student.StudentSiblings.map((sibling, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.siblingItem,
                                        index !== student.StudentSiblings!.length - 1 &&
                                        styles.siblingItemBorder,
                                    ]}
                                >
                                    <Text style={styles.siblingLabel}>Sibling {index + 1}</Text>
                                    <Text style={styles.siblingColon}>:</Text>
                                    <Text style={styles.siblingValue}>{sibling.Value}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },
    profileCard: {
        backgroundColor: '#fff',
        borderRadius: 13,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        marginBottom: 16,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#E5E7EB',
        marginRight: 12,
    },
    profileInfo: {
        flex: 1,
    },
    studentName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2F2F2F',
        marginBottom: 4,
    },
    admissionNumber: {
        fontSize: 16,
        fontWeight: '600',
        color: '#5F3787',
    },
    cardDivider: {
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    cardBody: {
        padding: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    infoLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#757575',
        width: 110,
    },
    infoColon: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2F2F2F',
        marginHorizontal: 4,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#2F2F2F',
        flex: 1,
    },
    guardianCard: {
        backgroundColor: '#fff',
        borderRadius: 13,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        marginBottom: 16,
    },
    guardianHeader: {
        backgroundColor: '#5F3787',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    guardianTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    siblingsCard: {
        backgroundColor: '#fff',
        borderRadius: 13,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        marginBottom: 16,
    },
    siblingsHeader: {
        backgroundColor: '#5F3787',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    siblingsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    siblingItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 12,
    },
    siblingItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    siblingLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#757575',
        width: 110,
    },
    siblingColon: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2F2F2F',
        marginHorizontal: 4,
    },
    siblingValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#2F2F2F',
        flex: 1,
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

export default ClassStudentsScreen;
