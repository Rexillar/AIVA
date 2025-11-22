import React from "react";
import { NavLink } from "react-router-dom";
import {
  HomeIcon,
  ListBulletIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserGroupIcon,
  TrashIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

const WorkspaceNavigation = ({ workspace }) => {
  // Check if user is admin or owner
  const isAdmin = workspace?.members?.some(
    (member) =>
      member.user._id === localStorage.getItem("userId") &&
      (member.role === "admin" || member.role === "owner"),
  );

  const navigationItems = [
    {
      name: "Dashboard",
      to: `/workspaces/${workspace?._id}`,
      icon: HomeIcon,
      end: true,
    },
    {
      name: "Tasks",
      to: `/workspaces/${workspace?._id}/tasks`,
      icon: ListBulletIcon,
    },
    {
      name: "Notes",
      to: `/workspaces/${workspace?._id}/notes`,
      icon: DocumentTextIcon,
    },
    {
      name: "Calendar",
      to: `/workspaces/${workspace?._id}/calendar`,
      icon: CalendarIcon,
    },
    {
      name: "Team",
      to: `/workspaces/${workspace?._id}/team`,
      icon: UserGroupIcon,
    },
    // Settings - Only visible to admins
    ...(isAdmin
      ? [
          {
            name: "Settings",
            to: `/workspaces/${workspace?._id}/settings`,
            icon: Cog6ToothIcon,
          },
        ]
      : []),
    {
      name: "Trash",
      to: `/workspaces/${workspace?._id}/trash`,
      icon: TrashIcon,
    },
  ];

  return (
    <nav className="space-y-1">
      {navigationItems.map((item) => (
        <NavLink
          key={item.name}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
              isActive
                ? "bg-gray-700 text-white"
                : "text-gray-300 hover:bg-gray-700 hover:text-white"
            }`
          }
        >
          <item.icon
            className="mr-3 h-5 w-5 flex-shrink-0"
            aria-hidden="true"
          />
          {item.name}
        </NavLink>
      ))}
    </nav>
  );
};

export default WorkspaceNavigation;
