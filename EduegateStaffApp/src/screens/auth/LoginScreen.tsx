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
    Alert,
    Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { authService } from '../../services/auth/authService';
import { theme } from '../../constants/theme';

export const LoginScreen: React.FC = () => {
    const [employeeCode, setEmployeeCode] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigation = useNavigation();

    const handleLogin = async () => {
        // Validation
        if (!employeeCode || !password) {
            setError('Please enter employee code and password');
            return;
        }

        if (password.length < 6) {
            setError('Password should be at least 6 characters long');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await authService.login({
                employeeCode,
                password
            });

            console.log('Login successful for:', response.user.LoginEmailID);

            // Check if user is driver and handle accordingly
            if (response.user.isDriver) {
                console.log('User is a driver - will enable location tracking');
                // TODO: Start background location tracking
                // await startLocationTracking(true);
            }

            // Navigate to home screen
            navigation.navigate('Home');

        } catch (err: any) {
            console.error('Login error:', err);
            const errorMessage =
                err.response?.data?.message ||
                err.message ||
                'Login failed. Please check your credentials and try again.';
            setError(errorMessage);

            // Show alert for critical errors
            if (err.response?.status === 500) {
                Alert.alert(
                    'Server Error',
                    'Unable to connect to server. Please try again later.',
                    [{ text: 'OK' }]
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = () => {
        // Navigate to reset password screen
        navigation.navigate('ResetPassword');
    };

    const handleBiometricLogin = () => {
        // Navigate to biometric auth screen
        navigation.navigate('BiometricAuth');
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.content}>
                {/* Logo/Header */}
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <View style={styles.logoCircle}>
                            <Text style={styles.logoText}>ES</Text>
                        </View>
                    </View>
                    <Text style={styles.title}>Staff Portal</Text>
                    <Text style={styles.subtitle}>Sign in to continue</Text>
                </View>

                {/* Error Message */}
                {error ? (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>⚠️ {error}</Text>
                    </View>
                ) : null}

                {/* Form */}
                <View style={styles.form}>
                    {/* Employee Code Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Employee Code</Text>
                        <TextInput
                            style={[styles.input, error && styles.inputError]}
                            placeholder="Enter your employee code"
                            placeholderTextColor={theme.colors.gray[400]}
                            value={employeeCode}
                            onChangeText={(text) => {
                                setEmployeeCode(text);
                                setError('');
                            }}
                            autoCapitalize="none"
                            keyboardType="default"
                            autoComplete="off"
                            editable={!loading}
                            returnKeyType="next"
                        />
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={[styles.input, error && styles.inputError]}
                            placeholder="Enter your password"
                            placeholderTextColor={theme.colors.gray[400]}
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                setError('');
                            }}
                            secureTextEntry
                            autoComplete="password"
                            editable={!loading}
                            returnKeyType="done"
                            onSubmitEditing={handleLogin}
                        />
                    </View>

                    {/* Forgot Password Link */}
                    <TouchableOpacity
                        style={styles.forgotPasswordContainer}
                        onPress={handleForgotPassword}
                        disabled={loading}
                    >
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    {/* Login Button */}
                    <TouchableOpacity
                        style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={styles.loginButtonText}>Sign In</Text>
                        )}
                    </TouchableOpacity>

                    {/* Divider */}
                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Biometric Login Button */}
                    <TouchableOpacity
                        style={styles.biometricButton}
                        onPress={handleBiometricLogin}
                        disabled={loading}
                    >
                        <Text style={styles.biometricIcon}>🔐</Text>
                        <Text style={styles.biometricText}>Use Biometric</Text>
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Eduegate Staff App v1.0.0</Text>
                </View>
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
        marginBottom: 40,
    },
    logoContainer: {
        marginBottom: 16,
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.shadows.md,
    },
    logoText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colors.primary,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.gray[600],
    },
    errorContainer: {
        backgroundColor: '#fee',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: theme.colors.danger,
    },
    errorText: {
        color: theme.colors.danger,
        textAlign: 'center',
        fontSize: 14,
    },
    form: {
        width: '100%',
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.dark,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: theme.colors.gray[300],
        borderRadius: 8,
        padding: 16,
        fontSize: 16,
        color: theme.colors.dark,
        backgroundColor: '#fff',
    },
    inputError: {
        borderColor: theme.colors.danger,
    },
    forgotPasswordContainer: {
        alignItems: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordText: {
        color: theme.colors.primary,
        fontSize: 14,
        fontWeight: '500',
    },
    loginButton: {
        backgroundColor: theme.colors.primary,
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        ...theme.shadows.sm,
    },
    loginButtonDisabled: {
        opacity: 0.6,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: theme.colors.gray[300],
    },
    dividerText: {
        marginHorizontal: 16,
        color: theme.colors.gray[500],
        fontSize: 14,
    },
    biometricButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: theme.colors.primary,
        borderRadius: 8,
        padding: 14,
    },
    biometricIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    biometricText: {
        color: theme.colors.primary,
        fontSize: 16,
        fontWeight: '500',
    },
    footer: {
        marginTop: 32,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: theme.colors.gray[500],
    },
});

export default LoginScreen;
