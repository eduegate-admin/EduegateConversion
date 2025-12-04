import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
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
  Chip,
  Divider,
} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  loyaltyPoints?: number;
  totalOrders?: number;
  memberSince?: string;
  address?: string;
}

export default function CustomerSearchScreen() {
  const navigation = useNavigation();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  });

  // Mock customer data
  const [customers] = useState<Customer[]>([
    {
      id: '1',
      name: 'Ahmed Al Mansoori',
      phone: '+971 50 123 4567',
      email: 'ahmed@example.com',
      loyaltyPoints: 1250,
      totalOrders: 45,
      memberSince: '2023-01-15',
      address: 'Downtown Dubai',
    },
    {
      id: '2',
      name: 'Fatima Hassan',
      phone: '+971 55 987 6543',
      email: 'fatima@example.com',
      loyaltyPoints: 890,
      totalOrders: 28,
      memberSince: '2023-03-20',
      address: 'Jumeirah',
    },
    {
      id: '3',
      name: 'Mohammed Khalid',
      phone: '+971 52 456 7890',
      loyaltyPoints: 450,
      totalOrders: 12,
      memberSince: '2023-08-10',
    },
  ]);

  const filteredCustomers = customers.filter(
    customer =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSelectCustomer = (customer: Customer) => {
    // Navigate back to POS or calling screen with selected customer
    navigation.goBack();
    // In real app, would pass customer data via navigation params or callback
  };

  const handleAddCustomer = () => {
    if (!newCustomer.name || !newCustomer.phone) {
      alert('Please enter customer name and phone number');
      return;
    }

    // API call to add customer
    console.log('Adding customer:', newCustomer);

    // Reset form
    setNewCustomer({name: '', phone: '', email: '', address: ''});
    setShowAddDialog(false);

    // Show success message
    alert('Customer added successfully');
  };

  const validatePhoneNumber = (phone: string) => {
    // Simple validation for UAE phone numbers
    const phoneRegex = /^\+971\s\d{2}\s\d{3}\s\d{4}$/;
    return phoneRegex.test(phone);
  };

  const formatPhoneNumber = (phone: string) => {
    // Auto-format phone number as user types
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('971')) {
      const formatted = cleaned.replace(/(\d{3})(\d{2})(\d{3})(\d{4})/, '+$1 $2 $3 $4');
      return formatted;
    }
    return phone;
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
        />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Search Customer</Text>
          <Text style={styles.headerSubtitle}>
            {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''} found
          </Text>
        </View>
        <IconButton
          icon="account-plus"
          iconColor="white"
          size={24}
          onPress={() => setShowAddDialog(true)}
        />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search by name, phone, or email..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor="#1976d2"
        />
      </View>

      {/* Customer List */}
      {filteredCustomers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconButton icon="account-search" size={60} iconColor="#ccc" />
          <Text style={styles.emptyText}>No customers found</Text>
          <Text style={styles.emptySubtext}>
            {searchQuery
              ? 'Try adjusting your search'
              : 'Add a new customer to get started'}
          </Text>
          <Button
            mode="contained"
            icon="account-plus"
            onPress={() => setShowAddDialog(true)}
            style={styles.addButton}>
            Add New Customer
          </Button>
        </View>
      ) : (
        <FlatList
          data={filteredCustomers}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => (
            <TouchableOpacity onPress={() => handleSelectCustomer(item)}>
              <Card style={styles.customerCard}>
                <Card.Content>
                  <View style={styles.customerHeader}>
                    <View style={styles.customerInfo}>
                      <Text style={styles.customerName}>{item.name}</Text>
                      <Text style={styles.customerPhone}>{item.phone}</Text>
                      {item.email && (
                        <Text style={styles.customerEmail}>{item.email}</Text>
                      )}
                    </View>
                    <IconButton icon="chevron-right" size={24} />
                  </View>

                  {item.address && (
                    <View style={styles.addressRow}>
                      <IconButton icon="map-marker" size={16} style={styles.addressIcon} />
                      <Text style={styles.addressText}>{item.address}</Text>
                    </View>
                  )}

                  <Divider style={styles.divider} />

                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <IconButton icon="star" size={20} iconColor="#FFD700" style={styles.statIcon} />
                      <View>
                        <Text style={styles.statValue}>
                          {item.loyaltyPoints?.toLocaleString() || 0}
                        </Text>
                        <Text style={styles.statLabel}>Loyalty Points</Text>
                      </View>
                    </View>

                    <View style={styles.statItem}>
                      <IconButton icon="shopping" size={20} iconColor="#4caf50" style={styles.statIcon} />
                      <View>
                        <Text style={styles.statValue}>{item.totalOrders || 0}</Text>
                        <Text style={styles.statLabel}>Total Orders</Text>
                      </View>
                    </View>
                  </View>

                  {item.memberSince && (
                    <Text style={styles.memberSince}>
                      Member since {new Date(item.memberSince).toLocaleDateString()}
                    </Text>
                  )}
                </Card.Content>
              </Card>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Add Customer Dialog */}
      <Portal>
        <Dialog
          visible={showAddDialog}
          onDismiss={() => setShowAddDialog(false)}
          style={styles.dialog}>
          <Dialog.Title>Add New Customer</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Customer Name *"
              value={newCustomer.name}
              onChangeText={text => setNewCustomer({...newCustomer, name: text})}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="account" />}
            />

            <TextInput
              label="Phone Number *"
              value={newCustomer.phone}
              onChangeText={text =>
                setNewCustomer({...newCustomer, phone: formatPhoneNumber(text)})
              }
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
              left={<TextInput.Icon icon="phone" />}
              placeholder="+971 50 123 4567"
            />

            <TextInput
              label="Email (Optional)"
              value={newCustomer.email}
              onChangeText={text => setNewCustomer({...newCustomer, email: text})}
              mode="outlined"
              keyboardType="email-address"
              style={styles.input}
              left={<TextInput.Icon icon="email" />}
            />

            <TextInput
              label="Address (Optional)"
              value={newCustomer.address}
              onChangeText={text => setNewCustomer({...newCustomer, address: text})}
              mode="outlined"
              multiline
              numberOfLines={2}
              style={styles.input}
              left={<TextInput.Icon icon="map-marker" />}
            />

            <Text style={styles.requiredNote}>* Required fields</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onPress={handleAddCustomer} mode="contained">
              Add Customer
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
    paddingBottom: 15,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    paddingLeft: 10,
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
  searchContainer: {
    padding: 15,
    backgroundColor: 'white',
  },
  searchBar: {
    elevation: 2,
  },
  listContent: {
    padding: 15,
  },
  customerCard: {
    marginBottom: 15,
    borderRadius: 12,
    elevation: 2,
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  customerEmail: {
    fontSize: 13,
    color: '#999',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  addressIcon: {
    margin: 0,
    marginRight: 4,
  },
  addressText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
  },
  divider: {
    marginVertical: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    margin: 0,
    marginRight: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
  },
  memberSince: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
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
  },
  addButton: {
    marginTop: 20,
  },
  dialog: {
    maxHeight: '80%',
  },
  input: {
    marginBottom: 15,
  },
  requiredNote: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
    fontStyle: 'italic',
  },
});
