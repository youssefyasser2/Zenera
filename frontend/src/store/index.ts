import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth.slice';
export const store = configureStore({
  reducer: {
    auth: authReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
       
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),

  devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;