import apiClient from './apiClient';

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    employeeId: string;
  };
  token: string;
}

export const authService = {
  login: async (credentials: AuthRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/useraccount/login', credentials);
    return response.data;
  },
  
  logout: async (): Promise<void> => {
    await apiClient.post('/api/useraccount/logout');
  },
  
  getCurrentUser: async (): Promise<AuthResponse['user']> => {
    const response = await apiClient.get('/api/useraccount/profile');
    return response.data;
  },
};