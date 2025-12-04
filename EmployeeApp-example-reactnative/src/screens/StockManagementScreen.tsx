import React, {useState} from 'react';
import {View, StyleSheet, FlatList, StatusBar, Alert} from 'react-native';
import {
  Text,
  Card,
  Searchbar,
  IconButton,
  FAB,
  Chip,
  Button,
  Dialog,
  Portal,
  TextInput,
  SegmentedButtons,
  Divider,
} from 'react-native-paper';

interface StockItem {
  id: string;
  sku: string;
  productName: string;
  category: string;
  currentStock: number;
  minStock: number;
  unit: string;
  lastUpdated: string;
  stockStatus: 'critical' | 'low' | 'good' | 'overstock';
}

interface StockTransaction {
  id: string;
  productId: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  timestamp: string;
  employee: string;
}

export default function StockManagementScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'alerts'>('list');
  const [adjustDialogVisible, setAdjustDialogVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<StockItem | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<'in' | 'out'>('in');
  const [adjustmentQuantity, setAdjustmentQuantity] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [loading, setLoading] = useState(false);

  const [stockItems, setStockItems] = useState<StockItem[]>([
    {
      id: '1',
      sku: 'MILK-001',
      productName: 'Fresh Milk - Full Cream',
      category: 'Dairy',
      currentStock: 150,
      minStock: 50,
      unit: '1L',
      lastUpdated: '2025-01-25 10:30 AM',
      stockStatus: 'good',
    },
    {
      id: '2',
      sku: 'BREAD-002',
      productName: 'Brown Bread - Whole Wheat',
      category: 'Bakery',
      currentStock: 8,
      minStock: 20,
      unit: '500g',
      lastUpdated: '2025-01-25 09:15 AM',
      stockStatus: 'critical',
    },
    {
      id: '3',
      sku: 'MEAT-101',
      productName: 'Chicken Breast - Fresh',
      category: 'Meat',
      currentStock: 0,
      minStock: 25,
      unit: '1kg',
      lastUpdated: '2025-01-24 05:20 PM',
      stockStatus: 'critical',
    },
    {
      id: '4',
      sku: 'JUICE-015',
      productName: 'Orange Juice - 100% Pure',
      category: 'Beverages',
      currentStock: 18,
      minStock: 30,
      unit: '1L',
      lastUpdated: '2025-01-25 08:00 AM',
      stockStatus: 'low',
    },
    {
      id: '5',
      sku: 'RICE-010',
      productName: 'Basmati Rice - Premium',
      category: 'Groceries',
      currentStock: 5,
      minStock: 15,
      unit: '5kg',
      lastUpdated: '2025-01-24 02:15 PM',
      stockStatus: 'critical',
    },
  ]);

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return '#d32f2f';
      case 'low':
        return '#ff9800';
      case 'good':
        return '#4caf50';
      case 'overstock':
        return '#2196f3';
      default:
        return '#666';
    }
  };

  const getStockStatusLabel = (item: StockItem) => {
    if (item.currentStock === 0) return 'Out of Stock';
    if (item.currentStock < item.minStock * 0.5) return 'Critical';
    if (item.currentStock < item.minStock) return 'Low Stock';
    if (item.currentStock > item.minStock * 3) return 'Overstock';
    return 'Good';
  };

  const filteredItems = stockItems.filter(item =>
    viewMode === 'alerts'
      ? item.stockStatus === 'critical' || item.stockStatus === 'low'
      : item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const stockStats = {
    critical: stockItems.filter(i => i.stockStatus === 'critical').length,
    low: stockItems.filter(i => i.stockStatus === 'low').length,
    good: stockItems.filter(i => i.stockStatus === 'good').length,
    total: stockItems.length,
  };

  const handleAdjustStock = (item: StockItem) => {
    setSelectedProduct(item);
    setAdjustDialogVisible(true);
    setAdjustmentQuantity('');
    setAdjustmentReason('');
  };

  const confirmAdjustment = () => {
    if (!adjustmentQuantity || parseInt(adjustmentQuantity) <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    if (!adjustmentReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for this adjustment');
      return;
    }

    const qty = parseInt(adjustmentQuantity);
    const newStock =
      adjustmentType === 'in'
        ? selectedProduct!.currentStock + qty
        : Math.max(0, selectedProduct!.currentStock - qty);

    // Update stock
    setStockItems(prev =>
      prev.map(item =>
        item.id === selectedProduct!.id
          ? {
              ...item,
              currentStock: newStock,
              stockStatus:
                newStock === 0
                  ? 'critical'
                  : newStock < item.minStock * 0.5
                  ? 'critical'
                  : newStock < item.minStock
                  ? 'low'
                  : 'good',
              lastUpdated: new Date().toLocaleString(),
            }
          : item,
      ),
    );

    Alert.alert(
      'Success',
      `Stock ${adjustmentType === 'in' ? 'increased' : 'decreased'} by ${qty} ${
        selectedProduct!.unit
      }`,
    );
    setAdjustDialogVisible(false);
  };

  const renderStockItem = ({item}: {item: StockItem}) => {
    const statusLabel = getStockStatusLabel(item);
    const statusColor = getStockStatusColor(item.stockStatus);

    return (
      <Card style={styles.stockCard}>
        <Card.Content>
          <View style={styles.stockHeader}>
            <View style={styles.stockInfo}>
              <Text variant="titleMedium" style={styles.productName}>
                {item.productName}
              </Text>
              <Text variant="bodySmall" style={styles.sku}>
                SKU: {item.sku} • {item.category}
              </Text>
            </View>
            <Chip
              mode="flat"
              textStyle={{color: statusColor, fontSize: 10, fontWeight: '600'}}
              style={[
                styles.statusChip,
                {backgroundColor: statusColor + '20'},
              ]}>
              {statusLabel}
            </Chip>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.stockDetails}>
            <View style={styles.stockRow}>
              <Text variant="bodySmall" style={styles.label}>
                Current Stock:
              </Text>
              <Text
                variant="titleMedium"
                style={[styles.stockValue, {color: statusColor}]}>
                {item.currentStock} {item.unit}
              </Text>
            </View>

            <View style={styles.stockRow}>
              <Text variant="bodySmall" style={styles.label}>
                Minimum Level:
              </Text>
              <Text variant="bodyMedium" style={styles.value}>
                {item.minStock} {item.unit}
              </Text>
            </View>

            <View style={styles.stockRow}>
              <Text variant="bodySmall" style={styles.label}>
                Stock Needed:
              </Text>
              <Text
                variant="bodyMedium"
                style={[
                  styles.value,
                  {
                    color:
                      item.currentStock < item.minStock ? '#d32f2f' : '#4caf50',
                  },
                ]}>
                {item.currentStock < item.minStock
                  ? `${item.minStock - item.currentStock} ${item.unit}`
                  : 'Adequate'}
              </Text>
            </View>
          </View>

          <Text variant="bodySmall" style={styles.lastUpdated}>
            Last updated: {item.lastUpdated}
          </Text>

          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              onPress={() => handleAdjustStock(item)}
              icon="package-variant-closed-plus"
              style={styles.stockButton}>
              Adjust Stock
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1976d2" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Stock Management</Text>
        <IconButton
          icon="clipboard-text"
          iconColor="white"
          size={24}
          onPress={() =>
            Alert.alert('Stock Report', 'Generate stock report...')
          }
        />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search products..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      {/* View Mode Toggle */}
      <View style={styles.viewModeContainer}>
        <SegmentedButtons
          value={viewMode}
          onValueChange={value => setViewMode(value as 'list' | 'alerts')}
          buttons={[
            {
              value: 'list',
              label: 'All Products',
              icon: 'format-list-bulleted',
            },
            {
              value: 'alerts',
              label: `Alerts (${stockStats.critical + stockStats.low})`,
              icon: 'alert',
            },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      {/* Stock Statistics */}
      <View style={styles.statsContainer}>
        <View style={[styles.statBox, {backgroundColor: '#ffebee'}]}>
          <Text variant="titleLarge" style={[styles.statNumber, {color: '#d32f2f'}]}>
            {stockStats.critical}
          </Text>
          <Text variant="bodySmall" style={styles.statLabel}>
            Critical
          </Text>
        </View>
        <View style={[styles.statBox, {backgroundColor: '#fff3e0'}]}>
          <Text variant="titleLarge" style={[styles.statNumber, {color: '#ff9800'}]}>
            {stockStats.low}
          </Text>
          <Text variant="bodySmall" style={styles.statLabel}>
            Low Stock
          </Text>
        </View>
        <View style={[styles.statBox, {backgroundColor: '#e8f5e9'}]}>
          <Text variant="titleLarge" style={[styles.statNumber, {color: '#4caf50'}]}>
            {stockStats.good}
          </Text>
          <Text variant="bodySmall" style={styles.statLabel}>
            Good
          </Text>
        </View>
      </View>

      {/* Stock List */}
      <FlatList
        data={filteredItems}
        renderItem={renderStockItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
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
              {viewMode === 'alerts'
                ? 'No Stock Alerts'
                : 'No Products Found'}
            </Text>
            <Text variant="bodyMedium" style={styles.emptyText}>
              {viewMode === 'alerts'
                ? 'All products have adequate stock levels'
                : 'Try adjusting your search'}
            </Text>
          </View>
        }
      />

      {/* Adjustment Dialog */}
      <Portal>
        <Dialog
          visible={adjustDialogVisible}
          onDismiss={() => setAdjustDialogVisible(false)}>
          <Dialog.Title>Adjust Stock</Dialog.Title>
          <Dialog.Content>
            {selectedProduct && (
              <>
                <Text variant="bodyMedium" style={styles.dialogProductName}>
                  {selectedProduct.productName}
                </Text>
                <Text variant="bodySmall" style={styles.dialogCurrentStock}>
                  Current Stock: {selectedProduct.currentStock}{' '}
                  {selectedProduct.unit}
                </Text>

                <SegmentedButtons
                  value={adjustmentType}
                  onValueChange={value => setAdjustmentType(value as 'in' | 'out')}
                  buttons={[
                    {value: 'in', label: 'Stock In', icon: 'plus'},
                    {value: 'out', label: 'Stock Out', icon: 'minus'},
                  ]}
                  style={styles.adjustmentTypeButtons}
                />

                <TextInput
                  label="Quantity"
                  value={adjustmentQuantity}
                  onChangeText={setAdjustmentQuantity}
                  mode="outlined"
                  keyboardType="number-pad"
                  style={styles.dialogInput}
                  placeholder={`Enter quantity in ${selectedProduct.unit}`}
                />

                <TextInput
                  label="Reason"
                  value={adjustmentReason}
                  onChangeText={setAdjustmentReason}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  style={styles.dialogInput}
                  placeholder="e.g., Damaged goods, New delivery, Sales return"
                />
              </>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAdjustDialogVisible(false)}>
              Cancel
            </Button>
            <Button onPress={confirmAdjustment}>Confirm</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* FAB */}
      <FAB
        icon="file-download"
        style={styles.fab}
        onPress={() => Alert.alert('Export', 'Export stock data...')}
        label="Export"
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
    backgroundColor: '#1976d2',
  },
  searchBar: {
    elevation: 2,
  },
  viewModeContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'white',
  },
  segmentedButtons: {
    backgroundColor: '#f0f4f8',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
  },
  statBox: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  statNumber: {
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#666',
    marginTop: 4,
  },
  listContent: {
    padding: 20,
  },
  stockCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  stockInfo: {
    flex: 1,
  },
  productName: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sku: {
    color: '#666',
  },
  statusChip: {
    height: 24,
  },
  divider: {
    marginVertical: 12,
  },
  stockDetails: {
    gap: 8,
    marginBottom: 12,
  },
  stockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: '#666',
  },
  value: {
    color: '#333',
    fontWeight: '500',
  },
  stockValue: {
    fontWeight: 'bold',
  },
  lastUpdated: {
    color: '#999',
    fontSize: 11,
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  stockButton: {
    flex: 1,
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
  dialogProductName: {
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 5,
  },
  dialogCurrentStock: {
    color: '#666',
    marginBottom: 15,
  },
  adjustmentTypeButtons: {
    marginBottom: 15,
  },
  dialogInput: {
    marginBottom: 15,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#1976d2',
  },
});
