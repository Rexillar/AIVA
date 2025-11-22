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

const initialState = {
  currentWorkspace: null,
  members: [],
  loading: false,
  error: null,
  invitationStatus: null,
};

const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    setCurrentWorkspace: (state, action) => {
      state.currentWorkspace = action.payload;
    },
    setWorkspaceMembers: (state, action) => {
      state.members = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setInvitationStatus: (state, action) => {
      state.invitationStatus = action.payload;
    },
    clearWorkspace: (state) => {
      state.currentWorkspace = null;
      state.members = [];
      state.loading = false;
      state.error = null;
      state.invitationStatus = null;
    },
  },
});

export const {
  setCurrentWorkspace,
  setWorkspaceMembers,
  setLoading,
  setError,
  setInvitationStatus,
  clearWorkspace,
} = workspaceSlice.actions;

export default workspaceSlice.reducer;

// Selectors
export const selectCurrentWorkspace = (state) =>
  state.workspace.currentWorkspace;
export const selectWorkspaceMembers = (state) => state.workspace.members;
export const selectWorkspaceLoading = (state) => state.workspace.loading;
export const selectWorkspaceError = (state) => state.workspace.error;
export const selectInvitationStatus = (state) =>
  state.workspace.invitationStatus;
