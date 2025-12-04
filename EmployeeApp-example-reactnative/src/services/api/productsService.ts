import apiClient, {ApiResponse} from './apiClient';

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  description?: string;
  category: string;
  brand?: string;
  unit: string;
  price: number;
  costPrice: number;
  taxRate: number;
  stockQuantity: number;
  minStockLevel: number;
  maxStockLevel?: number;
  status: 'active' | 'inactive' | 'discontinued';
  images?: string[];
  attributes?: Record<string, any>;
  branch: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProductsListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
  sortBy?: 'name' | 'price' | 'stock' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  lowStock?: boolean;
  branchId?: string;
}

export interface ProductsListResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateProductRequest {
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  category: string;
  brand?: string;
  unit: string;
  price: number;
  costPrice: number;
  taxRate?: number;
  stockQuantity: number;
  minStockLevel: number;
  maxStockLevel?: number;
  status: 'active' | 'inactive';
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

export interface StockAdjustment {
  id: string;
  productId: string;
  type: 'in' | 'out' | 'adjustment' | 'transfer';
  quantity: number;
  reason: string;
  reference?: string;
  employee: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export interface StockAdjustmentRequest {
  type: 'in' | 'out';
  quantity: number;
  reason: string;
  reference?: string;
}

export interface BulkImportRequest {
  products: CreateProductRequest[];
}

export interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalValue: number;
}

class ProductsService {
  /**
   * Get list of products with filters
   */
  async getProducts(params?: ProductsListParams): Promise<ApiResponse<ProductsListResponse>> {
    return apiClient.get('/products', {params});
  }

  /**
   * Get product by ID
   */
  async getProductById(productId: string): Promise<ApiResponse<Product>> {
    return apiClient.get(`/products/${productId}`);
  }

  /**
   * Get product by SKU
   */
  async getProductBySku(sku: string): Promise<ApiResponse<Product>> {
    return apiClient.get(`/products/sku/${sku}`);
  }

  /**
   * Get product by barcode
   */
  async getProductByBarcode(barcode: string): Promise<ApiResponse<Product>> {
    return apiClient.get(`/products/barcode/${barcode}`);
  }

  /**
   * Create new product
   */
  async createProduct(data: CreateProductRequest): Promise<ApiResponse<Product>> {
    return apiClient.post('/products', data);
  }

  /**
   * Update product
   */
  async updateProduct(
    productId: string,
    data: UpdateProductRequest,
  ): Promise<ApiResponse<Product>> {
    return apiClient.put(`/products/${productId}`, data);
  }

  /**
   * Delete product
   */
  async deleteProduct(productId: string): Promise<ApiResponse> {
    return apiClient.delete(`/products/${productId}`);
  }

  /**
   * Get product categories
   */
  async getCategories(): Promise<ApiResponse<string[]>> {
    return apiClient.get('/products/categories');
  }

  /**
   * Get product brands
   */
  async getBrands(): Promise<ApiResponse<string[]>> {
    return apiClient.get('/products/brands');
  }

  /**
   * Get product statistics
   */
  async getProductStats(branchId?: string): Promise<ApiResponse<ProductStats>> {
    return apiClient.get('/products/stats', {params: {branchId}});
  }

  /**
   * Upload product image
   */
  async uploadProductImage(
    productId: string,
    imageFile: File | Blob,
    onProgress?: (progress: number) => void,
  ): Promise<ApiResponse<{url: string}>> {
    const formData = new FormData();
    formData.append('image', imageFile);

    return apiClient.upload(`/products/${productId}/image`, formData, onProgress);
  }

  /**
   * Bulk import products
   */
  async bulkImport(data: BulkImportRequest): Promise<ApiResponse<{
    imported: number;
    failed: number;
    errors?: Array<{row: number; error: string}>;
  }>> {
    return apiClient.post('/products/bulk-import', data);
  }

  /**
   * Export products to CSV
   */
  async exportProducts(params?: ProductsListParams): Promise<ApiResponse<{url: string}>> {
    return apiClient.get('/products/export', {params});
  }

  /**
   * Get low stock products
   */
  async getLowStockProducts(branchId?: string): Promise<ApiResponse<Product[]>> {
    return apiClient.get('/products/low-stock', {params: {branchId}});
  }

  /**
   * Get stock adjustments history
   */
  async getStockAdjustments(
    productId: string,
    params?: {page?: number; limit?: number},
  ): Promise<ApiResponse<{
    adjustments: StockAdjustment[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>> {
    return apiClient.get(`/products/${productId}/stock-adjustments`, {params});
  }

  /**
   * Adjust product stock
   */
  async adjustStock(
    productId: string,
    data: StockAdjustmentRequest,
  ): Promise<ApiResponse<Product>> {
    return apiClient.post(`/products/${productId}/adjust-stock`, data);
  }

  /**
   * Search products (optimized for barcode scanner)
   */
  async searchProducts(query: string): Promise<ApiResponse<Product[]>> {
    return apiClient.get('/products/search', {params: {q: query}});
  }
}

// Export singleton instance
export const productsService = new ProductsService();

// Export default
export default productsService;
