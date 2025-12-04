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
    ScrollView,
    Alert,
    ActivityIndicator
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { authService } from '../../services/auth/authService';
import { theme } from '../../constants/theme';

type LoginType = 'qid' | 'passport';

export const LoginScreen = () => {
    const navigation = useNavigation<any>();
    const [loginType, setLoginType] = useState<LoginType>('qid');
    const [qid, setQid] = useState('');
    const [passportNumber, setPassportNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (loginType === 'qid' && !qid) {
            Alert.alert('Error', 'Please enter QID Number');
            return;
        }
        if (loginType === 'passport' && !passportNumber) {
            Alert.alert('Error', 'Please enter Passport Number');
            return;
        }

        setIsLoading(true);
        try {
            await authService.login({
                qid: loginType === 'qid' ? qid : undefined,
                passportNumber: loginType === 'passport' ? passportNumber : undefined
            });

            navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
            });
        } catch (error: any) {
            Alert.alert('Login Failed', error.message || 'An error occurred during login');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#ffffff', '#f0f2f5']}
                style={styles.background}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../../assets/images/pearl_logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>

                    <View style={styles.formContainer}>
                        <View style={styles.toggleContainer}>
                            <TouchableOpacity
                                style={[styles.toggleButton, loginType === 'qid' && styles.activeToggle]}
                                onPress={() => setLoginType('qid')}
                            >
                                <Text style={[styles.toggleText, loginType === 'qid' && styles.activeToggleText]}>
                                    QID Number
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.toggleButton, loginType === 'passport' && styles.activeToggle]}
                                onPress={() => setLoginType('passport')}
                            >
                                <Text style={[styles.toggleText, loginType === 'passport' && styles.activeToggleText]}>
                                    Passport Number
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>
                            {loginType === 'qid' ? 'QID Number' : 'Type your Passport Number'}
                        </Text>

                        <View style={styles.inputContainer}>
                            {loginType === 'qid' ? (
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter 11 digit QID Number"
                                    placeholderTextColor="#999"
                                    value={qid}
                                    onChangeText={setQid}
                                    keyboardType="numeric"
                                    maxLength={11}
                                    autoCapitalize="none"
                                />
                            ) : (
                                <TextInput
                                    style={styles.input}
                                    placeholder="Passport Number"
                                    placeholderTextColor="#999"
                                    value={passportNumber}
                                    onChangeText={setPassportNumber}
                                    autoCapitalize="characters"
                                />
                            )}
                        </View>

                        <TouchableOpacity
                            style={styles.loginButton}
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.loginButtonText}>Sign In</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.registerLink} onPress={() => Alert.alert('Info', 'Registration feature coming soon')}>
                            <Text style={styles.registerText}>Don't have an account? Register</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 48,
    },
    logo: {
        width: 200,
        height: 80,
    },
    formContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 4,
        marginBottom: 24,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 6,
    },
    activeToggle: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    toggleText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    activeToggleText: {
        color: theme.colors.primary,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    input: {
        flex: 1,
        padding: 16,
        fontSize: 16,
        color: '#333',
    },
    loginButton: {
        backgroundColor: theme.colors.primary,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginBottom: 16,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    registerLink: {
        alignItems: 'center',
    },
    registerText: {
        color: theme.colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
});
