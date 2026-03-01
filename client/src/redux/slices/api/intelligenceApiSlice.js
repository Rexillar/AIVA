/*═══════════════════════════════════════════════════════════════════════════════

        █████╗ ██╗██╗   ██╗ █████╗
       ██╔══██╗██║██║   ██║██╔══██╗
       ███████║██║██║   ██║███████║
       ██╔══██║██║╚██╗ ██╔╝██╔══██║
       ██║  ██║██║ ╚████╔╝ ██║  ██║
       ╚═╝  ╚═╝╚═╝  ╚═══╝  ╚═╝  ╚═╝

   ──◈──  A I V A  ::  A I   V I R T U A L   A S S I S T A N T  ──◈──

   ◉  Execution Intelligence API Slice
   ◉  Drift Detection • Burnout Signals • Focus Analytics

   ⟁  SYSTEM LAYER : FRONTEND CORE
   ⟁  DOMAIN       : STATE MANAGEMENT — INTELLIGENCE

   ⟁  PURPOSE      : RTK Query endpoints for Execution Intelligence Engine

   ⟁  TECH STACK   : React • Redux Toolkit Query
   ⟁  TRUST LEVEL  : HIGH

        "Intelligence delivered. Execution optimized."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

import { apiSlice } from "../apiSlice";

export const intelligenceApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Full intelligence report — health score, drift detection,
     * burnout assessment, focus windows, habit analytics, execution gaps
     */
    getIntelligenceReport: builder.query({
      query: (workspaceId) => ({
        url: `/intelligence/report`,
        params: { workspaceId },
      }),
      transformResponse: (response) => response.data || response,
      keepUnusedDataFor: 120, // 2 minutes — analytics data refreshes frequently
    }),

    /**
     * Single highest-priority nudge for embedding in chat / dashboard
     */
    getNudge: builder.query({
      query: (workspaceId) => ({
        url: `/intelligence/nudge`,
        params: { workspaceId },
      }),
      transformResponse: (response) => response.data || response,
      keepUnusedDataFor: 60,
    }),

    /**
     * Execution gaps — velocity, overloaded days, stuck tasks, unplanned days
     */
    getExecutionGaps: builder.query({
      query: (workspaceId) => ({
        url: `/intelligence/gaps`,
        params: { workspaceId },
      }),
      transformResponse: (response) => response.data || response,
      keepUnusedDataFor: 120,
    }),

    /**
     * Focus window analytics — peak hours, best days, deep work blocks
     */
    getFocusAnalytics: builder.query({
      query: (workspaceId) => ({
        url: `/intelligence/focus`,
        params: { workspaceId },
      }),
      transformResponse: (response) => response.data || response,
      keepUnusedDataFor: 300, // 5 minutes — focus data is slower to change
    }),

    /**
     * Burnout assessment — 0-100 score with signal breakdown
     */
    getBurnoutAssessment: builder.query({
      query: (workspaceId) => ({
        url: `/intelligence/burnout`,
        params: { workspaceId },
      }),
      transformResponse: (response) => response.data || response,
      keepUnusedDataFor: 300,
    }),

    /**
     * Habit health — streak risks, low/high performers, completion rates
     */
    getHabitHealth: builder.query({
      query: (workspaceId) => ({
        url: `/intelligence/habits`,
        params: { workspaceId },
      }),
      transformResponse: (response) => response.data || response,
      keepUnusedDataFor: 120,
    }),
  }),
});

export const {
  useGetIntelligenceReportQuery,
  useGetNudgeQuery,
  useGetExecutionGapsQuery,
  useGetFocusAnalyticsQuery,
  useGetBurnoutAssessmentQuery,
  useGetHabitHealthQuery,
} = intelligenceApiSlice;
