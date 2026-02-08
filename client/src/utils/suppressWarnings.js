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

// Suppress specific React warnings in development
export const suppressWarnings = () => {
  if (process.env.NODE_ENV !== "production") {
    const originalError = console.error;
    console.error = (...args) => {
      if (args[0]?.includes?.('defaultProps')) return;
      if (args[0]?.includes?.('Support for defaultProps')) return;
      originalError.call(console, ...args);
    };
  }
};

// Call this once at app startup
suppressWarnings();
