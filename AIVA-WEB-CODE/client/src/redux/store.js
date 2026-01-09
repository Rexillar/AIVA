/*=================================================================
 * Project: AIVA-WEB
 * File: store.js
 * Author: Mohitraj Jadeja
 * Date Created: February 28, 2024
 * Last Modified: October 21, 2025
 *=================================================================
 * Description:
 * Redux store configuration with RTK Query API slices
 *=================================================================
 * Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
 *=================================================================*/
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import settingsReducer from "./slices/settingsSlice";
import { apiSlice } from "./slices/apiSlice";
import workspaceReducer from "./slices/workspaceSlice";
import notificationReducer from "./slices/notificationSlice";
import notificationMiddleware from "./middleware/notificationMiddleware";
import themeReducer from "./slices/themeSlice";
import habitReducer from "./slices/habitSlice";
import taskApiSlice from "./slices/api/taskApiSlice";
import { noteApiSlice } from "./slices/api/noteApiSlice";
import { workspaceApiSlice } from "./slices/api/workspaceApiSlice";
import ambiguityDialogReducer from "./slices/ambiguityDialogSlice";

// Import other API slices to ensure endpoints are registered
import "./slices/api/authApiSlice";
import "./slices/api/chatApiSlice";
import "./slices/api/reminderApiSlice";
import "./slices/api/userApiSlice";
import "./slices/api/uploadApiSlice";
import { habitApiSlice } from "./slices/api/habitApiSlice";
import { completionApiSlice } from "./slices/api/completionApiSlice";
import { chatApiSlice } from "./slices/api/chatApiSlice";
import gamificationReducer from "./slices/gamificationSlice";
import { gamificationApiSlice } from "./slices/gamificationApiSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    settings: settingsReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
    workspace: workspaceReducer,
    [taskApiSlice.reducerPath]: taskApiSlice.reducer,
    [noteApiSlice.reducerPath]: noteApiSlice.reducer,
    [workspaceApiSlice.reducerPath]: workspaceApiSlice.reducer,
    notifications: notificationReducer,
    theme: themeReducer,
    habits: habitReducer,
    [habitApiSlice.reducerPath]: habitApiSlice.reducer,
    [completionApiSlice.reducerPath]: completionApiSlice.reducer,
    [chatApiSlice.reducerPath]: chatApiSlice.reducer,
    gamification: gamificationReducer,
    [gamificationApiSlice.reducerPath]: gamificationApiSlice.reducer,
    ambiguityDialog: ambiguityDialogReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(apiSlice.middleware)
      .concat(taskApiSlice.middleware)
      .concat(noteApiSlice.middleware)
      .concat(workspaceApiSlice.middleware)
      .concat(notificationMiddleware)
      .concat(habitApiSlice.middleware)
      .concat(completionApiSlice.middleware)
      .concat(chatApiSlice.middleware)
      .concat(gamificationApiSlice.middleware),
  devTools: true,
});

export default store;
