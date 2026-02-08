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
   ⟁  DOMAIN       : UTILITIES

   ⟁  PURPOSE      : Provide frontend utility functions

   ⟁  WHY          : Code reusability and consistent behavior

   ⟁  WHAT         : Helper functions for frontend operations

   ⟁  TECH STACK   : React • Redux • Vite
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : LOW
   ⟁  DOCS : /docs/frontend/components.md

   ⟁  USAGE RULES  : Pure functions • Error handling • Documentation

        "Utilities provided. Code simplified. Development efficient."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

export const handleApiError = (error, toast, suppressNetworkErrors = true) => {
  console.error('API Error:', error);

  // Silently handle network connectivity errors if suppressNetworkErrors is true
  if (suppressNetworkErrors && error.status === "FETCH_ERROR") {
    // Log network errors but don't show annoying toasts to user
    console.warn('Network connectivity issue detected, error suppressed');
    return;
  }

  // Legacy behavior for when network errors should be shown
  if (!suppressNetworkErrors && error.status === "FETCH_ERROR") {
    toast.error("Connection error. Please check your internet connection.");
    return;
  }

  if (error.status === 403) {
    toast.error("You don't have permission to perform this action");
    return;
  }

  if (error.status === 404) {
    toast.error("The requested resource was not found");
    return;
  }

  toast.error(error?.data?.message || "An unexpected error occurred");
};
