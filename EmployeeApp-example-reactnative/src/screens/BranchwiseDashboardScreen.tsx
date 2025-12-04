import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Card,
  IconButton,
  Button,
  SegmentedButtons,
  Chip,
  Divider,
  Portal,
  Dialog,
} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

interface BranchData {
  id: string;
  name: string;
  location: string;
  stats: {
    todaySales: number;
    todayOrders: number;
    activeEmployees: number;
    pendingOrders: number;
    lowStockItems: number;
  };
  salesData: {
    daily: number[];
    weekly: number[];
    monthly: number[];
  };
  topProducts: Array<{
    name: string;
    sales: number;
    quantity: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: 'sale' | 'order' | 'stock' | 'employee';
    description: string;
    time: string;
  }>;
}

export default function BranchwiseDashboardScreen() {
  const navigation = useNavigation();

  // Mock data
  const [branches] = useState([
    {id: '1', name: 'Main Branch', location: 'Downtown Dubai'},
    {id: '2', name: 'Branch 2', location: 'Jumeirah'},
    {id: '3', name: 'Branch 3', location: 'Marina'},
  ]);

  const [selectedBranch, setSelectedBranch] = useState(branches[0]);
  const [timePeriod, setTimePeriod] = useState<'today' | 'week' | 'month'>(
    'today',
  );
  const [showBranchDialog, setShowBranchDialog] = useState(false);

  const branchData: BranchData = {
    id: '1',
    name: 'Main Branch',
    location: 'Downtown Dubai',
    stats: {
      todaySales: 12450.75,
      todayOrders: 87,
      activeEmployees: 12,
      pendingOrders: 15,
      lowStockItems: 8,
    },
    salesData: {
      daily: [2100, 2450, 1980, 2750, 2340, 2890, 2650],
      weekly: [15400, 17800, 16200, 18900],
      monthly: [65400, 72100, 68900, 75200, 71800, 78900],
    },
    topProducts: [
      {name: 'Fresh Milk - Full Cream', sales: 1250.0, quantity: 100},
      {name: 'White Bread - Sliced', sales: 950.0, quantity: 190},
      {name: 'Fresh Eggs - 12 Pack', sales: 890.0, quantity: 65},
      {name: 'Basmati Rice - 5kg', sales: 780.0, quantity: 45},
      {name: 'Chicken Breast - 1kg', sales: 650.0, quantity: 32},
    ],
    recentActivity: [
      {
        id: '1',
        type: 'sale',
        description: 'New sale completed - AED 245.50',
        time: '2 min ago',
      },
      {
        id: '2',
        type: 'order',
        description: 'Order #ORD-001 marked as delivered',
        time: '8 min ago',
      },
      {
        id: '3',
        type: 'stock',
        description: 'Low stock alert: Fresh Milk',
        time: '15 min ago',
      },
      {
        id: '4',
        type: 'employee',
        description: 'Ahmed started shift',
        time: '1 hour ago',
      },
      {
        id: '5',
        type: 'order',
        description: 'New order received #ORD-002',
        time: '1 hour ago',
      },
    ],
  };

  // Get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sale':
        return {icon: 'cash-register', color: '#4caf50'};
      case 'order':
        return {icon: 'package-variant', color: '#2196f3'};
      case 'stock':
        return {icon: 'alert', color: '#ff9800'};
      case 'employee':
        return {icon: 'account', color: '#9c27b0'};
      default:
        return {icon: 'information', color: '#666'};
    }
  };

  // Calculate comparison data
  const compareData = {
    salesChange: '+12.5%',
    ordersChange: '+8.3%',
    isPositive: true,
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
        <TouchableOpacity
          style={styles.headerContent}
          onPress={() => setShowBranchDialog(true)}>
          <Text style={styles.headerTitle}>{selectedBranch.name}</Text>
          <View style={styles.headerSubtitleRow}>
            <Text style={styles.headerSubtitle}>{selectedBranch.location}</Text>
            <IconButton
              icon="chevron-down"
              iconColor="white"
              size={20}
              style={styles.dropdownIcon}
            />
          </View>
        </TouchableOpacity>
        <IconButton icon="refresh" iconColor="white" size={24} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Time Period Selector */}
        <View style={styles.periodSelector}>
          <SegmentedButtons
            value={timePeriod}
            onValueChange={value => setTimePeriod(value as any)}
            buttons={[
              {value: 'today', label: 'Today'},
              {value: 'week', label: 'Week'},
              {value: 'month', label: 'Month'},
            ]}
            style={styles.segmentedButtons}
          />
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          <Card style={styles.metricCard}>
            <Card.Content style={styles.metricContent}>
              <IconButton
                icon="currency-usd"
                size={28}
                iconColor="#4caf50"
                style={styles.metricIcon}
              />
              <Text style={styles.metricValue}>
                AED {branchData.stats.todaySales.toLocaleString()}
              </Text>
              <Text style={styles.metricLabel}>Total Sales</Text>
              <Chip
                style={styles.changeChip}
                textStyle={styles.changeText}
                icon="trending-up">
                {compareData.salesChange}
              </Chip>
            </Card.Content>
          </Card>

          <Card style={styles.metricCard}>
            <Card.Content style={styles.metricContent}>
              <IconButton
                icon="package-variant"
                size={28}
                iconColor="#2196f3"
                style={styles.metricIcon}
              />
              <Text style={styles.metricValue}>{branchData.stats.todayOrders}</Text>
              <Text style={styles.metricLabel}>Orders</Text>
              <Chip
                style={styles.changeChip}
                textStyle={styles.changeText}
                icon="trending-up">
                {compareData.ordersChange}
              </Chip>
            </Card.Content>
          </Card>

          <Card style={styles.metricCard}>
            <Card.Content style={styles.metricContent}>
              <IconButton
                icon="account-multiple"
                size={28}
                iconColor="#9c27b0"
                style={styles.metricIcon}
              />
              <Text style={styles.metricValue}>
                {branchData.stats.activeEmployees}
              </Text>
              <Text style={styles.metricLabel}>Active Staff</Text>
            </Card.Content>
          </Card>

          <Card style={styles.metricCard}>
            <Card.Content style={styles.metricContent}>
              <IconButton
                icon="clock-alert"
                size={28}
                iconColor="#ff9800"
                style={styles.metricIcon}
              />
              <Text style={styles.metricValue}>
                {branchData.stats.pendingOrders}
              </Text>
              <Text style={styles.metricLabel}>Pending</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Quick Stats */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Quick Overview
            </Text>

            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <IconButton
                  icon="cart"
                  size={24}
                  iconColor="#4caf50"
                  style={styles.statIcon}
                />
                <View style={styles.statInfo}>
                  <Text style={styles.statValue}>
                    AED {(branchData.stats.todaySales / branchData.stats.todayOrders).toFixed(2)}
                  </Text>
                  <Text style={styles.statLabel}>Avg. Order Value</Text>
                </View>
              </View>

              <View style={styles.statItem}>
                <IconButton
                  icon="chart-line"
                  size={24}
                  iconColor="#2196f3"
                  style={styles.statIcon}
                />
                <View style={styles.statInfo}>
                  <Text style={styles.statValue}>
                    {((branchData.stats.todayOrders - branchData.stats.pendingOrders) /
                      branchData.stats.todayOrders * 100).toFixed(0)}%
                  </Text>
                  <Text style={styles.statLabel}>Completion Rate</Text>
                </View>
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.alertRow}>
              <IconButton icon="alert-circle" size={20} iconColor="#ff9800" />
              <Text style={styles.alertText}>
                {branchData.stats.lowStockItems} items are running low on stock
              </Text>
              <Button mode="text" compact>
                View
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Top Selling Products */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Top Products
              </Text>
              <Button mode="text" compact>
                View All
              </Button>
            </View>

            {branchData.topProducts.map((product, index) => (
              <View key={index} style={styles.productRow}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>#{index + 1}</Text>
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productQty}>{product.quantity} sold</Text>
                </View>
                <Text style={styles.productSales}>
                  AED {product.sales.toFixed(0)}
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Sales Chart Placeholder */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Sales Trend
            </Text>
            <View style={styles.chartPlaceholder}>
              <IconButton icon="chart-bar" size={48} iconColor="#ccc" />
              <Text style={styles.chartPlaceholderText}>
                Chart visualization will be displayed here
              </Text>
              <Text style={styles.chartNote}>
                {timePeriod === 'today'
                  ? 'Last 7 days'
                  : timePeriod === 'week'
                  ? 'Last 4 weeks'
                  : 'Last 6 months'}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Recent Activity */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Recent Activity
              </Text>
              <Button mode="text" compact>
                View All
              </Button>
            </View>

            {branchData.recentActivity.map(activity => {
              const activityInfo = getActivityIcon(activity.type);
              return (
                <View key={activity.id} style={styles.activityRow}>
                  <IconButton
                    icon={activityInfo.icon}
                    size={24}
                    iconColor={activityInfo.color}
                    style={styles.activityIcon}
                  />
                  <View style={styles.activityContent}>
                    <Text style={styles.activityDescription}>
                      {activity.description}
                    </Text>
                    <Text style={styles.activityTime}>{activity.time}</Text>
                  </View>
                </View>
              );
            })}
          </Card.Content>
        </Card>

        {/* Employee Performance */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Employee Performance
              </Text>
              <Button mode="text" compact>
                Details
              </Button>
            </View>

            <View style={styles.employeeRow}>
              <View style={styles.employeeItem}>
                <IconButton icon="trophy" size={24} iconColor="#FFD700" />
                <View>
                  <Text style={styles.employeeName}>Ahmed Ali</Text>
                  <Text style={styles.employeeMetric}>45 orders today</Text>
                </View>
              </View>
              <Chip style={styles.topPerformerChip} textStyle={styles.topPerformerText}>
                Top Performer
              </Chip>
            </View>

            <View style={styles.employeeRow}>
              <View style={styles.employeeItem}>
                <IconButton icon="medal" size={24} iconColor="#C0C0C0" />
                <View>
                  <Text style={styles.employeeName}>Fatima Hassan</Text>
                  <Text style={styles.employeeMetric}>38 orders today</Text>
                </View>
              </View>
            </View>

            <View style={styles.employeeRow}>
              <View style={styles.employeeItem}>
                <IconButton icon="medal" size={24} iconColor="#CD7F32" />
                <View>
                  <Text style={styles.employeeName}>Mohammed Khalid</Text>
                  <Text style={styles.employeeMetric}>32 orders today</Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <Button
            mode="contained"
            icon="file-document"
            onPress={() => {}}
            style={styles.actionButton}>
            Generate Report
          </Button>
          <Button
            mode="outlined"
            icon="chart-box"
            onPress={() => {}}
            style={styles.actionButton}>
            Detailed Analytics
          </Button>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Branch Selection Dialog */}
      <Portal>
        <Dialog
          visible={showBranchDialog}
          onDismiss={() => setShowBranchDialog(false)}>
          <Dialog.Title>Select Branch</Dialog.Title>
          <Dialog.Content>
            {branches.map(branch => (
              <TouchableOpacity
                key={branch.id}
                style={styles.branchOption}
                onPress={() => {
                  setSelectedBranch(branch);
                  setShowBranchDialog(false);
                }}>
                <View style={styles.branchInfo}>
                  <Text style={styles.branchName}>{branch.name}</Text>
                  <Text style={styles.branchLocation}>{branch.location}</Text>
                </View>
                {selectedBranch.id === branch.id && (
                  <IconButton icon="check" size={24} iconColor="#1976d2" />
                )}
              </TouchableOpacity>
            ))}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowBranchDialog(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  headerSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  dropdownIcon: {
    margin: 0,
    marginLeft: -8,
  },
  scrollView: {
    flex: 1,
  },
  periodSelector: {
    padding: 15,
  },
  segmentedButtons: {
    backgroundColor: 'white',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    gap: 10,
  },
  metricCard: {
    width: (screenWidth - 40) / 2,
    borderRadius: 12,
    elevation: 2,
  },
  metricContent: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  metricIcon: {
    margin: 0,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  changeChip: {
    backgroundColor: '#e8f5e9',
    marginTop: 8,
    height: 24,
  },
  changeText: {
    fontSize: 11,
    color: '#4caf50',
    fontWeight: '600',
  },
  card: {
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    color: '#1976d2',
    fontWeight: 'bold',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  statRow: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 10,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
  },
  statIcon: {
    margin: 0,
    marginRight: 8,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  divider: {
    marginVertical: 15,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff8e1',
    padding: 10,
    borderRadius: 8,
  },
  alertText: {
    flex: 1,
    fontSize: 13,
    color: '#f57c00',
    marginLeft: 8,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1976d2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  productQty: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  productSales: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  chartPlaceholder: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginTop: 10,
  },
  chartPlaceholderText: {
    fontSize: 13,
    color: '#999',
    marginTop: 10,
  },
  chartNote: {
    fontSize: 11,
    color: '#bbb',
    marginTop: 5,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityIcon: {
    margin: 0,
    marginRight: 10,
  },
  activityContent: {
    flex: 1,
  },
  activityDescription: {
    fontSize: 13,
    color: '#333',
  },
  activityTime: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  employeeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  employeeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  employeeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  employeeMetric: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  topPerformerChip: {
    backgroundColor: '#fff3e0',
    height: 24,
  },
  topPerformerText: {
    fontSize: 10,
    color: '#f57c00',
    fontWeight: '600',
  },
  actionSection: {
    paddingHorizontal: 15,
    marginTop: 15,
    gap: 10,
  },
  actionButton: {
    paddingVertical: 4,
  },
  bottomSpacing: {
    height: 30,
  },
  branchOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  branchInfo: {
    flex: 1,
  },
  branchName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  branchLocation: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
});
