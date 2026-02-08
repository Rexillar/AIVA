/*═══════════════════════════════════════════════════════════════════════════════

        █████╗ ██╗██╗   ██╗ █████╗
       ██╔══██╗██║██║   ██║██╔══██╗
       ███████║██║██║   ██║███████║
       ██╔══██║██║╚██╗ ██╔╝██╔══██║
       ██║  ██║██║ ╚████╔╝ ██║  ██║
       ╚═╝  ╚═╝╚═╝  ╚═══╝  ╚═╝  ╚═╝

   ──◈──  A I V A  ::  A I   V I R T U A L   A S S I S T A N T  ──◈──

   ◉  Deterministic Execution System
   ◉  Rule-Bound • State-Aware • Non-Emotive

   ⟁  SYSTEM LAYER : FRONTEND CORE
   ⟁  DOMAIN       : STATE MANAGEMENT

   ⟁  PURPOSE      : Provide specific functionality and operations

   ⟁  WHY          : Modular code organization and reusability

   ⟁  WHAT         : Function-based utilities and operations

   ⟁  TECH STACK   : React • Redux • Vite
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : HIGH
   ⟁  DOCS : /docs/frontend/state-management.md

   ⟁  USAGE RULES  : Immutable updates • Action types • Error handling

        "Functions implemented. Operations executed. Results delivered."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/


import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const fetchExternalTasks = createAsyncThunk(
  'externalTasks/fetch',
  async ({ workspaceId, status, accountId }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (accountId) params.append('accountId', accountId);

      const response = await axios.get(
        `${API_URL}/google/tasks/${workspaceId}?${params.toString()}`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

const externalTasksSlice = createSlice({
  name: 'externalTasks',
  initialState: {
    tasks: [],
    loading: false,
    error: null,
    filters: {
      showGoogle: true,
      showAIVA: true,
      accountFilters: [] // Array of accountIds to show
    }
  },
  reducers: {
    setTaskFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload
      };
    },
    toggleTaskAccountFilter: (state, action) => {
      const accountId = action.payload;
      const index = state.filters.accountFilters.indexOf(accountId);

      if (index > -1) {
        state.filters.accountFilters.splice(index, 1);
      } else {
        state.filters.accountFilters.push(accountId);
      }
    },
    clearExternalTasks: (state) => {
      state.tasks = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExternalTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExternalTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.tasks;
      })
      .addCase(fetchExternalTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch tasks';
      });
  }
});

export const { setTaskFilters, toggleTaskAccountFilter, clearExternalTasks } = externalTasksSlice.actions;
export default externalTasksSlice.reducer;
