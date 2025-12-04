import { apiClient } from '../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, API_CONFIG } from '../../constants/config';

export interface LoginCredentials {
    employeeCode: string;
    password: string;
    tenantId?: string;
}

export interface User {
    LoginUserID: string;
    LoginEmailID: string;
    SchoolID: number;
    LoginID: number;
    Name: string;
    isDriver?: boolean;
    // Added for compatibility with HomeScreen
    name?: string;
    employeeCode?: string;
    Employee?: {
        EmployeeIID: number;
        EmployeeRoles?: Array<{ Value: string }>;
        EmployeeName?: string;
        EmployeeCode?: string;
        EmployeeProfileImageUrl?: string;
    };
}

export interface LoginResponse {
    user: User;
    apiKey: string;
}

export const authService = {
    login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
        try {
            console.log('1. Attempting StaffLogin...');
            let loginResponse;
            try {
                loginResponse = await apiClient.post(
                    `${API_CONFIG.SecurityServiceUrl}/StaffLogin`,
                    {
                        LoginUserID: credentials.employeeCode,
                        Password: credentials.password,
                        LoginEmailID: "" // Empty string instead of null
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json; charset=utf-8',
                            'Accept': 'application/json;charset=UTF-8',
                            'CallContext': '{}', // Empty JSON object
                            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Pixel 3 XL Build/QQ3A.200805.001) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.72 Mobile Safari/537.36'
                        }
                    }
                );
            } catch (err: any) {
                console.error('❌ StaffLogin Request Failed:', err.message, err.response?.data);
                throw new Error('Server error during login validation.');
            }

            if (loginResponse.data.operationResult !== 1) {
                throw new Error(loginResponse.data.Message || 'Login failed');
            }
            console.log('✅ StaffLogin successful');

            console.log('2. Fetching User Details...');
            console.log('2. Fetching User Details...');
            // Initial context for fetching user details
            const initialContext = {
                CompanyID: "",
                EmailID: "",
                IPAddress: "",
                LoginID: "",
                GUID: "",
                CurrencyCode: "",
                UserId: credentials.employeeCode,
                ApiKey: "",
                UserRole: "",
                UserClaims: "",
                LanguageCode: "en",
                SiteID: "",
                UserReferenceID: ""
            };
            const callContextString = JSON.stringify(initialContext);

            let userDetailsResponse;
            try {
                userDetailsResponse = await apiClient.get(`${API_CONFIG.RootUrl}/GetUserDetails`, {
                    headers: { 'CallContext': callContextString }
                });
            } catch (err: any) {
                console.error('❌ GetUserDetails Failed:', err.message);
                throw new Error('Failed to fetch user details.');
            }

            const userData = userDetailsResponse.data;
            if (!userData) {
                throw new Error('User details not found');
            }
            console.log('✅ User Details received');

            console.log('3. Generating API Key...');
            let apiKeyResponse;
            try {
                apiKeyResponse = await apiClient.get(`${API_CONFIG.RootUrl}/GenerateApiKey`, {
                    headers: { 'CallContext': callContextString },
                    params: {
                        uuid: 'react-native-app',
                        version: '1.0.0'
                    }
                });
            } catch (err: any) {
                console.error('❌ GenerateApiKey Failed:', err.message);
                throw new Error('Failed to generate API key.');
            }

            const apiKey = apiKeyResponse.data;
            console.log('✅ API Key received');

            const user: User = {
                ...userData,
                isDriver: false,
                name: userData.Name,
                employeeCode: userData.LoginUserID || credentials.employeeCode
            };

            let userRolesString = "";
            if (user.Employee?.EmployeeRoles) {
                const roles = user.Employee.EmployeeRoles.map((r: any) => r.Value);
                user.isDriver = roles.includes('Driver');
                userRolesString = roles.join('');
            }

            // Construct full CallContext matching legacy app
            const fullContext = {
                CompanyID: "",
                EmailID: user.LoginEmailID || "",
                IPAddress: "",
                LoginID: user.LoginID?.toString() || "",
                GUID: "",
                CurrencyCode: "",
                UserId: user.LoginUserID || credentials.employeeCode,
                ApiKey: apiKey,
                UserRole: "",
                UserClaims: "",
                LanguageCode: "en",
                SiteID: "",
                UserReferenceID: "",
                EmployeeID: user.Employee?.EmployeeIID || null,
                SchoolID: user.SchoolID || null,
                UserRoles: userRolesString
            };

            const finalCallContext = JSON.stringify(fullContext);

            await AsyncStorage.multiSet([
                [STORAGE_KEYS.AUTH_TOKEN, apiKey],
                [STORAGE_KEYS.USER_DATA, JSON.stringify(user)],
                [STORAGE_KEYS.IS_DRIVER, user.isDriver?.toString() || 'false'],
                ['@app:context', finalCallContext]
            ]);

            return { user, apiKey };

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
                STORAGE_KEYS.IS_DRIVER,
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
            console.error('Error getting current user:', error);
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
    },

    isDriver: async (): Promise<boolean> => {
        try {
            const isDriver = await AsyncStorage.getItem(STORAGE_KEYS.IS_DRIVER);
            return isDriver === 'true';
        } catch (error) {
            return false;
        }
    },

    getAccessToken: async (): Promise<string | null> => {
        try {
            return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        } catch (error) {
            return null;
        }
    },

    getCallContext: async (): Promise<string | null> => {
        try {
            return await AsyncStorage.getItem('@app:context');
        } catch (error) {
            return null;
        }
    }
};

export default authService;
