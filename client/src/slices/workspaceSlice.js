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
