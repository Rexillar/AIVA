/*=================================================================
 * Project: AIVA-WEB
 * File: Button.jsx
 * Author: Mohitraj Jadeja
 * Date Created: February 28, 2024
 * Last Modified: February 28, 2024
 *=================================================================
 * Description:
 * Button component for displaying buttons.
 *=================================================================
 * Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
 *=================================================================*/
import React from "react";
import { useParams } from "react-router-dom";
import { useGetWorkspaceQuery } from "../redux/slices/api/workspaceApiSlice";

const Calendar = () => {
  const { workspaceId } = useParams();
  const { data: workspace } = useGetWorkspaceQuery(workspaceId);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">
          Calendar - {workspace?.name}
        </h1>
        <p className="text-gray-600 mt-2">
          Calendar feature is coming soon. You&apos;ll be able to view and manage
          task deadlines and events here.
        </p>
      </div>
    </div>
  );
};

export default Calendar;
