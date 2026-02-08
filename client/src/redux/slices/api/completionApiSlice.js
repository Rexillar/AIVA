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

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || "/api",
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token; // Assuming auth state has token
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const completionApiSlice = createApi({
  reducerPath: "completionApi",
  baseQuery,
  tagTypes: ["Completion"],
  endpoints: (builder) => ({
    getCompletions: builder.query({
      query: (workspaceId) => `/completions?workspaceId=${workspaceId}`,
      providesTags: ["Completion"],
    }),
    createCompletion: builder.mutation({
      query: (completion) => ({
        url: "/completions",
        method: "POST",
        body: completion,
      }),
      invalidatesTags: ["Completion"],
    }),
    // Add more endpoints as needed (e.g., update, delete)
  }),
});

export const { useGetCompletionsQuery, useCreateCompletionMutation } =
  completionApiSlice;

export default completionApiSlice;
