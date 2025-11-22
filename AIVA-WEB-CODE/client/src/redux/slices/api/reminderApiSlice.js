import { apiSlice } from "../../slices/apiSlice";

export const reminderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getReminders: builder.query({
      query: (workspaceId) => ({
        url: `/api/reminders/${workspaceId}`,
        method: "GET",
      }),
      providesTags: ["Reminders"],
    }),

    createReminder: builder.mutation({
      query: (data) => ({
        url: "/api/reminders/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Reminders"],
    }),

    updateReminder: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/reminders/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Reminders"],
    }),

    deleteReminder: builder.mutation({
      query: (id) => ({
        url: `/api/reminders/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Reminders"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetRemindersQuery,
  useCreateReminderMutation,
  useUpdateReminderMutation,
  useDeleteReminderMutation,
} = reminderApiSlice;
