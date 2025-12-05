import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { studentService } from '../services/student/studentService';
import { theme } from '../constants/theme';
import { BottomMenu } from '../components/BottomMenu';

interface Notification {
    NotificationAlertIID: number;
    Message: string;
    NotificationDate: string;
}

export const Notifications = () => {
    const navigation = useNavigation();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const pageSize = 20;

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            setIsLoading(true);
            const data = await studentService.getNotifications(1, pageSize);
            setNotifications(data);
            setHasMore(data.length === pageSize);
            setPage(2);
        } catch (error) {
            console.error('Failed to load notifications', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadMore = async () => {
        if (isLoadingMore || !hasMore) return;

        try {
            setIsLoadingMore(true);
            const data = await studentService.getNotifications(page, pageSize);
            if (data.length > 0) {
                setNotifications(prev => [...prev, ...data]);
                setPage(prev => prev + 1);
                setHasMore(data.length === pageSize);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Failed to load more notifications', error);
        } finally {
            setIsLoadingMore(false);
        }
    };

    const markAsRead = async (notificationID?: number) => {
        try {
            const id = notificationID || 0; // 0 = mark all as read
            const success = await studentService.markNotificationAsRead(id);
            if (success) {
                Alert.alert('Success', notificationID ? 'Notification marked as read' : 'All notifications marked as read');
                // Reload notifications
                setPage(1);
                setNotifications([]);
                loadNotifications();
            }
        } catch (error) {
            console.error('Failed to mark as read', error);
            Alert.alert('Error', 'Failed to mark notification as read');
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const stripHtmlTags = (html: string) => {
        return html
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .trim();
    };

    const renderNotification = ({ item }: { item: Notification }) => (
        <View style={styles.notificationCard}>
            <View style={styles.iconContainer}>
                <Text style={styles.icon}>🔔</Text>
            </View>
            <View style={styles.contentCard}>
                <View style={styles.cardBody}>
                    <View style={styles.messageContainer}>
                        <Text style={styles.messageLabel}>Message</Text>
                        <Text style={styles.messageText}>
                            {stripHtmlTags(item.Message)}
                        </Text>
                    </View>
                    <View style={styles.dateContainer}>
                        <Text style={styles.dateText}>{formatDate(item.NotificationDate)}</Text>
                        <TouchableOpacity
                            style={styles.markReadButton}
                            onPress={() => markAsRead(item.NotificationAlertIID)}
                        >
                            <Text style={styles.checkIcon}>✓</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
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
                <Text style={styles.headerTitle}>Notifications</Text>
            </View>

            {notifications.length > 0 ? (
                <>
                    {/* Notification Count and Mark All */}
                    <View style={styles.topBar}>
                        <Text style={styles.countText}>
                            <Text style={styles.countNumber}>{notifications.length}</Text> Notifications
                        </Text>
                        <TouchableOpacity
                            style={styles.markAllButton}
                            onPress={() => markAsRead()}
                        >
                            <Text style={styles.markAllText}>Mark all as read</Text>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={notifications}
                        renderItem={renderNotification}
                        keyExtractor={(item, index) => `${item.NotificationAlertIID}-${index}`}
                        contentContainerStyle={styles.listContent}
                        onEndReached={loadMore}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={renderFooter}
                        showsVerticalScrollIndicator={false}
                    />
                </>
            ) : (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>🔔</Text>
                    <Text style={styles.emptyTitle}>No notifications found.</Text>
                </View>
            )}
            <View style={{ height: 100 }} />
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
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    countText: {
        fontSize: 14,
        color: '#333',
    },
    countNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        marginRight: 8,
    },
    markAllButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    markAllText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    listContent: {
        padding: 16,
    },
    notificationCard: {
        flexDirection: 'row',
        marginBottom: 16,
        backgroundColor: '#e8f4f8',
        borderRadius: 12,
        padding: 12,
    },
    iconContainer: {
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 8,
    },
    icon: {
        fontSize: 24,
    },
    contentCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 8,
        overflow: 'hidden',
    },
    cardBody: {
        padding: 16,
    },
    messageContainer: {
        marginBottom: 12,
    },
    messageLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
        textTransform: 'capitalize',
    },
    messageText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    dateContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    dateText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    markReadButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#4caf50',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkIcon: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    footerLoader: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
});

export default Notifications;
