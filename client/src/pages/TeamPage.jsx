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

import { useState, useMemo } from "react";
import { useWorkspace } from "../components/workspace/provider/WorkspaceProvider";
import {
  useGetWorkspaceMembersQuery,
  useInviteMemberMutation,
  useUpdateMemberRoleMutation,
  useRemoveMemberMutation,
  useToggleMemberActiveMutation,
} from "../redux/slices/api/workspaceApiSlice";
import { LoadingSpinner } from "../components/shared/feedback/LoadingSpinner";
import Avatar from "../components/shared/display/Avatar";
import { toast } from "sonner";
import { Button } from "../components/shared/buttons/Button";
import TeamInviteModal from "../components/workspace/team/TeamInviteModal";
import { useSelector } from "react-redux";

// MemberCard Component
const MemberCard = ({
  member,
  onUpdateRole,
  onRemove,
  onToggleActive,
  isCurrentUserAdmin,
  currentUserId,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const getRoleStyle = (role) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      case "admin":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const handleStatusToggle = async () => {
    if (!isCurrentUserAdmin) return;

    try {
      setIsUpdating(true);
      await onToggleActive();
      toast.success(
        `Member ${member.isActive ? "deactivated" : "activated"} successfully`,
      );
    } catch (error) {
      // console.error('Error toggling member status:', error);
      toast.error(error?.data?.message || "Failed to update member status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (!isCurrentUserAdmin) return;

    if (
      !window.confirm(
        `Are you sure you want to remove ${member.user.name} from the workspace?`,
      )
    ) {
      return;
    }

    try {
      setIsUpdating(true);
      await onRemove();
      toast.success("Member removed successfully");
    } catch (error) {
      // console.error('Error removing member:', error);
      toast.error(error?.data?.message || "Failed to remove member");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRoleChange = async (e) => {
    if (!isCurrentUserAdmin) return;

    const newRole = e.target.value;
    if (newRole === member.role) return;

    try {
      setIsUpdating(true);
      await onUpdateRole(newRole);
      toast.success(`Role updated to ${newRole} successfully`);
    } catch (error) {
      // console.error('Error updating role:', error);
      toast.error(error?.data?.message || "Failed to update role");
    } finally {
      setIsUpdating(false);
    }
  };

  const isCurrentUser = currentUserId === member.user._id;
  const canModifyMember =
    isCurrentUserAdmin && !isCurrentUser && member.role !== "owner";

  return (
    <div className={`p-4 ${isUpdating ? "opacity-75" : ""}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar src={member.user.avatar} name={member.user.name} size="md" />
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              {member.user.name}
              {isCurrentUser && (
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                  (You)
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {member.user.email}
            </p>
            <div className="flex items-center mt-1 space-x-2">
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleStyle(member.role)}`}
              >
                {member.role}
              </span>
              {!member.isActive && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                  Inactive
                </span>
              )}
            </div>
          </div>
        </div>

        {canModifyMember && (
          <div className="flex items-center space-x-4">
            <select
              value={member.role}
              onChange={handleRoleChange}
              disabled={isUpdating}
              className="text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>

            <button
              onClick={handleStatusToggle}
              disabled={isUpdating}
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              {member.isActive ? "Deactivate" : "Activate"}
            </button>

            <button
              onClick={handleRemove}
              disabled={isUpdating}
              className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Main TeamPage Component
const TeamPage = () => {
  const { workspace } = useWorkspace();
  const workspaceId = workspace?._id;
  const { user } = useSelector((state) => state.auth);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [updateMemberRole] = useUpdateMemberRoleMutation();
  const [removeMember] = useRemoveMemberMutation();
  const [toggleMemberActive] = useToggleMemberActiveMutation();
  const [inviteMember] = useInviteMemberMutation();

  const {
    data: membersData,
    isLoading: isLoadingMembers,
    error: membersError,
    refetch: refetchMembers,
  } = useGetWorkspaceMembersQuery(workspaceId, {
    skip: !workspaceId,
  });

  // Process members data
  const processedMembers = useMemo(() => {
    if (!membersData?.members) {
      // console.log('No members data available');
      return [];
    }

    // Include owner in the members list if not already included
    const allMembers = [...membersData.members];
    if (
      membersData.owner &&
      !allMembers.some((m) => m.user._id === membersData.owner._id)
    ) {
      allMembers.push({
        user: membersData.owner,
        role: "owner",
        isActive: true,
      });
    }

    return allMembers
      .filter((member) => member && member.user && member.user._id)
      .map((member) => ({
        ...member,
        user: member.user,
        role: member.role || "member",
        isActive: member.isActive !== false,
      }));
  }, [membersData]);

  // Split members into active and inactive
  const { active: activeMembers, inactive: inactiveMembers } = useMemo(() => {
    const active = [];
    const inactive = [];

    processedMembers.forEach((member) => {
      if (member.isActive) {
        active.push(member);
      } else {
        inactive.push(member);
      }
    });

    // console.log('Members data:', {
    //   raw: membersData,
    //   processed: processedMembers,
    //   active,
    //   inactive
    // });

    return { active, inactive };
  }, [processedMembers]);

  // Check if current user is admin
  const isCurrentUserAdmin = useMemo(() => {
    if (!user?._id || !membersData?.userRole) return false;
    return membersData.userRole === "admin" || membersData.userRole === "owner";
  }, [user, membersData]);

  const handleToggleActive = async (userId, newStatus) => {
    if (!userId || !workspaceId) {
      // console.error('Missing required data:', { userId, workspaceId });
      toast.error("Cannot update member: Missing required data");
      return;
    }

    const toastId = toast.loading("Updating member status...");
    try {
      // console.log('Toggling member status:', { workspaceId, userId, newStatus });
      const result = await toggleMemberActive({
        workspaceId,
        userId,
        data: { isActive: newStatus },
      }).unwrap();

      if (!result || result.status === false) {
        throw new Error(result?.message || "Failed to update member status");
      }

      toast.success("Member status updated successfully", { id: toastId });
      await refetchMembers();
    } catch (error) {
      // console.error('Error updating member status:', error);
      toast.error(
        error?.data?.message ||
          error.message ||
          "Failed to update member status",
        { id: toastId },
      );
    }
  };

  // Handle loading and error states
  if (isLoadingMembers) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (membersError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 dark:text-red-400 mb-4">
          {membersError.data?.message || "Failed to load team members"}
        </div>
        <Button onClick={refetchMembers} variant="secondary">
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Team Members
        </h1>
        {isCurrentUserAdmin && (
          <Button onClick={() => setIsInviteModalOpen(true)} variant="primary">
            Invite Members
          </Button>
        )}
      </div>

      {/* Active Members Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Active Members ({activeMembers.length})
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow divide-y divide-gray-200 dark:divide-gray-700">
          {activeMembers.map((member) => (
            <MemberCard
              key={member._id}
              member={member}
              onUpdateRole={(newRole) =>
                updateMemberRole({
                  workspaceId,
                  userId: member.user._id,
                  data: { role: newRole },
                })
              }
              onRemove={() =>
                removeMember({
                  workspaceId,
                  userId: member.user._id,
                })
              }
              onToggleActive={() =>
                handleToggleActive(member.user._id, !member.isActive)
              }
              isCurrentUserAdmin={isCurrentUserAdmin}
              currentUserId={user?._id}
            />
          ))}
        </div>
      </div>

      {/* Inactive Members Section */}
      {inactiveMembers.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Inactive Members ({inactiveMembers.length})
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow divide-y divide-gray-200 dark:divide-gray-700">
            {inactiveMembers.map((member) => (
              <MemberCard
                key={member._id}
                member={member}
                onUpdateRole={(newRole) =>
                  updateMemberRole({
                    workspaceId,
                    userId: member.user._id,
                    data: { role: newRole },
                  })
                }
                onRemove={() =>
                  removeMember({
                    workspaceId,
                    userId: member.user._id,
                  })
                }
                onToggleActive={() =>
                  handleToggleActive(member.user._id, !member.isActive)
                }
                isCurrentUserAdmin={isCurrentUserAdmin}
                currentUserId={user?._id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Invite Members Modal */}
      {isInviteModalOpen && (
        <TeamInviteModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          workspaceId={workspaceId}
          onInvite={inviteMember}
        />
      )}
    </div>
  );
};

export default TeamPage;
