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
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  XMarkIcon,
  UserPlusIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { useCreateWorkspaceMutation } from "../../../redux/slices/api/workspaceApiSlice";
import { toast } from "sonner";
import { WorkspaceMemberManager } from "./WorkspaceMemberManager";

const CreateWorkspace = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [showMemberManager, setShowMemberManager] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [memberFields, setMemberFields] = useState([
    { email: "", role: "member" },
  ]);
  const [createWorkspace, { isLoading }] = useCreateWorkspaceMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a workspace name");
      return;
    }

    // Validate member emails
    const validMembers = memberFields.filter((member) => member.email.trim());
    const invalidEmails = validMembers.filter(
      (member) => !isValidEmail(member.email.trim()),
    );

    if (invalidEmails.length > 0) {
      toast.error("Please enter valid email addresses for all members");
      return;
    }

    try {
      // Prepare member invitations
      const invitations = validMembers.map((member) => ({
        email: member.email.trim(),
        role: member.role,
        type: "invitation",
      }));

      const response = await createWorkspace({
        name: name.trim(),
        description: description.trim(),
        visibility,
        type: visibility === "private" ? "PrivateWorkspace" : "PublicWorkspace",
        invitations,
      }).unwrap();

      if (response.status) {
        // Show success message with invitation details
        if (invitations.length > 0) {
          toast.success(
            `Workspace created and invitations sent to ${invitations.length} member${invitations.length > 1 ? "s" : ""}`,
          );
        } else {
          toast.success("Workspace created successfully");
        }
        handleClose();
        onSuccess?.(response.data);
      }
    } catch (error) {
      //console.error('Workspace creation error:', error);
      if (error.data?.invitationErrors) {
        // Handle specific invitation errors
        error.data.invitationErrors.forEach((err) => {
          toast.error(`Failed to invite ${err.email}: ${err.message}`);
        });
      } else {
        toast.error(error.data?.message || "Failed to create workspace");
      }
    }
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setVisibility("private");
    setSelectedMembers([]);
    setEmail("");
    setRole("member");
    setMemberFields([{ email: "", role: "member" }]);
    onClose();
  };

  const handleMembersAdded = (members) => {
    setSelectedMembers(members);
    setShowMemberManager(false);
  };

  const addMemberField = () => {
    setMemberFields([...memberFields, { email: "", role: "member" }]);
  };

  const removeMemberField = (index) => {
    setMemberFields(memberFields.filter((_, i) => i !== index));
  };

  const updateMemberField = (index, field, value) => {
    const newFields = [...memberFields];
    newFields[index] = { ...newFields[index], [field]: value };
    setMemberFields(newFields);
  };

  // Email validation helper
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <>
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
                <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-8 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="div"
                    className="flex items-center justify-between mb-6"
                  >
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                      Create New Workspace
                    </h3>
                    <button
                      onClick={handleClose}
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </Dialog.Title>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm px-4 py-3"
                        placeholder="Enter workspace name"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm px-4 py-3"
                        placeholder="Enter workspace description"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="visibility"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Visibility
                      </label>
                      <select
                        id="visibility"
                        name="visibility"
                        value={visibility}
                        onChange={(e) => {
                          setVisibility(e.target.value);
                          // Clear selected members when switching to private
                          if (e.target.value === "private") {
                            setSelectedMembers([]);
                            setEmail("");
                            setRole("member");
                          }
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm px-4 py-3"
                      >
                        <option value="private">Private</option>
                        <option value="public">Public</option>
                      </select>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {visibility === "private"
                          ? "Only invited members can access this workspace"
                          : "Anyone in your organization can find and join this workspace"}
                      </p>
                    </div>

                    {visibility === "public" && (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Invite Members
                          </label>
                          <button
                            type="button"
                            onClick={addMemberField}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                          >
                            <UserPlusIcon className="h-4 w-4" />
                            Add Another Member
                          </button>
                        </div>

                        <div className="space-y-3">
                          {memberFields.map((field, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-3"
                            >
                              <div className="flex-1">
                                <input
                                  type="email"
                                  value={field.email}
                                  onChange={(e) =>
                                    updateMemberField(
                                      index,
                                      "email",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Enter email address"
                                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                                    field.email &&
                                    !isValidEmail(field.email.trim())
                                      ? "border-red-500 dark:border-red-500"
                                      : "border-gray-300 dark:border-gray-600"
                                  }`}
                                />
                                {field.email &&
                                  !isValidEmail(field.email.trim()) && (
                                    <p className="mt-1 text-xs text-red-500">
                                      Please enter a valid email address
                                    </p>
                                  )}
                              </div>
                              <select
                                value={field.role}
                                onChange={(e) =>
                                  updateMemberField(
                                    index,
                                    "role",
                                    e.target.value,
                                  )
                                }
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              >
                                <option value="member">Member</option>
                                <option value="admin">Admin</option>
                              </select>
                              {memberFields.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeMemberField(index)}
                                  className="text-gray-400 hover:text-gray-500"
                                >
                                  <XMarkIcon className="h-5 w-5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-8 flex justify-end gap-4">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading || !name.trim()}
                        className={`px-6 py-3 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                          isLoading || !name.trim()
                            ? "bg-blue-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                      >
                        {isLoading ? "Creating..." : "Create Workspace"}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <WorkspaceMemberManager
        isOpen={showMemberManager}
        onClose={() => setShowMemberManager(false)}
        onMembersAdded={handleMembersAdded}
        mode="create"
        selectedMembers={selectedMembers}
        setSelectedMembers={setSelectedMembers}
      />
    </>
  );
};

export default CreateWorkspace;
