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

import React, { useState, useEffect, Fragment } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetWorkspaceQuery,
  useUpdateWorkspaceMutation,
  useMoveWorkspaceToTrashMutation,
} from "../../../redux/slices/api/workspaceApiSlice";
import LoadingSpinner from "../../shared/LoadingSpinner";
import ErrorAlert from "../../shared/feedback/ErrorAlert";
import {
  FaCog,
  FaClock,
  FaBell,
  FaTrash,
  FaExclamationTriangle,
} from "react-icons/fa";
import { CalendarIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { Dialog, Transition } from "@headlessui/react";
import GoogleAccountManager from "../integrations/GoogleAccountManager";

const SettingsSection = ({ title, icon: Icon, children }) => (
  <div className="bg-gray-800/95 shadow-lg rounded-lg overflow-hidden backdrop-blur-sm border border-gray-700/50">
    <div className="px-4 py-5 sm:p-6">
      <div className="flex items-center mb-4">
        <Icon className="w-5 h-5 text-gray-400 mr-2" />
        <h3 className="text-lg font-medium text-white">{title}</h3>
      </div>
      {children}
    </div>
  </div>
);

const DeleteDialog = ({ isOpen, onClose, onConfirm }) => (
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
        <div className="fixed inset-0 bg-black/75" />
      </Transition.Child>

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
              <Dialog.Title
                as="h3"
                className="text-lg font-medium leading-6 text-white flex items-center"
              >
                <FaExclamationTriangle className="w-5 h-5 text-red-400 mr-2" />
                Move to Trash
              </Dialog.Title>
              <div className="mt-3">
                <p className="text-sm text-gray-300">
                  Are you sure you want to move this workspace to trash? You can
                  restore it later from the trash section.
                </p>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md border border-gray-600 bg-gray-700 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md border border-transparent bg-red-900 px-4 py-2 text-sm font-medium text-red-200 hover:bg-red-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                  onClick={onConfirm}
                >
                  Move to Trash
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </div>
    </Dialog>
  </Transition>
);

const WorkspaceSettingsPage = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const [updateWorkspace] = useUpdateWorkspaceMutation();
  const [moveToTrash] = useMoveWorkspaceToTrashMutation();
  const {
    data: workspace,
    isLoading,
    error,
  } = useGetWorkspaceQuery(workspaceId, {
    refetchOnMountOrArgChange: true,
  });
  const [activeTab, setActiveTab] = useState("general");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    workingHours: {
      start: "09:00",
      end: "17:00",
    },
    workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    notifications: true,
  });

  useEffect(() => {
    if (workspace) {
      setFormData({
        name: workspace.name || "",
        description: workspace.description || "",
        workingHours: workspace.workingHours || {
          start: "09:00",
          end: "17:00",
        },
        workingDays: workspace.workingDays || [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
        ],
        notifications: workspace.notifications !== false,
      });
    }
  }, [workspace]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <ErrorAlert
          title="Error loading workspace settings"
          message={error?.data?.message || "Failed to load workspace settings"}
        />
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleTimeChange = (type, value) => {
    setFormData((prev) => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [type]: value,
      },
    }));
  };

  const handleDayToggle = (day) => {
    setFormData((prev) => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter((d) => d !== day)
        : [...prev.workingDays, day],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!workspaceId) {
        toast.error("Workspace ID is required");
        return;
      }

      const updateData = {
        id: workspaceId,
        name: formData.name,
        description: formData.description,
        workingHours: formData.workingHours,
        workingDays: formData.workingDays,
        notifications: formData.notifications,
      };

      //console.log('Updating workspace with data:', updateData);

      const result = await updateWorkspace(updateData).unwrap();

      if (!result?.status) {
        throw new Error(
          result?.message || "Failed to update workspace settings",
        );
      }

      toast.success("Workspace settings updated successfully");
    } catch (err) {
      //console.error('Error updating workspace:', err);
      toast.error(
        err?.data?.message ||
          err?.message ||
          "Failed to update workspace settings",
      );
    }
  };

  const handleDelete = async () => {
    if (!workspaceId) {
      toast.error("Workspace ID is required");
      setIsDeleteDialogOpen(false);
      return;
    }

    try {
      const result = await moveToTrash(workspaceId).unwrap();

      if (result.status) {
        toast.success(result.message || "Workspace moved to trash");
        setIsDeleteDialogOpen(false);
        navigate("/workspaces");
      } else {
        throw new Error(result.message || "Failed to move workspace to trash");
      }
    } catch (error) {
      //console.error('Error moving workspace to trash:', error);
      toast.error(
        error?.data?.message ||
          error?.message ||
          "Failed to move workspace to trash",
      );
      setIsDeleteDialogOpen(false);
    }
  };

  const tabs = [
    { id: "general", label: "General", icon: FaCog },
    { id: "time", label: "Time Settings", icon: FaClock },
    { id: "notifications", label: "Notifications", icon: FaBell },
    { id: "integrations", label: "Google Integration", icon: CalendarIcon },
  ];

  const days = [
    { id: "monday", label: "Monday" },
    { id: "tuesday", label: "Tuesday" },
    { id: "wednesday", label: "Wednesday" },
    { id: "thursday", label: "Thursday" },
    { id: "friday", label: "Friday" },
    { id: "saturday", label: "Saturday" },
    { id: "sunday", label: "Sunday" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Settings Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Workspace Settings</h1>
        <p className="mt-1 text-sm text-gray-400">
          Manage your workspace preferences and configuration
        </p>
      </div>

      {/* Settings Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-800/80 p-1 rounded-lg overflow-x-auto backdrop-blur-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-all duration-200
              ${
                activeTab === tab.id
                  ? "bg-blue-500/20 text-blue-400 shadow-lg shadow-blue-500/20"
                  : "text-gray-400 hover:text-gray-300 hover:bg-gray-700/50"
              }
            `}
          >
            <tab.icon className="w-4 h-4 mr-2 flex-shrink-0" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Settings Content */}
      <div className="space-y-6">
        {activeTab === "general" && (
          <SettingsSection title="General Settings" icon={FaCog}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Workspace Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter workspace name"
                  required
                  className="mt-1 block w-full rounded-md bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter workspace description"
                  rows={3}
                  className="mt-1 block w-full rounded-md bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-300 bg-red-900/30 hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors duration-200"
                >
                  <FaTrash className="w-4 h-4 mr-2" />
                  Move to Trash
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors duration-200 shadow-lg shadow-blue-500/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </SettingsSection>
        )}

        {activeTab === "time" && (
          <SettingsSection title="Time Settings" icon={FaClock}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Working Hours Start
                  </label>
                  <input
                    type="time"
                    value={formData.workingHours.start}
                    onChange={(e) => handleTimeChange("start", e.target.value)}
                    className="mt-1 block w-full rounded-md bg-gray-700/50 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Working Hours End
                  </label>
                  <input
                    type="time"
                    value={formData.workingHours.end}
                    onChange={(e) => handleTimeChange("end", e.target.value)}
                    className="mt-1 block w-full rounded-md bg-gray-700/50 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Working Days
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {days.map((day) => (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => handleDayToggle(day.id)}
                      className={`
                        px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200
                        ${
                          formData.workingDays.includes(day.id)
                            ? "bg-blue-500/20 text-blue-400 shadow-lg shadow-blue-500/20"
                            : "bg-gray-700/50 text-gray-400 hover:bg-gray-700"
                        }
                      `}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors duration-200 shadow-lg shadow-blue-500/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </SettingsSection>
        )}

        {activeTab === "notifications" && (
          <SettingsSection title="Notification Preferences" icon={FaBell}>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="notifications"
                  checked={formData.notifications}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-300">
                  Enable workspace notifications
                </label>
              </div>
            </div>
          </SettingsSection>
        )}

        {activeTab === "integrations" && (
          <div className="bg-gray-800/95 shadow-lg rounded-lg overflow-hidden backdrop-blur-sm border border-gray-700/50 p-6">
            <GoogleAccountManager workspaceId={workspaceId} />
          </div>
        )}
      </div>

      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => {
          handleDelete();
          setIsDeleteDialogOpen(false);
        }}
      />
    </div>
  );
};

export default WorkspaceSettingsPage;
