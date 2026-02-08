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
import { FaBell } from "react-icons/fa";
import {
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
} from "../../../redux/slices/api/userApiSlice";
import { Link } from "react-router-dom";
import { Popover } from "@headlessui/react";

const NotificationCenter = () => {
  const { data: notifications = [] } = useGetNotificationsQuery();
  const [markAsRead] = useMarkNotificationAsReadMutation();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        await markAsRead(notification._id).unwrap();
      } catch (error) {
        //console.error('Failed to mark notification as read:', error);
      }
    }
  };

  const renderNotificationContent = (notification) => {
    if (notification.type === "workspace_invitation") {
      return (
        <Link
          to={`/workspace/invitation?id=${notification.workspaceId}`}
          className="block hover:bg-gray-50 dark:hover:bg-gray-700"
          onClick={() => handleNotificationClick(notification)}
        >
          <div className="px-4 py-3">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Workspace Invitation
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {notification.message}
            </p>
            <span className="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Click to view
            </span>
          </div>
        </Link>
      );
    }

    return (
      <div
        className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700"
        onClick={() => handleNotificationClick(notification)}
      >
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {notification.title}
        </p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {notification.message}
        </p>
      </div>
    );
  };

  return (
    <Popover className="relative">
      <Popover.Button className="relative p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none">
        <FaBell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blue-600 text-xs text-white flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Popover.Button>

      <Popover.Panel className="absolute right-0 z-50 mt-2 w-80 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          <div className="px-4 py-3">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Notifications
            </h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`${
                    !notification.read ? "bg-blue-50 dark:bg-blue-900/30" : ""
                  }`}
                >
                  {renderNotificationContent(notification)}
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                No notifications
              </div>
            )}
          </div>
          {notifications.length > 0 && (
            <div className="px-4 py-3">
              <Link
                to="/profile"
                className="block text-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      </Popover.Panel>
    </Popover>
  );
};

export default NotificationCenter;
