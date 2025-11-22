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

const Avatar = ({
  src,
  alt,
  size = "md",
  className,
  fallback,
  onClick,
  ...props
}) => {
  const sizeClasses = {
    xs: "w-6 h-6",
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-14 h-14",
  };

  const handleError = (e) => {
    e.target.src =
      fallback ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(alt || "User")}&background=random`;
  };

  return (
    <div
      className={clsx(
        "relative inline-block rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700",
        sizeClasses[size],
        onClick && "cursor-pointer",
        className,
      )}
      onClick={onClick}
      {...props}
    >
      <img
        src={
          src ||
          fallback ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(alt || "User")}&background=random`
        }
        alt={alt || "Avatar"}
        className="w-full h-full object-cover"
        onError={handleError}
      />
    </div>
  );
};

Avatar.displayName = "Avatar";

export { Avatar };
export default Avatar;
