import apiClient, {ApiResponse} from './apiClient';

export interface Order {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  status: 'new' | 'pending' | 'processing' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  items: OrderItem[];
  pricing: {
    subtotal: number;
    deliveryCharge: number;
    discount: number;
    tax: number;
    total: number;
  };
  paymentMethod: 'cash' | 'card' | 'online';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  deliveryDate?: string;
  deliveryNotes?: string;
  assignedTo?: {
    id: string;
    name: string;
    role: string;
  };
  branch: {
    id: string;
    name: string;
  };
  timeline: OrderTimelineItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  discount: number;
  tax: number;
  total: number;
  substitution?: {
    productId: string;
    name: string;
    reason: string;
  };
}

export interface OrderTimelineItem {
  id: string;
  timestamp: string;
  status: string;
  description: string;
  employee?: {
    id: string;
    name: string;
  };
}

export interface OrdersListParams {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  search?: string;
  sortBy?: 'date' | 'amount' | 'status';
  sortOrder?: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
  assignedToMe?: boolean;
}

export interface OrdersListResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UpdateOrderStatusRequest {
  status: Order['status'];
  notes?: string;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface AddOrderCommentRequest {
  comment: string;
  type?: 'note' | 'issue' | 'update';
}

class OrdersService {
  /**
   * Get list of orders with filters
   */
  async getOrders(params?: OrdersListParams): Promise<ApiResponse<OrdersListResponse>> {
    return apiClient.get('/orders', {params});
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId: string): Promise<ApiResponse<Order>> {
    return apiClient.get(`/orders/${orderId}`);
  }

  /**
   * Get orders assigned to current employee
   */
  async getMyOrders(params?: OrdersListParams): Promise<ApiResponse<OrdersListResponse>> {
    return apiClient.get('/orders/my-orders', {params});
  }

  /**
   * Update order status
   */
  async updateOrderStatus(
    orderId: string,
    data: UpdateOrderStatusRequest,
  ): Promise<ApiResponse<Order>> {
    return apiClient.patch(`/orders/${orderId}/status`, data);
  }

  /**
   * Add comment to order
   */
  async addOrderComment(
    orderId: string,
    data: AddOrderCommentRequest,
  ): Promise<ApiResponse> {
    return apiClient.post(`/orders/${orderId}/comments`, data);
  }

  /**
   * Assign order to employee
   */
  async assignOrder(orderId: string, employeeId: string): Promise<ApiResponse<Order>> {
    return apiClient.post(`/orders/${orderId}/assign`, {employeeId});
  }

  /**
   * Get order statistics
   */
  async getOrderStats(params?: {
    dateFrom?: string;
    dateTo?: string;
    branchId?: string;
  }): Promise<ApiResponse<{
    total: number;
    new: number;
    pending: number;
    processing: number;
    completed: number;
    cancelled: number;
    revenue: number;
  }>> {
    return apiClient.get('/orders/stats', {params});
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string, reason: string): Promise<ApiResponse<Order>> {
    return apiClient.post(`/orders/${orderId}/cancel`, {reason});
  }

  /**
   * Mark order as delivered
   */
  async markAsDelivered(
    orderId: string,
    data: {
      signature?: string;
      photo?: string;
      notes?: string;
      location: {lat: number; lng: number};
      cashCollected?: number;
    },
  ): Promise<ApiResponse<Order>> {
    return apiClient.post(`/orders/${orderId}/deliver`, data);
  }

  /**
   * Report delivery issue
   */
  async reportIssue(
    orderId: string,
    data: {
      type: 'customer_not_available' | 'wrong_address' | 'customer_refused' | 'other';
      description: string;
      location?: {lat: number; lng: number};
      photo?: string;
    },
  ): Promise<ApiResponse> {
    return apiClient.post(`/orders/${orderId}/report-issue`, data);
  }

  /**
   * Get delivery route optimization
   */
  async optimizeRoute(orderIds: string[]): Promise<ApiResponse<{
    optimizedOrder: Array<{
      orderId: string;
      sequence: number;
      distance: number;
      estimatedTime: number;
    }>;
    totalDistance: number;
    totalTime: number;
  }>> {
    return apiClient.post('/orders/optimize-route', {orderIds});
  }
}

// Export singleton instance
export const ordersService = new OrdersService();

// Export default
export default ordersService;
