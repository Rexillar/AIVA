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

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isOpen: false,
  title: '',
  message: '',
  options: [],
  context: {},
  loading: false,
  error: null,
};

const ambiguityDialogSlice = createSlice({
  name: 'ambiguityDialog',
  initialState,
  reducers: {
    openConfirmationDialog: (state, action) => {
      const { title, message, options, context } = action.payload;
      state.isOpen = true;
      state.title = title;
      state.message = message;
      state.options = options;
      state.context = context || {};
      state.loading = false;
      state.error = null;
    },

    closeConfirmationDialog: (state) => {
      state.isOpen = false;
      state.title = '';
      state.message = '';
      state.options = [];
      state.context = {};
      state.loading = false;
      state.error = null;
    },

    setDialogLoading: (state, action) => {
      state.loading = action.payload;
    },

    setDialogError: (state, action) => {
      state.error = action.payload;
    },

    clearDialogError: (state) => {
      state.error = null;
    },
  },
});

export const {
  openConfirmationDialog,
  closeConfirmationDialog,
  setDialogLoading,
  setDialogError,
  clearDialogError,
} = ambiguityDialogSlice.actions;

export default ambiguityDialogSlice.reducer;

// Selectors
export const selectIsDialogOpen = (state) => state.ambiguityDialog?.isOpen || false;
export const selectDialogTitle = (state) => state.ambiguityDialog?.title || '';
export const selectDialogMessage = (state) => state.ambiguityDialog?.message || '';
export const selectDialogOptions = (state) => state.ambiguityDialog?.options || [];
export const selectDialogContext = (state) => state.ambiguityDialog?.context || {};
export const selectDialogLoading = (state) => state.ambiguityDialog?.loading || false;
export const selectDialogError = (state) => state.ambiguityDialog?.error || null;
