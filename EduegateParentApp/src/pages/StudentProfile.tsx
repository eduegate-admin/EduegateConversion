import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../constants/theme';
import { API_CONFIG } from '../constants/config';
import { BottomMenu } from '../components/BottomMenu';

interface StudentProfile {
    FirstName: string;
    MiddleName?: string;
    LastName: string;
    ClassName: string;
    SectionName: string;
    AdmissionNumber: string;
    DateOfBirth: string;
    GenderName: string;
    BloodGroupName?: string;
    AdmissionDate: string;
    EmailID?: string;
    MobileNumber?: string;
    StudentProfileImageUrl?: string;
    StudentProfile?: string;
    Guardian?: {
        FatherFirstName?: string;
        FatherMiddleName?: string;
        FatherLastName?: string;
        FatherEmailID?: string;
        FatherPhone?: string;
        MotherFirstName?: string;
        MotherMiddleName?: string;
        MotherLastName?: string;
        MotherEmailID?: string;
        MotherPhone?: string;
    };
    StudentSiblings?: Array<{ Value: string }>;
}

export const StudentProfile = () => {
    const navigation = useNavigation();
    const [studentData, setStudentData] = useState<StudentProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStudentData();
    }, []);

    const loadStudentData = async () => {
        try {
            const storedWard = await AsyncStorage.getItem('selectedWard');
            if (storedWard) {
                const ward = JSON.parse(storedWard);
                setStudentData(ward);
            }
        } catch (error) {
            console.error('Failed to load student data', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getProfileImageUrl = () => {
        if (studentData?.StudentProfileImageUrl) {
            return { uri: studentData.StudentProfileImageUrl };
        }
        if (studentData?.StudentProfile) {
            return { uri: `${API_CONFIG.ContentServiceUrl}/ReadImageContentsByID?contentID=${studentData.StudentProfile}` };
        }
        // Return a generic user icon URL or undefined
        return { uri: 'https://via.placeholder.com/150/cccccc/666666?text=No+Image' };
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const InfoRow = ({ icon, label, value }: { icon: string; label: string; value?: string }) => (
        <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
                <Text style={styles.iconText}>{icon}</Text>
            </View>
            <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value || 'N/A'}</Text>
            </View>
        </View>
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
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Student Profile</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.profileImageContainer}>
                        <Image
                            source={getProfileImageUrl()}
                            style={styles.profileImage}
                        />
                    </View>
                    <Text style={styles.studentName}>
                        {studentData?.FirstName} {studentData?.MiddleName} {studentData?.LastName}
                    </Text>
                    <Text style={styles.studentClass}>
                        {studentData?.ClassName} {studentData?.SectionName}
                    </Text>
                </View>

                {/* Student Details Card */}
                <View style={styles.detailsCard}>
                    <InfoRow icon="🎫" label="Admission no" value={studentData?.AdmissionNumber} />
                    <InfoRow icon="📅" label="Date of birth" value={formatDate(studentData?.DateOfBirth)} />
                    <InfoRow icon="👤" label="Gender" value={studentData?.GenderName} />
                    <InfoRow icon="🩸" label="Blood Group" value={studentData?.BloodGroupName} />
                    <InfoRow icon="📆" label="Admission Date" value={formatDate(studentData?.AdmissionDate)} />
                    <InfoRow icon="✉️" label="Email" value={studentData?.EmailID} />
                    <InfoRow icon="📱" label="Mobile number" value={studentData?.MobileNumber} />
                </View>

                {/* Father Details Card */}
                <View style={styles.detailsCard}>
                    <Text style={styles.sectionTitle}>Father Details</Text>
                    <InfoRow
                        icon="👨"
                        label="Father name"
                        value={`${studentData?.Guardian?.FatherFirstName || ''} ${studentData?.Guardian?.FatherMiddleName || ''} ${studentData?.Guardian?.FatherLastName || ''}`.trim() || 'N/A'}
                    />
                    <InfoRow icon="📱" label="Father mobile no" value={studentData?.Guardian?.FatherPhone || studentData?.MobileNumber} />
                    <InfoRow icon="✉️" label="Father email" value={studentData?.Guardian?.FatherEmailID} />
                </View>

                {/* Mother Details Card */}
                <View style={styles.detailsCard}>
                    <Text style={styles.sectionTitle}>Mother Details</Text>
                    <InfoRow
                        icon="👩"
                        label="Mother name"
                        value={`${studentData?.Guardian?.MotherFirstName || ''} ${studentData?.Guardian?.MotherMiddleName || ''} ${studentData?.Guardian?.MotherLastName || ''}`.trim() || 'N/A'}
                    />
                    <InfoRow icon="📱" label="Mother mobile no" value={studentData?.Guardian?.MotherPhone} />
                    <InfoRow icon="✉️" label="Mother email" value={studentData?.Guardian?.MotherEmailID} />
                </View>

                {/* Sibling Details Card */}
                {studentData?.StudentSiblings && studentData.StudentSiblings.length > 0 && (
                    <View style={styles.detailsCard}>
                        <Text style={styles.sectionTitle}>Sibling Details</Text>
                        <View style={styles.infoRow}>
                            <View style={styles.iconContainer}>
                                <Text style={styles.iconText}>👨‍👩‍👧‍👦</Text>
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Siblings</Text>
                                {studentData.StudentSiblings.map((sibling, index) => (
                                    <Text key={index} style={styles.infoValue}>
                                        {sibling.Value}
                                    </Text>
                                ))}
                            </View>
                        </View>
                    </View>
                )}
                <View style={{ height: 100 }} />
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
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    content: {
        padding: 16,
        paddingTop: 80,
    },
    profileCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        marginTop: -60,
    },
    profileImageContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: '#e0e0e0',
        overflow: 'hidden',
        marginTop: -80,
        marginBottom: 16,
        backgroundColor: '#fff',
    },
    profileImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    studentName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    studentClass: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    detailsCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    iconText: {
        fontSize: 20,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 13,
        color: '#666',
        marginBottom: 4,
        fontWeight: '600',
    },
    infoValue: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
    },
});

export default StudentProfile;
