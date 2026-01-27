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

import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import {
  DocumentIcon,
  PhotoIcon,
  PaperClipIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useDeleteTaskAssetMutation } from "../../redux/slices/api/taskApiSlice";
import { toast } from "sonner";
import { Button } from "../shared";
import { useUploadAssetMutation } from "../../redux/slices/api/taskApiSlice";

const fileTypeIcons = {
  "image/jpeg": PhotoIcon,
  "image/png": PhotoIcon,
  "image/gif": PhotoIcon,
  "application/pdf": DocumentIcon,
  "text/plain": DocumentIcon,
  "application/msword": DocumentIcon,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    DocumentIcon,
};

const getFileIcon = (mimetype) => {
  return fileTypeIcons[mimetype] || DocumentIcon;
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Add max file size constant
// Add max file size constant
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

const TaskAssets = ({ taskId, assets = [] }) => {
  const [uploadAsset, { isLoading }] = useUploadAssetMutation();
  const [deleteAsset] = useDeleteTaskAssetMutation();
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  // Validate taskId
  const isValidTaskId =
    taskId && typeof taskId === "string" && taskId.length > 0;

  // Debug logging
  useEffect(() => {
    if (!isValidTaskId) {
      //console.error('TaskAssets: Invalid task ID:', taskId);
    } else {
      //console.log('TaskAssets: Valid task ID:', taskId);
    }
  }, [taskId, isValidTaskId]);

  // Early return if no valid taskId is provided
  if (!isValidTaskId) {
    return (
      <div className="text-center text-red-500 p-4">
        <p className="font-medium">
          Error: Task ID is required for file uploads
        </p>
        <p className="text-sm mt-1">
          Please ensure you&apos;re viewing a valid task.
        </p>
      </div>
    );
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.size > MAX_FILE_SIZE) {
      toast.error(`File size cannot exceed ${formatFileSize(MAX_FILE_SIZE)}.`);
      e.target.value = null; // Clear the file input
      setFile(null);
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      await uploadAsset({ taskId, asset: formData }).unwrap();
      toast.success("File uploaded successfully!");
      //console.log('Uploaded asset:', result);
      setFile(null);
    } catch (error) {
      //console.error('Error uploading file:', error);
      toast.error(error?.data?.message || "Failed to upload file.");
    }
  };

  const handleDelete = async (assetId) => {
    if (!isValidTaskId) {
      toast.error("Invalid task ID. Please refresh the page and try again.");
      return;
    }

    try {
      await deleteAsset({ taskId, assetId }).unwrap();
      toast.success("Asset deleted successfully");
    } catch (error) {
      console.error("Delete error:", { error, taskId, assetId });
      toast.error(error?.data?.message || "Failed to delete asset");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <PaperClipIcon className="h-5 w-5" />
          <h3 className="font-medium">Assets</h3>
        </div>

        {/* Upload Button */}
        <div className="relative">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            {isLoading ? "Uploading..." : "Upload Files"}
          </Button>
        </div>
      </div>
      {/* Assets List */}
      <div className="space-y-2">
        {assets.length > 0 ? (
          assets.map((asset) => {
            const Icon = getFileIcon(asset.mimetype);
            return (
              <div
                key={asset._id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {asset.filename}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(asset.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    as="a"
                    href={asset.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="ghost"
                    size="sm"
                  >
                    Download
                  </Button>
                  <Button
                    onClick={() => handleDelete(asset._id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <PaperClipIcon className="h-6 w-6 mx-auto mb-2" />
            <p>No files attached</p>
          </div>
        )}
      </div>

      {file && (
        <div className="mt-4">
          <Button
            onClick={handleUpload}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Uploading..." : `Upload ${file.name}`}
          </Button>
        </div>
      )}
    </div>
  );
};

TaskAssets.propTypes = {
  taskId: PropTypes.string.isRequired,
  assets: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      filename: PropTypes.string,
      size: PropTypes.number,
      mimetype: PropTypes.string,
      url: PropTypes.string,
    }),
  ),
};

export default TaskAssets;
