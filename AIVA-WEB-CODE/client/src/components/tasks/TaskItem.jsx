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
import React from "react";
import { useMoveToTrashMutation } from "../../redux/slices/api/taskApiSlice";
import { toast } from "sonner";

const TaskItem = ({ task, workspaceId }) => {
  const [moveToTrash, { isLoading }] = useMoveToTrashMutation();

  const handleMoveToTrash = async () => {
    // Validate required data
    if (!task?._id) {
      //console.error('Missing task ID:', task);
      toast.error("Invalid task data");
      return;
    }

    if (!workspaceId) {
      //console.error('Missing workspace ID');
      toast.error("Invalid workspace");
      return;
    }

    try {
      await moveToTrash({
        taskId: task._id,
        workspaceId: workspaceId.toString(), // Ensure workspaceId is a string
      }).unwrap();
    } catch (error) {
      //console.error('Failed to move task to trash:', error);
      toast.error(error?.data?.message || "Failed to move task to trash");
    }
  };

  return (
    <div className="task-item">
      {/* ... rest of your task item UI ... */}
      <button
        onClick={handleMoveToTrash}
        disabled={isLoading}
        className="text-red-500 hover:text-red-700 disabled:opacity-50"
        title="Move to trash"
      >
        {isLoading ? "Moving..." : "Move to Trash"}
      </button>
    </div>
  );
};

export default TaskItem;
