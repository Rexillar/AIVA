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
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { FaBell } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "../Badge";

const NotificationPanel = ({
  notifications = [],
  onNotificationClick,
  onMarkAllRead,
  unreadCount = 0,
}) => {
  const getNotificationIcon = (type) => {
    switch (type) {
      case "task":
        return "📋";
      case "mention":
        return "@";
      case "system":
        return "🔔";
      default:
        return "📢";
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "task":
        return "primary";
      case "mention":
        return "info";
      case "system":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="relative inline-flex items-center justify-center p-2 text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700">
        <FaBell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-80 origin-top-right divide-y divide-gray-100 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="p-2">
            <div className="flex items-center justify-between px-4 py-2">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllRead}
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="mt-2 max-h-60 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <Menu.Item key={notification._id}>
                    {({ active }) => (
                      <button
                        className={`${
                          active ? "bg-gray-50 dark:bg-gray-700" : ""
                        } group flex w-full items-start gap-x-3 rounded-md p-2 text-left`}
                        onClick={() => onNotificationClick?.(notification)}
                      >
                        <span className="flex-shrink-0 text-lg">
                          {getNotificationIcon(notification.type)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <Badge
                              variant={getNotificationColor(notification.type)}
                              size="sm"
                            >
                              {notification.type}
                            </Badge>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {formatDistanceToNow(
                                new Date(notification.createdAt),
                                { addSuffix: true },
                              )}
                            </span>
                          </div>
                        </div>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                        )}
                      </button>
                    )}
                  </Menu.Item>
                ))
              )}
            </div>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default NotificationPanel;
