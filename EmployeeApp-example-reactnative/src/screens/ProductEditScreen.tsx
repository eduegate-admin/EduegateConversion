import React, {useState} from 'react';
import {View, StyleSheet, ScrollView, StatusBar, Alert} from 'react-native';
import {
  Text,
  Card,
  TextInput,
  Button,
  IconButton,
  Chip,
  Switch,
  Divider,
  SegmentedButtons,
} from 'react-native-paper';
import {useNavigation, useRoute} from '@react-navigation/native';

export default function ProductEditScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const productId = (route.params as any)?.productId;
  const isNew = productId === 'new';

  const [formData, setFormData] = useState({
    sku: isNew ? '' : 'MILK-001',
    name: isNew ? '' : 'Fresh Milk - Full Cream',
    category: isNew ? '' : 'Dairy',
    brand: isNew ? '' : 'Al Ain',
    price: isNew ? '' : '12.50',
    costPrice: isNew ? '' : '10.00',
    stockQuantity: isNew ? '' : '150',
    minStockLevel: isNew ? '' : '20',
    unit: isNew ? '' : '1L',
    barcode: isNew ? '' : '1234567890123',
    description: isNew ? '' : 'Fresh full cream milk, rich in calcium',
    status: isNew ? 'active' : 'active',
  });

  const [isActive, setIsActive] = useState(!isNew);
  const [trackInventory, setTrackInventory] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  const handleSave = async () => {
    // Validation
    if (!formData.sku.trim() || !formData.name.trim() || !formData.price) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    setIsSaving(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      Alert.alert(
        'Success',
        `Product ${isNew ? 'created' : 'updated'} successfully!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save product. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this product?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsSaving(true);
            await new Promise(resolve => setTimeout(resolve, 1000));
            navigation.goBack();
          },
        },
      ],
    );
  };

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
          <Text style={styles.headerTitle}>
            {isNew ? 'Add Product' : 'Edit Product'}
          </Text>
          {!isNew && (
            <Text style={styles.headerSubtitle}>SKU: {formData.sku}</Text>
          )}
        </View>
        {!isNew && (
          <IconButton
            icon="delete"
            iconColor="white"
            size={24}
            onPress={handleDelete}
          />
        )}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Basic Information
            </Text>

            <TextInput
              label="Product Name *"
              value={formData.name}
              onChangeText={text => updateField('name', text)}
              style={styles.input}
              mode="outlined"
              placeholder="e.g., Fresh Milk - Full Cream"
            />

            <TextInput
              label="SKU (Stock Keeping Unit) *"
              value={formData.sku}
              onChangeText={text => updateField('sku', text.toUpperCase())}
              style={styles.input}
              mode="outlined"
              autoCapitalize="characters"
              placeholder="e.g., MILK-001"
            />

            <TextInput
              label="Category"
              value={formData.category}
              onChangeText={text => updateField('category', text)}
              style={styles.input}
              mode="outlined"
              placeholder="e.g., Dairy, Bakery, Meat"
            />

            <TextInput
              label="Brand"
              value={formData.brand}
              onChangeText={text => updateField('brand', text)}
              style={styles.input}
              mode="outlined"
              placeholder="e.g., Al Ain, Nestlé"
            />

            <TextInput
              label="Description"
              value={formData.description}
              onChangeText={text => updateField('description', text)}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={3}
              placeholder="Enter product description"
            />
          </Card.Content>
        </Card>

        {/* Pricing */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Pricing
            </Text>

            <View style={styles.row}>
              <TextInput
                label="Selling Price (AED) *"
                value={formData.price}
                onChangeText={text => updateField('price', text)}
                style={[styles.input, styles.halfInput]}
                mode="outlined"
                keyboardType="decimal-pad"
                left={<TextInput.Icon icon="currency-usd" />}
                placeholder="0.00"
              />

              <TextInput
                label="Cost Price (AED)"
                value={formData.costPrice}
                onChangeText={text => updateField('costPrice', text)}
                style={[styles.input, styles.halfInput]}
                mode="outlined"
                keyboardType="decimal-pad"
                left={<TextInput.Icon icon="currency-usd" />}
                placeholder="0.00"
              />
            </View>

            {formData.price && formData.costPrice && (
              <View style={styles.profitInfo}>
                <Text variant="bodySmall" style={styles.profitLabel}>
                  Profit Margin:
                </Text>
                <Text variant="bodyMedium" style={styles.profitValue}>
                  AED{' '}
                  {(
                    parseFloat(formData.price) - parseFloat(formData.costPrice)
                  ).toFixed(2)}{' '}
                  (
                  {(
                    ((parseFloat(formData.price) -
                      parseFloat(formData.costPrice)) /
                      parseFloat(formData.price)) *
                    100
                  ).toFixed(1)}
                  %)
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Inventory */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Inventory
              </Text>
              <View style={styles.switchContainer}>
                <Text variant="bodySmall" style={styles.switchLabel}>
                  Track Inventory
                </Text>
                <Switch
                  value={trackInventory}
                  onValueChange={setTrackInventory}
                />
              </View>
            </View>

            {trackInventory && (
              <>
                <View style={styles.row}>
                  <TextInput
                    label="Current Stock"
                    value={formData.stockQuantity}
                    onChangeText={text => updateField('stockQuantity', text)}
                    style={[styles.input, styles.halfInput]}
                    mode="outlined"
                    keyboardType="number-pad"
                    placeholder="0"
                  />

                  <TextInput
                    label="Unit"
                    value={formData.unit}
                    onChangeText={text => updateField('unit', text)}
                    style={[styles.input, styles.halfInput]}
                    mode="outlined"
                    placeholder="e.g., 1L, 1kg, pcs"
                  />
                </View>

                <TextInput
                  label="Minimum Stock Level"
                  value={formData.minStockLevel}
                  onChangeText={text => updateField('minStockLevel', text)}
                  style={styles.input}
                  mode="outlined"
                  keyboardType="number-pad"
                  placeholder="Alert when stock falls below this level"
                />

                {formData.stockQuantity &&
                  formData.minStockLevel &&
                  parseInt(formData.stockQuantity) <
                    parseInt(formData.minStockLevel) && (
                    <View style={styles.warningBox}>
                      <Text variant="bodySmall" style={styles.warningText}>
                        ⚠️ Stock is below minimum level!
                      </Text>
                    </View>
                  )}
              </>
            )}
          </Card.Content>
        </Card>

        {/* Barcode */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Barcode
            </Text>

            <View style={styles.barcodeContainer}>
              <TextInput
                label="Barcode / EAN"
                value={formData.barcode}
                onChangeText={text => updateField('barcode', text)}
                style={[styles.input, {flex: 1}]}
                mode="outlined"
                keyboardType="number-pad"
                placeholder="1234567890123"
              />
              <IconButton
                icon="barcode-scan"
                mode="contained"
                size={24}
                onPress={handleScanBarcode}
                style={styles.scanButton}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Status */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Product Status
            </Text>

            <View style={styles.statusContainer}>
              <View style={styles.statusRow}>
                <Text variant="bodyMedium">Active Status</Text>
                <Switch value={isActive} onValueChange={setIsActive} />
              </View>
              <Text variant="bodySmall" style={styles.statusHelpText}>
                {isActive
                  ? 'Product is visible and available for sale'
                  : 'Product is hidden from customers'}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.actionButton}
            disabled={isSaving}>
            Cancel
          </Button>

          <Button
            mode="contained"
            onPress={handleSave}
            style={styles.actionButton}
            loading={isSaving}
            disabled={isSaving}>
            {isSaving ? 'Saving...' : isNew ? 'Create Product' : 'Save Changes'}
          </Button>
        </View>

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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  input: {
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  profitInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    marginTop: -5,
  },
  profitLabel: {
    color: '#666',
  },
  profitValue: {
    fontWeight: 'bold',
    color: '#4caf50',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  switchLabel: {
    color: '#666',
  },
  warningBox: {
    padding: 12,
    backgroundColor: '#fff3e0',
    borderRadius: 8,
    marginTop: -5,
  },
  warningText: {
    color: '#e65100',
    fontWeight: '600',
  },
  barcodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  scanButton: {
    backgroundColor: '#1976d2',
    marginTop: -15,
  },
  statusContainer: {
    gap: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusHelpText: {
    color: '#666',
    fontStyle: 'italic',
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
