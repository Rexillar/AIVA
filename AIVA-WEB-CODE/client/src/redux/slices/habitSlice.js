/*=================================================================
 * Project: AIVA-WEB
 * File: habitSlice.js
 * Author: AI Integration - Habit Tracker Module
 * Date Created: October 21, 2025
 * Last Modified: October 21, 2025
 *=================================================================
 * Description:
 * Redux slice for local habit state management
 *=================================================================
 * Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
 *=================================================================*/

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
