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
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useWorkspace } from "../../workspace/provider/WorkspaceProvider";
import { useUpdateTaskMutation } from "../../../redux/slices/api/taskApiSlice";
import { addNotification } from "../../../redux/slices/notificationSlice";
import { Modal } from "../../shared/dialog/Modal";
import { Input } from "../../shared/inputs/Input";
import { Select } from "../../shared/inputs/Select";
import { Button } from "../../shared/buttons/Button";
import UserList from "../shared/UserList";
import { useGetWorkspaceMembersQuery } from "../../../redux/slices/api/workspaceApiSlice";
import { LoadingSpinner } from "../../shared/feedback/LoadingSpinner";

const TaskDialog = ({ isOpen, onClose, task, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [selectedAdmins, setSelectedAdmins] = useState([]);
  const { workspace } = useWorkspace();
  const [updateTask] = useUpdateTaskMutation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Fetch workspace members with their roles
  const { data: membersData, isLoading: isLoadingMembers } =
    useGetWorkspaceMembersQuery(workspace?._id, { skip: !workspace?._id });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      priority: task?.priority || "medium",
      stage: task?.stage || "todo",
      focusTag: task?.focusTag || "",
      dueDate: task?.dueDate
        ? new Date(task.dueDate).toISOString().split("T")[0]
        : "",
    },
  });

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description,
        priority: task.priority,
        stage: task.stage,
        focusTag: task.focusTag || "",
        dueDate: task.dueDate
          ? new Date(task.dueDate).toISOString().split("T")[0]
          : "",
      });

      // Separate admins and regular members
      const admins =
        task.assignees?.filter(
          (a) => a.role === "admin" || a.role === "owner",
        ) || [];
      const members = task.assignees?.filter((a) => a.role === "member") || [];
      setSelectedAdmins(admins);
      setSelectedMembers(members);
    }
  }, [task, reset]);

  const handleClose = () => {
    reset();
    setSelectedMembers([]);
    setSelectedAdmins([]);
    onClose();
  };

  const handleUserSelect = (user, isAdmin = false) => {
    if (isAdmin) {
      setSelectedAdmins((prev) => {
        const exists = prev.some((member) => member._id === user._id);
        if (exists) {
          return prev.filter((member) => member._id !== user._id);
        }
        return [...prev, user];
      });
    } else {
      setSelectedMembers((prev) => {
        const exists = prev.some((member) => member._id === user._id);
        if (exists) {
          return prev.filter((member) => member._id !== user._id);
        }
        return [...prev, user];
      });
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const result = await updateTask({
        taskId: task._id,
        workspaceId: workspace._id,
        updates: {
          ...data,
          assignees: [...selectedAdmins, ...selectedMembers].map(
            (member) => member._id,
          ),
        },
      }).unwrap();

      dispatch(
        addNotification({
          title: "Task Updated",
          message: `Task "${data.title}" has been updated successfully.`,
          type: "success",
        }),
      );

      onSuccess?.(result);
      handleClose();
    } catch (error) {
      dispatch(
        addNotification({
          title: "Task Update Failed",
          message:
            error?.data?.message || "Failed to update task. Please try again.",
          type: "error",
        }),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const priorityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
  ];

  const stageOptions = [
    { value: "todo", label: "To Do" },
    { value: "in_progress", label: "In Progress" },
    { value: "review", label: "Review" },
    { value: "completed", label: "Completed" },
  ];

  const focusTagOptions = [
    { value: "", label: "No Focus Tag" },
    { value: "deep-work", label: "Deep Work" },
    { value: "creative", label: "Creative" },
    { value: "planning", label: "Planning" },
    { value: "review", label: "Review" },
    { value: "communication", label: "Communication" },
    { value: "learning", label: "Learning" },
    { value: "other", label: "Other" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={task ? "Edit Task" : "Create Task"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="Title"
          {...register("title", { required: "Title is required" })}
          error={errors.title?.message}
          required
        />
        <Input
          label="Description"
          {...register("description")}
          error={errors.description?.message}
        />
        <Select
          label="Priority"
          {...register("priority")}
          error={errors.priority?.message}
          options={priorityOptions}
        />
        <Select
          label="Stage"
          {...register("stage")}
          error={errors.stage?.message}
          options={stageOptions}
        />
        <Select
          label="Focus Tag"
          {...register("focusTag")}
          error={errors.focusTag?.message}
          options={focusTagOptions}
        />
        <Input
          type="date"
          label="Due Date"
          {...register("dueDate", { required: "Due date is required" })}
          error={errors.dueDate?.message}
          required
        />

        {/* Member Selection Section */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Assign Admins
            </h3>
            {isLoadingMembers ? (
              <LoadingSpinner size="sm" />
            ) : (
              <UserList
                selectedUsers={selectedAdmins}
                onUserSelect={(user) => handleUserSelect(user, true)}
                workspaceId={workspace._id}
                filterRole="admin"
                showRole
              />
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Assign Members
            </h3>
            {isLoadingMembers ? (
              <LoadingSpinner size="sm" />
            ) : (
              <UserList
                selectedUsers={selectedMembers}
                onUserSelect={(user) => handleUserSelect(user, false)}
                workspaceId={workspace._id}
                filterRole="member"
                showRole
              />
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            {task ? "Update Task" : "Create Task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskDialog;
