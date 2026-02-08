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

import React, { createContext, useContext, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  useGetWorkspaceQuery,
  useGetPrivateWorkspaceQuery,
} from "../../../redux/slices/api/workspaceApiSlice";
import {
  setCurrentWorkspace,
  setWorkspaceError,
} from "../../../redux/slices/workspaceSlice";
import { LoadingSpinner } from "../../shared/feedback/LoadingSpinner";
import { ErrorMessage } from "../../shared/feedback/ErrorMessage";
import { toast } from "sonner";

const WorkspaceContext = createContext();

// Define public routes that don't need workspace
const PUBLIC_ROUTES = [
  "/create-workspace",
  "/log-in",
  "/register",
  "/forgot-password",
  "/reset-password",
];

export const useWorkspace = () => { // eslint-disable-line react-refresh/only-export-components
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
};

const WorkspaceProvider = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { workspaceId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const { currentWorkspace, workspaces } = useSelector(
    (state) => state.workspace,
  );

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    location.pathname.startsWith(route),
  );

  // Get workspace details if we have a workspaceId
  const {
    data: workspaceData,
    error: workspaceError,
    isLoading: isWorkspaceLoading,
    refetch: refetchWorkspace,
  } = useGetWorkspaceQuery(workspaceId, {
    skip: !workspaceId || isPublicRoute,
  });

  // Get private workspace for initialization
  const {
    data: privateWorkspace,
    error: privateError,
    isLoading: isPrivateLoading,
    refetch: refetchPrivate,
  } = useGetPrivateWorkspaceQuery(undefined, {
    skip: !user?._id || isPublicRoute,
    pollingInterval: 60000,
  });

  useEffect(() => {
    if (workspaceData) {
      // Check if user has access to this workspace (temporarily remove isDeleted check)
      const hasAccess =
        workspaceData.members?.some(
          (member) =>
            member.user._id === user?._id || member.user === user?._id,
        ) || workspaceData.owner === user?._id;

      if (!hasAccess) {
        toast.error("You do not have access to this workspace");
        navigate("/dashboard");
        return;
      }

      //console.log('Setting workspace data:', workspaceData); // Debug log
      dispatch(setCurrentWorkspace(workspaceData));
    }
  }, [workspaceData, dispatch, user, navigate]);

  useEffect(() => {
    if (privateWorkspace && !currentWorkspace) {
      //console.log('Setting private workspace:', privateWorkspace); // Debug log
      dispatch(setCurrentWorkspace(privateWorkspace));
    }
  }, [privateWorkspace, currentWorkspace, dispatch]);

  useEffect(() => {
    // If we have workspaces but no current workspace, set the first one as current
    if (!currentWorkspace && workspaces.length > 0) {
      //console.log('Setting first workspace:', workspaces[0]); // Debug log
      dispatch(setCurrentWorkspace(workspaces[0]));
    }
  }, [workspaces, currentWorkspace, dispatch]);

  useEffect(() => {
    const handleError = async () => {
      if ((workspaceError || privateError) && !isPublicRoute) {
        // Handle token validation errors
        if (
          workspaceError?.status === 401 ||
          privateError?.status === 401 ||
          ((workspaceError?.data?.message || privateError?.data?.message) &&
            (workspaceError?.data?.message?.toLowerCase().includes("token") ||
              privateError?.data?.message?.toLowerCase().includes("token")))
        ) {
          navigate("/log-in", { replace: true });
          return;
        }

        // Handle 404 errors
        if (workspaceError?.status === 404 || privateError?.status === 404) {
          if (workspaceId) {
            // Try to refetch the workspace data
            try {
              await refetchWorkspace();
            } catch (error) {
              if (location.pathname !== "/create-workspace") {
                navigate("/create-workspace", { replace: true });
              }
            }
          } else if (location.pathname !== "/create-workspace") {
            navigate("/create-workspace", { replace: true });
          }
          return;
        }

        // Handle permission errors
        if (workspaceError?.status === 403 || privateError?.status === 403) {
          if (!location.pathname.startsWith("/login")) {
            navigate("/log-in", { replace: true });
          }
          return;
        }

        dispatch(setWorkspaceError(workspaceError || privateError));
      }
    };

    handleError();
  }, [
    workspaceError,
    privateError,
    dispatch,
    navigate,
    location.pathname,
    isPublicRoute,
    workspaceId,
    refetchWorkspace,
  ]);

  const value = {
    workspace: (() => {
      const workspace = currentWorkspace || workspaceData || privateWorkspace;
      // Only return workspace if it has a valid ID
      return workspace && workspace._id && workspace._id !== 'undefined' ? workspace : null;
    })(),
    isLoading: isWorkspaceLoading || isPrivateLoading,
    error: workspaceError || privateError,
    refetch: async () => {
      if (workspaceId) {
        await refetchWorkspace();
      } else {
        await refetchPrivate();
      }
    },
  };

  // Don't show loading state on public routes
  if ((isWorkspaceLoading || isPrivateLoading) && !isPublicRoute) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Only show error state for non-404 errors on protected routes
  if (
    (workspaceError || privateError) &&
    !isPublicRoute &&
    workspaceError?.status !== 404 &&
    privateError?.status !== 404
  ) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <ErrorMessage
          message="Failed to load workspace"
          details={
            (workspaceError || privateError)?.data?.message ||
            "Please try again later"
          }
        />
        <button
          className="mt-4 px-6 py-2 text-blue-500 hover:text-blue-600 rounded border border-blue-500 hover:border-blue-600"
          onClick={() => value.refetch()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export default WorkspaceProvider;
