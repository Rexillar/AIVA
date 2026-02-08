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

// Client-side validation utility

export const isValidObjectId = (id) => {
  return (
    typeof id === "string" && id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)
  );
};
