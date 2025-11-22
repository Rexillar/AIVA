import React from "react";

const Checkbox = ({ checked, onChange, className = "", disabled = false }) => {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className={`
        h-4 w-4 rounded border-gray-300 text-blue-600 
        focus:ring-blue-500 focus:ring-offset-0
        dark:border-gray-600 dark:bg-gray-700
        dark:checked:bg-blue-600 dark:checked:border-blue-600
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
    />
  );
};

export { Checkbox };
