/*=================================================================
 * Project: AIVA-WEB
 * File: WorkspaceSelector.jsx
 * Author: Mohitraj Jadeja
 * Date Created: March 13, 2024
 * Last Modified: March 13, 2024
 *=================================================================
 * Description:
 * Workspace selector component for the sidebar with edit and delete functionality.
 *=================================================================
 * Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
 *=================================================================*/
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { FaChevronDown, FaChevronUp, FaPlus } from "react-icons/fa";
import PropTypes from "prop-types";
import { setCurrentWorkspace } from "../../../redux/slices/workspaceSlice";
import {
  useGetPrivateWorkspacesQuery,
  useGetPublicWorkspacesQuery,
} from "../../../redux/slices/api/workspaceApiSlice";
import { LoadingSpinner } from "../../shared/feedback/LoadingSpinner";
import WorkspaceItem from "./WorkspaceItem";
import { useWorkspace } from "../provider/WorkspaceProvider";
import CreateWorkspace from "../management/CreateWorkspace";
import { toast } from "sonner";

const WorkspaceSection = ({ title, isOpen, onToggle, children }) => {
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
            <FaChevronUp className="w-3.5 h-3.5" />
          ) : (
            <FaChevronDown className="w-3.5 h-3.5" />
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
};

const WorkspaceSelector = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { workspace } = useWorkspace();
  const { data: privateWorkspaces = [], isLoading: isLoadingPrivate } =
    useGetPrivateWorkspacesQuery();
  const { data: publicWorkspaces = [], isLoading: isLoadingPublic } =
    useGetPublicWorkspacesQuery();

  const [openSections, setOpenSections] = useState({
    private: true,
    public: true,
  });
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleWorkspaceSelect = async (selectedWorkspace) => {
    if (!selectedWorkspace?._id) return;

    try {
      dispatch(setCurrentWorkspace(selectedWorkspace));
      navigate(`/workspace/${selectedWorkspace._id}/dashboard`);
    } catch (error) {
      //console.error('Error selecting workspace:', error);
      toast.error("Failed to access workspace");
    }
  };

  const handleCreateSuccess = (newWorkspace) => {
    setShowCreateWorkspace(false);
    if (newWorkspace?._id) {
      dispatch(setCurrentWorkspace(newWorkspace));
      navigate(`/workspace/${newWorkspace._id}/dashboard`);
    }
  };

  if (isLoadingPrivate || isLoadingPublic) {
    return (
      <div className="flex justify-center items-center p-4">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Create Workspace Button */}
        <div className="px-2">
          <button
            onClick={() => setShowCreateWorkspace(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 font-medium text-sm shadow-sm hover:shadow-md"
          >
            <FaPlus className="w-4 h-4" />
            Create Workspace
          </button>
        </div>

        {/* Private Workspaces */}
        <WorkspaceSection
          title="Private Workspaces"
          isOpen={openSections.private}
          onToggle={() => toggleSection("private")}
        >
          <div className="space-y-1">
            {privateWorkspaces.map((privateWorkspace) => (
              <WorkspaceItem
                key={privateWorkspace._id}
                workspace={privateWorkspace}
                isActive={workspace?._id === privateWorkspace._id}
                onClick={handleWorkspaceSelect}
              />
            ))}
            {privateWorkspaces.length === 0 && (
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
        >
          <div className="space-y-1">
            {publicWorkspaces.map((pubWorkspace) => (
              <WorkspaceItem
                key={pubWorkspace._id}
                workspace={pubWorkspace}
                isActive={workspace?._id === pubWorkspace._id}
                onClick={handleWorkspaceSelect}
              />
            ))}
            {publicWorkspaces.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 px-4 py-2">
                No public workspaces
              </p>
            )}
          </div>
        </WorkspaceSection>
      </div>

      {/* Create Workspace Modal */}
      {showCreateWorkspace && (
        <CreateWorkspace
          isOpen={showCreateWorkspace}
          onClose={() => setShowCreateWorkspace(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </>
  );
};

export default WorkspaceSelector;
