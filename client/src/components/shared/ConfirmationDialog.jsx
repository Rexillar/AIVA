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
import React, { useState, useEffect, useCallback } from 'react';

/**
 * ConfirmationDialog Component
 * 
 * Displays explicit options with buttons rather than relying on
 * natural language parsing. Locks assistant state until user
 * explicitly selects an option.
 * 
 * Props:
 * - isOpen: boolean - Whether dialog is visible
 * - title: string - Dialog title
 * - message: string - Main message/question
 * - options: array - Array of option objects {id, label, description, icon}
 * - onSelect: function - Callback when option is selected (receives option.id)
 * - onCancel: function - Callback when user cancels
 * - loading: boolean - Whether action is in progress
 * - assistantMessage: string - Optional assistant message to display
 */
export const ConfirmationDialog = ({
  isOpen,
  title,
  message,
  options = [],
  onSelect,
  onCancel,
  loading = false,
  assistantMessage = ''
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const handleOptionSelect = useCallback((optionId) => {
    if (loading) return;
    setSelectedOptionId(optionId);
    onSelect(optionId);
  }, [loading, onSelect]);

  const handleCancel = useCallback(() => {
    if (loading) return;
    setSelectedOptionId(null);
    onCancel();
  }, [loading, onCancel]);

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedOptionId(null);
      setHighlightedIndex(0);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          setHighlightedIndex((prev) => (prev + 1) % options.length);
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          setHighlightedIndex(
            (prev) => (prev - 1 + options.length) % options.length
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (options[highlightedIndex]) {
            handleOptionSelect(options[highlightedIndex].id);
          }
          break;
        case 'Escape':
          e.preventDefault();
          handleCancel();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, highlightedIndex, options, handleCancel, handleOptionSelect]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-11/12 max-h-[90vh] overflow-y-auto flex flex-col animate-slideUp">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{title}</h2>
          <button
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleCancel}
            disabled={loading}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {/* Message Section */}
        <div className="p-6 flex-grow">
          <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300 mb-4">
            {message}
          </p>
          {assistantMessage && (
            <div className="flex gap-3 items-start bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-400 p-4 rounded-lg mt-2">
              <span className="text-lg flex-shrink-0">🤖</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-snug">
                {assistantMessage}
              </p>
            </div>
          )}
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-6 pb-4 min-h-[120px]">
          {options.map((option, index) => (
            <button
              key={option.id}
              className={`flex items-start gap-3 p-4 border-2 rounded-lg transition-all text-left relative
                ${highlightedIndex === index 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500 ring-offset-2' 
                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700'
                }
                ${selectedOptionId === option.id 
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                  : ''
                }
                ${loading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:shadow-md'}
              `}
              onClick={() => handleOptionSelect(option.id)}
              disabled={loading}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {option.icon && (
                <span className="text-2xl flex-shrink-0 flex items-center justify-center w-8 h-8">
                  {option.icon}
                </span>
              )}
              <div className="flex-grow">
                <p className="text-base font-medium text-gray-900 dark:text-white mb-1">
                  {option.label}
                </p>
                {option.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-tight">
                    {option.description}
                  </p>
                )}
              </div>
              {selectedOptionId === option.id && loading && (
                <div className="absolute top-1/2 right-4 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-gray-700 gap-3 flex-wrap">
          <p className="text-xs text-gray-500 dark:text-gray-400 order-2 sm:order-1 w-full sm:w-auto text-center sm:text-left">
            Use ↑↓ arrows to navigate, Enter to select, or Esc to cancel
          </p>
          <button
            className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium transition-all hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ConfirmationDialog;
