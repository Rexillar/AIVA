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
   ⟁  DOMAIN       : PAGE COMPONENTS

   ⟁  PURPOSE      : Implement complete page views and layouts

   ⟁  WHY          : Organized application navigation and structure

   ⟁  WHAT         : Full page React components with routing

   ⟁  TECH STACK   : React • Redux • Vite
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : MEDIUM
   ⟁  DOCS : /docs/frontend/pages.md

   ⟁  USAGE RULES  : Manage routing • Handle data • User experience

        "Pages rendered. Navigation smooth. User journey optimized."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

import { useState, useEffect, useMemo } from "react";
import ConfirmationDialog, {
  UserAction,
} from "../components/shared/dialog/Dialogs";
import AddUser from "../components/workspace/management/AddUser";
import TeamStats from "../components/workspace/management/TeamStats";
import TeamMembersTable from "../components/workspace/management/TeamMembersTable";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../components/shared/buttons/Button";
import { IoMdAdd } from "react-icons/io";
import {
  useGetWorkspaceMembersQuery,
  useUpdateMemberStatusMutation,
  useRemoveMemberMutation,
  useInviteMemberMutation,
} from "../redux/slices/api/workspaceApiSlice";
import { LoadingSpinner } from "../components/shared/feedback/LoadingSpinner";
import { ErrorAlert } from "../components/shared/feedback/ErrorAlert";
import Modal from "../components/shared/dialog/Modal";
import { useWorkspace } from "../components/workspace/provider/WorkspaceProvider";

const Users = () => {
  const { workspaceId } = useParams();
  const { workspace } = useWorkspace();
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [openDialog, setOpenDialog] = useState(false);
  const [open, setOpen] = useState(false);
  const [openAction, setOpenAction] = useState(false);
  const [selected, setSelected] = useState(null);
  const [updateMemberStatus] = useUpdateMemberStatusMutation();
  const [removeMember] = useRemoveMemberMutation();
  const [inviteEmail, setInviteEmail] = useState("");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [sendInvite] = useInviteMemberMutation();

  // Validate workspace ID
  const isValidWorkspaceId =
    workspaceId && /^[0-9a-fA-F]{24}$/.test(workspaceId);

  // Check if workspace is private
  const isPrivateWorkspace =
    workspace?.type === "private" || workspace?.type === "PrivateWorkspace";

  // Get workspace members with validation
  const {
    data: members,
    isLoading: isMembersLoading,
    error: membersError,
    refetch,
  } = useGetWorkspaceMembersQuery(workspaceId, {
    skip: !isValidWorkspaceId || isPrivateWorkspace || !workspace,
    refetchOnMountOrArgChange: true,
  });

  // Extract members array and workspace data
  const workspaceData = useMemo(() => {
    if (!workspace) return null;
    return workspace.workspace || workspace;
  }, [workspace]);

  // Memoize permission checks to prevent unnecessary re-renders
  const permissions = useMemo(() => {
    if (!workspaceData || !user?._id)
      return {
        isWorkspaceOwner: false,
        currentUserMember: null,
        isAdmin: false,
        canManageMembers: false,
      };

    const isWorkspaceOwner = user?._id === workspaceData.owner;
    const currentUserMember = members?.find((m) => m.user._id === user?._id);
    const isAdmin = currentUserMember?.role === "admin" || isWorkspaceOwner;
    const canManageMembers = isWorkspaceOwner || isAdmin;

    return {
      isWorkspaceOwner,
      currentUserMember,
      isAdmin,
      canManageMembers,
    };
  }, [user?._id, members, workspaceData]);

  const { isWorkspaceOwner, canManageMembers } = permissions;

  // Updated helper functions
  const getMemberStatus = (member) => {
    if (!member) return "inactive";
    if (member.status === "archived") return "archived";
    return member.isActive ? "active" : "inactive";
  };

  // Add all useEffect hooks here
  useEffect(() => {
    if (workspaceId && !isValidWorkspaceId) {
      toast.error("Invalid workspace ID format");
      navigate("/dashboard");
      return;
    }
  }, [workspaceId, isValidWorkspaceId, navigate]);

  // Handle private workspace access attempt
  useEffect(() => {
    if (workspace && isPrivateWorkspace) {
      toast.error("Team management is not available for private workspaces");
      navigate(`/tasks/${workspaceId}/dashboard`);
      return;
    }
  }, [workspace, isPrivateWorkspace, workspaceId, navigate]);

  useEffect(() => {
    let timeoutId;
    if (membersError) {
      timeoutId = setTimeout(() => {
        refetch();
      }, 5000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [membersError, refetch]);

  useEffect(() => {
    if (membersError) {
      toast.error(membersError?.data?.message || "Failed to load team members");
    }
  }, [membersError]);

  // Early returns after all hooks
  if (!workspaceId) {
    return (
      <ErrorAlert message="No workspace selected. Please select a workspace first." />
    );
  }

  // Loading states
  if (!workspace || isMembersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  // Error state with detailed error handling
  if (membersError) {
    let errorMessage = "Failed to load workspace members";

    if (membersError.status === 404) {
      errorMessage = "Workspace not found or you do not have access";
    } else if (membersError.status === 403) {
      errorMessage = "You do not have permission to view team members";
    } else if (membersError.data?.message) {
      errorMessage = membersError.data.message;
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-center text-red-500 p-4">
          <h2 className="text-xl font-semibold mb-2">Error Loading Members</h2>
          <p>{errorMessage}</p>
          <div className="mt-4 space-y-2">
            <button
              onClick={() => refetch()}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              Retry
            </button>
            <button
              onClick={() => navigate(`/tasks/${workspaceId}/dashboard`)}
              className="w-full px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-600 rounded-md"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }
  const handleUserAction = async (member) => {
    try {
      // Early validation for member data
      if (!member?.user?._id) {
        toast.error("Invalid member data");
        setOpenAction(false);
        return;
      }

      // Early validation for workspace owner
      const isOwner = member.user._id === workspaceData?.owner;
      if (isOwner) {
        toast.error("Cannot modify workspace owner's status");
        setOpenAction(false);
        return;
      }

      // Permission check with logging
      if (!canManageMembers) {
        toast.error("You don't have permission to perform this action");
        setOpenAction(false);
        return;
      }

      // Admin status check with logging
      const isTargetAdmin = member.role === "admin";
      if (isTargetAdmin && !isWorkspaceOwner) {
        toast.error("Only workspace owner can modify admin status");
        setOpenAction(false);
        return;
      }

      const currentStatus = getMemberStatus(member);
      const newStatus = currentStatus === "active" ? "inactive" : "active";

      const result = await updateMemberStatus({
        workspaceId: workspaceId,
        userId: member.user._id,
        status: newStatus,
      }).unwrap();

      if (result.status) {
        toast.success(
          `Member ${newStatus === "active" ? "activated" : "deactivated"} successfully`,
        );
        await refetch();
        setSelected(null);
        setOpenAction(false);
      }
    } catch (error) {
      // Structured error handling
      if (error?.isOwnerError) {
        toast.error("Cannot modify workspace owner's status");
      } else if (error?.isAdminError) {
        toast.error("Only workspace owner can modify admin status");
      } else if (error?.isSelfModificationError) {
        toast.error("Cannot modify your own status");
      } else if (error?.isPermissionError) {
        toast.error("You don't have permission to perform this action");
      } else if (error?.status === 403) {
        toast.error(
          error?.data?.message ||
            "You don't have permission to perform this action",
        );
      } else if (error?.status === 404) {
        toast.error(error?.data?.message || "Member not found");
      } else {
        toast.error(error?.data?.message || "Failed to update member status");
      }

      setOpenAction(false);
    }
  };

  const handleDelete = async (member) => {
    try {
      if (!member?.user?._id) {
        toast.error("Invalid member data");
        return;
      }

      // Show confirmation dialog
      if (
        !window.confirm(
          `Are you sure you want to remove ${member.user.name} from the workspace?`,
        )
      ) {
        return;
      }

      const response = await removeMember({
        workspaceId: workspaceId,
        userId: member.user._id,
      }).unwrap();

      if (response.status) {
        toast.success(response.message || "Member removed successfully");
        // Refresh member list
        await refetch();
      } else {
        toast.error(response.message || "Failed to remove member");
      }
    } catch (error) {
      toast.error(
        error.data?.message ||
          error.message ||
          "Failed to remove member. Please try again.",
      );
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail) {
      toast.error("Please enter an email address");
      return;
    }

    try {
      await sendInvite({
        workspaceId: workspaceId,
        email: inviteEmail,
      }).unwrap();

      toast.success("Invitation sent successfully");
      setInviteEmail("");
      setShowInviteDialog(false);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to send invitation");
    }
  };

  // Delete confirmation dialog
  const renderDeleteConfirmation = () => (
    <ConfirmationDialog
      open={openDialog}
      setOpen={setOpenDialog}
      title="Remove Team Member"
      message={
        selected ? (
          <div className="space-y-4">
            <p>
              Are you sure you want to remove{" "}
              <span className="font-semibold">{selected.user?.name}</span> from
              the workspace?
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This action cannot be undone. The member will lose access to all
              workspace resources.
            </p>
          </div>
        ) : (
          "Are you sure you want to remove this member?"
        )
      }
      confirmLabel="Remove Member"
      confirmColor="red"
      onClick={() => handleDelete(selected)}
    />
  );

  return (
    <div className="container mx-auto py-6 px-4 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Team Management
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Manage your team members and their access levels
            </p>
          </div>
          {isWorkspaceOwner && (
            <Button
              label="Add Team Member"
              icon={<IoMdAdd className="text-lg" />}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
              onClick={() => setOpen(true)}
            />
          )}
        </div>
      </div>

      {/* Stats Section */}
      <TeamStats members={members} />

      {/* Team Members Table */}
      <TeamMembersTable
        members={members}
        workspaceData={workspaceData}
        canManageMembers={canManageMembers}
        isWorkspaceOwner={isWorkspaceOwner}
        onAction={(member) => {
          setSelected(member);
          setOpenAction(true);
        }}
        onDelete={(member) => {
          setSelected(member);
          setOpenDialog(true);
        }}
      />

      {/* Modals Section */}
      <AddUser
        open={open}
        setOpen={setOpen}
        workspaceId={workspaceId}
        onSuccess={() => {
          refetch();
          setOpen(false);
        }}
      />

      {renderDeleteConfirmation()}

      <UserAction
        open={openAction}
        setOpen={setOpenAction}
        onClick={() => handleUserAction(selected)}
        member={selected}
      />

      {/* Invite Member Dialog */}
      <Modal
        isOpen={showInviteDialog}
        onClose={() => setShowInviteDialog(false)}
        title="Invite Team Member"
      >
        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Enter email address"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowInviteDialog(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleInviteMember}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Send Invitation
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Users;
