import { apiSlice } from "../apiSlice";

export const knowledgeApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Knowledge Hub
    getKnowledgeIndex: builder.query({
      query: (workspaceId) => ({
        url: `/knowledge/index`,
        params: { workspaceId },
      }),
      transformResponse: (res) => res.data || res,
      providesTags: ["Knowledge"],
    }),

    getRelatedKnowledge: builder.query({
      query: ({ workspaceId, topic }) => ({
        url: `/knowledge/related`,
        params: { workspaceId, topic },
      }),
      transformResponse: (res) => res.data || res,
    }),

    searchKnowledge: builder.query({
      query: ({ workspaceId, q }) => ({
        url: `/knowledge/search`,
        params: { workspaceId, q },
      }),
      transformResponse: (res) => res.data || res,
    }),

    exportKnowledgeBase: builder.query({
      query: ({ workspaceId, format = "json" }) => ({
        url: `/knowledge/export`,
        params: { workspaceId, format },
      }),
      transformResponse: (res) => res.data || res,
    }),

    // Decision Logs
    getDecisionLogs: builder.query({
      query: (workspaceId) => ({
        url: `/knowledge/decisions`,
        params: { workspaceId },
      }),
      transformResponse: (res) => res.data || res,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: "DecisionLog", id: _id })),
              { type: "DecisionLog", id: "LIST" },
            ]
          : [{ type: "DecisionLog", id: "LIST" }],
    }),

    getDecisionLog: builder.query({
      query: (id) => `/knowledge/decisions/${id}`,
      transformResponse: (res) => res.data || res,
      providesTags: (result, error, id) => [{ type: "DecisionLog", id }],
    }),

    createDecisionLog: builder.mutation({
      query: (body) => ({ url: `/knowledge/decisions`, method: "POST", body }),
      invalidatesTags: [{ type: "DecisionLog", id: "LIST" }, "Knowledge"],
    }),

    updateDecisionLog: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/knowledge/decisions/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "DecisionLog", id },
        { type: "DecisionLog", id: "LIST" },
      ],
    }),

    deleteDecisionLog: builder.mutation({
      query: (id) => ({
        url: `/knowledge/decisions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "DecisionLog", id: "LIST" }, "Knowledge"],
    }),
  }),
});

export const {
  useGetKnowledgeIndexQuery,
  useGetRelatedKnowledgeQuery,
  useLazySearchKnowledgeQuery,
  useLazyExportKnowledgeBaseQuery,
  useGetDecisionLogsQuery,
  useGetDecisionLogQuery,
  useCreateDecisionLogMutation,
  useUpdateDecisionLogMutation,
  useDeleteDecisionLogMutation,
} = knowledgeApiSlice;
