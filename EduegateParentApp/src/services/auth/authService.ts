import { apiClient } from '../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, API_CONFIG } from '../../constants/config';

export interface LoginCredentials {
    emailOrId: string;
    password?: string;
}

export interface User {
    LoginUserID: string;
    LoginEmailID: string;
    LoginID: number;
    Name: string;
    [key: string]: any;
}

export const authService = {
    login: async (credentials: LoginCredentials): Promise<User> => {
        try {
            console.log('1. Attempting ParentLogin...');

            // Step 1: ParentLogin
            let loginResponse;
            try {
                loginResponse = await apiClient.post(
                    `${API_CONFIG.SecurityServiceUrl}/ParentLogin`,
                    {
                        LoginEmailID: credentials.emailOrId,
                        Password: credentials.password
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json; charset=utf-8',
                            'Accept': 'application/json;charset=UTF-8',
                            'CallContext': null
                        }
                    }
                );
            } catch (err: any) {
                console.error('❌ ParentLogin Request Failed:', err.message);
                throw new Error('Server error during login validation.');
            }

            if (loginResponse.data.operationResult !== 1) {
                if (loginResponse.data.operationResult === 2) {
                    throw new Error(loginResponse.data.Message || 'Invalid credentials');
                }
                throw new Error(loginResponse.data.Message || 'Login failed');
            }
            console.log('✅ ParentLogin successful');

            // Step 2: Construct Initial Context
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const isEmail = emailRegex.test(credentials.emailOrId);

            const initialContext = {
                CompanyID: "",
                EmailID: isEmail ? credentials.emailOrId : "",
                IPAddress: "1.1.1.1", // Placeholder
                LoginID: "",
                GUID: "",
                CurrencyCode: "",
                UserId: isEmail ? "0" : credentials.emailOrId,
                ApiKey: "",
                UserRole: "",
                UserClaims: "",
                LanguageCode: "en",
                SiteID: "",
                UserReferenceID: ""
            };

            // Step 3: GetUserDetails (CheckLogin)
            console.log('3. Fetching User Details...');
            let userDetailsResponse;
            try {
                userDetailsResponse = await apiClient.get(`${API_CONFIG.SecurityServiceUrl}/GetUserDetails`, {
                    headers: { 'CallContext': JSON.stringify(initialContext) }
                });
            } catch (err: any) {
                console.error('❌ GetUserDetails Failed:', err.message);
                throw new Error('Failed to fetch user details.');
            }

            const userData = userDetailsResponse.data;
            if (!userData || !userData.LoginID) {
                throw new Error('User details not found or invalid');
            }
            console.log('✅ User Details received');

            // Step 4: GenerateApiKey
            console.log('4. Generating API Key...');
            let apiKeyResponse;
            let apiKey = "";
            try {
                // Update context with user data for API key generation
                const apiKeyContext = {
                    ...initialContext,
                    EmailID: userData.LoginEmailID,
                    LoginID: userData.LoginID,
                    UserId: userData.LoginUserID
                };

                apiKeyResponse = await apiClient.get(`${API_CONFIG.RootUrl}/GenerateApiKey`, {
                    headers: { 'CallContext': JSON.stringify(apiKeyContext) },
                    params: {
                        uuid: 'react-native-parent-app', // TODO: Get real UUID
                        version: '1.0.0'
                    }
                });
                apiKey = apiKeyResponse.data;
            } catch (err: any) {
                console.error('❌ GenerateApiKey Failed:', err.message);
                throw new Error('Failed to generate API key.');
            }

            console.log('✅ API Key received');

            // Final Context Construction
            const finalContext = {
                ...initialContext,
                EmailID: userData.LoginEmailID,
                LoginID: userData.LoginID,
                UserId: userData.LoginUserID,
                ApiKey: apiKey,
            };

            // Store Data
            await AsyncStorage.multiSet([
                [STORAGE_KEYS.AUTH_TOKEN, apiKey],
                [STORAGE_KEYS.USER_DATA, JSON.stringify(userData)],
                ['@app:context', JSON.stringify(finalContext)]
            ]);

            // Step 5: RegisterUserDevice (Fire and forget or await)
            try {
                // TODO: Implement Firebase token logic
                console.log('5. Registering User Device (Skipped for now)');
            } catch (e) {
                console.warn('Device registration failed', e);
            }

            return userData;

        } catch (error: any) {
            console.error('❌ Login Process Failed:', error);
            throw error;
        }
    },

    logout: async (): Promise<void> => {
        try {
            await AsyncStorage.multiRemove([
                STORAGE_KEYS.AUTH_TOKEN,
                STORAGE_KEYS.REFRESH_TOKEN,
                STORAGE_KEYS.USER_DATA,
                '@app:context'
            ]);
            console.log('✅ Logout successful');
        } catch (error) {
            console.error('❌ Logout failed:', error);
            throw error;
        }
    },

    getCurrentUser: async (): Promise<User | null> => {
        try {
            const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            return null;
        }
    },

    isAuthenticated: async (): Promise<boolean> => {
        try {
            const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
            return !!token;
        } catch (error) {
            return false;
        }
    }
};

export default authService;
