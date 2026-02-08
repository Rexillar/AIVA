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

   ⟁  PURPOSE      : Implement complete page views and layouts

   ⟁  WHY          : Organized application navigation and structure

   ⟁  WHAT         : Full page React components with routing

   ⟁  TECH STACK   : React • Redux • Vite
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : MEDIUM
   ⟁  DOCS : /docs/frontend/pages.md

   ⟁  USAGE RULES  : Manage routing • Handle data • User experience

        "Pages rendered. Navigation smooth. User journey optimized."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/
 
import React from "react";
import { useSelector } from "react-redux";
import {
  useGetWorkspaceInvitationsQuery,
  useHandleInvitationMutation,
} from "../redux/slices/api/workspaceApiSlice";
import { LoadingSpinner } from "../components/shared/feedback/LoadingSpinner";
import { toast } from "sonner";
import { format } from "date-fns";

const InvitationCard = ({ invitation, onAccept, onReject, isProcessing }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {invitation.workspace?.name || "Workspace"}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Invited by: {invitation.invitedBy?.name || "Unknown"}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Role: {invitation.role}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Invited on: {format(new Date(invitation.invitedAt), "PPP")}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onAccept(invitation._id)}
            disabled={isProcessing}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            Accept
          </button>
          <button
            onClick={() => onReject(invitation._id)}
            disabled={isProcessing}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

const InvitationsPage = () => {
  const { data, isLoading, error, refetch } = useGetWorkspaceInvitationsQuery();
  const [handleInvitation, { isLoading: isProcessing }] =
    useHandleInvitationMutation();

  // Extract invitations array from the response data
  const invitations = React.useMemo(() => {
    if (!data) return [];

    // Handle response with status and data structure
    if (data.status && data.data) {
      return Array.isArray(data.data) ? data.data : [];
    }

    // Handle direct array response
    if (Array.isArray(data)) {
      return data;
    }

    return [];
  }, [data]);

  const handleAccept = async (invitationId) => {
    try {
      await handleInvitation({
        invitationId,
        action: "accept",
      }).unwrap();
      toast.success("Invitation accepted successfully");
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to accept invitation");
    }
  };

  const handleReject = async (invitationId) => {
    try {
      await handleInvitation({
        invitationId,
        action: "reject",
      }).unwrap();
      toast.success("Invitation rejected successfully");
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to reject invitation");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <p className="text-red-600 dark:text-red-400">
            {error?.data?.message || "Failed to load invitations"}
          </p>
          <button
            onClick={refetch}
            className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Workspace Invitations
        </h1>

        {invitations.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No pending invitations
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {invitations.map((invitation) => (
              <InvitationCard
                key={invitation._id}
                invitation={invitation}
                onAccept={handleAccept}
                onReject={handleReject}
                isProcessing={isProcessing}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvitationsPage;
