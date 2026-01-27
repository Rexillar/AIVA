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

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  useGetPrivateWorkspacesQuery,
  useGetPrivateWorkspaceQuery 
} from "../../../redux/slices/api/workspaceApiSlice";
import { setPrivateWorkspace } from "../../../redux/slices/authSlice";
import { setCurrentWorkspace } from "../../../redux/slices/workspaceSlice";
import { LoadingSpinner } from "../../shared/feedback/LoadingSpinner";

const WorkspaceInitializer = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { currentWorkspace } = useSelector((state) => state.workspace);

  // Get private workspaces
  const { data: privateWorkspaces, error: privateWorkspacesError, isLoading: isLoadingWorkspaces } = useGetPrivateWorkspacesQuery(undefined, {
    skip: !user?._id,
  });

  // Get private workspace (single)
  const { data: privateWorkspace, error: privateWorkspaceError, isLoading: isLoadingWorkspace } = useGetPrivateWorkspaceQuery(undefined, {
    skip: !user?._id,
  });

  useEffect(() => {
    // Try to set workspace from private workspace first
    if (privateWorkspace && privateWorkspace._id && privateWorkspace._id !== 'undefined' && !currentWorkspace) {
      dispatch(setCurrentWorkspace(privateWorkspace));
      dispatch(setPrivateWorkspace(privateWorkspace));
      return;
    }

    // Fallback to private workspaces array
    if (privateWorkspaces && Array.isArray(privateWorkspaces) && privateWorkspaces.length > 0) {
      const validWorkspace = privateWorkspaces.find(ws => ws && ws._id && ws._id !== 'undefined');
      if (validWorkspace && !currentWorkspace) {
        dispatch(setCurrentWorkspace(validWorkspace));
        dispatch(setPrivateWorkspace(validWorkspace));
      }
    }
  }, [privateWorkspace, privateWorkspaces, dispatch, currentWorkspace]);

  if (isLoadingWorkspaces || isLoadingWorkspace) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (privateWorkspacesError && privateWorkspaceError) {
    // Both queries failed, but don't show error UI - let the app handle it
    return null;
  }

  return null;
};

export default WorkspaceInitializer;
