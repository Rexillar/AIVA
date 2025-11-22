/*=================================================================
 * Project: AIVA-WEB
 * File: chatApiSlice.js
 * Author: AI Integration - Chat Module
 * Date Created: October 21, 2025
 * Last Modified: October 21, 2025
 *=================================================================
 * Description:
 * RTK Query API slice for chat operations
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

export const chatApiSlice = createApi({
  reducerPath: "chatApi",
  baseQuery,
  tagTypes: ["Chat"],
  endpoints: (builder) => ({
    getChatHistory: builder.query({
      query: (workspaceId) => `/chat/history?workspaceId=${workspaceId}`,
      providesTags: ["Chat"],
    }),
    sendMessage: builder.mutation({
      query: (message) => ({
        url: "/chat/message",
        method: "POST",
        body: message,
      }),
      invalidatesTags: ["Chat"],
    }),
  }),
});

export const { useGetChatHistoryQuery, useSendMessageMutation } = chatApiSlice;

export default chatApiSlice;
