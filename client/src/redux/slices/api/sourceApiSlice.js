import { apiSlice } from "../apiSlice";

export const sourceApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSources: builder.query({
      query: ({ workspaceId, type, search }) => ({
        url: `/sources`,
        params: { workspace: workspaceId, type, search },
      }),
      transformResponse: (res) => res.data || res,
      providesTags: (result) =>
        result?.sources
          ? [
              ...result.sources.map(({ _id }) => ({ type: "Source", id: _id })),
              { type: "Source", id: "LIST" },
            ]
          : [{ type: "Source", id: "LIST" }],
    }),

    getSource: builder.query({
      query: (id) => `/sources/${id}`,
      transformResponse: (res) => res.data || res,
      providesTags: (result, error, id) => [{ type: "Source", id }],
    }),

    createSource: builder.mutation({
      query: (body) => ({ url: `/sources`, method: "POST", body }),
      invalidatesTags: [{ type: "Source", id: "LIST" }],
    }),

    updateSource: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/sources/${id}`, method: "PATCH", body }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Source", id },
        { type: "Source", id: "LIST" },
      ],
    }),

    deleteSource: builder.mutation({
      query: (id) => ({ url: `/sources/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Source", id: "LIST" }],
    }),
  }),
});

export const {
  useGetSourcesQuery,
  useGetSourceQuery,
  useCreateSourceMutation,
  useUpdateSourceMutation,
  useDeleteSourceMutation,
} = sourceApiSlice;
