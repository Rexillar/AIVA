import { apiSlice } from './apiSlice';

export const gamificationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserStats: builder.query({
      query: () => '/gamification/stats',
      providesTags: ['Gamification']
    }),
    getAchievements: builder.query({
      query: () => '/gamification/achievements',
      providesTags: ['Achievements']
    }),
    getUserAchievements: builder.query({
      query: () => '/gamification/my-achievements',
      providesTags: ['UserAchievements']
    }),
    startFocusSession: builder.mutation({
      query: () => ({
        url: '/gamification/focus/start',
        method: 'POST'
      }),
      invalidatesTags: ['Gamification']
    }),
    endFocusSession: builder.mutation({
      query: (duration) => ({
        url: '/gamification/focus/end',
        method: 'POST',
        body: { duration }
      }),
      invalidatesTags: ['Gamification']
    }),
    submitReflection: builder.mutation({
      query: () => ({
        url: '/gamification/reflection',
        method: 'POST'
      }),
      invalidatesTags: ['Gamification']
    }),
    getFocusROI: builder.query({
      query: () => '/gamification/focus-roi',
      providesTags: ['FocusROI']
    })
  })
});

export const {
  useGetUserStatsQuery,
  useGetAchievementsQuery,
  useGetUserAchievementsQuery,
  useStartFocusSessionMutation,
  useEndFocusSessionMutation,
  useSubmitReflectionMutation,
  useGetFocusROIQQuery
} = gamificationApiSlice;