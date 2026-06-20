// src/store/auth/auth.slice.ts
import { createSlice } from "@reduxjs/toolkit";

import { authService } from "@/services/auth/auth.service";
import type { AuthState } from "@/types/auth.types";
import { loginThunk, registerThunk } from "@/services/auth/auth.thunk";

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isLoading: false,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      authService.logout();
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isLoading = false; 
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true; 
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.isLoading = false; 
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
      })
      .addCase(loginThunk.rejected, (state) => {
        state.isLoading = false; 
      })

      // Register
      .addCase(registerThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerThunk.fulfilled, (state) => {
        state.isLoading = false; 
      })
      .addCase(registerThunk.rejected, (state) => {
        state.isLoading = false; 
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;