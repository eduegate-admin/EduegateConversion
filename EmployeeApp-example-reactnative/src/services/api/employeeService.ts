import apiClient, {ApiResponse} from './apiClient';

export interface Employee {
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
  status: 'active' | 'inactive' | 'on-leave';
  permissions: string[];
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeTracking {
  id: string;
  employeeId: string;
  employee: {
    id: string;
    name: string;
    phone: string;
  };
  location: {
    lat: number;
    lng: number;
    accuracy: number;
  };
  status: 'online' | 'offline' | 'on-break';
  currentOrder?: {
    id: string;
    orderNumber: string;
    status: string;
  };
  battery: number;
  lastUpdate: string;
}

export interface EmployeePerformance {
  employeeId: string;
  period: string;
  stats: {
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    averageRating: number;
    totalRevenue: number;
    onTimeDeliveryRate: number;
  };
  ranking?: number;
}

export interface BranchAnalytics {
  branchId: string;
  branchName: string;
  period: {
    from: string;
    to: string;
  };
  sales: {
    total: number;
    orders: number;
    averageOrderValue: number;
    growth: number;
  };
  employees: {
    total: number;
    active: number;
    performance: EmployeePerformance[];
  };
  products: {
    totalSold: number;
    topSelling: Array<{
      productId: string;
      name: string;
      quantity: number;
      revenue: number;
    }>;
    lowStock: number;
  };
  orders: {
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
    completionRate: number;
  };
}

export interface UpdateLocationRequest {
  lat: number;
  lng: number;
  accuracy: number;
  battery?: number;
  status?: 'online' | 'offline' | 'on-break';
}

class EmployeeService {
  /**
   * Get list of employees
   */
  async getEmployees(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    department?: string;
    branchId?: string;
    status?: string;
  }): Promise<ApiResponse<{
    employees: Employee[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>> {
    return apiClient.get('/employees', {params});
  }

  /**
   * Get employee by ID
   */
  async getEmployeeById(employeeId: string): Promise<ApiResponse<Employee>> {
    return apiClient.get(`/employees/${employeeId}`);
  }

  /**
   * Update employee
   */
  async updateEmployee(
    employeeId: string,
    data: Partial<Employee>,
  ): Promise<ApiResponse<Employee>> {
    return apiClient.put(`/employees/${employeeId}`, data);
  }

  /**
   * Get employee tracking data
   */
  async getEmployeeTracking(employeeId?: string): Promise<ApiResponse<EmployeeTracking[]>> {
    const endpoint = employeeId
      ? `/employees/${employeeId}/tracking`
      : '/employees/tracking';
    return apiClient.get(endpoint);
  }

  /**
   * Update employee location
   */
  async updateLocation(data: UpdateLocationRequest): Promise<ApiResponse> {
    return apiClient.post('/employees/location', data);
  }

  /**
   * Get employee performance
   */
  async getEmployeePerformance(
    employeeId: string,
    period?: {from: string; to: string},
  ): Promise<ApiResponse<EmployeePerformance>> {
    return apiClient.get(`/employees/${employeeId}/performance`, {
      params: period,
    });
  }

  /**
   * Get branch analytics
   */
  async getBranchAnalytics(
    branchId: string,
    period?: {from: string; to: string},
  ): Promise<ApiResponse<BranchAnalytics>> {
    return apiClient.get(`/branches/${branchId}/analytics`, {params: period});
  }

  /**
   * Get all branches
   */
  async getBranches(): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    location: string;
    phone: string;
    email: string;
    status: string;
  }>>> {
    return apiClient.get('/branches');
  }

  /**
   * Start shift
   */
  async startShift(location: {lat: number; lng: number}): Promise<ApiResponse> {
    return apiClient.post('/employees/shift/start', {location});
  }

  /**
   * End shift
   */
  async endShift(location: {lat: number; lng: number}): Promise<ApiResponse> {
    return apiClient.post('/employees/shift/end', {location});
  }

  /**
   * Mark as on break
   */
  async startBreak(): Promise<ApiResponse> {
    return apiClient.post('/employees/break/start');
  }

  /**
   * End break
   */
  async endBreak(): Promise<ApiResponse> {
    return apiClient.post('/employees/break/end');
  }

  /**
   * Get attendance history
   */
  async getAttendance(params?: {
    from?: string;
    to?: string;
    employeeId?: string;
  }): Promise<ApiResponse<Array<{
    id: string;
    date: string;
    checkIn: string;
    checkOut?: string;
    breaks: Array<{start: string; end?: string}>;
    totalHours: number;
  }>>> {
    return apiClient.get('/employees/attendance', {params});
  }
}

// Export singleton instance
export const employeeService = new EmployeeService();

// Export default
export default employeeService;
