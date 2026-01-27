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
  selectedHabit: null,
  habitFilters: {
    category: "all",
    isActive: true,
    isArchived: false,
  },
  habitView: "grid", // 'grid' or 'list'
  selectedDate: new Date().toISOString(),
  showCompletedHabits: true,
};

const habitSlice = createSlice({
  name: "habits",
  initialState,
  reducers: {
    setSelectedHabit: (state, action) => {
      state.selectedHabit = action.payload;
    },
    clearSelectedHabit: (state) => {
      state.selectedHabit = null;
    },
    setHabitFilters: (state, action) => {
      state.habitFilters = { ...state.habitFilters, ...action.payload };
    },
    resetHabitFilters: (state) => {
      state.habitFilters = initialState.habitFilters;
    },
    setHabitView: (state, action) => {
      state.habitView = action.payload;
    },
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },
    toggleShowCompletedHabits: (state) => {
      state.showCompletedHabits = !state.showCompletedHabits;
    },
  },
});

export const {
  setSelectedHabit,
  clearSelectedHabit,
  setHabitFilters,
  resetHabitFilters,
  setHabitView,
  setSelectedDate,
  toggleShowCompletedHabits,
} = habitSlice.actions;

export default habitSlice.reducer;
