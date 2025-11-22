import React, { Fragment, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import {
  EllipsisVerticalIcon,
  Cog6ToothIcon,
  TrashIcon,
  UserGroupIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import WorkspaceSettings from "./management/WorkspaceSettings";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const WorkspaceDropdown = ({ workspace }) => {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);

  // Check if user is admin or owner
  const isAdmin = workspace?.members?.some(
    (member) =>
      member.user._id === localStorage.getItem("userId") &&
      (member.role === "admin" || member.role === "owner"),
  );

  return (
    <>
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="flex items-center rounded-full text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            <span className="sr-only">Open options</span>
            <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
          </Menu.Button>
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              {/* Settings - Only visible to admins */}
              {isAdmin && (
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => setShowSettings(true)}
                      className={classNames(
                        active
                          ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                          : "text-gray-700 dark:text-gray-300",
                        "flex w-full items-center px-4 py-2 text-sm gap-2",
                      )}
                    >
                      <Cog6ToothIcon className="h-5 w-5" />
                      Settings
                    </button>
                  )}
                </Menu.Item>
              )}

              {/* Team Management - Only visible to admins */}
              {isAdmin && (
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() =>
                        navigate(`/workspaces/${workspace._id}/team`)
                      }
                      className={classNames(
                        active
                          ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                          : "text-gray-700 dark:text-gray-300",
                        "flex w-full items-center px-4 py-2 text-sm gap-2",
                      )}
                    >
                      <UserGroupIcon className="h-5 w-5" />
                      Manage Team
                    </button>
                  )}
                </Menu.Item>
              )}

              {/* Analytics - Visible to all members */}
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() =>
                      navigate(`/workspaces/${workspace._id}/analytics`)
                    }
                    className={classNames(
                      active
                        ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        : "text-gray-700 dark:text-gray-300",
                      "flex w-full items-center px-4 py-2 text-sm gap-2",
                    )}
                  >
                    <ChartBarIcon className="h-5 w-5" />
                    Analytics
                  </button>
                )}
              </Menu.Item>

              {/* Move to Trash - Only visible to admins */}
              {isAdmin && (
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => setShowSettings(true)}
                      className={classNames(
                        active
                          ? "bg-gray-100 dark:bg-gray-700 text-red-600 dark:text-red-400"
                          : "text-red-500 dark:text-red-400",
                        "flex w-full items-center px-4 py-2 text-sm gap-2",
                      )}
                    >
                      <TrashIcon className="h-5 w-5" />
                      Move to Trash
                    </button>
                  )}
                </Menu.Item>
              )}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>

      {/* Settings Modal */}
      <WorkspaceSettings
        workspace={workspace}
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
};

export default WorkspaceDropdown;
