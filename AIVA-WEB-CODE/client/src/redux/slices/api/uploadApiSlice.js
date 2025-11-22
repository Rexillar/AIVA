/*=================================================================
 * Project: AIVA-WEB
 * File: uploadApiSlice.js
 * Author: Mohitraj Jadeja
 * Date Created: October 21, 2025
 * Last Modified: October 21, 2025
 *=================================================================
 * Description:
 * API slice for file upload operations
 *=================================================================
 * Copyright (c) 2025 Mohitraj Jadeja. All rights reserved.
 *=================================================================*/
import { apiSlice } from "../../slices/apiSlice";

export const uploadApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    uploadFile: builder.mutation({
      query: ({ formData, workspaceId, taskId }) => {
        const url = taskId
          ? `/workspace/${workspaceId}/task/${taskId}/uploads`
          : `/workspace/${workspaceId}/uploads`;

        return {
          url,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["File", "Task"],
    }),

    deleteFile: builder.mutation({
      query: ({ workspaceId, taskId, fileId }) => {
        const url = taskId
          ? `/workspace/${workspaceId}/task/${taskId}/uploads/${fileId}`
          : `/workspace/${workspaceId}/uploads/${fileId}`;

        return {
          url,
          method: "DELETE",
        };
      },
      invalidatesTags: ["File", "Task"],
    }),

    getTaskFiles: builder.query({
      query: ({ workspaceId, taskId }) => ({
        url: `/workspace/${workspaceId}/task/${taskId}/uploads`,
        method: "GET",
      }),
      providesTags: ["File"],
    }),

    getWorkspaceFiles: builder.query({
      query: (workspaceId) => ({
        url: `/workspace/${workspaceId}/uploads`,
        method: "GET",
      }),
      providesTags: ["File"],
    }),
  }),
});

export const {
  useUploadFileMutation,
  useDeleteFileMutation,
  useGetTaskFilesQuery,
  useGetWorkspaceFilesQuery,
} = uploadApiSlice;
