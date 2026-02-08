/*═══════════════════════════════════════════════════════════════════════════════

        █████╗ ██╗██╗   ██╗ █████╗
       ██╔══██╗██║██║   ██║██╔══██╗
       ███████║██║██║   ██║███████║
       ██╔══██║██║╚██╗ ██╔╝██╔══██║
       ██║  ██║██║ ╚████╔╝ ██║  ██║
       ╚═╝  ╚═╝╚═╝  ╚═══╝  ╚═╝  ╚═╝

   ──◈──  A I V A  ::  A I   V I R T U A L   A S S I S T A N T  ──◈──

   ◉  Deterministic Execution System
   ◉  Rule-Bound • State-Aware • Non-Emotive

   ⟁  SYSTEM LAYER : FRONTEND CORE
   ⟁  DOMAIN       : STATE MANAGEMENT

   ⟁  PURPOSE      : Provide specific functionality and operations

   ⟁  WHY          : Modular code organization and reusability

   ⟁  WHAT         : Function-based utilities and operations

   ⟁  TECH STACK   : React • Redux • Vite
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : HIGH
   ⟁  DOCS : /docs/frontend/state-management.md

   ⟁  USAGE RULES  : Immutable updates • Action types • Error handling

        "Functions implemented. Operations executed. Results delivered."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

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
