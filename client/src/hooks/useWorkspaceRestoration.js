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
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { setCurrentWorkspace } from "../redux/slices/workspaceSlice";

const WORKSPACE_STORAGE_KEY = "aiva_current_workspace";
const LAST_PATH_KEY = "aiva_last_path";

function useWorkspaceRestoration() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { currentWorkspace, workspaces } = useSelector(
    (state) => state.workspace,
  );

  // Save current path and workspace
  useEffect(() => {
    if (isAuthenticated && location.pathname !== "/log-in") {
      const pathParts = location.pathname.split("/");
      const workspaceId = pathParts.find(
        (part, index) =>
          pathParts[index - 1] === "workspace" ||
          pathParts[index - 1] === "tasks",
      );

      if (workspaceId) {
        // Save current path
        localStorage.setItem(
          LAST_PATH_KEY,
          JSON.stringify({
            path: location.pathname,
            workspaceId,
            timestamp: Date.now(),
          }),
        );

        // If we have a workspace ID but no current workspace, try to set it
        if (!currentWorkspace || currentWorkspace._id !== workspaceId) {
          const workspace = workspaces.find((w) => w._id === workspaceId);
          if (workspace) {
            dispatch(setCurrentWorkspace(workspace));
            localStorage.setItem(
              WORKSPACE_STORAGE_KEY,
              JSON.stringify({
                workspace,
                timestamp: Date.now(),
              }),
            );
          }
        }
      }
    }
  }, [
    location.pathname,
    isAuthenticated,
    currentWorkspace,
    workspaces,
    dispatch,
  ]);

  // Restore workspace and path on mount
  useEffect(() => {
    if (
      isAuthenticated &&
      (!currentWorkspace ||
        location.pathname === "/" ||
        location.pathname === "/dashboard")
    ) {
      try {
        // Try to restore last path first
        const savedPath = localStorage.getItem(LAST_PATH_KEY);
        if (savedPath) {
          const { path, workspaceId, timestamp } = JSON.parse(savedPath);
          const isPathValid = Date.now() - timestamp < 24 * 60 * 60 * 1000;

          if (isPathValid) {
            // If we have workspaces but no current workspace, try to set it
            if (workspaces.length > 0 && !currentWorkspace) {
              const workspace = workspaces.find((w) => w._id === workspaceId);
              if (workspace) {
                dispatch(setCurrentWorkspace(workspace));
                localStorage.setItem(
                  WORKSPACE_STORAGE_KEY,
                  JSON.stringify({
                    workspace,
                    timestamp: Date.now(),
                  }),
                );
              }
            }

            // Navigate to the saved path
            if (path && path !== "/") {
              // console.log('Restoring last path:', path);
              navigate(path, { replace: true });
              return;
            }
          } else {
            localStorage.removeItem(LAST_PATH_KEY);
          }
        }

        // If no valid path found, try to restore just the workspace
        const savedWorkspace = localStorage.getItem(WORKSPACE_STORAGE_KEY);
        if (savedWorkspace && !currentWorkspace) {
          const { workspace, timestamp } = JSON.parse(savedWorkspace);
          const isWorkspaceValid = Date.now() - timestamp < 24 * 60 * 60 * 1000;

          if (isWorkspaceValid && workspace) {
            // Verify the workspace still exists in our list
            const existingWorkspace = workspaces.find(
              (w) => w._id === workspace._id,
            );
            if (existingWorkspace) {
              dispatch(setCurrentWorkspace(existingWorkspace));
              // Navigate to the workspace dashboard
              navigate(`/workspace/${existingWorkspace._id}/dashboard`, {
                replace: true,
              });
            }
          } else {
            localStorage.removeItem(WORKSPACE_STORAGE_KEY);
          }
        }
      } catch (error) {
        //console.error('Error restoring workspace state:', error);
        localStorage.removeItem(WORKSPACE_STORAGE_KEY);
        localStorage.removeItem(LAST_PATH_KEY);
      }
    }
  }, [
    isAuthenticated,
    currentWorkspace,
    workspaces,
    location.pathname,
    navigate,
    dispatch,
  ]);

  // Cleanup invalid states
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.removeItem(WORKSPACE_STORAGE_KEY);
      localStorage.removeItem(LAST_PATH_KEY);
    }
  }, [isAuthenticated]);
}

export default useWorkspaceRestoration;
