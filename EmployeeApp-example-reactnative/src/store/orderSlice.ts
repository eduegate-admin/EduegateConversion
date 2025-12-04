import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {ordersService, Order, OrdersListParams, UpdateOrderStatusRequest} from '../services/api';

interface OrderState {
  orders: Order[];
  selectedOrder: Order | null;
  myOrders: Order[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  stats: {
    total: number;
    new: number;
    pending: number;
    processing: number;
    completed: number;
    cancelled: number;
    revenue: number;
  } | null;
}

const initialState: OrderState = {
  orders: [],
  selectedOrder: null,
  myOrders: [],
  loading: false,
  error: null,
  pagination: null,
  stats: null,
};

// Async thunks
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (params: OrdersListParams | undefined, {rejectWithValue}) => {
    const response = await ordersService.getOrders(params);
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.error?.message || 'Failed to fetch orders');
  },
);

export const fetchMyOrders = createAsyncThunk(
  'orders/fetchMyOrders',
  async (params: OrdersListParams | undefined, {rejectWithValue}) => {
    const response = await ordersService.getMyOrders(params);
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.error?.message || 'Failed to fetch orders');
  },
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (orderId: string, {rejectWithValue}) => {
    const response = await ordersService.getOrderById(orderId);
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.error?.message || 'Failed to fetch order');
  },
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async (
    {orderId, data}: {orderId: string; data: UpdateOrderStatusRequest},
    {rejectWithValue},
  ) => {
    const response = await ordersService.updateOrderStatus(orderId, data);
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.error?.message || 'Failed to update order status');
  },
);

export const fetchOrderStats = createAsyncThunk(
  'orders/fetchOrderStats',
  async (params: {dateFrom?: string; dateTo?: string; branchId?: string} | undefined, {rejectWithValue}) => {
    const response = await ordersService.getOrderStats(params);
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.error?.message || 'Failed to fetch order stats');
  },
);

export const markOrderAsDelivered = createAsyncThunk(
  'orders/markAsDelivered',
  async (
    {
      orderId,
      data,
    }: {
      orderId: string;
      data: {
        signature?: string;
        photo?: string;
        notes?: string;
        location: {lat: number; lng: number};
        cashCollected?: number;
      };
    },
    {rejectWithValue},
  ) => {
    const response = await ordersService.markAsDelivered(orderId, data);
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.error?.message || 'Failed to mark order as delivered');
  },
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setSelectedOrder: (state, action: PayloadAction<Order | null>) => {
      state.selectedOrder = action.payload;
    },
    clearOrderError: state => {
      state.error = null;
    },
    clearOrders: state => {
      state.orders = [];
      state.pagination = null;
    },
  },
  extraReducers: builder => {
    // Fetch Orders
    builder.addCase(fetchOrders.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchOrders.fulfilled, (state, action) => {
      state.loading = false;
      state.orders = action.payload.orders;
      state.pagination = action.payload.pagination;
    });
    builder.addCase(fetchOrders.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch My Orders
    builder.addCase(fetchMyOrders.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchMyOrders.fulfilled, (state, action) => {
      state.loading = false;
      state.myOrders = action.payload.orders;
      state.pagination = action.payload.pagination;
    });
    builder.addCase(fetchMyOrders.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Order By ID
    builder.addCase(fetchOrderById.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchOrderById.fulfilled, (state, action) => {
      state.loading = false;
      state.selectedOrder = action.payload;
      // Update in orders list if exists
      const index = state.orders.findIndex(o => o.id === action.payload.id);
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
    });
    builder.addCase(fetchOrderById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update Order Status
    builder.addCase(updateOrderStatus.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateOrderStatus.fulfilled, (state, action) => {
      state.loading = false;
      // Update in orders list
      const index = state.orders.findIndex(o => o.id === action.payload.id);
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
      // Update selected order if it matches
      if (state.selectedOrder?.id === action.payload.id) {
        state.selectedOrder = action.payload;
      }
      // Update in my orders
      const myIndex = state.myOrders.findIndex(o => o.id === action.payload.id);
      if (myIndex !== -1) {
        state.myOrders[myIndex] = action.payload;
      }
    });
    builder.addCase(updateOrderStatus.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Order Stats
    builder.addCase(fetchOrderStats.fulfilled, (state, action) => {
      state.stats = action.payload;
    });

    // Mark as Delivered
    builder.addCase(markOrderAsDelivered.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(markOrderAsDelivered.fulfilled, (state, action) => {
      state.loading = false;
      // Update order in all relevant lists
      const updateOrder = (orders: Order[]) => {
        const index = orders.findIndex(o => o.id === action.payload.id);
        if (index !== -1) {
          orders[index] = action.payload;
        }
      };
      updateOrder(state.orders);
      updateOrder(state.myOrders);
      if (state.selectedOrder?.id === action.payload.id) {
        state.selectedOrder = action.payload;
      }
    });
    builder.addCase(markOrderAsDelivered.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const {setSelectedOrder, clearOrderError, clearOrders} = orderSlice.actions;

export default orderSlice.reducer;
