import React, {useState} from 'react';
import {View, StyleSheet, FlatList, StatusBar} from 'react-native';
import {Text, Card, IconButton, Badge, Chip} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'system' | 'alert' | 'info';
  timestamp: string;
  read: boolean;
}

export default function NotificationsScreen() {
  const navigation = useNavigation();

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'New Order Assigned',
      message: 'Order #12345 has been assigned to you',
      type: 'order',
      timestamp: '2 minutes ago',
      read: false,
    },
    {
      id: '2',
      title: 'Stock Alert',
      message: 'Product SKU-789 is running low on stock',
      type: 'alert',
      timestamp: '1 hour ago',
      read: false,
    },
    {
      id: '3',
      title: 'System Maintenance',
      message: 'Scheduled maintenance on Sunday 3 AM - 5 AM',
      type: 'system',
      timestamp: '3 hours ago',
      read: true,
    },
    {
      id: '4',
      title: 'Order Completed',
      message: 'Order #12340 has been marked as completed',
      type: 'order',
      timestamp: '5 hours ago',
      read: true,
    },
    {
      id: '5',
      title: 'New Feature',
      message: 'Check out the new barcode scanner feature!',
      type: 'info',
      timestamp: '1 day ago',
      read: true,
    },
  ]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return 'package-variant';
      case 'system':
        return 'cog';
      case 'alert':
        return 'alert-circle';
      case 'info':
        return 'information';
      default:
        return 'bell';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'order':
        return '#2196f3';
      case 'system':
        return '#9e9e9e';
      case 'alert':
        return '#ff9800';
      case 'info':
        return '#4caf50';
      default:
        return '#1976d2';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif => (notif.id === id ? {...notif, read: true} : notif)),
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({...notif, read: true})));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const renderNotification = ({item}: {item: Notification}) => (
    <Card
      style={[styles.notificationCard, !item.read && styles.unreadCard]}
      onPress={() => markAsRead(item.id)}>
      <Card.Content>
        <View style={styles.notificationHeader}>
          <View style={styles.notificationIconContainer}>
            <IconButton
              icon={getNotificationIcon(item.type)}
              iconColor={getNotificationColor(item.type)}
              size={24}
              style={[
                styles.notificationIcon,
                {backgroundColor: getNotificationColor(item.type) + '20'},
              ]}
            />
          </View>
          <View style={styles.notificationContent}>
            <View style={styles.notificationTitleRow}>
              <Text
                variant="titleSmall"
                style={[styles.notificationTitle, !item.read && styles.unreadText]}>
                {item.title}
              </Text>
              {!item.read && <Badge size={8} style={styles.unreadBadge} />}
            </View>
            <Text variant="bodyMedium" style={styles.notificationMessage}>
              {item.message}
            </Text>
            <Text variant="bodySmall" style={styles.notificationTime}>
              {item.timestamp}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1976d2" />

      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          iconColor="white"
          size={24}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={styles.headerSubtitle}>{unreadCount} unread</Text>
          )}
        </View>
        {unreadCount > 0 && (
          <Chip
            mode="flat"
            textStyle={styles.markAllText}
            style={styles.markAllChip}
            onPress={markAllAsRead}>
            Mark all read
          </Chip>
        )}
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text variant="titleMedium" style={styles.emptyTitle}>
              No Notifications
            </Text>
            <Text variant="bodyMedium" style={styles.emptyText}>
              You're all caught up!
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  header: {
    backgroundColor: '#1976d2',
    paddingTop: 45,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    margin: 0,
    marginRight: 10,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  markAllChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  markAllText: {
    color: 'white',
    fontSize: 12,
  },
  listContent: {
    padding: 20,
  },
  notificationCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: 'white',
  },
  unreadCard: {
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 4,
    borderLeftColor: '#1976d2',
  },
  notificationHeader: {
    flexDirection: 'row',
  },
  notificationIconContainer: {
    marginRight: 12,
  },
  notificationIcon: {
    margin: 0,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    flex: 1,
    fontWeight: '600',
    color: '#333',
  },
  unreadText: {
    fontWeight: 'bold',
    color: '#1976d2',
  },
  unreadBadge: {
    backgroundColor: '#1976d2',
  },
  notificationMessage: {
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
  notificationTime: {
    color: '#999',
    fontSize: 11,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyText: {
    color: '#666',
  },
});
