import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string | null;
    email: string | null;
    name: string | null;
    employeeId: string | null;
  };
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: {
    id: null,
    email: null,
    name: null,
    employeeId: null,
  },
  token: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{user: any; token: string}>) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = initialState.user;
      state.token = null;
    },
  },
});

export const {loginStart, loginSuccess, loginFailure, logout} = authSlice.actions;
export default authSlice.reducer;