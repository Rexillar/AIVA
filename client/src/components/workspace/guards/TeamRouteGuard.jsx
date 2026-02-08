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
