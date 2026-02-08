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

import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { MdClose } from "react-icons/md";
import {
  FaChevronDown,
  FaChevronUp,
  FaHome,
  FaUsers,
  FaPlus,
  FaTasks,
  FaCalendar,
  FaStickyNote,
  FaTrash,
  FaCog,
} from "react-icons/fa";
import { useWorkspace } from "../../workspace/provider/WorkspaceProvider";
import { useSelector, useDispatch } from "react-redux";
import { useGetPublicWorkspacesQuery } from "../../../redux/slices/api/workspaceApiSlice";
import { setCurrentWorkspace } from "../../../redux/slices/workspaceSlice";
import CreateWorkspace from "../../workspace/management/CreateWorkspace";

const WorkspaceSection = ({ title, isOpen, onToggle, children }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-3">
        <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
          {title}
        </h3>
        <button
          onClick={onToggle}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          {isOpen ? (
            <FaChevronUp className="w-3 h-3" />
          ) : (
            <FaChevronDown className="w-3 h-3" />
          )}
        </button>
      </div>
      {isOpen && children}
    </div>
  );
};

const WorkspaceButton = ({ workspace, icon: Icon, isActive, onClick }) => {
  return (
    <button
      onClick={() => onClick(workspace)}
      className={`
        w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors duration-200
        ${
          isActive
            ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        }
      `}
    >
      <Icon className="w-4 h-4 mr-2" />
      <span className="truncate">{workspace.name}</span>
    </button>
  );
};

const WorkspaceNavLinks = ({ workspace, onClose }) => {
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
      name: "Notes",
      path: `/workspace/${workspace._id}/notes`,
      icon: FaStickyNote,
    },
    {
      name: "Calendar",
      path: `/workspace/${workspace._id}/calendar`,
      icon: FaCalendar,
    },
    ...(workspace.type === "public"
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

  const handleNavigation = (path) => {
    onClose();
    setTimeout(() => {
      navigate(path);
    }, 150);
  };

  return (
    <div className="mt-2 space-y-1">
      {navLinks.map((link) => {
        const Icon = link.icon;
        const isActive =
          location.pathname === link.path ||
          (link.path.includes("dashboard") &&
            location.pathname === `/workspace/${workspace._id}`);

        return (
          <button
            key={link.path}
            onClick={() => handleNavigation(link.path)}
            className={`
              w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors duration-200
              ${
                isActive
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }
            `}
          >
            <Icon className="w-4 h-4 mr-2" />
            <span>{link.name}</span>
          </button>
        );
      })}
    </div>
  );
};

export const MobileSidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { workspace } = useWorkspace();
  const { user, privateWorkspace } = useSelector((state) => state.auth);
  const { data: publicWorkspaces = [] } = useGetPublicWorkspacesQuery();

  const [openSections, setOpenSections] = useState({
    private: true,
    public: true,
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Filter public workspaces to only show ones the user has access to
  const accessiblePublicWorkspaces = React.useMemo(() => {
    return publicWorkspaces.filter((workspace) => {
      // Check if user is a member
      const isMember = workspace.members?.some((member) => {
        const memberId = member.user?._id || member.user;
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

  const handleWorkspaceSelect = (selectedWorkspace) => {
    if (!selectedWorkspace?._id) return;
    dispatch(setCurrentWorkspace(selectedWorkspace));
    setTimeout(() => {
      navigate(`/workspace/${selectedWorkspace._id}/dashboard`);
      setIsOpen(false);
    }, 150);
  };

  const handleWorkspaceCreated = (newWorkspace) => {
    handleWorkspaceSelect(newWorkspace);
    setIsCreateModalOpen(false);
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50 lg:hidden" onClose={setIsOpen}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/80" />
        </Transition.Child>

        <div className="fixed inset-0 flex">
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
              <div className="flex grow flex-col gap-y-3 overflow-y-auto bg-white dark:bg-gray-800 px-2 pb-4">
                {/* Header with Logo and Close button */}
                <div className="flex h-16 shrink-0 items-center justify-between px-2">
                  <Link
                    to="/"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center"
                  >
                    <img
                      src="/7.png"
                      alt="Logo"
                      className="h-12 w-auto object-contain"
                    />
                  </Link>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <MdClose className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                {/* Workspaces Header */}
                <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Workspaces
                    </h2>
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
                      title="Create new workspace"
                    >
                      <FaPlus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Workspace Sections */}
                <div className="space-y-6 px-3">
                  {/* Private Workspace */}
                  <WorkspaceSection
                    title="Private Workspace"
                    isOpen={openSections.private}
                    onToggle={() => toggleSection("private")}
                  >
                    {privateWorkspace && (
                      <>
                        <WorkspaceButton
                          workspace={privateWorkspace}
                          icon={FaHome}
                          isActive={workspace?._id === privateWorkspace._id}
                          onClick={handleWorkspaceSelect}
                        />
                        {workspace?._id === privateWorkspace._id && (
                          <WorkspaceNavLinks
                            workspace={privateWorkspace}
                            onClose={() => setIsOpen(false)}
                          />
                        )}
                      </>
                    )}
                  </WorkspaceSection>

                  {/* Public Workspaces */}
                  <WorkspaceSection
                    title="Public Workspaces"
                    isOpen={openSections.public}
                    onToggle={() => toggleSection("public")}
                  >
                    <div className="space-y-2">
                      {accessiblePublicWorkspaces.map((pubWorkspace) => (
                        <React.Fragment key={pubWorkspace._id}>
                          <WorkspaceButton
                            workspace={pubWorkspace}
                            icon={FaUsers}
                            isActive={workspace?._id === pubWorkspace._id}
                            onClick={handleWorkspaceSelect}
                          />
                          {workspace?._id === pubWorkspace._id && (
                            <WorkspaceNavLinks
                              workspace={pubWorkspace}
                              onClose={() => setIsOpen(false)}
                            />
                          )}
                        </React.Fragment>
                      ))}
                      {accessiblePublicWorkspaces.length === 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 px-3 py-2">
                          No workspaces available
                        </p>
                      )}
                    </div>
                  </WorkspaceSection>
                </div>

                {/* User Profile */}
                <div className="mt-auto px-3 py-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <img
                      src={
                        user?.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}`
                      }
                      alt={user?.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user?.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>

        {/* Create Workspace Modal */}
        <CreateWorkspace
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleWorkspaceCreated}
        />
      </Dialog>
    </Transition.Root>
  );
};
