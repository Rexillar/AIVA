/*═══════════════════════════════════════════════════════════════════════════════

        █████╗ ██╗██╗   ██╗ █████╗
       ██╔══██╗██║██║   ██║██╔══██╗
       ███████║██║██║   ██║███████║
       ██╔══██║██║╚██╗ ██╔╝██╔══██║
       ██║  ██║██║ ╚████╔╝ ██║  ██║
       ╚═╝  ╚═╝╚═╝  ╚═══╝  ╚═╝  ╚═╝

   ──◈──  A I V A  ::  A I   V I R T U A L   A S S I S T A N T  ──◈──

   ◉  Deterministic Execution System
   ◉  Rule-Bound • State-Aware • Non-Emotive

   ⟁  SYSTEM LAYER : FRONTEND CORE
   ⟁  DOMAIN       : UI COMPONENTS

   ⟁  PURPOSE      : Provide specific functionality and operations

   ⟁  WHY          : Modular code organization and reusability

   ⟁  WHAT         : Function-based utilities and operations

   ⟁  TECH STACK   : React • Redux • Vite
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : MEDIUM
   ⟁  DOCS : /docs/frontend/components.md

   ⟁  USAGE RULES  : Follow design system • Handle props • Manage state

        "Functions implemented. Operations executed. Results delivered."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

import React, { useState } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import clsx from "clsx";

const SearchInput = React.forwardRef(
  (
    {
      placeholder = "Search...",
      value,
      onChange,
      onClear,
      className,
      disabled,
      error,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleClear = () => {
      if (onClear) {
        onClear();
      } else if (onChange) {
        onChange({ target: { value: "" } });
      }
    };

    const baseClasses =
      "w-full pl-10 pr-8 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors";
    const stateClasses = clsx({
      "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white":
        !error && !disabled,
      "border-red-300 focus:border-red-500 focus:ring-red-500/20 dark:border-red-600":
        error,
      "bg-gray-100 border-gray-200 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700":
        disabled,
    });

    return (
      <div className="relative">
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch
            className={clsx(
              "h-4 w-4",
              isFocused
                ? "text-blue-500 dark:text-blue-400"
                : "text-gray-400 dark:text-gray-500",
            )}
          />
        </div>

        {/* Input */}
        <input
          ref={ref}
          type="text"
          className={clsx(baseClasses, stateClasses, className)}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {/* Clear Button */}
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            disabled={disabled}
          >
            <FaTimes className="h-4 w-4" />
          </button>
        )}

        {/* Error Message */}
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  },
);

SearchInput.displayName = "SearchInput";
export { SearchInput };
export default SearchInput;
