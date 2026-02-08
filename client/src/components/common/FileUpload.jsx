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

import React from "react";
import { useState, useCallback, useRef, useEffect } from "react";
import {
  ArrowUpTrayIcon as Upload,
  XMarkIcon as X,
  DocumentIcon as File,
  CheckCircleIcon as CheckCircle,
  ExclamationCircleIcon as AlertCircle,
  ArrowDownTrayIcon as Download,
  EyeIcon as Eye,
  TrashIcon as Trash,
  PhotoIcon as Photo,
  LinkIcon as Link,
} from "@heroicons/react/24/outline";
import PropTypes from "prop-types";
import socketService from "../../services/socket";

const FileUpload = ({
  workspaceId,
  onUploadComplete,
  onUploadError,
  maxFileSize = 10, // MB
  allowedTypes = [],
  multiple = true,
  category = "other",
  showExistingFiles = true,
}) => {
  const [files, setFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingFiles, setDeletingFiles] = useState(new Set());
  const [imagePreview, setImagePreview] = useState(null);
  const [imagePreviewError, setImagePreviewError] = useState(null);
  const fileInputRef = useRef(null);

  const fetchExistingFiles = useCallback(async () => {
    if (!workspaceId) return;

    setLoading(true);
    try {
      const baseUrl =
        import.meta.env.VITE_APP_API_URL || "/";
      const response = await fetch(
        `${baseUrl}/api/workspace/${workspaceId}/files`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (response.ok) {
        const result = await response.json();
        setExistingFiles(result.data.files || []);
      }
    } catch (error) {
      console.error("Error fetching existing files:", error);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    if (showExistingFiles && workspaceId) {
      fetchExistingFiles();
    }
  }, [workspaceId, showExistingFiles, fetchExistingFiles]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const validateFile = (file) => {
    const errors = [];

    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      errors.push(`File size exceeds ${maxFileSize}MB`);
    }

    // Check file type
    if (allowedTypes.length > 0) {
      const fileExtension = file.name.split(".").pop().toLowerCase();
      const isAllowed = allowedTypes.some((type) => {
        if (type.startsWith(".")) {
          return fileExtension === type.substring(1);
        }
        return file.type.startsWith(type);
      });

      if (!isAllowed) {
        errors.push(
          `File type not allowed. Allowed: ${allowedTypes.join(", ")}`,
        );
      }
    }

    return errors;
  };

  const handleFiles = useCallback((newFiles) => {
    const fileArray = Array.from(newFiles);

    const processedFiles = fileArray.map((file) => {
      const errors = validateFile(file);
      const previewUrl = file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null;
      return {
        file,
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        progress: 0,
        status: errors.length > 0 ? "error" : "pending",
        errors,
        previewUrl,
      };
    });

    setFiles((prev) => [...prev, ...processedFiles]);

    // Start uploading valid files
    processedFiles.forEach((fileObj) => {
      if (fileObj.status !== "error") {
        uploadFile(fileObj);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uploadFile = async (fileObj) => {
    if (!workspaceId) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileObj.id
            ? { ...f, status: "error", errors: ["Workspace ID is required"] }
            : f,
        ),
      );
      return;
    }

    const formData = new FormData();
    formData.append("file", fileObj.file);
    formData.append("category", category);

    try {
      // Notify via socket that upload started
      socketService.fileUploadStart(workspaceId, fileObj.name);

      // Update status to uploading
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileObj.id ? { ...f, status: "uploading" } : f,
        ),
      );

      const baseUrl =
        import.meta.env.VITE_APP_API_URL || "/";
      const response = await fetch(
        `${baseUrl}/api/workspace/${workspaceId}/uploads`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        },
      );

      // Simulate progress (in real app, use XMLHttpRequest for actual progress)
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 10;
        if (progress <= 90) {
          setFiles((prev) =>
            prev.map((f) => (f.id === fileObj.id ? { ...f, progress } : f)),
          );
          socketService.fileUploadProgress(workspaceId, fileObj.name, progress);
        }
      }, 100);

      if (!response.ok) {
        clearInterval(progressInterval);
        const errorData = await response
          .json()
          .catch(() => ({ message: "Upload failed" }));
        throw new Error(errorData.message || "Upload failed");
      }

      const result = await response.json();
      clearInterval(progressInterval);

      // Update to complete with download URL
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileObj.id
            ? {
              ...f,
              status: "complete",
              progress: 100,
              downloadUrl: result.data.driveDownloadUrl || result.data.url,
              fileId: result.data.fileId,
            }
            : f,
        ),
      );

      // Notify via socket
      socketService.fileUploadComplete(workspaceId, result.data);

      // Callback
      if (onUploadComplete) {
        onUploadComplete(result.data);
      }

      // Refresh existing files list
      if (showExistingFiles) {
        fetchExistingFiles();
      }
    } catch (error) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileObj.id
            ? { ...f, status: "error", errors: [error.message] }
            : f,
        ),
      );

      if (onUploadError) {
        onUploadError(error);
      }
    }
  };

  const downloadFile = (fileObj) => {
    if (fileObj.downloadUrl) {
      const baseUrl =
        import.meta.env.VITE_APP_API_URL || "/";
      let downloadUrl;

      // Check if it's already a full URL
      if (fileObj.downloadUrl.startsWith("http")) {
        downloadUrl = fileObj.downloadUrl;
      } else {
        downloadUrl = `${baseUrl}${fileObj.downloadUrl}`;
      }

      // Create a temporary link and trigger download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileObj.name;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const viewFile = (file) => {
    if (file.fileType === "image") {
      // For images, show preview modal
      const baseUrl =
        import.meta.env.VITE_APP_API_URL || "/";
      let imageUrl;

      if (file.driveDownloadUrl) {
        // Google Drive URL
        imageUrl = file.driveDownloadUrl;
      } else if (file.gcsUrl) {
        // GridFS or GCS URL - check if it's already a full URL
        if (file.gcsUrl.startsWith("http")) {
          imageUrl = file.gcsUrl;
        } else {
          imageUrl = `${baseUrl}${file.gcsUrl}`;
        }
      } else {
        // Fallback
        imageUrl = `${baseUrl}/api/uploads/${file._id}`;
      }

      setImagePreview({
        url: imageUrl,
        name: file.originalFileName,
      });
      setImagePreviewError(null); // Clear any previous error
    } else if (file.fileType === "document" || file.mimeType?.includes("pdf")) {
      // For documents, try Google Docs viewer (only for non-localhost URLs)
      const baseUrl =
        import.meta.env.VITE_APP_API_URL || "/";
      let fileUrl;

      if (file.driveDownloadUrl) {
        // Google Drive URL
        fileUrl = file.driveDownloadUrl;
      } else if (file.gcsUrl) {
        // GridFS or GCS URL - check if it's already a full URL
        if (file.gcsUrl.startsWith("http")) {
          fileUrl = file.gcsUrl;
        } else {
          fileUrl = `${baseUrl}${file.gcsUrl}`;
        }
      } else {
        // Fallback
        fileUrl = `${baseUrl}/api/uploads/${file._id}`;
      }

      // Check if the URL is localhost - Google Docs viewer can't access localhost
      const isLocalhost =
        fileUrl.includes("localhost") ||
        fileUrl.includes("127.0.0.1") ||
        fileUrl.includes("0.0.0.0");

      if (isLocalhost) {
        // For localhost files, download instead of preview
        downloadFile({ name: file.originalFileName, downloadUrl: fileUrl });
      } else {
        // Use Google Docs viewer for public URLs
        const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
        window.open(viewerUrl, "_blank");
      }
    } else {
      // For other files, just download
      downloadFile({
        name: file.originalFileName,
        downloadUrl: file.driveDownloadUrl || file.gcsUrl,
      });
    }
  };

  const shareFile = async (file) => {
    const baseUrl = import.meta.env.VITE_APP_API_URL || "/";
    let shareUrl;

    if (file.driveDownloadUrl) {
      // Google Drive URL - use direct download link
      shareUrl = file.driveDownloadUrl;
    } else if (file.gcsUrl) {
      // GridFS or GCS URL - construct public access URL
      if (file.gcsUrl.startsWith("http")) {
        shareUrl = file.gcsUrl;
      } else {
        shareUrl = `${baseUrl}${file.gcsUrl}`;
      }
    } else {
      // Fallback - construct download URL
      shareUrl = `${baseUrl}/api/uploads/${file._id}`;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      // Silently copy to clipboard - no alert needed
    } catch (error) {
      console.error("Failed to copy link:", error);
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      // Silent fallback - no alert
    }
  };

  const deleteFile = async (fileId, fileName) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }

    // Add to deleting set
    setDeletingFiles((prev) => new Set(prev).add(fileId));

    try {
      const baseUrl =
        import.meta.env.VITE_APP_API_URL || "/";
      const response = await fetch(`${baseUrl}/api/uploads/${fileId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        // Remove from existing files list
        setExistingFiles((prev) => prev.filter((f) => f._id !== fileId));
        // Refresh the list
        fetchExistingFiles();
      } else {
        alert("Failed to delete file");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Error deleting file");
    } finally {
      // Remove from deleting set
      setDeletingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
    }
  };

  const removeFile = (fileId) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles.length > 0) {
      handleFiles(selectedFiles);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "complete":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <File className="w-5 h-5 text-gray-400" />;
    }
  };

  const getFileIcon = (file) => {
    if (file.fileType === "image") {
      return <Photo className="w-5 h-5 text-blue-500 flex-shrink-0" />;
    }
    return <File className="w-5 h-5 text-gray-400 flex-shrink-0" />;
  };

  return (
    <div className="w-full">
      {/* Drop Zone */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
          }
        `}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
          Drop files here or click to browse
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {multiple ? "Upload multiple files" : "Upload a file"}
          {maxFileSize && ` (Max ${maxFileSize}MB)`}
        </p>
        {allowedTypes.length > 0 && (
          <p className="text-xs text-gray-400 mt-2">
            Allowed: {allowedTypes.join(", ")}
          </p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={allowedTypes.join(",")}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-6 space-y-3">
          {files.map((fileObj) => (
            <div
              key={fileObj.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {fileObj.previewUrl ? (
                    <img
                      src={fileObj.previewUrl}
                      alt="preview"
                      className="w-10 h-10 object-cover rounded-md"
                    />
                  ) : (
                    getStatusIcon(fileObj.status)
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {fileObj.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(fileObj.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {fileObj.status === "complete" && fileObj.downloadUrl && (
                    <button
                      onClick={() => downloadFile(fileObj)}
                      className="p-1 hover:bg-green-100 dark:hover:bg-green-900/20 rounded"
                      title="Download file"
                    >
                      <Download className="w-4 h-4 text-green-500" />
                    </button>
                  )}
                  <button
                    onClick={() => removeFile(fileObj.id)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    disabled={fileObj.status === "uploading"}
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              {fileObj.status === "uploading" && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${fileObj.progress}%` }}
                  />
                </div>
              )}

              {/* Errors */}
              {fileObj.errors && fileObj.errors.length > 0 && (
                <div className="mt-2">
                  {fileObj.errors.map((error, idx) => (
                    <p key={idx} className="text-xs text-red-500">
                      {error}
                    </p>
                  ))}
                </div>
              )}

              {/* Status Text */}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {fileObj.status === "complete" &&
                  "Upload complete - Click download to save"}
                {fileObj.status === "uploading" &&
                  `Uploading... ${fileObj.progress}%`}
                {fileObj.status === "pending" && "Waiting to upload..."}
                {fileObj.status === "error" && "Upload failed"}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Existing Files */}
      {showExistingFiles && existingFiles.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Uploaded Files
          </h3>
          <div className="space-y-3">
            {existingFiles.map((file) => (
              <div
                key={file._id}
                className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {getFileIcon(file)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {file.originalFileName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(file.size)} • {file.category} • Uploaded{" "}
                        {new Date(file.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* View Button */}
                    {(file.fileType === "image" ||
                      file.fileType === "document" ||
                      file.mimeType?.includes("pdf")) && (
                        <button
                          onClick={() => viewFile(file)}
                          className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded"
                          title={
                            file.fileType === "image"
                              ? "Preview image"
                              : "Preview or download document"
                          }
                        >
                          {file.fileType === "image" ? (
                            <Photo className="w-4 h-4 text-blue-500" />
                          ) : (
                            <Eye className="w-4 h-4 text-blue-500" />
                          )}
                        </button>
                      )}

                    {/* Download Button */}
                    <button
                      onClick={() =>
                        downloadFile({
                          name: file.originalFileName,
                          downloadUrl: file.driveDownloadUrl || file.gcsUrl,
                        })
                      }
                      className="p-1 hover:bg-green-100 dark:hover:bg-green-900/20 rounded"
                      title="Download file"
                    >
                      <Download className="w-4 h-4 text-green-500" />
                    </button>

                    {/* Share Link Button */}
                    <button
                      onClick={() => shareFile(file)}
                      className="p-1 hover:bg-purple-100 dark:hover:bg-purple-900/20 rounded"
                      title="Copy shareable link"
                    >
                      <Link className="w-4 h-4 text-purple-500" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() =>
                        deleteFile(file._id, file.originalFileName)
                      }
                      disabled={deletingFiles.has(file._id)}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded disabled:opacity-50"
                      title="Delete file"
                    >
                      <Trash
                        className={`w-4 h-4 ${deletingFiles.has(file._id) ? "text-gray-400" : "text-red-500"}`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading files...
          </p>
        </div>
      )}

      {/* Image Preview Modal */}
      {imagePreview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl max-h-full overflow-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {imagePreview.name}
              </h3>
              <button
                onClick={() => {
                  setImagePreview(null);
                  setImagePreviewError(null);
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <div className="p-4">
              {imagePreviewError ? (
                <div className="text-center py-8">
                  <div className="text-red-500 mb-2">
                    <X className="w-12 h-12 mx-auto" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Failed to load image preview
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    {imagePreviewError}
                  </p>
                  <button
                    onClick={() =>
                      downloadFile({
                        name: imagePreview.name,
                        downloadUrl: imagePreview.url,
                      })
                    }
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Download Instead
                  </button>
                </div>
              ) : (
                <img
                  src={imagePreview.url}
                  alt={imagePreview.name}
                  className="max-w-full max-h-96 object-contain mx-auto"
                  onError={(e) => {
                    console.error("Image failed to load:", e);
                    setImagePreviewError(
                      "Image could not be loaded. It may have been deleted or access is restricted.",
                    );
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

FileUpload.propTypes = {
  workspaceId: PropTypes.string.isRequired,
  onUploadComplete: PropTypes.func,
  onUploadError: PropTypes.func,
  maxFileSize: PropTypes.number,
  allowedTypes: PropTypes.arrayOf(PropTypes.string),
  multiple: PropTypes.bool,
  category: PropTypes.string,
  showExistingFiles: PropTypes.bool,
};

export default FileUpload;
