import React, {useState} from 'react';
import {View, StyleSheet, ScrollView, StatusBar} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Card,
  Snackbar,
  HelperText,
} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const [employeeCode, setEmployeeCode] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState<'input' | 'otp' | 'success'>('input');
  const [otp, setOtp] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateMobile = (mobile: string) => {
    const mobileRegex = /^\+?[\d\s-]{10,}$/;
    return mobileRegex.test(mobile);
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!employeeCode.trim()) {
      setError('Please enter your employee code');
      return;
    }

    if (!email.trim() && !mobileNumber.trim()) {
      setError('Please enter either email or mobile number');
      return;
    }

    if (email && !validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (mobileNumber && !validateMobile(mobileNumber)) {
      setError('Please enter a valid mobile number');
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock validation - replace with actual API call
      if (employeeCode === 'EMP001' || employeeCode === 'EMP002') {
        setStep('otp');
        setSuccess(
          `OTP has been sent to ${email || 'your mobile number ending in ' + mobileNumber.slice(-4)}`,
        );
      } else {
        setError('Employee code not found. Please check and try again.');
      }
    } catch (err) {
      setError('Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError('');

    if (!otp.trim() || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock OTP verification - replace with actual API call
      if (otp === '123456') {
        setStep('success');
        setSuccess('Password reset successful! You can now login with your new password.');
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.goBack();
  };

  const renderInputStep = () => (
    <>
      <Text variant="headlineSmall" style={styles.title}>
        Forgot Password?
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Enter your details to reset your password
      </Text>

      <TextInput
        label="Employee Code *"
        value={employeeCode}
        onChangeText={setEmployeeCode}
        style={styles.input}
        mode="outlined"
        autoCapitalize="characters"
        disabled={loading}
        left={<TextInput.Icon icon="badge-account-horizontal" />}
        placeholder="Enter your employee code"
      />

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        mode="outlined"
        keyboardType="email-address"
        autoCapitalize="none"
        disabled={loading}
        left={<TextInput.Icon icon="email" />}
        placeholder="your.email@company.com"
        error={email !== '' && !validateEmail(email)}
      />
      {email !== '' && !validateEmail(email) && (
        <HelperText type="error" visible={true}>
          Invalid email address
        </HelperText>
      )}

      <Text variant="bodyMedium" style={styles.orText}>
        OR
      </Text>

      <TextInput
        label="Mobile Number"
        value={mobileNumber}
        onChangeText={setMobileNumber}
        style={styles.input}
        mode="outlined"
        keyboardType="phone-pad"
        disabled={loading}
        left={<TextInput.Icon icon="phone" />}
        placeholder="+971 50 123 4567"
        error={mobileNumber !== '' && !validateMobile(mobileNumber)}
      />
      {mobileNumber !== '' && !validateMobile(mobileNumber) && (
        <HelperText type="error" visible={true}>
          Invalid mobile number
        </HelperText>
      )}

      <Button
        mode="contained"
        onPress={handleSubmit}
        style={styles.button}
        contentStyle={styles.buttonContent}
        disabled={loading}
        loading={loading}>
        {loading ? 'Sending...' : 'Send Reset Link'}
      </Button>

      <Button
        mode="text"
        onPress={handleBackToLogin}
        style={styles.textButton}>
        Back to Login
      </Button>
    </>
  );

  const renderOTPStep = () => (
    <>
      <Text variant="headlineSmall" style={styles.title}>
        Verify OTP
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Enter the 6-digit code sent to your email/mobile
      </Text>

      <TextInput
        label="OTP Code *"
        value={otp}
        onChangeText={setOtp}
        style={styles.input}
        mode="outlined"
        keyboardType="number-pad"
        maxLength={6}
        disabled={loading}
        left={<TextInput.Icon icon="lock-check" />}
        placeholder="123456"
      />

      <Button
        mode="contained"
        onPress={handleVerifyOTP}
        style={styles.button}
        contentStyle={styles.buttonContent}
        disabled={loading || otp.length !== 6}
        loading={loading}>
        {loading ? 'Verifying...' : 'Verify OTP'}
      </Button>

      <Button
        mode="text"
        onPress={() => handleSubmit()}
        style={styles.textButton}
        disabled={loading}>
        Resend OTP
      </Button>
    </>
  );

  const renderSuccessStep = () => (
    <>
      <View style={styles.successIcon}>
        <Text style={styles.successEmoji}>✅</Text>
      </View>
      <Text variant="headlineSmall" style={styles.title}>
        Password Reset Successful!
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Your password has been reset successfully. You can now login with your new password.
      </Text>

      <Button
        mode="contained"
        onPress={handleBackToLogin}
        style={styles.button}
        contentStyle={styles.buttonContent}>
        Back to Login
      </Button>
    </>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1976d2" />

      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>🔐</Text>
          <Text style={styles.companyName}>Password Recovery</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Card.Content>
            {step === 'input' && renderInputStep()}
            {step === 'otp' && renderOTPStep()}
            {step === 'success' && renderSuccessStep()}
          </Card.Content>
        </Card>

        <View style={styles.helpSection}>
          <Text variant="bodySmall" style={styles.helpText}>
            Need help? Contact your administrator
          </Text>
          <Text variant="bodySmall" style={styles.helpText}>
            Demo: Employee Code: EMP001, OTP: 123456
          </Text>
        </View>
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
  orText: {
    textAlign: 'center',
    color: '#999',
    marginVertical: 10,
    fontWeight: 'bold',
  },
  button: {
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 12,
  },
  textButton: {
    marginTop: 5,
  },
  helpSection: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    alignItems: 'center',
  },
  helpText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 4,
  },
  successIcon: {
    alignItems: 'center',
    marginBottom: 20,
  },
  successEmoji: {
    fontSize: 64,
  },
  snackbarError: {
    backgroundColor: '#d32f2f',
  },
  snackbarSuccess: {
    backgroundColor: '#388e3c',
  },
});
