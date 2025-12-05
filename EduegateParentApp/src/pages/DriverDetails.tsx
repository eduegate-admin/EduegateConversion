import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { studentService } from '../services/student/studentService';
import { theme } from '../constants/theme';
import { API_CONFIG } from '../constants/config';

interface DriverDetails {
    EmployeeName: string;
    EmployeeCode: string;
    EmployeeProfileImageUrl?: string;
    GenderName?: string;
    RouteCode?: string;
    WorkMobileNo?: string;
    Vehicle?: string;
}

export const DriverDetails = () => {
    const navigation = useNavigation();
    const [driverDetails, setDriverDetails] = useState<DriverDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadDriverDetails();
    }, []);

    const loadDriverDetails = async () => {
        try {
            setIsLoading(true);
            const selectedWard = await AsyncStorage.getItem('selectedWard');
            if (selectedWard) {
                const ward = JSON.parse(selectedWard);
                const data = await studentService.getDriverDetails(ward.StudentIID);
                setDriverDetails(data);
            }
        } catch (error) {
            console.error('Failed to load driver details', error);
        } finally {
            setIsLoading(false);
        }
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
                <Text style={styles.headerTitle}>Driver Details</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {driverDetails && driverDetails.EmployeeName ? (
                    <View style={styles.detailsCard}>
                        {/* Profile Section */}
                        <View style={styles.profileSection}>
                            <View style={styles.profileImageContainer}>
                                {driverDetails.EmployeeProfileImageUrl ? (
                                    <Image
                                        source={{ uri: `${API_CONFIG.ContentServiceUrl}/ReadImageContentsByID?contentID=${driverDetails.EmployeeProfileImageUrl}` }}
                                        style={styles.profileImage}
                                    />
                                ) : (
                                    <View style={styles.profilePlaceholder}>
                                        <Text style={styles.placeholderText}>
                                            {driverDetails.EmployeeName?.charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            <Text style={styles.driverName}>{driverDetails.EmployeeName}</Text>
                            <Text style={styles.employeeCode}>{driverDetails.EmployeeCode}</Text>
                        </View>

                        {/* Details List */}
                        <View style={styles.detailsList}>
                            {driverDetails.GenderName && (
                                <View style={styles.detailRow}>
                                    <View style={styles.iconContainer}>
                                        <Text style={styles.iconText}>👤</Text>
                                    </View>
                                    <View style={styles.detailContent}>
                                        <Text style={styles.detailLabel}>Gender</Text>
                                        <Text style={styles.detailValue}>{driverDetails.GenderName}</Text>
                                    </View>
                                </View>
                            )}

                            {driverDetails.RouteCode && (
                                <View style={styles.detailRow}>
                                    <View style={styles.iconContainer}>
                                        <Text style={styles.iconText}>🛣️</Text>
                                    </View>
                                    <View style={styles.detailContent}>
                                        <Text style={styles.detailLabel}>Route Code</Text>
                                        <Text style={styles.detailValue}>{driverDetails.RouteCode}</Text>
                                    </View>
                                </View>
                            )}

                            {driverDetails.WorkMobileNo && (
                                <View style={styles.detailRow}>
                                    <View style={styles.iconContainer}>
                                        <Text style={styles.iconText}>📞</Text>
                                    </View>
                                    <View style={styles.detailContent}>
                                        <Text style={styles.detailLabel}>Route contact number</Text>
                                        <Text style={styles.detailValue}>{driverDetails.WorkMobileNo}</Text>
                                    </View>
                                </View>
                            )}

                            {driverDetails.Vehicle && (
                                <View style={styles.detailRow}>
                                    <View style={styles.iconContainer}>
                                        <Text style={styles.iconText}>🚌</Text>
                                    </View>
                                    <View style={styles.detailContent}>
                                        <Text style={styles.detailLabel}>Vehicle No</Text>
                                        <Text style={styles.detailValue}>{driverDetails.Vehicle}</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>🚌</Text>
                        <Text style={styles.emptyText}>
                            We couldn't find any driver details.
                        </Text>
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
    detailsCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 24,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: 32,
        paddingBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    profileImageContainer: {
        marginBottom: 16,
    },
    profileImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 3,
        borderColor: '#e0e0e0',
    },
    profilePlaceholder: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#e0e0e0',
    },
    placeholderText: {
        color: '#fff',
        fontSize: 48,
        fontWeight: 'bold',
    },
    driverName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    employeeCode: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    detailsList: {
        gap: 20,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    iconText: {
        fontSize: 20,
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    emptyState: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 40,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});

export default DriverDetails;
