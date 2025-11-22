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
  className,
  padding = "default",
  header,
  footer,
  noBorder,
  noShadow,
  ...props
}) => {
  const paddingVariants = {
    none: "p-0",
    sm: "p-3",
    default: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={clsx(
        "bg-white dark:bg-gray-800 rounded-lg",
        !noShadow && "shadow-sm hover:shadow-md transition-shadow duration-200",
        !noBorder && "border border-gray-200 dark:border-gray-700",
        className,
      )}
      {...props}
    >
      {header && (
        <div
          className={clsx(
            "px-4 py-3 border-b border-gray-200 dark:border-gray-700",
            typeof header === "string"
              ? "font-medium text-gray-900 dark:text-white"
              : "",
          )}
        >
          {header}
        </div>
      )}

      <div
        className={clsx(
          paddingVariants[padding],
          header && padding === "none" && "pt-4",
          footer && padding === "none" && "pb-4",
        )}
      >
        {children}
      </div>

      {footer && (
        <div
          className={clsx(
            "px-4 py-3 border-t border-gray-200 dark:border-gray-700",
            typeof footer === "string"
              ? "text-sm text-gray-500 dark:text-gray-400"
              : "",
          )}
        >
          {footer}
        </div>
      )}
    </div>
  );
};

Card.displayName = "Card";
export { Card };
export default Card;
