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
import { LoadingSpinner } from "../feedback/LoadingSpinner";

const IconButton = ({
  icon,
  variant = "default",
  size = "md",
  isLoading = false,
  disabled = false,
  className = "",
  onClick,
  title,
  type = "button",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-full focus:outline-none transition-colors";

  const variants = {
    default:
      "text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700",
    primary:
      "text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30",
    danger:
      "text-red-600 hover:text-red-700 hover:bg-red-100 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30",
    success:
      "text-green-600 hover:text-green-700 hover:bg-green-100 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/30",
    warning:
      "text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100 dark:text-yellow-400 dark:hover:text-yellow-300 dark:hover:bg-yellow-900/30",
  };

  const sizes = {
    sm: "p-1",
    md: "p-2",
    lg: "p-3",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <button
      type={type}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${disabled || isLoading ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
      disabled={disabled || isLoading}
      onClick={onClick}
      title={title}
      {...props}
    >
      {isLoading ? (
        <LoadingSpinner size="small" />
      ) : (
        icon &&
        React.cloneElement(icon, {
          className: `${iconSizes[size]} ${icon.props.className || ""}`,
        })
      )}
    </button>
  );
};

export default IconButton;
