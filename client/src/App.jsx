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

import React, { useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { ThemeProvider } from "./context/ThemeContext";
import store from "./redux/store";
import "./utils/suppressWarnings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import TaskDetails from "./pages/TaskDetails";
import TasksPage from "./pages/TaskPage";
import Notes from "./pages/Notes";
import Habits from "./pages/Habits";
import HabitDetails from "./pages/HabitDetails";
import TeamPage from "./pages/TeamPage";
import { Sidebar } from "./components/layout/navigation/Sidebar";
import { MobileSidebar } from "./components/layout/navigation/MobileSidebar";
import { Navbar } from "./components/layout/navigation/Navbar";
import { AuthLayout } from "./components/layout/AuthLayout";
import ToastConfig from "./components/shared/notifications/ToastConfig";
import WorkspaceProvider from "./components/workspace/provider/WorkspaceProvider";
import WorkspaceInitializer from "./components/workspace/provider/WorkspaceInitializer";
import { useGetPrivateWorkspacesQuery } from "./redux/slices/api/workspaceApiSlice";
import { useLastPosition } from "./hooks/useLastPosition";
import useWorkspaceRestoration from "./hooks/useWorkspaceRestoration";
import { useSelector, useDispatch } from "react-redux";
import { setCredentials } from "./redux/slices/authSlice";
import WorkspaceDashboard from "./pages/WorkspaceDashboard";
import WorkspaceCalendar from "./pages/WorkspaceCalendar";
import WorkspaceInvitation from "./pages/WorkspaceInvitation";
import InvitationsPage from "./pages/InvitationsPage";
import Trash from "./pages/Trash";
import Workspace from "./pages/Workspace";
import TeamRouteGuard from "./components/workspace/guards/TeamRouteGuard";
import WorkspaceTrash from "./components/workspace/management/WorkspaceTrash";
import WorkspaceSettingsPage from "./components/workspace/pages/WorkspaceSettingsPage";
import Chatbot from "./components/shared/Chatbot";
import Canvas from "./pages/FocusCanvas";
import LandingPage from "./pages/LandingPage";
import GoogleCallbackHandler from "./components/workspace/integrations/GoogleCallbackHandler";
import Drive from "./pages/Drive";

import PropTypes from "prop-types";

function DynamicDashboardRedirect() {
  const { workspaces, currentWorkspace } = useSelector((state) => state.workspace);
  const { privateWorkspace, isAuthenticated } = useSelector((state) => state.auth);
  const [hasWaited, setHasWaited] = React.useState(false);

  // Give the app a moment to initialize workspaces
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setHasWaited(true);
    }, 1000); // Wait 1 second for workspace initialization

    return () => clearTimeout(timer);
  }, []);

  // If we haven't waited yet, show loading
  if (!hasWaited && isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading workspace...</p>
        </div>
      </div>
    );
  }

  // If there's a current workspace set and it has a valid _id, redirect to its dashboard
  if (currentWorkspace && currentWorkspace._id && currentWorkspace._id !== 'undefined') {
    return <Navigate to={`/workspace/${currentWorkspace._id}/dashboard`} replace />;
  }

  // If we have a private workspace from auth state, use that
  if (privateWorkspace && privateWorkspace._id && privateWorkspace._id !== 'undefined') {
    return <Navigate to={`/workspace/${privateWorkspace._id}/dashboard`} replace />;
  }

  // If workspaces are loaded and we have at least one with a valid _id, redirect to the first workspace dashboard
  if (workspaces && workspaces.length > 0) {
    const firstWorkspace = workspaces.find(w => w && w._id && w._id !== 'undefined');
    if (firstWorkspace) {
      return <Navigate to={`/workspace/${firstWorkspace._id}/dashboard`} replace />;
    }
  }

  // If no valid workspaces yet, redirect to workspace index (which might show workspace creation)
  return <Navigate to="/workspace" replace />;
}

function RequireAuth({ children }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const invitationId = searchParams.get("invitation");

  useEffect(() => {
    // Save the attempted URL if not authenticated
    if (!isAuthenticated && location.pathname !== "/log-in") {
      sessionStorage.setItem(
        "redirectPath",
        location.pathname + location.search,
      );
    }
  }, [isAuthenticated, location]);

  if (!isAuthenticated || !user) {
    if (invitationId) {
      return (
        <Navigate
          to={`/workspace/invitation?invitation=${invitationId}`}
          state={{ from: location }}
          replace
        />
      );
    }
    return <Navigate to="/log-in" state={{ from: location }} replace />;
  }

  return children;
}

RequireAuth.propTypes = {
  children: PropTypes.node.isRequired,
};

function Layout() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { currentWorkspace, workspaces } = useSelector((state) => state.workspace);
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

  // Use both restoration hooks
  useLastPosition();
  useWorkspaceRestoration();

  useEffect(() => {
    // Handle post-login navigation
    const redirectPath = sessionStorage.getItem("redirectPath");
    if (redirectPath) {
      sessionStorage.removeItem("redirectPath");
      navigate(redirectPath, { replace: true });
    }
  }, [navigate]);

  // Handle undefined workspace ID in URL
  useEffect(() => {
    if (location.pathname.includes('/workspace/undefined')) {
      // If we have a current workspace, redirect to it
      if (currentWorkspace && currentWorkspace._id && currentWorkspace._id !== 'undefined') {
        navigate(`/workspace/${currentWorkspace._id}/dashboard`, { replace: true });
      }
      // If we have workspaces, redirect to the first one
      else if (workspaces && workspaces.length > 0) {
        const firstWorkspace = workspaces.find(w => w && w._id && w._id !== 'undefined');
        if (firstWorkspace) {
          navigate(`/workspace/${firstWorkspace._id}/dashboard`, { replace: true });
        }
      }
      // Otherwise redirect to workspace selection
      else {
        navigate('/workspace', { replace: true });
      }
    }
  }, [location.pathname, currentWorkspace, workspaces, navigate]);

  if (!isAuthenticated) {
    return <Navigate to="/log-in" state={{ from: location }} replace />;
  }

  return (
    <WorkspaceProvider>
      <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
        {/* Sidebar - Desktop (fixed position, no need for wrapper div) */}
        <Sidebar />

        {/* Mobile Sidebar */}
        <MobileSidebar
          isOpen={isMobileSidebarOpen}
          setIsOpen={setIsMobileSidebarOpen}
        />

        {/* Main Content - Pushes to the right on desktop via CSS variable margin */}
        <div className="flex flex-col flex-1 w-0 overflow-hidden lg:ml-[var(--sidebar-width)] transition-all duration-300 min-h-screen">
          <Navbar setSidebarOpen={setIsMobileSidebarOpen} />

          <main className={`relative flex-1 h-full focus:outline-none ${location.pathname.includes('/canvas') ? 'overflow-hidden' : 'overflow-y-auto'
            }`}>
            <div className="h-full">
              <Routes>
                {/* Dashboard and Profile Routes */}
                <Route index element={<DynamicDashboardRedirect />} />
                <Route path="/dashboard" element={<DynamicDashboardRedirect />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/invitations" element={<InvitationsPage />} />

                {/* Legacy Routes - Redirect to new format */}
                <Route path="/tasks">
                  <Route
                    path=":workspaceId/task/:taskId"
                    element={<TaskDetails />}
                  />
                  <Route
                    path=":workspaceId/dashboard"
                    element={
                      <Navigate
                        to={({ params }) =>
                          `/workspace/${params.workspaceId}/dashboard`
                        }
                        replace
                      />
                    }
                  />
                  <Route
                    path=":workspaceId/*"
                    element={
                      <Navigate
                        to={(location) =>
                          `/workspace${location.pathname.replace("/tasks", "")}`
                        }
                        replace
                      />
                    }
                  />
                  <Route index element={<Navigate to="/workspace" replace />} />
                </Route>

                {/* Habit Routes */}
                <Route path="/habits" element={<Habits />} />
                <Route path="/habit/:habitId" element={<HabitDetails />} />

                {/* Workspace Routes */}
                <Route path="/workspace">
                  <Route index element={<WorkspaceDashboard />} />
                  {/* Handle undefined workspace ID case */}
                  <Route path="undefined/*" element={<DynamicDashboardRedirect />} />
                  <Route path=":workspaceId">
                    <Route index element={<WorkspaceDashboard />} />
                    <Route path="dashboard" element={<WorkspaceDashboard />} />
                    <Route path="overview" element={<Workspace />} />
                    <Route path="tasks" element={<TasksPage />} />
                    <Route path="task/:taskId" element={<TaskDetails />} />
                    <Route path="notes" element={<Notes />} />
                    <Route path="habits" element={<Habits />} />
                    <Route path="habit/:habitId" element={<HabitDetails />} />
                    <Route path="canvas" element={<Canvas />} />
                    <Route path="calendar" element={<WorkspaceCalendar />} />
                    <Route path="drive" element={<Drive />} />
                    <Route
                      path="team"
                      element={
                        <TeamRouteGuard>
                          <TeamPage />
                        </TeamRouteGuard>
                      }
                    />
                    <Route path="trash" element={<Trash />} />
                    <Route
                      path="settings"
                      element={<WorkspaceSettingsPage />}
                    />
                  </Route>
                </Route>

                {/* Catch-all route */}
                <Route
                  path="*"
                  element={<Navigate to="/dashboard" replace />}
                />
              </Routes>
            </div>
          </main>
        </div>
        <Chatbot />
      </div>
    </WorkspaceProvider>
  );
}

function RootRoute() {
  const { isAuthenticated, user, token } = useSelector((state) => state.auth);
  const { currentWorkspace, workspaces } = useSelector((state) => state.workspace);
  const [isValidating, setIsValidating] = React.useState(true);
  const dispatch = useDispatch();

  // Validate token on component mount
  React.useEffect(() => {
    const validateSession = async () => {
      // If we have token and user data from localStorage, verify it's still valid
      if (token && isAuthenticated && user) {
        try {
          // Make a quick API call to validate the session
          const response = await fetch('/api/auth/profile', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            // Session is valid, proceed
            setIsValidating(false);
            return;
          } else {
            // Token is invalid or expired, clear auth state
            dispatch(setCredentials(null));
          }
        } catch (error) {
          // Network error or other issues, clear auth state
          console.log('Session validation failed:', error.message);
          dispatch(setCredentials(null));
        }
      }

      // If no token, not authenticated, or validation failed
      setIsValidating(false);
    };

    // Add a small delay to prevent flash
    const timer = setTimeout(validateSession, 100);
    return () => clearTimeout(timer);
  }, [token, isAuthenticated, user, dispatch]);

  // Show loading while validating session
  if (isValidating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Checking session...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated and verified, redirect to dashboard
  if (isAuthenticated && user) {
    // If we have a current workspace with valid ID, redirect to it
    if (currentWorkspace && currentWorkspace._id && currentWorkspace._id !== 'undefined') {
      return <Navigate to={`/workspace/${currentWorkspace._id}/dashboard`} replace />;
    }

    // If we have workspaces available, redirect to the first valid one
    if (workspaces && workspaces.length > 0) {
      const firstWorkspace = workspaces.find(w => w && w._id && w._id !== 'undefined');
      if (firstWorkspace) {
        return <Navigate to={`/workspace/${firstWorkspace._id}/dashboard`} replace />;
      }
    }

    // Fallback to general dashboard redirect which will handle workspace initialization
    return <Navigate to="/dashboard" replace />;
  }

  // If not authenticated, show landing page
  return <LandingPage />;
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <main className="w-full min-h-screen bg-[#f3f4f6] dark:bg-gray-900">
          <Routes>
            {/* Auth routes with AuthLayout */}
            <Route element={<AuthLayout />}>
              <Route path="/log-in" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/signup" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Route>

            {/* Workspace invitation route */}
            <Route
              path="/workspace/invitation"
              element={<WorkspaceInvitation />}
            />

            {/* Google OAuth callback route */}
            <Route
              path="/google/callback"
              element={<GoogleCallbackHandler />}
            />

            {/* Root route with session check */}
            <Route path="/" element={<RootRoute />} />

            {/* Protected routes with main Layout */}
            <Route
              path="/*"
              element={
                <RequireAuth>
                  <WorkspaceInitializer />
                  <Layout />
                </RequireAuth>
              }
            />

            {/* Workspace trash route */}
            <Route
              path="/workspaces/trash"
              element={
                <RequireAuth>
                  <WorkspaceTrash />
                </RequireAuth>
              }
            />
          </Routes>
          <ToastConfig />
        </main>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
