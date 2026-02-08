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

// Get auth token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

// Async thunks
export const getAuthUrl = createAsyncThunk(
  'googleIntegration/getAuthUrl',
  async ({ workspaceId, scopes }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/google/auth-url`,
        { workspaceId, scopes },
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

export const handleCallback = createAsyncThunk(
  'googleIntegration/handleCallback',
  async ({ code, state }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/google/callback`,
        { code, state },
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

export const fetchAccounts = createAsyncThunk(
  'googleIntegration/fetchAccounts',
  async (workspaceId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/google/accounts/${workspaceId}`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

export const updateAccountSettings = createAsyncThunk(
  'googleIntegration/updateSettings',
  async ({ workspaceId, accountId, syncSettings }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_URL}/google/accounts/${workspaceId}/${accountId}`,
        { syncSettings },
        { headers: getAuthHeader() }
      );
      return { accountId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

export const disconnectAccount = createAsyncThunk(
  'googleIntegration/disconnect',
  async ({ workspaceId, accountId }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${API_URL}/google/accounts/${workspaceId}/${accountId}`,
        { headers: getAuthHeader() }
      );
      return { accountId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

export const triggerSync = createAsyncThunk(
  'googleIntegration/triggerSync',
  async ({ workspaceId, accountId, syncType }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/google/sync/${workspaceId}/${accountId}`,
        { syncType },
        { headers: getAuthHeader() }
      );
      return { accountId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

export const fetchSyncStatus = createAsyncThunk(
  'googleIntegration/fetchSyncStatus',
  async (workspaceId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/google/sync-status/${workspaceId}`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

const googleIntegrationSlice = createSlice({
  name: 'googleIntegration',
  initialState: {
    accounts: [],
    syncStatus: null,
    authUrl: null,
    loading: false,
    syncing: {},
    error: null,
    success: null
  },
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },
    clearAuthUrl: (state) => {
      state.authUrl = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Auth URL
      .addCase(getAuthUrl.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAuthUrl.fulfilled, (state, action) => {
        state.loading = false;
        state.authUrl = action.payload.authUrl;
      })
      .addCase(getAuthUrl.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to get auth URL';
      })

      // Handle Callback
      .addCase(handleCallback.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(handleCallback.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
        state.authUrl = null;
      })
      .addCase(handleCallback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to connect account';
      })

      // Fetch Accounts
      .addCase(fetchAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = action.payload.accounts;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch accounts';
      })

      // Update Settings
      .addCase(updateAccountSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAccountSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
        const index = state.accounts.findIndex(
          acc => acc.accountId === action.payload.accountId
        );
        if (index !== -1) {
          state.accounts[index] = {
            ...state.accounts[index],
            syncSettings: action.payload.account.syncSettings
          };
        }
      })
      .addCase(updateAccountSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to update settings';
      })

      // Disconnect Account
      .addCase(disconnectAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(disconnectAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
        state.accounts = state.accounts.filter(
          acc => acc.accountId !== action.payload.accountId
        );
      })
      .addCase(disconnectAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to disconnect';
      })

      // Trigger Sync
      .addCase(triggerSync.pending, (state, action) => {
        const accountId = action.meta.arg.accountId;
        state.syncing[accountId] = true;
        state.error = null;
      })
      .addCase(triggerSync.fulfilled, (state, action) => {
        const accountId = action.payload.accountId;
        state.syncing[accountId] = false;
        state.success = 'Sync completed';
      })
      .addCase(triggerSync.rejected, (state, action) => {
        const accountId = action.meta.arg.accountId;
        state.syncing[accountId] = false;
        state.error = action.payload?.error || 'Sync failed';
      })

      // Fetch Sync Status
      .addCase(fetchSyncStatus.fulfilled, (state, action) => {
        state.syncStatus = action.payload;
      });
  }
});

export const { clearMessages, clearAuthUrl } = googleIntegrationSlice.actions;
export default googleIntegrationSlice.reducer;
