/*=================================================================
 * Project: AIVA-WEB
 * File: StatCard.jsx
 * Author: Mohitraj Jadeja
 * Date Created: February 28, 2024
 * Last Modified: February 28, 2024
 *=================================================================
 * Description:
 * StatCard component for displaying statistics with icons.
 *=================================================================
 * Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
 *=================================================================*/
import React from "react";
import { Card } from "../layout/Card";
import clsx from "clsx";

const StatCard = ({
  title,
  value,
  icon: Icon,
  color = "text-blue-600 dark:text-blue-400",
  className = "",
  subtext,
}) => {
  // Extract the color name from the color class (e.g., 'text-blue-600' -> 'blue')
  const colorName = color?.replace("text-", "").split("-")[0] || "blue";

  return (
    <Card
      className={clsx(
        "bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow duration-200",
        className,
      )}
    >
      <div className="flex items-center justify-between p-4">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <p className={clsx("text-2xl font-bold", color)}>{value}</p>
          {subtext && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {subtext}
            </p>
          )}
        </div>
        <div
          className={clsx(
            "p-3 rounded-full",
            `bg-${colorName}-50 dark:bg-${colorName}-900/30`,
          )}
        >
          {React.isValidElement(Icon) ? (
            Icon
          ) : (
            <Icon className={clsx("w-6 h-6", color)} />
          )}
        </div>
      </div>
    </Card>
  );
};

StatCard.displayName = "StatCard";
export default StatCard;
