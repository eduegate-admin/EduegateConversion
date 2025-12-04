import React, {useEffect, useState} from 'react';
import {View, StyleSheet, ScrollView, StatusBar, TouchableOpacity} from 'react-native';
import {Text, Card, Button, FAB, IconButton, Surface} from 'react-native-paper';
import {useSelector, useDispatch} from 'react-redux';
import {logout} from '../store/authSlice';
import {useNavigation} from '@react-navigation/native';

interface DashboardStats {
  newOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalProducts: number;
  lowStockItems: number;
}

export default function DashboardScreen() {
  const user = useSelector((state: any) => state.auth.user);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  
  const [stats, setStats] = useState<DashboardStats>({
    newOrders: 12,
    pendingOrders: 8,
    completedOrders: 25,
    totalProducts: 156,
    lowStockItems: 3
  });
  
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    
    // Load dashboard data
    loadDashboardData();
    
    return () => clearInterval(timer);
  }, []);

  const loadDashboardData = async () => {
    // TODO: Implement actual API calls
    // Simulate loading dashboard statistics
    try {
      // Mock data for now
      setStats({
        newOrders: Math.floor(Math.random() * 20) + 5,
        pendingOrders: Math.floor(Math.random() * 15) + 3,
        completedOrders: Math.floor(Math.random() * 50) + 20,
        totalProducts: Math.floor(Math.random() * 100) + 100,
        lowStockItems: Math.floor(Math.random() * 10)
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const navigateToScreen = (screenName: string) => {
    // TODO: Implement navigation to specific screens
    console.log('Navigate to:', screenName);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1976d2" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || 'Employee'}</Text>
            <Text style={styles.employeeId}>ID: {user?.employeeId || 'N/A'}</Text>
          </View>
          <View style={styles.headerActions}>
            <IconButton 
              icon="refresh" 
              iconColor="white" 
              size={24}
              onPress={loadDashboardData}
            />
            <IconButton 
              icon="logout" 
              iconColor="white" 
              size={24}
              onPress={handleLogout}
            />
          </View>
        </View>
        <Text style={styles.currentTime}>
          {currentTime.toLocaleDateString()} • {currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </Text>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <Surface style={[styles.statCard, {backgroundColor: '#4caf50'}]}>
            <Text style={styles.statNumber}>{stats.newOrders}</Text>
            <Text style={styles.statLabel}>New Orders</Text>
          </Surface>
          
          <Surface style={[styles.statCard, {backgroundColor: '#ff9800'}]}>
            <Text style={styles.statNumber}>{stats.pendingOrders}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </Surface>
          
          <Surface style={[styles.statCard, {backgroundColor: '#2196f3'}]}>
            <Text style={styles.statNumber}>{stats.completedOrders}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </Surface>
        </View>

        {/* Quick Actions */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>📋 Order Management</Text>
            <View style={styles.buttonGrid}>
              <TouchableOpacity 
                style={[styles.actionButton, {backgroundColor: '#e3f2fd'}]}
                onPress={() => navigateToScreen('NewOrders')}
              >
                <Text style={styles.actionIcon}>📦</Text>
                <Text style={styles.actionText}>New Orders</Text>
                <Text style={styles.actionCount}>{stats.newOrders}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, {backgroundColor: '#fff3e0'}]}
                onPress={() => navigateToScreen('PendingOrders')}
              >
                <Text style={styles.actionIcon}>⏳</Text>
                <Text style={styles.actionText}>Pending</Text>
                <Text style={styles.actionCount}>{stats.pendingOrders}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, {backgroundColor: '#e8f5e8'}]}
                onPress={() => navigateToScreen('CompletedOrders')}
              >
                <Text style={styles.actionIcon}>✅</Text>
                <Text style={styles.actionText}>Completed</Text>
                <Text style={styles.actionCount}>{stats.completedOrders}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, {backgroundColor: '#fce4ec'}]}
                onPress={() => navigateToScreen('AllOrders')}
              >
                <Text style={styles.actionIcon}>📊</Text>
                <Text style={styles.actionText}>All Orders</Text>
                <Text style={styles.actionCount}>View All</Text>
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>

        {/* Product & Stock Management */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>📦 Inventory Management</Text>
            <View style={styles.buttonGrid}>
              <TouchableOpacity 
                style={[styles.actionButton, {backgroundColor: '#e1f5fe'}]}
                onPress={() => navigateToScreen('Products')}
              >
                <Text style={styles.actionIcon}>🏷️</Text>
                <Text style={styles.actionText}>Products</Text>
                <Text style={styles.actionCount}>{stats.totalProducts}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, {backgroundColor: '#ffebee'}]}
                onPress={() => navigateToScreen('Stock')}
              >
                <Text style={styles.actionIcon}>📊</Text>
                <Text style={styles.actionText}>Stock</Text>
                <Text style={[styles.actionCount, stats.lowStockItems > 0 && {color: '#d32f2f'}]}>
                  {stats.lowStockItems > 0 ? `${stats.lowStockItems} Low` : 'Good'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, {backgroundColor: '#f3e5f5'}]}
                onPress={() => navigateToScreen('POS')}
              >
                <Text style={styles.actionIcon}>💰</Text>
                <Text style={styles.actionText}>POS</Text>
                <Text style={styles.actionCount}>Sell</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, {backgroundColor: '#e8f5e8'}]}
                onPress={() => navigateToScreen('Tracking')}
              >
                <Text style={styles.actionIcon}>👥</Text>
                <Text style={styles.actionText}>Tracking</Text>
                <Text style={styles.actionCount}>Active</Text>
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>

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
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  userName: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  employeeId: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
  },
  currentTime: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginTop: -10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 5,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 4,
  },
  statNumber: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  cardTitle: {
    marginBottom: 16,
    color: '#1976d2',
    fontWeight: 'bold',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    marginBottom: 12,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 1,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  actionCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  bottomSpacing: {
    height: 30,
  },
});