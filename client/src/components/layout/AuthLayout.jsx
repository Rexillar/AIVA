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
import React, { useEffect, useRef } from "react";
import { AuthNav } from "./navigation/AuthNav";
import { Outlet } from "react-router-dom";

export const AuthLayout = () => {
  const glowRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!glowRef.current) return;

      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;

      const x = clientX / innerWidth;
      const y = clientY / innerHeight;

      glowRef.current.style.setProperty("--mouse-x", `${x * 100}%`);
      glowRef.current.style.setProperty("--mouse-y", `${y * 100}%`);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <main className="min-h-screen bg-[#0F172A] relative overflow-hidden">
      <AuthNav />

      {/* Main Content */}
      <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </section>

      {/* Animated Background Elements */}
      <div aria-hidden="true" className="fixed inset-0 z-0">
        {/* Base gradient layer */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0F172A]" />

        {/* Morphic pattern */}
        <div className="absolute inset-0 opacity-30">
          {/* Top-left morphic shape */}
          <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-3xl animate-float" />

          {/* Bottom-right morphic shape */}
          <div
            className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-tl from-purple-500/20 to-transparent rounded-full blur-3xl animate-float-slow"
            style={{ animationDelay: "-5s" }}
          />

          {/* Center morphic shape */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-gradient-to-r from-pink-500/20 via-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse-slow" />
        </div>

        {/* Morphic grid pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full bg-[linear-gradient(transparent_0%,_rgba(255,255,255,0.05)_50%,_transparent_100%)_0_0_/_100%_8px_repeat-y,_linear-gradient(90deg,_transparent_0%,_rgba(255,255,255,0.05)_50%,_transparent_100%)_0_0_/_8px_100%_repeat-x]" />
        </div>

        {/* Interactive glow effect */}
        <div
          ref={glowRef}
          className="absolute inset-0 opacity-30 transition-all duration-500"
          style={{
            background:
              "radial-gradient(circle 50vw at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(56, 189, 248, 0.15), transparent 100%)",
          }}
        />

        {/* Mesh gradient overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent to-[#0F172A]/90 opacity-80" />
      </div>

      {/* Vignette effect */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-[2] bg-gradient-radial from-transparent to-black/20"
      />
    </main>
  );
};
