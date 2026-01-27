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

import React, { useState } from "react";
import { useParams } from "react-router-dom";
import {
  useGetWorkspaceMembersQuery,
  useGetUsersQuery,
  useAddWorkspaceMemberMutation,
  useRemoveWorkspaceMemberMutation,
} from "../../../redux/slices/api/userApiSlice";
import { useWorkspace } from "../../workspace/provider/WorkspaceProvider";
import { toast } from "sonner";
import {
  MagnifyingGlassIcon,
  UserPlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const TeamManagement = () => {
  const { workspaceId } = useParams();
  const { workspace } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddMembers, setShowAddMembers] = useState(false);

  // Queries and mutations
  const {
    data: membersData,
    isLoading: loadingMembers,
    refetch: refetchMembers,
  } = useGetWorkspaceMembersQuery(workspaceId);
  const { data: users } = useGetUsersQuery();
  const [addMember] = useAddWorkspaceMemberMutation();
  const [removeMember] = useRemoveWorkspaceMemberMutation();

  const members = membersData?.data || [];
  const allUsers = users?.data || [];

  // Filter users not in the workspace for adding
  const availableUsers = allUsers.filter(
    (user) => !members.some((member) => member.user._id === user._id),
  );

  // Filter members based on search
  const filteredMembers = searchQuery
    ? members.filter(
        (member) =>
          member.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          member.user.email.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : members;

  // Filter available users based on search when adding members
  const filteredAvailableUsers = searchQuery
    ? availableUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : availableUsers;

  const handleAddMember = async (email) => {
    try {
      await addMember({ workspaceId, email }).unwrap();
      toast.success("Member added successfully");
      refetchMembers();
      setShowAddMembers(false);
      setSearchQuery("");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to add member");
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await removeMember({ workspaceId, memberId }).unwrap();
      toast.success("Member removed successfully");
      refetchMembers();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to remove member");
    }
  };

  if (loadingMembers) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Team Members
            </h2>
            <button
              onClick={() => setShowAddMembers(!showAddMembers)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <UserPlusIcon className="h-5 w-5 mr-2" />
              Add Members
            </button>
          </div>

          {/* Search bar */}
          <div className="mt-4 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search members..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Add Members Panel */}
        {showAddMembers && (
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Add New Members
            </h3>
            <div className="space-y-4">
              {filteredAvailableUsers.length > 0 ? (
                filteredAvailableUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <span className="text-xl font-medium text-gray-600 dark:text-gray-300">
                            {user.name[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddMember(user.email)}
                      className="ml-4 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Add
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                  No users available to add
                </p>
              )}
            </div>
          </div>
        )}

        {/* Members List */}
        <div className="p-6">
          <div className="space-y-4">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
                <div
                  key={member.user._id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                      {member.user.avatar ? (
                        <img
                          src={member.user.avatar}
                          alt={member.user.name}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <span className="text-xl font-medium text-gray-600 dark:text-gray-300">
                          {member.user.name[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {member.user.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {member.user.email}
                      </div>
                    </div>
                  </div>
                  {workspace?.owner !== member.user._id && (
                    <button
                      onClick={() => handleRemoveMember(member.user._id)}
                      className="ml-4 p-2 text-gray-400 hover:text-red-500 focus:outline-none"
                      title="Remove member"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                No members found
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamManagement;
