import apiClient, {ApiResponse} from './apiClient';

export interface POSTransaction {
  id: string;
  transactionNumber: string;
  items: POSTransactionItem[];
  customer?: {
    id: string;
    name: string;
    phone: string;
    loyaltyPoints?: number;
  };
  pricing: {
    subtotal: number;
    discount: number;
    discountPercent: number;
    tax: number;
    taxRate: number;
    total: number;
  };
  payment: {
    method: 'cash' | 'card' | 'wallet';
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    amountTendered?: number;
    change?: number;
    cardLast4?: string;
    walletType?: string;
    transactionId?: string;
  };
  employee: {
    id: string;
    name: string;
  };
  branch: {
    id: string;
    name: string;
  };
  status: 'draft' | 'completed' | 'cancelled' | 'refunded';
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

export interface POSTransactionItem {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  discount: number;
  tax: number;
  total: number;
}

export interface CreatePOSTransactionRequest {
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
    discount?: number;
  }>;
  customerId?: string;
  discountPercent?: number;
  notes?: string;
}

export interface ProcessPaymentRequest {
  transactionId: string;
  paymentMethod: 'cash' | 'card' | 'wallet';
  amountTendered?: number;
  cardLast4?: string;
  walletType?: string;
  sendReceipt?: {
    email?: string;
    sms?: string;
  };
}

export interface POSStats {
  today: {
    transactions: number;
    revenue: number;
    averageTransaction: number;
  };
  week: {
    transactions: number;
    revenue: number;
    averageTransaction: number;
  };
  month: {
    transactions: number;
    revenue: number;
    averageTransaction: number;
  };
  paymentMethods: {
    cash: {count: number; amount: number};
    card: {count: number; amount: number};
    wallet: {count: number; amount: number};
  };
}

class POSService {
  /**
   * Create new POS transaction
   */
  async createTransaction(
    data: CreatePOSTransactionRequest,
  ): Promise<ApiResponse<POSTransaction>> {
    return apiClient.post('/pos/transactions', data);
  }

  /**
   * Get transaction by ID
   */
  async getTransaction(transactionId: string): Promise<ApiResponse<POSTransaction>> {
    return apiClient.get(`/pos/transactions/${transactionId}`);
  }

  /**
   * Update transaction (draft only)
   */
  async updateTransaction(
    transactionId: string,
    data: Partial<CreatePOSTransactionRequest>,
  ): Promise<ApiResponse<POSTransaction>> {
    return apiClient.put(`/pos/transactions/${transactionId}`, data);
  }

  /**
   * Process payment for transaction
   */
  async processPayment(
    data: ProcessPaymentRequest,
  ): Promise<ApiResponse<POSTransaction>> {
    return apiClient.post(`/pos/transactions/${data.transactionId}/payment`, data);
  }

  /**
   * Cancel transaction
   */
  async cancelTransaction(
    transactionId: string,
    reason?: string,
  ): Promise<ApiResponse<POSTransaction>> {
    return apiClient.post(`/pos/transactions/${transactionId}/cancel`, {reason});
  }

  /**
   * Refund transaction
   */
  async refundTransaction(
    transactionId: string,
    data: {
      reason: string;
      amount?: number;
      items?: Array<{
        productId: string;
        quantity: number;
      }>;
    },
  ): Promise<ApiResponse<POSTransaction>> {
    return apiClient.post(`/pos/transactions/${transactionId}/refund`, data);
  }

  /**
   * Get transaction history
   */
  async getTransactions(params?: {
    page?: number;
    limit?: number;
    status?: string;
    paymentMethod?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }): Promise<ApiResponse<{
    transactions: POSTransaction[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>> {
    return apiClient.get('/pos/transactions', {params});
  }

  /**
   * Get POS statistics
   */
  async getStats(params?: {
    dateFrom?: string;
    dateTo?: string;
    branchId?: string;
  }): Promise<ApiResponse<POSStats>> {
    return apiClient.get('/pos/stats', {params});
  }

  /**
   * Print receipt
   */
  async printReceipt(transactionId: string): Promise<ApiResponse> {
    return apiClient.post(`/pos/transactions/${transactionId}/print`);
  }

  /**
   * Send receipt via email
   */
  async sendReceiptEmail(
    transactionId: string,
    email: string,
  ): Promise<ApiResponse> {
    return apiClient.post(`/pos/transactions/${transactionId}/send-email`, {email});
  }

  /**
   * Send receipt via SMS
   */
  async sendReceiptSMS(
    transactionId: string,
    phone: string,
  ): Promise<ApiResponse> {
    return apiClient.post(`/pos/transactions/${transactionId}/send-sms`, {phone});
  }

  /**
   * Search customer for POS
   */
  async searchCustomer(query: string): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    phone: string;
    email?: string;
    loyaltyPoints?: number;
  }>>> {
    return apiClient.get('/pos/customers/search', {params: {q: query}});
  }

  /**
   * Open cash drawer
   */
  async openCashDrawer(reason: string): Promise<ApiResponse> {
    return apiClient.post('/pos/cash-drawer/open', {reason});
  }

  /**
   * Record cash drawer activity
   */
  async recordCashActivity(data: {
    type: 'add' | 'remove';
    amount: number;
    reason: string;
    reference?: string;
  }): Promise<ApiResponse> {
    return apiClient.post('/pos/cash-drawer/activity', data);
  }

  /**
   * Get cash drawer balance
   */
  async getCashDrawerBalance(): Promise<ApiResponse<{
    openingBalance: number;
    currentBalance: number;
    expectedBalance: number;
    difference: number;
    transactions: {
      cash: number;
      card: number;
      wallet: number;
    };
  }>> {
    return apiClient.get('/pos/cash-drawer/balance');
  }

  /**
   * Close cash drawer (end of shift)
   */
  async closeCashDrawer(data: {
    actualCash: number;
    notes?: string;
  }): Promise<ApiResponse<{
    openingBalance: number;
    expectedBalance: number;
    actualBalance: number;
    difference: number;
  }>> {
    return apiClient.post('/pos/cash-drawer/close', data);
  }
}

// Export singleton instance
export const posService = new POSService();

// Export default
export default posService;
