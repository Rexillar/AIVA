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

   ⟁  PURPOSE      : Display and manage task information

   ⟁  WHY          : User-friendly task interaction

   ⟁  WHAT         : Task display components and interaction handlers

   ⟁  TECH STACK   : React • Redux • Vite
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : MEDIUM
   ⟁  DOCS : /docs/frontend/components.md

   ⟁  USAGE RULES  : Follow design system • Handle props • Manage state

        "Tasks displayed. Interactions handled. User experience enhanced."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

import React from "react";
import { useForm } from "react-hook-form";
import {
  useCreateSubtaskMutation,
  useUpdateSubtaskMutation,
} from "../../../redux/slices/api/taskApiSlice";
import { Modal } from "../../shared/dialog/Modal";
import { Input } from "../../shared/inputs/Input";
import { Textbox } from "../../shared/inputs/Textbox";
import { Select } from "../../shared/inputs/Select";
import { DatePicker } from "../../shared/inputs/DatePicker";
import { toast } from "sonner";

const SubtaskDialog = ({
  isOpen = false,
  onClose,
  parentTask,
  subtask = null,
  onSuccess,
}) => {
  const [createSubtask, { isLoading: isCreating }] = useCreateSubtaskMutation();
  const [updateSubtask, { isLoading: isUpdating }] = useUpdateSubtaskMutation();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: subtask
      ? {
          ...subtask,
          dueDate: subtask.dueDate ? new Date(subtask.dueDate) : null,
        }
      : {
          title: "",
          description: "",
          priority: "medium",
          dueDate: null,
        },
  });

  const onSubmit = async (data) => {
    try {
      const subtaskData = {
        ...data,
        parentId: parentTask._id,
      };

      if (subtask) {
        await updateSubtask({
          subtaskId: subtask._id,
          ...subtaskData,
        }).unwrap();
        toast.success("Subtask updated successfully");
      } else {
        await createSubtask(subtaskData).unwrap();
        toast.success("Subtask created successfully");
      }

      reset();
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error?.data?.message || "Something went wrong");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={subtask ? "Edit Subtask" : "Create Subtask"}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Title"
          placeholder="Enter subtask title"
          error={errors.title?.message}
          {...register("title", { required: "Title is required" })}
        />

        <Textbox
          label="Description"
          placeholder="Enter subtask description"
          error={errors.description?.message}
          {...register("description")}
        />

        <Select
          label="Priority"
          options={[
            { value: "low", label: "Low" },
            { value: "medium", label: "Medium" },
            { value: "high", label: "High" },
          ]}
          error={errors.priority?.message}
          {...register("priority")}
        />

        <DatePicker
          label="Due Date"
          name="dueDate"
          control={control}
          error={errors.dueDate?.message}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isCreating || isUpdating}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isCreating || isUpdating
              ? "Saving..."
              : subtask
                ? "Update"
                : "Create"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SubtaskDialog;
