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
import {
  setPrivateWorkspace,
  setPublicWorkspaces,
  addPublicWorkspace,
  removePublicWorkspace,
} from "../authSlice";
import {
  setCurrentWorkspace,
  setWorkspaces,
  setWorkspaceError,
  clearCurrentWorkspace,
} from "../workspaceSlice";
import { toast } from "sonner";

// Base workspace URL with /api prefix
const WORKSPACE_URL = "/api/workspaces";

// Add validation helper at the top
const isValidObjectId = (id) => id && /^[0-9a-fA-F]{24}$/.test(id);

export const workspaceApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Workspace CRUD
    createWorkspace: builder.mutation({
      query: (data) => ({
        url: WORKSPACE_URL,
        method: "POST",
        body: {
          ...data,
          type:
            data.visibility === "private"
              ? "PrivateWorkspace"
              : "PublicWorkspace",
          visibility: data.visibility || "private",
        },
      }),
      transformResponse: (response) => {
        if (!response?.status) {
          throw new Error(response?.message || "Failed to create workspace");
        }
        return {
          status: true,
          data: response.data,
        };
      },
      transformErrorResponse: (error) => ({
        status: false,
        message: error.data?.message || "Failed to create workspace",
      }),
      invalidatesTags: ["Workspace", "Dashboard"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          if (data?.data?.workspace) {
            const workspace = data.data.workspace;

            // Handle invitations if they were sent during workspace creation
            if (data.data.invitationResults?.length > 0) {
              const { invitationResults } = data.data;

              const successfulInvites = invitationResults.filter(
                (result) =>
                  result.status === "invited_existing" ||
                  result.status === "invited_new",
              );

              const failedInvites = invitationResults.filter(
                (result) => result.status === "failed",
              );

              if (successfulInvites.length > 0) {
                toast.success(
                  `Successfully invited ${successfulInvites.length} member${successfulInvites.length > 1 ? "s" : ""}`,
                );
              }

              if (failedInvites.length > 0) {
                const failedEmails = failedInvites
                  .map((invite) => invite.email)
                  .join(", ");
                toast.error(`Failed to invite: ${failedEmails}`);
              }
            }

            // Update workspace in store based on type
            if (
              workspace.type === "PrivateWorkspace" ||
              workspace.visibility === "private"
            ) {
              dispatch(setPrivateWorkspace(workspace));
            } else {
              dispatch(addPublicWorkspace(workspace));
            }
            dispatch(setCurrentWorkspace(workspace));
          }
        } catch (error) {
          // console.error('Error creating workspace:', error);
          toast.error(error?.data?.message || "Failed to create workspace");
        }
      },
    }),

    getWorkspaces: builder.query({
      query: () => ({
        url: WORKSPACE_URL,
        method: "GET",
      }),
      providesTags: ["Workspace"],
    }),

    getWorkspace: builder.query({
      query: (workspaceId) => ({
        url: `${WORKSPACE_URL}/${workspaceId}`,
        method: "GET",
        credentials: "include",
      }),
      transformResponse: (response) => {
        if (!response?.status) {
          // console.log('Invalid workspace response:', response);
          return null;
        }
        return response.data;
      },
      transformErrorResponse: (error) => {
        // console.error('Workspace fetch error:', error);
        return {
          status: false,
          message: error.data?.message || "Failed to load workspace",
        };
      },
      providesTags: (result, error, workspaceId) => [
        { type: "Workspace", id: workspaceId },
      ],
    }),

    updateWorkspace: builder.mutation({
      query: (data) => {
        // Validate required fields
        if (!data?.id) {
          throw new Error("Workspace ID is required");
        }
        if (!data?.name) {
          throw new Error("Workspace name is required");
        }

        const { id, ...updateData } = data;

        return {
          url: `${WORKSPACE_URL}/${id}`,
          method: "PUT",
          body: updateData,
          credentials: "include",
        };
      },
      transformResponse: (response) => {
        if (!response?.status) {
          throw new Error(response?.message || "Failed to update workspace");
        }
        return {
          status: true,
          data: response.data,
          message: "Workspace updated successfully",
        };
      },
      transformErrorResponse: (error) => {
        // console.error('Workspace update error:', error);
        return {
          status: false,
          message: error.data?.message || "Failed to update workspace",
        };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "Workspace", id },
        "Workspace",
        "Dashboard",
      ],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          if (data?.status && data?.data) {
            // Update the workspace in Redux store
            dispatch(setCurrentWorkspace(data.data));

            // Show success message
            toast.success(data.message || "Workspace updated successfully");
          }
        } catch (error) {
          // console.error('Error updating workspace:', error);
          toast.error(error?.data?.message || "Failed to update workspace");
        }
      },
    }),

    deleteWorkspace: builder.mutation({
      query: (id) => ({
        url: `${WORKSPACE_URL}/${id}`,
        method: "DELETE",
        credentials: "include",
      }),
      transformResponse: (response) => {
        if (!response?.status) {
          throw new Error(response?.message || "Failed to delete workspace");
        }
        return response;
      },
      transformErrorResponse: (error) => ({
        status: false,
        message: error.data?.message || "Failed to delete workspace",
      }),
      invalidatesTags: ["Workspace", "Dashboard"],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(removePublicWorkspace(id));
          dispatch(clearCurrentWorkspace());
        } catch (error) {
          // console.error('Error deleting workspace:', error);
        }
      },
    }),

    // Member management
    getWorkspaceMembers: builder.query({
      query: (workspaceId) => ({
        url: `${WORKSPACE_URL}/${workspaceId}/members`,
        method: "GET",
        credentials: "include",
      }),
      transformResponse: (response) => {
        if (!response?.status) {
          // console.log('Invalid response from workspace members:', response);
          return {
            members: [],
            owner: null,
            userRole: "member",
          };
        }

        // Ensure members array is properly formatted
        const members = (response.data.members || []).map((member) => ({
          ...member,
          user: member.user._id
            ? member.user
            : { _id: member.user, name: member.name, email: member.email },
          role: member.role || "member",
          isActive: member.isActive !== false,
        }));

        return {
          members,
          owner: response.data.owner,
          userRole: response.data.userRole || "member",
        };
      },
      transformErrorResponse: (error) => {
        // console.error('Error fetching workspace members:', error);
        return {
          status: false,
          message: error.data?.message || "Failed to load team members",
          members: [],
          owner: null,
          userRole: "member",
        };
      },
      providesTags: (result, error, workspaceId) => [
        { type: "WorkspaceMembers", id: workspaceId },
      ],
    }),

    addMember: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${WORKSPACE_URL}/${id}/members`,
        method: "POST",
        body: data,
      }),
      transformErrorResponse: (error) => ({
        status: false,
        error: error.data?.message || "Failed to add member",
      }),
      invalidatesTags: ["Workspace"],
    }),

    updateMemberRole: builder.mutation({
      query: ({ workspaceId, userId, data }) => ({
        url: `${WORKSPACE_URL}/${workspaceId}/members/${userId}/role`,
        method: "PUT",
        body: data,
      }),
      transformErrorResponse: (error) => ({
        status: false,
        error: error.data?.message || "Failed to update member role",
      }),
      invalidatesTags: ["Workspace"],
    }),
    updateMemberStatus: builder.mutation({
      query: ({ workspaceId, userId, isActive }) => ({
        url: `${WORKSPACE_URL}/${workspaceId}/members/${userId}`,
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: (result, error, { workspaceId }) => [
        { type: "Workspace", id: workspaceId },
        { type: "WorkspaceMembers", id: workspaceId },
      ],
      transformResponse: (response) => ({
        status: response.status,
        message: response.message,
        data: response.data,
      }),
      transformErrorResponse: (error) => ({
        status: false,
        message: error.data?.message || "Failed to update member status",
      }),
    }),

    removeMember: builder.mutation({
      query: ({ workspaceId, userId }) => ({
        url: `${WORKSPACE_URL}/${workspaceId}/members/${userId}`,
        method: "DELETE",
      }),
      // Invalidate relevant queries after successful removal
      invalidatesTags: (result, error, { workspaceId }) => [
        { type: "Workspace", id: workspaceId },
        { type: "WorkspaceMembers", id: workspaceId },
      ],
      // Transform the response
      transformResponse: (response) => ({
        status: response.status,
        message: response.message,
        members: response.members,
      }),
      // Handle errors
      transformErrorResponse: (response) => ({
        status: false,
        message: response.data?.message || "Failed to remove member",
        error: response.data,
      }),
    }),

    // Analytics
    getWorkspaceActivity: builder.query({
      query: (id) => ({
        url: `${WORKSPACE_URL}/${id}/activity`,
        method: "GET",
      }),
      providesTags: ["Workspace"],
    }),

    getWorkspaceStats: builder.query({
      query: (workspaceId) => ({
        url: `${WORKSPACE_URL}/${workspaceId}/stats`,
        method: "GET",
      }),
      providesTags: ["WorkspaceStats"],
    }),

    getPrivateWorkspaces: builder.query({
      query: () => ({
        url: `${WORKSPACE_URL}/private/all`,
        method: "GET",
        credentials: "include",
      }),
      transformResponse: (response) => {
        if (!response?.status) {
          // console.log('Invalid response from private workspaces:', response);
          return [];
        }
        const workspaces = response.data || [];
        // console.log('Transformed workspaces:', workspaces);
        return workspaces;
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // console.log('Query fulfilled data:', data);

          if (Array.isArray(data)) {
            // console.log('Dispatching workspaces to store:', data);
            dispatch(setWorkspaces(data));

            // If there's no current workspace, set the first one as current
            const currentWorkspace = localStorage.getItem("currentWorkspace");
            if (!currentWorkspace && data.length > 0) {
              // console.log('Setting first workspace as current:', data[0]);
              dispatch(setCurrentWorkspace(data[0]));
            }
          } else {
            // console.error('Data is not an array:', data);
          }
        } catch (err) {
          // console.error('Error in getPrivateWorkspaces:', err);
          const isCreateWorkspacePage =
            window.location.pathname === "/create-workspace";
          if (!isCreateWorkspacePage) {
            dispatch(setWorkspaceError(err.error));
          }
        }
      },
      providesTags: ["Workspace"],
    }),

    getPrivateWorkspace: builder.query({
      query: () => ({
        url: `${WORKSPACE_URL}/private`,
        method: "GET",
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data && !data.isDeleted) {
            dispatch(setCurrentWorkspace(data));
            if (data.members) {
              dispatch(setWorkspaces([data]));
            }
          }
        } catch (err) {
          const isCreateWorkspacePage =
            window.location.pathname === "/create-workspace";
          if (!isCreateWorkspacePage) {
            dispatch(setWorkspaceError(err.error));
          }
        }
      },
    }),

    getPublicWorkspaces: builder.query({
      query: () => ({
        url: `${WORKSPACE_URL}/public`,
        method: "GET",
        credentials: "include",
      }),
      transformResponse: (response) => {
        if (!response?.status) {
          // console.log('Invalid response from public workspaces:', response);
          return [];
        }
        const workspaces = response.data || [];
        // console.log('Transformed public workspaces:', workspaces);
        return workspaces;
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // console.log('Query fulfilled public workspaces data:', data);

          if (Array.isArray(data)) {
            // console.log('Dispatching public workspaces to store:', data);
            dispatch(setPublicWorkspaces(data));
          } else {
            // console.error('Public workspaces data is not an array:', data);
          }
        } catch (err) {
          // console.error('Error in getPublicWorkspaces:', err);
        }
      },
      providesTags: ["Workspace"],
    }),

    updateWorkspaceMember: builder.mutation({
      query: ({ workspaceId, memberId, updates }) => ({
        url: `${WORKSPACE_URL}/${workspaceId}/members/${memberId}`,
        method: "PATCH",
        body: updates,
      }),
      invalidatesTags: (result, error, { workspaceId }) => [
        { type: "WorkspaceMembers", id: workspaceId },
      ],
    }),

    removeWorkspaceMember: builder.mutation({
      query: ({ workspaceId, memberId }) => ({
        url: `${WORKSPACE_URL}/${workspaceId}/members/${memberId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { workspaceId }) => [
        { type: "WorkspaceMembers", id: workspaceId },
      ],
    }),

    inviteMember: builder.mutation({
      query: ({ workspaceId, email, role }) => {
        // Validate required fields
        if (!workspaceId || !isValidObjectId(workspaceId)) {
          throw new Error("Invalid workspace ID");
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          throw new Error("Invalid email address");
        }
        if (!role || !["admin", "member"].includes(role)) {
          throw new Error('Invalid role. Must be either "admin" or "member"');
        }

        return {
          url: `${WORKSPACE_URL}/${workspaceId}/invite`,
          method: "POST",
          body: { email, role },
          credentials: "include",
        };
      },
      transformResponse: (response) => {
        if (!response?.status) {
          throw new Error(response?.message || "Failed to send invitation");
        }
        return {
          status: true,
          message: response.message || "Invitation sent successfully",
          data: response.data,
        };
      },
      transformErrorResponse: (error) => {
        const message = error.data?.message || "Failed to send invitation";
        // console.error('Invitation error:', error);
        return {
          status: false,
          message,
        };
      },
      invalidatesTags: (result, error, { workspaceId }) => [
        { type: "WorkspaceMembers", id: workspaceId },
        { type: "WorkspaceInvitation" },
      ],
    }),

    toggleMemberActive: builder.mutation({
      query: ({ workspaceId, userId, data }) => ({
        url: `${WORKSPACE_URL}/${workspaceId}/members/${userId}`,
        method: "PATCH",
        body: { isActive: data.isActive },
      }),
      invalidatesTags: (result, error, { workspaceId }) => [
        { type: "Workspace", id: workspaceId },
        { type: "WorkspaceMembers", id: workspaceId },
      ],
      transformResponse: (response) => {
        if (!response) {
          return { status: false, message: "No response received" };
        }
        return {
          status: true,
          message: response.message || "Member status updated successfully",
          data: response.data,
        };
      },
      transformErrorResponse: (error) => ({
        status: false,
        message: error.data?.message || "Failed to update member status",
      }),
    }),

    // Get all users for member selection
    getUsers: builder.query({
      query: () => ({
        url: `${WORKSPACE_URL}/users/all`,
        method: "GET",
      }),
      transformResponse: (response) => ({
        data: response?.data || [],
      }),
      transformErrorResponse: () => ({
        data: [],
      }),
    }),

    getWorkspaceById: builder.query({
      query: (id) => `${WORKSPACE_URL}/${id}`,
      providesTags: ["Workspace"],
    }),

    handleWorkspaceInvitation: builder.mutation({
      query: ({ workspaceId, action }) => ({
        url: `${WORKSPACE_URL}/${workspaceId}/invitations`,
        method: "POST",
        body: { action },
      }),
      async onQueryStarted({ workspaceId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.status) {
            // Update workspace members
            dispatch(setWorkspaces([data.data.workspace]));
            // Set as current workspace if accepted
            if (data.data.status === "accepted") {
              dispatch(setCurrentWorkspace(workspaceId));
            }
          }
        } catch (error) {
          // console.error('Error handling invitation:', error);
        }
      },
      invalidatesTags: ["Workspace"],
    }),

    getWorkspaceInvitationDetails: builder.query({
      query: (invitationId) => ({
        url: `${WORKSPACE_URL}/invitation/${invitationId}`,
        method: "GET",
      }),
    }),

    getWorkspaceInvitations: builder.query({
      query: () => ({
        url: `${WORKSPACE_URL}/user/invitations`,
        method: "GET",
      }),
      transformResponse: (response) => response?.data || [],
      transformErrorResponse: () => [],
      providesTags: ["WorkspaceInvitation"],
    }),

    handleInvitation: builder.mutation({
      query: ({ workspaceId, invitationId, action }) => ({
        url: `${WORKSPACE_URL}/${workspaceId}/invitations`,
        method: "POST",
        body: { invitationId, action },
      }),
      async onQueryStarted(
        { workspaceId, action },
        { dispatch, queryFulfilled },
      ) {
        try {
          const { data } = await queryFulfilled;
          if (data?.status && data?.data?.workspace) {
            const workspace = data.data.workspace;

            // Update workspace in store based on type
            if (action === "accept") {
              // First update the workspace lists
              if (
                workspace.type === "PrivateWorkspace" ||
                workspace.visibility === "private"
              ) {
                dispatch(setPrivateWorkspace(workspace));
                dispatch(setWorkspaces([workspace]));
              } else {
                dispatch(addPublicWorkspace(workspace));
                dispatch(
                  setPublicWorkspaces((prev) => [...(prev || []), workspace]),
                );
              }

              // Then set as current workspace
              dispatch(setCurrentWorkspace(workspace));

              // Invalidate queries to refetch workspace data
              dispatch(
                workspaceApiSlice.util.invalidateTags([
                  { type: "Workspace", id: workspaceId },
                  { type: "WorkspaceMembers", id: workspaceId },
                ]),
              );
            }
          }
        } catch (error) {
          // console.error('Error handling invitation:', error);
          toast.error(error?.data?.message || "Failed to handle invitation");
        }
      },
      invalidatesTags: ["WorkspaceInvitation", "Workspace"],
    }),

    // Invitation endpoints
    sendInvitation: builder.mutation({
      query: ({ workspaceId, email, role, referralCode }) => ({
        url: `${WORKSPACE_URL}/${workspaceId}/invite`,
        method: "POST",
        body: { email, role, referralCode },
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.status) {
            toast.success("Invitation sent successfully");
          }
        } catch (error) {
          // console.error('Error sending invitation:', error);
          toast.error(error?.data?.message || "Failed to send invitation");
        }
      },
    }),

    getPendingInvitations: builder.query({
      query: () => ({
        url: `${WORKSPACE_URL}/invitations`,
        method: "GET",
      }),
      transformResponse: (response) => {
        if (!response?.status) {
          return [];
        }
        return response.data.map((invitation) => ({
          _id: invitation._id,
          workspace: {
            _id: invitation.workspace._id,
            name: invitation.workspace.name,
            description: invitation.workspace.description,
          },
          invitedBy: {
            _id: invitation.invitedBy._id,
            name: invitation.invitedBy.name,
            email: invitation.invitedBy.email,
          },
          role: invitation.role,
          status: invitation.status,
          tier: invitation.tier,
          perks: invitation.perks,
          achievements: invitation.achievements,
          expiresAt: invitation.expiresAt,
          createdAt: invitation.createdAt,
        }));
      },
      transformErrorResponse: (error) => {
        // console.error('Error fetching invitations:', error);
        toast.error(error?.data?.message || "Failed to fetch invitations");
        return [];
      },
      providesTags: ["WorkspaceInvitation"],
    }),

    getReferralLeaderboard: builder.query({
      query: () => `${WORKSPACE_URL}/invitations/leaderboard`,
      transformResponse: (response) => response?.data || [],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          // console.error('Error fetching leaderboard:', error);
          toast.error(error?.data?.message || "Failed to fetch leaderboard");
        }
      },
    }),

    // Tasks endpoints
    getWorkspaceTasks: builder.query({
      query: (workspaceId) => ({
        url: `${WORKSPACE_URL}/${workspaceId}/tasks`,
        method: "GET",
      }),
      providesTags: ["Tasks"],
    }),

    // Trash management
    getTrashedWorkspaces: builder.query({
      query: () => ({
        url: `${WORKSPACE_URL}/trash`,
        method: "GET",
        credentials: "include",
      }),
      transformResponse: (response) => {
        if (!response?.status) {
          // console.log('Invalid trashed workspaces response:', response);
          return [];
        }
        return response.data || [];
      },
      transformErrorResponse: (error) => {
        // console.error('Error fetching trashed workspaces:', error);
        return {
          status: false,
          message: error.data?.message || "Failed to load trashed workspaces",
          workspaces: [],
        };
      },
      providesTags: ["Workspace", "Trash"],
    }),

    moveWorkspaceToTrash: builder.mutation({
      query: (workspaceId) => ({
        url: `${WORKSPACE_URL}/${workspaceId}/trash`,
        method: "PUT",
        credentials: "include",
        body: {}, // Add empty body to ensure proper request format
      }),
      transformResponse: (response) => {
        if (!response?.status) {
          throw new Error(
            response?.message || "Failed to move workspace to trash",
          );
        }
        return response;
      },
      transformErrorResponse: (error) => {
        // console.error('Move to trash error:', error);
        return {
          status: false,
          message: error.data?.message || "Failed to move workspace to trash",
        };
      },
      invalidatesTags: (result, error, workspaceId) => [
        { type: "Workspace", id: workspaceId },
        "Workspace",
        "Trash",
      ],
    }),

    restoreWorkspaceFromTrash: builder.mutation({
      query: (workspaceId) => ({
        url: `${WORKSPACE_URL}/${workspaceId}/restore`,
        method: "PUT",
        credentials: "include",
      }),
      transformResponse: (response) => {
        if (!response?.status) {
          throw new Error(response?.message || "Failed to restore workspace");
        }
        return response;
      },
      transformErrorResponse: (error) => ({
        status: false,
        message: error.data?.message || "Failed to restore workspace",
      }),
      invalidatesTags: ["Workspace", "Trash"],
    }),

    permanentlyDeleteWorkspace: builder.mutation({
      query: (workspaceId) => ({
        url: `${WORKSPACE_URL}/${workspaceId}/delete-permanent`,
        method: "DELETE",
        credentials: "include",
      }),
      transformResponse: (response) => {
        if (!response?.status) {
          throw new Error(response?.message || "Failed to delete workspace");
        }
        return response;
      },
      transformErrorResponse: (error) => ({
        status: false,
        message: error.data?.message || "Failed to delete workspace",
      }),
      invalidatesTags: ["Workspace", "Trash"],
    }),

    clearWorkspaceNotifications: builder.mutation({
      query: (id) => ({
        url: `${WORKSPACE_URL}/${id}/notifications/clear`,
        method: "DELETE",
      }),
      invalidatesTags: ["Workspace"],
    }),
  }),
  overrideExisting: false,
});

// Export all hooks
export const {
  useCreateWorkspaceMutation,
  useGetWorkspacesQuery,
  useGetWorkspaceQuery,
  useUpdateWorkspaceMutation,
  useDeleteWorkspaceMutation,
  useGetWorkspaceMembersQuery,
  useAddMemberMutation,
  useUpdateMemberRoleMutation,
  useUpdateMemberStatusMutation,
  useRemoveMemberMutation,
  useGetWorkspaceActivityQuery,
  useGetWorkspaceStatsQuery,
  useGetPrivateWorkspacesQuery,
  useGetPrivateWorkspaceQuery,
  useGetPublicWorkspacesQuery,
  useUpdateWorkspaceMemberMutation,
  useRemoveWorkspaceMemberMutation,
  useInviteMemberMutation,
  useToggleMemberActiveMutation,
  useGetUsersQuery,
  useGetWorkspaceByIdQuery,
  useHandleWorkspaceInvitationMutation,
  useGetWorkspaceInvitationDetailsQuery,
  useGetWorkspaceInvitationsQuery,
  useHandleInvitationMutation,
  useSendInvitationMutation,
  useGetPendingInvitationsQuery,
  useGetReferralLeaderboardQuery,
  useGetWorkspaceTasksQuery,
  useMoveWorkspaceToTrashMutation,
  useRestoreWorkspaceFromTrashMutation,
  useGetTrashedWorkspacesQuery,
  usePermanentlyDeleteWorkspaceMutation,
  useClearWorkspaceNotificationsMutation,
} = workspaceApiSlice;
