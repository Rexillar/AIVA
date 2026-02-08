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

import clsx from "clsx";
import { FaUserCircle, FaClock, FaTrash } from "react-icons/fa";

const MemberActions = ({
  member,
  workspaceData,
  canManageMembers,
  isWorkspaceOwner,
  onAction,
  onDelete,
}) => {
  if (!member?.user?._id) return null;

  // Check if member is owner
  const isOwner = member.user._id === workspaceData?.owner;
  if (isOwner) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
        <FaUserCircle className="mr-2" />
        Workspace Owner
      </span>
    );
  }

  // Check permissions
  if (!canManageMembers) return null;

  const getMemberStatus = (member) => {
    if (!member) return "inactive";
    if (member.status === "archived") return "archived";
    return member.isActive ? "active" : "inactive";
  };

  const status = getMemberStatus(member);
  const isActive = status === "active";
  const isAdmin = member.role === "admin";

  // Don't show status change button for admins if not owner
  if (isAdmin && !isWorkspaceOwner) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
        <FaUserCircle className="mr-2" />
        Admin
      </span>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => onAction(member)}
        className={clsx(
          "inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium",
          isActive
            ? "text-yellow-700 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300"
            : "text-green-700 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300",
        )}
      >
        {isActive ? (
          <>
            <FaClock className="mr-2" />
            Deactivate
          </>
        ) : (
          <>
            <FaUserCircle className="mr-2" />
            Activate
          </>
        )}
      </button>
      {isWorkspaceOwner && status !== "archived" && (
        <button
          onClick={() => onDelete(member)}
          className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300"
        >
          <FaTrash className="mr-2" />
          Remove
        </button>
      )}
    </div>
  );
};

export default MemberActions;