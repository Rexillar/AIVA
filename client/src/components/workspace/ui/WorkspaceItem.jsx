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
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaLock, FaUsers, FaEdit, FaTrash } from "react-icons/fa";
import { useMoveWorkspaceToTrashMutation } from "../../../redux/slices/api/workspaceApiSlice";
import { toast } from "sonner";
import WorkspaceSettings from "../management/WorkspaceSettings";

const WorkspaceItem = ({ workspace, isActive, onClick }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [moveWorkspaceToTrash] = useMoveWorkspaceToTrashMutation();

  const currentUser = useSelector((state) => state.auth.user);
  const isAdmin =
    workspace.userRole === "admin" || workspace.owner === currentUser?._id;
  const isPrivate =
    workspace.type === "private" || workspace.type === "PrivateWorkspace";

  const handleEdit = (e) => {
    e.stopPropagation();
    setShowSettings(true);
  };

  const handleMoveToTrash = async (e) => {
    e.stopPropagation();
    if (
      window.confirm(
        `Are you sure you want to move "${workspace.name}" to trash?`,
      )
    ) {
      try {
        await moveWorkspaceToTrash(workspace._id).unwrap();
        toast.success(`Workspace "${workspace.name}" moved to trash`);
      } catch (error) {
        //console.error('Error moving workspace to trash:', error);
        toast.error(
          error?.data?.message || "Failed to move workspace to trash",
        );
      }
    }
  };

  return (
    <>
      <div
        className={`
          group flex items-center justify-between p-2 rounded-lg cursor-pointer
          ${
            isActive
              ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
              : "hover:bg-gray-100 dark:hover:bg-gray-800"
          }
        `}
        onClick={() => onClick(workspace)}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div className="flex items-center flex-1 min-w-0">
          {isPrivate ? (
            <FaLock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          ) : (
            <FaUsers className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          )}
          <span className="ml-2 text-sm font-medium truncate">
            {workspace.name}
          </span>
        </div>

        {isAdmin && showActions && (
          <div className="flex items-center opacity-0 group-hover:opacity-100 space-x-1">
            <button
              onClick={handleEdit}
              className="p-1 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              title="Edit workspace"
            >
              <FaEdit className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleMoveToTrash}
              className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              title="Move to trash"
            >
              <FaTrash className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {showSettings && (
        <WorkspaceSettings
          workspace={workspace}
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </>
  );
};

export default WorkspaceItem;
