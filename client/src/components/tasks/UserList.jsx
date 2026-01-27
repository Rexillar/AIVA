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
   ⟁  DOMAIN       : UI COMPONENTS

   ⟁  PURPOSE      : Provide specific functionality and operations

   ⟁  WHY          : Modular code organization and reusability

   ⟁  WHAT         : Function-based utilities and operations

   ⟁  TECH STACK   : React • Redux • Vite
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : MEDIUM
   ⟁  DOCS : /docs/frontend/components.md

   ⟁  USAGE RULES  : Follow design system • Handle props • Manage state

        "Functions implemented. Operations executed. Results delivered."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

import React from "react";
import { useGetWorkspaceMembersQuery } from "../../redux/slices/api/workspaceApiSlice";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { LoadingSpinner } from "../shared";
import { useSelector } from "react-redux";

const UserList = ({
  selectedUsers = [],
  onUserSelect,
  workspaceId,
  className = "",
}) => {
  const { privateWorkspace } = useSelector((state) => state.auth);
  const isPrivateWorkspace = privateWorkspace?._id === workspaceId;

  // Skip query for private workspaces or if no workspace ID
  const {
    data: membersData,
    isLoading,
    error,
  } = useGetWorkspaceMembersQuery(workspaceId, {
    skip: !workspaceId || isPrivateWorkspace,
    refetchOnMountOrArgChange: true,
  });

  // Process members data to handle different response structures
  const members = React.useMemo(() => {
    if (!membersData) return [];

    // Handle array response
    if (Array.isArray(membersData)) {
      return membersData;
    }

    // Handle nested data structure
    if (membersData.data) {
      return Array.isArray(membersData.data) ? membersData.data : [];
    }

    return [];
  }, [membersData]);

  // Filter active members only
  const activeMembers = React.useMemo(() => {
    return members.filter((member) => {
      // Check if member is active
      const isActive = member.isActive !== false;
      // Ensure member has valid user data
      const hasValidUser = member.user && member.user._id;
      return isActive && hasValidUser;
    });
  }, [members]);

  // Early return for private workspaces
  if (isPrivateWorkspace) {
    return (
      <div className={`text-center text-gray-500 p-4 ${className}`}>
        Private workspace - no assignees available
      </div>
    );
  }

  // Early return if no workspace selected
  if (!workspaceId) {
    return (
      <div className={`text-center text-gray-500 p-4 ${className}`}>
        No workspace selected
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  // Handle errors silently in UI without console logs
  if (error) {
    return (
      <div className={`text-center text-gray-500 p-4 ${className}`}>
        No members available
      </div>
    );
  }

  // Show message if no members found
  if (!activeMembers?.length) {
    return (
      <div className={`text-center text-gray-500 p-4 ${className}`}>
        No active members found in this workspace
      </div>
    );
  }

  // Render member list
  return (
    <div className={`space-y-2 ${className}`}>
      {activeMembers.map((member) => {
        // Get user data from the member object
        const user = member.user;
        if (!user || !user._id) return null;

        const userId = user._id;

        return (
          <div
            key={userId}
            onClick={() => onUserSelect(userId)}
            className={`flex items-center p-2 rounded-md cursor-pointer transition-colors
              ${
                selectedUsers.includes(userId)
                  ? "bg-blue-100 dark:bg-blue-900"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
          >
            <div className="flex items-center flex-1">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <UserCircleIcon className="w-8 h-8 text-gray-400" />
              )}
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {user.email}
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <input
                type="checkbox"
                checked={selectedUsers.includes(userId)}
                onChange={() => onUserSelect(userId)}
                onClick={(e) => e.stopPropagation()}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UserList;
