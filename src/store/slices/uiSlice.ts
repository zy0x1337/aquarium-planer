import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  loading: boolean;
  error: string | null;
  sidebarOpen: boolean;
  darkMode: boolean;
}

const initialState: UiState = {
  loading: false,
  error: null,
  sidebarOpen: true,
  darkMode: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { 
  setLoading, 
  setError, 
  toggleSidebar, 
  setSidebarOpen, 
  toggleDarkMode, 
  clearError 
} = uiSlice.actions;

export default uiSlice.reducer;
