import React, {useState, useEffect} from 'react';
import {View, StyleSheet, FlatList, StatusBar, TouchableOpacity} from 'react-native';
import {
  Text,
  Card,
  Searchbar,
  Chip,
  IconButton,
  FAB,
  SegmentedButtons,
  Badge,
  Menu,
  Divider,
} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  status: 'new' | 'pending' | 'processing' | 'completed' | 'cancelled';
  totalAmount: number;
  itemsCount: number;
  dateCreated: string;
  deliveryDate?: string;
  branch: string;
  paymentMethod: string;
  priority: 'high' | 'medium' | 'low';
}

export default function OrderListScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'compact'>('list');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date');
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const [orders, setOrders] = useState<Order[]>([
    {
      id: '1',
      orderNumber: 'ORD-12345',
      customerName: 'Ahmed Mohammed',
      status: 'new',
      totalAmount: 1250.50,
      itemsCount: 15,
      dateCreated: '2025-01-25 10:30 AM',
      deliveryDate: '2025-01-26',
      branch: 'Main Branch - Dubai',
      paymentMethod: 'Cash on Delivery',
      priority: 'high',
    },
    {
      id: '2',
      orderNumber: 'ORD-12346',
      customerName: 'Fatima Ali',
      status: 'processing',
      totalAmount: 850.00,
      itemsCount: 8,
      dateCreated: '2025-01-25 09:15 AM',
      deliveryDate: '2025-01-25',
      branch: 'Branch 2 - Sharjah',
      paymentMethod: 'Credit Card',
      priority: 'medium',
    },
    {
      id: '3',
      orderNumber: 'ORD-12347',
      customerName: 'Mohammed Hassan',
      status: 'pending',
      totalAmount: 2100.75,
      itemsCount: 22,
      dateCreated: '2025-01-25 08:45 AM',
      deliveryDate: '2025-01-27',
      branch: 'Main Branch - Dubai',
      paymentMethod: 'Online Payment',
      priority: 'high',
    },
    {
      id: '4',
      orderNumber: 'ORD-12348',
      customerName: 'Sara Abdullah',
      status: 'completed',
      totalAmount: 450.25,
      itemsCount: 5,
      dateCreated: '2025-01-24 04:20 PM',
      deliveryDate: '2025-01-25',
      branch: 'Branch 3 - Abu Dhabi',
      paymentMethod: 'Cash',
      priority: 'low',
    },
    {
      id: '5',
      orderNumber: 'ORD-12349',
      customerName: 'Ali Rahman',
      status: 'new',
      totalAmount: 1890.00,
      itemsCount: 18,
      dateCreated: '2025-01-25 11:00 AM',
      branch: 'Main Branch - Dubai',
      paymentMethod: 'Credit Card',
      priority: 'medium',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return '#4caf50';
      case 'pending':
        return '#ff9800';
      case 'processing':
        return '#2196f3';
      case 'completed':
        return '#9e9e9e';
      case 'cancelled':
        return '#d32f2f';
      default:
        return '#666';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortBy) {
      case 'amount':
        return b.totalAmount - a.totalAmount;
      case 'status':
        return a.status.localeCompare(b.status);
      case 'date':
      default:
        return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime();
    }
  });

  const statusCounts = {
    all: orders.length,
    new: orders.filter(o => o.status === 'new').length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    completed: orders.filter(o => o.status === 'completed').length,
  };

  const renderOrderCard = ({item}: {item: Order}) => {
    if (viewMode === 'compact') {
      return (
        <TouchableOpacity
          onPress={() => navigation.navigate('OrderDetail' as never, {orderId: item.id} as never)}>
          <Card style={styles.compactCard}>
            <Card.Content style={styles.compactContent}>
              <View style={styles.compactLeft}>
                <Text variant="titleSmall" style={styles.orderNumber}>
                  {item.orderNumber}
                </Text>
                <Text variant="bodySmall" style={styles.customerName}>
                  {item.customerName}
                </Text>
              </View>
              <View style={styles.compactRight}>
                <Chip
                  mode="flat"
                  textStyle={styles.statusChipText}
                  style={[
                    styles.statusChip,
                    {backgroundColor: getStatusColor(item.status) + '20'},
                  ]}>
                  {getStatusLabel(item.status)}
                </Chip>
                <Text variant="titleSmall" style={styles.amount}>
                  AED {item.totalAmount.toFixed(2)}
                </Text>
              </View>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      );
    }

    if (viewMode === 'grid') {
      return (
        <TouchableOpacity
          style={styles.gridItem}
          onPress={() => navigation.navigate('OrderDetail' as never, {orderId: item.id} as never)}>
          <Card style={styles.gridCard}>
            <Card.Content>
              <View style={styles.gridHeader}>
                <Text variant="bodySmall" style={styles.priority}>
                  {getPriorityIcon(item.priority)}
                </Text>
                <Chip
                  mode="flat"
                  textStyle={styles.gridStatusText}
                  style={[
                    styles.gridStatusChip,
                    {backgroundColor: getStatusColor(item.status) + '20'},
                  ]}>
                  {getStatusLabel(item.status)}
                </Chip>
              </View>
              <Text variant="titleMedium" style={styles.gridOrderNumber}>
                {item.orderNumber}
              </Text>
              <Text variant="bodySmall" style={styles.gridCustomer} numberOfLines={1}>
                {item.customerName}
              </Text>
              <Divider style={styles.gridDivider} />
              <View style={styles.gridFooter}>
                <View style={styles.gridFooterItem}>
                  <Text variant="bodySmall" style={styles.gridLabel}>
                    Amount
                  </Text>
                  <Text variant="titleSmall" style={styles.gridAmount}>
                    AED {item.totalAmount.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.gridFooterItem}>
                  <Text variant="bodySmall" style={styles.gridLabel}>
                    Items
                  </Text>
                  <Text variant="titleSmall" style={styles.gridItems}>
                    {item.itemsCount}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      );
    }

    // List view (default)
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('OrderDetail' as never, {orderId: item.id} as never)}>
        <Card style={styles.orderCard}>
          <Card.Content>
            <View style={styles.orderHeader}>
              <View style={styles.orderHeaderLeft}>
                <Text variant="titleMedium" style={styles.orderNumber}>
                  {item.orderNumber}
                </Text>
                <Text variant="bodySmall" style={styles.priority}>
                  {getPriorityIcon(item.priority)} Priority
                </Text>
              </View>
              <Chip
                mode="flat"
                textStyle={{
                  color: getStatusColor(item.status),
                  fontSize: 12,
                  fontWeight: '600',
                }}
                style={[
                  styles.statusChip,
                  {backgroundColor: getStatusColor(item.status) + '20'},
                ]}>
                {getStatusLabel(item.status)}
              </Chip>
            </View>

            <Text variant="bodyMedium" style={styles.customerName}>
              👤 {item.customerName}
            </Text>

            <View style={styles.orderDetails}>
              <View style={styles.detailRow}>
                <Text variant="bodySmall" style={styles.detailLabel}>
                  📦 Items:
                </Text>
                <Text variant="bodySmall" style={styles.detailValue}>
                  {item.itemsCount}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text variant="bodySmall" style={styles.detailLabel}>
                  💰 Total:
                </Text>
                <Text variant="bodySmall" style={styles.detailValue}>
                  AED {item.totalAmount.toFixed(2)}
                </Text>
              </View>
            </View>

            <View style={styles.orderDetails}>
              <View style={styles.detailRow}>
                <Text variant="bodySmall" style={styles.detailLabel}>
                  🏪 Branch:
                </Text>
                <Text variant="bodySmall" style={styles.detailValue}>
                  {item.branch}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text variant="bodySmall" style={styles.detailLabel}>
                  📅 Created:
                </Text>
                <Text variant="bodySmall" style={styles.detailValue}>
                  {item.dateCreated}
                </Text>
              </View>
            </View>

            {item.deliveryDate && (
              <View style={styles.deliveryInfo}>
                <Text variant="bodySmall" style={styles.deliveryText}>
                  🚚 Delivery: {item.deliveryDate}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1976d2" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Orders</Text>
        <View style={styles.headerActions}>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <IconButton
                icon="sort"
                iconColor="white"
                size={24}
                onPress={() => setMenuVisible(true)}
              />
            }>
            <Menu.Item
              onPress={() => {
                setSortBy('date');
                setMenuVisible(false);
              }}
              title="Sort by Date"
              leadingIcon="calendar"
            />
            <Menu.Item
              onPress={() => {
                setSortBy('amount');
                setMenuVisible(false);
              }}
              title="Sort by Amount"
              leadingIcon="currency-usd"
            />
            <Menu.Item
              onPress={() => {
                setSortBy('status');
                setMenuVisible(false);
              }}
              title="Sort by Status"
              leadingIcon="flag"
            />
          </Menu>
          <IconButton icon="filter" iconColor="white" size={24} onPress={() => {}} />
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search orders..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          data={['all', 'new', 'pending', 'processing', 'completed']}
          keyExtractor={item => item}
          renderItem={({item}) => (
            <Chip
              selected={filterStatus === item}
              onPress={() => setFilterStatus(item)}
              style={styles.filterChip}
              showSelectedCheck={false}>
              {item.charAt(0).toUpperCase() + item.slice(1)}{' '}
              {statusCounts[item as keyof typeof statusCounts] > 0 && (
                <Badge size={18}>{statusCounts[item as keyof typeof statusCounts]}</Badge>
              )}
            </Chip>
          )}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <View style={styles.viewModeContainer}>
        <SegmentedButtons
          value={viewMode}
          onValueChange={value => setViewMode(value as 'list' | 'grid' | 'compact')}
          buttons={[
            {
              value: 'list',
              icon: 'view-list',
              label: 'List',
            },
            {
              value: 'grid',
              icon: 'view-grid',
              label: 'Grid',
            },
            {
              value: 'compact',
              icon: 'view-compact',
              label: 'Compact',
            },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      <FlatList
        data={sortedOrders}
        renderItem={renderOrderCard}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContent,
          viewMode === 'grid' && styles.gridContent,
        ]}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={() => {
          setLoading(true);
          setTimeout(() => setLoading(false), 1500);
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text variant="titleMedium" style={styles.emptyTitle}>
              No Orders Found
            </Text>
            <Text variant="bodyMedium" style={styles.emptyText}>
              Try adjusting your search or filters
            </Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {}}
        label="New Order"
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
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerActions: {
    flexDirection: 'row',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
    backgroundColor: '#1976d2',
  },
  searchBar: {
    elevation: 2,
  },
  filterContainer: {
    paddingVertical: 10,
    paddingLeft: 20,
    backgroundColor: 'white',
  },
  filterChip: {
    marginRight: 8,
  },
  viewModeContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'white',
  },
  segmentedButtons: {
    backgroundColor: '#f0f4f8',
  },
  listContent: {
    padding: 20,
  },
  gridContent: {
    paddingHorizontal: 10,
  },
  orderCard: {
    marginBottom: 12,
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
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 4,
  },
  priority: {
    fontSize: 11,
    color: '#666',
  },
  statusChip: {
    height: 28,
  },
  statusChipText: {
    fontSize: 11,
  },
  customerName: {
    color: '#333',
    marginBottom: 12,
    fontWeight: '500',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    color: '#666',
    marginRight: 6,
  },
  detailValue: {
    color: '#333',
    fontWeight: '500',
  },
  deliveryInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  deliveryText: {
    color: '#1976d2',
    fontWeight: '500',
  },
  compactCard: {
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
  },
  compactContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  compactLeft: {
    flex: 1,
  },
  compactRight: {
    alignItems: 'flex-end',
  },
  amount: {
    color: '#1976d2',
    fontWeight: 'bold',
    marginTop: 4,
  },
  gridItem: {
    flex: 1,
    padding: 5,
    maxWidth: '50%',
  },
  gridCard: {
    borderRadius: 12,
    elevation: 2,
    height: '100%',
  },
  gridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gridStatusChip: {
    height: 24,
  },
  gridStatusText: {
    fontSize: 10,
  },
  gridOrderNumber: {
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 4,
  },
  gridCustomer: {
    color: '#666',
    marginBottom: 8,
  },
  gridDivider: {
    marginVertical: 8,
  },
  gridFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridFooterItem: {
    flex: 1,
  },
  gridLabel: {
    color: '#999',
    fontSize: 10,
    marginBottom: 2,
  },
  gridAmount: {
    color: '#1976d2',
    fontWeight: '600',
  },
  gridItems: {
    color: '#666',
    fontWeight: '600',
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#1976d2',
  },
});
