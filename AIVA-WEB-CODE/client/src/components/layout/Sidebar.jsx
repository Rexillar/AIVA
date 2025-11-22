import React from "react";
import { useSelector } from "react-redux";
import { useWorkspace } from "../workspace/provider/WorkspaceProvider";

const Sidebar = () => {
  const { currentWorkspace } = useSelector((state) => state.workspace);
  const { workspace } = useWorkspace();

  // Use either currentWorkspace from Redux or workspace from context
  const activeWorkspace = currentWorkspace || workspace;

  if (!activeWorkspace) {
    return null;
  }

  return (
    <div className="sidebar">
      <div className="workspace-info">
        <h2>{activeWorkspace.name}</h2>
        <p>{activeWorkspace.description}</p>
      </div>
      {/* Rest of your sidebar content */}
    </div>
  );
};

export default Sidebar;
