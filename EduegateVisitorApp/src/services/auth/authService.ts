import { apiClient } from '../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, API_CONFIG } from '../../constants/config';

export interface LoginCredentials {
    qid?: string;
    passportNumber?: string;
}

export interface VisitorDetails {
    VisitorNumber: string;
    EmailID: string;
    // Add other fields as needed
    [key: string]: any;
}

export interface User {
    LoginUserID: string;
    LoginEmailID: string;
    LoginID: number;
    Name: string;
    [key: string]: any;
}

export interface LoginResponse {
    user: User;
    apiKey: string;
    visitorDetails: VisitorDetails;
}

export const authService = {
    login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
        try {
            console.log('1. Attempting VisitorLogin...');

            // Step 1: VisitorLogin
            let loginResponse;
            try {
                loginResponse = await apiClient.post(
                    `${API_CONFIG.SecurityServiceUrl}/VisitorLogin`,
                    {
                        QID: credentials.qid || null,
                        PassportNumber: credentials.passportNumber || null
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json; charset=utf-8',
                            'Accept': 'application/json;charset=UTF-8',
                            'CallContext': null // Explicitly null as per legacy
                        }
                    }
                );
            } catch (err: any) {
                console.error('❌ VisitorLogin Request Failed:', err.message);
                throw new Error('Server error during login validation.');
            }

            if (loginResponse.data.operationResult !== 1) {
                if (loginResponse.data.operationResult === 2) {
                    throw new Error('User not registered. Please register first.');
                }
                throw new Error(loginResponse.data.Message || 'Login failed');
            }
            console.log('✅ VisitorLogin successful');

            // Step 2: GetVisitorDetails
            console.log('2. Fetching Visitor Details...');
            let visitorDetailsResponse;
            try {
                const qidParam = credentials.qid || '';
                const passportParam = credentials.passportNumber || '';
                visitorDetailsResponse = await apiClient.get(
                    `${API_CONFIG.SchoolServiceUrl}/GetVisitorDetails?QID=${qidParam}&passportNumber=${passportParam}`,
                    {
                        headers: {
                            'Content-Type': 'application/json; charset=utf-8',
                            'Accept': 'application/json;charset=UTF-8',
                            'CallContext': null
                        }
                    }
                );
            } catch (err: any) {
                console.error('❌ GetVisitorDetails Failed:', err.message);
                throw new Error('Failed to fetch visitor details.');
            }

            const visitorDetails = visitorDetailsResponse.data;
            if (!visitorDetails) {
                throw new Error('Visitor details not found');
            }
            console.log('✅ Visitor Details received');

            // Step 3: GetUserDetails (using context from visitor details)
            console.log('3. Fetching User Details...');

            // Construct context based on visitor details
            const context = {
                CompanyID: "",
                EmailID: visitorDetails.EmailID || "",
                IPAddress: "",
                LoginID: "",
                GUID: "",
                CurrencyCode: "",
                UserId: visitorDetails.VisitorNumber || "0",
                ApiKey: "",
                UserRole: "",
                UserClaims: "",
                LanguageCode: "en",
                SiteID: "",
                UserReferenceID: ""
            };
            const callContextString = JSON.stringify(context);

            let userDetailsResponse;
            try {
                userDetailsResponse = await apiClient.get(`${API_CONFIG.SecurityServiceUrl}/GetUserDetails`, {
                    headers: { 'CallContext': callContextString }
                });
            } catch (err: any) {
                console.error('❌ GetUserDetails Failed:', err.message);
                throw new Error('Failed to fetch user details.');
            }

            const userData = userDetailsResponse.data;
            if (!userData || !userData.LoginEmailID) {
                throw new Error('User details not found or invalid');
            }
            console.log('✅ User Details received');

            // Step 4: GenerateApiKey
            console.log('4. Generating API Key...');
            let apiKeyResponse;
            try {
                // Update context with user data for API key generation
                const apiKeyContext = {
                    ...context,
                    EmailID: userData.LoginEmailID,
                    LoginID: userData.LoginID,
                    UserId: userData.LoginUserID
                };

                apiKeyResponse = await apiClient.get(`${API_CONFIG.RootUrl}/GenerateApiKey`, {
                    headers: { 'CallContext': JSON.stringify(apiKeyContext) },
                    params: {
                        uuid: 'react-native-visitor-app',
                        version: '1.0.0'
                    }
                });
            } catch (err: any) {
                console.error('❌ GenerateApiKey Failed:', err.message);
                throw new Error('Failed to generate API key.');
            }

            const apiKey = apiKeyResponse.data;
            console.log('✅ API Key received');

            // Final Context Construction
            const finalContext = {
                ...context,
                EmailID: userData.LoginEmailID,
                LoginID: userData.LoginID,
                UserId: userData.LoginUserID,
                ApiKey: apiKey,
                // Add other fields if needed from userData
            };

            // Store Data
            await AsyncStorage.multiSet([
                [STORAGE_KEYS.AUTH_TOKEN, apiKey],
                [STORAGE_KEYS.USER_DATA, JSON.stringify(userData)],
                ['@app:visitor_details', JSON.stringify(visitorDetails)],
                ['@app:context', JSON.stringify(finalContext)]
            ]);

            return { user: userData, apiKey, visitorDetails };

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
                '@app:visitor_details',
                '@app:context'
            ]);
            console.log('✅ Logout successful');
        } catch (error) {
            console.error('❌ Logout failed:', error);
            throw error;
        }
    },

    getVisitorDetails: async (): Promise<VisitorDetails | null> => {
        try {
            const details = await AsyncStorage.getItem('@app:visitor_details');
            return details ? JSON.parse(details) : null;
        } catch (error) {
            return null;
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
