import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { studentService, Student } from '../services/student/studentService';
import { theme } from '../constants/theme';
import { BottomMenu } from '../components/BottomMenu';

interface LeaveApplication {
    StudentLeaveApplicationIID: number;
    FromDate: string;
    ToDate: string;
    Reason: string;
    LeaveStatusID: number;
    LeaveStatusDescription: string;
}

const STATUS_COLORS: { [key: string]: { bg: string; text: string; border: string } } = {
    Submitted: { bg: '#e3f2fd', text: '#1976d2', border: '#1976d2' },
    Approved: { bg: '#e8f5e9', text: '#388e3c', border: '#4caf50' },
    Rejected: { bg: '#ffebee', text: '#d32f2f', border: '#f44336' },
};

export const StudentLeave = () => {
    const navigation = useNavigation();
    const [selectedWard, setSelectedWard] = useState<Student | null>(null);
    const [leaveApplications, setLeaveApplications] = useState<LeaveApplication[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            setIsLoading(true);
            const storedWard = await AsyncStorage.getItem('selectedWard');
            if (storedWard) {
                const ward = JSON.parse(storedWard);
                setSelectedWard(ward);
                await fetchLeaveApplications(ward.StudentIID);
            } else {
                Alert.alert('Error', 'No student selected');
                navigation.goBack();
            }
        } catch (error) {
            console.error('Failed to load initial data', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchLeaveApplications = async (studentId: number) => {
        try {
            const data = await studentService.getLeaveApplications(studentId);
            setLeaveApplications(data);
        } catch (error) {
            console.error('Failed to fetch leave applications', error);
        }
    };

    const handleDelete = (leave: LeaveApplication) => {
        Alert.alert(
            'Delete Leave Application',
            'Are you sure you want to delete this leave application?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setIsLoading(true);
                            await studentService.deleteLeaveApplication(leave.StudentLeaveApplicationIID);
                            if (selectedWard) {
                                await fetchLeaveApplications(selectedWard.StudentIID);
                            }
                            Alert.alert('Success', 'Leave application deleted successfully');
                        } catch (error) {
                            console.error('Failed to delete leave application', error);
                            Alert.alert('Error', 'Failed to delete leave application');
                        } finally {
                            setIsLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const handleEdit = (leave: LeaveApplication) => {
        // TODO: Navigate to edit leave screen when implemented
        Alert.alert('Edit Leave', 'Edit functionality will be implemented in the leave application form screen');
    };

    const handleApplyLeave = () => {
        // TODO: Navigate to apply leave screen when implemented
        Alert.alert('Apply Leave', 'Leave application form will be implemented in a future update');
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const getStatusStyle = (status: string) => {
        return STATUS_COLORS[status] || STATUS_COLORS.Submitted;
    };

    if (isLoading && !selectedWard) {
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
                <Text style={styles.headerTitle}>Student Leaves</Text>
            </View>

            {/* Apply Leave Button Header */}
            <View style={styles.applyLeaveHeader}>
                <Text style={styles.applyLeaveTitle}>Student Leave</Text>
                <TouchableOpacity style={styles.applyLeaveButton} onPress={handleApplyLeave}>
                    <Text style={styles.applyLeaveButtonText}>Apply Leave</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {isLoading ? (
                    <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginTop: 20 }} />
                ) : leaveApplications.length > 0 ? (
                    leaveApplications.map((leave, index) => {
                        const statusStyle = getStatusStyle(leave.LeaveStatusDescription);
                        const isSubmitted = leave.LeaveStatusID === 1;

                        return (
                            <View key={index} style={styles.leaveCard}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.cardTitle}>Leave Status</Text>
                                </View>

                                <View style={styles.cardBody}>
                                    <View style={styles.leaveContent}>
                                        <View style={[styles.statusIndicator, { backgroundColor: statusStyle.border }]} />
                                        <View style={styles.leaveDetails}>
                                            <Text style={styles.dateRange}>
                                                {formatDate(leave.FromDate)} - {formatDate(leave.ToDate)}
                                            </Text>
                                            <Text style={styles.reason}>{leave.Reason}</Text>
                                            <View style={styles.statusContainer}>
                                                <Text style={styles.statusLabel}>Status: </Text>
                                                <View style={[
                                                    styles.statusBadge,
                                                    {
                                                        backgroundColor: statusStyle.bg,
                                                        borderColor: statusStyle.border
                                                    }
                                                ]}>
                                                    <Text style={[styles.statusText, { color: statusStyle.text }]}>
                                                        {leave.LeaveStatusDescription}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </View>

                                {isSubmitted && (
                                    <View style={styles.cardFooter}>
                                        <TouchableOpacity
                                            style={styles.deleteButton}
                                            onPress={() => handleDelete(leave)}
                                        >
                                            <Text style={styles.deleteButtonText}>Delete</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.editButton}
                                            onPress={() => handleEdit(leave)}
                                        >
                                            <Text style={styles.editButtonText}>Edit</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        );
                    })
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateIcon}>📋</Text>
                        <Text style={styles.emptyStateTitle}>Leave application not found</Text>
                        <Text style={styles.emptyStateText}>No leave applications found for this student.</Text>
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
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    applyLeaveHeader: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    applyLeaveTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    applyLeaveButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    applyLeaveButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    content: {
        padding: 16,
    },
    leaveCard: {
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
    cardHeader: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    cardBody: {
        padding: 16,
    },
    leaveContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    statusIndicator: {
        width: 6,
        alignSelf: 'stretch',
        borderRadius: 3,
        marginRight: 16,
        minHeight: 70,
    },
    leaveDetails: {
        flex: 1,
    },
    dateRange: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    reason: {
        fontSize: 16,
        color: '#666',
        marginBottom: 12,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
    },
    statusBadge: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
        borderWidth: 1,
    },
    statusText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 16,
        paddingTop: 0,
        gap: 12,
    },
    deleteButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#ff9800',
        backgroundColor: 'transparent',
    },
    deleteButtonText: {
        color: '#ff9800',
        fontSize: 14,
        fontWeight: 'bold',
    },
    editButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
        backgroundColor: theme.colors.primary,
    },
    editButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    emptyState: {
        backgroundColor: '#fff3cd',
        borderRadius: 12,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ffc107',
        marginTop: 40,
    },
    emptyStateIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#856404',
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 14,
        color: '#856404',
        textAlign: 'center',
    },
});

export default StudentLeave;
