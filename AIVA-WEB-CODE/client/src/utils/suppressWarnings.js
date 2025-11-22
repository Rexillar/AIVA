/*=================================================================
 * Project: AIVA-WEB
 * File: Button.jsx
 * Author: Mohitraj Jadeja
 * Date Created: February 28, 2024
 * Last Modified: February 28, 2024
 *=================================================================
 * Description:
 * Button component for displaying buttons.
 *=================================================================
 * Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
 *=================================================================*/
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
