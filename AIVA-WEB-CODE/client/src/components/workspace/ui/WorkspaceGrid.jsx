import React from "react";
import WorkspaceCard from "../../shared/cards/WorkspaceCard";
import { toast } from "sonner";
import { useMoveWorkspaceToTrashMutation } from "../../../redux/slices/api/workspaceApiSlice";

const WorkspaceGrid = ({ workspaces = [], onEdit, onDuplicate }) => {
  const [moveToTrash] = useMoveWorkspaceToTrashMutation();

  const handleDelete = async (workspace) => {
    try {
      await moveToTrash(workspace._id).unwrap();
      toast.success("Workspace moved to trash");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to move workspace to trash");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {workspaces.map((workspace) => (
        <WorkspaceCard
          key={workspace._id}
          workspace={workspace}
          onEdit={onEdit}
          onDelete={handleDelete}
          onDuplicate={onDuplicate}
        />
      ))}
      {workspaces.length === 0 && (
        <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
          No workspaces found
        </div>
      )}
    </div>
  );
};

export default WorkspaceGrid;
