import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import {Text, Button, IconButton} from 'react-native-paper';
import {useNavigation, useRoute} from '@react-navigation/native';

interface OTPVerificationScreenProps {
  route: {
    params: {
      employeeCode?: string;
      mobileNumber?: string;
      email?: string;
      verificationType?: 'forgot-password' | 'registration' | 'login';
    };
  };
}

export default function OTPVerificationScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const {employeeCode, mobileNumber, email, verificationType = 'forgot-password'} = route.params || {};

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleOtpChange = (value: string, index: number) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      alert('Please enter complete OTP');
      return;
    }

    setLoading(true);

    try {
      // API call to verify OTP
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Navigate based on verification type
      if (verificationType === 'forgot-password') {
        navigation.navigate('ResetPassword' as never, {employeeCode, otp: otpCode} as never);
      } else if (verificationType === 'registration') {
        // Navigate to complete registration
        navigation.navigate('Login' as never);
      } else {
        // Navigate to dashboard or home
        navigation.navigate('MainTabs' as never);
      }
    } catch (error) {
      alert('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setCanResend(false);
    setTimer(60);
    setOtp(['', '', '', '', '', '']);

    try {
      // API call to resend OTP
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('OTP resent successfully');
    } catch (error) {
      alert('Failed to resend OTP');
    }
  };

  const getTitle = () => {
    switch (verificationType) {
      case 'registration':
        return 'Verify Registration';
      case 'login':
        return 'Two-Factor Authentication';
      default:
        return 'Verify OTP';
    }
  };

  const getSubtitle = () => {
    const contact = email || mobileNumber || 'your contact';
    return `Enter the 6-digit code sent to ${contact}`;
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
        <Text style={styles.headerTitle}>{getTitle()}</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <View style={styles.iconCircle}>
            <IconButton icon="message-text-lock" size={60} iconColor="#1976d2" />
          </View>
        </View>

        {/* Title & Subtitle */}
        <Text style={styles.title}>{getTitle()}</Text>
        <Text style={styles.subtitle}>{getSubtitle()}</Text>

        {employeeCode && (
          <Text style={styles.employeeCode}>Employee Code: {employeeCode}</Text>
        )}

        {/* OTP Input */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => (inputRefs.current[index] = ref)}
              style={[
                styles.otpInput,
                digit && styles.otpInputFilled,
              ]}
              value={digit}
              onChangeText={value => handleOtpChange(value, index)}
              onKeyPress={e => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Timer & Resend */}
        <View style={styles.resendContainer}>
          {!canResend ? (
            <Text style={styles.timerText}>
              Resend OTP in {timer}s
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendText}>Resend OTP</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Verify Button */}
        <Button
          mode="contained"
          onPress={handleVerify}
          loading={loading}
          disabled={loading || otp.join('').length !== 6}
          style={styles.verifyButton}
          contentStyle={styles.verifyButtonContent}
          labelStyle={styles.verifyButtonLabel}>
          Verify & Continue
        </Button>

        {/* Help Text */}
        <Text style={styles.helpText}>
          Didn't receive the code? Check your spam folder or contact support.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1976d2',
    paddingTop: 45,
    paddingBottom: 15,
    paddingHorizontal: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  employeeCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976d2',
    textAlign: 'center',
    marginBottom: 30,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 30,
  },
  otpInput: {
    width: 50,
    height: 60,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  otpInputFilled: {
    borderColor: '#1976d2',
    backgroundColor: '#e3f2fd',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  timerText: {
    fontSize: 14,
    color: '#666',
  },
  resendText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '600',
  },
  verifyButton: {
    borderRadius: 25,
    marginBottom: 20,
  },
  verifyButtonContent: {
    paddingVertical: 8,
  },
  verifyButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  helpText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 30,
    lineHeight: 18,
  },
});
