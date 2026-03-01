import { apiSlice } from "../apiSlice";

export const templateApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTemplates: builder.query({
      query: ({ workspaceId, category }) => ({
        url: `/templates`,
        params: { workspaceId, category },
      }),
      transformResponse: (res) => res.data || res,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: "Template", id: _id })),
              { type: "Template", id: "LIST" },
            ]
          : [{ type: "Template", id: "LIST" }],
    }),

    getTemplate: builder.query({
      query: (id) => `/templates/${id}`,
      transformResponse: (res) => res.data || res,
      providesTags: (result, error, id) => [{ type: "Template", id }],
    }),

    createTemplate: builder.mutation({
      query: (body) => ({ url: `/templates`, method: "POST", body }),
      invalidatesTags: [{ type: "Template", id: "LIST" }],
    }),

    updateTemplate: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/templates/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Template", id },
        { type: "Template", id: "LIST" },
      ],
    }),

    deleteTemplate: builder.mutation({
      query: (id) => ({ url: `/templates/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Template", id: "LIST" }],
    }),

    createTaskFromTemplate: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/templates/${id}/create-task`,
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Template", id: "LIST" },
        { type: "Task", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetTemplatesQuery,
  useGetTemplateQuery,
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
  useDeleteTemplateMutation,
  useCreateTaskFromTemplateMutation,
} = templateApiSlice;
