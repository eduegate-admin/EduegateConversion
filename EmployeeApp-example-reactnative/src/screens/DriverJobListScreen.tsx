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
  FAB,
  ProgressBar,
} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

interface DeliveryJob {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    area: string;
  };
  status: 'assigned' | 'picked' | 'in-transit' | 'delivered' | 'failed';
  priority: 'low' | 'medium' | 'high';
  scheduledTime: string;
  distance: string;
  itemCount: number;
  cashToCollect?: number;
  sequence?: number;
}

export default function DriverJobListScreen() {
  const navigation = useNavigation();

  // Mock data
  const [jobs] = useState<DeliveryJob[]>([
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      customer: {
        name: 'Ahmed Al Mansoori',
        phone: '+971 50 123 4567',
        area: 'Al Nahda',
      },
      status: 'in-transit',
      priority: 'high',
      scheduledTime: '10:00 AM',
      distance: '2.5 km',
      itemCount: 15,
      cashToCollect: 245.5,
      sequence: 1,
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-002',
      customer: {
        name: 'Fatima Hassan',
        phone: '+971 55 987 6543',
        area: 'Jumeirah 1',
      },
      status: 'picked',
      priority: 'high',
      scheduledTime: '10:30 AM',
      distance: '4.2 km',
      itemCount: 12,
      sequence: 2,
    },
    {
      id: '3',
      orderNumber: 'ORD-2024-003',
      customer: {
        name: 'Mohammed Khalid',
        phone: '+971 52 456 7890',
        area: 'Al Barsha',
      },
      status: 'assigned',
      priority: 'medium',
      scheduledTime: '11:00 AM',
      distance: '6.8 km',
      itemCount: 8,
      cashToCollect: 156.25,
      sequence: 3,
    },
    {
      id: '4',
      orderNumber: 'ORD-2024-004',
      customer: {
        name: 'Sara Abdullah',
        phone: '+971 56 234 5678',
        area: 'Downtown',
      },
      status: 'assigned',
      priority: 'low',
      scheduledTime: '11:30 AM',
      distance: '7.5 km',
      itemCount: 5,
      sequence: 4,
    },
    {
      id: '5',
      orderNumber: 'ORD-2024-005',
      customer: {
        name: 'Ali Rahman',
        phone: '+971 50 876 5432',
        area: 'Marina',
      },
      status: 'delivered',
      priority: 'high',
      scheduledTime: '09:00 AM',
      distance: '3.1 km',
      itemCount: 20,
      cashToCollect: 312.9,
    },
    {
      id: '6',
      orderNumber: 'ORD-2024-006',
      customer: {
        name: 'Mariam Ahmed',
        phone: '+971 55 345 6789',
        area: 'Al Quoz',
      },
      status: 'delivered',
      priority: 'medium',
      scheduledTime: '09:30 AM',
      distance: '5.4 km',
      itemCount: 10,
    },
  ]);

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('active');
  const [refreshing, setRefreshing] = useState(false);

  // Filter jobs
  const filteredJobs = jobs
    .filter(job => {
      const matchesSearch =
        job.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.customer.area.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesStatus = true;
      if (filterStatus === 'active') {
        matchesStatus = ['assigned', 'picked', 'in-transit'].includes(job.status);
      } else if (filterStatus === 'completed') {
        matchesStatus = job.status === 'delivered';
      } else if (filterStatus === 'failed') {
        matchesStatus = job.status === 'failed';
      }

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Sort by sequence for active jobs, by time for others
      if (filterStatus === 'active' && a.sequence && b.sequence) {
        return a.sequence - b.sequence;
      }
      return a.scheduledTime.localeCompare(b.scheduledTime);
    });

  // Statistics
  const stats = {
    total: jobs.length,
    assigned: jobs.filter(j => j.status === 'assigned').length,
    picked: jobs.filter(j => j.status === 'picked').length,
    inTransit: jobs.filter(j => j.status === 'in-transit').length,
    delivered: jobs.filter(j => j.status === 'delivered').length,
    failed: jobs.filter(j => j.status === 'failed').length,
  };

  const activeJobs = stats.assigned + stats.picked + stats.inTransit;
  const completionRate = stats.total > 0 ? (stats.delivered / stats.total) * 100 : 0;

  // Refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  // Get status info
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'assigned':
        return {color: '#ff9800', label: 'Assigned', icon: 'clipboard-check'};
      case 'picked':
        return {color: '#2196f3', label: 'Picked', icon: 'package-variant'};
      case 'in-transit':
        return {color: '#9c27b0', label: 'In Transit', icon: 'truck-delivery'};
      case 'delivered':
        return {color: '#4caf50', label: 'Delivered', icon: 'check-circle'};
      case 'failed':
        return {color: '#f44336', label: 'Failed', icon: 'alert-circle'};
      default:
        return {color: '#9e9e9e', label: 'Unknown', icon: 'help-circle'};
    }
  };

  // Navigate to job detail
  const handleJobPress = (jobId: string) => {
    navigation.navigate('DriverOrderDetail' as never, {orderId: jobId} as never);
  };

  // Render job card
  const renderJobCard = ({item}: {item: DeliveryJob}) => {
    const statusInfo = getStatusInfo(item.status);

    return (
      <TouchableOpacity
        style={styles.jobCard}
        onPress={() => handleJobPress(item.id)}>
        <Card style={styles.card}>
          <Card.Content>
            {/* Job Header */}
            <View style={styles.jobHeader}>
              <View style={styles.jobHeaderLeft}>
                {item.sequence && (
                  <View style={styles.sequenceBadge}>
                    <Text style={styles.sequenceText}>#{item.sequence}</Text>
                  </View>
                )}
                <View style={styles.orderInfo}>
                  <Text style={styles.orderNumber}>{item.orderNumber}</Text>
                  <View style={styles.badges}>
                    <Chip
                      style={[
                        styles.statusChip,
                        {backgroundColor: statusInfo.color},
                      ]}
                      textStyle={styles.chipText}>
                      {statusInfo.label.toUpperCase()}
                    </Chip>
                    {item.priority === 'high' && (
                      <Chip
                        icon="alert"
                        style={styles.priorityChip}
                        textStyle={styles.chipText}>
                        URGENT
                      </Chip>
                    )}
                  </View>
                </View>
              </View>
              <IconButton icon="chevron-right" size={24} />
            </View>

            {/* Customer Info */}
            <View style={styles.customerSection}>
              <View style={styles.customerRow}>
                <IconButton icon="account" size={20} style={styles.icon} />
                <Text style={styles.customerName}>{item.customer.name}</Text>
              </View>
              <View style={styles.customerRow}>
                <IconButton icon="map-marker" size={20} style={styles.icon} />
                <Text style={styles.areaText}>{item.customer.area}</Text>
              </View>
            </View>

            {/* Job Details */}
            <View style={styles.jobDetails}>
              <View style={styles.detailItem}>
                <IconButton icon="clock-outline" size={18} />
                <View>
                  <Text style={styles.detailLabel}>Time</Text>
                  <Text style={styles.detailValue}>{item.scheduledTime}</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <IconButton icon="map-marker-distance" size={18} />
                <View>
                  <Text style={styles.detailLabel}>Distance</Text>
                  <Text style={styles.detailValue}>{item.distance}</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <IconButton icon="package" size={18} />
                <View>
                  <Text style={styles.detailLabel}>Items</Text>
                  <Text style={styles.detailValue}>{item.itemCount}</Text>
                </View>
              </View>
            </View>

            {/* Cash Collection */}
            {item.cashToCollect && item.status !== 'delivered' && (
              <View style={styles.cashBanner}>
                <IconButton icon="cash" size={20} iconColor="#f57c00" />
                <Text style={styles.cashText}>
                  Collect: AED {item.cashToCollect.toFixed(2)}
                </Text>
              </View>
            )}

            {/* Quick Actions */}
            {item.status !== 'delivered' && item.status !== 'failed' && (
              <View style={styles.quickActions}>
                <Button
                  mode="outlined"
                  icon="phone"
                  onPress={() => {}}
                  style={styles.quickActionButton}
                  compact>
                  Call
                </Button>
                <Button
                  mode="outlined"
                  icon="navigation"
                  onPress={() => {}}
                  style={styles.quickActionButton}
                  compact>
                  Navigate
                </Button>
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
          <Text style={styles.headerTitle}>My Deliveries</Text>
          <Text style={styles.headerSubtitle}>
            {activeJobs} active job{activeJobs !== 1 ? 's' : ''}
          </Text>
        </View>
        <IconButton icon="refresh" iconColor="white" size={24} onPress={onRefresh} />
      </View>

      {/* Statistics Dashboard */}
      <View style={styles.statsCard}>
        <View style={styles.statsHeader}>
          <Text style={styles.statsTitle}>Today's Progress</Text>
          <Text style={styles.completionRate}>
            {completionRate.toFixed(0)}% Complete
          </Text>
        </View>
        <ProgressBar
          progress={completionRate / 100}
          color="#4caf50"
          style={styles.progressBar}
        />
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, {color: '#ff9800'}]}>
              {stats.assigned}
            </Text>
            <Text style={styles.statLabel}>Assigned</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, {color: '#2196f3'}]}>
              {stats.picked}
            </Text>
            <Text style={styles.statLabel}>Picked</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, {color: '#9c27b0'}]}>
              {stats.inTransit}
            </Text>
            <Text style={styles.statLabel}>In Transit</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, {color: '#4caf50'}]}>
              {stats.delivered}
            </Text>
            <Text style={styles.statLabel}>Delivered</Text>
          </View>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search deliveries..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor="#1976d2"
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <Chip
          selected={filterStatus === 'active'}
          onPress={() => setFilterStatus('active')}
          style={styles.filterChip}
          selectedColor="#1976d2">
          Active ({activeJobs})
        </Chip>
        <Chip
          selected={filterStatus === 'completed'}
          onPress={() => setFilterStatus('completed')}
          style={styles.filterChip}
          selectedColor="#4caf50">
          Completed ({stats.delivered})
        </Chip>
        <Chip
          selected={filterStatus === 'all'}
          onPress={() => setFilterStatus('all')}
          style={styles.filterChip}
          selectedColor="#666">
          All ({stats.total})
        </Chip>
      </View>

      {/* Jobs List */}
      <FlatList
        data={filteredJobs}
        keyExtractor={item => item.id}
        renderItem={renderJobCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconButton icon="truck-delivery" size={60} iconColor="#ccc" />
            <Text style={styles.emptyText}>No deliveries found</Text>
            <Text style={styles.emptySubtext}>
              {filterStatus === 'active'
                ? "You don't have any active deliveries"
                : 'No deliveries matching the filter'}
            </Text>
          </View>
        }
      />

      {/* FAB for route optimization */}
      {activeJobs > 1 && (
        <FAB
          icon="map-marker-path"
          label="Optimize Route"
          style={styles.fab}
          onPress={() => {}}
        />
      )}
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
  statsCard: {
    backgroundColor: 'white',
    margin: 15,
    padding: 15,
    borderRadius: 12,
    elevation: 2,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  completionRate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4caf50',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 11,
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
    paddingBottom: 80,
  },
  jobCard: {
    marginBottom: 15,
  },
  card: {
    borderRadius: 12,
    elevation: 2,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  jobHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  sequenceBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1976d2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sequenceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 6,
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  statusChip: {
    height: 24,
  },
  priorityChip: {
    height: 24,
    backgroundColor: '#f44336',
  },
  chipText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  customerSection: {
    marginBottom: 12,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: {
    margin: 0,
    marginRight: 8,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  areaText: {
    fontSize: 13,
    color: '#666',
  },
  jobDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  cashBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  cashText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#f57c00',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
  },
  quickActionButton: {
    flex: 1,
    borderColor: '#1976d2',
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
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#1976d2',
  },
});
