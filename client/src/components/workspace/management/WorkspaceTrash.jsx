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
import { useNavigate } from "react-router-dom";
import { FaTrashRestore, FaTrashAlt, FaUsers, FaLock } from "react-icons/fa";
import {
  useGetTrashedWorkspacesQuery,
  useRestoreWorkspaceFromTrashMutation,
  usePermanentlyDeleteWorkspaceMutation,
} from "../../../redux/slices/api/workspaceApiSlice";
import { LoadingSpinner } from "../../shared/feedback/LoadingSpinner";
import { toast } from "sonner";
import { format } from "date-fns";

const WorkspaceTrash = () => {
  const navigate = useNavigate();
  const {
    data: trashedWorkspaces = [],
    isLoading,
    error,
  } = useGetTrashedWorkspacesQuery();
  const [restoreWorkspace] = useRestoreWorkspaceFromTrashMutation();
  const [permanentlyDelete] = usePermanentlyDeleteWorkspaceMutation();

  const handleRestore = async (workspace) => {
    try {
      await restoreWorkspace(workspace._id).unwrap();
      toast.success(`Workspace "${workspace.name}" restored successfully`);
    } catch (error) {
      //console.error('Error restoring workspace:', error);
      toast.error(error?.data?.message || "Failed to restore workspace");
    }
  };

  const handlePermanentDelete = async (workspace) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete "${workspace.name}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      await permanentlyDelete(workspace._id).unwrap();
      toast.success(`Workspace "${workspace.name}" permanently deleted`);
    } catch (error) {
      //console.error('Error deleting workspace:', error);
      toast.error(error?.data?.message || "Failed to delete workspace");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        <div className="text-red-500 mb-4">
          <FaTrashAlt className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Error Loading Trashed Workspaces
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          {error?.data?.message || "Failed to load trashed workspaces"}
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (!trashedWorkspaces.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        <div className="text-gray-400 dark:text-gray-500 mb-4">
          <FaTrashAlt className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No Trashed Workspaces
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Workspaces that you move to trash will appear here
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Workspace Trash
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Workspaces in trash will be permanently deleted after 30 days
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {trashedWorkspaces.map((workspace) => (
          <div
            key={workspace._id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all duration-200 hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                {workspace.type === "private" ||
                workspace.type === "PrivateWorkspace" ? (
                  <FaLock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                ) : (
                  <FaUsers className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                )}
                <h3 className="ml-2 text-lg font-medium text-gray-900 dark:text-white truncate">
                  {workspace.name}
                </h3>
              </div>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
              {workspace.description || "No description"}
            </p>

            <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Deleted {format(new Date(workspace.deletedAt), "PPP")}
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => handleRestore(workspace)}
                className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                title="Restore workspace"
              >
                <FaTrashRestore className="w-4 h-4" />
              </button>
              <button
                onClick={() => handlePermanentDelete(workspace)}
                className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                title="Permanently delete workspace"
              >
                <FaTrashAlt className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkspaceTrash;
