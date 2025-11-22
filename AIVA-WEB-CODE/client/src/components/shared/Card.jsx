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

const Card = ({
  children,
  className = "",
  title,
  subtitle,
  footer,
  noPadding = false,
  variant = "default",
}) => {
  const variants = {
    default: "bg-white dark:bg-gray-800",
    transparent: "bg-transparent",
    elevated: "bg-white dark:bg-gray-800 shadow-lg",
  };

  return (
    <div
      className={clsx(
        "rounded-lg border border-gray-200 dark:border-gray-700",
        variants[variant],
        className,
      )}
    >
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          {title && (
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div className={clsx(!noPadding && "p-6")}>{children}</div>

      {footer && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
