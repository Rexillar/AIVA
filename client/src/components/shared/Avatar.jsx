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
import { UserCircleIcon } from "@heroicons/react/24/outline";

const Avatar = ({ src, alt, size = "md", className = "", fallback }) => {
  const sizes = {
    xs: "h-6 w-6",
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  const getFallbackInitials = () => {
    if (!fallback) return "";
    return fallback
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!src) {
    return fallback ? (
      <div
        className={clsx(
          "inline-flex items-center justify-center rounded-full bg-gray-500 text-white",
          sizes[size],
          className,
        )}
      >
        <span
          className={clsx(
            "font-medium",
            size === "xs" && "text-xs",
            size === "sm" && "text-sm",
            size === "md" && "text-base",
            size === "lg" && "text-lg",
            size === "xl" && "text-xl",
          )}
        >
          {getFallbackInitials()}
        </span>
      </div>
    ) : (
      <UserCircleIcon
        className={clsx("text-gray-400", sizes[size], className)}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={clsx("rounded-full object-cover", sizes[size], className)}
    />
  );
};

export default Avatar;
