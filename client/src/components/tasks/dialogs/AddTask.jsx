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
import { Modal } from "../../shared/dialog/Modal";
import { Button } from "../../shared/buttons/Button";
import { Input } from "../../shared/inputs/Input";
import { useWorkspace } from "../../workspace/provider/WorkspaceProvider";
import {
  useCreateTaskMutation,
  useUpdateTaskMutation,
} from "../../../redux/slices/api/taskApiSlice";
import { toast } from "sonner";
import UserList from "../shared/UserList";

const AddTask = ({ isOpen, setOpen, onSuccess, taskType = "default" }) => {
  const { workspace } = useWorkspace();
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedMembers, setSelectedMembers] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    stage: "todo",
    dueDate: "",
    assignees: [],
    createInGoogle: false,
    // Budget specific fields
    amount: "",
    category: "",
    frequency: "one-time",
    budgetType: "expense",
    startDate: "",
    endDate: "",
    notes: "",
  });

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

    // Budget specific validations
    if (taskType === "budget") {
      if (!formData.amount || isNaN(formData.amount)) {
        newErrors.amount = "Valid amount is required";
      }
      if (!formData.category) {
        newErrors.category = "Category is required";
      }
      if (
        formData.frequency === "recurring" &&
        (!formData.startDate || !formData.endDate)
      ) {
        newErrors.dateRange =
          "Start and end dates are required for recurring items";
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when field is modified
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleUserSelect = (userId) => {
    setSelectedMembers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      }
      return [...prev, userId];
    });
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

    setIsSubmitting(true);

    try {
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        stage: formData.stage,
        dueDate: new Date(formData.dueDate).toISOString(),
        workspaceId: workspace._id,
        assignees: selectedMembers,
        taskType,
        createInGoogle: formData.createInGoogle,
        // Include budget specific data if it's a budget task
        ...(taskType === "budget" && {
          budgetDetails: {
            amount: parseFloat(formData.amount),
            category: formData.category,
            frequency: formData.frequency,
            budgetType: formData.budgetType,
            startDate: formData.startDate
              ? new Date(formData.startDate).toISOString()
              : null,
            endDate: formData.endDate
              ? new Date(formData.endDate).toISOString()
              : null,
            notes: formData.notes,
          },
        }),
      };

      const result = await createTask({ taskData }).unwrap();

      if (result?.status) {
        toast.success("Task created successfully");

        // Reset form
        setFormData({
          title: "",
          description: "",
          priority: "medium",
          stage: "todo",
          dueDate: "",
          assignees: [],
          createInGoogle: false,
          amount: "",
          category: "",
          frequency: "one-time",
          budgetType: "expense",
          startDate: "",
          endDate: "",
          notes: "",
        });
        setSelectedMembers([]);
        setErrors({});

        // Close modal and trigger success callback
        setOpen(false);
        onSuccess?.();
      }
    } catch (error) {
      //.error('Error creating task:', error);
      toast.error(error?.data?.message || "Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      title: "",
      description: "",
      priority: "medium",
      stage: "todo",
      dueDate: "",
      assignees: [],
      createInGoogle: false,
      amount: "",
      category: "",
      frequency: "one-time",
      budgetType: "expense",
      startDate: "",
      endDate: "",
      notes: "",
    });
    setSelectedMembers([]);
    setErrors({});
  };

  const budgetCategories = [
    "Income",
    "Housing",
    "Transportation",
    "Food",
    "Utilities",
    "Insurance",
    "Healthcare",
    "Debt Payments",
    "Savings",
    "Entertainment",
    "Shopping",
    "Education",
    "Investments",
    "Other",
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={taskType === "budget" ? "Add Budget Item" : "Create New Task"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Field */}
        <div>
          <Input
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            error={errors.title}
            required
            placeholder={
              taskType === "budget"
                ? "Enter budget item title"
                : "Enter task title"
            }
          />
        </div>

        {taskType === "budget" && (
          <>
            {/* Amount Field */}
            <div>
              <Input
                label="Amount"
                name="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                error={errors.amount}
                required
                placeholder="Enter amount"
              />
            </div>

            {/* Category Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select a category</option>
                {budgetCategories.map((category) => (
                  <option key={category} value={category.toLowerCase()}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category}</p>
              )}
            </div>

            {/* Budget Type Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select
                name="budgetType"
                value={formData.budgetType}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
                <option value="saving">Saving</option>
              </select>
            </div>

            {/* Frequency Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Frequency
              </label>
              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="one-time">One-time</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            {formData.frequency !== "one-time" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    type="date"
                    label="Start Date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Input
                    type="date"
                    label="End Date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* Description Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {taskType === "budget" ? "Notes" : "Description"}
          </label>
          <textarea
            name={taskType === "budget" ? "notes" : "description"}
            value={
              taskType === "budget" ? formData.notes : formData.description
            }
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
            placeholder={
              taskType === "budget"
                ? "Enter additional notes"
                : "Enter task description"
            }
          />
        </div>

        {/* Due Date Field */}
        <div>
          <Input
            type="datetime-local"
            label="Due Date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            error={errors.dueDate}
            required
            min={new Date().toISOString().slice(0, 16)}
          />
        </div>

        {/* Priority Field */}
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
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {/* Google Calendar Integration */}
        {taskType !== "budget" && (
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="createInGoogle"
              name="createInGoogle"
              checked={formData.createInGoogle}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="createInGoogle"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
            >
              Also create this task in Google Calendar
            </label>
          </div>
        )}

        {/* Assignees Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Assignees
          </label>
          <UserList
            workspaceId={workspace?._id}
            selectedUsers={selectedMembers}
            onUserSelect={handleUserSelect}
            showEmail
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={isSubmitting || !workspace?._id}
          >
            {isSubmitting
              ? "Creating..."
              : taskType === "budget"
                ? "Add Budget Item"
                : "Create Task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export { AddTask };
export default AddTask;
