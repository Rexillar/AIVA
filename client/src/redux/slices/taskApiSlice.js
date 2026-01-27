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

   ⟁  PURPOSE      : Manage task-related application state

   ⟁  WHY          : Predictable task state updates and caching

   ⟁  WHAT         : Redux slice for task operations and state

   ⟁  TECH STACK   : React • Redux • Vite
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : HIGH
   ⟁  DOCS : /docs/frontend/state-management.md

   ⟁  USAGE RULES  : Immutable updates • Action types • Error handling

        "Task state managed. Updates predictable. UI responsive."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const isValidWorkspaceId = (workspaceId) => {
  return typeof workspaceId === "string" && workspaceId.length > 0;
};

const taskApiSlice = createApi({
  reducerPath: "taskApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:5000/api" }),
  endpoints: (builder) => ({
    createTask: builder.mutation({
      query: ({ taskData, workspaceId }) => {
        if (!isValidWorkspaceId(workspaceId)) {
          throw new Error("Invalid workspace ID");
        }
        return {
          url: "/tasks",
          method: "POST",
          body: taskData,
        };
      },
    }),
    // Add other endpoints as needed
  }),
});

export const { useCreateTaskMutation } = taskApiSlice;
export default taskApiSlice.reducer;
