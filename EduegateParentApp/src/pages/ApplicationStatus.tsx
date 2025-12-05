import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { studentService } from '../services/student/studentService';
import { theme } from '../constants/theme';

interface Application {
    ApplicationIID: number;
    ApplicationNumber: string;
    ApplicationStatusID: number;
    ApplicationStatusDescription: string;
    FirstName: string;
    MiddleName?: string;
    LastName: string;
    MobileNumber: string;
    CreatedDate: string;
}

const STATUS_COLORS: { [key: string]: string } = {
    'Submitted': '#4caf50',
    'Pending': '#ff9800',
    'Approved': '#2196f3',
    'Rejected': '#f44336',
    'In Progress': '#ffc107',
};

export const ApplicationStatus = () => {
    const navigation = useNavigation();
    const [applications, setApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadApplications();
    }, []);

    const loadApplications = async () => {
        try {
            setIsLoading(true);
            const data = await studentService.getStudentApplications();
            setApplications(data);
        } catch (error) {
            console.error('Failed to load applications', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const getStatusColor = (status: string) => {
        return STATUS_COLORS[status] || '#4caf50';
    };

    const handlePortalLogin = () => {
        // You can replace this with the actual parent portal URL from config
        const parentPortalUrl = 'https://your-parent-portal-url.com';
        Linking.openURL(parentPortalUrl).catch(err => console.error('Error opening URL:', err));
    };

    const ApplicationCard = ({ application }: { application: Application }) => (
        <View style={styles.applicationCard}>
            <View style={styles.cardBody}>
                {/* Badges */}
                <View style={styles.badgeContainer}>
                    <View style={[styles.badge, styles.applicationNumberBadge]}>
                        <Text style={styles.badgeText}>{application.ApplicationNumber}</Text>
                    </View>
                    <View style={[
                        styles.badge,
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(application.ApplicationStatusDescription) }
                    ]}>
                        <Text style={styles.badgeText}>{application.ApplicationStatusDescription}</Text>
                    </View>
                </View>

                {/* Information Grid */}
                <View style={styles.infoGrid}>
                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Name</Text>
                            <Text style={styles.infoValue}>
                                {application.FirstName} {application.MiddleName} {application.LastName}
                            </Text>
                        </View>

                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Contact no</Text>
                            <Text style={styles.infoValue}>{application.MobileNumber}</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Date</Text>
                            <Text style={styles.infoValue}>{formatDate(application.CreatedDate)}</Text>
                        </View>
                    </View>
                </View>
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
                <Text style={styles.headerTitle}>Student Application Status</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Info Alert */}
                <View style={styles.infoAlert}>
                    <Text style={styles.infoIcon}>ℹ️</Text>
                    <View style={styles.infoTextContainer}>
                        <Text style={styles.infoText}>
                            Please login to parent portal to initiate application.{' '}
                            <Text style={styles.linkText} onPress={handlePortalLogin}>
                                Please click here
                            </Text>
                            {' '}to login to parent portal.
                        </Text>
                    </View>
                </View>

                {/* Applications List */}
                {applications.length > 0 ? (
                    applications.map((application, index) => (
                        <ApplicationCard key={index} application={application} />
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>⚠️</Text>
                        <View style={styles.emptyTextContainer}>
                            <Text style={styles.emptyTitle}>Not found!</Text>
                            <Text style={styles.emptyMessage}>No application found.</Text>
                        </View>
                    </View>
                )}
            </ScrollView>
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
    infoAlert: {
        backgroundColor: '#d1ecf1',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#bee5eb',
    },
    infoIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoText: {
        fontSize: 14,
        color: '#0c5460',
        lineHeight: 20,
    },
    linkText: {
        color: '#0056b3',
        textDecorationLine: 'underline',
        fontWeight: '600',
    },
    applicationCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        overflow: 'hidden',
    },
    cardBody: {
        padding: 20,
    },
    badgeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    badge: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
    },
    applicationNumberBadge: {
        backgroundColor: '#4caf50',
    },
    statusBadge: {
        // Dynamic background color
    },
    badgeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#fff',
    },
    infoGrid: {
        gap: 12,
    },
    infoRow: {
        flexDirection: 'row',
        gap: 16,
    },
    infoItem: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
        fontWeight: '600',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    emptyState: {
        backgroundColor: '#ffebee',
        borderRadius: 12,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f44336',
    },
    emptyIcon: {
        fontSize: 48,
        marginRight: 16,
    },
    emptyTextContainer: {
        flex: 1,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#d32f2f',
        marginBottom: 4,
    },
    emptyMessage: {
        fontSize: 14,
        color: '#d32f2f',
    },
});

export default ApplicationStatus;
