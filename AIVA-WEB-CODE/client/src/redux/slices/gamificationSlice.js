import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  showRewards: false,
  lastRewards: null,
  focusSession: {
    isActive: false,
    startTime: null,
    duration: 0
  }
};

const gamificationSlice = createSlice({
  name: 'gamification',
  initialState,
  reducers: {
    showRewards: (state, action) => {
      state.showRewards = true;
      state.lastRewards = action.payload;
    },
    hideRewards: (state) => {
      state.showRewards = false;
      state.lastRewards = null;
    },
    startFocusSession: (state) => {
      state.focusSession.isActive = true;
      state.focusSession.startTime = new Date().toISOString();
      state.focusSession.duration = 0;
    },
    updateFocusDuration: (state, action) => {
      state.focusSession.duration = action.payload;
    },
    endFocusSession: (state) => {
      state.focusSession.isActive = false;
      state.focusSession.startTime = null;
      state.focusSession.duration = 0;
    }
  }
});

export const {
  showRewards,
  hideRewards,
  startFocusSession,
  updateFocusDuration,
  endFocusSession
} = gamificationSlice.actions;

export default gamificationSlice.reducer;