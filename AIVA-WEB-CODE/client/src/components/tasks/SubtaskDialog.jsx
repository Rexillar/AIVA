/*=================================================================
 * Project: AIVA-WEB
 * File: Button.jsx
 * Author: Mohitraj Jadeja
 * Date Created: February 28, 2024
 * Last Modified: February 28, 2024
 *=================================================================
 * Description:
 * Button component for displaying buttons.
 *=================================================================
 * Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
 *=================================================================*/
import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import {
  useCreateSubtaskMutation,
  useUpdateSubtaskMutation,
} from "../../redux/slices/api/taskApiSlice";
import { toast } from "sonner";
import UserList from "./UserList";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";

const SubtaskDialog = ({
  open = false,
  setOpen,
  task,
  subtask = null,
  workspaceId,
}) => {
  const { privateWorkspace } = useSelector((state) => state.auth);
  const isPrivateWorkspace = privateWorkspace?._id === workspaceId;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    assignee: null,
  });

  const [createSubtask, { isLoading: isCreating }] = useCreateSubtaskMutation();
  const [updateSubtask, { isLoading: isUpdating }] = useUpdateSubtaskMutation();

  useEffect(() => {
    if (subtask) {
      setFormData({
        title: subtask.title,
        description: subtask.description || "",
        dueDate: subtask.dueDate
          ? new Date(subtask.dueDate).toISOString().split("T")[0]
          : "",
        assignee: subtask.assignee?._id || null,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        dueDate: "",
        assignee: null,
      });
    }
  }, [subtask]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (subtask) {
        await updateSubtask({
          taskId: task._id,
          subtaskId: subtask._id,
          updates: formData,
        }).unwrap();
        toast.success("Subtask updated successfully");
      } else {
        await createSubtask({
          taskId: task._id,
          subtask: formData,
        }).unwrap();
        toast.success("Subtask created successfully");
      }
      setOpen(false);
    } catch (err) {
      toast.error(
        err?.data?.message ||
          `Failed to ${subtask ? "update" : "create"} subtask`,
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg w-full rounded-lg bg-white dark:bg-gray-800 p-6">
          <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {subtask ? "Edit Subtask" : "Create Subtask"}
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Only show assignee section if not in private workspace */}
            {!isPrivateWorkspace && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Assignee
                </label>
                <UserList
                  selectedUsers={formData.assignee ? [formData.assignee] : []}
                  onUserSelect={(userId) =>
                    setFormData((prev) => ({ ...prev, assignee: userId }))
                  }
                  workspaceId={workspaceId}
                  singleSelect
                />
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-md border border-gray-300 dark:border-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating || isUpdating}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md disabled:opacity-50"
              >
                {isCreating || isUpdating
                  ? "Saving..."
                  : subtask
                    ? "Update"
                    : "Create"}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

SubtaskDialog.propTypes = {
  open: PropTypes.bool,
  setOpen: PropTypes.func.isRequired,
  task: PropTypes.object.isRequired,
  subtask: PropTypes.object,
  workspaceId: PropTypes.string.isRequired,
};

export default SubtaskDialog;
