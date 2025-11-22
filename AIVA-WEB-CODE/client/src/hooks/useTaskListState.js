/*=================================================================
 * Project: AIVA-WEB
 * File: useTaskListState.js
 * Author: Mohitraj Jadeja
 * Date Created: March 12, 2024
 * Last Modified: March 12, 2024
 *=================================================================
 * Description: Custom hook for managing task list state
 *=================================================================
 * Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
 *=================================================================*/

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams, useLocation } from "react-router-dom";

export function useTaskListState() {
  const { workspaceId } = useParams();
  const location = useLocation();
  const { currentWorkspace, workspaces } = useSelector(
    (state) => state.workspace,
  );
  const { privateWorkspace } = useSelector((state) => state.auth);

  // Get workspace ID from either params or current workspace
  const effectiveWorkspaceId = workspaceId || currentWorkspace?._id;

  // Determine workspace type and visibility
  const workspace =
    workspaces.find((w) => w._id === effectiveWorkspaceId) || currentWorkspace;
  const isPrivate = workspace?._id === privateWorkspace?._id;
  const workspaceType = isPrivate ? "private" : "team";
  const workspaceVisibility = workspace?.visibility || "private";

  // Log state for debugging
  useEffect(() => {
    // console.log('TaskList - Current State:', {
    //   workspace,
    //   workspaceId: effectiveWorkspaceId,
    //   isWorkspaceLoading: !workspace,
    //   workspaceType,
    //   workspaceVisibility,
    //   currentPath: location.pathname
    // });
  }, [
    workspace,
    effectiveWorkspaceId,
    workspaceType,
    workspaceVisibility,
    location.pathname,
  ]);

  return {
    workspace,
    workspaceId: effectiveWorkspaceId,
    isWorkspaceLoading: !workspace,
    workspaceType,
    workspaceVisibility,
    isPrivateWorkspace: isPrivate,
  };
}
