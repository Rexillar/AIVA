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

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import settingsReducer from "./slices/settingsSlice";
import { apiSlice } from "./slices/apiSlice";
import workspaceReducer from "./slices/workspaceSlice";
import notificationReducer from "./slices/notificationSlice";
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
import googleIntegrationReducer from "../slices/googleIntegrationSlice";
import externalEventsReducer from "../slices/externalEventsSlice";
import externalTasksReducer from "../slices/externalTasksSlice";

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
    ambiguityDialog: ambiguityDialogReducer,
    googleIntegration: googleIntegrationReducer,
    externalEvents: externalEventsReducer,
    externalTasks: externalTasksReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(apiSlice.middleware)
      .concat(taskApiSlice.middleware)
      .concat(noteApiSlice.middleware)
      .concat(workspaceApiSlice.middleware)
      .concat(habitApiSlice.middleware)
      .concat(completionApiSlice.middleware)
      .concat(chatApiSlice.middleware),
  devTools: true,
});

export default store;
