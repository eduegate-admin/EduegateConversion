import React, {useState} from 'react';
import {View, StyleSheet, Alert, StatusBar} from 'react-native';
import {TextInput, Button, Text, Card, Snackbar} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {loginStart, loginSuccess, loginFailure} from '../store/authSlice';

export default function LoginScreen() {
  const [employeeCode, setEmployeeCode] = useState('EMP001');
  const [password, setPassword] = useState('password123');
  const [currentStep, setCurrentStep] = useState<'employeeCode' | 'password'>('employeeCode');
  const [validatedEmployee, setValidatedEmployee] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const {loading, error} = useSelector((state: any) => state.auth);

  const handleEmployeeCodeSubmit = async () => {
    if (!employeeCode) {
      Alert.alert('Validation Error', 'Please enter your employee code.');
      return;
    }

    dispatch(loginStart());
    
    try {
      // Simulate employee code validation API call
      await new Promise<void>((resolve) => setTimeout(resolve, 1000));
      
      // Mock employee validation - replace with actual API call
      if (employeeCode === 'EMP001' || employeeCode === 'EMP002' || employeeCode === 'ADMIN') {
        const employeeData = {
          id: '1',
          employeeCode: employeeCode,
          name: employeeCode === 'ADMIN' ? 'Admin User' : `Employee ${employeeCode}`,
          department: employeeCode === 'ADMIN' ? 'Administration' : 'Operations'
        };
        
        setValidatedEmployee(employeeData);
        setCurrentStep('password');
        dispatch(loginFailure(''));  // Clear any previous errors
      } else {
        dispatch(loginFailure('Invalid employee code. Please try again.'));
      }
    } catch (err) {
      dispatch(loginFailure('Error validating employee code. Please try again.'));
    }
  };

  const handlePasswordSubmit = async () => {
    if (!password) {
      Alert.alert('Validation Error', 'Please enter your password.');
      return;
    }

    dispatch(loginStart());
    
    try {
      // Simulate password validation API call
      await new Promise<void>((resolve) => setTimeout(resolve, 1500));
      
      // Mock password validation - replace with actual API call
      if (password === 'password123' || password === 'admin123') {
        dispatch(loginSuccess({
          user: {
            id: validatedEmployee.id,
            email: `${validatedEmployee.employeeCode.toLowerCase()}@company.com`,
            name: validatedEmployee.name,
            employeeId: validatedEmployee.employeeCode,
            department: validatedEmployee.department
          },
          token: 'mock-jwt-token-' + Date.now()
        }));
      } else {
        dispatch(loginFailure('Invalid password. Please try again.'));
      }
    } catch (err) {
      dispatch(loginFailure('Invalid credentials. Please try again.'));
    }
  };

  const handleBackToEmployeeCode = () => {
    setCurrentStep('employeeCode');
    setValidatedEmployee(null);
    setPassword('');
    dispatch(loginFailure(''));  // Clear errors
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1976d2" />
      
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>👨‍💼</Text>
          <Text style={styles.companyName}>Employee Management</Text>
          <Text style={styles.tagline}>iTrade Employee Portal</Text>
        </View>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          {currentStep === 'employeeCode' ? (
            // Employee Code Entry Screen
            <>
              <Text variant="headlineSmall" style={styles.title}>
                Employee Login
              </Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                Enter your employee code to continue
              </Text>
              
              <TextInput
                label="Employee Code"
                value={employeeCode}
                onChangeText={setEmployeeCode}
                style={styles.input}
                mode="outlined"
                autoCapitalize="characters"
                disabled={loading}
                left={<TextInput.Icon icon="badge-account-horizontal" />}
                placeholder="Enter your employee code"
              />
              
              <Button
                mode="contained"
                onPress={handleEmployeeCodeSubmit}
                style={styles.button}
                contentStyle={styles.buttonContent}
                disabled={loading}
                loading={loading}
              >
                {loading ? 'Validating...' : 'Continue'}
              </Button>

              <View style={styles.helpSection}>
                <Text variant="bodySmall" style={styles.helpText}>
                  Demo Employee Codes: EMP001, EMP002, ADMIN
                </Text>
              </View>
            </>
          ) : (
            // Password Entry Screen
            <>
              <View style={styles.backButtonContainer}>
                <Button
                  mode="text"
                  onPress={handleBackToEmployeeCode}
                  style={styles.backButton}
                  icon="arrow-left"
                >
                  Back
                </Button>
              </View>
              
              <Text variant="headlineSmall" style={styles.title}>
                Welcome, {validatedEmployee?.name}
              </Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                Enter your password to access the system
              </Text>
              
              <View style={styles.employeeInfo}>
                <Text variant="bodySmall" style={styles.employeeDetails}>
                  Employee Code: {validatedEmployee?.employeeCode}
                </Text>
                <Text variant="bodySmall" style={styles.employeeDetails}>
                  Department: {validatedEmployee?.department}
                </Text>
              </View>
              
              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                mode="outlined"
                secureTextEntry={!showPassword}
                disabled={loading}
                left={<TextInput.Icon icon="lock" />}
                right={<TextInput.Icon 
                  icon={showPassword ? "eye-off" : "eye"} 
                  onPress={() => setShowPassword(!showPassword)} 
                />}
                placeholder="Enter your password"
              />
              
              <Button
                mode="contained"
                onPress={handlePasswordSubmit}
                style={styles.button}
                contentStyle={styles.buttonContent}
                disabled={loading}
                loading={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>

              <View style={styles.helpSection}>
                <Text variant="bodySmall" style={styles.helpText}>
                  Demo Password: password123 or admin123
                </Text>
              </View>
            </>
          )}
        </Card.Content>
      </Card>

      <Snackbar
        visible={!!error}
        onDismiss={() => dispatch(loginFailure(''))}
        duration={4000}
        style={styles.snackbar}
      >
        {error}
      </Snackbar>
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
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoText: {
    fontSize: 48,
    marginBottom: 10,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  card: {
    margin: 20,
    marginTop: -20,
    borderRadius: 12,
    elevation: 8,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#1976d2',
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 12,
  },
  helpSection: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
  },
  helpText: {
    textAlign: 'center',
    color: '#666',
  },
  backButtonContainer: {
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  backButton: {
    marginLeft: -10,
  },
  employeeInfo: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  employeeDetails: {
    color: '#1976d2',
    fontWeight: '500',
    marginBottom: 4,
  },
  snackbar: {
    backgroundColor: '#d32f2f',
  },
});