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

import React, { useMemo } from "react";
import { useGetWorkspaceMembersQuery } from "../../../redux/slices/api/workspaceApiSlice";
import { LoadingSpinner, Checkbox } from "../../shared";

const UserList = ({
  workspaceId,
  selectedUsers = [],
  onUserSelect,
  maxDisplay = 10,
  showEmail = false,
  showRole = false,
  size = "sm",
  filterRole = null,
}) => {
  const {
    data: membersData,
    isLoading,
    error,
  } = useGetWorkspaceMembersQuery(workspaceId, {
    skip: !workspaceId,
    refetchOnMountOrArgChange: true,
  });

  // Process members data
  const members = useMemo(() => {
    if (!membersData?.members) return [];

    return membersData.members
      .filter((member) => {
        // Filter by role if specified
        if (filterRole === "admin") {
          return member.role === "admin" || member.role === "owner";
        } else if (filterRole === "member") {
          return member.role === "member";
        }
        return true;
      })
      .filter(
        (member) =>
          member &&
          member.user &&
          member.user._id &&
          member.user.name &&
          member.isActive,
      )
      .map((member) => ({
        ...member,
        user: member.user,
        role: member.role || "member",
      }))
      .slice(0, maxDisplay);
  }, [membersData, maxDisplay, filterRole]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-2">
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-2">
        Unable to load team members
      </div>
    );
  }

  if (!members.length) {
    return (
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-2">
        No team members found
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-60 overflow-y-auto">
      {members.map((member) => (
        <div
          key={member.user._id}
          className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <div className="flex items-center space-x-3">
            <img
              src={
                member.user.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(member.user.name)}`
              }
              alt={member.user.name}
              className="w-8 h-8 rounded-full"
            />
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {member.user.name}
              </div>
              {showEmail && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {member.user.email}
                </div>
              )}
              {showRole && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {member.role}
                </div>
              )}
            </div>
          </div>
          <Checkbox
            checked={selectedUsers.some((user) => user._id === member.user._id)}
            onChange={() => onUserSelect(member.user)}
            className="ml-2"
          />
        </div>
      ))}
    </div>
  );
};

export default UserList;
