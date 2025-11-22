import React from "react";
import { Link } from "react-router-dom";
import { HomeIcon, UsersIcon } from "@heroicons/react/24/outline";
import WorkspaceDropdown from "./WorkspaceDropdown";

const WorkspaceItem = ({ workspace, isActive }) => {
  const Icon = workspace.type === "PrivateWorkspace" ? HomeIcon : UsersIcon;

  return (
    <div
      className={`flex items-center justify-between px-2 py-1.5 rounded-md ${
        isActive
          ? "bg-gray-800 text-white"
          : "text-gray-300 hover:bg-gray-800 hover:text-white"
      }`}
    >
      <Link
        to={`/workspaces/${workspace._id}`}
        className="flex items-center gap-2 flex-1 min-w-0"
      >
        <Icon className="h-5 w-5 flex-shrink-0" />
        <span className="truncate">{workspace.name}</span>
      </Link>
      <WorkspaceDropdown workspace={workspace} />
    </div>
  );
};

export default WorkspaceItem;
