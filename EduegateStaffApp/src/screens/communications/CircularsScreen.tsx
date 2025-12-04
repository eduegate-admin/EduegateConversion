import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    FlatList,
    RefreshControl,
    ActivityIndicator,
    SafeAreaView,
    Dimensions,
    Linking,
    Alert,
    Platform,
    StatusBar,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { apiClient } from '../../services/api/client';
import { API_CONFIG } from '../../constants/config';
import { theme } from '../../constants/theme';

interface CircularAttachment {
    AttachmentReferenceID: number;
    AttachmentDescription: string;
}

interface CircularUserType {
    CircularUserTypeID: number;
    UserType: string;
}

interface Circular {
    CircularID: number;
    CircularCode: string;
    Title: string;
    School: string;
    Message: string;
    CircularDate: string;
    ExpiryDate: string;
    Class?: string;
    Section?: string;
    CircularUserTypes?: CircularUserType[];
    CircularAttachmentMaps?: CircularAttachment[];
}

const { width } = Dimensions.get('window');

const HEADER_COLORS = ['#CCCCCC', '#543177', '#543177', '#543177'];

export const CircularsScreen: React.FC = () => {
    const navigation = useNavigation();
    const [circulars, setCirculars] = useState<Circular[]>([]);
    const [filteredCirculars, setFilteredCirculars] = useState<Circular[]>([]);
    const [userTypes, setUserTypes] = useState<string[]>([]);
    const [selectedUserType, setSelectedUserType] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        try {
            setLoading(true);
            await Promise.all([loadUserTypes(), loadCirculars()]);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadUserTypes = async () => {
        try {
            const response = await apiClient.get(
                `${API_CONFIG.SchoolServiceUrl}/GetCircularUserTypes`
            );
            const types = Array.isArray(response.data) ? response.data : [];
            setUserTypes(types);
        } catch (error) {
            console.error('Error loading user types:', error);
        }
    };

    const loadCirculars = async () => {
        try {
            const response = await apiClient.get(
                `${API_CONFIG.SchoolServiceUrl}/GetCircularsByEmployee`
            );
            const data = Array.isArray(response.data) ? response.data : [];
            setCirculars(data);
            filterCirculars(data, selectedUserType);
        } catch (error) {
            console.error('Error loading circulars:', error);
            setCirculars([]);
        }
    };

    const filterCirculars = (data: Circular[], userType: string) => {
        if (!userType || userType.trim() === '') {
            setFilteredCirculars(data);
        } else {
            const filtered = data.filter(circular => {
                if (!circular.CircularUserTypes || !Array.isArray(circular.CircularUserTypes)) {
                    return false;
                }
                return circular.CircularUserTypes.some(typeMap =>
                    typeMap.UserType?.toLowerCase().includes(userType.toLowerCase())
                );
            });
            setFilteredCirculars(filtered);
        }
    };

    const handleUserTypeChange = (userType: string) => {
        setSelectedUserType(userType);
        filterCirculars(circulars, userType);
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadCirculars().finally(() => setRefreshing(false));
    };

    const downloadAttachment = async (attachmentID: number, attachmentName: string) => {
        try {
            const response = await apiClient.get(
                `${API_CONFIG.ContentServiceUrl}/ReadContentsByIDForMobile`,
                {
                    params: { contentID: attachmentID },
                }
            );

            const fileUrl = response.data;
            if (fileUrl) {
                // Try to open the file URL
                const canOpen = await Linking.canOpenURL(fileUrl);
                if (canOpen) {
                    await Linking.openURL(fileUrl);
                } else {
                    Alert.alert('Error', 'Cannot open file');
                }
            }
        } catch (error) {
            console.error('Error downloading attachment:', error);
            Alert.alert('Error', 'Failed to download file');
        }
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                day: '2-digit',
                month: '2-digit',
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
            <Text style={styles.headerTitle}>Circulars</Text>
            <View style={{ width: 24 }} />
        </View>
    );

    const CircularCard = ({ circular, index }: { circular: Circular; index: number }) => {
        const headerColor = HEADER_COLORS[index % HEADER_COLORS.length];
        const hasUserTypeBadge = circular.CircularUserTypes && circular.CircularUserTypes.length > 0;

        return (
            <View style={styles.cardWrapper}>
                <View style={styles.card}>
                    {/* Card Header */}
                    <View style={[styles.cardHeader, { backgroundColor: headerColor }]}>
                        <Text style={styles.schoolName}>{circular.School}</Text>
                        {hasUserTypeBadge && (
                            <View style={styles.userTypeBadges}>
                                {circular.CircularUserTypes!.slice(0, 1).map((userType, idx) => (
                                    <View key={idx} style={styles.badge}>
                                        <Text style={styles.badgeText}>{userType.UserType}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Card Body */}
                    <View style={styles.cardBody}>
                        {/* Info Grid */}
                        <View style={styles.infoGrid}>
                            <InfoRow label="Circular No" value={circular.CircularCode} />
                            <InfoRow label="Title" value={circular.Title} />
                            <InfoRow label="School" value={circular.School} />
                            {circular.Class && <InfoRow label="Classes" value={circular.Class} />}
                            {circular.Section && <InfoRow label="Sections" value={circular.Section} />}
                            <InfoRow label="Circular Date" value={formatDate(circular.CircularDate)} />
                            <InfoRow label="Expiry date" value={formatDate(circular.ExpiryDate)} />
                        </View>

                        {/* Message Section */}
                        {circular.Message && (
                            <View style={styles.messageContainer}>
                                <Text style={styles.messageText}>{circular.Message}</Text>
                            </View>
                        )}

                        {/* Attachments */}
                        {circular.CircularAttachmentMaps && circular.CircularAttachmentMaps.length > 0 && (
                            <View style={styles.attachmentsSection}>
                                <Text style={styles.attachmentsTitle}>Attachments</Text>
                                {circular.CircularAttachmentMaps.map((attachment, idx) => (
                                    <TouchableOpacity
                                        key={idx}
                                        style={styles.attachmentButton}
                                        onPress={() =>
                                            downloadAttachment(
                                                attachment.AttachmentReferenceID,
                                                attachment.AttachmentDescription
                                            )
                                        }
                                    >
                                        <Text style={styles.attachmentIcon}>📎</Text>
                                        <Text style={styles.attachmentName} numberOfLines={1}>
                                            {attachment.AttachmentDescription}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Circulars Found</Text>
            <Text style={styles.emptyMessage}>
                Circular not found, please try again later
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

            {/* Filter Dropdown */}
            <View style={styles.filterContainer}>
                <Text style={styles.filterLabel}>Filter by:</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filterScroll}
                >
                    <TouchableOpacity
                        style={[
                            styles.filterButton,
                            selectedUserType === '' && styles.filterButtonActive,
                        ]}
                        onPress={() => handleUserTypeChange('')}
                    >
                        <Text
                            style={[
                                styles.filterButtonText,
                                selectedUserType === '' && styles.filterButtonTextActive,
                            ]}
                        >
                            All
                        </Text>
                    </TouchableOpacity>
                    {userTypes.map((userType, idx) => (
                        <TouchableOpacity
                            key={idx}
                            style={[
                                styles.filterButton,
                                selectedUserType === userType && styles.filterButtonActive,
                            ]}
                            onPress={() => handleUserTypeChange(userType)}
                        >
                            <Text
                                style={[
                                    styles.filterButtonText,
                                    selectedUserType === userType && styles.filterButtonTextActive,
                                ]}
                            >
                                {userType}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Circulars List */}
            <FlatList
                data={filteredCirculars}
                renderItem={({ item, index }) => <CircularCard circular={item} index={index} />}
                keyExtractor={(item, index) => `${item.CircularID}-${index}`}
                contentContainerStyle={
                    filteredCirculars.length === 0
                        ? { flex: 1 }
                        : { padding: 16, paddingBottom: 24 }
                }
                ListEmptyComponent={renderEmptyState}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[theme.colors.primary]}
                    />
                }
                scrollEnabled={true}
            />
        </SafeAreaView>
    );
};

interface InfoRowProps {
    label: string;
    value: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
    <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoColon}>:</Text>
        <Text style={styles.infoValue}>{value}</Text>
    </View>
);

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
    paddingTop: 0,
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
    filterContainer: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    filterLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 8,
    },
    filterScroll: {
        flexGrow: 0,
    },
    filterButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    filterButtonActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    filterButtonText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#6B7280',
    },
    filterButtonTextActive: {
        color: '#fff',
    },
    cardWrapper: {
        marginBottom: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 13,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    cardHeader: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    schoolName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
        flex: 1,
    },
    userTypeBadges: {
        flexDirection: 'row',
    },
    badge: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginLeft: 8,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#fff',
    },
    cardBody: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    infoGrid: {
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    infoLabel: {
        fontSize: 12,
        fontWeight: '400',
        color: '#696969',
        width: 90,
    },
    infoColon: {
        fontSize: 12,
        fontWeight: '400',
        color: '#696969',
        marginHorizontal: 4,
    },
    infoValue: {
        fontSize: 12,
        fontWeight: '500',
        color: '#1F0F0F',
        flex: 1,
    },
    messageContainer: {
        backgroundColor: 'rgba(217, 217, 217, 0.4)',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        marginBottom: 12,
    },
    messageText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#1F0F0F',
        lineHeight: 18,
    },
    attachmentsSection: {
        paddingTop: 8,
    },
    attachmentsTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#2F2F2F',
        marginBottom: 8,
    },
    attachmentButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: theme.colors.primary,
        borderRadius: 6,
        marginBottom: 6,
    },
    attachmentIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    attachmentName: {
        fontSize: 12,
        fontWeight: '500',
        color: '#fff',
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

export default CircularsScreen;
