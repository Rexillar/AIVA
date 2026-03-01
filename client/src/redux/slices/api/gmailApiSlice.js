import { apiSlice } from "../apiSlice";

export const gmailApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getGmailInbox: builder.query({
      query: ({ workspaceId, maxResults = 20, pageToken, query }) => ({
        url: `/gmail/inbox`,
        params: { workspaceId, maxResults, pageToken, query },
      }),
      transformResponse: (res) => res.data || res,
      providesTags: ["Gmail"],
      keepUnusedDataFor: 60,
    }),

    getGmailMessage: builder.query({
      query: ({ workspaceId, id }) => ({
        url: `/gmail/messages/${id}`,
        params: { workspaceId },
      }),
      transformResponse: (res) => res.data || res,
    }),

    getGmailThread: builder.query({
      query: ({ workspaceId, id }) => ({
        url: `/gmail/threads/${id}`,
        params: { workspaceId },
      }),
      transformResponse: (res) => res.data || res,
    }),

    getGmailUnreadCount: builder.query({
      query: (workspaceId) => ({
        url: `/gmail/unread`,
        params: { workspaceId },
      }),
      transformResponse: (res) => res.data || res,
      providesTags: ["Gmail"],
      keepUnusedDataFor: 30,
    }),

    getGmailLabels: builder.query({
      query: (workspaceId) => ({
        url: `/gmail/labels`,
        params: { workspaceId },
      }),
      transformResponse: (res) => res.data || res,
    }),

    searchGmail: builder.query({
      query: ({ workspaceId, q, maxResults = 20 }) => ({
        url: `/gmail/search`,
        params: { workspaceId, q, maxResults },
      }),
      transformResponse: (res) => res.data || res,
    }),
  }),
});

export const {
  useGetGmailInboxQuery,
  useLazyGetGmailInboxQuery,
  useGetGmailMessageQuery,
  useLazyGetGmailMessageQuery,
  useGetGmailThreadQuery,
  useGetGmailUnreadCountQuery,
  useGetGmailLabelsQuery,
  useLazySearchGmailQuery,
} = gmailApiSlice;
