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
