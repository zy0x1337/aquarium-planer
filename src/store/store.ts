import { configureStore } from '@reduxjs/toolkit';
import aquariumReducer from './slices/aquariumSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    aquarium: aquariumReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export {};
