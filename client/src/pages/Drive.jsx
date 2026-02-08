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
   ⟁  DOMAIN       : PAGE COMPONENTS

   ⟁  PURPOSE      : Google Drive file management interface

   ⟁  WHY          : Cloud storage integration for workspace

   ⟁  WHAT         : Full page React component for Drive operations

   ⟁  TECH STACK   : React • Redux • Vite
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : MEDIUM
   ⟁  DOCS : /docs/frontend/pages.md

   ⟁  USAGE RULES  : Manage files • Handle uploads • User experience

        "Files displayed. Storage managed. Cloud integrated."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

import { useState, useEffect } from 'react';
import { useWorkspace } from '../components/workspace/provider/WorkspaceProvider';
import { Container } from '../components/shared/layout/Container';
import { Card } from '../components/shared/layout/Card';
import { SearchInput } from '../components/shared/inputs/SearchInput';
import { LoadingSpinner } from '../components/shared/feedback/LoadingSpinner';
import { ErrorBoundary } from '../components/shared/feedback/ErrorBoundary';
import {
  FiFolder,
  FiFile,
  FiExternalLink,
  FiHardDrive,
  FiSearch,
  FiGrid,
  FiList,
  FiRefreshCw,
  FiUpload,
  FiEdit2,
  FiTrash2,
  FiFolderPlus,
  FiDownload
} from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_APP_API_URL || '/api';

const Drive = () => {
  const { workspace } = useWorkspace();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [currentFolder, setCurrentFolder] = useState(null);
  const [storageQuota, setStorageQuota] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [googleAccounts, setGoogleAccounts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [folderName, setFolderName] = useState('');
  const [newFileName, setNewFileName] = useState('');

  // Fetch Google accounts
  useEffect(() => {
    if (workspace?._id) {
      fetchGoogleAccounts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace?._id]);

  // Fetch files when account or folder changes
  useEffect(() => {
    if (selectedAccount && workspace?._id) {
      fetchFiles();
      fetchStorageQuota();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccount, currentFolder, workspace?._id]);

  const fetchGoogleAccounts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/google/accounts/${workspace._id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('Google accounts response:', response.data);

      // Handle both response formats: {accounts: [...]} or {integration: {accounts: [...]}}
      const accounts = response.data.accounts || response.data.integration?.accounts || [];

      if (accounts.length > 0) {
        const activeAccounts = accounts.filter(acc => acc.status === 'active');

        console.log('Active Google accounts:', activeAccounts);
        console.log('First account structure:', activeAccounts[0]);
        setGoogleAccounts(activeAccounts);

        // Auto-select first active account using accountId
        if (activeAccounts.length > 0 && !selectedAccount) {
          const accountId = activeAccounts[0].accountId || activeAccounts[0]._id || activeAccounts[0].email;
          console.log('Setting selected account to:', accountId);
          setSelectedAccount(accountId);
        }
      } else {
        console.log('No accounts found in response');
      }
    } catch (error) {
      console.error('Error fetching Google accounts:', error);
      toast.error('Failed to load Google accounts');
    }
  };

  const fetchFiles = async () => {
    setLoading(true);
    try {
      console.log('fetchFiles - selectedAccount:', selectedAccount);
      const token = localStorage.getItem('token');
      const params = currentFolder ? { folderId: currentFolder } : {};

      const response = await axios.get(
        `${API_URL}/drive/files/${workspace._id}/${selectedAccount}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params
        }
      );

      setFiles(response.data.files || []);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const fetchStorageQuota = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/drive/quota/${workspace._id}/${selectedAccount}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setStorageQuota(response.data.quota);
    } catch (error) {
      console.error('Error fetching storage quota:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchFiles();
    await fetchStorageQuota();
    setRefreshing(false);
    toast.success('Files refreshed');
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (currentFolder) {
        formData.append('parentFolderId', currentFolder);
      }

      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/drive/upload/${workspace._id}/${selectedAccount}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(progress);
          }
        }
      );

      toast.success('File uploaded successfully');
      await fetchFiles();
      event.target.value = ''; // Reset file input
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      toast.error('Please enter a folder name');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/drive/folders/${workspace._id}/${selectedAccount}`,
        {
          folderName: folderName.trim(),
          parentFolderId: currentFolder
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Folder created successfully');
      setShowCreateFolderDialog(false);
      setFolderName('');
      await fetchFiles();
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error(error.response?.data?.message || 'Failed to create folder');
    }
  };

  const handleRename = async () => {
    if (!newFileName.trim()) {
      toast.error('Please enter a new name');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_URL}/drive/metadata/${workspace._id}/${selectedAccount}/${selectedFile.id}`,
        { name: newFileName.trim() },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('File renamed successfully');
      setShowRenameDialog(false);
      setSelectedFile(null);
      setNewFileName('');
      await fetchFiles();
    } catch (error) {
      console.error('Error renaming file:', error);
      toast.error(error.response?.data?.message || 'Failed to rename file');
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${API_URL}/drive/files/${workspace._id}/${selectedAccount}/${selectedFile.id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('File deleted successfully');
      setShowDeleteDialog(false);
      setSelectedFile(null);
      await fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error(error.response?.data?.message || 'Failed to delete file');
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/drive/download/${workspace._id}/${selectedAccount}/${fileId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('File downloaded successfully');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error(error.response?.data?.message || 'Failed to download file');
    }
  };

  const openRenameDialog = (file) => {
    setSelectedFile(file);
    setNewFileName(file.name);
    setShowRenameDialog(true);
  };

  const openDeleteDialog = (file) => {
    setSelectedFile(file);
    setShowDeleteDialog(true);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchFiles();
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/drive/search/${workspace._id}/${selectedAccount}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { q: searchQuery }
        }
      );

      setFiles(response.data.files || []);
    } catch (error) {
      console.error('Error searching files:', error);
      toast.error('Failed to search files');
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType) => {
    if (mimeType === 'application/vnd.google-apps.folder') {
      return <FiFolder className="text-yellow-500" size={24} />;
    }
    return <FiFile className="text-blue-500" size={24} />;
  };

  const openInDrive = (webViewLink) => {
    if (webViewLink) {
      window.open(webViewLink, '_blank');
    } else {
      toast.error('Drive link not available');
    }
  };

  if (!workspace) {
    return (
      <Container>
        <Card>
          <p className="text-center text-gray-600">Please select a workspace</p>
        </Card>
      </Container>
    );
  }

  if (googleAccounts.length === 0 && !loading) {
    return (
      <Container>
        <Card>
          <div className="text-center py-8">
            <FiHardDrive className="mx-auto text-6xl text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Connect Google Drive</h3>
            <p className="text-gray-600 mb-2">
              Your Google account needs Drive access enabled
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Re-connect your Google account with Drive permissions to access files
            </p>
            <button
              onClick={() => {
                if (workspace?._id) {
                  window.location.href = `/workspace/${workspace._id}/settings?tab=integrations`;
                } else {
                  window.location.href = '/settings?tab=integrations';
                }
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go to Integrations Settings
            </button>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <ErrorBoundary>
      <Container>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Google Drive</h1>
              <p className="text-gray-600 mt-1">Manage your workspace files</p>
            </div>

            {/* Storage Quota - Hidden until properly implemented */}
            {storageQuota && storageQuota.limit < 1000000000000 && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Storage Used</p>
                <p className="text-lg font-semibold">
                  {formatBytes(storageQuota.usage)} / {formatBytes(storageQuota.limit)}
                </p>
                <div className="w-48 h-2 bg-gray-200 rounded-full mt-1">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${Math.min(storageQuota.percentUsed, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions Bar */}
          <Card>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <SearchInput
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <button
                    onClick={handleSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                  >
                    <FiSearch />
                  </button>
                </div>

                {/* Account Selector */}
                {googleAccounts.length > 1 && (
                  <select
                    value={selectedAccount || ''}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    {googleAccounts.map((account) => (
                      <option key={account.accountId || account._id} value={account.accountId || account._id}>
                        {account.email}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* View Toggle */}
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
                >
                  <FiGrid />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
                >
                  <FiList />
                </button>

                {/* New Folder Button */}
                <button
                  onClick={() => setShowCreateFolderDialog(true)}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center gap-2"
                >
                  <FiFolderPlus />
                  New Folder
                </button>

                {/* Upload Button */}
                <label className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 cursor-pointer disabled:opacity-50">
                  <FiUpload />
                  Upload File
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>

                {/* Refresh Button */}
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                >
                  <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Uploading...</span>
                  <span className="text-sm font-medium text-gray-900">{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </Card>

          {/* Files Grid/List */}
          <Card>
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-12">
                <FiFolder className="mx-auto text-6xl text-gray-400 mb-4" />
                <p className="text-gray-600">No files found</p>
                <p className="text-sm text-gray-500 mt-2">Files will appear here when you add them to your Google Drive workspace folder</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all group relative"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-3xl cursor-pointer" onClick={() => openInDrive(file.webViewLink)}>
                        {getFileIcon(file.mimeType)}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (file.mimeType !== 'application/vnd.google-apps.folder') {
                              handleDownload(file.id, file.name);
                            }
                          }}
                          className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-blue-600"
                          title="Download"
                          disabled={file.mimeType === 'application/vnd.google-apps.folder'}
                        >
                          <FiDownload size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openRenameDialog(file);
                          }}
                          className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-blue-600"
                          title="Rename"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteDialog(file);
                          }}
                          className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-red-600"
                          title="Delete"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <p
                      className="text-sm font-medium text-gray-900 truncate cursor-pointer hover:text-blue-600"
                      onClick={() => openInDrive(file.webViewLink)}
                    >
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {file.size ? formatBytes(parseInt(file.size)) : 'Folder'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 group transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer" onClick={() => openInDrive(file.webViewLink)}>
                      <div className="text-2xl flex-shrink-0">{getFileIcon(file.mimeType)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate group-hover:text-blue-600">
                          {file.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(file.modifiedTime).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm text-gray-600">
                        {file.size ? formatBytes(parseInt(file.size)) : 'Folder'}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (file.mimeType !== 'application/vnd.google-apps.folder') {
                              handleDownload(file.id, file.name);
                            }
                          }}
                          className="p-2 hover:bg-gray-100 rounded text-gray-600 hover:text-blue-600"
                          title="Download"
                          disabled={file.mimeType === 'application/vnd.google-apps.folder'}
                        >
                          <FiDownload size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openRenameDialog(file);
                          }}
                          className="p-2 hover:bg-gray-100 rounded text-gray-600 hover:text-blue-600"
                          title="Rename"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteDialog(file);
                          }}
                          className="p-2 hover:bg-gray-100 rounded text-gray-600 hover:text-red-600"
                          title="Delete"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Breadcrumb */}
          {currentFolder && (
            <button
              onClick={() => setCurrentFolder(null)}
              className="text-blue-600 hover:underline"
            >
              ← Back to root folder
            </button>
          )}

          {/* Create Folder Modal */}
          {showCreateFolderDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-96">
                <h3 className="text-lg font-semibold mb-4">Create New Folder</h3>
                <input
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="Enter folder name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                />
                <div className="flex gap-2 mt-6 justify-end">
                  <button
                    onClick={() => {
                      setShowCreateFolderDialog(false);
                      setFolderName('');
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateFolder}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Rename Modal */}
          {showRenameDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-96">
                <h3 className="text-lg font-semibold mb-4">Rename File</h3>
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="Enter new name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && handleRename()}
                />
                <div className="flex gap-2 mt-6 justify-end">
                  <button
                    onClick={() => {
                      setShowRenameDialog(false);
                      setSelectedFile(null);
                      setNewFileName('');
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRename}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Rename
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-96">
                <h3 className="text-lg font-semibold mb-4">Delete File</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete "{selectedFile?.name}"? This action cannot be undone.
                </p>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      setShowDeleteDialog(false);
                      setSelectedFile(null);
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Container>
    </ErrorBoundary>
  );
};

export default Drive;
