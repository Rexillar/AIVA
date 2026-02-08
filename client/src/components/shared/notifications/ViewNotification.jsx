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
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "../Badge";
import { UserInfo } from "../display/UserInfo";
import { MdClose } from "react-icons/md";

const ViewNotification = ({
  notification,
  isOpen,
  onClose,
  onMarkAsRead,
  onDelete,
}) => {
  if (!notification) return null;

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
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 dark:bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white">
                    {notification.title}
                  </Dialog.Title>
                  <button
                    className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                    onClick={onClose}
                  >
                    <MdClose className="h-6 w-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <Badge
                      variant={getNotificationColor(notification.type)}
                      size="sm"
                    >
                      {notification.type}
                    </Badge>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>

                  {notification.from && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        From:
                      </p>
                      <UserInfo user={notification.from} showEmail size="sm" />
                    </div>
                  )}

                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300">
                      {notification.message}
                    </p>
                  </div>

                  {notification.link && (
                    <a
                      href={notification.link}
                      className="mt-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      View details →
                    </a>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-6 flex justify-end gap-2">
                  {!notification.read && (
                    <button
                      className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      onClick={() => onMarkAsRead?.(notification._id)}
                    >
                      Mark as read
                    </button>
                  )}
                  <button
                    className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    onClick={() => onDelete?.(notification._id)}
                  >
                    Delete
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ViewNotification;
