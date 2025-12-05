import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { studentService } from '../services/student/studentService';
import { theme } from '../constants/theme';
import { API_CONFIG } from '../constants/config';

interface PickupRequest {
    StudentPickerStudentMapIID: number;
    PickByFullName: string;
    PickUpBy: string;
    CreatedDateString: string;
    Student: { Value: string };
    ClassSection: string;
    IsActive: boolean;
    PickerProfile?: string;
    QRCODE?: string;
}

export const PickupRequest = () => {
    const navigation = useNavigation();
    const [pickupRequests, setPickupRequests] = useState<PickupRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loginID, setLoginID] = useState<number | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const callContext = await AsyncStorage.getItem('callContext');
            if (callContext) {
                const context = JSON.parse(callContext);
                setLoginID(context.LoginID);
                await fetchPickupRequests(context.LoginID);
            }
        } catch (error) {
            console.error('Failed to load data', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPickupRequests = async (loginId: number) => {
        try {
            const data = await studentService.getDailyPickupRequests(loginId);
            const processedData = data.map((item: PickupRequest) => ({
                ...item,
                ButtonName: item.IsActive ? 'Cancel' : 'Activate',
                Student: item.Student?.Value ? item.Student : { Value: 'All' }
            }));
            setPickupRequests(processedData);
        } catch (error) {
            console.error('Failed to fetch pickup requests', error);
        }
    };

    const handleCancelOrActivate = async (request: PickupRequest) => {
        const action = request.IsActive ? 'cancel' : 'activate';
        Alert.alert(
            'Confirm',
            `Are you sure you want to ${action} this pickup request?`,
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes',
                    onPress: async () => {
                        try {
                            setIsLoading(true);
                            const result = await studentService.cancelOrActivatePickupRequest(
                                request.StudentPickerStudentMapIID
                            );
                            if (result.operationResult === 1) {
                                Alert.alert('Success', result.Message);
                                if (loginID) {
                                    await fetchPickupRequests(loginID);
                                }
                            } else {
                                Alert.alert('Error', result.Message || 'Operation failed');
                            }
                        } catch (error) {
                            console.error('Failed to update request', error);
                            Alert.alert('Error', 'Failed to update pickup request');
                        } finally {
                            setIsLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const PickupCard = ({ request }: { request: PickupRequest }) => (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                <View style={[
                    styles.statusIndicator,
                    { backgroundColor: request.IsActive ? '#4caf50' : '#f44336' }
                ]} />

                <View style={styles.cardInfo}>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Pickup person:</Text>
                        <Text style={styles.value}>{request.PickByFullName}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>PickUp By:</Text>
                        <Text style={styles.value}>{request.PickUpBy}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Created date:</Text>
                        <Text style={styles.value}>{request.CreatedDateString}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Student:</Text>
                        <Text style={styles.value}>{request.Student?.Value || 'All'}</Text>
                    </View>
                </View>

                {request.PickerProfile && (
                    <Image
                        source={{ uri: `${API_CONFIG.ContentServiceUrl}/ReadImageContentsByID?contentID=${request.PickerProfile}` }}
                        style={styles.profileImage}
                    />
                )}
            </View>

            <View style={styles.separator} />

            <View style={styles.cardActions}>
                <TouchableOpacity
                    style={[
                        styles.actionButton,
                        request.IsActive ? styles.cancelButton : styles.activateButton
                    ]}
                    onPress={() => handleCancelOrActivate(request)}
                >
                    <Text style={styles.actionButtonText}>
                        {request.IsActive ? 'Cancel' : 'Activate'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (isLoading && pickupRequests.length === 0) {
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
                <Text style={styles.headerTitle}>Pickup Request</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>Registered list</Text>

                {pickupRequests.length > 0 ? (
                    pickupRequests.map((request, index) => (
                        <PickupCard key={index} request={request} />
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>⚠️</Text>
                        <View style={styles.emptyTextContainer}>
                            <Text style={styles.emptyTitle}>Student Pickup Requests not found</Text>
                            <Text style={styles.emptyMessage}>Student Pickup Requests not found.</Text>
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
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    card: {
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
    cardContent: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'flex-start',
    },
    statusIndicator: {
        width: 6,
        alignSelf: 'stretch',
        borderRadius: 3,
        marginRight: 16,
        minHeight: 100,
    },
    cardInfo: {
        flex: 1,
        gap: 8,
    },
    infoRow: {
        flexDirection: 'row',
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginRight: 8,
    },
    value: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.primary,
        flex: 1,
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginLeft: 8,
    },
    separator: {
        height: 1,
        backgroundColor: '#eee',
        marginHorizontal: 16,
    },
    cardActions: {
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    actionButton: {
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    cancelButton: {
        backgroundColor: theme.colors.primary,
    },
    activateButton: {
        backgroundColor: '#4caf50',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
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

export default PickupRequest;
