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

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAuthUrl,
  fetchAccounts,
  updateAccountSettings,
  disconnectAccount,
  triggerSync,
  clearMessages,
} from '../../../slices/googleIntegrationSlice';
import { toast } from 'sonner';
import {
  PlusIcon,
  TrashIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

const GoogleAccountManager = ({ workspaceId }) => {
  const dispatch = useDispatch();
  const { accounts, loading, syncing, error, success, authUrl } = useSelector(
    (state) => state.googleIntegration
  );
  const [expandedAccount, setExpandedAccount] = useState(null);

  // Debug: Log accounts whenever they change
  useEffect(() => {
    console.log('GoogleAccountManager - Accounts updated:', accounts);
  }, [accounts]);

  useEffect(() => {
    if (workspaceId) {
      dispatch(fetchAccounts(workspaceId));
    }
  }, [workspaceId, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearMessages());
    }
    if (success) {
      toast.success(success);
      dispatch(clearMessages());
    }
  }, [error, success, dispatch]);

  useEffect(() => {
    if (authUrl) {
      const popup = window.open(authUrl, '_blank', 'width=600,height=800');

      // Listen for OAuth callback
      const handleMessage = (event) => {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
          toast.success(`Connected ${event.data.account.email}`);
          dispatch(fetchAccounts(workspaceId));
          if (popup && !popup.closed) popup.close();
        } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
          toast.error(event.data.error || 'Failed to connect account');
          if (popup && !popup.closed) popup.close();
        }
      };

      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }
  }, [authUrl, dispatch, workspaceId]);

  const handleConnectAccount = async () => {
    try {
      await dispatch(
        getAuthUrl({
          workspaceId,
          scopes: ['calendar', 'tasks', 'meet', 'drive', 'sheets', 'gmail'],
        })
      ).unwrap();
    } catch (err) {
      toast.error('Failed to initiate Google connection');
    }
  };

  const handleDisconnect = async (accountId) => {
    if (
      !window.confirm(
        'Are you sure? This will remove all synced events and tasks from this account.'
      )
    ) {
      return;
    }

    try {
      await dispatch(disconnectAccount({ workspaceId, accountId })).unwrap();
      dispatch(fetchAccounts(workspaceId));
    } catch (err) {
      toast.error('Failed to disconnect account');
    }
  };

  const handleSync = async (accountId) => {
    try {
      await dispatch(
        triggerSync({ workspaceId, accountId, syncType: 'both' })
      ).unwrap();
      toast.success('Sync completed successfully');
      dispatch(fetchAccounts(workspaceId));
    } catch (err) {
      toast.error('Sync failed');
    }
  };

  const handleToggleSetting = async (accountId, settingPath, value) => {
    const account = accounts.find((acc) => acc.accountId === accountId);
    if (!account) return;

    const [category, key] = settingPath.split('.');
    const updatedSettings = {
      ...account.syncSettings,
      [category]: {
        ...account.syncSettings[category],
        [key]: value,
      },
    };

    try {
      await dispatch(
        updateAccountSettings({
          workspaceId,
          accountId,
          syncSettings: updatedSettings,
        })
      ).unwrap();
      dispatch(fetchAccounts(workspaceId));
    } catch (err) {
      toast.error('Failed to update settings');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'expired':
        return <ExclamationCircleIcon className="h-5 w-5 text-yellow-500" />;
      case 'revoked':
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'expired':
        return 'Token Expired';
      case 'revoked':
        return 'Revoked';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Google Integration
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Connect Google accounts to sync Calendar, Tasks, and Meet
          </p>
        </div>
        <button
          onClick={handleConnectAccount}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Connect Google Account
        </button>
      </div>

      {/* Accounts List */}
      {accounts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No Google accounts connected
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Connect a Google account to start syncing your calendar and tasks
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {accounts.map((account) => {
            // Debug: log account data
            console.log('Account data:', {
              email: account.email,
              displayName: account.displayName,
              profilePicture: account.profilePicture
            });

            // Create proxied image URL to bypass CORS
            const API_URL = import.meta.env.VITE_API_URL || '/api';
            const imageUrl = account.profilePicture
              ? `${API_URL}/google/proxy-image?url=${encodeURIComponent(account.profilePicture)}`
              : null;

            return (
              <div
                key={account.accountId}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
              >
                {/* Account Header */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative h-10 w-10 flex-shrink-0">
                      {imageUrl && (
                        <img
                          src={imageUrl}
                          alt={account.displayName || account.email}
                          className="h-10 w-10 rounded-full object-cover border-2 border-blue-500"
                          onError={(e) => {
                            console.log('Image failed, showing fallback for:', account.email);
                            e.target.style.display = 'none';
                            const fallback = e.target.nextElementSibling;
                            if (fallback) {
                              fallback.style.display = 'flex';
                            }
                          }}
                          onLoad={() => {
                            console.log('Successfully loaded profile picture for:', account.email);
                          }}
                        />
                      )}
                      <div
                        className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 items-center justify-center"
                        style={{ display: imageUrl ? 'none' : 'flex' }}
                      >
                        <span className="text-blue-600 dark:text-blue-400 font-medium text-base">
                          {(account.displayName?.charAt(0) || account.email?.charAt(0) || 'G').toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {account.displayName || account.email}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {account.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      {getStatusIcon(account.status)}
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {getStatusText(account.status)}
                      </span>
                    </div>

                    {/* Actions */}
                    <button
                      onClick={() => handleSync(account.accountId)}
                      disabled={
                        syncing[account.accountId] || account.status !== 'active'
                      }
                      className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Sync now"
                    >
                      <ArrowPathIcon
                        className={`h-5 w-5 ${syncing[account.accountId] ? 'animate-spin' : ''}`}
                      />
                    </button>

                    <button
                      onClick={() =>
                        setExpandedAccount(
                          expandedAccount === account.accountId
                            ? null
                            : account.accountId
                        )
                      }
                      className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      <svg
                        className={`h-5 w-5 transition-transform ${expandedAccount === account.accountId ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    <button
                      onClick={() => handleDisconnect(account.accountId)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      title="Disconnect"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Expanded Settings */}
                {expandedAccount === account.accountId && (
                  <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700/50 space-y-4">
                    {/* Calendar Settings */}
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-3">
                        Calendar Sync
                      </h5>
                      <div className="space-y-2">
                        <label className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Enable calendar sync
                          </span>
                          <input
                            type="checkbox"
                            checked={account.syncSettings?.calendar?.enabled}
                            onChange={(e) =>
                              handleToggleSetting(
                                account.accountId,
                                'calendar.enabled',
                                e.target.checked
                              )
                            }
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </label>
                        {account.syncSettings?.calendar?.enabled && (
                          <>
                            <label className="flex items-center justify-between">
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                Sync direction
                              </span>
                              <select
                                value={
                                  account.syncSettings?.calendar?.syncDirection
                                }
                                onChange={(e) =>
                                  handleToggleSetting(
                                    account.accountId,
                                    'calendar.syncDirection',
                                    e.target.value
                                  )
                                }
                                className="text-sm rounded border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              >
                                <option value="read-only">Read-only</option>
                                <option value="bidirectional">
                                  Bidirectional
                                </option>
                              </select>
                            </label>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                Color:
                              </span>
                              <input
                                type="color"
                                value={
                                  account.syncSettings?.calendar?.colorCode ||
                                  '#4285F4'
                                }
                                onChange={(e) =>
                                  handleToggleSetting(
                                    account.accountId,
                                    'calendar.colorCode',
                                    e.target.value
                                  )
                                }
                                className="h-8 w-16 rounded border-gray-300 cursor-pointer"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Tasks Settings */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <h5 className="font-medium text-gray-900 dark:text-white mb-3">
                        Tasks Sync
                      </h5>
                      <div className="space-y-2">
                        <label className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Enable tasks sync
                          </span>
                          <input
                            type="checkbox"
                            checked={account.syncSettings?.tasks?.enabled}
                            onChange={(e) =>
                              handleToggleSetting(
                                account.accountId,
                                'tasks.enabled',
                                e.target.checked
                              )
                            }
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </label>
                        {account.syncSettings?.tasks?.enabled && (
                          <label className="flex items-center justify-between">
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              Show in AIVA task list
                            </span>
                            <input
                              type="checkbox"
                              checked={account.syncSettings?.tasks?.showInAIVA}
                              onChange={(e) =>
                                handleToggleSetting(
                                  account.accountId,
                                  'tasks.showInAIVA',
                                  e.target.checked
                                )
                              }
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Meet Settings */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <h5 className="font-medium text-gray-900 dark:text-white mb-3">
                        Google Meet
                      </h5>
                      <div className="space-y-2">
                        <label className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Detect Meet links
                          </span>
                          <input
                            type="checkbox"
                            checked={account.syncSettings?.meet?.enabled}
                            onChange={(e) =>
                              handleToggleSetting(
                                account.accountId,
                                'meet.enabled',
                                e.target.checked
                              )
                            }
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Drive Settings */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <h5 className="font-medium text-gray-900 dark:text-white mb-3">
                        Google Drive
                      </h5>
                      <div className="space-y-2">
                        <label className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Enable Drive access
                          </span>
                          <input
                            type="checkbox"
                            checked={account.syncSettings?.drive?.enabled !== false}
                            onChange={(e) =>
                              handleToggleSetting(
                                account.accountId,
                                'drive.enabled',
                                e.target.checked
                              )
                            }
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </label>
                        {(account.syncSettings?.drive?.enabled !== false) && (
                          <>
                            <label className="flex items-center justify-between">
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                Share with workspace members
                              </span>
                              <input
                                type="checkbox"
                                checked={account.syncSettings?.drive?.shareWithWorkspace}
                                onChange={(e) =>
                                  handleToggleSetting(
                                    account.accountId,
                                    'drive.shareWithWorkspace',
                                    e.target.checked
                                  )
                                }
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                            </label>
                            <label className="flex items-center justify-between">
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                Auto-sync to workspace folder
                              </span>
                              <input
                                type="checkbox"
                                checked={account.syncSettings?.drive?.autoSync}
                                onChange={(e) =>
                                  handleToggleSetting(
                                    account.accountId,
                                    'drive.autoSync',
                                    e.target.checked
                                  )
                                }
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                            </label>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Last Sync */}
                    {account.lastSync && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 pt-2">
                        Last synced: {new Date(account.lastSync).toLocaleString()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GoogleAccountManager;
