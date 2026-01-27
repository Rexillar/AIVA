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
import { useNavigate } from "react-router-dom";
import {
  useGetPendingInvitationsQuery,
  useHandleInvitationMutation,
} from "../../../redux/slices/api/workspaceApiSlice";
import { LoadingSpinner } from "../../shared/feedback/LoadingSpinner";
import { GlobeAltIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";

const WorkspaceInvitations = () => {
  const navigate = useNavigate();
  const {
    data: invitations = [],
    isLoading,
    error,
  } = useGetPendingInvitationsQuery();
  const [handleInvitation, { isLoading: isProcessing }] =
    useHandleInvitationMutation();

  const handleInvitationAction = async (invitationId, workspaceId, action) => {
    try {
      const result = await handleInvitation({
        invitationId,
        workspaceId,
        action,
      }).unwrap();
      if (result.status) {
        toast.success(`Invitation ${action}ed successfully`);
        if (action === "accept" && result.data?.workspace) {
          // Wait for store updates to complete
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Navigate to the workspace
          navigate(`/workspace/${workspaceId}`, {
            replace: true, // Replace current history entry
            state: { workspace: result.data.workspace },
          });
        }
      } else {
        toast.error(result.message || `Failed to ${action} invitation`);
      }
    } catch (error) {
      //console.error(`Error ${action}ing invitation:`, error);
      toast.error(error?.data?.message || `Failed to ${action} invitation`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500 dark:text-red-400">
          {error.data?.message || "Failed to load invitations"}
        </p>
      </div>
    );
  }

  if (!Array.isArray(invitations) || invitations.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Workspace Invitations
        </h2>
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <UserGroupIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            No pending workspace invitations
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Workspace Invitations
        </h2>
        <div className="space-y-4">
          {invitations.map((invitation) => (
            <div
              key={invitation._id}
              className="border dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <GlobeAltIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {invitation.workspace?.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {invitation.workspace?.description || "No description"}
                    </p>
                    <div className="mt-2 flex items-center space-x-4">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Invited by: {invitation.invitedBy?.name}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Role: {invitation.role}
                      </span>
                      {invitation.tier && (
                        <span className="text-sm text-blue-500 dark:text-blue-400">
                          Tier: {invitation.tier}
                        </span>
                      )}
                    </div>
                    {invitation.perks && invitation.perks.length > 0 && (
                      <div className="mt-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Perks: {invitation.perks.join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() =>
                      handleInvitationAction(
                        invitation._id,
                        invitation.workspace._id,
                        "accept",
                      )
                    }
                    disabled={isProcessing}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() =>
                      handleInvitationAction(
                        invitation._id,
                        invitation.workspace._id,
                        "reject",
                      )
                    }
                    disabled={isProcessing}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkspaceInvitations;
