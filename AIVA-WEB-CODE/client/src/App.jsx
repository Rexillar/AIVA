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
import { useSelector } from "react-redux";
import WorkspaceDashboard from "./pages/WorkspaceDashboard";
import WorkspaceCalendar from "./pages/WorkspaceCalendar";
import WorkspaceInvitation from "./pages/WorkspaceInvitation";
import InvitationsPage from "./pages/InvitationsPage";
import Trash from "./pages/Trash";
import Workspace from "./pages/Workspace";
import TeamRouteGuard from "./components/workspace/guards/TeamRouteGuard";
import WorkspaceTrash from "./components/workspace/management/WorkspaceTrash";
import WorkspaceSettingsPage from "./components/workspace/pages/WorkspaceSettingsPage";
import Chatbot from "./components/shared/Chatbot"; // Added import
import RewardsNotification from "./components/gamification/RewardsNotification";
import Canvas from "./pages/FocusCanvas";
import LandingPage from "./pages/LandingPage";

import PropTypes from "prop-types";

function DynamicDashboardRedirect() {
  const { workspaces, currentWorkspace } = useSelector((state) => state.workspace);

  // If there's a current workspace set, redirect to its dashboard
  if (currentWorkspace && currentWorkspace._id) {
    return <Navigate to={`/workspace/${currentWorkspace._id}/dashboard`} replace />;
  }

  // If workspaces are loaded and we have at least one, redirect to the first workspace dashboard
  if (workspaces && workspaces.length > 0) {
    const firstWorkspace = workspaces[0];
    return <Navigate to={`/workspace/${firstWorkspace._id}/dashboard`} replace />;
  }

  // If no workspaces yet, redirect to workspace index (which might show workspace creation)
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

          <main className="relative overflow-y-auto focus:outline-none">
            <div >
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

            {/* Landing page route */}
            <Route path="/" element={<LandingPage />} />

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
          <RewardsNotification />
        </main>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
