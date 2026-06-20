// import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// interface User {
//   id: string;
//   name: string;
//   email: string;
//   role: string;
// }

// interface AuthState {
//   user: User | null;
//   accessToken: string | null;
//   isLoggedIn: boolean;
// }

// const initialState: AuthState = {
//   user: null,
//   accessToken: null,
//   isLoggedIn: false,
// };

// const authSlice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//     login: (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
//       state.user = action.payload.user;
//       state.accessToken = action.payload.accessToken;
//       state.isLoggedIn = true;
//     },
//     logout: (state) => {
//       state.user = null;
//       state.accessToken = null;
//       state.isLoggedIn = false;
//       localStorage.removeItem('accessToken');
//       localStorage.removeItem('user');
//     },
//     restoreLogin: (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
//       state.user = action.payload.user;
//       state.accessToken = action.payload.accessToken;
//       state.isLoggedIn = true;
//     },
//   },
// });

// export const { login, logout, restoreLogin } = authSlice.actions;
// export default authSlice.reducer;