import React, {useState, useEffect} from 'react';
import {View, StyleSheet, ScrollView, StatusBar, Alert} from 'react-native';
import {
  Text,
  Card,
  IconButton,
  Chip,
  Button,
  Divider,
  List,
  Menu,
  Dialog,
  Portal,
  TextInput,
  DataTable,
  ProgressBar,
} from 'react-native-paper';
import {useNavigation, useRoute} from '@react-navigation/native';

interface OrderItem {
  id: string;
  productName: string;
  sku: string;
  quantity: number;
  price: number;
  totalPrice: number;
  imageUrl?: string;
  status: 'available' | 'out_of_stock' | 'substituted';
  substitution?: {
    originalProduct: string;
    newProduct: string;
    reason: string;
  };
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: 'new' | 'pending' | 'processing' | 'completed' | 'cancelled';
  customer: {
    name: string;
    phone: string;
    email: string;
  };
  deliveryAddress: {
    street: string;
    area: string;
    city: string;
    landmark?: string;
  };
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  orderDate: string;
  deliveryDate: string;
  deliverySlot: string;
  branch: string;
  assignedEmployee?: string;
  items: OrderItem[];
  pricing: {
    subtotal: number;
    deliveryCharge: number;
    discount: number;
    tax: number;
    total: number;
  };
  timeline: {
    timestamp: string;
    status: string;
    description: string;
    employee?: string;
  }[];
  notes?: string;
  priority: 'high' | 'medium' | 'low';
}

export default function OrderDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const orderId = (route.params as any)?.orderId;

  const [menuVisible, setMenuVisible] = useState(false);
  const [statusDialogVisible, setStatusDialogVisible] = useState(false);
  const [commentDialogVisible, setCommentDialogVisible] = useState(false);
  const [comment, setComment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const [order, setOrder] = useState<OrderDetail>({
    id: '1',
    orderNumber: 'ORD-12345',
    status: 'processing',
    customer: {
      name: 'Ahmed Mohammed',
      phone: '+971 50 123 4567',
      email: 'ahmed.mohammed@email.com',
    },
    deliveryAddress: {
      street: 'Al Wasl Road, Villa 234',
      area: 'Jumeirah',
      city: 'Dubai',
      landmark: 'Near Mercato Mall',
    },
    paymentMethod: 'Cash on Delivery',
    paymentStatus: 'pending',
    orderDate: '2025-01-25 10:30 AM',
    deliveryDate: '2025-01-26',
    deliverySlot: '10:00 AM - 12:00 PM',
    branch: 'Main Branch - Dubai',
    assignedEmployee: 'EMP001 - John Doe',
    items: [
      {
        id: '1',
        productName: 'Fresh Milk - Full Cream',
        sku: 'MILK-001',
        quantity: 2,
        price: 12.50,
        totalPrice: 25.00,
        status: 'available',
      },
      {
        id: '2',
        productName: 'Brown Bread - Whole Wheat',
        sku: 'BREAD-002',
        quantity: 3,
        price: 8.00,
        totalPrice: 24.00,
        status: 'available',
      },
      {
        id: '3',
        productName: 'Chicken Breast - 1kg',
        sku: 'MEAT-101',
        quantity: 1,
        price: 35.00,
        totalPrice: 35.00,
        status: 'out_of_stock',
      },
      {
        id: '4',
        productName: 'Orange Juice - 1L',
        sku: 'JUICE-015',
        quantity: 4,
        price: 15.50,
        totalPrice: 62.00,
        status: 'substituted',
        substitution: {
          originalProduct: 'Orange Juice - Brand A',
          newProduct: 'Orange Juice - Brand B',
          reason: 'Original product out of stock',
        },
      },
      {
        id: '5',
        productName: 'Fresh Vegetables Mix',
        sku: 'VEG-025',
        quantity: 2,
        price: 18.00,
        totalPrice: 36.00,
        status: 'available',
      },
    ],
    pricing: {
      subtotal: 182.00,
      deliveryCharge: 15.00,
      discount: 10.00,
      tax: 8.55,
      total: 195.55,
    },
    timeline: [
      {
        timestamp: '2025-01-25 10:30 AM',
        status: 'Order Placed',
        description: 'Order received from customer',
      },
      {
        timestamp: '2025-01-25 10:45 AM',
        status: 'Order Confirmed',
        description: 'Order confirmed and assigned to employee',
        employee: 'John Doe',
      },
      {
        timestamp: '2025-01-25 11:15 AM',
        status: 'Processing',
        description: 'Items being picked and packed',
        employee: 'John Doe',
      },
    ],
    notes: 'Please deliver before 11 AM. Ring doorbell twice.',
    priority: 'high',
  });

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

  const getItemStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return '#4caf50';
      case 'out_of_stock':
        return '#d32f2f';
      case 'substituted':
        return '#ff9800';
      default:
        return '#666';
    }
  };

  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus);
    setStatusDialogVisible(true);
  };

  const confirmStatusChange = () => {
    Alert.alert('Success', `Order status updated to ${selectedStatus}`);
    setOrder(prev => ({...prev, status: selectedStatus as any}));
    setStatusDialogVisible(false);
    setMenuVisible(false);
  };

  const handleAddComment = () => {
    if (!comment.trim()) return;
    Alert.alert('Success', 'Comment added successfully');
    setComment('');
    setCommentDialogVisible(false);
  };

  const handleCallCustomer = () => {
    Alert.alert('Call Customer', `Calling ${order.customer.phone}...`);
  };

  const handlePrintInvoice = () => {
    Alert.alert('Print Invoice', 'Invoice is being generated...');
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
          <Text style={styles.headerTitle}>{order.orderNumber}</Text>
          <Text style={styles.headerSubtitle}>{order.customer.name}</Text>
        </View>
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
            onPress={handlePrintInvoice}
            title="Print Invoice"
            leadingIcon="printer"
          />
          <Menu.Item
            onPress={() => {}}
            title="Share Order"
            leadingIcon="share-variant"
          />
          <Divider />
          <Menu.Item
            onPress={() => handleStatusChange('completed')}
            title="Mark as Completed"
            leadingIcon="check-circle"
          />
          <Menu.Item
            onPress={() => handleStatusChange('cancelled')}
            title="Cancel Order"
            leadingIcon="close-circle"
            titleStyle={{color: '#d32f2f'}}
          />
        </Menu>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.statusHeader}>
              <View>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Order Status
                </Text>
                <Text variant="bodySmall" style={styles.orderDate}>
                  {order.orderDate}
                </Text>
              </View>
              <Chip
                mode="flat"
                textStyle={{
                  color: getStatusColor(order.status),
                  fontWeight: 'bold',
                }}
                style={[
                  styles.statusChip,
                  {backgroundColor: getStatusColor(order.status) + '20'},
                ]}>
                {order.status.toUpperCase()}
              </Chip>
            </View>

            <ProgressBar
              progress={order.status === 'completed' ? 1 : 0.6}
              color={getStatusColor(order.status)}
              style={styles.progressBar}
            />

            <View style={styles.priorityRow}>
              <Text variant="bodySmall" style={styles.priorityLabel}>
                Priority:
              </Text>
              <Chip
                compact
                mode="flat"
                style={[
                  styles.priorityChip,
                  {
                    backgroundColor:
                      order.priority === 'high'
                        ? '#ffebee'
                        : order.priority === 'medium'
                        ? '#fff3e0'
                        : '#e8f5e9',
                  },
                ]}>
                {order.priority.toUpperCase()}
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* Customer Information */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Customer Information
              </Text>
              <IconButton
                icon="phone"
                size={20}
                iconColor="#1976d2"
                onPress={handleCallCustomer}
                style={styles.actionIcon}
              />
            </View>

            <List.Item
              title={order.customer.name}
              description="Customer Name"
              left={props => <List.Icon {...props} icon="account" />}
              style={styles.listItem}
            />
            <List.Item
              title={order.customer.phone}
              description="Phone Number"
              left={props => <List.Icon {...props} icon="phone" />}
              style={styles.listItem}
            />
            <List.Item
              title={order.customer.email}
              description="Email Address"
              left={props => <List.Icon {...props} icon="email" />}
              style={styles.listItem}
            />
          </Card.Content>
        </Card>

        {/* Delivery Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Delivery Information
            </Text>

            <View style={styles.infoRow}>
              <Text variant="bodySmall" style={styles.infoLabel}>
                📍 Address:
              </Text>
              <Text variant="bodyMedium" style={styles.infoValue}>
                {order.deliveryAddress.street}
                {'\n'}
                {order.deliveryAddress.area}, {order.deliveryAddress.city}
                {order.deliveryAddress.landmark &&
                  `\n${order.deliveryAddress.landmark}`}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text variant="bodySmall" style={styles.infoLabel}>
                📅 Date:
              </Text>
              <Text variant="bodyMedium" style={styles.infoValue}>
                {order.deliveryDate}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text variant="bodySmall" style={styles.infoLabel}>
                ⏰ Time Slot:
              </Text>
              <Text variant="bodyMedium" style={styles.infoValue}>
                {order.deliverySlot}
              </Text>
            </View>

            {order.notes && (
              <View style={styles.notesContainer}>
                <Text variant="bodySmall" style={styles.notesLabel}>
                  📝 Delivery Notes:
                </Text>
                <Text variant="bodyMedium" style={styles.notesText}>
                  {order.notes}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Order Items */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Order Items ({order.items.length})
            </Text>

            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Product</DataTable.Title>
                <DataTable.Title numeric>Qty</DataTable.Title>
                <DataTable.Title numeric>Price</DataTable.Title>
                <DataTable.Title numeric>Total</DataTable.Title>
              </DataTable.Header>

              {order.items.map(item => (
                <View key={item.id}>
                  <DataTable.Row>
                    <DataTable.Cell>
                      <View>
                        <Text variant="bodyMedium" style={styles.productName}>
                          {item.productName}
                        </Text>
                        <Text variant="bodySmall" style={styles.sku}>
                          SKU: {item.sku}
                        </Text>
                        <Chip
                          compact
                          mode="flat"
                          textStyle={styles.itemStatusText}
                          style={[
                            styles.itemStatusChip,
                            {
                              backgroundColor:
                                getItemStatusColor(item.status) + '20',
                            },
                          ]}>
                          {item.status.replace('_', ' ').toUpperCase()}
                        </Chip>
                      </View>
                    </DataTable.Cell>
                    <DataTable.Cell numeric>{item.quantity}</DataTable.Cell>
                    <DataTable.Cell numeric>
                      AED {item.price.toFixed(2)}
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                      <Text style={styles.itemTotal}>
                        AED {item.totalPrice.toFixed(2)}
                      </Text>
                    </DataTable.Cell>
                  </DataTable.Row>

                  {item.substitution && (
                    <View style={styles.substitutionNote}>
                      <Text variant="bodySmall" style={styles.substitutionText}>
                        ⚠️ Substituted: {item.substitution.newProduct}
                        {'\n'}
                        Reason: {item.substitution.reason}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </DataTable>
          </Card.Content>
        </Card>

        {/* Pricing Summary */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Payment Summary
            </Text>

            <View style={styles.pricingRow}>
              <Text variant="bodyMedium">Subtotal:</Text>
              <Text variant="bodyMedium">
                AED {order.pricing.subtotal.toFixed(2)}
              </Text>
            </View>

            <View style={styles.pricingRow}>
              <Text variant="bodyMedium">Delivery Charge:</Text>
              <Text variant="bodyMedium">
                AED {order.pricing.deliveryCharge.toFixed(2)}
              </Text>
            </View>

            {order.pricing.discount > 0 && (
              <View style={styles.pricingRow}>
                <Text variant="bodyMedium" style={{color: '#4caf50'}}>
                  Discount:
                </Text>
                <Text variant="bodyMedium" style={{color: '#4caf50'}}>
                  - AED {order.pricing.discount.toFixed(2)}
                </Text>
              </View>
            )}

            <View style={styles.pricingRow}>
              <Text variant="bodyMedium">Tax (5%):</Text>
              <Text variant="bodyMedium">
                AED {order.pricing.tax.toFixed(2)}
              </Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.totalRow}>
              <Text variant="titleLarge" style={styles.totalLabel}>
                Total:
              </Text>
              <Text variant="titleLarge" style={styles.totalValue}>
                AED {order.pricing.total.toFixed(2)}
              </Text>
            </View>

            <View style={styles.paymentMethodRow}>
              <Text variant="bodySmall" style={styles.paymentLabel}>
                Payment Method:
              </Text>
              <Chip compact mode="flat" style={styles.paymentChip}>
                {order.paymentMethod}
              </Chip>
            </View>

            <View style={styles.paymentStatusRow}>
              <Text variant="bodySmall" style={styles.paymentLabel}>
                Payment Status:
              </Text>
              <Chip
                compact
                mode="flat"
                textStyle={{
                  color:
                    order.paymentStatus === 'paid' ? '#4caf50' : '#ff9800',
                }}
                style={{
                  backgroundColor:
                    order.paymentStatus === 'paid' ? '#e8f5e9' : '#fff3e0',
                }}>
                {order.paymentStatus.toUpperCase()}
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* Order Timeline */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Order Timeline
            </Text>

            {order.timeline.map((event, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <Text variant="titleSmall" style={styles.timelineStatus}>
                    {event.status}
                  </Text>
                  <Text variant="bodySmall" style={styles.timelineDescription}>
                    {event.description}
                  </Text>
                  {event.employee && (
                    <Text variant="bodySmall" style={styles.timelineEmployee}>
                      By: {event.employee}
                    </Text>
                  )}
                  <Text variant="bodySmall" style={styles.timelineTimestamp}>
                    {event.timestamp}
                  </Text>
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Branch & Employee Info */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Assignment Details
            </Text>

            <List.Item
              title={order.branch}
              description="Branch"
              left={props => <List.Icon {...props} icon="store" />}
              style={styles.listItem}
            />
            {order.assignedEmployee && (
              <List.Item
                title={order.assignedEmployee}
                description="Assigned Employee"
                left={props => <List.Icon {...props} icon="account-tie" />}
                style={styles.listItem}
              />
            )}
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={() => setCommentDialogVisible(true)}
            icon="comment-plus"
            style={styles.actionButton}>
            Add Comment
          </Button>

          <Button
            mode="contained"
            onPress={() => handleStatusChange('completed')}
            icon="check"
            style={styles.actionButton}>
            Mark as Completed
          </Button>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Status Change Dialog */}
      <Portal>
        <Dialog
          visible={statusDialogVisible}
          onDismiss={() => setStatusDialogVisible(false)}>
          <Dialog.Title>Confirm Status Change</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to change the order status to "
              {selectedStatus}"?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setStatusDialogVisible(false)}>Cancel</Button>
            <Button onPress={confirmStatusChange}>Confirm</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Comment Dialog */}
        <Dialog
          visible={commentDialogVisible}
          onDismiss={() => setCommentDialogVisible(false)}>
          <Dialog.Title>Add Comment</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Comment"
              value={comment}
              onChangeText={setComment}
              mode="outlined"
              multiline
              numberOfLines={4}
              placeholder="Enter your comment here..."
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setCommentDialogVisible(false)}>
              Cancel
            </Button>
            <Button onPress={handleAddComment}>Add</Button>
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
  scrollView: {
    flex: 1,
  },
  card: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#1976d2',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  orderDate: {
    color: '#666',
    marginTop: 4,
  },
  statusChip: {
    height: 32,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 15,
  },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityLabel: {
    color: '#666',
    marginRight: 8,
  },
  priorityChip: {
    height: 24,
  },
  listItem: {
    paddingLeft: 0,
  },
  actionIcon: {
    margin: 0,
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    color: '#333',
    lineHeight: 20,
  },
  notesContainer: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#fff3e0',
    borderRadius: 8,
  },
  notesLabel: {
    color: '#e65100',
    marginBottom: 4,
    fontWeight: '600',
  },
  notesText: {
    color: '#666',
    lineHeight: 20,
  },
  productName: {
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  sku: {
    color: '#999',
    fontSize: 11,
    marginBottom: 4,
  },
  itemStatusChip: {
    height: 20,
    marginTop: 4,
  },
  itemStatusText: {
    fontSize: 9,
  },
  itemTotal: {
    fontWeight: '600',
    color: '#1976d2',
  },
  substitutionNote: {
    backgroundColor: '#fff3e0',
    padding: 10,
    marginTop: -8,
    marginBottom: 8,
    borderRadius: 4,
  },
  substitutionText: {
    color: '#e65100',
    lineHeight: 18,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  divider: {
    marginVertical: 15,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  totalLabel: {
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontWeight: 'bold',
    color: '#1976d2',
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  paymentStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  paymentLabel: {
    color: '#666',
    marginRight: 8,
  },
  paymentChip: {
    height: 24,
    backgroundColor: '#e3f2fd',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1976d2',
    marginTop: 4,
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
  },
  timelineStatus: {
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  timelineDescription: {
    color: '#666',
    marginBottom: 2,
  },
  timelineEmployee: {
    color: '#1976d2',
    fontSize: 11,
    marginBottom: 2,
  },
  timelineTimestamp: {
    color: '#999',
    fontSize: 11,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 20,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
  },
  bottomSpacing: {
    height: 30,
  },
});
