/*=================================================================
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
import { addNotification } from "../slices/notificationSlice";

const isDueDateWithin24Hours = (dueDate) => {
  if (!dueDate) return false;
  const now = new Date();
  const due = new Date(dueDate);
  const diffInHours = (due - now) / (1000 * 60 * 60);
  return diffInHours > 0 && diffInHours <= 24;
};

// Define which endpoints this middleware should handle success notifications for.
const notificationEndpoints = new Set([
  "createTask",
  "updateTask",
  "deleteTask",
]);

export const notificationMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  // Handle success notifications for specified endpoints
  if (
    action.type?.startsWith("api/executeMutation/") &&
    notificationEndpoints.has(action.meta?.arg?.endpointName)
  ) {
    const { type, payload } = action;
    const endpointName = action?.meta?.arg?.endpointName;

    // Task creation success
    if (
      type.endsWith("/fulfilled") &&
      payload?.title &&
      endpointName === "createTask"
    ) {
      store.dispatch(
        addNotification({
          title: "Task Created",
          message: `Task "${payload.title}" has been created successfully.`,
          type: "success",
        }),
      );

      // Check due date
      if (isDueDateWithin24Hours(payload.dueDate)) {
        store.dispatch(
          addNotification({
            title: "Due Soon",
            message: `Task "${payload.title}" is due within 24 hours.`,
            type: "warning",
          }),
        );
      }
    }

    // Task update success
    if (
      type.endsWith("/fulfilled") &&
      payload?.title &&
      endpointName === "updateTask"
    ) {
      store.dispatch(
        addNotification({
          title: "Task Updated",
          message: `Task "${payload.title}" has been updated successfully.`,
          type: "success",
        }),
      );

      // Check due date after update
      if (isDueDateWithin24Hours(payload.dueDate)) {
        store.dispatch(
          addNotification({
            title: "Due Soon",
            message: `Task "${payload.title}" is due within 24 hours.`,
            type: "warning",
          }),
        );
      }
    }

    // Task deletion success
    if (type.endsWith("/fulfilled") && endpointName === "deleteTask") {
      store.dispatch(
        addNotification({
          title: "Task Deleted",
          message: "Task has been deleted successfully.",
          type: "success",
        }),
      );
    }
  }

  // Handle generic errors from mutations, but ignore login failures
  // as those are handled by the login form UI.
  if (
    action.type?.startsWith("api/executeMutation/") &&
    action.type.endsWith("/rejected")
  ) {
    const endpointName = action?.meta?.arg?.endpointName;
    if (endpointName !== "login") {
      store.dispatch(
        addNotification({
          title: "Operation Failed",
          message:
            action.error?.message ||
            "An error occurred while processing your request.",
          type: "error",
        }),
      );
    }
  }

  return result;
};

export default notificationMiddleware;
