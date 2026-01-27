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

// Define the base query with your API base URL (adjust as needed)
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.REACT_APP_API_URL || "http://localhost:5000/api",
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token; // Assuming auth state has token
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const habitApiSlice = createApi({
  reducerPath: "habitApi",
  baseQuery,
  tagTypes: ["Habit"],
  endpoints: (builder) => ({
    getHabits: builder.query({
      query: (arg) => {
        const { workspaceId, ...filters } = arg;
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            params.append(key, value);
          }
        });
        return `/habits/workspace/${workspaceId}?${params.toString()}`;
      },
      transformResponse: (response) => response.data,
      providesTags: ["Habit"],
    }),
    createHabit: builder.mutation({
      query: (habit) => {
        const habitData = { ...habit };
        if (
          typeof habitData.workspace === "object" &&
          habitData.workspace !== null
        ) {
          let id = habitData.workspace._id || habitData.workspace;
          if (typeof id === "object" && id !== null && id.toString) {
            id = id.toString();
          }
          habitData.workspace = id;
        }
        return {
          url: "/habits",
          method: "POST",
          body: habitData,
        };
      },
      invalidatesTags: ["Habit"],
    }),
    updateHabit: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `/habits/${id}`,
        method: "PUT",
        body: updates,
      }),
      invalidatesTags: ["Habit"],
    }),
    deleteHabit: builder.mutation({
      query: (id) => ({
        url: `/habits/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Habit"],
    }),
    getHabitsDueToday: builder.query({
      query: (arg) => `/habits/due-today?workspaceId=${arg.workspaceId}`,
      transformResponse: (response) => response.data,
      providesTags: ["Habit"],
    }),
    toggleHabitCompletion: builder.mutation({
      query: ({ id, date, note }) => ({
        url: `/habits/${id}/complete`,
        method: "POST",
        body: { date, note },
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const result = await queryFulfilled;
          const response = result.data;

          // Check if rewards were earned
          // Note: Gamification functionality not implemented
          // if (response.rewards) {
          //   dispatch(showRewards(response.rewards));
          // }
        } catch (error) {
          // Handle error if needed
        }
      },
      invalidatesTags: ["Habit"],
    }),
    getUserHabitAnalytics: builder.query({
      query: (arg) => `/habits/analytics/user?workspaceId=${arg.workspaceId}`,
      transformResponse: (response) => response.data,
      providesTags: ["Habit"],
    }),
    archiveHabit: builder.mutation({
      query: (id) => ({
        url: `/habits/${id}`,
        method: "PATCH",
        body: { archived: true },
      }),
      invalidatesTags: ["Habit"],
    }),
    pauseHabit: builder.mutation({
      query: (id) => ({
        url: `/habits/${id}`,
        method: "PATCH",
        body: { paused: true },
      }),
      invalidatesTags: ["Habit"],
    }),
    addHabitNote: builder.mutation({
      query: ({ id, note }) => ({
        url: `/habits/${id}`,
        method: "PATCH",
        body: { note },
      }),
      invalidatesTags: ["Habit"],
    }),
    deleteHabitNote: builder.mutation({
      query: (id) => ({
        url: `/habits/${id}`,
        method: "PATCH",
        body: { note: null },
      }),
      invalidatesTags: ["Habit"],
    }),
    getHabitById: builder.query({
      query: (arg) =>
        `/habits/${arg.id}?workspaceId=${encodeURIComponent(arg.workspaceId)}`,
      transformResponse: (response) => response.data,
      providesTags: ["Habit"],
    }),
    getHabitHistory: builder.query({
      query: (arg) =>
        `/habits/${arg.id}/history?workspaceId=${encodeURIComponent(arg.workspaceId)}`,
      transformResponse: (response) => response.data,
      providesTags: ["Habit"],
    }),
    getHabitStatistics: builder.query({
      query: (arg) =>
        `/habits/${arg.id}/statistics?workspaceId=${encodeURIComponent(arg.workspaceId)}`,
      transformResponse: (response) => response.data,
      providesTags: ["Habit"],
    }),
  }),
});

export const {
  useGetHabitsQuery,
  useCreateHabitMutation,
  useUpdateHabitMutation,
  useDeleteHabitMutation,
  useGetHabitsDueTodayQuery,
  useToggleHabitCompletionMutation,
  useGetUserHabitAnalyticsQuery,
  useArchiveHabitMutation,
  usePauseHabitMutation,
  useAddHabitNoteMutation,
  useDeleteHabitNoteMutation,
  useGetHabitByIdQuery,
  useGetHabitHistoryQuery,
  useGetHabitStatisticsQuery,
  useGetHabitsQuery: useGetWorkspaceHabitsQuery, // Alias for component compatibility
} = habitApiSlice;

export default habitApiSlice;
