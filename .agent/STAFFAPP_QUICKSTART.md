# StaffApp React Native - Quick Start Guide

## 🚀 Project Initialized!

Your **EduegateStaffApp** React Native project has been created successfully!

**Location:** `e:\EduegateConversion\EduegateStaffApp`

---

## 📋 Next Steps

### Step 1: Install Dependencies

```bash
cd e:\EduegateConversion\EduegateStaffApp

# Install dependencies
npm install

# Install essential packages
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs @react-navigation/drawer
npm install react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated
npm install axios @react-native-async-storage/async-storage
npm install react-native-paper react-native-vector-icons
npm install react-hook-form yup
npm install date-fns
npm install react-native-maps @react-native-community/geolocation
npm install react-native-vision-camera react-native-vision-camera-code-scanner
npm install react-native-fs react-native-pdf
npm install @react-native-firebase/app @react-native-firebase/messaging
npm install react-native-biometrics
npm install @react-native-community/netinfo
npm install react-native-device-info
npm install @microsoft/signalr
npm install react-native-chart-kit react-native-svg
npm install i18next react-i18next
npm install zustand @tanstack/react-query

# For iOS (macOS only)
cd ios && pod install && cd ..
```

### Step 2: Create Folder Structure

```bash
cd src

# Create main directories 
mkdir screens navigation components services hooks helpers assets types constants context utils

# Create screen subdirectories
mkdir screens\auth screens\home screens\teacher screens\staff screens\driver screens\student screens\communication screens\dashboard screens\profile

# Create component subdirectories
mkdir components\common components\teacher components\driver components\layout

# Create service subdirectories
mkdir services\api services\auth services\school services\communication services\location services\firebase

# Create asset subdirectories
mkdir assets\images assets\fonts assets\sounds assets\icons

# Create type subdirectories
mkdir types\models types\api
```

### Step 3: Setup Configuration Files

#### Create `src/constants/theme.ts`

```typescript
export const theme = {
  colors: {
    primary: '#6845D1',
    secondary: '#381E85',
    success: '#28a745',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8',
    light: '#f8f9fa',
    dark: '#343a40',
    white: '#ffffff',
    black: '#000000',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
  },
};
```

#### Create `src/constants/config.ts`

```typescript
export const API_CONFIG = {
  BASE_URL: {
    local: 'http://localhost:5143/api',
    test: 'http://192.168.29.100:942/api',
    staging: 'http://api.eduegate.com/api',
    live: 'https://api.pearlschool.org/api',
  },
  ENVIRONMENT: 'local' as 'local' | 'test' | 'staging' | 'live',
  TIMEOUT: 30000,
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth:access_token',
  REFRESH_TOKEN: '@auth:refresh_token',
  USER_DATA: '@auth:user_data',
  IS_DRIVER: '@app:is_driver',
  BIOMETRIC_ENABLED: '@app:biometric_enabled',
};
```

### Step 4: Create API Client

#### Create `src/services/api/client.ts`

```typescript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, STORAGE_KEYS } from '../../constants/config';

export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL[API_CONFIG.ENVIRONMENT],
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.error('Response Error:', error.response?.status, error.message);
    
    if (error.response?.status === 401) {
      // Token expired - clear and redirect to login
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
      // Navigate to login (implement navigation service)
    }
    
    return Promise.reject(error);
  }
);
```

### Step 5: Create Auth Service

#### Create `src/services/auth/authService.ts`

```typescript
import { apiClient } from '../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../constants/config';

export interface LoginCredentials {
  email: string;
  password: string;
  tenantId?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    name: string;
    email: string;
    isDriver: boolean;
    roles: string[];
  };
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(
      '/security/login',
      credentials
    );
    
    // Save tokens and user data
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.AUTH_TOKEN, response.data.accessToken],
      [STORAGE_KEYS.REFRESH_TOKEN, response.data.refreshToken],
      [STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.user)],
      [STORAGE_KEYS.IS_DRIVER, response.data.user.isDriver.toString()],
    ]);
    
    return response.data;
  },

  logout: async (): Promise<void> => {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER_DATA,
      STORAGE_KEYS.IS_DRIVER,
	]);
  },

  getCurrentUser: async () => {
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  },

  isAuthenticated: async (): Promise<boolean> => {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    return !!token;
  },
  
  isDriver: async (): Promise<boolean> => {
    const isDriver = await AsyncStorage.getItem(STORAGE_KEYS.IS_DRIVER);
    return isDriver === 'true';
  },
};
```

### Step 6: Create First Screen - Login

#### Create `src/screens/auth/LoginScreen.tsx`

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { authService } from '../../services/auth/authService';
import { theme } from '../../constants/theme';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigation = useNavigation();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authService.login({ email, password });
      
      // Check if user is driver
      if (response.user.isDriver) {
        // Start location tracking if driver
        // await startLocationTracking(true);
      }
      
      navigation.navigate('Home' as never);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Logo/Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Staff Portal</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        {/* Error Message */}
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />
        </View>

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        {/* Forgot Password */}
        <TouchableOpacity onPress={() => navigation.navigate('ResetPassword' as never)}>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Biometric Login */}
        <TouchableOpacity
          style={styles.biometricButton}
          onPress={() => navigation.navigate('BiometricAuth' as never)}
        >
          <Text style={styles.biometricText}>Use Biometric</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#fee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: theme.colors.danger,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#333',
  },
  loginButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotPassword: {
    color: theme.colors.primary,
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
  },
  biometricButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  biometricText: {
    color: theme.colors.info,
    fontSize: 14,
  },
});
```

### Step 7: Create Navigation

#### Create `src/navigation/AppNavigator.tsx`

```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LoginScreen } from '../screens/auth/LoginScreen';

const Stack = createStackNavigator();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        {/* Add more screens here */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

### Step 8: Update App.tsx

Replace the content of `App.tsx`:

```typescript
import React from 'react';
import { AppNavigator } from './src/navigation/AppNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

function App(): JSX.Element {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppNavigator />
    </GestureHandlerRootView>
  );
}

export default App;
```

### Step 9: Test the App

```bash
# For Android
npm run android
# or
npx react-native run-android

# For iOS (macOS only)
npm run ios
# or
npx react-native run-ios
```

---

## 🎯 What's Next?

### Immediate Tasks (This Week)

1. **✅ Complete Login Screen**
   - Add validation
   - Add loading states
   - Test API integration

2. **Create Home Screen**
   - Dashboard layout
   - Quick action buttons
   - User profile display

3. **Setup Bottom Tab Navigation**
   - Home tab
   - Classes tab
   - Messages tab
   - Profile tab

4. **Implement Auth Flow**
   - Protected routes
   - Token refresh logic
   - Logout functionality

### Priority Screens (Week 1-2)

- [ ] Login
- [ ] Biometric Auth
- [ ] Home Dashboard
- [ ] Teacher Classes
- [ ] Profile

### Week 2-3: Core Features

- [ ] Student Attendance
- [ ] Assignments
- [ ] Lesson Plans
- [ ] Mark Entry

### Week 3-4: Communication

- [ ] Inbox
- [ ] Messaging
- [ ] Announcements

---

## 🔧 Common Issues & Solutions

### Issue: Metro bundler not starting
```bash
npx react-native start --reset-cache
```

### Issue: Android build fails
```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

### Issue: iOS build fails (macOS)
```bash
cd ios
pod install
cd ..
npx react-native run-ios
```

### Issue: Cannot find module errors
```bash
npm install
# Clear watchman cache
watchman watch-del-all
# Clear Metro cache
rm -rf $TMPDIR/metro-*
# Restart Metro
npx react-native start --reset-cache
```

---

## 📚 Resources

- **React Native Docs:** https://reactnative.dev
- **React Navigation:** https://reactnavigation.org
- **TypeScript:** https://www.typescriptlang.org
- **StaffApp Migration Plan:** `.agent/STAFFAPP_MIGRATION_PLAN.md`

---

## ✅ Checklist

- [ ] Project initialized
- [ ] Dependencies installed
- [ ] Folder structure created
- [ ] Login screen created
- [ ] Navigation setup
- [ ] API client configured
- [ ] App running on device/simulator
- [ ] Login working with real API
- [ ] Biometric auth working
- [ ] Home screen created

---

**You're all set to start building! 🎉**

The foundation is ready. Now you can start converting screens one by one!
