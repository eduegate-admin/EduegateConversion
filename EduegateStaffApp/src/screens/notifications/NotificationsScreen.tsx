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
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { apiClient } from '../../services/api/client';
import { API_CONFIG } from '../../constants/config';
import { theme } from '../../constants/theme';

interface Notification {
    NotificationAlertIID: number;
    Message: string;
    NotificationDate: string;
    IsRead: boolean;
}

const { width } = Dimensions.get('window');

export const NotificationsScreen: React.FC = () => {
    const navigation = useNavigation();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(20);
    const [noMoreData, setNoMoreData] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadNotifications(1, true);
        }, [])
    );

    const loadNotifications = async (pageNum: number, isRefresh: boolean = false) => {
        try {
            if (isRefresh) {
                setLoading(true);
                setNotifications([]);
                setPage(1);
                setNoMoreData(false);
            } else {
                setIsLoadingMore(true);
            }

            const response = await apiClient.get<Notification[]>(
                `${API_CONFIG.SchoolServiceUrl}/GetMyNotification`,
                {
                    params: {
                        page: pageNum,
                        pageSize: pageSize,
                    },
                }
            );

            const newNotifications = response.data || [];

            if (isRefresh) {
                setNotifications(newNotifications);
            } else {
                setNotifications(prev => [...prev, ...newNotifications]);
            }

            if (newNotifications.length < pageSize) {
                setNoMoreData(true);
            }

            setPage(pageNum + 1);
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setIsLoadingMore(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadNotifications(1, true);
    };

    const handleLoadMore = () => {
        if (!noMoreData && !isLoadingMore && !loading) {
            loadNotifications(page, false);
        }
    };

    const markAsRead = async (notificationId: number) => {
        try {
            await apiClient.post(
                `${API_CONFIG.SchoolServiceUrl}/MarkNotificationAsRead`,
                {},
                {
                    params: {
                        notificationAlertID: notificationId,
                    },
                }
            );

            // Reload notifications after marking as read
            loadNotifications(1, true);
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        if (notifications.length === 0) return;

        try {
            // Mark the first notification (will mark all)
            await markAsRead(notifications[0].NotificationAlertIID);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.backButton}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Notifications</Text>
            <View style={{ width: 24 }} />
        </View>
    );

    const NotificationCard = ({ item }: { item: Notification }) => (
        <TouchableOpacity
            style={[styles.notificationCard, item.IsRead && styles.notificationCardRead]}
            onPress={() => markAsRead(item.NotificationAlertIID)}
        >
            <View style={styles.cardContent}>
                {/* Avatar */}
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar} />
                </View>

                {/* Content */}
                <View style={styles.textContent}>
                    {/* Title - Show first line of message */}
                    <Text style={styles.messageTitle} numberOfLines={1}>
                        {item.Message.split('\n')[0] || 'Notification'}
                    </Text>

                    {/* Subtitle - Show next lines */}
                    <Text style={styles.messagePreview} numberOfLines={2}>
                        {item.Message.split('\n').slice(1).join(' ') || item.Message}
                    </Text>

                    {/* Date */}
                    <Text style={styles.dateText}>
                        {new Date(item.NotificationDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                        })}
                    </Text>
                </View>

                {/* Read indicator */}
                {!item.IsRead && <View style={styles.unreadIndicator} />}
            </View>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
                <Text style={styles.emptyIconText}>🔔</Text>
            </View>
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptyMessage}>You're all caught up!</Text>
        </View>
    );

    const renderFooter = () => {
        if (!isLoadingMore) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
        );
    };

    if (loading && notifications.length === 0) {
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

            {/* Mark All as Read Button */}
            {notifications.length > 0 && (
                <TouchableOpacity
                    style={styles.markAllButton}
                    onPress={markAllAsRead}
                >
                    <Text style={styles.markAllButtonText}>Mark all as read</Text>
                </TouchableOpacity>
            )}

            {/* Notifications List */}
            <FlatList
                data={notifications}
                renderItem={({ item }) => <NotificationCard item={item} />}
                keyExtractor={item => item.NotificationAlertIID.toString()}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[theme.colors.primary]}
                    />
                }
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={renderEmptyState}
                scrollEnabled={true}
                contentContainerStyle={
                    notifications.length === 0 ? { flex: 1 } : { paddingBottom: 20 }
                }
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
    markAllButton: {
        marginHorizontal: 16,
        marginTop: 12,
        marginBottom: 16,
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: theme.colors.primary,
        borderRadius: 8,
        alignItems: 'center',
    },
    markAllButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    notificationCard: {
        marginHorizontal: 16,
        marginBottom: 12,
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
    },
    notificationCardRead: {
        backgroundColor: '#F9FAFB',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    avatarContainer: {
        marginRight: 12,
        marginTop: 2,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#D1D5DB',
    },
    textContent: {
        flex: 1,
    },
    messageTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    messagePreview: {
        fontSize: 13,
        color: '#6B7280',
        lineHeight: 18,
        marginBottom: 8,
    },
    dateText: {
        fontSize: 12,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    unreadIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: theme.colors.primary,
        marginLeft: 12,
        marginTop: 2,
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
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyIconText: {
        fontSize: 40,
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
    footerLoader: {
        paddingVertical: 16,
        alignItems: 'center',
    },
});

export default NotificationsScreen;
