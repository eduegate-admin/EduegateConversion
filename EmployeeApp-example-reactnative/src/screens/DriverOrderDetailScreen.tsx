import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  StatusBar,
  Linking,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Card,
  IconButton,
  Button,
  Portal,
  Dialog,
  TextInput,
  Divider,
  Chip,
} from 'react-native-paper';
import {useNavigation, useRoute} from '@react-navigation/native';

interface DeliveryOrder {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    address: string;
    coordinates: {lat: number; lng: number};
  };
  status: 'assigned' | 'picked' | 'in-transit' | 'delivered' | 'failed';
  pickupLocation: {
    name: string;
    address: string;
    coordinates: {lat: number; lng: number};
  };
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    unit: string;
  }>;
  deliveryInstructions?: string;
  estimatedDeliveryTime: string;
  distance: string;
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'online';
  cashToCollect?: number;
}

export default function DriverOrderDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  // Mock data
  const [order] = useState<DeliveryOrder>({
    id: '1',
    orderNumber: 'ORD-2024-001',
    customer: {
      name: 'Ahmed Al Mansoori',
      phone: '+971 50 123 4567',
      address: 'Villa 23, Street 15, Al Nahda, Dubai',
      coordinates: {lat: 25.2854, lng: 55.3786},
    },
    status: 'assigned',
    pickupLocation: {
      name: 'Main Warehouse',
      address: 'Al Quoz Industrial Area 3, Dubai',
      coordinates: {lat: 25.1372, lng: 55.2285},
    },
    items: [
      {id: '1', name: 'Fresh Milk - Full Cream', quantity: 2, unit: '1L'},
      {id: '2', name: 'White Bread - Sliced', quantity: 1, unit: 'loaf'},
      {id: '3', name: 'Fresh Eggs', quantity: 3, unit: '12 pack'},
      {id: '4', name: 'Basmati Rice', quantity: 1, unit: '5kg'},
    ],
    deliveryInstructions: 'Ring the doorbell twice. Leave at door if no answer.',
    estimatedDeliveryTime: '12:00 PM',
    distance: '8.5 km',
    totalAmount: 245.5,
    paymentMethod: 'cash',
    cashToCollect: 245.5,
  });

  // State
  const [currentStatus, setCurrentStatus] = useState(order.status);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showProofDialog, setShowProofDialog] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [showNotesDialog, setShowNotesDialog] = useState(false);

  // Get status info
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'assigned':
        return {color: '#ff9800', label: 'Assigned', icon: 'clipboard-check'};
      case 'picked':
        return {color: '#2196f3', label: 'Picked Up', icon: 'package-variant'};
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

  const statusInfo = getStatusInfo(currentStatus);

  // Handle status update
  const handleStatusUpdate = (newStatus: string) => {
    setCurrentStatus(newStatus as any);
    setShowStatusDialog(false);
    Alert.alert('Success', `Order status updated to: ${getStatusInfo(newStatus).label}`);
  };

  // Call customer
  const handleCallCustomer = () => {
    Linking.openURL(`tel:${order.customer.phone}`);
  };

  // Open maps for navigation
  const handleNavigate = () => {
    const {lat, lng} = order.customer.coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    Linking.openURL(url);
  };

  // Open maps for pickup location
  const handleNavigateToPickup = () => {
    const {lat, lng} = order.pickupLocation.coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    Linking.openURL(url);
  };

  // Complete delivery
  const handleCompleteDelivery = () => {
    setShowProofDialog(true);
  };

  // Submit proof of delivery
  const handleSubmitProof = () => {
    setShowProofDialog(false);
    handleStatusUpdate('delivered');
  };

  // Report issue
  const handleReportIssue = () => {
    Alert.alert(
      'Report Issue',
      'Select issue type:',
      [
        {text: 'Customer Not Available', onPress: () => {}},
        {text: 'Wrong Address', onPress: () => {}},
        {text: 'Customer Refused', onPress: () => {}},
        {text: 'Other', onPress: () => {}},
        {text: 'Cancel', style: 'cancel'},
      ],
    );
  };

  // Render action buttons based on status
  const renderActionButtons = () => {
    switch (currentStatus) {
      case 'assigned':
        return (
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              icon="package-variant-closed"
              onPress={() => handleStatusUpdate('picked')}
              style={styles.primaryButton}
              contentStyle={styles.buttonContent}>
              Mark as Picked Up
            </Button>
            <Button
              mode="outlined"
              icon="map-marker"
              onPress={handleNavigateToPickup}
              style={styles.secondaryButton}>
              Navigate to Pickup
            </Button>
          </View>
        );
      case 'picked':
        return (
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              icon="truck-delivery"
              onPress={() => handleStatusUpdate('in-transit')}
              style={styles.primaryButton}
              contentStyle={styles.buttonContent}>
              Start Delivery
            </Button>
            <Button
              mode="outlined"
              icon="map-marker"
              onPress={handleNavigate}
              style={styles.secondaryButton}>
              Navigate to Customer
            </Button>
          </View>
        );
      case 'in-transit':
        return (
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              icon="check-circle"
              onPress={handleCompleteDelivery}
              style={[styles.primaryButton, styles.completeButton]}
              contentStyle={styles.buttonContent}>
              Complete Delivery
            </Button>
            <View style={styles.secondaryActions}>
              <Button
                mode="outlined"
                icon="phone"
                onPress={handleCallCustomer}
                style={styles.halfButton}>
                Call
              </Button>
              <Button
                mode="outlined"
                icon="alert"
                onPress={handleReportIssue}
                style={styles.halfButton}>
                Issue
              </Button>
            </View>
          </View>
        );
      case 'delivered':
        return (
          <View style={styles.actionButtons}>
            <View style={styles.deliveredBanner}>
              <IconButton icon="check-circle" size={24} iconColor="#4caf50" />
              <Text style={styles.deliveredText}>Delivery Completed</Text>
            </View>
          </View>
        );
      default:
        return null;
    }
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
          <Text style={styles.headerSubtitle}>Delivery Details</Text>
        </View>
        <IconButton
          icon="phone"
          iconColor="white"
          size={24}
          onPress={handleCallCustomer}
        />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.statusHeader}>
              <View style={styles.statusInfo}>
                <IconButton
                  icon={statusInfo.icon}
                  size={32}
                  iconColor={statusInfo.color}
                  style={styles.statusIcon}
                />
                <View>
                  <Text style={styles.statusLabel}>Current Status</Text>
                  <Text style={[styles.statusValue, {color: statusInfo.color}]}>
                    {statusInfo.label}
                  </Text>
                </View>
              </View>
              {currentStatus !== 'delivered' && (
                <Button
                  mode="outlined"
                  onPress={() => setShowStatusDialog(true)}
                  compact>
                  Update
                </Button>
              )}
            </View>

            <View style={styles.deliveryMetrics}>
              <View style={styles.metricItem}>
                <IconButton icon="clock-outline" size={20} />
                <View>
                  <Text style={styles.metricLabel}>ETA</Text>
                  <Text style={styles.metricValue}>
                    {order.estimatedDeliveryTime}
                  </Text>
                </View>
              </View>
              <View style={styles.metricItem}>
                <IconButton icon="map-marker-distance" size={20} />
                <View>
                  <Text style={styles.metricLabel}>Distance</Text>
                  <Text style={styles.metricValue}>{order.distance}</Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Customer Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Customer Information
            </Text>

            <View style={styles.infoRow}>
              <IconButton icon="account" size={24} style={styles.infoIcon} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Name</Text>
                <Text style={styles.infoValue}>{order.customer.name}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <IconButton icon="phone" size={24} style={styles.infoIcon} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{order.customer.phone}</Text>
              </View>
              <Button
                mode="contained"
                icon="phone"
                onPress={handleCallCustomer}
                compact
                style={styles.callButton}>
                Call
              </Button>
            </View>

            <View style={styles.infoRow}>
              <IconButton icon="map-marker" size={24} style={styles.infoIcon} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Delivery Address</Text>
                <Text style={styles.infoValue}>{order.customer.address}</Text>
              </View>
              <Button
                mode="outlined"
                icon="navigation"
                onPress={handleNavigate}
                compact
                style={styles.navButton}>
                Navigate
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Pickup Location */}
        {currentStatus === 'assigned' && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Pickup Location
              </Text>

              <View style={styles.infoRow}>
                <IconButton icon="warehouse" size={24} style={styles.infoIcon} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{order.pickupLocation.name}</Text>
                  <Text style={styles.infoValue}>
                    {order.pickupLocation.address}
                  </Text>
                </View>
                <Button
                  mode="outlined"
                  icon="navigation"
                  onPress={handleNavigateToPickup}
                  compact
                  style={styles.navButton}>
                  Navigate
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Delivery Instructions */}
        {order.deliveryInstructions && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.instructionsHeader}>
                <IconButton icon="information" size={24} />
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Delivery Instructions
                </Text>
              </View>
              <Text style={styles.instructionsText}>
                {order.deliveryInstructions}
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Order Items */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Order Items ({order.items.length})
            </Text>

            {order.items.map(item => (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemUnit}>{item.unit}</Text>
                </View>
                <Text style={styles.itemQuantity}>x{item.quantity}</Text>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Payment Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Payment Information
            </Text>

            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Total Amount:</Text>
              <Text style={styles.paymentValue}>
                AED {order.totalAmount.toFixed(2)}
              </Text>
            </View>

            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Payment Method:</Text>
              <Chip style={styles.paymentChip}>
                {order.paymentMethod.toUpperCase()}
              </Chip>
            </View>

            {order.paymentMethod === 'cash' && order.cashToCollect && (
              <View style={styles.cashToCollectBox}>
                <IconButton icon="cash" size={24} />
                <View style={styles.cashInfo}>
                  <Text style={styles.cashLabel}>Cash to Collect:</Text>
                  <Text style={styles.cashAmount}>
                    AED {order.cashToCollect.toFixed(2)}
                  </Text>
                </View>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Driver Notes */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.notesHeader}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Delivery Notes
              </Text>
              <Button
                mode="outlined"
                icon="pencil"
                onPress={() => setShowNotesDialog(true)}
                compact>
                {deliveryNotes ? 'Edit' : 'Add'}
              </Button>
            </View>
            {deliveryNotes ? (
              <Text style={styles.notesText}>{deliveryNotes}</Text>
            ) : (
              <Text style={styles.noNotesText}>No notes added</Text>
            )}
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        {renderActionButtons()}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Status Update Dialog */}
      <Portal>
        <Dialog
          visible={showStatusDialog}
          onDismiss={() => setShowStatusDialog(false)}>
          <Dialog.Title>Update Order Status</Dialog.Title>
          <Dialog.Content>
            {currentStatus === 'assigned' && (
              <Button
                mode="contained"
                onPress={() => handleStatusUpdate('picked')}
                style={styles.dialogButton}>
                Mark as Picked Up
              </Button>
            )}
            {currentStatus === 'picked' && (
              <Button
                mode="contained"
                onPress={() => handleStatusUpdate('in-transit')}
                style={styles.dialogButton}>
                Start Delivery (In Transit)
              </Button>
            )}
            {currentStatus === 'in-transit' && (
              <>
                <Button
                  mode="contained"
                  onPress={handleCompleteDelivery}
                  style={styles.dialogButton}>
                  Mark as Delivered
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => handleStatusUpdate('failed')}
                  style={styles.dialogButton}>
                  Mark as Failed
                </Button>
              </>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowStatusDialog(false)}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Proof of Delivery Dialog */}
      <Portal>
        <Dialog
          visible={showProofDialog}
          onDismiss={() => setShowProofDialog(false)}>
          <Dialog.Title>Proof of Delivery</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.proofText}>
              Please capture proof of delivery:
            </Text>
            <Button
              mode="outlined"
              icon="camera"
              onPress={() => {}}
              style={styles.dialogButton}>
              Take Photo
            </Button>
            <Button
              mode="outlined"
              icon="file-signature"
              onPress={() => {}}
              style={styles.dialogButton}>
              Get Signature
            </Button>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowProofDialog(false)}>Cancel</Button>
            <Button onPress={handleSubmitProof}>Skip & Complete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Notes Dialog */}
      <Portal>
        <Dialog
          visible={showNotesDialog}
          onDismiss={() => setShowNotesDialog(false)}>
          <Dialog.Title>Delivery Notes</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Add notes"
              value={deliveryNotes}
              onChangeText={setDeliveryNotes}
              multiline
              numberOfLines={4}
              mode="outlined"
              placeholder="Enter any delivery notes or issues..."
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowNotesDialog(false)}>Cancel</Button>
            <Button onPress={() => setShowNotesDialog(false)}>Save</Button>
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
  sectionTitle: {
    color: '#1976d2',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    margin: 0,
    marginRight: 10,
  },
  statusLabel: {
    fontSize: 12,
    color: '#666',
  },
  statusValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  deliveryMetrics: {
    flexDirection: 'row',
    gap: 20,
  },
  metricItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
  },
  metricLabel: {
    fontSize: 11,
    color: '#666',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  infoIcon: {
    margin: 0,
    marginRight: 10,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    marginTop: 2,
  },
  callButton: {
    backgroundColor: '#4caf50',
  },
  navButton: {
    borderColor: '#1976d2',
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    backgroundColor: '#fff8e1',
    padding: 12,
    borderRadius: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  itemUnit: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  itemQuantity: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976d2',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#666',
  },
  paymentValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  paymentChip: {
    backgroundColor: '#e3f2fd',
  },
  cashToCollectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  cashInfo: {
    flex: 1,
  },
  cashLabel: {
    fontSize: 12,
    color: '#666',
  },
  cashAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f57c00',
    marginTop: 4,
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  notesText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  noNotesText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  actionButtons: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  primaryButton: {
    backgroundColor: '#1976d2',
    marginBottom: 10,
  },
  completeButton: {
    backgroundColor: '#4caf50',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  secondaryButton: {
    borderColor: '#1976d2',
    marginBottom: 10,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 10,
  },
  halfButton: {
    flex: 1,
  },
  deliveredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8f5e9',
    padding: 15,
    borderRadius: 8,
  },
  deliveredText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4caf50',
  },
  bottomSpacing: {
    height: 30,
  },
  dialogButton: {
    marginBottom: 10,
  },
  proofText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
});
