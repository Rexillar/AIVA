import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetPrivateWorkspacesQuery } from "../../../redux/slices/api/workspaceApiSlice";
import { setPrivateWorkspace } from "../../../redux/slices/authSlice";
import { setCurrentWorkspace } from "../../../redux/slices/workspaceSlice";
import { LoadingSpinner } from "../../shared/feedback/LoadingSpinner";

const WorkspaceInitializer = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { currentWorkspace } = useSelector((state) => state.workspace);

  const { data, error, isLoading } = useGetPrivateWorkspacesQuery(undefined, {
    skip: !user?._id,
  });

  useEffect(() => {
    if (data && Array.isArray(data) && data.length > 0) {
      // Set the first private workspace as current if not already set
      if (!currentWorkspace) {
        dispatch(setCurrentWorkspace(data[0]));
      }
    }
  }, [data, dispatch, currentWorkspace]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return null;
  }

  return null;
};

export default WorkspaceInitializer;
