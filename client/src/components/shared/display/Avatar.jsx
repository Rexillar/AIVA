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

const Avatar = ({
  src,
  alt,
  size = "md",
  className,
  fallback,
  onClick,
  ...props
}) => {
  const sizeClasses = {
    xs: "w-6 h-6",
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-14 h-14",
  };

  const handleError = (e) => {
    e.target.src =
      fallback ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(alt || "User")}&background=random`;
  };

  return (
    <div
      className={clsx(
        "relative inline-block rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700",
        sizeClasses[size],
        onClick && "cursor-pointer",
        className,
      )}
      onClick={onClick}
      {...props}
    >
      <img
        src={
          src ||
          fallback ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(alt || "User")}&background=random`
        }
        alt={alt || "Avatar"}
        className="w-full h-full object-cover"
        onError={handleError}
      />
    </div>
  );
};

Avatar.displayName = "Avatar";

export { Avatar };
export default Avatar;
