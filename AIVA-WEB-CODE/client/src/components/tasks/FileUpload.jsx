/*=================================================================
 * Project: AIVA-WEB
 * File: FileUpload.jsx
 * Author: Mohitraj Jadeja
 * Date Created: February 28, 2024
 * Last Modified: October 21, 2025
 *=================================================================
 * Description:
 * File upload component for tasks
 *=================================================================
 * Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
 *=================================================================*/
import React from "react";
import { useState } from "react";
import { useUploadFileMutation } from "../../redux/slices/api/uploadApiSlice";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";

const FileUpload = ({ onUploadComplete, taskId }) => {
  const [uploadFile] = useUploadFileMutation();
  const [isUploading, setIsUploading] = useState(false);
  const { workspaceId } = useParams();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!workspaceId) {
      toast.error("Workspace ID is required");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    try {
      const result = await uploadFile({
        formData,
        workspaceId,
        taskId,
      }).unwrap();

      if (onUploadComplete) {
        onUploadComplete(result);
      }
      toast.success("File uploaded successfully");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(err?.data?.message || "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={handleFileChange}
        disabled={isUploading}
        className="hidden"
        id="file-upload"
      />
      <label
        htmlFor="file-upload"
        className={`cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 
          rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white 
          hover:bg-gray-50 ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {isUploading ? "Uploading..." : "Upload File"}
      </label>
    </div>
  );
};

FileUpload.propTypes = {
  onUploadComplete: PropTypes.func,
  taskId: PropTypes.string,
};

export default FileUpload;
