import apiClient from './apiClient';

export interface Order {
  id: string;
  customerName: string;
  orderNumber: string;
  status: string;
  transactionDate: string;
  totalAmount: number;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
}

export const orderService = {
  getOrders: async (filters?: {
    status?: string;
    dateRange?: { from: string; to: string };
    employeeId?: string;
  }): Promise<Order[]> => {
    const params = new URLSearchParams();
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.dateRange) {
      params.append('dateFrom', filters.dateRange.from);
      params.append('dateTo', filters.dateRange.to);
    }
    if (filters?.employeeId) params.append('employeeId', filters.employeeId);
    
    const response = await apiClient.get(`/api/ecommerce/orders?${params}`);
    return response.data;
  },
  
  getOrderById: async (id: string): Promise<Order> => {
    const response = await apiClient.get(`/api/ecommerce/orders/${id}`);
    return response.data;
  },
  
  updateOrderStatus: async (orderId: string, status: string): Promise<void> => {
    await apiClient.put(`/api/ecommerce/orders/${orderId}/status`, { status });
  },
};