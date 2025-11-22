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

const Input = React.forwardRef(
  (
    { type = "text", label, error, className, required, disabled, ...props },
    ref,
  ) => {
    const baseClasses =
      "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors";
    const stateClasses = clsx({
      "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white":
        !error && !disabled,
      "border-red-300 focus:border-red-500 focus:ring-red-500/20 dark:border-red-600":
        error,
      "bg-gray-100 border-gray-200 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700":
        disabled,
    });

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          disabled={disabled}
          className={clsx(baseClasses, stateClasses, className)}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
export default Input;
