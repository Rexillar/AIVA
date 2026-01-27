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
   ⟁  DOMAIN       : UNKNOWN

   ⟁  PURPOSE      : Provide specific functionality and operations

   ⟁  WHY          : Modular code organization and reusability

   ⟁  WHAT         : Function-based utilities and operations

   ⟁  TECH STACK   : React • Redux • Vite
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : UNKNOWN
   ⟁  DOCS : /docs/frontend/components.md

   ⟁  USAGE RULES  : UNKNOWN

        "Functions implemented. Operations executed. Results delivered."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams, useLocation } from "react-router-dom";

export function useTaskListState() {
  const { workspaceId } = useParams();
  const location = useLocation();
  const { currentWorkspace, workspaces } = useSelector(
    (state) => state.workspace,
  );
  const { privateWorkspace } = useSelector((state) => state.auth);

  // Get workspace ID from either params or current workspace
  const effectiveWorkspaceId = workspaceId || currentWorkspace?._id;

  // Determine workspace type and visibility
  const workspace =
    workspaces.find((w) => w._id === effectiveWorkspaceId) || currentWorkspace;
  const isPrivate = workspace?._id === privateWorkspace?._id;
  const workspaceType = isPrivate ? "private" : "team";
  const workspaceVisibility = workspace?.visibility || "private";

  // Log state for debugging
  useEffect(() => {
    // console.log('TaskList - Current State:', {
    //   workspace,
    //   workspaceId: effectiveWorkspaceId,
    //   isWorkspaceLoading: !workspace,
    //   workspaceType,
    //   workspaceVisibility,
    //   currentPath: location.pathname
    // });
  }, [
    workspace,
    effectiveWorkspaceId,
    workspaceType,
    workspaceVisibility,
    location.pathname,
  ]);

  return {
    workspace,
    workspaceId: effectiveWorkspaceId,
    isWorkspaceLoading: !workspace,
    workspaceType,
    workspaceVisibility,
    isPrivateWorkspace: isPrivate,
  };
}
