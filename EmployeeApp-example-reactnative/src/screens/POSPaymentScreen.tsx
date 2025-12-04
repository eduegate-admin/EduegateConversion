import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  StatusBar,
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
  RadioButton,
  Checkbox,
} from 'react-native-paper';
import {useNavigation, useRoute} from '@react-navigation/native';

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
}

export default function POSPaymentScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  // Get cart data from navigation params (in real app)
  const orderTotal = 127.45; // Mock data
  const orderItems = [
    {name: 'Fresh Milk - Full Cream', quantity: 2, price: 12.5},
    {name: 'White Bread - Sliced', quantity: 1, price: 5.0},
    {name: 'Fresh Eggs - 12 Pack', quantity: 3, price: 18.0},
  ];

  const paymentMethods: PaymentMethod[] = [
    {id: 'cash', name: 'Cash', icon: 'cash', enabled: true},
    {id: 'card', name: 'Credit/Debit Card', icon: 'credit-card', enabled: true},
    {
      id: 'wallet',
      name: 'Digital Wallet',
      icon: 'wallet',
      enabled: true,
    },
  ];

  // State
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');
  const [amountTendered, setAmountTendered] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [emailReceipt, setEmailReceipt] = useState(false);
  const [smsReceipt, setSmsReceipt] = useState(false);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);

  // Calculations
  const changeAmount =
    selectedPaymentMethod === 'cash' && amountTendered
      ? parseFloat(amountTendered) - orderTotal
      : 0;

  // Quick cash buttons
  const quickCashAmounts = [50, 100, 150, 200];

  // Process payment
  const handleProcessPayment = async () => {
    // Validation
    if (selectedPaymentMethod === 'cash') {
      const tendered = parseFloat(amountTendered);
      if (!amountTendered || isNaN(tendered)) {
        Alert.alert('Invalid Amount', 'Please enter the amount tendered');
        return;
      }
      if (tendered < orderTotal) {
        Alert.alert(
          'Insufficient Amount',
          `Amount tendered (AED ${tendered.toFixed(
            2,
          )}) is less than order total (AED ${orderTotal.toFixed(2)})`,
        );
        return;
      }
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate transaction ID
      const txnId = `TXN${Date.now()}`;
      setTransactionId(txnId);
      setPaymentSuccess(true);
    } catch (error) {
      Alert.alert('Payment Failed', 'Failed to process payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Complete transaction
  const handleCompleteTransaction = () => {
    Alert.alert('Transaction Complete', 'Receipt printed successfully!', [
      {
        text: 'New Transaction',
        onPress: () => {
          // Navigate back to POS screen and reset
          navigation.goBack();
        },
      },
    ]);
  };

  // Print receipt
  const handlePrintReceipt = () => {
    Alert.alert('Print Receipt', 'Sending to printer...');
  };

  // Email receipt
  const handleEmailReceipt = () => {
    setShowReceiptDialog(true);
  };

  // Success Screen
  if (paymentSuccess) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#4caf50" />

        {/* Success Header */}
        <View style={[styles.header, styles.successHeader]}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Payment Successful!</Text>
            <Text style={styles.headerSubtitle}>
              Transaction ID: {transactionId}
            </Text>
          </View>
        </View>

        <ScrollView style={styles.scrollView}>
          {/* Success Icon */}
          <View style={styles.successIconContainer}>
            <View style={styles.successIconCircle}>
              <IconButton
                icon="check"
                size={60}
                iconColor="white"
                style={styles.successIcon}
              />
            </View>
          </View>

          {/* Transaction Summary */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Transaction Summary
              </Text>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Amount:</Text>
                <Text style={styles.summaryValue}>AED {orderTotal.toFixed(2)}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Payment Method:</Text>
                <Text style={styles.summaryValue}>
                  {paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}
                </Text>
              </View>

              {selectedPaymentMethod === 'cash' && (
                <>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Amount Tendered:</Text>
                    <Text style={styles.summaryValue}>
                      AED {parseFloat(amountTendered).toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Change:</Text>
                    <Text style={[styles.summaryValue, styles.changeValue]}>
                      AED {changeAmount.toFixed(2)}
                    </Text>
                  </View>
                </>
              )}

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Date & Time:</Text>
                <Text style={styles.summaryValue}>
                  {new Date().toLocaleString()}
                </Text>
              </View>
            </Card.Content>
          </Card>

          {/* Receipt Options */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Receipt Options
              </Text>

              <Button
                mode="contained"
                icon="printer"
                onPress={handlePrintReceipt}
                style={styles.actionButton}>
                Print Receipt
              </Button>

              <Button
                mode="outlined"
                icon="email"
                onPress={handleEmailReceipt}
                style={styles.actionButton}>
                Email Receipt
              </Button>

              <Button
                mode="outlined"
                icon="message-text"
                onPress={() => Alert.alert('SMS Receipt', 'Sending via SMS...')}
                style={styles.actionButton}>
                SMS Receipt
              </Button>
            </Card.Content>
          </Card>

          {/* Action Buttons */}
          <View style={styles.bottomActions}>
            <Button
              mode="contained"
              onPress={handleCompleteTransaction}
              style={styles.completeButton}
              contentStyle={styles.completeButtonContent}
              labelStyle={styles.completeButtonLabel}>
              Complete & New Transaction
            </Button>

            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.backButton}>
              Back to Dashboard
            </Button>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>
    );
  }

  // Payment Screen
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
          <Text style={styles.headerTitle}>Payment</Text>
          <Text style={styles.headerSubtitle}>Complete Transaction</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Order Summary
            </Text>

            {orderItems.map((item, index) => (
              <View key={index} style={styles.orderItem}>
                <View style={styles.orderItemDetails}>
                  <Text style={styles.orderItemName}>{item.name}</Text>
                  <Text style={styles.orderItemQty}>x{item.quantity}</Text>
                </View>
                <Text style={styles.orderItemPrice}>
                  AED {(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}

            <Divider style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <Text style={styles.totalValue}>AED {orderTotal.toFixed(2)}</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Payment Method Selection */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Select Payment Method
            </Text>

            <RadioButton.Group
              onValueChange={value => setSelectedPaymentMethod(value)}
              value={selectedPaymentMethod}>
              {paymentMethods.map(method => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.paymentMethodCard,
                    selectedPaymentMethod === method.id &&
                      styles.paymentMethodCardSelected,
                  ]}
                  onPress={() => setSelectedPaymentMethod(method.id)}
                  disabled={!method.enabled}>
                  <IconButton
                    icon={method.icon}
                    size={32}
                    iconColor={
                      selectedPaymentMethod === method.id ? '#1976d2' : '#666'
                    }
                  />
                  <View style={styles.paymentMethodInfo}>
                    <Text style={styles.paymentMethodName}>{method.name}</Text>
                  </View>
                  <RadioButton value={method.id} disabled={!method.enabled} />
                </TouchableOpacity>
              ))}
            </RadioButton.Group>
          </Card.Content>
        </Card>

        {/* Cash Payment Details */}
        {selectedPaymentMethod === 'cash' && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Cash Payment
              </Text>

              <TextInput
                label="Amount Tendered *"
                value={amountTendered}
                onChangeText={setAmountTendered}
                keyboardType="decimal-pad"
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="currency-usd" />}
                placeholder="0.00"
              />

              {/* Quick Cash Buttons */}
              <Text style={styles.quickCashLabel}>Quick Amount:</Text>
              <View style={styles.quickCashButtons}>
                {quickCashAmounts.map(amount => (
                  <Button
                    key={amount}
                    mode="outlined"
                    onPress={() => setAmountTendered(amount.toString())}
                    style={styles.quickCashButton}
                    compact>
                    AED {amount}
                  </Button>
                ))}
              </View>

              {amountTendered && !isNaN(parseFloat(amountTendered)) && (
                <>
                  <Divider style={styles.divider} />
                  <View style={styles.changeContainer}>
                    <Text style={styles.changeLabel}>Change to Return:</Text>
                    <Text
                      style={[
                        styles.changeAmount,
                        changeAmount < 0 && styles.changeNegative,
                      ]}>
                      AED {changeAmount.toFixed(2)}
                    </Text>
                  </View>
                  {changeAmount < 0 && (
                    <Text style={styles.warningText}>
                      Insufficient amount tendered!
                    </Text>
                  )}
                </>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Card Payment Details */}
        {selectedPaymentMethod === 'card' && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Card Payment
              </Text>

              <View style={styles.cardPaymentInfo}>
                <IconButton icon="credit-card-outline" size={48} />
                <Text style={styles.cardPaymentText}>
                  Please insert or tap the card on the POS terminal
                </Text>
              </View>

              <Text style={styles.cardPaymentNote}>
                Amount to charge: AED {orderTotal.toFixed(2)}
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Digital Wallet Payment Details */}
        {selectedPaymentMethod === 'wallet' && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Digital Wallet Payment
              </Text>

              <View style={styles.cardPaymentInfo}>
                <IconButton icon="qrcode" size={48} />
                <Text style={styles.cardPaymentText}>
                  Scan QR code with your digital wallet app
                </Text>
              </View>

              <Text style={styles.cardPaymentNote}>
                Supported: Apple Pay, Google Pay, Samsung Pay
              </Text>
              <Text style={styles.cardPaymentNote}>
                Amount to charge: AED {orderTotal.toFixed(2)}
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Receipt Options */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Receipt Options
            </Text>

            <View style={styles.checkboxRow}>
              <Checkbox
                status={emailReceipt ? 'checked' : 'unchecked'}
                onPress={() => setEmailReceipt(!emailReceipt)}
              />
              <Text style={styles.checkboxLabel}>Email receipt to customer</Text>
            </View>

            <View style={styles.checkboxRow}>
              <Checkbox
                status={smsReceipt ? 'checked' : 'unchecked'}
                onPress={() => setSmsReceipt(!smsReceipt)}
              />
              <Text style={styles.checkboxLabel}>SMS receipt to customer</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Process Payment Button */}
        <View style={styles.bottomActions}>
          <Button
            mode="contained"
            onPress={handleProcessPayment}
            style={styles.processButton}
            contentStyle={styles.processButtonContent}
            labelStyle={styles.processButtonLabel}
            loading={isProcessing}
            disabled={isProcessing}>
            {isProcessing ? 'Processing...' : 'Process Payment'}
          </Button>

          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            disabled={isProcessing}
            style={styles.cancelButton}>
            Cancel
          </Button>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Receipt Dialog */}
      <Portal>
        <Dialog
          visible={showReceiptDialog}
          onDismiss={() => setShowReceiptDialog(false)}>
          <Dialog.Title>Email Receipt</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Customer Email"
              mode="outlined"
              keyboardType="email-address"
              placeholder="customer@example.com"
              left={<TextInput.Icon icon="email" />}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowReceiptDialog(false)}>Cancel</Button>
            <Button
              onPress={() => {
                setShowReceiptDialog(false);
                Alert.alert('Success', 'Receipt sent to email');
              }}>
              Send
            </Button>
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
  successHeader: {
    backgroundColor: '#4caf50',
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
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  orderItemDetails: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderItemName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  orderItemQty: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976d2',
  },
  divider: {
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 12,
  },
  paymentMethodCardSelected: {
    borderColor: '#1976d2',
    backgroundColor: '#e3f2fd',
  },
  paymentMethodInfo: {
    flex: 1,
    marginLeft: 8,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    marginBottom: 15,
  },
  quickCashLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  quickCashButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
  },
  quickCashButton: {
    flex: 1,
    minWidth: '45%',
  },
  changeContainer: {
    padding: 15,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  changeLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  changeAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  changeNegative: {
    color: '#d32f2f',
  },
  warningText: {
    fontSize: 12,
    color: '#d32f2f',
    marginTop: 8,
    fontWeight: '600',
  },
  cardPaymentInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  cardPaymentText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  cardPaymentNote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  bottomActions: {
    marginHorizontal: 20,
    marginTop: 20,
    gap: 10,
  },
  processButton: {
    backgroundColor: '#4caf50',
  },
  processButtonContent: {
    paddingVertical: 8,
  },
  processButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    borderColor: '#d32f2f',
  },
  backButton: {
    borderColor: '#666',
  },
  bottomSpacing: {
    height: 30,
  },
  successIconContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  successIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#4caf50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  successIcon: {
    margin: 0,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
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
  changeValue: {
    color: '#4caf50',
    fontWeight: 'bold',
  },
  actionButton: {
    marginBottom: 10,
  },
  completeButton: {
    backgroundColor: '#1976d2',
  },
  completeButtonContent: {
    paddingVertical: 8,
  },
  completeButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
