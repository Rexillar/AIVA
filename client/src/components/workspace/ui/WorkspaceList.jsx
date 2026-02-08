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
import { useDispatch } from "react-redux";
import { FaUsers, FaLock, FaPlus, FaCog } from "react-icons/fa";
import { setCurrentWorkspace } from "../../../redux/slices/workspaceSlice";
import WorkspaceSettings from "../management/WorkspaceSettings";

const WorkspaceCard = ({ workspace, isActive, onClick }) => {
  const [showSettings, setShowSettings] = useState(false);
  const isPrivate =
    workspace.type === "private" || workspace.type === "PrivateWorkspace";
  const isAdmin =
    workspace.userRole === "admin" ||
    workspace.owner === workspace.currentUserId;

  return (
    <>
      <div
        className={`
          w-full flex flex-col p-4 rounded-lg transition-all duration-200
          ${
            isActive
              ? "bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800"
              : "bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
          }
          border shadow-sm
        `}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center flex-1">
            {isPrivate ? (
              <FaLock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            ) : (
              <FaUsers className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            )}
            <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white truncate">
              {workspace.name}
            </span>
          </div>
          {isAdmin && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowSettings(true);
              }}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FaCog className="w-4 h-4" />
            </button>
          )}
        </div>

        <div onClick={() => onClick(workspace)} className="cursor-pointer">
          {workspace.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
              {workspace.description}
            </p>
          )}

          <div className="mt-3 flex items-center justify-between">
            <div className="flex -space-x-2">
              {workspace.members?.slice(0, 3).map((member, index) => (
                <img
                  key={member._id || index}
                  src={
                    member.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || "User")}`
                  }
                  alt={member.name}
                  className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800"
                />
              ))}
              {workspace.members?.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-600 dark:text-gray-300 border-2 border-white dark:border-gray-800">
                  +{workspace.members.length - 3}
                </div>
              )}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {workspace.members?.length || 0} member
              {workspace.members?.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Settings Dialog */}
      {isAdmin && (
        <WorkspaceSettings
          workspace={workspace}
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </>
  );
};

const CreateWorkspaceCard = ({ onClick }) => (
  <button
    onClick={onClick}
    className="w-full h-full min-h-[160px] flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-colors duration-200"
  >
    <FaPlus className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
      Create New Workspace
    </span>
  </button>
);

const WorkspaceList = ({
  workspaces = [],
  currentWorkspace,
  onCreateWorkspace,
  className = "",
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleWorkspaceSelect = (workspace) => {
    if (!workspace?._id) return;
    dispatch(setCurrentWorkspace(workspace));
    navigate(`/tasks/${workspace._id}/dashboard`);
  };

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}
    >
      {workspaces.map((workspace) => (
        <WorkspaceCard
          key={workspace._id}
          workspace={workspace}
          isActive={currentWorkspace?._id === workspace._id}
          onClick={handleWorkspaceSelect}
        />
      ))}

      <CreateWorkspaceCard onClick={onCreateWorkspace} />
    </div>
  );
};

export default WorkspaceList;
