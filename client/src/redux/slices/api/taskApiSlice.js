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

   ⟁  PURPOSE      : Manage task-related application state

   ⟁  WHY          : Predictable task state updates and caching

   ⟁  WHAT         : Redux slice for task operations and state

   ⟁  TECH STACK   : React • Redux • Vite
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : HIGH
   ⟁  DOCS : /docs/frontend/state-management.md

   ⟁  USAGE RULES  : Immutable updates • Action types • Error handling

        "Task state managed. Updates predictable. UI responsive."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

import { apiSlice } from "../../slices/apiSlice";
import { toast } from "sonner";
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Simple toast functions with toast.dismiss()
const notify = {
  success: (message, id) => {
    toast.dismiss();
    toast.success(message, {
      id,
      className:
        "bg-black text-green-400 font-medium rounded-lg border-none shadow-lg",
      duration: 2000,
      position: "top-right",
    });
  },
  error: (message, id) => {
    toast.dismiss();
    toast.error(message, {
      id,
      className:
        "bg-black text-red-400 font-medium rounded-lg border-none shadow-lg",
      duration: 2000,
      position: "top-right",
    });
  },
};

const baseQuery = fetchBaseQuery({
  baseUrl: "/api",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// Validation helper functions
const validateTaskId = (taskId) => {
  if (!taskId || typeof taskId !== "string" || !taskId.trim()) {
    throw new Error("Task ID must be a non-empty string");
  }
  return taskId.trim();
};

const validateWorkspaceId = (workspaceId) => {
  if (!workspaceId || typeof workspaceId !== "string" || !workspaceId.trim()) {
    throw new Error("Workspace ID must be a non-empty string");
  }
  return workspaceId.trim();
};

export const taskApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getTasks: builder.query({
      query: ({ workspaceId, status }) => {
        // Validate workspace ID
        try {
          validateWorkspaceId(workspaceId);
        } catch (error) {
          throw { status: 400, data: { message: error.message } };
        }

        return {
          url: `/tasks`,
          method: "GET",
          params: { workspaceId, status },
        };
      },
      transformResponse: (response) => {
        if (!response?.status) {
          throw new Error("Failed to fetch tasks");
        }
        return response.tasks || []; // Return the tasks array or empty array if null
      },
      transformErrorResponse: (error) => ({
        status: error.status,
        message: error.data?.message || "Failed to fetch tasks",
      }),
      providesTags: ["Task"],
    }),

    getDashboardStats: builder.query({
      query: (workspaceId) => `/tasks/dashboard?workspaceId=${workspaceId}`,
      providesTags: ["Dashboard"],
    }),

    getTask: builder.query({
      query: ({ taskId, workspaceId }) => {
        try {
          validateWorkspaceId(workspaceId);
          validateTaskId(taskId);
        } catch (error) {
          throw { status: 400, data: { message: error.message } };
        }

        return {
          url: `/tasks/${taskId}`,
          method: "GET",
          params: { workspaceId },
        };
      },
      transformResponse: (response) => {
        if (!response?.success && !response?.data) {
          throw new Error("Failed to fetch task");
        }
        // Ensure subtasks array exists and has proper status values
        const task = response.data;
        if (task.subtasks) {
          task.subtasks = task.subtasks.map((subtask) => ({
            ...subtask,
            status: subtask.status || "todo",
          }));
        }
        return task;
      },
      providesTags: (result, error, { taskId }) => [
        { type: "Task", id: taskId },
        "Task",
      ],
    }),

    getTaskComments: builder.query({
      query: (taskId) => ({
        url: `/tasks/${taskId}/comments`,
        method: "GET",
      }),
      transformResponse: (response) => {
        if (!response?.success) {
          throw new Error("Failed to fetch task comments");
        }
        return response.data || [];
      },
      providesTags: (result, error, taskId) => [
        { type: "TaskComments", id: taskId },
      ],
    }),

    createTask: builder.mutation({
      query: ({ taskData }) => ({
        url: "/tasks",
        method: "POST",
        body: taskData,
      }),
      transformResponse: (response) => {
        if (!response?.success) {
          throw new Error("Failed to create task");
        }
        return {
          status: true,
          data: response.data,
        };
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.status) {
            // Invalidate relevant tags to refetch tasks
            dispatch(
              taskApiSlice.util.invalidateTags(["Task", "Tasks", "Dashboard"]),
            );
          }
        } catch (error) {
          // console.error('Error creating task:', error);
          if (error?.error?.status === 400) {
            toast.error(
              "Please fill in all required fields: title, workspace, and due date",
            );
          } else if (error?.error?.status === 500) {
            toast.error("Server error. Please try again later.");
          } else {
            toast.error(error?.error?.data?.message || "Failed to create task");
          }
        }
      },
      invalidatesTags: ["Task", "Tasks", "Dashboard"],
    }),

    updateTask: builder.mutation({
      query: ({ taskId, workspaceId, updates }) => {
        try {
          // Validate IDs - Allow both MongoDB ObjectIDs and Google task IDs
          if (!taskId || typeof taskId !== 'string' || !taskId.trim()) {
            throw new Error("Invalid task ID format");
          }
          if (!workspaceId || !/^[0-9a-fA-F]{24}$/.test(workspaceId)) {
            throw new Error("Invalid workspace ID format");
          }

          // Validate stage if it's being updated
          if (updates.stage) {
            const validStages = ["todo", "in_progress", "review", "completed"];
            if (!validStages.includes(updates.stage)) {
              throw new Error("Invalid task stage");
            }
          }

          return {
            url: `/tasks/${taskId}`,
            method: "PUT",
            body: {
              workspaceId,
              ...updates,
            },
          };
        } catch (error) {
          throw { status: 400, data: { message: error.message } };
        }
      },
      transformResponse: (response) => {
        if (!response?.status && !response?.data) {
          throw new Error("Failed to update task");
        }
        return response.data || response;
      },
      async onQueryStarted(
        { taskId, workspaceId, updates },
        { dispatch, queryFulfilled },
      ) {
        try {
          // Wait for the mutation to complete
          const result = await queryFulfilled;
          const response = result.data;

          // Check if rewards were earned
          // Note: Gamification functionality not implemented
          // if (response.rewards) {
          //   dispatch(showRewards(response.rewards));
          // }

          // Update the task in the cache immediately
          dispatch(
            taskApiSlice.util.updateQueryData(
              "getWorkspaceTasks",
              { workspaceId },
              (draft) => {
                if (!draft?.tasks) return;
                const taskIndex = draft.tasks.findIndex(
                  (t) => t._id === taskId,
                );
                if (taskIndex !== -1) {
                  draft.tasks[taskIndex] = {
                    ...draft.tasks[taskIndex],
                    ...updates,
                  };
                }

                // Recalculate stats
                const tasks = draft.tasks;
                draft.stats = {
                  total: tasks.length,
                  todo: tasks.filter((t) => t.stage === "todo").length,
                  in_progress: tasks.filter((t) => t.stage === "in_progress")
                    .length,
                  review: tasks.filter((t) => t.stage === "review").length,
                  completed: tasks.filter((t) => t.stage === "completed")
                    .length,
                  overdue: tasks.filter((t) => {
                    const dueDate = new Date(t.dueDate);
                    return (
                      dueDate &&
                      !isNaN(dueDate.getTime()) &&
                      dueDate < new Date() &&
                      t.stage !== "completed"
                    );
                  }).length,
                };

                // Calculate additional stats
                draft.stats.activeTasksCount =
                  draft.stats.in_progress + draft.stats.review;
                draft.stats.completionRate =
                  draft.stats.total > 0
                    ? Math.round(
                        (draft.stats.completed / draft.stats.total) * 100,
                      )
                    : 0;
              },
            ),
          );

          // Invalidate relevant tags to ensure data consistency
          dispatch(
            taskApiSlice.util.invalidateTags([
              { type: "Task", id: taskId },
              { type: "Tasks", id: workspaceId },
              "Dashboard",
            ]),
          );
        } catch (error) {
          // console.error('Error updating task:', error);
        }
      },
      invalidatesTags: (result, error, { taskId, workspaceId }) => [
        { type: "Task", id: taskId },
        { type: "Tasks", id: workspaceId },
        "Dashboard",
      ],
    }),

    deleteTask: builder.mutation({
      query: ({ taskId, workspaceId }) => {
        // Validate parameters
        if (!taskId || !workspaceId) {
          throw new Error("Both taskId and workspaceId are required");
        }
        return {
          url: `/tasks/${taskId}`,
          method: "DELETE",
          params: { workspaceId },
        };
      },
      transformResponse: (response) => {
        if (!response?.success) {
          throw new Error(response?.message || "Failed to delete task");
        }
        return response;
      },
      async onQueryStarted(
        { taskId, workspaceId },
        { dispatch, queryFulfilled },
      ) {
        try {
          // Wait for the server response
          const { data } = await queryFulfilled;

          if (data?.success) {
            // Remove from trash view
            dispatch(
              taskApiSlice.util.updateQueryData(
                "getWorkspaceTasks",
                { workspaceId, filter: "trash" },
                (draft) => {
                  if (!draft?.tasks) return;
                  draft.tasks = draft.tasks.filter((t) => t._id !== taskId);
                  if (draft.stats) {
                    draft.stats.total = Math.max(
                      (draft.stats.total || 0) - 1,
                      0,
                    );
                    draft.stats.trashCount = Math.max(
                      (draft.stats.trashCount || 0) - 1,
                      0,
                    );
                    draft.stats.deleted = Math.max(
                      (draft.stats.deleted || 0) - 1,
                      0,
                    );
                  }
                },
              ),
            );

            // Invalidate relevant tags to ensure data consistency
            dispatch(
              taskApiSlice.util.invalidateTags([
                { type: "Task", id: taskId },
                { type: "Tasks", id: workspaceId },
                "Dashboard",
              ]),
            );

            notify.success("Task deleted permanently");
          }
        } catch (error) {
          // console.error('Error deleting task:', error);
          notify.error(error?.error?.data?.message || "Failed to delete task");
          throw error;
        }
      },
      invalidatesTags: (result, error, { taskId, workspaceId }) => [
        { type: "Task", id: taskId },
        { type: "Tasks", id: workspaceId },
        "Dashboard",
      ],
    }),

    createSubtask: builder.mutation({
      query: ({ taskId, workspaceId, title, description }) => ({
        url: `/tasks/${taskId}/subtask`,
        method: "POST",
        body: { title, description, workspaceId },
      }),
      transformResponse: (response) => {
        if (!response?.success) {
          throw new Error(response?.message || "Failed to create subtask");
        }
        return response.data;
      },
      transformErrorResponse: (error) => ({
        status: error.status,
        message: error.data?.message || "Failed to create subtask",
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: "Task", id: taskId },
        "Tasks",
      ],
    }),

    updateSubtask: builder.mutation({
      query: ({ taskId, subtaskId, workspaceId, ...updates }) => ({
        url: `/tasks/${taskId}/subtask/${subtaskId}`,
        method: "PUT",
        body: { ...updates, workspaceId },
      }),
      transformResponse: (response) => {
        if (!response?.success) {
          throw new Error(response?.message || "Failed to update subtask");
        }
        return response.data;
      },
      transformErrorResponse: (error) => ({
        status: error.status,
        message: error.data?.message || "Failed to update subtask",
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: "Task", id: taskId },
        "Tasks",
      ],
    }),

    deleteSubtask: builder.mutation({
      query: ({ taskId, subtaskId, workspaceId }) => ({
        url: `/tasks/${taskId}/subtask/${subtaskId}`,
        method: "DELETE",
        body: { workspaceId },
      }),
      transformResponse: (response) => {
        if (!response?.success) {
          throw new Error(response?.message || "Failed to delete subtask");
        }
        return response;
      },
      transformErrorResponse: (error) => ({
        status: error.status,
        message: error.data?.message || "Failed to delete subtask",
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: "Task", id: taskId },
        "Tasks",
      ],
    }),

    completeSubtask: builder.mutation({
      query: ({ taskId, subtaskId }) => ({
        url: `/tasks/${taskId}/subtask/${subtaskId}/complete`,
        method: "PUT",
      }),
      transformResponse: (response) => {
        if (!response.success) {
          throw new Error(response.message || "Failed to complete subtask");
        }
        return response;
      },
      transformErrorResponse: (error) => ({
        status: false,
        message: error.data?.message || "Failed to complete subtask",
      }),
      invalidatesTags: ["Task"],
    }),

    addTaskComment: builder.mutation({
      query: ({ taskId, comment }) => ({
        url: `/tasks/${taskId}/comment`,
        method: "POST",
        body: { comment },
      }),
      invalidatesTags: ["Task"],
    }),

    uploadAsset: builder.mutation({
      query: ({ taskId, asset }) => ({
        url: `/tasks/${taskId}/attachments`,
        method: "POST",
        body: asset,
      }),
      invalidatesTags: ["Task"],
    }),

    deleteTaskAsset: builder.mutation({
      query: ({ taskId, assetId }) => ({
        url: `/tasks/${taskId}/asset/${assetId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Task"],
    }),

    getWorkspaceTasks: builder.query({
      query: ({ workspaceId, filter, status }) => {
        if (!workspaceId || !/^[0-9a-fA-F]{24}$/.test(workspaceId)) {
          throw new Error("Invalid workspace ID");
        }
        return {
          url: "/tasks",
          method: "GET",
          params: {
            workspaceId,
            filter,
            status,
            includeArchived: filter === "trash" ? true : undefined,
            includeDeleted: filter === "trash" ? true : undefined,
          },
        };
      },
      transformResponse: (response) => {
        // Ensure we have a valid tasks array
        const tasks = Array.isArray(response?.tasks) ? response.tasks : [];

        // Use server-calculated stats if available, otherwise calculate locally
        const stats = response?.stats || {
          total: tasks.length,
          todo: tasks.filter((t) => t.stage === "todo").length,
          in_progress: tasks.filter((t) => t.stage === "in_progress").length,
          review: tasks.filter((t) => t.stage === "review").length,
          completed: tasks.filter((t) => t.stage === "completed").length,
          archived: tasks.filter((t) => t.isArchived === true).length,
          deleted: tasks.filter((t) => t.isDeleted === true).length,
          overdue: tasks.filter((t) => {
            const dueDate = new Date(t.dueDate);
            return (
              dueDate &&
              !isNaN(dueDate.getTime()) &&
              dueDate < new Date() &&
              t.stage !== "completed"
            );
          }).length,
        };

        // Calculate additional stats if not provided by server
        if (!response?.stats) {
          stats.activeTasksCount = (stats.in_progress || 0) + (stats.review || 0);
          stats.completionRate =
            stats.total > 0
              ? Math.round((stats.completed / stats.total) * 100)
              : 0;
          stats.trashCount = (stats.archived || 0) + (stats.deleted || 0);
        }

        return {
          status: true,
          tasks,
          stats,
          workspace: response?.workspace || null,
        };
      },
      transformErrorResponse: (response) => {
        // Return a consistent structure even in error cases
        return {
          status: false,
          tasks: [],
          stats: {
            total: 0,
            todo: 0,
            in_progress: 0,
            review: 0,
            completed: 0,
            overdue: 0,
            activeTasksCount: 0,
            completionRate: 0,
          },
          workspace: null,
        };
      },
      providesTags: (result, error, { workspaceId }) => [
        { type: "Tasks", id: workspaceId },
        { type: "Workspace", id: workspaceId },
      ],
    }),

    moveToTrash: builder.mutation({
      query: ({ taskId, workspaceId }) => {
        try {
          validateTaskId(taskId);
          validateWorkspaceId(workspaceId);
        } catch (error) {
          throw { status: 400, data: { message: error.message } };
        }

        return {
          url: `/tasks/${taskId}/trash`,
          method: "PUT",
          params: { workspaceId },
        };
      },
      transformResponse: (response) => {
        if (!response?.success) {
          throw new Error(response?.message || "Failed to move task to trash");
        }
        return response.data;
      },
      transformErrorResponse: (error) => {
        // console.error('Move to trash error:', error);
        return {
          status: error.status,
          message: error.data?.message || "Failed to move task to trash",
        };
      },
      async onQueryStarted(
        { taskId, workspaceId },
        { dispatch, queryFulfilled },
      ) {
        try {
          // Optimistically update the UI
          dispatch(
            taskApiSlice.util.updateQueryData(
              "getWorkspaceTasks",
              { workspaceId },
              (draft) => {
                if (!draft?.tasks) return;
                // Remove the task from the active tasks list
                draft.tasks = draft.tasks.filter((task) => task._id !== taskId);
                // Update stats
                if (draft.stats) {
                  draft.stats.total = Math.max(0, (draft.stats.total || 0) - 1);
                  draft.stats.activeTasksCount = Math.max(
                    0,
                    (draft.stats.activeTasksCount || 0) - 1,
                  );
                  draft.stats.trashCount = (draft.stats.trashCount || 0) + 1;
                }
              },
            ),
          );

          // Wait for the actual response
          await queryFulfilled;

          // Update the trash count in dashboard stats
          dispatch(
            taskApiSlice.util.updateQueryData(
              "getDashboardStats",
              workspaceId,
              (draft) => {
                if (draft?.data) {
                  draft.data.activeTasksCount = Math.max(
                    0,
                    (draft.data.activeTasksCount || 0) - 1,
                  );
                }
              },
            ),
          );

          // Invalidate relevant tags
          dispatch(
            taskApiSlice.util.invalidateTags(["Task", "Tasks", "Dashboard"]),
          );
        } catch (error) {
          // console.error('Error moving task to trash:', error);
          // Revert optimistic update on error
          dispatch(
            taskApiSlice.util.invalidateTags(["Task", "Tasks", "Dashboard"]),
          );
          throw error;
        }
      },
      invalidatesTags: ["Task", "Tasks", "Dashboard"],
    }),

    restoreTask: builder.mutation({
      query: ({ taskId, workspaceId }) => {
        // Validate parameters
        if (!taskId || !workspaceId) {
          throw new Error("Both taskId and workspaceId are required");
        }
        return {
          url: `/tasks/${taskId}/restore`,
          method: "PUT",
          body: { workspaceId },
        };
      },
      transformResponse: (response) => {
        // Check if response exists and has success flag
        if (!response) {
          throw new Error("No response received");
        }
        // Return the response for both success and error cases
        return {
          status: response.success || response.status,
          message: response.message || "Task restored successfully",
          data: response.data,
        };
      },
      transformErrorResponse: (error) => ({
        status: false,
        message: error.data?.message || "Failed to restore task",
      }),
      async onQueryStarted(
        { taskId, workspaceId },
        { dispatch, queryFulfilled },
      ) {
        try {
          const result = await queryFulfilled;

          // Only update cache if restoration was successful
          if (result?.data?.status) {
            // Update cache to remove the task from trash view
            dispatch(
              taskApiSlice.util.updateQueryData(
                "getWorkspaceTasks",
                { workspaceId, filter: "trash" },
                (draft) => {
                  if (!draft?.tasks) return;
                  draft.tasks = draft.tasks.filter((t) => t._id !== taskId);
                },
              ),
            );

            // Invalidate relevant tags to refetch data
            dispatch(
              taskApiSlice.util.invalidateTags([
                { type: "Task", id: taskId },
                { type: "Tasks", id: workspaceId },
                "Dashboard",
              ]),
            );

            toast.success("Task restored successfully");
          }
        } catch (error) {
          // console.error('Error restoring task:', error);
          const message =
            error?.error?.data?.message || "Failed to restore task";
          toast.error(message);
          throw error;
        }
      },
    }),

    postActivity: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/tasks/${id}/activity`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Task"],
    }),

    duplicateTask: builder.mutation({
      query: (id) => ({
        url: `/tasks/${id}/duplicate`,
        method: "POST",
      }),
      invalidatesTags: ["Task"],
    }),

    addActivity: builder.mutation({
      query: ({ taskId, activityData }) => ({
        url: `/${taskId}/activity`,
        method: "POST",
        body: activityData,
      }),
    }),

    updateTaskSubtasks: builder.mutation({
      query: ({ taskId, workspaceId, subtasks }) => ({
        url: `/tasks/${taskId}`,
        method: "PUT",
        body: { subtasks, workspaceId },
      }),
      transformResponse: (response) => {
        if (!response?.success) {
          throw new Error(response?.message || "Failed to update subtasks");
        }
        return response.data;
      },
      transformErrorResponse: (error) => ({
        status: error.status,
        message: error.data?.message || "Failed to update subtasks",
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: "Task", id: taskId },
        "Tasks",
      ],
    }),
  }),
});

export default taskApiSlice;

export const {
  useGetTasksQuery,
  useGetTaskQuery,
  useGetTaskCommentsQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useCreateSubtaskMutation,
  useUpdateSubtaskMutation,
  useDeleteSubtaskMutation,
  useCompleteSubtaskMutation,
  useAddTaskCommentMutation,
  useUploadAssetMutation,
  useDeleteTaskAssetMutation,
  useGetWorkspaceTasksQuery,
  useGetDashboardStatsQuery,
  useMoveToTrashMutation,
  useRestoreTaskMutation,
  usePostActivityMutation,
  useDuplicateTaskMutation,
  useAddActivityMutation,
  useUpdateTaskSubtasksMutation,
} = taskApiSlice;

// Aliases for backward compatibility
export const useGetAllTaskQuery = useGetTasksQuery;
export const useGetSingleTaskQuery = useGetTaskQuery;
export const useAddSubtaskMutation = useCreateSubtaskMutation;

export const initiate = (arg) => {
  return async (dispatch) => {
    try {
      // Initialize tasks data
      if (arg?.workspaceId) {
        await dispatch(
          taskApiSlice.endpoints.getWorkspaceTasks.initiate({
            workspaceId: arg.workspaceId,
            filter: "active",
          }),
        );

        // Initialize dashboard stats
        await dispatch(
          taskApiSlice.endpoints.getDashboardStats.initiate(arg.workspaceId),
        );
      }
    } catch (error) {
      // console.error('Failed to initialize task data:', error);
      notify.error("Failed to initialize task data");
    }
  };
};
