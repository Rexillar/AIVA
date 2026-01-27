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
  ExclamationTriangleIcon,
  TrashIcon,
  DocumentTextIcon,
  LockClosedIcon,
  GlobeAltIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  useUpdateWorkspaceMutation,
  useMoveWorkspaceToTrashMutation,
} from "../../../redux/slices/api/workspaceApiSlice";
import { toast } from "sonner";
import { setCurrentWorkspace } from "../../../redux/slices/workspaceSlice";
import GoogleAccountManager from "../integrations/GoogleAccountManager";

const WorkspaceSettings = ({ workspace, isOpen, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [name, setName] = useState(workspace?.name || "");
  const [description, setDescription] = useState(workspace?.description || "");
  const [visibility, setVisibility] = useState(
    workspace?.visibility || "private",
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [pageSettings, setPageSettings] = useState({
    tasks: workspace?.pageSettings?.tasks || {
      visible: true,
      defaultView: "list",
    },
    notes: workspace?.pageSettings?.notes || {
      visible: true,
      defaultView: "grid",
    },
    calendar: workspace?.pageSettings?.calendar || { visible: true },
    analytics: workspace?.pageSettings?.analytics || { visible: true },
  });

  const [updateWorkspace, { isLoading: isUpdating }] =
    useUpdateWorkspaceMutation();
  const [moveToTrash, { isLoading: isMovingToTrash }] =
    useMoveWorkspaceToTrashMutation();

  // Check if user is admin or owner
  const isAdmin = workspace?.members?.some(
    (member) =>
      member.user._id === localStorage.getItem("userId") &&
      (member.role === "admin" || member.role === "owner"),
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a workspace name");
      return;
    }

    try {
      const result = await updateWorkspace({
        id: workspace._id,
        name: name.trim(),
        description: description.trim(),
        visibility,
        type: visibility === "private" ? "PrivateWorkspace" : "PublicWorkspace",
        pageSettings,
      }).unwrap();

      if (result.status) {
        toast.success("Workspace updated successfully");
        dispatch(setCurrentWorkspace(result.data));
        onClose();
      }
    } catch (error) {
      //console.error('Workspace update error:', error);
      toast.error(error?.data?.message || "Failed to update workspace");
    }
  };

  const handleDelete = async () => {
    try {
      await moveToTrash(workspace._id).unwrap();
      toast.success("Workspace moved to trash");
      navigate("/dashboard");
      onClose();
    } catch (error) {
      //console.error('Error moving workspace to trash:', error);
      toast.error(error?.data?.message || "Failed to move workspace to trash");
    }
  };

  const togglePageVisibility = (page) => {
    setPageSettings((prev) => ({
      ...prev,
      [page]: {
        ...prev[page],
        visible: !prev[page].visible,
      },
    }));
  };

  const updatePageView = (page, view) => {
    setPageSettings((prev) => ({
      ...prev,
      [page]: {
        ...prev[page],
        defaultView: view,
      },
    }));
  };

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
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
                <Dialog.Panel className="w-full max-w-4xl max-h-[90vh] overflow-y-auto transform rounded-lg bg-white dark:bg-gray-800 p-8 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="div"
                    className="flex items-center justify-between mb-6 sticky top-0 bg-white dark:bg-gray-800 z-10 pb-4"
                  >
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                      Workspace Settings
                    </h3>
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </Dialog.Title>

                  {/* Tabs */}
                  <div className="border-b border-gray-200 dark:border-gray-700 mb-6 sticky top-16 bg-white dark:bg-gray-800 z-10 -mx-8 px-8">
                    <nav className="-mb-px flex space-x-8">
                      <button
                        onClick={() => setActiveTab("general")}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                          activeTab === "general"
                            ? "border-blue-500 text-blue-600 dark:text-blue-400"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                        }`}
                      >
                        <DocumentTextIcon className="h-5 w-5 inline-block mr-2" />
                        General
                      </button>
                      <button
                        onClick={() => setActiveTab("integrations")}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                          activeTab === "integrations"
                            ? "border-blue-500 text-blue-600 dark:text-blue-400"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                        }`}
                      >
                        <CalendarIcon className="h-5 w-5 inline-block mr-2" />
                        Google Integration
                      </button>
                    </nav>
                  </div>

                  {/* General Tab */}
                  {activeTab === "general" && (
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
                        onChange={(e) => setVisibility(e.target.value)}
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

                    {/* Page Settings Section */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <DocumentTextIcon className="h-5 w-5" />
                        Page Settings
                      </h4>
                      <div className="space-y-4">
                        {/* Tasks Page */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <h5 className="font-medium text-gray-900 dark:text-white">
                              Tasks Page
                            </h5>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Manage and track tasks
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <select
                              value={pageSettings.tasks.defaultView}
                              onChange={(e) =>
                                updatePageView("tasks", e.target.value)
                              }
                              className="text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                              <option value="list">List View</option>
                              <option value="board">Board View</option>
                              <option value="calendar">Calendar View</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => togglePageVisibility("tasks")}
                              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                pageSettings.tasks.visible
                                  ? "bg-blue-600"
                                  : "bg-gray-200 dark:bg-gray-600"
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  pageSettings.tasks.visible
                                    ? "translate-x-5"
                                    : "translate-x-0"
                                }`}
                              />
                            </button>
                          </div>
                        </div>

                        {/* Notes Page */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <h5 className="font-medium text-gray-900 dark:text-white">
                              Notes Page
                            </h5>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Create and manage notes
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <select
                              value={pageSettings.notes.defaultView}
                              onChange={(e) =>
                                updatePageView("notes", e.target.value)
                              }
                              className="text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                              <option value="grid">Grid View</option>
                              <option value="list">List View</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => togglePageVisibility("notes")}
                              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                pageSettings.notes.visible
                                  ? "bg-blue-600"
                                  : "bg-gray-200 dark:bg-gray-600"
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  pageSettings.notes.visible
                                    ? "translate-x-5"
                                    : "translate-x-0"
                                }`}
                              />
                            </button>
                          </div>
                        </div>

                        {/* Calendar Page */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <h5 className="font-medium text-gray-900 dark:text-white">
                              Calendar Page
                            </h5>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              View and manage events
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => togglePageVisibility("calendar")}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              pageSettings.calendar.visible
                                ? "bg-blue-600"
                                : "bg-gray-200 dark:bg-gray-600"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                pageSettings.calendar.visible
                                  ? "translate-x-5"
                                  : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>

                        {/* Analytics Page */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <h5 className="font-medium text-gray-900 dark:text-white">
                              Analytics Page
                            </h5>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              View workspace statistics
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => togglePageVisibility("analytics")}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              pageSettings.analytics.visible
                                ? "bg-blue-600"
                                : "bg-gray-200 dark:bg-gray-600"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                pageSettings.analytics.visible
                                  ? "translate-x-5"
                                  : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex justify-between">
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(true)}
                          className="px-6 py-3 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-gray-700 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/30 flex items-center gap-2"
                        >
                          <TrashIcon className="h-5 w-5" />
                          Move to Trash
                        </button>
                      )}
                      <div className="flex gap-4 ml-auto">
                        <button
                          type="button"
                          onClick={onClose}
                          className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isUpdating || !name.trim()}
                          className={`px-6 py-3 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                            isUpdating || !name.trim()
                              ? "bg-blue-400 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-700"
                          }`}
                        >
                          {isUpdating ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </div>
                  </form>
                  )}

                  {/* Integrations Tab */}
                  {activeTab === "integrations" && (
                    <div className="py-4">
                      <GoogleAccountManager workspaceId={workspace?._id} />
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Delete Confirmation Dialog */}
      <Transition appear show={showDeleteConfirm} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setShowDeleteConfirm(false)}
        >
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex items-center justify-center mb-4">
                    <ExclamationTriangleIcon className="h-12 w-12 text-red-500" />
                  </div>
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium text-center text-gray-900 dark:text-white mb-4"
                  >
                    Move Workspace to Trash?
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                      Are you sure you want to move this workspace to trash? You
                      can restore it later from the trash page. All tasks,
                      notes, and data associated with this workspace will be
                      preserved.
                    </p>
                  </div>

                  <div className="mt-6 flex justify-center gap-4">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isMovingToTrash}
                      className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                        isMovingToTrash
                          ? "bg-red-400 cursor-not-allowed"
                          : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      {isMovingToTrash ? "Moving..." : "Move to Trash"}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default WorkspaceSettings;
