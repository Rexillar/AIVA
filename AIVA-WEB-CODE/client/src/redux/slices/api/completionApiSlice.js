/*=================================================================
 * Project: AIVA-WEB
 * File: completionApiSlice.js
 * Author: AI Integration - Completion Tracker Module
 * Date Created: October 21, 2025
 * Last Modified: October 21, 2025
 *=================================================================
 * Description:
 * RTK Query API slice for completion management operations
 *=================================================================
 * Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
 *=================================================================*/

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

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
