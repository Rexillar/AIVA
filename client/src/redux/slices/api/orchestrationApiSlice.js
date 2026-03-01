import { apiSlice } from "../apiSlice";

export const orchestrationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getScheduleConflicts: builder.query({
      query: ({ workspaceId, lookAheadDays = 7 }) => ({
        url: `/orchestration/conflicts`,
        params: { workspaceId, lookAheadDays },
      }),
      transformResponse: (res) => res.data || res,
      providesTags: ["Orchestration"],
      keepUnusedDataFor: 300, // 5 minutes
    }),

    getSuggestedDay: builder.query({
      query: ({ workspaceId, estimatedHours, lookAheadDays = 14 }) => ({
        url: `/orchestration/suggest-day`,
        params: { workspaceId, estimatedHours, lookAheadDays },
      }),
      transformResponse: (res) => res.data || res,
    }),

    getDailyPlan: builder.query({
      query: ({ workspaceId, date }) => ({
        url: `/orchestration/daily-plan`,
        params: { workspaceId, date },
      }),
      transformResponse: (res) => res.data || res,
      providesTags: ["Orchestration"],
      keepUnusedDataFor: 60,
    }),

    cleanupEvents: builder.mutation({
      query: ({ workspaceId, title }) => ({
        url: `/orchestration/cleanup-events`,
        method: "DELETE",
        params: { workspaceId, title },
      }),
      invalidatesTags: ["Orchestration"],
    }),
  }),
});

export const {
  useGetScheduleConflictsQuery,
  useLazyGetSuggestedDayQuery,
  useGetDailyPlanQuery,
  useCleanupEventsMutation,
} = orchestrationApiSlice;
