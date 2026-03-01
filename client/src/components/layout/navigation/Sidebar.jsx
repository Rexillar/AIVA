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
  FaVideo,
  FaPhoneSlash,
  FaExternalLinkAlt,
  FaBook,
  FaClone,
  FaBolt,
  FaProjectDiagram,
  FaLightbulb,
} from "react-icons/fa";
import { useWorkspace } from "../../workspace/provider/WorkspaceProvider";
import { setCurrentWorkspace } from "../../../redux/slices/workspaceSlice";
import { workspaceApiSlice } from "../../../redux/slices/api/workspaceApiSlice";
import socketService from "../../../services/socket";
import {
  useGetPrivateWorkspacesQuery,
  useGetPublicWorkspacesQuery,
  useMoveWorkspaceToTrashMutation,
  useGetVoiceChannelsQuery,
  useCreateVoiceChannelMutation,
  useDeleteVoiceChannelMutation,
} from "../../../redux/slices/api/workspaceApiSlice";
import CreateWorkspace from "../../workspace/management/CreateWorkspace";
import { toast } from "sonner";

const CreateMeetingModal = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
      setName("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FaVideo className="text-blue-500" />
            Create Meeting
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="meetingName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Meeting Name
              </label>
              <input
                id="meetingName"
                type="text"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Design Sync"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-300 dark:border-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <FaPlus className="w-3 h-3" />
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const WorkspaceSection = ({
  title,
  isOpen,
  onToggle,
  children,
  isCollapsed,
}) => {
  if (isCollapsed) {
    return <div className="space-y-1">{children}</div>;
  }

  return (
    <div className="mb-5">
      <button
        onClick={onToggle}
        className="group w-full flex items-center justify-between px-2.5 py-2 hover:bg-white dark:hover:bg-gray-800 rounded-md transition-all duration-150"
      >
        <h3 className="text-[11px] font-semibold tracking-wide text-gray-600 dark:text-gray-400 uppercase">
          {title}
        </h3>
        <div className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-all duration-150">
          {isOpen ? (
            <FaChevronDown className="w-3 h-3" />
          ) : (
            <FaChevronRight className="w-3 h-3" />
          )}
        </div>
      </button>
      {isOpen && (
        <div className="mt-2 space-y-1 transition-all duration-150">
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
          ${isActive ? "bg-white dark:bg-gray-800 shadow-sm text-blue-600 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-800" : "text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm"}`}
          onClick={() => onClick(workspace)}
          title={workspace.name}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative mb-1.5">
      <button
        className={`group w-full flex items-center px-2.5 py-2 text-sm cursor-pointer rounded-md transition-all duration-150
        ${isActive 
          ? "bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-gray-100 ring-1 ring-gray-200 dark:ring-gray-700" 
          : "text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm"}`}
        onClick={() => onClick(workspace)}
      >
        <div
          onClick={handleToggleExpand}
          className={`mr-2 transition-all duration-150 ${isActive ? "text-gray-900 dark:text-gray-100" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
        >
          {isExpanded ? (
            <FaChevronDown className="w-3 h-3" />
          ) : (
            <FaChevronRight className="w-3 h-3" />
          )}
        </div>

        <div className="flex items-center min-w-0 space-x-2.5 flex-grow">
          <Icon className="w-4 h-4 opacity-70" />
          <span className="truncate font-medium text-[14px]">{workspace.name}</span>
        </div>

        {isAdmin && (
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
            <button
              onClick={handleEdit}
              className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-all rounded"
              title="Settings"
            >
              <FaCog className="w-3 h-3" />
            </button>
            <button
              onClick={handleMoveToTrash}
              className="p-1 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-all rounded"
              title="Delete"
            >
              <FaTrash className="w-3 h-3" />
            </button>
          </div>
        )}
      </button>
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
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const { data: voiceChannelsResp } = useGetVoiceChannelsQuery(workspace._id);
  const voiceChannels = voiceChannelsResp?.data || [];
  const [createVoiceChannel] = useCreateVoiceChannelMutation();
  const [deleteVoiceChannel] = useDeleteVoiceChannelMutation();

  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);

  const activeVoiceChannel = React.useMemo(() => {
    return voiceChannels.find(c => c.activeParticipants?.some(p => p._id === user?._id));
  }, [voiceChannels, user]);

  useEffect(() => {
    if (workspace && workspace._id) {
      socketService.joinWorkspace(workspace._id);
    }

    const handleVoiceUpdate = () => {
      dispatch(workspaceApiSlice.util.invalidateTags([{ type: "VoiceChannel", id: "LIST" }]));
    };

    socketService.on("voice:channel_updated", handleVoiceUpdate);

    return () => {
      socketService.off("voice:channel_updated", handleVoiceUpdate);
      if (workspace && workspace._id) {
        socketService.leaveWorkspace(workspace._id);
      }
    };
  }, [workspace?._id, dispatch]);

  const handleCreateVoiceChannel = async (name) => {
    try {
      await createVoiceChannel({ workspaceId: workspace._id, name }).unwrap();
      toast.success("Meeting created");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to create Meeting");
    }
  };

  const handleDeleteVoiceChannel = async (e, channelId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this Meeting Room?")) return;
    try {
      await deleteVoiceChannel({ workspaceId: workspace._id, channelId }).unwrap();
      toast.success("Meeting room deleted");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete meeting room");
    }
  };

  // Notion-style calm navigation hierarchy
  const navSections = [
    {
      label: "Overview",
      items: [
        {
          name: "Dashboard",
          path: `/workspace/${workspace._id}/dashboard`,
          icon: FaHome,
        },
        { 
          name: "Tasks", 
          path: `/workspace/${workspace._id}/tasks`, 
          icon: FaTasks 
        },
        {
          name: "Calendar",
          path: `/workspace/${workspace._id}/calendar`,
          icon: FaCalendar,
        },
      ]
    },
    {
      label: "Workspace",
      items: [
        {
          name: "Notes",
          path: `/workspace/${workspace._id}/notes`,
          icon: FaStickyNote,
        },
        {
          name: "Canvas",
          path: `/workspace/${workspace._id}/canvas`,
          icon: FaPaintBrush,
        },
        {
          name: "Drive",
          path: `/workspace/${workspace._id}/drive`,
          icon: FaGoogleDrive,
        },
      ]
    },
    {
      label: "Intelligence",
      items: [
        {
          name: "Sources",
          path: `/workspace/${workspace._id}/sources`,
          icon: FaBook,
        },
        {
          name: "Templates",
          path: `/workspace/${workspace._id}/templates`,
          icon: FaClone,
        },
        {
          name: "Automation",
          path: `/workspace/${workspace._id}/automation`,
          icon: FaBolt,
        },
        {
          name: "Planner",
          path: `/workspace/${workspace._id}/planner`,
          icon: FaProjectDiagram,
        },
        {
          name: "Knowledge",
          path: `/workspace/${workspace._id}/knowledge`,
          icon: FaLightbulb,
        },
      ]
    },
    {
      label: "Collaboration",
      items: [
        ...(workspace.type === "PublicWorkspace" || workspace.visibility === "public"
          ? [
              {
                name: "Team",
                path: `/workspace/${workspace._id}/team`,
                icon: FaUsers,
              },
            ]
          : []),
      ]
    },
    {
      label: "Settings",
      items: [
        {
          name: "Settings",
          path: `/workspace/${workspace._id}/settings`,
          icon: FaCog,
        },
        { 
          name: "Trash", 
          path: `/workspace/${workspace._id}/trash`, 
          icon: FaTrash 
        },
      ]
    }
  ];

  // Filter out sections with no items (e.g. Collaboration on private workspaces)
  const visibleSections = navSections.filter(s => s.items.length > 0 || (s.label === "Collaboration" && (workspace.type === "PublicWorkspace" || workspace.visibility === "public")));

  return (
    <div className="mt-5 ml-0 space-y-5">
      {visibleSections.map((section, sectionIdx) => (
        <div key={section.label}>
          {/* Section Label - Notion-style subtle */}
          <div className="px-3 mb-2">
            <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase">
              {section.label}
            </span>
          </div>

          {/* Section Items */}
          <div className="space-y-1">
            {section.items.map((link) => {
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
                    group w-full flex items-center px-3 py-2 text-[14px] rounded-md transition-all duration-150
                    hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm relative
                    ${isActive
                      ? "text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 shadow-sm"
                      : "text-gray-700 dark:text-gray-300"
                    }
                  `}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-blue-600 dark:bg-blue-400 rounded-r-full" />
                  )}
                  <Icon className="w-[16px] h-[16px] flex-shrink-0 mr-3 opacity-80" />
                  <span className="truncate font-normal">{link.name}</span>
                </button>
              );
            })}

            {/* Meet Section - Enhanced Design */}
            {section.label === "Collaboration" && (
              <div className="mt-2 space-y-1.5">
                {/* Create Meeting - Prominent but calm */}
                <button
                  onClick={() => setIsMeetingModalOpen(true)}
                  className="group w-full flex items-center justify-between px-3 py-2.5 text-[14px] rounded-lg transition-all duration-200 
                    bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20
                    hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30
                    border border-blue-200/60 dark:border-blue-800/30 shadow-sm
                    text-blue-700 dark:text-blue-300"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 rounded-md bg-blue-500/10 dark:bg-blue-400/10">
                      <FaVideo className="w-[14px] h-[14px] text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="font-medium">Start Meeting</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {voiceChannels.length > 0 && (
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium">
                        {voiceChannels.length}
                      </span>
                    )}
                    <FaPlus className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>

                {/* Meeting Rooms - Card style */}
                {voiceChannels.length > 0 && (
                  <div className="space-y-1 pt-1">
                    {voiceChannels.map(channel => {
                      const isInThisChannel = channel._id === activeVoiceChannel?._id;
                      const channelActive = location.pathname === `/workspace/${workspace._id}/voice/${channel._id}`;
                      const participantCount = channel.activeParticipants?.length || 0;
                      
                      return (
                        <div 
                          key={channel._id} 
                          className={`relative group/channel rounded-lg transition-all duration-200 border
                            ${channelActive 
                              ? "bg-blue-50 dark:bg-blue-900/15 border-blue-200 dark:border-blue-800/40 shadow-sm" 
                              : "border-gray-200/60 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                            }`}
                        >
                          <button
                            onClick={() => navigate(`/workspace/${workspace._id}/voice/${channel._id}`)}
                            className="w-full flex items-center justify-between px-3 py-2.5 text-left"
                          >
                            <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                              <div className={`p-1 rounded ${channelActive ? "bg-blue-100 dark:bg-blue-900/30" : "bg-gray-100 dark:bg-gray-700"}`}>
                                <FaVideo className={`w-3 h-3 ${channelActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className={`text-[13.5px] font-medium truncate ${channelActive ? "text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"}`}>
                                    {channel.name}
                                  </span>
                                  {isInThisChannel && (
                                    <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30">
                                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                      <span className="text-[10px] font-medium text-green-700 dark:text-green-400">Live</span>
                                    </span>
                                  )}
                                </div>
                                {participantCount > 0 && (
                                  <div className="flex items-center space-x-1 mt-0.5">
                                    <FaUsers className="w-2.5 h-2.5 text-gray-400 dark:text-gray-500" />
                                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                                      {participantCount} {participantCount === 1 ? 'participant' : 'participants'}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Delete button */}
                            <button
                              onClick={(e) => handleDeleteVoiceChannel(e, channel._id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover/channel:opacity-100 transition-all rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                              title="Delete meeting"
                            >
                              <FaTrash className="w-3 h-3" />
                            </button>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}

      <CreateMeetingModal
        isOpen={isMeetingModalOpen}
        onClose={() => setIsMeetingModalOpen(false)}
        onSubmit={handleCreateVoiceChannel}
      />
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
        className="lg:hidden fixed top-4 left-4 z-[90] p-2 rounded-lg bg-white dark:bg-gray-900 backdrop-blur-md border border-gray-300 dark:border-gray-700 shadow-lg text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200"
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

      {/* Sidebar - Notion-style clean */}
      <aside
        className={`
        fixed left-0 top-0 h-screen bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300
        ${isCollapsed ? "w-16" : "w-64"}
        lg:flex lg:flex-col lg:z-[100]
        ${isMobileMenuOpen ? "flex flex-col z-[100] translate-x-0" : "-translate-x-full lg:translate-x-0"}
        z-[100]
      `}
      >
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {/* Logo and Header - Minimal */}
          <div className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-sm">
            {!isCollapsed ? (
              <div className="flex items-center justify-between py-4 px-3">
                {/* Mobile Close Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="lg:hidden p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300
                    transition-all duration-150 rounded-md hover:bg-white dark:hover:bg-gray-800"
                  aria-label="Close menu"
                >
                  <FaTimes className="w-3.5 h-3.5" />
                </button>
                <Link
                  to="/"
                  className="flex items-center transition-opacity duration-150 hover:opacity-70"
                >
                  <img
                    src={isCollapsed ? "/3.png" : "/7.png"}
                    alt="Logo"
                    className="h-7 w-auto object-contain"
                  />
                </Link>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300
                      transition-all duration-150 rounded-md hover:bg-white dark:hover:bg-gray-800"
                    title="New workspace"
                  >
                    <FaPlus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden lg:block p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300
                      transition-all duration-150 rounded-md hover:bg-white dark:hover:bg-gray-800"
                    title="Collapse"
                  >
                    <FaChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-3 space-y-2">
                {/* Mobile Close Button for Collapsed State */}
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="lg:hidden p-1.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400
                    transition-all duration-150 rounded-md hover:bg-gray-100/50 dark:hover:bg-gray-700/30"
                  aria-label="Close"
                >
                  <FaTimes className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="hidden lg:block p-1.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400
                    transition-all duration-150 rounded-md hover:bg-gray-100/50 dark:hover:bg-gray-700/30"
                  title="Expand"
                >
                  <FaChevronRight className="w-3.5 h-3.5" />
                </button>
                <Link
                  to="/"
                  className="flex items-center justify-center transition-opacity duration-150 hover:opacity-70"
                >
                  <img
                    src="/3.png"
                    alt="Logo"
                    className="h-6 w-auto object-contain"
                  />
                </Link>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400
                    transition-all duration-150 rounded-md hover:bg-gray-100/50 dark:hover:bg-gray-700/30"
                  title="New"
                >
                  <FaPlus className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Workspace Sections - Notion spacing */}
          <div className={`p-4 space-y-2 ${isCollapsed ? "px-2" : ""}`}>
            {/* Private Workspaces */}
            <WorkspaceSection
              title="Private Workspaces"
              isOpen={openSections.private}
              onToggle={() => toggleSection("private")}
              isCollapsed={isCollapsed}
            >
              <div className="space-y-1">
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

        {/* User Profile - Notion-style minimal */}
        {user && (
          <div className="sticky bottom-0 px-3 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-sm">
            {!isCollapsed ? (
              <button className="group w-full flex items-center gap-2.5 p-1.5 hover:bg-white dark:hover:bg-gray-800 rounded-md transition-all duration-150 cursor-pointer">
                <div className="relative flex-shrink-0">
                  <div className="w-7 h-7 rounded-md overflow-hidden bg-gray-200 dark:bg-gray-700">
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
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-[13px] font-medium text-gray-900 dark:text-gray-100 truncate">
                    {user.name || "Anonymous User"}
                  </p>
                </div>
                <div className="flex-shrink-0 opacity-0 group-hover:opacity-50 transition-opacity">
                  <FaCog className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                </div>
              </button>
            ) : (
              <div className="flex justify-center">
                <button className="relative group">
                  <div className="w-8 h-8 rounded-md overflow-hidden bg-gray-200 dark:bg-gray-700 transition-all duration-150 hover:ring-2 hover:ring-gray-300 dark:hover:ring-gray-600 cursor-pointer">
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
                </button>
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
