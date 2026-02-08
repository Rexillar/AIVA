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
   ⟁  DOMAIN       : PAGE COMPONENTS

   ⟁  PURPOSE      : Implement complete page views and layouts

   ⟁  WHY          : Organized application navigation and structure

   ⟁  WHAT         : Full page React components with routing

   ⟁  TECH STACK   : React • Redux • Vite
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : MEDIUM
   ⟁  DOCS : /docs/frontend/pages.md

   ⟁  USAGE RULES  : Manage routing • Handle data • User experience

        "Pages rendered. Navigation smooth. User journey optimized."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

import { useState } from "react";
import { useSelector } from "react-redux";
import {
  useUpdateProfileMutation,
  useGetNotificationsQuery,
} from "../redux/slices/api/userApiSlice";
import { toast } from "sonner";
import { FaEnvelope, FaUser, FaBell } from "react-icons/fa";

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [activeTab, setActiveTab] = useState("profile");

  const [updateProfile] = useUpdateProfileMutation();
  const { data: notifications = [] } = useGetNotificationsQuery();

  const workspaceInvites = notifications.filter(
    (notification) =>
      notification.type === "workspace_invitation" && !notification.read,
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await updateProfile({
        name,
        email,
      }).unwrap();

      if (result.status) {
        toast.success("Profile updated successfully");
      }
    } catch (err) {
      //console.error('Profile update error:', err);
      toast.error(err.message || "Failed to update profile");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-4 px-4" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("profile")}
              className={`py-4 px-2 text-sm font-medium border-b-2 ${
                activeTab === "profile"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
              }`}
            >
              <FaUser className="inline-block mr-2" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab("invitations")}
              className={`py-4 px-2 text-sm font-medium border-b-2 ${
                activeTab === "invitations"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
              }`}
            >
              <FaEnvelope className="inline-block mr-2" />
              Invitations{" "}
              {workspaceInvites.length > 0 && (
                <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                  {workspaceInvites.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`py-4 px-2 text-sm font-medium border-b-2 ${
                activeTab === "notifications"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
              }`}
            >
              <FaBell className="inline-block mr-2" />
              Notifications
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "profile" && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Changes
              </button>
            </form>
          )}

          {activeTab === "invitations" && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Workspace Invitations
              </h3>
              {workspaceInvites.length > 0 ? (
                <div className="space-y-4">
                  {workspaceInvites.map((invite) => (
                    <div
                      key={invite._id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {invite.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {invite.message}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <a
                          href={`/workspace/invitation?id=${invite.workspaceId}`}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        >
                          View
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  No pending workspace invitations
                </p>
              )}
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Notifications
              </h3>
              {notifications.length > 0 ? (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`p-4 rounded-lg ${
                        notification.read
                          ? "bg-gray-50 dark:bg-gray-700"
                          : "bg-blue-50 dark:bg-blue-900/30"
                      }`}
                    >
                      <p className="font-medium text-gray-900 dark:text-white">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  No notifications
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
