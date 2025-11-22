/*=================================================================
 * Project: AIVA-WEB
 * File: Button.jsx
 * Author: Mohitraj Jadeja
 * Date Created: February 28, 2024
 * Last Modified: February 28, 2024
 *=================================================================
 * Description:
 * Button component for displaying buttons.
 *=================================================================
 * Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
 *=================================================================*/
import { createSlice } from "@reduxjs/toolkit";

const getLocalStorageItem = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    // console.error(`Error parsing ${key} from localStorage:`, error);
    localStorage.removeItem(key);
    return null;
  }
};

const saveToLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// Get initial state from localStorage
const savedWorkspace = getLocalStorageItem("currentWorkspace");
const savedNavigation = getLocalStorageItem("navigationState");

const initialState = {
  currentWorkspace: savedWorkspace || null,
  workspaces: [],
  isLoading: false,
  error: null,
  lastFetch: null,
  retryCount: 0,
  navigationState: savedNavigation || {
    lastPath: null,
    lastWorkspaceId: null,
    lastTaskId: null,
    timestamp: null,
  },
};

const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    setCurrentWorkspace: (state, action) => {
      state.currentWorkspace = action.payload;
      if (
        action.payload &&
        !state.workspaces.find((w) => w._id === action.payload._id)
      ) {
        state.workspaces.push(action.payload);
      }
      state.error = null;
      state.retryCount = 0;
      state.lastFetch = Date.now();
      saveToLocalStorage("currentWorkspace", action.payload);
    },
    clearCurrentWorkspace: (state) => {
      state.currentWorkspace = null;
      localStorage.removeItem("currentWorkspace");
    },
    setWorkspaces: (state, action) => {
      // Temporarily remove filtering
      const workspaces = action.payload || [];
      // console.log('Setting all workspaces (unfiltered):', workspaces);
      state.workspaces = workspaces;

      // If there's no current workspace but we have workspaces, set the first one as current
      if (!state.currentWorkspace && workspaces.length > 0) {
        const savedWorkspace = localStorage.getItem("currentWorkspace");
        if (savedWorkspace) {
          try {
            const parsed = JSON.parse(savedWorkspace);
            // Check if the saved workspace still exists
            if (workspaces.find((w) => w._id === parsed._id)) {
              state.currentWorkspace = parsed;
              return;
            }
          } catch (error) {
            // console.error('Error parsing saved workspace:', error);
          }
        }
        // If no valid saved workspace, use the first one
        state.currentWorkspace = workspaces[0];
        localStorage.setItem("currentWorkspace", JSON.stringify(workspaces[0]));
      }
    },
    addWorkspace: (state, action) => {
      // Temporarily remove isDeleted check
      if (!state.workspaces.find((w) => w._id === action.payload._id)) {
        state.workspaces.push(action.payload);
      }
    },
    updateWorkspace: (state, action) => {
      const index = state.workspaces.findIndex(
        (w) => w._id === action.payload._id,
      );
      if (index !== -1) {
        state.workspaces[index] = action.payload;
      }
      if (state.currentWorkspace?._id === action.payload._id) {
        state.currentWorkspace = action.payload;
      }
    },
    setWorkspaceError: (state, action) => {
      state.error = action.payload;
      state.retryCount += 1;

      // Clear workspace on critical errors
      if (action.payload?.status === 404 || action.payload?.status === 401) {
        state.currentWorkspace = null;
        localStorage.removeItem("currentWorkspace");
      }

      // Reset retry count after 5 minutes
      if (state.lastFetch && Date.now() - state.lastFetch > 5 * 60 * 1000) {
        state.retryCount = 0;
      }
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setNavigationState: (state, action) => {
      state.navigationState = {
        ...action.payload,
        timestamp: Date.now(),
      };
      saveToLocalStorage("navigationState", state.navigationState);
    },
    clearNavigationState: (state) => {
      state.navigationState = {
        lastPath: null,
        lastWorkspaceId: null,
        lastTaskId: null,
        timestamp: null,
      };
      localStorage.removeItem("navigationState");
    },
  },
});

export const {
  setCurrentWorkspace,
  clearCurrentWorkspace,
  setWorkspaces,
  addWorkspace,
  updateWorkspace,
  setWorkspaceError,
  setLoading,
  setNavigationState,
  clearNavigationState,
} = workspaceSlice.actions;

export default workspaceSlice.reducer;

// Define the function
export const fetchPrivateWorkspace = () => {
  // Your implementation here
  // console.log('Fetching private workspace...');
  // This could be an async function that fetches data from an API
};

// Selectors
export const selectCurrentWorkspace = (state) =>
  state.workspace.currentWorkspace;
export const selectWorkspaces = (state) => state.workspace.workspaces;
export const selectWorkspaceLoading = (state) => state.workspace.isLoading;
export const selectWorkspaceError = (state) => state.workspace.error;
export const selectWorkspaceRetryCount = (state) => state.workspace.retryCount;
export const selectLastFetch = (state) => state.workspace.lastFetch;
export const selectNavigationState = (state) => state.workspace.navigationState;
export const selectInvitationStatus = (state) =>
  state.workspace.invitationStatus;
