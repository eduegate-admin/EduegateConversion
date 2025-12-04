/**
 * API Services Index
 *
 * Central export point for all API service modules
 */

// Export API Client
export {default as apiClient, ApiResponse, ApiError} from './apiClient';

// Export Auth Service
export {
  default as authService,
  authService as auth,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  VerifyOTPRequest,
} from './authService';

// Export Orders Service
export {
  default as ordersService,
  ordersService as orders,
  Order,
  OrderItem,
  OrderTimelineItem,
  OrdersListParams,
  OrdersListResponse,
  UpdateOrderStatusRequest,
  AddOrderCommentRequest,
} from './ordersService';

// Export Products Service
export {
  default as productsService,
  productsService as products,
  Product,
  ProductsListParams,
  ProductsListResponse,
  CreateProductRequest,
  UpdateProductRequest,
  StockAdjustment,
  StockAdjustmentRequest,
  BulkImportRequest,
  ProductStats,
} from './productsService';

// Export Employee Service
export {
  default as employeeService,
  employeeService as employee,
  Employee,
  EmployeeTracking,
  EmployeePerformance,
  BranchAnalytics,
  UpdateLocationRequest,
} from './employeeService';

// Export POS Service
export {
  default as posService,
  posService as pos,
  POSTransaction,
  POSTransactionItem,
  CreatePOSTransactionRequest,
  ProcessPaymentRequest,
  POSStats,
} from './posService';

// Default export with all services
export default {
  auth: authService,
  orders: ordersService,
  products: productsService,
  employee: employeeService,
  pos: posService,
};
