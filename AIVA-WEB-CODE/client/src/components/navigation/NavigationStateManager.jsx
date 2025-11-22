/*=================================================================
 * Project: AIVA-WEB
 * File: NavigationStateManager.jsx
 * Author: Mohitraj Jadeja
 * Date Created: March 12, 2024
 * Last Modified: March 12, 2024
 *=================================================================
 * Description: Component for managing navigation state persistence
 * across page reloads.
 *=================================================================
 * Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
 *=================================================================*/
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setNavigationState,
  clearNavigationState,
} from "../../redux/slices/workspaceSlice";

const NavigationStateManager = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const navigationState = useSelector(
    (state) => state.workspace.navigationState,
  );
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Effect to restore navigation on initial load
  useEffect(() => {
    const shouldRestoreNavigation =
      isAuthenticated &&
      (location.pathname === "/" ||
        location.pathname === "/dashboard" ||
        !location.pathname);

    if (shouldRestoreNavigation && navigationState?.lastPath) {
      // Check if the saved state is not too old (e.g., within 24 hours)
      const isStateValid =
        navigationState.timestamp &&
        Date.now() - navigationState.timestamp < 24 * 60 * 60 * 1000;

      if (isStateValid) {
        //.log('Restoring navigation to:', navigationState.lastPath);
        // Use replace to avoid adding to history stack
        navigate(navigationState.lastPath, { replace: true });
      } else {
        // Clear expired navigation state
        dispatch(clearNavigationState());
      }
    }
  }, [navigationState, location.pathname, navigate, dispatch, isAuthenticated]);

  // Effect to persist navigation state
  useEffect(() => {
    // Only persist state for task and workspace-related pages
    if (
      location.pathname.includes("/task/") ||
      location.pathname.includes("/workspace/")
    ) {
      const pathParts = location.pathname.split("/");
      const workspaceId = pathParts.find(
        (part, index) =>
          pathParts[index - 1] === "workspace" ||
          pathParts[index - 1] === "tasks",
      );
      const taskId = pathParts.find(
        (part, index) => pathParts[index - 1] === "task",
      );

      if (workspaceId) {
        dispatch(
          setNavigationState({
            lastPath: location.pathname,
            lastWorkspaceId: workspaceId,
            lastTaskId: taskId || null,
            timestamp: Date.now(),
          }),
        );

        // Also save to localStorage as backup
        try {
          localStorage.setItem(
            "lastNavigation",
            JSON.stringify({
              lastPath: location.pathname,
              lastWorkspaceId: workspaceId,
              lastTaskId: taskId || null,
              timestamp: Date.now(),
            }),
          );
        } catch (error) {
          //console.error('Error saving navigation state to localStorage:', error);
        }
      }
    }
  }, [location.pathname, dispatch]);

  // Effect to restore from localStorage if Redux state is empty
  useEffect(() => {
    if (isAuthenticated && !navigationState?.lastPath) {
      try {
        const savedNavigation = localStorage.getItem("lastNavigation");
        if (savedNavigation) {
          const parsed = JSON.parse(savedNavigation);
          const isStateValid =
            parsed.timestamp &&
            Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000;

          if (isStateValid) {
            dispatch(setNavigationState(parsed));
          } else {
            localStorage.removeItem("lastNavigation");
          }
        }
      } catch (error) {
        //console.error('Error restoring navigation state from localStorage:', error);
      }
    }
  }, [dispatch, navigationState, isAuthenticated]);

  return children;
};

export default NavigationStateManager;
