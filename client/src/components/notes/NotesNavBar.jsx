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


import React, { useState, useEffect } from "react";
import { FaPlus, FaSearch, FaTrash, FaStar, FaFolder } from "react-icons/fa";

const NavButton = ({ icon: Icon, label, onClick, isActive }) => (
  <button
    onClick={onClick}
    className={`
      group flex flex-col items-center justify-center p-2 rounded-xl
      transition-all duration-200 hover:bg-white/10 backdrop-blur-md
      ${isActive ? "text-blue-400" : "text-gray-400 hover:text-gray-200"}
    `}
    title={label}
  >
    <Icon className="w-5 h-5 mb-1 transition-transform duration-200 group-hover:scale-110" />
    <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      {label}
    </span>
  </button>
);

export const NotesNavBar = ({
  onNewNote,
  onSearch,
  onToggleFavorites,
  onViewArchived,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const windowHeight = window.innerHeight;

      // Show navbar when mouse is near the bottom center of the screen
      const isNearBottom = clientY > windowHeight - 100;
      const isNearCenter =
        clientX > window.innerWidth / 2 - 200 &&
        clientX < window.innerWidth / 2 + 200;

      setMousePosition({ x: clientX, y: clientY });
      setIsVisible(isNearBottom && isNearCenter);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      className={`
        fixed bottom-8 left-1/2 transform -translate-x-1/2
        flex items-center gap-4 p-2 rounded-2xl
        bg-gray-800/80 backdrop-blur-md shadow-lg
        transition-all duration-300 ease-in-out
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"}
      `}
      style={{
        width: "auto",
        minWidth: "300px",
        zIndex: 1000,
      }}
    >
      <NavButton icon={FaPlus} label="New Note" onClick={onNewNote} />
      <NavButton icon={FaSearch} label="Search" onClick={onSearch} />
      <NavButton icon={FaStar} label="Favorites" onClick={onToggleFavorites} />
      <NavButton icon={FaFolder} label="Folders" onClick={() => {}} />
      <NavButton icon={FaTrash} label="Trash" onClick={onViewArchived} />
    </div>
  );
};
