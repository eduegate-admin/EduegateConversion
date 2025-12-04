import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {
  productsService,
  Product,
  ProductsListParams,
  CreateProductRequest,
  UpdateProductRequest,
  StockAdjustmentRequest,
  ProductStats,
} from '../services/api';

interface ProductState {
  products: Product[];
  selectedProduct: Product | null;
  lowStockProducts: Product[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  stats: ProductStats | null;
  categories: string[];
  brands: string[];
}

const initialState: ProductState = {
  products: [],
  selectedProduct: null,
  lowStockProducts: [],
  loading: false,
  error: null,
  pagination: null,
  stats: null,
  categories: [],
  brands: [],
};

// Async thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params: ProductsListParams | undefined, {rejectWithValue}) => {
    const response = await productsService.getProducts(params);
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.error?.message || 'Failed to fetch products');
  },
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (productId: string, {rejectWithValue}) => {
    const response = await productsService.getProductById(productId);
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.error?.message || 'Failed to fetch product');
  },
);

export const fetchProductByBarcode = createAsyncThunk(
  'products/fetchProductByBarcode',
  async (barcode: string, {rejectWithValue}) => {
    const response = await productsService.getProductByBarcode(barcode);
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.error?.message || 'Product not found');
  },
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (data: CreateProductRequest, {rejectWithValue}) => {
    const response = await productsService.createProduct(data);
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.error?.message || 'Failed to create product');
  },
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async (
    {productId, data}: {productId: string; data: UpdateProductRequest},
    {rejectWithValue},
  ) => {
    const response = await productsService.updateProduct(productId, data);
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.error?.message || 'Failed to update product');
  },
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (productId: string, {rejectWithValue}) => {
    const response = await productsService.deleteProduct(productId);
    if (response.success) {
      return productId;
    }
    return rejectWithValue(response.error?.message || 'Failed to delete product');
  },
);

export const adjustStock = createAsyncThunk(
  'products/adjustStock',
  async (
    {productId, data}: {productId: string; data: StockAdjustmentRequest},
    {rejectWithValue},
  ) => {
    const response = await productsService.adjustStock(productId, data);
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.error?.message || 'Failed to adjust stock');
  },
);

export const fetchProductStats = createAsyncThunk(
  'products/fetchProductStats',
  async (branchId: string | undefined, {rejectWithValue}) => {
    const response = await productsService.getProductStats(branchId);
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.error?.message || 'Failed to fetch product stats');
  },
);

export const fetchLowStockProducts = createAsyncThunk(
  'products/fetchLowStockProducts',
  async (branchId: string | undefined, {rejectWithValue}) => {
    const response = await productsService.getLowStockProducts(branchId);
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.error?.message || 'Failed to fetch low stock products');
  },
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, {rejectWithValue}) => {
    const response = await productsService.getCategories();
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.error?.message || 'Failed to fetch categories');
  },
);

export const fetchBrands = createAsyncThunk(
  'products/fetchBrands',
  async (_, {rejectWithValue}) => {
    const response = await productsService.getBrands();
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.error?.message || 'Failed to fetch brands');
  },
);

export const searchProducts = createAsyncThunk(
  'products/searchProducts',
  async (query: string, {rejectWithValue}) => {
    const response = await productsService.searchProducts(query);
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.error?.message || 'Failed to search products');
  },
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload;
    },
    clearProductError: state => {
      state.error = null;
    },
    clearProducts: state => {
      state.products = [];
      state.pagination = null;
    },
  },
  extraReducers: builder => {
    // Fetch Products
    builder.addCase(fetchProducts.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProducts.fulfilled, (state, action) => {
      state.loading = false;
      state.products = action.payload.products;
      state.pagination = action.payload.pagination;
    });
    builder.addCase(fetchProducts.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Product By ID
    builder.addCase(fetchProductById.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProductById.fulfilled, (state, action) => {
      state.loading = false;
      state.selectedProduct = action.payload;
      // Update in products list if exists
      const index = state.products.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
    });
    builder.addCase(fetchProductById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Product By Barcode
    builder.addCase(fetchProductByBarcode.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProductByBarcode.fulfilled, (state, action) => {
      state.loading = false;
      state.selectedProduct = action.payload;
    });
    builder.addCase(fetchProductByBarcode.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create Product
    builder.addCase(createProduct.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createProduct.fulfilled, (state, action) => {
      state.loading = false;
      state.products.unshift(action.payload);
      state.selectedProduct = action.payload;
    });
    builder.addCase(createProduct.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update Product
    builder.addCase(updateProduct.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateProduct.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.products.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
      if (state.selectedProduct?.id === action.payload.id) {
        state.selectedProduct = action.payload;
      }
    });
    builder.addCase(updateProduct.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Delete Product
    builder.addCase(deleteProduct.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteProduct.fulfilled, (state, action) => {
      state.loading = false;
      state.products = state.products.filter(p => p.id !== action.payload);
      if (state.selectedProduct?.id === action.payload) {
        state.selectedProduct = null;
      }
    });
    builder.addCase(deleteProduct.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Adjust Stock
    builder.addCase(adjustStock.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(adjustStock.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.products.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
      if (state.selectedProduct?.id === action.payload.id) {
        state.selectedProduct = action.payload;
      }
    });
    builder.addCase(adjustStock.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Product Stats
    builder.addCase(fetchProductStats.fulfilled, (state, action) => {
      state.stats = action.payload;
    });

    // Fetch Low Stock Products
    builder.addCase(fetchLowStockProducts.fulfilled, (state, action) => {
      state.lowStockProducts = action.payload;
    });

    // Fetch Categories
    builder.addCase(fetchCategories.fulfilled, (state, action) => {
      state.categories = action.payload;
    });

    // Fetch Brands
    builder.addCase(fetchBrands.fulfilled, (state, action) => {
      state.brands = action.payload;
    });

    // Search Products
    builder.addCase(searchProducts.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(searchProducts.fulfilled, (state, action) => {
      state.loading = false;
      state.products = action.payload;
    });
    builder.addCase(searchProducts.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const {setSelectedProduct, clearProductError, clearProducts} =
  productSlice.actions;

export default productSlice.reducer;
