# Quick Start Guide - Eduegate React Native Migration

## 🚀 Getting Started in 5 Minutes

This guide will help you start the React Native conversion **immediately**.

---

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] Node.js 18+ installed
- [ ] npm or yarn installed
- [ ] React Native CLI installed (`npm install -g react-native-cli`)
- [ ] Android Studio installed (for Android)
- [ ] Xcode installed (for iOS, macOS only)
- [ ] Git installed
- [ ] Code editor (VS Code recommended)

---

## Step-by-Step: First App Setup

### Option A: Start with VisitorApp (RECOMMENDED - Easiest)

```bash
# 1. Open terminal in the project root
cd e:\EduegateConversion

# 2. Initialize React Native project
npx react-native init EduegateVisitorApp --template react-native-template-typescript

# 3. Navigate to the new project
cd EduegateVisitorApp

# 4. Install essential dependencies
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context react-native-gesture-handler
npm install axios @react-native-async-storage/async-storage
npm install react-native-paper react-native-vector-icons

# 5. Install iOS dependencies (macOS only)
cd ios && pod install && cd ..

# 6. Test the app
# For Android:
npx react-native run-android

# For iOS (macOS only):
npx react-native run-ios
```

### Option B: Start with ParentApp (HIGH VALUE - Most Complex)

```bash
# Same steps as above, but use:
npx react-native init EduegateParentApp --template react-native-template-typescript
```

---

## Folder Structure Creation

After initialization, create this structure:

```bash
cd src

# Create main folders
mkdir screens navigation components services hooks helpers assets types constants context utils

# Create sub-folders
mkdir screens/auth screens/home screens/students screens/communication screens/finance screens/transport screens/store screens/profile screens/settings

mkdir components/common components/custom components/layout components/student components/finance components/transport components/store

mkdir services/api services/auth services/school services/communication services/finance services/transport services/store

mkdir assets/images assets/fonts assets/icons

mkdir types/models types/api
```

---

## First Component: Login Screen

Create `src/screens/auth/LoginScreen.tsx`:

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleLogin = async () => {
    setLoading(true);
    // TODO: Implement login logic
    // For now, navigate to home
    navigation.navigate('Home');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.title}>Welcome</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* Login Button */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Text>
        </TouchableOpacity>

        {/* Forgot Password */}
        <TouchableOpacity onPress={() => navigation.navigate('ResetPassword')}>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6845D1',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  inputContainer: {
    marginBottom: 16,
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
    backgroundColor: '#6845D1',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotPassword: {
    color: '#6845D1',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
  },
});
```

---

## Navigation Setup

Create `src/navigation/AppNavigator.tsx`:

```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { HomeScreen } from '../screens/home/HomeScreen';

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
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

---

## Update App.tsx

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

---

## API Service Setup

Create `src/services/api/client.ts`:

```typescript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URLs (from appsettings.js)
const BASE_URLS = {
  local: 'http://localhost:5143/api',
  staging: 'http://api.eduegate.com/api',
  live: 'https://api.pearlschool.org/api',
};

// Choose environment
const ENVIRONMENT: 'local' | 'staging' | 'live' = 'local';

export const apiClient = axios.create({
  baseURL: BASE_URLS[ENVIRONMENT],
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('@auth:access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired - handle refresh or logout
      await AsyncStorage.removeItem('@auth:access_token');
      // Navigate to login (implement navigation service)
    }
    return Promise.reject(error);
  }
);
```

---

## Authentication Service

Create `src/services/auth/authService.ts`:

```typescript
import { apiClient } from '../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(
      '/security/login',
      credentials
    );
    
    // Save tokens
    await AsyncStorage.setItem('@auth:access_token', response.data.accessToken);
    await AsyncStorage.setItem('@auth:refresh_token', response.data.refreshToken);
    await AsyncStorage.setItem('@auth:user_data', JSON.stringify(response.data.user));
    
    return response.data;
  },

  logout: async (): Promise<void> => {
    await AsyncStorage.multiRemove([
      '@auth:access_token',
      '@auth:refresh_token',
      '@auth:user_data',
    ]);
  },

  getCurrentUser: async () => {
    const userData = await AsyncStorage.getItem('@auth:user_data');
    return userData ? JSON.parse(userData) : null;
  },

  isAuthenticated: async (): Promise<boolean> => {
    const token = await AsyncStorage.getItem('@auth:access_token');
    return !!token;
  },
};
```

---

## Constants Setup

Create `src/constants/theme.ts`:

```typescript
export const theme = {
  colors: {
    primary: '#6845D1',      // Purple (from Cordova app)
    secondary: '#381E85',    // Dark Purple
    success: '#28a745',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8',
    light: '#f8f9fa',
    dark: '#343a40',
    white: '#ffffff',
    black: '#000000',
    gray: {
      100: '#f8f9fa',
      200: '#e9ecef',
      300: '#dee2e6',
      400: '#ced4da',
      500: '#adb5bd',
      600: '#6c757d',
      700: '#495057',
      800: '#343a40',
      900: '#212529',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};
```

---

## TypeScript Types

Create `src/types/navigation.ts`:

```typescript
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ResetPassword: undefined;
  Home: undefined;
  MyWards: undefined;
  StudentProfile: { studentId: number };
  Attendance: { studentId: number };
  FeePayment: { studentId: number };
  // Add more routes as needed
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
```

---

## Testing the Setup

```bash
# 1. Make sure all files are created

# 2. Run the app
npx react-native run-android
# or
npx react-native run-ios

# 3. You should see the login screen

# 4. Common issues:
# - Metro bundler not starting: npx react-native start --reset-cache
# - Android build fails: cd android && ./gradlew clean && cd .. && npx react-native run-android
# - iOS build fails: cd ios && pod install && cd .. && npx react-native run-ios
```

---

## Next Steps After Setup

1. **Create more screens** (follow the Login pattern)
2. **Implement authentication** (connect to real API)
3. **Add navigation** (more screens, tabs, drawer)
4. **Build components** (buttons, cards, inputs)
5. **Add state management** (Context API or Zustand)
6. **Implement features** (one by one from Cordova app)

---

## Conversion Workflow

For each Cordova screen:

1. **Analyze** the HTML file
2. **Identify** data sources (controllers, services)
3. **Extract** business logic
4. **Convert** HTML to React Native JSX
5. **Convert** CSS to StyleSheet
6. **Implement** API calls
7. **Test** the screen
8. **Move** to next screen

---

## Quick Reference: HTML to React Native

```javascript
// Cordova HTML
<div class="container">
  <h1>{{ title }}</h1>
  <button ng-click="submit()">Submit</button>
</div>

// React Native
<View style={styles.container}>
  <Text style={styles.title}>{title}</Text>
  <TouchableOpacity onPress={handleSubmit}>
    <Text>Submit</Text>
  </TouchableOpacity>
</View>
```

---

## Getting Help

If you encounter issues:

1. Check React Native docs: https://reactnative.dev
2. Check the migration plan: `MIGRATION_PLAN.md`
3. Check TypeScript types
4. Use debugger: `console.log()` or React DevTools

---

## Success Criteria for POC

Your proof of concept is successful when:

- ✅ App runs on both iOS and Android
- ✅ Login screen displays correctly
- ✅ Can navigate between screens
- ✅ API call works (login)
- ✅ Tokens are stored securely
- ✅ No console errors
- ✅ Follows TypeScript strictly

---

## Ready to Code! 🎉

You now have:
- ✅ Complete analysis of Cordova apps
- ✅ Detailed migration plan
- ✅ Quick start guide
- ✅ Sample code for login
- ✅ Project structure
- ✅ API setup
- ✅ Navigation setup

**Choose your starting app and begin! I'm here to help with any screen conversion you need.**
