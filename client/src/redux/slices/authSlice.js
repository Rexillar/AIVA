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

   ⟁  PURPOSE      : Manage user authentication state

   ⟁  WHY          : Secure client-side authentication handling

   ⟁  WHAT         : Redux slice for user sessions and auth state

   ⟁  TECH STACK   : React • Redux • Vite
   ⟁  CRYPTO       : JWT • LocalStorage
   ⟁  TRUST LEVEL  : HIGH
   ⟁  DOCS : /docs/frontend/state-management.md

   ⟁  USAGE RULES  : Immutable updates • Action types • Error handling

        "Authentication managed. Sessions secure. Users verified."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Helper function to safely parse JSON from localStorage
const getLocalStorageItem = (key) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    
    const parsed = JSON.parse(item);
    
    // For workspace objects, validate that they have a valid _id
    if (key === 'privateWorkspace' && parsed) {
      if (!parsed._id || parsed._id === 'undefined') {
        localStorage.removeItem(key);
        return null;
      }
    }
    
    // For currentWorkspace, also validate
    if (key === 'currentWorkspace' && parsed) {
      if (!parsed._id || parsed._id === 'undefined') {
        localStorage.removeItem(key);
        return null;
      }
    }
    
    return parsed;
  } catch (error) {
    //console.error(`Error parsing ${key} from localStorage:`, error);
    localStorage.removeItem(key);
    return null;
  }
};

// Get initial state from localStorage

const initialState = {
  user: getLocalStorageItem("user"),
  isAuthenticated: !!getLocalStorageItem("user"),
  privateWorkspace: getLocalStorageItem("privateWorkspace"),
  publicWorkspaces: getLocalStorageItem("publicWorkspaces") || [],
  isSidebarOpen: false,
  otpStatus: "idle",
  otpError: null,
  token: localStorage.getItem("token"),
  currentWorkspace: getLocalStorageItem("currentWorkspace"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload || {};
      state.user = user;
      state.token = token;
      state.isAuthenticated = !!user;

      // Clear workspace state on new login
      state.privateWorkspace = null;
      state.publicWorkspaces = [];
      state.currentWorkspace = null;

      // Persist to localStorage
      if (user && token) {
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);
      } else {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("privateWorkspace");
        localStorage.removeItem("publicWorkspaces");
        localStorage.removeItem("currentWorkspace");
      }
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.privateWorkspace = null;
      state.publicWorkspaces = [];
      state.isSidebarOpen = false;
      state.currentWorkspace = null;

      // Clear all auth-related localStorage items
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("privateWorkspace");
      localStorage.removeItem("publicWorkspaces");
      localStorage.removeItem("currentWorkspace");
    },
    setPrivateWorkspace: (state, action) => {
      const workspace = action.payload;
      
      // Validate workspace before setting it
      if (workspace && (!workspace._id || workspace._id === 'undefined')) {
        // console.warn('Attempted to set invalid private workspace:', workspace);
        return;
      }

      state.privateWorkspace = workspace;
      if (workspace) {
        localStorage.setItem(
          "privateWorkspace",
          JSON.stringify(workspace),
        );
      } else {
        localStorage.removeItem("privateWorkspace");
      }
    },
    setPublicWorkspaces: (state, action) => {
      state.publicWorkspaces = action.payload || [];
      if (action.payload?.length) {
        localStorage.setItem(
          "publicWorkspaces",
          JSON.stringify(action.payload),
        );
      } else {
        localStorage.removeItem("publicWorkspaces");
      }
    },
    setOpenSidebar: (state, action) => {
      state.isSidebarOpen = action.payload;
    },
    setOtpStatus: (state, action) => {
      state.otpStatus = action.payload.status;
      state.otpError = action.payload.error || null;
    },
    clearOtpError: (state) => {
      state.otpError = null;
    },
    addPublicWorkspace: (state, action) => {
      if (action.payload) {
        state.publicWorkspaces.push(action.payload);
        localStorage.setItem(
          "publicWorkspaces",
          JSON.stringify(state.publicWorkspaces),
        );
      }
    },
    removePublicWorkspace: (state, action) => {
      state.publicWorkspaces = state.publicWorkspaces.filter(
        (workspace) => workspace._id !== action.payload,
      );
      localStorage.setItem(
        "publicWorkspaces",
        JSON.stringify(state.publicWorkspaces),
      );
    },
    setCurrentWorkspace: (state, action) => {
      state.currentWorkspace = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload; // Set the token in the state
    },
  },
});

// Export actions
export const {
  setCredentials,
  updateUser,
  logout,
  setPrivateWorkspace,
  setPublicWorkspaces,
  setOpenSidebar,
  setOtpStatus,
  clearOtpError,
  addPublicWorkspace,
  removePublicWorkspace,
  setCurrentWorkspace,
  setToken,
} = authSlice.actions;

// Export reducer
export default authSlice.reducer;

// Selectors
export const selectCurrentToken = (state) => state.auth.token;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectPrivateWorkspace = (state) => state.auth.privateWorkspace;
export const selectPublicWorkspaces = (state) => state.auth.publicWorkspaces;
