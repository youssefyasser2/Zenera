import { createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "@/services/auth/auth.service";
import type {
  LoginCredentials,
  RegisterCredentials,
} from "@/types/auth.types";
import { dashboardApi } from "../api";

/**
 * Login async thunk
 */
export const loginThunk = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const { user, accessToken } = await authService.login(credentials);
      return { user, accessToken };
    } catch (error: any) {
      return rejectWithValue(error.message ?? "Login failed");
    }
  }
);

/**
 * Register async thunk
 */
export const registerThunk = createAsyncThunk(
  "auth/register",
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      // AuthService now returns { user, accessToken } directly
      const { user, accessToken } = await authService.register(credentials);
      return { user, accessToken };
    } catch (error: any) {
      return rejectWithValue(error.message ?? "Registration failed");
    }
  }
);

/**
 * Check authentication status on app load
 */
export const checkAuthStatus = createAsyncThunk(
  "auth/check",
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getMe();
      return { user: response.data.user };
    } catch {
      return rejectWithValue("Not authenticated");
    }
  }
);
