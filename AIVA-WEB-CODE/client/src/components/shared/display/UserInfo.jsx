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
import clsx from "clsx";
import Avatar from "./Avatar";
import Badge from "./Badge";

const UserInfo = ({
  user,
  size = "md",
  showEmail = false,
  showRole = false,
  showStatus = false,
  className,
  onClick,
  ...props
}) => {
  const sizes = {
    sm: {
      container: "gap-2",
      avatar: "sm",
      name: "text-sm",
      details: "text-xs",
    },
    md: {
      container: "gap-3",
      avatar: "md",
      name: "text-base",
      details: "text-sm",
    },
    lg: {
      container: "gap-4",
      avatar: "lg",
      name: "text-lg",
      details: "text-base",
    },
  };

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "success";
      case "inactive":
        return "danger";
      case "pending":
        return "warning";
      default:
        return "default";
    }
  };

  const getRoleVariant = (role) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "primary";
      case "owner":
        return "info";
      default:
        return "default";
    }
  };

  if (!user) return null;

  return (
    <div
      className={clsx(
        "flex items-center",
        sizes[size].container,
        onClick && "cursor-pointer",
        className,
      )}
      onClick={onClick}
      {...props}
    >
      <Avatar src={user.avatar} alt={user.name} size={sizes[size].avatar} />
      <div className="flex flex-col min-w-0">
        <span
          className={clsx(
            "font-medium text-gray-900 dark:text-white truncate",
            sizes[size].name,
          )}
        >
          {user.name}
        </span>
        {showEmail && (
          <span
            className={clsx(
              "text-gray-500 dark:text-gray-400 truncate",
              sizes[size].details,
            )}
          >
            {user.email}
          </span>
        )}
        {(showRole || showStatus) && (
          <div className="flex items-center gap-2 mt-1">
            {showRole && user.role && (
              <Badge variant={getRoleVariant(user.role)} size="sm">
                {user.role}
              </Badge>
            )}
            {showStatus && user.status && (
              <Badge variant={getStatusVariant(user.status)} size="sm" dot>
                {user.status}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

UserInfo.displayName = "UserInfo";

export { UserInfo };
export default UserInfo;
