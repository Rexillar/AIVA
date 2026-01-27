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
import { Link, useLocation } from "react-router-dom";

export const AuthNav = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/log-in";
  const isRegisterPage = location.pathname === "/register";

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-7xl">
      <div className="relative backdrop-blur-xl bg-white/[0.02] border border-white/[0.05] rounded-2xl shadow-2xl">
        {/* Morphic glow effect */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-30 rounded-2xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent rounded-2xl" />
        </div>

        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center group">
                <img
                  src="/7.png"
                  alt="Logo"
                  className="h-8 w-auto filter brightness-110 group-hover:brightness-125 group-hover:scale-105 transition-all duration-300"
                />
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center space-x-4">
              <Link
                to="/log-in"
                className={`relative group px-6 py-2 rounded-xl overflow-hidden ${
                  isLoginPage ? "pointer-events-none" : ""
                }`}
              >
                {/* Active state background */}
                {isLoginPage && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl" />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-xl animate-border-flow" />
                    <div className="absolute inset-0 bg-white/5 rounded-xl" />
                  </>
                )}

                {/* Background layers */}
                <div
                  className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                    isLoginPage
                      ? ""
                      : "bg-white/[0.03] group-hover:bg-white/[0.08]"
                  }`}
                />

                {/* Border gradient */}
                <div
                  className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${
                    isLoginPage
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <div className="absolute inset-[-1px] rounded-xl bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-pink-500/50 animate-border-flow" />
                </div>

                {/* Shine effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700">
                  <div className="absolute inset-[-100%] bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-45 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                </div>

                <span
                  className={`relative font-medium transition-all duration-300 ${
                    isLoginPage
                      ? "text-white scale-105"
                      : "text-gray-300/90 group-hover:text-white group-hover:scale-105"
                  }`}
                >
                  Log In
                </span>
              </Link>

              <Link
                to="/register"
                className={`relative group px-6 py-2 rounded-xl overflow-hidden ${
                  isRegisterPage ? "pointer-events-none" : ""
                }`}
              >
                {/* Active state background */}
                {isRegisterPage && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl" />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-xl animate-border-flow" />
                    <div className="absolute inset-0 bg-white/5 rounded-xl" />
                  </>
                )}

                {/* Background layers */}
                <div
                  className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                    isRegisterPage
                      ? ""
                      : "bg-white/[0.03] group-hover:bg-white/[0.08]"
                  }`}
                />

                {/* Border gradient */}
                <div
                  className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${
                    isRegisterPage
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <div className="absolute inset-[-1px] rounded-xl bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-pink-500/50 animate-border-flow" />
                </div>

                {/* Shine effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700">
                  <div className="absolute inset-[-100%] bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-45 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                </div>

                <span
                  className={`relative font-medium transition-all duration-300 ${
                    isRegisterPage
                      ? "text-white scale-105"
                      : "text-gray-300/90 group-hover:text-white group-hover:scale-105"
                  }`}
                >
                  Register
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
