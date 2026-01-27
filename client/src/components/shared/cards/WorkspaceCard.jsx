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
import {
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiCopy,
  FiExternalLink,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const WorkspaceCard = ({ workspace, onEdit, onDelete, onDuplicate }) => {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleOptionClick = (e, action) => {
    e.stopPropagation();
    setShowMenu(false);

    switch (action) {
      case "open":
        navigate(`/workspace/${workspace._id}/dashboard`);
        break;
      case "edit":
        onEdit(workspace);
        break;
      case "trash":
        onDelete(workspace);
        break;
      case "duplicate":
        onDuplicate(workspace);
        break;
      default:
        break;
    }
  };

  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200">
      {/* Card Header with Three Dot Menu */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
          {workspace.name}
        </h3>
        <div className="relative">
          <button
            onClick={handleMenuClick}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <FiMoreVertical className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700">
              <div className="py-1">
                <button
                  onClick={(e) => handleOptionClick(e, "open")}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FiExternalLink className="mr-3 w-4 h-4" />
                  Open
                </button>
                <button
                  onClick={(e) => handleOptionClick(e, "edit")}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FiEdit2 className="mr-3 w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={(e) => handleOptionClick(e, "trash")}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FiTrash2 className="mr-3 w-4 h-4" />
                  Move to Trash
                </button>
                <button
                  onClick={(e) => handleOptionClick(e, "duplicate")}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FiCopy className="mr-3 w-4 h-4" />
                  Duplicate
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {workspace.description || "No description provided"}
        </p>
      </div>

      {/* Card Footer */}
      <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center">
          <span className="capitalize">
            {workspace.type?.replace("Workspace", "")}
          </span>
        </div>
        <div className="flex items-center">
          <span>{workspace.members?.length || 0} members</span>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceCard;
