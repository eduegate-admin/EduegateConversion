import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text} from 'react-native-paper';

export default function EmployeeTrackingScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Employee Tracking</Text>
      <Text>Employee tracking functionality will be implemented here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
});