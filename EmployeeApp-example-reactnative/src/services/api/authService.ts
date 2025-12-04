import apiClient, {ApiResponse} from './apiClient';

export interface LoginRequest {
  employeeCode: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  employee: {
    id: string;
    employeeCode: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    department: string;
    branch: {
      id: string;
      name: string;
      location: string;
    };
    permissions: string[];
  };
  clientConfig: {
    clientId: string;
    clientName: string;
    logo: string;
    theme: {
      primaryColor: string;
      secondaryColor: string;
    };
    features: string[];
  };
}

export interface RegisterRequest {
  employeeCode: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordRequest {
  employeeCode: string;
  email?: string;
  phone?: string;
}

export interface ResetPasswordRequest {
  employeeCode: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface VerifyOTPRequest {
  employeeCode: string;
  otp: string;
}

class AuthService {
  /**
   * Login with employee credentials
   */
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);

    if (response.success && response.data) {
      // Save auth token and client config
      await apiClient.setAuthToken(
        response.data.token,
        response.data.refreshToken,
      );
      await apiClient.setClientConfig(
        response.data.clientConfig.clientId,
        response.data.clientConfig,
      );
    }

    return response;
  }

  /**
   * Logout current user
   */
  async logout(): Promise<ApiResponse> {
    const response = await apiClient.post('/auth/logout');
    await apiClient.clearAuth();
    return response;
  }

  /**
   * Register new employee
   */
  async register(data: RegisterRequest): Promise<ApiResponse> {
    return apiClient.post('/auth/register', data);
  }

  /**
   * Request password reset
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<ApiResponse> {
    return apiClient.post('/auth/forgot-password', data);
  }

  /**
   * Verify OTP
   */
  async verifyOTP(data: VerifyOTPRequest): Promise<ApiResponse> {
    return apiClient.post('/auth/verify-otp', data);
  }

  /**
   * Reset password with OTP
   */
  async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse> {
    return apiClient.post('/auth/reset-password', data);
  }

  /**
   * Change password for logged in user
   */
  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse> {
    return apiClient.post('/auth/change-password', data);
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<ApiResponse<LoginResponse['employee']>> {
    return apiClient.get('/auth/profile');
  }

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<LoginResponse['employee']>): Promise<ApiResponse> {
    return apiClient.put('/auth/profile', data);
  }

  /**
   * Refresh auth token
   */
  async refreshToken(refreshToken: string): Promise<ApiResponse<{token: string; refreshToken: string}>> {
    return apiClient.post('/auth/refresh', {refreshToken});
  }
}

// Export singleton instance
export const authService = new AuthService();

// Export default
export default authService;
