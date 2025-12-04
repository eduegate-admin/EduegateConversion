import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import {
  Text,
  Card,
  Searchbar,
  IconButton,
  Button,
  Portal,
  Dialog,
  TextInput,
  Divider,
  Chip,
  Badge,
  FAB,
} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  stockQuantity: number;
  image?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  discount: number;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  loyaltyPoints?: number;
}

export default function POSScreen() {
  const navigation = useNavigation();

  // Product data
  const [products] = useState<Product[]>([
    {
      id: '1',
      sku: 'MILK-001',
      name: 'Fresh Milk - Full Cream',
      category: 'Dairy',
      price: 12.5,
      stockQuantity: 150,
    },
    {
      id: '2',
      sku: 'BREAD-001',
      name: 'White Bread - Sliced',
      category: 'Bakery',
      price: 5.0,
      stockQuantity: 80,
    },
    {
      id: '3',
      sku: 'EGGS-001',
      name: 'Fresh Eggs - 12 Pack',
      category: 'Dairy',
      price: 18.0,
      stockQuantity: 60,
    },
    {
      id: '4',
      sku: 'RICE-001',
      name: 'Basmati Rice - 5kg',
      category: 'Grocery',
      price: 45.0,
      stockQuantity: 120,
    },
    {
      id: '5',
      sku: 'CHICKEN-001',
      name: 'Fresh Chicken Breast - 1kg',
      category: 'Meat',
      price: 35.0,
      stockQuantity: 40,
    },
    {
      id: '6',
      sku: 'WATER-001',
      name: 'Mineral Water - 1.5L',
      category: 'Beverages',
      price: 2.5,
      stockQuantity: 200,
    },
    {
      id: '7',
      sku: 'TOMATO-001',
      name: 'Fresh Tomatoes - 1kg',
      category: 'Vegetables',
      price: 8.0,
      stockQuantity: 90,
    },
    {
      id: '8',
      sku: 'YOGURT-001',
      name: 'Greek Yogurt - 500g',
      category: 'Dairy',
      price: 15.0,
      stockQuantity: 70,
    },
  ]);

  const categories = ['All', 'Dairy', 'Bakery', 'Grocery', 'Meat', 'Beverages', 'Vegetables'];

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [showDiscountDialog, setShowDiscountDialog] = useState(false);
  const [showQuantityDialog, setShowQuantityDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [discountInput, setDiscountInput] = useState('');

  // Filtered products
  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Cart calculations
  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const cartDiscount = (cartSubtotal * discountPercent) / 100;
  const cartTax = (cartSubtotal - cartDiscount) * 0.05; // 5% VAT
  const cartTotal = cartSubtotal - cartDiscount + cartTax;
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Add to cart
  const handleAddToCart = (product: Product) => {
    setSelectedProduct(product);
    setQuantity('1');
    setShowQuantityDialog(true);
  };

  const confirmAddToCart = () => {
    if (!selectedProduct) return;

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid quantity');
      return;
    }

    if (qty > selectedProduct.stockQuantity) {
      Alert.alert(
        'Insufficient Stock',
        `Only ${selectedProduct.stockQuantity} units available`,
      );
      return;
    }

    const existingItem = cart.find(item => item.product.id === selectedProduct.id);
    if (existingItem) {
      setCart(prev =>
        prev.map(item =>
          item.product.id === selectedProduct.id
            ? {...item, quantity: item.quantity + qty}
            : item,
        ),
      );
    } else {
      setCart(prev => [
        ...prev,
        {product: selectedProduct, quantity: qty, discount: 0},
      ]);
    }

    setShowQuantityDialog(false);
    setSelectedProduct(null);
  };

  // Update cart item quantity
  const updateCartItemQuantity = (productId: string, delta: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.product.stockQuantity) {
              Alert.alert(
                'Insufficient Stock',
                `Only ${item.product.stockQuantity} units available`,
              );
              return item;
            }
            return {...item, quantity: newQty};
          }
          return item;
        })
        .filter(item => item !== null) as CartItem[],
    );
  };

  // Remove from cart
  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  // Apply discount
  const applyDiscount = () => {
    const discount = parseFloat(discountInput);
    if (isNaN(discount) || discount < 0 || discount > 100) {
      Alert.alert('Invalid Discount', 'Please enter a valid discount (0-100%)');
      return;
    }
    setDiscountPercent(discount);
    setShowDiscountDialog(false);
    setDiscountInput('');
  };

  // Clear cart
  const clearCart = () => {
    Alert.alert('Clear Cart', 'Are you sure you want to clear the cart?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          setCart([]);
          setDiscountPercent(0);
          setSelectedCustomer(null);
        },
      },
    ]);
  };

  // Proceed to payment
  const proceedToPayment = () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to cart before proceeding');
      return;
    }

    // Navigate to payment screen (will be implemented next)
    Alert.alert(
      'Proceed to Payment',
      `Total Amount: AED ${cartTotal.toFixed(2)}\n\nPayment screen will be implemented next.`,
      [
        {text: 'OK'},
      ],
    );
  };

  // Scan barcode
  const handleScanBarcode = () => {
    Alert.alert('Barcode Scanner', 'Barcode scanner will open here');
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
          <Text style={styles.headerTitle}>Point of Sale</Text>
          <Text style={styles.headerSubtitle}>Quick Checkout</Text>
        </View>
        <IconButton
          icon="barcode-scan"
          iconColor="white"
          size={24}
          onPress={handleScanBarcode}
        />
      </View>

      <View style={styles.content}>
        {/* Left Panel - Products */}
        <View style={styles.leftPanel}>
          {/* Search */}
          <Searchbar
            placeholder="Search products..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor="#1976d2"
          />

          {/* Category Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}>
            {categories.map(cat => (
              <Chip
                key={cat}
                selected={selectedCategory === cat}
                onPress={() => setSelectedCategory(cat)}
                style={styles.categoryChip}
                selectedColor="#1976d2">
                {cat}
              </Chip>
            ))}
          </ScrollView>

          {/* Products Grid */}
          <FlatList
            data={filteredProducts}
            keyExtractor={item => item.id}
            numColumns={2}
            contentContainerStyle={styles.productsGrid}
            showsVerticalScrollIndicator={false}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.productCard}
                onPress={() => handleAddToCart(item)}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.productSku}>{item.sku}</Text>
                  <Text style={styles.productPrice}>AED {item.price.toFixed(2)}</Text>
                  <View style={styles.stockBadge}>
                    <Text style={styles.stockText}>Stock: {item.stockQuantity}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Right Panel - Cart */}
        <View style={styles.rightPanel}>
          <Card style={styles.cartCard}>
            {/* Customer Section */}
            <View style={styles.customerSection}>
              {selectedCustomer ? (
                <View style={styles.customerInfo}>
                  <View style={styles.customerDetails}>
                    <Text style={styles.customerName}>{selectedCustomer.name}</Text>
                    <Text style={styles.customerPhone}>{selectedCustomer.phone}</Text>
                  </View>
                  <IconButton
                    icon="close"
                    size={20}
                    onPress={() => setSelectedCustomer(null)}
                  />
                </View>
              ) : (
                <Button
                  mode="outlined"
                  icon="account-plus"
                  onPress={() => setShowCustomerDialog(true)}
                  style={styles.addCustomerButton}>
                  Add Customer (Optional)
                </Button>
              )}
            </View>

            <Divider />

            {/* Cart Header */}
            <View style={styles.cartHeader}>
              <Text style={styles.cartTitle}>
                Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
              </Text>
              {cart.length > 0 && (
                <IconButton
                  icon="delete-outline"
                  size={20}
                  onPress={clearCart}
                />
              )}
            </View>

            {/* Cart Items */}
            {cart.length === 0 ? (
              <View style={styles.emptyCart}>
                <Text style={styles.emptyCartText}>Cart is empty</Text>
                <Text style={styles.emptyCartSubtext}>
                  Scan or select products to add
                </Text>
              </View>
            ) : (
              <ScrollView style={styles.cartItems}>
                {cart.map(item => (
                  <View key={item.product.id} style={styles.cartItem}>
                    <View style={styles.cartItemInfo}>
                      <Text style={styles.cartItemName} numberOfLines={1}>
                        {item.product.name}
                      </Text>
                      <Text style={styles.cartItemPrice}>
                        AED {item.product.price.toFixed(2)}
                      </Text>
                    </View>

                    <View style={styles.cartItemActions}>
                      <IconButton
                        icon="minus"
                        size={18}
                        onPress={() => updateCartItemQuantity(item.product.id, -1)}
                        style={styles.quantityButton}
                      />
                      <Text style={styles.cartItemQuantity}>{item.quantity}</Text>
                      <IconButton
                        icon="plus"
                        size={18}
                        onPress={() => updateCartItemQuantity(item.product.id, 1)}
                        style={styles.quantityButton}
                      />
                      <IconButton
                        icon="delete"
                        size={18}
                        onPress={() => removeFromCart(item.product.id)}
                        iconColor="#d32f2f"
                      />
                    </View>

                    <Text style={styles.cartItemTotal}>
                      AED {(item.product.price * item.quantity).toFixed(2)}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            )}

            {cart.length > 0 && (
              <>
                <Divider />

                {/* Discount Button */}
                <TouchableOpacity
                  style={styles.discountButton}
                  onPress={() => setShowDiscountDialog(true)}>
                  <Text style={styles.discountButtonText}>
                    {discountPercent > 0
                      ? `Discount Applied: ${discountPercent}%`
                      : 'Apply Discount'}
                  </Text>
                  <IconButton icon="percent" size={20} />
                </TouchableOpacity>

                <Divider />

                {/* Cart Summary */}
                <View style={styles.cartSummary}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal:</Text>
                    <Text style={styles.summaryValue}>
                      AED {cartSubtotal.toFixed(2)}
                    </Text>
                  </View>

                  {discountPercent > 0 && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>
                        Discount ({discountPercent}%):
                      </Text>
                      <Text style={[styles.summaryValue, styles.discountValue]}>
                        -AED {cartDiscount.toFixed(2)}
                      </Text>
                    </View>
                  )}

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>VAT (5%):</Text>
                    <Text style={styles.summaryValue}>
                      AED {cartTax.toFixed(2)}
                    </Text>
                  </View>

                  <Divider style={styles.summaryDivider} />

                  <View style={styles.summaryRow}>
                    <Text style={styles.totalLabel}>Total:</Text>
                    <Text style={styles.totalValue}>
                      AED {cartTotal.toFixed(2)}
                    </Text>
                  </View>
                </View>

                {/* Checkout Button */}
                <Button
                  mode="contained"
                  onPress={proceedToPayment}
                  style={styles.checkoutButton}
                  contentStyle={styles.checkoutButtonContent}
                  labelStyle={styles.checkoutButtonLabel}>
                  Proceed to Payment
                </Button>
              </>
            )}
          </Card>
        </View>
      </View>

      {/* Customer Dialog */}
      <Portal>
        <Dialog
          visible={showCustomerDialog}
          onDismiss={() => setShowCustomerDialog(false)}>
          <Dialog.Title>Select Customer</Dialog.Title>
          <Dialog.Content>
            <Text>Customer selection will be implemented here</Text>
            <Text style={styles.dialogNote}>
              You can search by phone, name, or customer ID
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowCustomerDialog(false)}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Quantity Dialog */}
      <Portal>
        <Dialog
          visible={showQuantityDialog}
          onDismiss={() => setShowQuantityDialog(false)}>
          <Dialog.Title>Add to Cart</Dialog.Title>
          <Dialog.Content>
            {selectedProduct && (
              <>
                <Text style={styles.dialogProductName}>{selectedProduct.name}</Text>
                <Text style={styles.dialogProductPrice}>
                  AED {selectedProduct.price.toFixed(2)}
                </Text>
                <TextInput
                  label="Quantity"
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="number-pad"
                  mode="outlined"
                  style={styles.dialogInput}
                />
                <Text style={styles.dialogStock}>
                  Available: {selectedProduct.stockQuantity} units
                </Text>
              </>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowQuantityDialog(false)}>Cancel</Button>
            <Button onPress={confirmAddToCart}>Add</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Discount Dialog */}
      <Portal>
        <Dialog
          visible={showDiscountDialog}
          onDismiss={() => setShowDiscountDialog(false)}>
          <Dialog.Title>Apply Discount</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Discount Percentage"
              value={discountInput}
              onChangeText={setDiscountInput}
              keyboardType="decimal-pad"
              mode="outlined"
              style={styles.dialogInput}
              right={<TextInput.Affix text="%" />}
            />
            <Text style={styles.dialogNote}>Enter discount between 0-100%</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDiscountDialog(false)}>Cancel</Button>
            <Button onPress={applyDiscount}>Apply</Button>
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
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    padding: 15,
    gap: 15,
  },
  leftPanel: {
    flex: 2,
  },
  rightPanel: {
    flex: 1,
    minWidth: 300,
  },
  searchBar: {
    marginBottom: 15,
    backgroundColor: 'white',
  },
  categoryScroll: {
    marginBottom: 15,
    maxHeight: 50,
  },
  categoryChip: {
    marginRight: 8,
  },
  productsGrid: {
    paddingBottom: 20,
  },
  productCard: {
    flex: 1,
    backgroundColor: 'white',
    margin: 5,
    borderRadius: 8,
    padding: 12,
    elevation: 2,
    maxWidth: '48%',
  },
  productInfo: {
    gap: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    minHeight: 36,
  },
  productSku: {
    fontSize: 11,
    color: '#999',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginTop: 4,
  },
  stockBadge: {
    marginTop: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    backgroundColor: '#e8f5e9',
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  stockText: {
    fontSize: 10,
    color: '#4caf50',
    fontWeight: '600',
  },
  cartCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 3,
  },
  customerSection: {
    padding: 15,
  },
  customerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  customerPhone: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  addCustomerButton: {
    borderColor: '#1976d2',
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  cartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyCartText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
  emptyCartSubtext: {
    fontSize: 12,
    color: '#bbb',
    marginTop: 5,
  },
  cartItems: {
    flex: 1,
    paddingHorizontal: 15,
    maxHeight: 300,
  },
  cartItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cartItemInfo: {
    marginBottom: 8,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  cartItemPrice: {
    fontSize: 12,
    color: '#666',
  },
  cartItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  quantityButton: {
    margin: 0,
    backgroundColor: '#f0f0f0',
  },
  cartItemQuantity: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'center',
  },
  cartItemTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1976d2',
    textAlign: 'right',
    marginTop: 5,
  },
  discountButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  discountButtonText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '500',
  },
  cartSummary: {
    padding: 15,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  discountValue: {
    color: '#4caf50',
  },
  summaryDivider: {
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  checkoutButton: {
    margin: 15,
    marginTop: 10,
    backgroundColor: '#4caf50',
  },
  checkoutButtonContent: {
    paddingVertical: 8,
  },
  checkoutButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dialogProductName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  dialogProductPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 15,
  },
  dialogInput: {
    marginBottom: 10,
  },
  dialogStock: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  dialogNote: {
    fontSize: 12,
    color: '#999',
    marginTop: 10,
    fontStyle: 'italic',
  },
});
