import React, {useState, useEffect} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useAppSelector} from '../store/hooks';

// Auth & Onboarding screens
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import RegisterScreen from '../screens/RegisterScreen';
import OTPVerificationScreen from '../screens/OTPVerificationScreen';

// Main screens
import DashboardScreen from '../screens/DashboardScreen';
import OrderListScreen from '../screens/OrderListScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import ProductManagementScreen from '../screens/ProductManagementScreen';
import ProductEditScreen from '../screens/ProductEditScreen';
import StockManagementScreen from '../screens/StockManagementScreen';
import EmployeeTrackingScreen from '../screens/EmployeeTrackingScreen';
import POSScreen from '../screens/POSScreen';
import POSPaymentScreen from '../screens/POSPaymentScreen';

// Employee & Driver screens
import MyAssignedOrdersScreen from '../screens/MyAssignedOrdersScreen';
import DriverOrderDetailScreen from '../screens/DriverOrderDetailScreen';
import DriverJobListScreen from '../screens/DriverJobListScreen';

// Analytics screens
import BranchwiseDashboardScreen from '../screens/BranchwiseDashboardScreen';

// Settings & User screens
import SettingsScreen from '../screens/SettingsScreen';
import MyAccountScreen from '../screens/MyAccountScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';

// Information screens
import AboutUsScreen from '../screens/AboutUsScreen';
import ContactUsScreen from '../screens/ContactUsScreen';
import TermsScreen from '../screens/TermsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import NoConnectionScreen from '../screens/NoConnectionScreen';

// Additional screens
import StoreLocatorScreen from '../screens/StoreLocatorScreen';
import CustomerSearchScreen from '../screens/CustomerSearchScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1976d2',
        tabBarInactiveTintColor: '#757575',
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="view-dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrderListScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="package-variant" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Products"
        component={ProductManagementScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="tag-multiple" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Stock"
        component={StockManagementScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="warehouse" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="More"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="menu" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [showSplash, setShowSplash] = useState(true);
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {!isAuthenticated ? (
        // Auth Stack
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
          />
          <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Terms" component={TermsScreen} />
        </>
      ) : (
        // Main App Stack
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />

          {/* Order Management Screens */}
          <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />

          {/* Product Management Screens */}
          <Stack.Screen name="ProductEdit" component={ProductEditScreen} />

          {/* POS Screens */}
          <Stack.Screen name="POSPayment" component={POSPaymentScreen} />

          {/* Employee & Driver Screens */}
          <Stack.Screen
            name="MyAssignedOrders"
            component={MyAssignedOrdersScreen}
          />
          <Stack.Screen
            name="DriverOrderDetail"
            component={DriverOrderDetailScreen}
          />
          <Stack.Screen name="DriverJobList" component={DriverJobListScreen} />

          {/* Analytics Screens */}
          <Stack.Screen
            name="BranchwiseDashboard"
            component={BranchwiseDashboardScreen}
          />

          {/* Settings & User Screens */}
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="MyAccount" component={MyAccountScreen} />
          <Stack.Screen
            name="ChangePassword"
            component={ChangePasswordScreen}
          />

          {/* Information Screens */}
          <Stack.Screen name="AboutUs" component={AboutUsScreen} />
          <Stack.Screen name="ContactUs" component={ContactUsScreen} />
          <Stack.Screen
            name="Notifications"
            component={NotificationsScreen}
          />

          {/* Utility Screens */}
          <Stack.Screen
            name="NoConnection"
            component={NoConnectionScreen}
            options={{
              presentation: 'modal',
            }}
          />

          {/* Additional Screens */}
          <Stack.Screen
            name="Tracking"
            component={EmployeeTrackingScreen}
          />
          <Stack.Screen name="POS" component={POSScreen} />
          <Stack.Screen name="StoreLocator" component={StoreLocatorScreen} />
          <Stack.Screen
            name="CustomerSearch"
            component={CustomerSearchScreen}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
