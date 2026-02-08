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
   ⟁  DOMAIN       : UNKNOWN

   ⟁  PURPOSE      : Provide specific functionality and operations

   ⟁  WHY          : Modular code organization and reusability

   ⟁  WHAT         : Function-based utilities and operations

   ⟁  TECH STACK   : React • Redux • Vite
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : UNKNOWN
   ⟁  DOCS : /docs/frontend/components.md

   ⟁  USAGE RULES  : UNKNOWN

        "Functions implemented. Operations executed. Results delivered."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const STORAGE_KEY = "aiva_last_position";

export const useLastPosition = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Save current position
  useEffect(() => {
    if (isAuthenticated && location.pathname !== "/log-in") {
      const position = {
        pathname: location.pathname,
        search: location.search,
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
    }
  }, [location.pathname, location.search, isAuthenticated]);

  // Restore position
  useEffect(() => {
    // Skip position restoration if we're coming from registration
    const isFromRegistration = sessionStorage.getItem("registrationComplete");

    if (
      isAuthenticated &&
      (location.pathname === "/" || location.pathname === "/dashboard") &&
      !isFromRegistration
    ) {
      try {
        const savedPosition = localStorage.getItem(STORAGE_KEY);
        if (savedPosition) {
          const { pathname, search, timestamp } = JSON.parse(savedPosition);

          // Check if saved position is not too old (24 hours)
          const isValid = Date.now() - timestamp < 24 * 60 * 60 * 1000;

          if (isValid && pathname && pathname !== "/") {
            navigate(pathname + (search || ""), { replace: true });
          }
        }
      } catch (error) {
        //console.error('Error restoring last position:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    // Clear the registration flag after checking
    if (isFromRegistration) {
      sessionStorage.removeItem("registrationComplete");
    }
  }, [isAuthenticated, location.pathname, navigate]);
};
