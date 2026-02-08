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

import { apiSlice } from "../../slices/apiSlice";

export const reminderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getReminders: builder.query({
      query: (workspaceId) => ({
        url: `/api/reminders/${workspaceId}`,
        method: "GET",
      }),
      providesTags: ["Reminders"],
    }),

    createReminder: builder.mutation({
      query: (data) => ({
        url: "/api/reminders/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Reminders"],
    }),

    updateReminder: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/reminders/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Reminders"],
    }),

    deleteReminder: builder.mutation({
      query: (id) => ({
        url: `/api/reminders/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Reminders"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetRemindersQuery,
  useCreateReminderMutation,
  useUpdateReminderMutation,
  useDeleteReminderMutation,
} = reminderApiSlice;
