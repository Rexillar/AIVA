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
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog } from "@headlessui/react";
import { toast } from "sonner";
import {
  useAddWorkspaceMemberMutation,
  useUpdateWorkspaceMemberRoleMutation,
} from "../../../redux/slices/api/userApiSlice";
import { ModalWrapper } from "../../shared/dialog/ModalWrapper";
import { Input } from "../../shared/inputs/Input";
import { LoadingSpinner } from "../../shared/feedback/LoadingSpinner";
import { Button } from "../../shared/buttons/Button";
import { useAddMemberMutation } from "../../../redux/slices/api/workspaceApiSlice";
import Modal from "../../shared/dialog/Modal";

const AddUser = ({ open, setOpen, workspaceId, onSuccess }) => {
  const [addMember] = useAddMemberMutation();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    try {
      setIsLoading(true);
      const result = await addMember({
        id: workspaceId,
        email: email.trim(),
      }).unwrap();

      if (result.status) {
        toast.success("Team member added successfully");
        setEmail("");
        if (onSuccess) onSuccess();
        setOpen(false);
      }
    } catch (error) {
      //console.error('Error adding member:', error);
      toast.error(error?.data?.message || "Failed to add team member");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={open} onClose={() => setOpen(false)} title="Add Team Member">
      <form onSubmit={handleSubmit} className="p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter team member's email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
        </div>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Adding..." : "Add Member"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddUser;
