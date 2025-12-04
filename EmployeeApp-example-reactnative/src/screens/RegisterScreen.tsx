import React, {useState} from 'react';
import {View, StyleSheet, ScrollView, StatusBar, Alert} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Card,
  Snackbar,
  HelperText,
  Checkbox,
} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

export default function RegisterScreen() {
  const navigation = useNavigation();

  const [formData, setFormData] = useState({
    employeeCode: '',
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    department: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateMobile = (mobile: string) => {
    const mobileRegex = /^\+?[\d\s-]{10,}$/;
    return mobileRegex.test(mobile);
  };

  const validatePassword = (password: string) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  };

  const handleRegister = async () => {
    setError('');
    setSuccess('');

    // Validation
    if (!formData.employeeCode.trim()) {
      setError('Employee code is required');
      return;
    }

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('First name and last name are required');
      return;
    }

    if (!formData.email.trim() || !validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!formData.mobileNumber.trim() || !validateMobile(formData.mobileNumber)) {
      setError('Please enter a valid mobile number');
      return;
    }

    if (!formData.password.trim() || !validatePassword(formData.password)) {
      setError(
        'Password must be at least 8 characters with uppercase, lowercase, and number',
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!acceptedTerms) {
      setError('You must accept the terms and conditions');
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock registration - replace with actual API call
      setSuccess('Registration successful!');
      Alert.alert(
        'Success',
        'Your account has been created successfully. Please wait for administrator approval.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login' as never),
          },
        ],
      );
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1976d2" />

      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>📝</Text>
          <Text style={styles.companyName}>New Registration</Text>
          <Text style={styles.tagline}>Create your employee account</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Employee Information
            </Text>

            <TextInput
              label="Employee Code *"
              value={formData.employeeCode}
              onChangeText={text => updateField('employeeCode', text)}
              style={styles.input}
              mode="outlined"
              autoCapitalize="characters"
              disabled={loading}
              left={<TextInput.Icon icon="badge-account-horizontal" />}
              placeholder="e.g., EMP001"
            />

            <View style={styles.row}>
              <TextInput
                label="First Name *"
                value={formData.firstName}
                onChangeText={text => updateField('firstName', text)}
                style={[styles.input, styles.halfInput]}
                mode="outlined"
                disabled={loading}
                left={<TextInput.Icon icon="account" />}
                placeholder="John"
              />

              <TextInput
                label="Last Name *"
                value={formData.lastName}
                onChangeText={text => updateField('lastName', text)}
                style={[styles.input, styles.halfInput]}
                mode="outlined"
                disabled={loading}
                placeholder="Doe"
              />
            </View>

            <TextInput
              label="Department"
              value={formData.department}
              onChangeText={text => updateField('department', text)}
              style={styles.input}
              mode="outlined"
              disabled={loading}
              left={<TextInput.Icon icon="office-building" />}
              placeholder="e.g., Operations, Sales"
            />

            <Text variant="titleLarge" style={[styles.sectionTitle, {marginTop: 20}]}>
              Contact Information
            </Text>

            <TextInput
              label="Email Address *"
              value={formData.email}
              onChangeText={text => updateField('email', text)}
              style={styles.input}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              disabled={loading}
              left={<TextInput.Icon icon="email" />}
              placeholder="john.doe@company.com"
              error={formData.email !== '' && !validateEmail(formData.email)}
            />
            {formData.email !== '' && !validateEmail(formData.email) && (
              <HelperText type="error" visible={true}>
                Invalid email address
              </HelperText>
            )}

            <TextInput
              label="Mobile Number *"
              value={formData.mobileNumber}
              onChangeText={text => updateField('mobileNumber', text)}
              style={styles.input}
              mode="outlined"
              keyboardType="phone-pad"
              disabled={loading}
              left={<TextInput.Icon icon="phone" />}
              placeholder="+971 50 123 4567"
              error={
                formData.mobileNumber !== '' &&
                !validateMobile(formData.mobileNumber)
              }
            />
            {formData.mobileNumber !== '' &&
              !validateMobile(formData.mobileNumber) && (
                <HelperText type="error" visible={true}>
                  Invalid mobile number
                </HelperText>
              )}

            <Text variant="titleLarge" style={[styles.sectionTitle, {marginTop: 20}]}>
              Security
            </Text>

            <TextInput
              label="Password *"
              value={formData.password}
              onChangeText={text => updateField('password', text)}
              style={styles.input}
              mode="outlined"
              secureTextEntry={!showPassword}
              disabled={loading}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              placeholder="Enter password"
            />
            <HelperText type="info" visible={true}>
              At least 8 characters with uppercase, lowercase, and number
            </HelperText>

            <TextInput
              label="Confirm Password *"
              value={formData.confirmPassword}
              onChangeText={text => updateField('confirmPassword', text)}
              style={styles.input}
              mode="outlined"
              secureTextEntry={!showConfirmPassword}
              disabled={loading}
              left={<TextInput.Icon icon="lock-check" />}
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              }
              placeholder="Confirm password"
              error={
                formData.confirmPassword !== '' &&
                formData.password !== formData.confirmPassword
              }
            />
            {formData.confirmPassword !== '' &&
              formData.password !== formData.confirmPassword && (
                <HelperText type="error" visible={true}>
                  Passwords do not match
                </HelperText>
              )}

            <View style={styles.checkboxContainer}>
              <Checkbox
                status={acceptedTerms ? 'checked' : 'unchecked'}
                onPress={() => setAcceptedTerms(!acceptedTerms)}
                color="#1976d2"
              />
              <Text
                variant="bodyMedium"
                style={styles.checkboxLabel}
                onPress={() => setAcceptedTerms(!acceptedTerms)}>
                I accept the{' '}
                <Text style={styles.link} onPress={() => {}}>
                  Terms and Conditions
                </Text>
              </Text>
            </View>

            <Button
              mode="contained"
              onPress={handleRegister}
              style={styles.button}
              contentStyle={styles.buttonContent}
              disabled={loading}
              loading={loading}>
              {loading ? 'Registering...' : 'Register'}
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.navigate('Login' as never)}
              style={styles.textButton}
              disabled={loading}>
              Already have an account? Login
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        duration={4000}
        style={styles.snackbarError}>
        {error}
      </Snackbar>

      <Snackbar
        visible={!!success}
        onDismiss={() => setSuccess('')}
        duration={4000}
        style={styles.snackbarSuccess}>
        {success}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  card: {
    margin: 20,
    marginTop: -20,
    borderRadius: 12,
    elevation: 8,
  },
  sectionTitle: {
    color: '#1976d2',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 5,
  },
  checkboxLabel: {
    flex: 1,
    marginLeft: 8,
    color: '#666',
  },
  link: {
    color: '#1976d2',
    textDecorationLine: 'underline',
  },
  button: {
    marginTop: 20,
    marginBottom: 10,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 12,
  },
  textButton: {
    marginTop: 5,
  },
  snackbarError: {
    backgroundColor: '#d32f2f',
  },
  snackbarSuccess: {
    backgroundColor: '#388e3c',
  },
});
