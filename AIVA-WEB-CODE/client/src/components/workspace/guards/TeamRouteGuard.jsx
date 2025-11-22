import React from "react";
import { Navigate, useParams } from "react-router-dom";
import { useWorkspace } from "../provider/WorkspaceProvider";
import { toast } from "sonner";

const TeamRouteGuard = ({ children }) => {
  const { workspaceId } = useParams();
  const { workspace } = useWorkspace();

  // Check for invalid workspace ID format (should be a 24-character hex string)
  if (!workspaceId?.match(/^[0-9a-fA-F]{24}$/)) {
    toast.error("Invalid workspace ID. Redirecting to dashboard...");
    return <Navigate to="/dashboard" replace />;
  }

  // Check if workspace exists
  if (!workspace) {
    toast.error("Workspace not found. Redirecting to dashboard...");
    return <Navigate to="/dashboard" replace />;
  }

  // Check if it's a private workspace (check both type and visibility)
  if (
    workspace.type === "PrivateWorkspace" ||
    workspace.visibility === "private"
  ) {
    toast.error("Team feature is only available in public workspaces");
    return <Navigate to={`/workspace/${workspace._id}/dashboard`} replace />;
  }

  return children;
};

export default TeamRouteGuard;
