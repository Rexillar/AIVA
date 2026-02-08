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

export const fetchExternalEvents = createAsyncThunk(
  'externalEvents/fetch',
  async ({ workspaceId, startDate, endDate, source }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (source) params.append('source', source);

      const response = await axios.get(
        `${API_URL}/google/events/${workspaceId}?${params.toString()}`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

const externalEventsSlice = createSlice({
  name: 'externalEvents',
  initialState: {
    events: [],
    loading: false,
    error: null,
    filters: {
      showGoogle: true,
      showAIVA: true,
      accountFilters: [] // Array of accountIds to show
    }
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload
      };
    },
    toggleAccountFilter: (state, action) => {
      const accountId = action.payload;
      const index = state.filters.accountFilters.indexOf(accountId);

      if (index > -1) {
        state.filters.accountFilters.splice(index, 1);
      } else {
        state.filters.accountFilters.push(accountId);
      }
    },
    clearExternalEvents: (state) => {
      state.events = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExternalEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExternalEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload.events;
      })
      .addCase(fetchExternalEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch events';
      });
  }
});

export const { setFilters, toggleAccountFilter, clearExternalEvents } = externalEventsSlice.actions;
export default externalEventsSlice.reducer;
