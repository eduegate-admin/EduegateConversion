import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Linking,
} from 'react-native';
import {
  Text,
  Card,
  Searchbar,
  IconButton,
  Button,
  Chip,
  Divider,
} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  distance?: string;
  isOpen: boolean;
  services: string[];
}

export default function StoreLocatorScreen() {
  const navigation = useNavigation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  // Mock store data
  const [stores] = useState<Store[]>([
    {
      id: '1',
      name: 'Main Branch - Downtown',
      address: 'Sheikh Zayed Road, Downtown Dubai, UAE',
      phone: '+971 4 123 4567',
      email: 'downtown@skiensuite.com',
      hours: '8:00 AM - 10:00 PM',
      coordinates: {lat: 25.1972, lng: 55.2744},
      distance: '2.5 km',
      isOpen: true,
      services: ['Delivery', 'Pickup', 'POS'],
    },
    {
      id: '2',
      name: 'Jumeirah Branch',
      address: 'Beach Road, Jumeirah 1, Dubai, UAE',
      phone: '+971 4 234 5678',
      email: 'jumeirah@skiensuite.com',
      hours: '8:00 AM - 10:00 PM',
      coordinates: {lat: 25.2297, lng: 55.2589},
      distance: '5.8 km',
      isOpen: true,
      services: ['Delivery', 'Pickup'],
    },
    {
      id: '3',
      name: 'Marina Branch',
      address: 'Dubai Marina, Dubai, UAE',
      phone: '+971 4 345 6789',
      email: 'marina@skiensuite.com',
      hours: '8:00 AM - 11:00 PM',
      coordinates: {lat: 25.0778, lng: 55.1392},
      distance: '8.2 km',
      isOpen: false,
      services: ['Delivery', 'Pickup', 'POS'],
    },
  ]);

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.address.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCallStore = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmailStore = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleGetDirections = (coordinates: {lat: number; lng: number}) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`;
    Linking.openURL(url);
  };

  const handleViewOnMap = () => {
    // This would open a full map view with all stores
    // For now, we'll show an alert
    alert('Map view will be implemented with react-native-maps');
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
          <Text style={styles.headerTitle}>Store Locator</Text>
          <Text style={styles.headerSubtitle}>Find nearest branch</Text>
        </View>
        <IconButton
          icon="map"
          iconColor="white"
          size={24}
          onPress={handleViewOnMap}
        />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search by name or location..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor="#1976d2"
        />
      </View>

      {/* Map Placeholder */}
      <TouchableOpacity
        style={styles.mapPlaceholder}
        onPress={handleViewOnMap}>
        <View style={styles.mapOverlay}>
          <IconButton icon="map-marker-radius" size={48} iconColor="white" />
          <Text style={styles.mapText}>Tap to view map</Text>
          <Text style={styles.mapSubtext}>
            {stores.length} store{stores.length !== 1 ? 's' : ''} near you
          </Text>
        </View>
      </TouchableOpacity>

      {/* Store List */}
      <ScrollView
        style={styles.storeList}
        showsVerticalScrollIndicator={false}>
        {filteredStores.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconButton icon="store-off" size={60} iconColor="#ccc" />
            <Text style={styles.emptyText}>No stores found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your search criteria
            </Text>
          </View>
        ) : (
          filteredStores.map(store => (
            <Card key={store.id} style={styles.storeCard}>
              <Card.Content>
                {/* Store Header */}
                <View style={styles.storeHeader}>
                  <View style={styles.storeHeaderLeft}>
                    <Text style={styles.storeName}>{store.name}</Text>
                    <View style={styles.statusRow}>
                      <View
                        style={[
                          styles.statusDot,
                          {backgroundColor: store.isOpen ? '#4caf50' : '#f44336'},
                        ]}
                      />
                      <Text
                        style={[
                          styles.statusText,
                          {color: store.isOpen ? '#4caf50' : '#f44336'},
                        ]}>
                        {store.isOpen ? 'Open' : 'Closed'}
                      </Text>
                      {store.distance && (
                        <>
                          <Text style={styles.statusSeparator}>•</Text>
                          <Text style={styles.distanceText}>{store.distance}</Text>
                        </>
                      )}
                    </View>
                  </View>
                </View>

                <Divider style={styles.divider} />

                {/* Store Info */}
                <View style={styles.infoSection}>
                  <View style={styles.infoRow}>
                    <IconButton icon="map-marker" size={20} style={styles.infoIcon} />
                    <Text style={styles.infoText}>{store.address}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <IconButton icon="clock-outline" size={20} style={styles.infoIcon} />
                    <Text style={styles.infoText}>{store.hours}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <IconButton icon="phone" size={20} style={styles.infoIcon} />
                    <TouchableOpacity onPress={() => handleCallStore(store.phone)}>
                      <Text style={[styles.infoText, styles.linkText]}>
                        {store.phone}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Services */}
                <View style={styles.servicesRow}>
                  {store.services.map(service => (
                    <Chip key={service} style={styles.serviceChip} compact>
                      {service}
                    </Chip>
                  ))}
                </View>

                {/* Actions */}
                <View style={styles.actionButtons}>
                  <Button
                    mode="contained"
                    icon="navigation"
                    onPress={() => handleGetDirections(store.coordinates)}
                    style={styles.actionButton}
                    compact>
                    Directions
                  </Button>
                  <Button
                    mode="outlined"
                    icon="phone"
                    onPress={() => handleCallStore(store.phone)}
                    style={styles.actionButton}
                    compact>
                    Call
                  </Button>
                  <Button
                    mode="outlined"
                    icon="email"
                    onPress={() => handleEmailStore(store.email)}
                    style={styles.actionButton}
                    compact>
                    Email
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
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
  mapPlaceholder: {
    height: 200,
    backgroundColor: '#4caf50',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mapOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  },
  mapSubtext: {
    fontSize: 14,
    color: 'white',
    marginTop: 5,
  },
  storeList: {
    flex: 1,
  },
  storeCard: {
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    elevation: 2,
  },
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  storeHeaderLeft: {
    flex: 1,
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusSeparator: {
    marginHorizontal: 8,
    color: '#999',
  },
  distanceText: {
    fontSize: 13,
    color: '#666',
  },
  divider: {
    marginVertical: 12,
  },
  infoSection: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    margin: 0,
    marginRight: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  linkText: {
    color: '#1976d2',
    textDecorationLine: 'underline',
  },
  servicesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
  },
  serviceChip: {
    backgroundColor: '#e3f2fd',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
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
  },
  bottomSpacing: {
    height: 20,
  },
});
