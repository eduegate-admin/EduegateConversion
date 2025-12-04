import axios, {AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration - Multiple Service URLs
const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api' // Development
  : 'https://api.skiensuite.com/api'; // Production

// Service-specific URLs (matching Cordova rootUrl structure)
export const SERVICE_URLS = {
  root: API_BASE_URL, // Main data service (RootUrl)
  user: `${API_BASE_URL}/UserService`, // User/authentication service
  ecommerce: `${API_BASE_URL}/EcommerceService`, // E-commerce operations
  product: `${API_BASE_URL}/ProductService`, // Product operations
  stock: `${API_BASE_URL}/StockManagement`, // Stock management
  customer: `${API_BASE_URL}/CustomerService`, // Customer operations
  sku: `${API_BASE_URL}/SKUService`, // SKU operations
  mutual: `${API_BASE_URL}/MutualService`, // Lookups and shared data
  image: `${API_BASE_URL}/images`, // Image base URL
};

const API_TIMEOUT = 30000; // 30 seconds

// Storage keys
const TOKEN_KEY = '@auth_token';
const REFRESH_TOKEN_KEY = '@refresh_token';
const CLIENT_CONFIG_KEY = '@client_config';
const CONTEXT_KEY = '@call_context';

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  errors?: Record<string, string[]>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiError;
}

// CallContext structure (matching Cordova pattern)
export interface CallContext {
  EmployeeID?: number;
  EmployeeName?: string;
  LoginID?: number;
  EmailID?: string;
  MobileNumber?: string;
  LanguageCode?: string;
  BranchID?: number;
  Token?: string;
  ClientID?: string;
}

class ApiClient {
  private axiosInstance: AxiosInstance;
  private authToken: string | null = null;
  private clientId: string | null = null;
  private callContext: CallContext | null = null;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        Accept: 'application/json;charset=UTF-8',
      },
    });

    this.setupInterceptors();
    this.loadAuthToken();
    this.loadCallContext();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      async config => {
        // Add auth token if available
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }

        // Add client ID if available
        if (this.clientId) {
          config.headers['X-Client-ID'] = this.clientId;
        }

        // Add CallContext header (matching Cordova pattern)
        if (this.callContext) {
          config.headers.CallContext = JSON.stringify(this.callContext);
        }

        // Log request in development
        if (__DEV__) {
          console.log('API Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            params: config.params,
            data: config.data,
            callContext: this.callContext,
          });
        }

        return config;
      },
      error => {
        console.error('Request Interceptor Error:', error);
        return Promise.reject(error);
      },
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      response => {
        // Log response in development
        if (__DEV__) {
          console.log('API Response:', {
            status: response.status,
            url: response.config.url,
            data: response.data,
          });
        }

        return response;
      },
      async error => {
        return this.handleResponseError(error);
      },
    );
  }

  /**
   * Handle response errors
   */
  private async handleResponseError(error: AxiosError): Promise<never> {
    if (__DEV__) {
      console.error('API Error:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
        data: error.response?.data,
      });
    }

    // Handle 401 Unauthorized - token expired
    if (error.response?.status === 401) {
      const refreshed = await this.refreshAuthToken();
      if (refreshed && error.config) {
        // Retry the original request
        return this.axiosInstance.request(error.config);
      } else {
        // Refresh failed, clear auth and redirect to login
        await this.clearAuth();
      }
    }

    // Handle network errors
    if (!error.response) {
      const networkError: ApiError = {
        message: 'Network error. Please check your internet connection.',
        code: 'NETWORK_ERROR',
      };
      throw networkError;
    }

    // Handle API errors
    const apiError: ApiError = {
      message:
        error.response.data?.message ||
        error.message ||
        'An unexpected error occurred',
      code: error.response.data?.code || error.code,
      status: error.response.status,
      errors: error.response.data?.errors,
    };

    throw apiError;
  }

  /**
   * Load auth token from storage
   */
  private async loadAuthToken(): Promise<void> {
    try {
      const [token, clientConfig] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(CLIENT_CONFIG_KEY),
      ]);

      this.authToken = token;
      if (clientConfig) {
        const config = JSON.parse(clientConfig);
        this.clientId = config.clientId;
      }
    } catch (error) {
      console.error('Failed to load auth token:', error);
    }
  }

  /**
   * Load call context from storage
   */
  private async loadCallContext(): Promise<void> {
    try {
      const context = await AsyncStorage.getItem(CONTEXT_KEY);
      if (context) {
        this.callContext = JSON.parse(context);
      }
    } catch (error) {
      console.error('Failed to load call context:', error);
    }
  }

  /**
   * Set auth token
   */
  async setAuthToken(token: string, refreshToken?: string): Promise<void> {
    this.authToken = token;
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
      if (refreshToken) {
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      }
    } catch (error) {
      console.error('Failed to save auth token:', error);
    }
  }

  /**
   * Set client configuration
   */
  async setClientConfig(clientId: string, config?: any): Promise<void> {
    this.clientId = clientId;
    try {
      await AsyncStorage.setItem(
        CLIENT_CONFIG_KEY,
        JSON.stringify({clientId, ...config}),
      );
    } catch (error) {
      console.error('Failed to save client config:', error);
    }
  }

  /**
   * Set call context (Cordova pattern)
   */
  async setCallContext(context: CallContext): Promise<void> {
    this.callContext = context;
    try {
      await AsyncStorage.setItem(CONTEXT_KEY, JSON.stringify(context));
    } catch (error) {
      console.error('Failed to save call context:', error);
    }
  }

  /**
   * Get call context
   */
  getCallContext(): CallContext | null {
    return this.callContext;
  }

  /**
   * Clear auth data
   */
  async clearAuth(): Promise<void> {
    this.authToken = null;
    this.clientId = null;
    this.callContext = null;
    try {
      await AsyncStorage.multiRemove([
        TOKEN_KEY,
        REFRESH_TOKEN_KEY,
        CLIENT_CONFIG_KEY,
        CONTEXT_KEY,
      ]);
    } catch (error) {
      console.error('Failed to clear auth:', error);
    }
  }

  /**
   * Refresh auth token
   */
  private async refreshAuthToken(): Promise<boolean> {
    try {
      const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        return false;
      }

      const response = await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        {refreshToken},
        {timeout: API_TIMEOUT},
      );

      const {token, refreshToken: newRefreshToken} = response.data.data;
      await this.setAuthToken(token, newRefreshToken);
      return true;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return false;
    }
  }

  /**
   * GET request
   */
  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> =
        await this.axiosInstance.get(url, config);
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error as ApiError,
      };
    }
  }

  /**
   * POST request
   */
  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> =
        await this.axiosInstance.post(url, data, config);
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error as ApiError,
      };
    }
  }

  /**
   * PUT request
   */
  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> =
        await this.axiosInstance.put(url, data, config);
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error as ApiError,
      };
    }
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> =
        await this.axiosInstance.patch(url, data, config);
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error as ApiError,
      };
    }
  }

  /**
   * DELETE request
   */
  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> =
        await this.axiosInstance.delete(url, config);
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error as ApiError,
      };
    }
  }

  /**
   * Upload file with progress tracking
   */
  async upload<T = any>(
    url: string,
    formData: FormData,
    onProgress?: (progress: number) => void,
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> =
        await this.axiosInstance.post(url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: progressEvent => {
            if (onProgress && progressEvent.total) {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total,
              );
              onProgress(progress);
            }
          },
        });
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error as ApiError,
      };
    }
  }

  /**
   * Get the Axios instance for custom requests
   */
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  /**
   * Make request with custom base URL (for multiple service endpoints)
   */
  async request<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    serviceUrl: string,
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${serviceUrl}${endpoint}`;
      const requestConfig: AxiosRequestConfig = {
        ...config,
        method,
        url,
        data,
      };

      const response: AxiosResponse<ApiResponse<T>> =
        await this.axiosInstance.request(requestConfig);
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error as ApiError,
      };
    }
  }

  /**
   * GET request with custom service URL
   */
  async getFromService<T = any>(
    serviceUrl: string,
    endpoint: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>('GET', serviceUrl, endpoint, undefined, config);
  }

  /**
   * POST request with custom service URL
   */
  async postToService<T = any>(
    serviceUrl: string,
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>('POST', serviceUrl, endpoint, data, config);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export default
export default apiClient;
