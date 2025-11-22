/*=================================================================
 * Project: AIVA-WEB
 * File: EmptyState.jsx
 * Author: Mohitraj Jadeja
 * Date Created: February 28, 2024
 * Last Modified: February 28, 2024
 *=================================================================
 * Description:
 * EmptyState component for displaying empty states with icons, titles, and descriptions.
 *=================================================================
 * Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
 *=================================================================*/
import React from "react";
import { FaInbox } from "react-icons/fa";

const EmptyState = ({
  icon: Icon = FaInbox,
  title = "No Data Available",
  description = "There are no items to display at this time.",
  action,
  className = "",
  iconClassName = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
    >
      <div className={`text-gray-400 dark:text-gray-500 mb-4 ${iconClassName}`}>
        {React.isValidElement(Icon) ? Icon : <Icon className="w-12 h-12" />}
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

EmptyState.displayName = "EmptyState";
export default EmptyState;
