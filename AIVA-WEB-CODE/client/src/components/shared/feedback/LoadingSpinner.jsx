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

const LoadingSpinner = ({ size = "default", className = "" }) => {
  const sizeClasses = {
    small: "h-4 w-4 border-2",
    default: "h-8 w-8 border-2",
    large: "h-12 w-12 border-3",
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`
          animate-spin rounded-full
          border-t-blue-500 border-r-transparent
          border-b-blue-500 border-l-transparent
          dark:border-t-blue-400 dark:border-b-blue-400
          ${sizeClasses[size] || sizeClasses.default}
        `}
      />
    </div>
  );
};

export { LoadingSpinner };
export default LoadingSpinner;
