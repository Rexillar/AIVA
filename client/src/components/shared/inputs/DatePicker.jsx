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

import React from "react";
import { Controller } from "react-hook-form";
import clsx from "clsx";

const DatePicker = React.forwardRef(
  (
    { label, name, control, error, className, required, disabled, ...props },
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
        <Controller
          name={name}
          control={control}
          render={({ field: { onChange, value } }) => (
            <input
              type="date"
              ref={ref}
              value={value ? new Date(value).toISOString().split("T")[0] : ""}
              onChange={(e) =>
                onChange(e.target.value ? new Date(e.target.value) : null)
              }
              className={clsx(baseClasses, stateClasses, className)}
              disabled={disabled}
              {...props}
            />
          )}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  },
);

DatePicker.displayName = "DatePicker";

export { DatePicker };
export default DatePicker;
