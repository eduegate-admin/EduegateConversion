import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, TIMEOUT, STORAGE_KEYS } from '../../constants/config';

// Create API client without baseURL - services will use full URLs
export const apiClient = axios.create({
    timeout: TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            // Add Legacy CallContext
            const callContext = await AsyncStorage.getItem('@app:context');
            if (callContext) {
                config.headers.CallContext = callContext;
            }

            console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
            console.log('📋 Headers:', JSON.stringify(config.headers, null, 2));
        } catch (error) {
            console.error('Error getting auth token:', error);
        }
        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
    (response) => {
        console.log('📥 API Response:', response.status, response.config.url);
        return response;
    },
    async (error) => {
        console.error('❌ Response Error:', error.response?.status, error.message);

        // Handle 401 - Unauthorized
        if (error.response?.status === 401) {
            try {
                // Clear auth data
                await AsyncStorage.multiRemove([
                    STORAGE_KEYS.AUTH_TOKEN,
                    STORAGE_KEYS.REFRESH_TOKEN,
                    STORAGE_KEYS.USER_DATA,
                    '@app:context'
                ]);
                console.log('🔒 Session expired - cleared auth data');
                // TODO: Navigate to login screen
            } catch (clearError) {
                console.error('Error clearing auth data:', clearError);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
