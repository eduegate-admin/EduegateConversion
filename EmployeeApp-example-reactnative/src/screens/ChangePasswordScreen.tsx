import React, {useState} from 'react';
import {View, StyleSheet, ScrollView, StatusBar, Alert} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Card,
  Snackbar,
  HelperText,
  IconButton,
} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';

export default function ChangePasswordScreen() {
  const navigation = useNavigation();
  const user = useSelector((state: any) => state.auth.user);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validatePassword = (password: string) => {
    // Password must be at least 8 characters with at least one uppercase, lowercase, number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return {strength: 0, label: '', color: ''};
    if (password.length < 6)
      return {strength: 1, label: 'Weak', color: '#d32f2f'};
    if (password.length < 8)
      return {strength: 2, label: 'Fair', color: '#f57c00'};
    if (!validatePassword(password))
      return {strength: 3, label: 'Good', color: '#fbc02d'};
    return {strength: 4, label: 'Strong', color: '#388e3c'};
  };

  const handleChangePassword = async () => {
    setError('');
    setSuccess('');

    // Validation
    if (!currentPassword.trim()) {
      setError('Please enter your current password');
      return;
    }

    if (!newPassword.trim()) {
      setError('Please enter a new password');
      return;
    }

    if (!validatePassword(newPassword)) {
      setError(
        'Password must be at least 8 characters with uppercase, lowercase, and number',
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match');
      return;
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from current password');
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock password change - replace with actual API call
      if (currentPassword === 'password123' || currentPassword === 'admin123') {
        setSuccess('Password changed successfully!');
        Alert.alert(
          'Success',
          'Your password has been changed successfully. Please use your new password for future logins.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ],
        );
      } else {
        setError('Current password is incorrect');
      }
    } catch (err) {
      setError('Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1976d2" />

      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          iconColor="white"
          size={24}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Change Password</Text>
          <Text style={styles.headerSubtitle}>
            {user?.name || 'User'} ({user?.employeeId || 'N/A'})
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Security Settings
            </Text>
            <Text variant="bodyMedium" style={styles.cardSubtitle}>
              Choose a strong password to keep your account secure
            </Text>

            <TextInput
              label="Current Password *"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              style={styles.input}
              mode="outlined"
              secureTextEntry={!showCurrentPassword}
              disabled={loading}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={showCurrentPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                />
              }
              placeholder="Enter current password"
            />

            <View style={styles.divider} />

            <TextInput
              label="New Password *"
              value={newPassword}
              onChangeText={setNewPassword}
              style={styles.input}
              mode="outlined"
              secureTextEntry={!showNewPassword}
              disabled={loading}
              left={<TextInput.Icon icon="lock-plus" />}
              right={
                <TextInput.Icon
                  icon={showNewPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                />
              }
              placeholder="Enter new password"
            />

            {newPassword !== '' && (
              <View style={styles.passwordStrengthContainer}>
                <View style={styles.passwordStrengthBar}>
                  {[1, 2, 3, 4].map(level => (
                    <View
                      key={level}
                      style={[
                        styles.passwordStrengthSegment,
                        {
                          backgroundColor:
                            level <= passwordStrength.strength
                              ? passwordStrength.color
                              : '#e0e0e0',
                        },
                      ]}
                    />
                  ))}
                </View>
                <Text
                  style={[
                    styles.passwordStrengthLabel,
                    {color: passwordStrength.color},
                  ]}>
                  {passwordStrength.label}
                </Text>
              </View>
            )}

            <HelperText type="info" visible={true}>
              At least 8 characters with uppercase, lowercase, and number
            </HelperText>

            <TextInput
              label="Confirm New Password *"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
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
              placeholder="Confirm new password"
              error={confirmPassword !== '' && newPassword !== confirmPassword}
            />

            {confirmPassword !== '' && newPassword !== confirmPassword && (
              <HelperText type="error" visible={true}>
                Passwords do not match
              </HelperText>
            )}

            <Button
              mode="contained"
              onPress={handleChangePassword}
              style={styles.button}
              contentStyle={styles.buttonContent}
              disabled={loading}
              loading={loading}>
              {loading ? 'Changing Password...' : 'Change Password'}
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.goBack()}
              style={styles.textButton}
              disabled={loading}>
              Cancel
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.infoCard}>
          <Card.Content>
            <Text variant="titleSmall" style={styles.infoTitle}>
              💡 Password Tips
            </Text>
            <Text variant="bodySmall" style={styles.infoText}>
              • Use at least 8 characters
            </Text>
            <Text variant="bodySmall" style={styles.infoText}>
              • Include uppercase and lowercase letters
            </Text>
            <Text variant="bodySmall" style={styles.infoText}>
              • Include at least one number
            </Text>
            <Text variant="bodySmall" style={styles.infoText}>
              • Avoid common words or patterns
            </Text>
            <Text variant="bodySmall" style={styles.infoText}>
              • Don't reuse passwords from other accounts
            </Text>
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
    fontSize: 22,
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
  scrollContent: {
    paddingBottom: 20,
  },
  card: {
    margin: 20,
    marginTop: 20,
    borderRadius: 12,
    elevation: 2,
  },
  cardTitle: {
    color: '#1976d2',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardSubtitle: {
    color: '#666',
    marginBottom: 20,
  },
  input: {
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 20,
  },
  passwordStrengthContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  passwordStrengthBar: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    gap: 4,
  },
  passwordStrengthSegment: {
    flex: 1,
    borderRadius: 3,
  },
  passwordStrengthLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
    textAlign: 'right',
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
  infoCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#e3f2fd',
  },
  infoTitle: {
    color: '#1976d2',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoText: {
    color: '#666',
    marginBottom: 5,
    lineHeight: 20,
  },
  snackbarError: {
    backgroundColor: '#d32f2f',
  },
  snackbarSuccess: {
    backgroundColor: '#388e3c',
  },
});
