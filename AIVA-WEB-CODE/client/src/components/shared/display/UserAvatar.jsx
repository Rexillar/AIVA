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

const sizeClasses = {
  xs: "w-6 h-6",
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
  xl: "w-14 h-14",
};

const UserAvatar = ({ src, alt, size = "md", className = "" }) => {
  const defaultImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(alt || "User")}&background=random`;

  return (
    <img
      src={src || defaultImage}
      alt={alt || "User avatar"}
      className={`rounded-full object-cover ${sizeClasses[size]} ${className}`}
    />
  );
};

UserAvatar.displayName = "UserAvatar";
export { UserAvatar };
export default UserAvatar;
