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
import { useSelector } from "react-redux";
import {
  useGetPrivateWorkspacesQuery,
  useGetPublicWorkspacesQuery,
  useCreateWorkspaceMutation,
} from "../../../redux/slices/api/workspaceApiSlice";
import { useWorkspace } from "../provider/WorkspaceProvider";
import WorkspaceGrid from "./WorkspaceGrid";
import { LoadingSpinner } from "../../shared/feedback/LoadingSpinner";
import { toast } from "sonner";

const WorkspaceDashboard = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const { workspace } = useWorkspace();
  const [createWorkspace] = useCreateWorkspaceMutation();

  const { data: privateWorkspaces = [], isLoading: isLoadingPrivate } =
    useGetPrivateWorkspacesQuery();
  const { data: publicWorkspaces = [], isLoading: isLoadingPublic } =
    useGetPublicWorkspacesQuery();

  const handleEdit = (workspace) => {
    setSelectedWorkspace(workspace);
    setIsEditModalOpen(true);
  };

  const handleDuplicate = async (workspace) => {
    try {
      const newWorkspace = {
        name: `${workspace.name} (Copy)`,
        description: workspace.description,
        visibility: workspace.visibility,
        type: workspace.type,
      };

      await createWorkspace(newWorkspace).unwrap();
      toast.success("Workspace duplicated successfully");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to duplicate workspace");
    }
  };

  if (isLoadingPrivate || isLoadingPublic) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Private Workspaces Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 px-6">
          Private Workspaces
        </h2>
        <WorkspaceGrid
          workspaces={privateWorkspaces}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
        />
      </section>

      {/* Public Workspaces Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 px-6">
          Public Workspaces
        </h2>
        <WorkspaceGrid
          workspaces={publicWorkspaces}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
        />
      </section>

      {/* Edit Modal can be added here */}
    </div>
  );
};

export default WorkspaceDashboard;
