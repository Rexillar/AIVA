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
import { formatDistanceToNow } from "date-fns";
import { UserCircleIcon } from "@heroicons/react/24/outline";

const TaskActivity = ({ task }) => {
  if (!task?.activities?.length) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
        No activity recorded yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {task.activities.map((activity) => (
        <div key={activity._id} className="flex space-x-3">
          {activity.by?.avatar ? (
            <img
              src={activity.by.avatar}
              alt={activity.by.name}
              className="h-8 w-8 rounded-full"
            />
          ) : (
            <UserCircleIcon className="h-8 w-8 text-gray-400" />
          )}

          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                {activity.by?.name || "Unknown User"}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(activity.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>

            <div className="text-sm text-gray-700 dark:text-gray-300">
              {activity.type === "status_change" ? (
                <p>
                  Changed status from{" "}
                  <span className="font-medium">{activity.oldValue}</span> to{" "}
                  <span className="font-medium">{activity.newValue}</span>
                </p>
              ) : activity.type === "assignee_change" ? (
                <p>
                  {activity.action === "add" ? "Added" : "Removed"}{" "}
                  <span className="font-medium">{activity.user?.name}</span> as
                  assignee
                </p>
              ) : activity.type === "comment" ? (
                <p className="whitespace-pre-wrap">{activity.content}</p>
              ) : (
                <p>{activity.content}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskActivity;
