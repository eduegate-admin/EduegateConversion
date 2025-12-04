import React, {useState} from 'react';
import {View, StyleSheet, FlatList, StatusBar, TouchableOpacity, Image, Alert} from 'react-native';
import {
  Text,
  Card,
  Searchbar,
  Chip,
  IconButton,
  FAB,
  Menu,
  Divider,
  Badge,
} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  stockQuantity: number;
  unit: string;
  imageUrl?: string;
  barcode: string;
  status: 'active' | 'inactive' | 'out_of_stock';
  brand?: string;
  lastUpdated: string;
}

export default function ProductManagementScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      sku: 'MILK-001',
      name: 'Fresh Milk - Full Cream',
      category: 'Dairy',
      price: 12.50,
      stockQuantity: 150,
      unit: '1L',
      barcode: '1234567890123',
      status: 'active',
      brand: 'Al Ain',
      lastUpdated: '2025-01-25 10:30 AM',
    },
    {
      id: '2',
      sku: 'BREAD-002',
      name: 'Brown Bread - Whole Wheat',
      category: 'Bakery',
      price: 8.00,
      stockQuantity: 85,
      unit: '500g',
      barcode: '1234567890124',
      status: 'active',
      brand: 'Modern Bakery',
      lastUpdated: '2025-01-25 09:15 AM',
    },
    {
      id: '3',
      sku: 'MEAT-101',
      name: 'Chicken Breast - Fresh',
      category: 'Meat',
      price: 35.00,
      stockQuantity: 0,
      unit: '1kg',
      barcode: '1234567890125',
      status: 'out_of_stock',
      brand: 'Fresh Farms',
      lastUpdated: '2025-01-24 05:20 PM',
    },
    {
      id: '4',
      sku: 'JUICE-015',
      name: 'Orange Juice - 100% Pure',
      category: 'Beverages',
      price: 15.50,
      stockQuantity: 120,
      unit: '1L',
      barcode: '1234567890126',
      status: 'active',
      brand: 'Tropicana',
      lastUpdated: '2025-01-25 08:00 AM',
    },
    {
      id: '5',
      sku: 'VEG-025',
      name: 'Fresh Vegetables Mix',
      category: 'Vegetables',
      price: 18.00,
      stockQuantity: 45,
      unit: '1kg',
      barcode: '1234567890127',
      status: 'active',
      lastUpdated: '2025-01-25 07:30 AM',
    },
    {
      id: '6',
      sku: 'RICE-010',
      name: 'Basmati Rice - Premium',
      category: 'Groceries',
      price: 28.00,
      stockQuantity: 5,
      unit: '5kg',
      barcode: '1234567890128',
      status: 'active',
      brand: 'India Gate',
      lastUpdated: '2025-01-24 02:15 PM',
    },
  ]);

  const categories = ['all', 'Dairy', 'Bakery', 'Meat', 'Beverages', 'Vegetables', 'Groceries'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#4caf50';
      case 'out_of_stock':
        return '#d32f2f';
      case 'inactive':
        return '#9e9e9e';
      default:
        return '#666';
    }
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return {label: 'Out of Stock', color: '#d32f2f'};
    if (quantity < 10) return {label: 'Low Stock', color: '#ff9800'};
    return {label: 'In Stock', color: '#4caf50'};
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.barcode.includes(searchQuery);
    const matchesCategory =
      filterCategory === 'all' || product.category === filterCategory;
    const matchesStatus =
      filterStatus === 'all' || product.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleEditProduct = (productId: string) => {
    navigation.navigate('ProductEdit' as never, {productId} as never);
  };

  const handleScanBarcode = () => {
    Alert.alert('Barcode Scanner', 'Barcode scanner will be opened here');
  };

  const handleBulkImport = () => {
    Alert.alert('Bulk Import', 'CSV/Excel import functionality');
  };

  const renderProductCard = ({item}: {item: Product}) => {
    const stockStatus = getStockStatus(item.stockQuantity);

    return (
      <TouchableOpacity onPress={() => handleEditProduct(item.id)}>
        <Card style={styles.productCard}>
          <Card.Content>
            <View style={styles.productHeader}>
              <View style={styles.productInfo}>
                <Text variant="titleMedium" style={styles.productName}>
                  {item.name}
                </Text>
                <Text variant="bodySmall" style={styles.sku}>
                  SKU: {item.sku}
                </Text>
                {item.brand && (
                  <Text variant="bodySmall" style={styles.brand}>
                    Brand: {item.brand}
                  </Text>
                )}
              </View>
              <View style={styles.productImage}>
                <Text style={styles.imagePlaceholder}>📦</Text>
              </View>
            </View>

            <View style={styles.productDetails}>
              <View style={styles.detailRow}>
                <Text variant="bodySmall" style={styles.detailLabel}>
                  Category:
                </Text>
                <Chip compact mode="flat" style={styles.categoryChip}>
                  {item.category}
                </Chip>
              </View>

              <View style={styles.detailRow}>
                <Text variant="bodySmall" style={styles.detailLabel}>
                  Price:
                </Text>
                <Text variant="titleMedium" style={styles.price}>
                  AED {item.price.toFixed(2)}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text variant="bodySmall" style={styles.detailLabel}>
                  Stock:
                </Text>
                <View style={styles.stockInfo}>
                  <Text
                    variant="bodyMedium"
                    style={[styles.stockQuantity, {color: stockStatus.color}]}>
                    {item.stockQuantity} {item.unit}
                  </Text>
                  <Chip
                    compact
                    mode="flat"
                    textStyle={{color: stockStatus.color, fontSize: 10}}
                    style={[
                      styles.stockChip,
                      {backgroundColor: stockStatus.color + '20'},
                    ]}>
                    {stockStatus.label}
                  </Chip>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text variant="bodySmall" style={styles.detailLabel}>
                  Barcode:
                </Text>
                <Text variant="bodySmall" style={styles.barcode}>
                  {item.barcode}
                </Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.productFooter}>
              <Text variant="bodySmall" style={styles.lastUpdated}>
                Updated: {item.lastUpdated}
              </Text>
              <Chip
                mode="flat"
                textStyle={{
                  color: getStatusColor(item.status),
                  fontSize: 10,
                  fontWeight: '600',
                }}
                style={[
                  styles.statusChip,
                  {backgroundColor: getStatusColor(item.status) + '20'},
                ]}>
                {item.status.toUpperCase().replace('_', ' ')}
              </Chip>
            </View>
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
        <Text style={styles.headerTitle}>Products</Text>
        <View style={styles.headerActions}>
          <IconButton
            icon="barcode-scan"
            iconColor="white"
            size={24}
            onPress={handleScanBarcode}
          />
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <IconButton
                icon="dots-vertical"
                iconColor="white"
                size={24}
                onPress={() => setMenuVisible(true)}
              />
            }>
            <Menu.Item
              onPress={handleBulkImport}
              title="Bulk Import"
              leadingIcon="file-import"
            />
            <Menu.Item
              onPress={() => {}}
              title="Export Products"
              leadingIcon="file-export"
            />
            <Divider />
            <Menu.Item
              onPress={() => {}}
              title="Categories"
              leadingIcon="tag-multiple"
            />
            <Menu.Item
              onPress={() => {}}
              title="Low Stock Report"
              leadingIcon="alert"
            />
          </Menu>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search by name, SKU, or barcode..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      {/* Category Filter */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={item => item}
          renderItem={({item}) => (
            <Chip
              selected={filterCategory === item}
              onPress={() => setFilterCategory(item)}
              style={styles.filterChip}
              showSelectedCheck={false}>
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </Chip>
          )}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* Status Filter */}
      <View style={styles.statusFilterContainer}>
        <Chip
          selected={filterStatus === 'all'}
          onPress={() => setFilterStatus('all')}
          style={styles.statusFilterChip}
          showSelectedCheck={false}>
          All
        </Chip>
        <Chip
          selected={filterStatus === 'active'}
          onPress={() => setFilterStatus('active')}
          style={styles.statusFilterChip}
          showSelectedCheck={false}>
          Active
        </Chip>
        <Chip
          selected={filterStatus === 'out_of_stock'}
          onPress={() => setFilterStatus('out_of_stock')}
          style={styles.statusFilterChip}
          showSelectedCheck={false}>
          Out of Stock
        </Chip>
      </View>

      {/* Products List */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProductCard}
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
              No Products Found
            </Text>
            <Text variant="bodyMedium" style={styles.emptyText}>
              Try adjusting your search or filters
            </Text>
          </View>
        }
        ListHeaderComponent={
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text variant="titleLarge" style={styles.statNumber}>
                {products.length}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Total Products
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text
                variant="titleLarge"
                style={[styles.statNumber, {color: '#4caf50'}]}>
                {products.filter(p => p.status === 'active').length}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Active
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text
                variant="titleLarge"
                style={[styles.statNumber, {color: '#ff9800'}]}>
                {products.filter(p => p.stockQuantity < 10 && p.stockQuantity > 0).length}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Low Stock
              </Text>
            </View>
          </View>
        }
      />

      {/* FAB for Add Product */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => handleEditProduct('new')}
        label="Add Product"
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
  statusFilterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'white',
    gap: 8,
  },
  statusFilterChip: {
    flex: 1,
  },
  listContent: {
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  statNumber: {
    fontWeight: 'bold',
    color: '#1976d2',
  },
  statLabel: {
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  productCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sku: {
    color: '#666',
    marginBottom: 2,
  },
  brand: {
    color: '#999',
    fontSize: 11,
  },
  productImage: {
    width: 60,
    height: 60,
    backgroundColor: '#f0f4f8',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  imagePlaceholder: {
    fontSize: 32,
  },
  productDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    color: '#666',
  },
  categoryChip: {
    height: 24,
    backgroundColor: '#e3f2fd',
  },
  price: {
    fontWeight: 'bold',
    color: '#1976d2',
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stockQuantity: {
    fontWeight: '600',
  },
  stockChip: {
    height: 20,
  },
  barcode: {
    color: '#666',
    fontFamily: 'monospace',
  },
  divider: {
    marginVertical: 12,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastUpdated: {
    color: '#999',
  },
  statusChip: {
    height: 24,
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
