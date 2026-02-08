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
import { Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useDispatch, useSelector } from "react-redux";
import {
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useGetNotificationsQuery,
} from "../../../redux/slices/api/userApiSlice";
import { logout } from "../../../redux/slices/authSlice";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useGetPendingInvitationsQuery } from "../../../redux/slices/api/workspaceApiSlice";
import WorkspaceInvitations from "../../../components/workspace/management/WorkspaceInvitations";

const ProfileDialog = ({ open, setOpen }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("profile");
  const [updateProfile] = useUpdateProfileMutation();
  const [changePassword] = useChangePasswordMutation();
  const { data: notifications = [] } = useGetNotificationsQuery();
  const { data: pendingInvitations = [] } = useGetPendingInvitationsQuery();

  // Filter workspace invitations
  const workspaceInvitations = notifications.filter(
    (n) => n.type === "workspace_invitation",
  );

  // Profile form state
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Preferences state
  const [preferences, setPreferences] = useState(
    user?.preferences || {
      reminders: {
        taskDue: {
          enabled: true,
          advanceNotice: 24,
        },
        dailyDigest: {
          enabled: true,
          time: "09:00",
        },
        weeklyReport: {
          enabled: true,
          day: "monday",
          time: "09:00",
        },
      },
    },
  );

  // Handle preference changes
  const handlePreferenceChange = (path, value) => {
    const pathArray = path.split(".");
    setPreferences((prev) => {
      const newPreferences = { ...prev };
      let current = newPreferences;
      for (let i = 0; i < pathArray.length - 1; i++) {
        current = current[pathArray[i]];
      }
      current[pathArray[pathArray.length - 1]] = value;
      return newPreferences;
    });
  };

  // Handle saving preferences
  const handleSavePreferences = async () => {
    try {
      await updateProfile({
        preferences,
      }).unwrap();
      toast.success("Preferences updated successfully");
    } catch (error) {
      toast.error(error.message || "Failed to update preferences");
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(formData).unwrap();
      toast.success("Profile updated successfully");
      setOpen(false);
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }).unwrap();
      toast.success("Password changed successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setOpen(false);
    } catch (error) {
      toast.error(error.message || "Failed to change password");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-[95%] sm:max-w-md md:max-w-lg rounded-lg bg-white dark:bg-gray-800 flex flex-col max-h-[90vh] sm:max-h-[85vh]">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">
                Account Settings
              </Dialog.Title>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 sm:gap-4 mt-3 sm:mt-4">
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md ${
                  activeTab === "profile"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md ${
                  activeTab === "security"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Security
              </button>
              <button
                onClick={() => setActiveTab("preferences")}
                className={`px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md ${
                  activeTab === "preferences"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Preferences
              </button>
              <button
                onClick={() => setActiveTab("invitations")}
                className={`px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md ${
                  activeTab === "invitations"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Invitations
                {workspaceInvitations.length > 0 && (
                  <span className="ml-1 sm:ml-2 inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {workspaceInvitations.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {activeTab === "profile" && (
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm sm:text-base px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm sm:text-base px-3 py-2"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save Changes
                </button>
              </form>
            )}

            {activeTab === "security" && (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Confirm new password"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Change Password
                </button>
              </form>
            )}

            {activeTab === "preferences" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Reminder Settings
                  </h3>

                  {/* Task Due Reminders */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-700 dark:text-gray-300">
                          Task Due Reminders
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Get notified before tasks are due
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.reminders.taskDue.enabled}
                        onChange={(e) =>
                          handlePreferenceChange(
                            "reminders.taskDue.enabled",
                            e.target.checked,
                          )
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    {preferences.reminders.taskDue.enabled && (
                      <div className="ml-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Advance Notice (hours)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="72"
                          value={preferences.reminders.taskDue.advanceNotice}
                          onChange={(e) =>
                            handlePreferenceChange(
                              "reminders.taskDue.advanceNotice",
                              parseInt(e.target.value),
                            )
                          }
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                    )}
                  </div>

                  {/* Daily Digest */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-700 dark:text-gray-300">
                          Daily Digest
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Receive a daily summary of your tasks
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.reminders.dailyDigest.enabled}
                        onChange={(e) =>
                          handlePreferenceChange(
                            "reminders.dailyDigest.enabled",
                            e.target.checked,
                          )
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    {preferences.reminders.dailyDigest.enabled && (
                      <div className="ml-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Time
                        </label>
                        <input
                          type="time"
                          value={preferences.reminders.dailyDigest.time}
                          onChange={(e) =>
                            handlePreferenceChange(
                              "reminders.dailyDigest.time",
                              e.target.value,
                            )
                          }
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                    )}
                  </div>

                  {/* Weekly Report */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-700 dark:text-gray-300">
                          Weekly Report
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Get a weekly summary of your progress
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.reminders.weeklyReport.enabled}
                        onChange={(e) =>
                          handlePreferenceChange(
                            "reminders.weeklyReport.enabled",
                            e.target.checked,
                          )
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    {preferences.reminders.weeklyReport.enabled && (
                      <div className="ml-4 space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Day of Week
                          </label>
                          <select
                            value={preferences.reminders.weeklyReport.day}
                            onChange={(e) =>
                              handlePreferenceChange(
                                "reminders.weeklyReport.day",
                                e.target.value,
                              )
                            }
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          >
                            <option value="monday">Monday</option>
                            <option value="tuesday">Tuesday</option>
                            <option value="wednesday">Wednesday</option>
                            <option value="thursday">Thursday</option>
                            <option value="friday">Friday</option>
                            <option value="saturday">Saturday</option>
                            <option value="sunday">Sunday</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Time
                          </label>
                          <input
                            type="time"
                            value={preferences.reminders.weeklyReport.time}
                            onChange={(e) =>
                              handlePreferenceChange(
                                "reminders.weeklyReport.time",
                                e.target.value,
                              )
                            }
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleSavePreferences}
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save Preferences
                </button>
              </div>
            )}

            {activeTab === "invitations" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Workspace Invitations
                </h3>
                <div className="space-y-4">
                  <WorkspaceInvitations />
                </div>
              </div>
            )}
          </div>

          <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <button
                onClick={handleLogout}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
              <button
                onClick={() => setOpen(false)}
                className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export { ProfileDialog };
export default ProfileDialog;
