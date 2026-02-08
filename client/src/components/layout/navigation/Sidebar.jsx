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

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  FaChevronDown,
  FaChevronUp,
  FaChevronLeft,
  FaChevronRight,
  FaHome,
  FaUsers,
  FaPlus,
  FaTasks,
  FaCalendar,
  FaStickyNote,
  FaTrash,
  FaEdit,
  FaCog,
  FaCheckCircle,
  FaBars,
  FaTimes,
  FaPaintBrush,
  FaGoogleDrive,
} from "react-icons/fa";
import { useWorkspace } from "../../workspace/provider/WorkspaceProvider";
import { setCurrentWorkspace } from "../../../redux/slices/workspaceSlice";
import {
  useGetPrivateWorkspacesQuery,
  useGetPublicWorkspacesQuery,
  useMoveWorkspaceToTrashMutation,
} from "../../../redux/slices/api/workspaceApiSlice";
import CreateWorkspace from "../../workspace/management/CreateWorkspace";
import { toast } from "sonner";

const WorkspaceSection = ({
  title,
  isOpen,
  onToggle,
  children,
  isCollapsed,
}) => {
  if (isCollapsed) {
    return <div className="space-y-2">{children}</div>;
  }

  return (
    <div className="space-y-3 relative">
      <div className="flex items-center justify-between px-4 py-2 rounded-lg backdrop-blur-sm">
        <h3 className="text-xs font-semibold tracking-wider text-gray-400 dark:text-gray-500 uppercase">
          {title}
        </h3>
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 transition-transform duration-200 ease-in-out transform hover:scale-110"
        >
          {isOpen ? (
            <FaChevronDown className="w-3.5 h-3.5" />
          ) : (
            <FaChevronRight className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
      {isOpen && (
        <div className="space-y-1 transition-all duration-200 ease-in-out">
          {children}
        </div>
      )}
    </div>
  );
};

WorkspaceSection.propTypes = {
  title: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  isCollapsed: PropTypes.bool,
};

const WorkspaceButton = ({
  workspace,
  icon: Icon,
  isActive,
  onClick,
  isExpanded = false,
  onToggleExpand,
  isCollapsed,
}) => {
  const navigate = useNavigate();
  const [moveWorkspaceToTrash] = useMoveWorkspaceToTrashMutation();
  const isAdmin = workspace.userRole === "admin";

  const handleEdit = (e) => {
    e.stopPropagation();
    navigate(`/workspace/${workspace._id}/settings`);
  };

  const handleMoveToTrash = async (e) => {
    e.stopPropagation();
    if (
      window.confirm(
        `Are you sure you want to move "${workspace.name}" to trash?`,
      )
    ) {
      try {
        await moveWorkspaceToTrash(workspace._id).unwrap();
        toast.success(`Workspace "${workspace.name}" moved to trash`);
      } catch (error) {
        //console.error('Error moving workspace to trash:', error);
        toast.error(
          error?.data?.message || "Failed to move workspace to trash",
        );
      }
    }
  };

  const handleToggleExpand = (e) => {
    e.stopPropagation();
    onToggleExpand(workspace._id);
  };

  if (isCollapsed) {
    return (
      <div className="relative group">
        <div
          className={`flex items-center justify-center p-3 cursor-pointer rounded-lg transition-all duration-200
          ${isActive ? "bg-blue-50/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-gray-700/50"}`}
          onClick={() => onClick(workspace)}
          title={workspace.name}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        className={`group flex items-center px-4 py-2 text-sm cursor-pointer relative rounded-lg transition-all duration-200
        ${isActive ? "bg-blue-50/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-gray-700/50"}`}
        onClick={() => onClick(workspace)}
      >
        <button
          onClick={handleToggleExpand}
          className="mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-transform duration-200"
        >
          {isExpanded ? (
            <FaChevronUp className="w-3 h-3" />
          ) : (
            <FaChevronDown className="w-3 h-3" />
          )}
        </button>

        <div className="flex items-center min-w-0 space-x-2 flex-grow">
          <Icon className="w-4 h-4" />
          <span className="truncate font-medium">{workspace.name}</span>
        </div>

        {isAdmin && (
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleEdit}
              className="p-1 text-gray-400 hover:text-blue-400 transition-colors rounded hover:bg-blue-400/10"
              title="Edit workspace"
            >
              <FaEdit className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleMoveToTrash}
              className="p-1 text-gray-400 hover:text-red-400 transition-colors rounded hover:bg-red-400/10"
              title="Move to trash"
            >
              <FaTrash className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

WorkspaceButton.propTypes = {
  workspace: PropTypes.object.isRequired,
  icon: PropTypes.elementType.isRequired,
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  isExpanded: PropTypes.bool,
  onToggleExpand: PropTypes.func.isRequired,
  isCollapsed: PropTypes.bool,
};

const WorkspaceNavLinks = ({ workspace }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    {
      name: "Dashboard",
      path: `/workspace/${workspace._id}/dashboard`,
      icon: FaHome,
    },
    { name: "Tasks", path: `/workspace/${workspace._id}/tasks`, icon: FaTasks },
    {
      name: "Habits",
      path: `/workspace/${workspace._id}/habits`,
      icon: FaCheckCircle,
    },
    {
      name: "Canvas",
      path: `/workspace/${workspace._id}/canvas`,
      icon: FaPaintBrush,
    },
    {
      name: "Notes",
      path: `/workspace/${workspace._id}/notes`,
      icon: FaStickyNote,
    },
    {
      name: "Calendar",
      path: `/workspace/${workspace._id}/calendar`,
      icon: FaCalendar,
    },
    {
      name: "Drive",
      path: `/workspace/${workspace._id}/drive`,
      icon: FaGoogleDrive,
    },
    ...(workspace.type === "PublicWorkspace" ||
      workspace.visibility === "public"
      ? [
        {
          name: "Team",
          path: `/workspace/${workspace._id}/team`,
          icon: FaUsers,
        },
      ]
      : []),
    {
      name: "Settings",
      path: `/workspace/${workspace._id}/settings`,
      icon: FaCog,
    },
    { name: "Trash", path: `/workspace/${workspace._id}/trash`, icon: FaTrash },
  ];

  return (
    <div className="mt-1 ml-7 space-y-1 border-l border-gray-200/50 dark:border-gray-700/50 transition-all duration-200">
      {navLinks.map((link) => {
        const Icon = link.icon;
        const isActive =
          location.pathname === link.path ||
          (link.path.includes("dashboard") &&
            location.pathname === `/workspace/${workspace._id}`);

        return (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            className={`
              w-full flex items-center px-4 py-2 text-[13px] rounded-lg transition-all duration-200
              backdrop-blur-sm hover:shadow-sm transform hover:-translate-y-0.5
              ${isActive
                ? "bg-blue-50/80 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-gray-700/50"
              }
            `}
          >
            <Icon className="w-4 h-4 flex-shrink-0 mr-2.5 transition-transform duration-200 group-hover:scale-110" />
            <span className="truncate">{link.name}</span>
          </button>
        );
      })}
    </div>
  );
};

WorkspaceNavLinks.propTypes = {
  workspace: PropTypes.object.isRequired,
};

export const Sidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { workspace } = useWorkspace();
  const { user } = useSelector((state) => state.auth);
  const { data: privateWorkspaces = [] } = useGetPrivateWorkspacesQuery();
  const { data: publicWorkspaces = [] } = useGetPublicWorkspacesQuery();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSections, setOpenSections] = useState({
    private: true,
    public: true,
  });
  const [expandedWorkspaces, setExpandedWorkspaces] = useState({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close mobile menu when route changes
  const location = useLocation();
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  // Set CSS variable for sidebar width to push main content on desktop
  useEffect(() => {
    const updateSidebarWidth = () => {
      const isMobile = window.innerWidth < 1024; // lg breakpoint
      const width = isMobile ? "0px" : isCollapsed ? "4rem" : "16rem";
      document.documentElement.style.setProperty("--sidebar-width", width);
    };

    updateSidebarWidth();
    window.addEventListener("resize", updateSidebarWidth);
    return () => window.removeEventListener("resize", updateSidebarWidth);
  }, [isCollapsed]);

  // Add ESC key listener to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  // Filter public workspaces to only show ones the user has access to
  const accessiblePublicWorkspaces = React.useMemo(() => {
    return publicWorkspaces.filter((workspace) => {
      // Check if user is a member
      const isMember = workspace.members?.some((member) => {
        const memberId = member.user._id || member.user;
        return memberId === user?._id;
      });

      // Check if user is the owner
      const isOwner = workspace.owner === user?._id;

      // Include workspace if user is either a member or owner
      return isMember || isOwner;
    });
  }, [publicWorkspaces, user]);

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleWorkspaceExpand = (workspaceId) => {
    setExpandedWorkspaces((prev) => ({
      ...prev,
      [workspaceId]: !prev[workspaceId],
    }));
  };

  const handleWorkspaceSelect = async (selectedWorkspace) => {
    if (!selectedWorkspace?._id) return;

    try {
      dispatch(setCurrentWorkspace(selectedWorkspace));
      // Auto-expand the workspace when selected
      setExpandedWorkspaces((prev) => ({
        ...prev,
        [selectedWorkspace._id]: true,
      }));
      navigate(`/workspace/${selectedWorkspace._id}/dashboard`);
    } catch (error) {
      //console.error('Error selecting workspace:', error);
      toast.error("Failed to access workspace");
    }
  };

  const handleWorkspaceCreated = (workspace) => {
    handleWorkspaceSelect(workspace);
    setIsCreateModalOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-[90] p-2 rounded-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200"
        aria-label="Open menu"
      >
        <FaBars className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[95] transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - Fixed width: w-64 expanded, w-16 collapsed */}
      <aside
        className={`
        fixed left-0 top-0 h-screen bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-r border-gray-200/50 dark:border-gray-700/50 shadow-lg transition-all duration-300
        ${isCollapsed ? "w-16" : "w-64"}
        lg:flex lg:flex-col lg:z-[100]
        ${isMobileMenuOpen ? "flex flex-col z-[100] translate-x-0" : "-translate-x-full lg:translate-x-0"}
        z-[100]
      `}
      >
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {/* Logo and Header */}
          <div className="sticky top-0 z-10 border-b border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
            {!isCollapsed ? (
              <div className="flex items-center justify-between py-5 px-6">
                {/* Mobile Close Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="lg:hidden p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300
                    transition-all duration-200 rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-700/70"
                  aria-label="Close menu"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
                <Link
                  to="/"
                  className="flex items-center transition-transform duration-200 hover:scale-105"
                >
                  <img
                    src={isCollapsed ? "/3.png" : "/7.png"}
                    alt="Logo"
                    className="h-8 w-auto object-contain"
                  />
                </Link>
                <div className="flex items-center space-x-2">
                  <Link
                    to="/workspaces/trash"
                    className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300
                      transition-all duration-200 rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-700/70"
                    title="Workspace trash"
                  >
                    <FaTrash className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300
                      transition-all duration-200 rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-700/70
                      backdrop-blur-sm transform hover:scale-105 hover:shadow-md"
                    title="Create new workspace"
                  >
                    <FaPlus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden lg:block p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300
                      transition-all duration-200 rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-700/70"
                    title="Collapse sidebar"
                  >
                    <FaChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-4 space-y-3">
                {/* Mobile Close Button for Collapsed State */}
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300
                    transition-all duration-200 rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-700/70"
                  aria-label="Close menu"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="hidden lg:block p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300
                    transition-all duration-200 rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-700/70"
                  title="Expand sidebar"
                >
                  <FaChevronRight className="w-4 h-4" />
                </button>
                <Link
                  to="/"
                  className="flex items-center justify-center transition-transform duration-200 hover:scale-105"
                >
                  <img
                    src="/3.png"
                    alt="Logo"
                    className="h-7 w-auto object-contain scale"
                  />
                </Link>
                <Link
                  to="/workspaces/trash"
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300
                    transition-all duration-200 rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-700/70"
                  title="Workspace trash"
                >
                  <FaTrash className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300
                    transition-all duration-200 rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-700/70
                    backdrop-blur-sm transform hover:scale-105 hover:shadow-md"
                  title="Create new workspace"
                >
                  <FaPlus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Workspace Sections */}
          <div className={`p-4 space-y-6 ${isCollapsed ? "px-2" : ""}`}>
            {/* Private Workspaces */}
            <WorkspaceSection
              title="Private Workspaces"
              isOpen={openSections.private}
              onToggle={() => toggleSection("private")}
              isCollapsed={isCollapsed}
            >
              <div className={`space-y-1 ${isCollapsed ? "space-y-2" : ""}`}>
                {privateWorkspaces.map((privateWorkspace) => (
                  <div key={privateWorkspace._id}>
                    <WorkspaceButton
                      workspace={privateWorkspace}
                      icon={FaHome}
                      isActive={workspace?._id === privateWorkspace._id}
                      onClick={handleWorkspaceSelect}
                      isExpanded={expandedWorkspaces[privateWorkspace._id] || false}
                      onToggleExpand={toggleWorkspaceExpand}
                      isCollapsed={isCollapsed}
                    />
                    {!isCollapsed &&
                      expandedWorkspaces[privateWorkspace._id] && (
                        <WorkspaceNavLinks workspace={privateWorkspace} />
                      )}
                  </div>
                ))}
                {!isCollapsed && privateWorkspaces.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 px-4 py-2">
                    No private workspaces
                  </p>
                )}
              </div>
            </WorkspaceSection>

            {/* Public Workspaces */}
            <WorkspaceSection
              title="Public Workspaces"
              isOpen={openSections.public}
              onToggle={() => toggleSection("public")}
              isCollapsed={isCollapsed}
            >
              <div className={`space-y-1 ${isCollapsed ? "space-y-2" : ""}`}>
                {accessiblePublicWorkspaces.map((pubWorkspace) => (
                  <div key={pubWorkspace._id}>
                    <WorkspaceButton
                      workspace={pubWorkspace}
                      icon={FaUsers}
                      isActive={workspace?._id === pubWorkspace._id}
                      onClick={handleWorkspaceSelect}
                      isExpanded={expandedWorkspaces[pubWorkspace._id] || false}
                      onToggleExpand={toggleWorkspaceExpand}
                      isCollapsed={isCollapsed}
                    />
                    {!isCollapsed && expandedWorkspaces[pubWorkspace._id] && (
                      <WorkspaceNavLinks workspace={pubWorkspace} />
                    )}
                  </div>
                ))}
                {!isCollapsed && accessiblePublicWorkspaces.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 px-4 py-2">
                    No public workspaces
                  </p>
                )}
              </div>
            </WorkspaceSection>
          </div>
        </div>

        {/* User Profile */}
        {user && (
          <div className="sticky bottom-0 px-4 py-3 border-t border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
            {!isCollapsed ? (
              <div className="flex items-center p-2 rounded-xl bg-white/50 dark:bg-gray-700/30 backdrop-blur-sm transition-all duration-200 hover:shadow-md">
                <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0 border-2 border-gray-200/50 dark:border-gray-600/50 transition-transform duration-200 hover:scale-105">
                  <img
                    src={
                      user.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=random`
                    }
                    alt={user.name || "User"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=random`;
                    }}
                  />
                </div>
                <div className="ml-3 min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user.name || "Anonymous User"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.email || "No email provided"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 border-2 border-gray-200/50 dark:border-gray-600/50 transition-transform duration-200 hover:scale-105">
                  <img
                    src={
                      user.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=random`
                    }
                    alt={user.name || "User"}
                    className="w-full h-full object-cover"
                    title={user.name || "User"}
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=random`;
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Create Workspace Modal */}
        <CreateWorkspace
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleWorkspaceCreated}
        />
      </aside>
    </>
  );
};
