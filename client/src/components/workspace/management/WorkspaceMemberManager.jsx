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

import React, { useState, useEffect } from "react";
import {
  useGetWorkspaceMembersQuery,
  useInviteMemberMutation,
  useGetUsersQuery,
} from "../../../redux/slices/api/workspaceApiSlice";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { UserCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { LoadingSpinner } from "../../shared";

const SearchInput = ({ value, onChange, placeholder }) => (
  <div className="relative">
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
    />
  </div>
);

const MemberCard = ({ member, isSelected, onSelect }) => {
  const user = member.user;

  return (
    <div
      className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
        isSelected
          ? "bg-blue-50 dark:bg-blue-900/30"
          : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
      }`}
      onClick={() => onSelect(member)}
    >
      <div className="flex items-center flex-1 min-w-0">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <UserCircleIcon className="w-10 h-10 text-gray-400" />
        )}
        <div className="ml-3 flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {user.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {user.email}
          </p>
        </div>
      </div>
      <div className="flex-shrink-0 ml-2">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(member)}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
};

export const WorkspaceMemberManager = ({
  isOpen,
  onClose,
  workspaceId,
  onMembersAdded,
  mode = "manage",
  selectedMembers: externalSelectedMembers,
  setSelectedMembers: setExternalSelectedMembers,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMembers, setInternalSelectedMembers] = useState([]);

  // Use external or internal state based on mode
  const actualSelectedMembers =
    mode === "create" ? externalSelectedMembers : selectedMembers;
  const setActualSelectedMembers =
    mode === "create" ? setExternalSelectedMembers : setInternalSelectedMembers;

  const [inviteMember] = useInviteMemberMutation();

  // Use different queries based on mode
  const { data: membersData, isLoading: isLoadingMembers } =
    useGetWorkspaceMembersQuery(workspaceId, {
      skip: !workspaceId || mode === "create",
    });

  const { data: usersData, isLoading: isLoadingUsers } = useGetUsersQuery(
    undefined,
    { skip: mode !== "create" },
  );

  const isLoading = mode === "create" ? isLoadingUsers : isLoadingMembers;
  const allMembers =
    mode === "create"
      ? (usersData?.data || []).map((user) => ({ user }))
      : membersData?.data || [];

  const filteredMembers = allMembers.filter((member) => {
    const user = member.user;
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
  });

  const handleToggleSelect = (member) => {
    setActualSelectedMembers((prev) => {
      const isSelected = prev.some((m) => m.user._id === member.user._id);
      if (isSelected) {
        return prev.filter((m) => m.user._id !== member.user._id);
      } else {
        return [...prev, member];
      }
    });
  };

  const handleInviteMembers = async () => {
    if (actualSelectedMembers.length === 0) {
      toast.error("Please select at least one member");
      return;
    }

    if (mode === "create") {
      // In create mode, just close the dialog as the members will be added when creating the workspace
      onMembersAdded?.(
        actualSelectedMembers.map((member) => ({
          ...member,
          role: member.role || "member", // Ensure default role is member
        })),
      );
      handleClose();
      return;
    }

    try {
      const invitePromises = actualSelectedMembers.map((member) => {
        if (!member.user?.email) {
          throw new Error(
            `Invalid email for member ${member.user?.name || "Unknown"}`,
          );
        }

        return inviteMember({
          workspaceId,
          data: {
            email: member.user.email,
            role: member.role || "member",
          },
        }).unwrap();
      });

      await Promise.all(invitePromises);

      toast.success(
        `Successfully invited ${actualSelectedMembers.length} member${actualSelectedMembers.length > 1 ? "s" : ""}`,
      );
      onMembersAdded?.();
      handleClose();
    } catch (error) {
      //console.error('Invitation error:', error);
      toast.error(error?.data?.message || "Failed to invite members");
    }
  };

  const handleClose = () => {
    setSearchTerm("");
    if (mode !== "create") {
      setInternalSelectedMembers([]);
    }
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="div"
                  className="flex items-center justify-between mb-4"
                >
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {mode === "create" ? "Select Members" : "Add Members"}
                  </h3>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </Dialog.Title>

                <div className="mb-4">
                  <SearchInput
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Search members..."
                  />
                </div>

                <div className="mt-2">
                  {isLoading ? (
                    <div className="flex justify-center py-4">
                      <LoadingSpinner size="md" />
                    </div>
                  ) : filteredMembers.length > 0 ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {filteredMembers.map((member) => (
                        <MemberCard
                          key={member.user._id}
                          member={member}
                          isSelected={actualSelectedMembers.some(
                            (m) => m.user._id === member.user._id,
                          )}
                          onSelect={handleToggleSelect}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                      No members found
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-between">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {actualSelectedMembers.length} selected
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleInviteMembers}
                      disabled={actualSelectedMembers.length === 0}
                      className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                        actualSelectedMembers.length === 0
                          ? "bg-blue-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {mode === "create" ? "Add Selected" : "Invite Selected"}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
