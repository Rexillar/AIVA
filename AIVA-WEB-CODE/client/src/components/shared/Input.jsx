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

const Input = ({
  type = "text",
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  className = "",
  required = false,
  disabled = false,
  multiline = false,
  rows = 3,
  icon: Icon,
  ...props
}) => {
  const inputClasses = clsx(
    "block w-full rounded-md shadow-sm",
    "border-gray-300 dark:border-gray-600",
    "focus:ring-blue-500 focus:border-blue-500",
    "dark:bg-gray-700 dark:text-white",
    Icon && "pl-10",
    error && "border-red-500 focus:ring-red-500 focus:border-red-500",
    disabled && "bg-gray-100 cursor-not-allowed",
    className,
  );

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        {multiline ? (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            placeholder={placeholder}
            rows={rows}
            className={inputClasses}
            {...props}
          />
        ) : (
          <input
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            placeholder={placeholder}
            className={inputClasses}
            {...props}
          />
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-500">{error}</p>
      )}
    </div>
  );
};

export default Input;
