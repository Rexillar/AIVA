import { apiSlice } from "../apiSlice";

export const automationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAutomationRules: builder.query({
      query: (workspaceId) => ({
        url: `/automation`,
        params: { workspaceId },
      }),
      transformResponse: (res) => res.data || res,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: "AutomationRule", id: _id })),
              { type: "AutomationRule", id: "LIST" },
            ]
          : [{ type: "AutomationRule", id: "LIST" }],
    }),

    getAutomationRule: builder.query({
      query: (id) => `/automation/${id}`,
      transformResponse: (res) => res.data || res,
      providesTags: (result, error, id) => [{ type: "AutomationRule", id }],
    }),

    createAutomationRule: builder.mutation({
      query: (body) => ({ url: `/automation`, method: "POST", body }),
      invalidatesTags: [{ type: "AutomationRule", id: "LIST" }],
    }),

    updateAutomationRule: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/automation/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "AutomationRule", id },
        { type: "AutomationRule", id: "LIST" },
      ],
    }),

    deleteAutomationRule: builder.mutation({
      query: (id) => ({ url: `/automation/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "AutomationRule", id: "LIST" }],
    }),

    toggleAutomationRule: builder.mutation({
      query: (id) => ({ url: `/automation/${id}/toggle`, method: "PUT" }),
      invalidatesTags: (result, error, id) => [
        { type: "AutomationRule", id },
        { type: "AutomationRule", id: "LIST" },
      ],
    }),

    triggerAutomationRule: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/automation/${id}/trigger`,
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetAutomationRulesQuery,
  useGetAutomationRuleQuery,
  useCreateAutomationRuleMutation,
  useUpdateAutomationRuleMutation,
  useDeleteAutomationRuleMutation,
  useToggleAutomationRuleMutation,
  useTriggerAutomationRuleMutation,
} = automationApiSlice;
