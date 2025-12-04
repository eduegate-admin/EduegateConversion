import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import {
  Text,
  Card,
  Searchbar,
  IconButton,
  Button,
  Chip,
  Badge,
  FAB,
} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

interface AssignedOrder {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  assignedDate: string;
  dueDate: string;
  totalAmount: number;
  itemCount: number;
  notes?: string;
}

export default function MyAssignedOrdersScreen() {
  const navigation = useNavigation();

  // Mock data - assigned orders
  const [orders] = useState<AssignedOrder[]>([
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      customer: {
        name: 'Ahmed Al Mansoori',
        phone: '+971 50 123 4567',
        address: 'Al Nahda, Dubai',
      },
      status: 'pending',
      priority: 'high',
      assignedDate: '2024-01-15 09:00',
      dueDate: '2024-01-15 12:00',
      totalAmount: 245.5,
      itemCount: 15,
      notes: 'Customer requested morning delivery',
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-002',
      customer: {
        name: 'Fatima Hassan',
        phone: '+971 55 987 6543',
        address: 'Jumeirah 1, Dubai',
      },
      status: 'in-progress',
      priority: 'medium',
      assignedDate: '2024-01-15 08:30',
      dueDate: '2024-01-15 14:00',
      totalAmount: 189.75,
      itemCount: 12,
    },
    {
      id: '3',
      orderNumber: 'ORD-2024-003',
      customer: {
        name: 'Mohammed Khalid',
        phone: '+971 52 456 7890',
        address: 'Al Barsha, Dubai',
      },
      status: 'pending',
      priority: 'medium',
      assignedDate: '2024-01-15 10:00',
      dueDate: '2024-01-15 16:00',
      totalAmount: 156.25,
      itemCount: 8,
      notes: 'Call before delivery',
    },
    {
      id: '4',
      orderNumber: 'ORD-2024-004',
      customer: {
        name: 'Sara Abdullah',
        phone: '+971 56 234 5678',
        address: 'Downtown Dubai',
      },
      status: 'completed',
      priority: 'low',
      assignedDate: '2024-01-14 15:00',
      dueDate: '2024-01-14 18:00',
      totalAmount: 98.0,
      itemCount: 5,
    },
    {
      id: '5',
      orderNumber: 'ORD-2024-005',
      customer: {
        name: 'Ali Rahman',
        phone: '+971 50 876 5432',
        address: 'Marina, Dubai',
      },
      status: 'in-progress',
      priority: 'high',
      assignedDate: '2024-01-15 07:00',
      dueDate: '2024-01-15 11:00',
      totalAmount: 312.9,
      itemCount: 20,
      notes: 'Fragile items - handle with care',
    },
    {
      id: '6',
      orderNumber: 'ORD-2024-006',
      customer: {
        name: 'Mariam Ahmed',
        phone: '+971 55 345 6789',
        address: 'Al Quoz, Dubai',
      },
      status: 'completed',
      priority: 'medium',
      assignedDate: '2024-01-14 12:00',
      dueDate: '2024-01-14 16:00',
      totalAmount: 178.5,
      itemCount: 10,
    },
  ]);

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Filter and search
  const filteredOrders = orders
    .filter(order => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.phone.includes(searchQuery);
      const matchesStatus =
        filterStatus === 'all' || order.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Sort by priority and due date
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (a.priority !== 'high' && b.priority === 'high') return 1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  // Statistics
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    inProgress: orders.filter(o => o.status === 'in-progress').length,
    completed: orders.filter(o => o.status === 'completed').length,
  };

  // Refresh
  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#ff9800';
      case 'in-progress':
        return '#2196f3';
      case 'completed':
        return '#4caf50';
      case 'cancelled':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  // Get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#f44336';
      case 'medium':
        return '#ff9800';
      case 'low':
        return '#4caf50';
      default:
        return '#9e9e9e';
    }
  };

  // Navigate to order detail
  const handleOrderPress = (orderId: string) => {
    navigation.navigate('OrderDetail' as never, {orderId} as never);
  };

  // Render order card
  const renderOrderCard = ({item}: {item: AssignedOrder}) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => handleOrderPress(item.id)}>
      <Card style={styles.card}>
        <Card.Content>
          {/* Order Header */}
          <View style={styles.orderHeader}>
            <View style={styles.orderHeaderLeft}>
              <Text style={styles.orderNumber}>{item.orderNumber}</Text>
              <View style={styles.badges}>
                <Chip
                  style={[
                    styles.statusChip,
                    {backgroundColor: getStatusColor(item.status)},
                  ]}
                  textStyle={styles.chipText}>
                  {item.status.toUpperCase().replace('-', ' ')}
                </Chip>
                {item.priority === 'high' && (
                  <Chip
                    icon="alert"
                    style={[
                      styles.priorityChip,
                      {backgroundColor: getPriorityColor(item.priority)},
                    ]}
                    textStyle={styles.chipText}>
                    HIGH
                  </Chip>
                )}
              </View>
            </View>
            <IconButton icon="chevron-right" size={24} />
          </View>

          {/* Customer Info */}
          <View style={styles.customerSection}>
            <View style={styles.infoRow}>
              <IconButton icon="account" size={20} style={styles.icon} />
              <View style={styles.infoContent}>
                <Text style={styles.customerName}>{item.customer.name}</Text>
                <Text style={styles.customerPhone}>{item.customer.phone}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <IconButton icon="map-marker" size={20} style={styles.icon} />
              <Text style={styles.addressText}>{item.customer.address}</Text>
            </View>
          </View>

          {/* Order Details */}
          <View style={styles.orderDetails}>
            <View style={styles.detailItem}>
              <IconButton icon="calendar" size={18} style={styles.detailIcon} />
              <View>
                <Text style={styles.detailLabel}>Due Time</Text>
                <Text style={styles.detailValue}>
                  {new Date(item.dueDate).toLocaleString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <IconButton icon="package" size={18} style={styles.detailIcon} />
              <View>
                <Text style={styles.detailLabel}>Items</Text>
                <Text style={styles.detailValue}>{item.itemCount}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <IconButton
                icon="currency-usd"
                size={18}
                style={styles.detailIcon}
              />
              <View>
                <Text style={styles.detailLabel}>Amount</Text>
                <Text style={styles.detailValue}>
                  AED {item.totalAmount.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>

          {/* Notes */}
          {item.notes && (
            <View style={styles.notesSection}>
              <IconButton icon="note-text" size={16} style={styles.noteIcon} />
              <Text style={styles.notesText}>{item.notes}</Text>
            </View>
          )}

          {/* Action Buttons */}
          {item.status !== 'completed' && item.status !== 'cancelled' && (
            <View style={styles.actionButtons}>
              {item.status === 'pending' && (
                <Button
                  mode="contained"
                  icon="play"
                  onPress={() => {}}
                  style={styles.actionButton}
                  compact>
                  Start
                </Button>
              )}
              {item.status === 'in-progress' && (
                <Button
                  mode="contained"
                  icon="check"
                  onPress={() => {}}
                  style={[styles.actionButton, styles.completeButton]}
                  compact>
                  Complete
                </Button>
              )}
              <Button
                mode="outlined"
                icon="phone"
                onPress={() => {}}
                style={styles.actionButton}
                compact>
                Call
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1976d2" />

      {/* Header */}
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          iconColor="white"
          size={24}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Assigned Orders</Text>
          <Text style={styles.headerSubtitle}>
            {stats.total} order{stats.total !== 1 ? 's' : ''} assigned
          </Text>
        </View>
        <IconButton icon="filter-variant" iconColor="white" size={24} />
      </View>

      {/* Statistics */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, {color: '#2196f3'}]}>
            {stats.inProgress}
          </Text>
          <Text style={styles.statLabel}>In Progress</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, {color: '#4caf50'}]}>
            {stats.completed}
          </Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search orders..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor="#1976d2"
        />
      </View>

      {/* Status Filter */}
      <View style={styles.filterContainer}>
        <Chip
          selected={filterStatus === 'all'}
          onPress={() => setFilterStatus('all')}
          style={styles.filterChip}
          selectedColor="#1976d2">
          All ({orders.length})
        </Chip>
        <Chip
          selected={filterStatus === 'pending'}
          onPress={() => setFilterStatus('pending')}
          style={styles.filterChip}
          selectedColor="#ff9800">
          Pending ({stats.pending})
        </Chip>
        <Chip
          selected={filterStatus === 'in-progress'}
          onPress={() => setFilterStatus('in-progress')}
          style={styles.filterChip}
          selectedColor="#2196f3">
          In Progress ({stats.inProgress})
        </Chip>
        <Chip
          selected={filterStatus === 'completed'}
          onPress={() => setFilterStatus('completed')}
          style={styles.filterChip}
          selectedColor="#4caf50">
          Completed ({stats.completed})
        </Chip>
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={item => item.id}
        renderItem={renderOrderCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconButton icon="inbox" size={60} iconColor="#ccc" />
            <Text style={styles.emptyText}>No orders found</Text>
            <Text style={styles.emptySubtext}>
              You don't have any assigned orders matching the filter
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
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff9800',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  searchBar: {
    backgroundColor: 'white',
    elevation: 2,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginBottom: 10,
    gap: 8,
  },
  filterChip: {
    backgroundColor: 'white',
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  orderCard: {
    marginBottom: 15,
  },
  card: {
    borderRadius: 12,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderHeaderLeft: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  statusChip: {
    height: 24,
  },
  priorityChip: {
    height: 24,
  },
  chipText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  customerSection: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: {
    margin: 0,
    marginRight: 8,
  },
  infoContent: {
    flex: 1,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  customerPhone: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  addressText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailIcon: {
    margin: 0,
    marginRight: 4,
  },
  detailLabel: {
    fontSize: 10,
    color: '#999',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginTop: 2,
  },
  notesSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 8,
    backgroundColor: '#fff8e1',
    borderRadius: 6,
    marginTop: 8,
  },
  noteIcon: {
    margin: 0,
    marginRight: 4,
  },
  notesText: {
    flex: 1,
    fontSize: 12,
    color: '#f57c00',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
  },
  completeButton: {
    backgroundColor: '#4caf50',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 5,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
