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

import React, { useState, useEffect } from "react";
import {
  useCreateTaskMutation,
  useUpdateTaskMutation,
} from "../../redux/slices/api/taskApiSlice";
import { Dialog } from "@headlessui/react";
import { useWorkspace } from "../WorkspaceProvider";
import { toast } from "sonner";
import { Button, Input, Select } from "../shared";
import UserList from "./UserList";
import { useSelector } from "react-redux";
import { format, parseISO } from "date-fns";

const CREATION_DATE = "2025-02-21"; // Fixed creation date
const FORMATTED_CREATION_DATE = format(parseISO(CREATION_DATE), "MMM dd, yyyy");

const AddTask = ({ open = false, setOpen, onSuccess, editingTask = null }) => {
  const { workspace } = useWorkspace();
  const { privateWorkspace } = useSelector((state) => state.auth);
  const isPrivateWorkspace = privateWorkspace?._id === workspace?._id;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    stage: "todo",
    dueDate: "",
    assignees: [],
    createInGoogle: false,
  });

  const [errors, setErrors] = useState([]);
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const isLoading = isCreating || isUpdating;

  // Initialize form data when editing task
  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title || "",
        description: editingTask.description || "",
        priority: editingTask.priority || "medium",
        stage: editingTask.stage || "todo",
        dueDate: editingTask.dueDate
          ? format(new Date(editingTask.dueDate), "yyyy-MM-dd")
          : "",
        assignees: editingTask.assignees || [],
        createInGoogle: !!editingTask.isGoogleSynced,
      });
    }
  }, [editingTask]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setErrors([]);
  };

  const handleUserSelect = (userId) => {
    setFormData((prev) => ({
      ...prev,
      assignees: prev.assignees.includes(userId)
        ? prev.assignees.filter((id) => id !== userId)
        : [...prev.assignees, userId],
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    // Due date validation
    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required";
    } else {
      const selectedDate = new Date(formData.dueDate);
      const now = new Date();
      if (selectedDate < now) {
        newErrors.dueDate = "Due date cannot be in the past";
      }
    }

    // Workspace validation
    if (!workspace?._id) {
      newErrors.workspace = "Please select a workspace";
      toast.error("Please select a workspace first");
    }

    // Show all validation errors
    if (Object.keys(newErrors).length > 0) {
      Object.values(newErrors).forEach((error) => {
        toast.error(error);
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!workspace?._id) {
      toast.error("Please select a workspace first");
      return;
    }

    try {
      const taskData = {
        ...formData,
        workspaceId: workspace._id,
        assignees: formData.assignees,
      };

      if (editingTask) {
        await updateTask({
          taskId: editingTask._id,
          workspaceId: workspace._id,
          updates: taskData,
        }).unwrap();
        toast.success("Task updated successfully");
      } else {
        const result = await createTask({ taskData, workspaceId: workspace._id }).unwrap();

        if (result?.isGoogleSynced) {
          const accountEmail = result?.externalTask?.googleAccount?.email;
          toast.success(
            accountEmail
              ? `Task created and synced to Google Tasks (${accountEmail}).`
              : "Task created and synced to Google Tasks."
          );
        } else if (formData.createInGoogle) {
          toast.success("Task created. Google sync was requested but could not be completed.");
        } else {
          toast.success("Task created successfully");
        }
      }

      handleClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      //console.error(`Error ${editingTask ? 'updating' : 'creating'} task:`, error);
      toast.error(
        error?.data?.message ||
        `Failed to ${editingTask ? "update" : "create"} task`,
      );
    } finally {
      // no-op
    }
  };

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      priority: "medium",
      stage: "todo",
      dueDate: "",
      assignees: [],
      createInGoogle: false,
    });
    setErrors([]);
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg w-full rounded-lg bg-white dark:bg-gray-800 p-6">
          <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {editingTask ? "Edit Task" : "Create New Task"}
          </Dialog.Title>

          {Object.keys(errors).length > 0 && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              {Object.values(errors).map((error, index) => (
                <p
                  key={index}
                  className="text-sm text-red-600 dark:text-red-400"
                >
                  • {error}
                </p>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter task title"
              required
              error={!!errors.title}
            />

            <Input
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter task description"
              multiline
              rows={3}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 ${errors.dueDate
                      ? "border-red-500"
                      : ""
                    }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="createInGoogle"
                type="checkbox"
                name="createInGoogle"
                checked={formData.createInGoogle}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="createInGoogle" className="text-sm text-gray-700 dark:text-gray-300">
                Sync this task to Google Tasks
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Stage
              </label>
              <select
                name="stage"
                value={formData.stage}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Assignees
              </label>
              <div className="mt-1 border rounded-md dark:border-gray-600">
                <UserList
                  workspaceId={workspace?._id}
                  selectedUsers={formData.assignees}
                  onUserSelect={handleUserSelect}
                  className="max-h-48 overflow-y-auto p-2"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={isLoading}>
                {editingTask ? "Update Task" : "Create Task"}
              </Button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default AddTask;
