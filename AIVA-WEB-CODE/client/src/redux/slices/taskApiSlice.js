/*=================================================================
 * Project: AIVA-WEB
 * File: Button.jsx
 * Author: Mohitraj Jadeja
 * Date Created: February 28, 2024
 * Last Modified: February 28, 2024
 *=================================================================
 * Description:
 * Button component for displaying buttons.
 *=================================================================
 * Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
 *=================================================================*/
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const isValidWorkspaceId = (workspaceId) => {
  return typeof workspaceId === "string" && workspaceId.length > 0;
};

const taskApiSlice = createApi({
  reducerPath: "taskApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:5000/api" }),
  endpoints: (builder) => ({
    createTask: builder.mutation({
      query: ({ taskData, workspaceId }) => {
        if (!isValidWorkspaceId(workspaceId)) {
          throw new Error("Invalid workspace ID");
        }
        return {
          url: "/tasks",
          method: "POST",
          body: taskData,
        };
      },
    }),
    // Add other endpoints as needed
  }),
});

export const { useCreateTaskMutation } = taskApiSlice;
export default taskApiSlice.reducer;
