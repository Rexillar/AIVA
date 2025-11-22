/*=================================================================
 * Project: AIVA-WEB
 * File: executeAction.js
 * Author: AI Integration - Chatbot Module
 * Date Created: October 21, 2025
 * Last Modified: October 21, 2025
 *=================================================================
 * Description:
 * Handles execution of actions from the chatbot, including API calls
 *=================================================================
 * Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
 *=================================================================*/

// Removed hook imports and usage as this file should not use hooks
// import { useCreateHabitMutation, useUpdateHabitMutation } from '../../../redux/slices/api/habitApiSlice';

const executeAction = async (action, onSuccess, onError) => {
  try {
    // Handle non-API actions here if any (e.g., local state changes)
    // For now, since habits are handled in Chatbot.jsx, this can be a no-op or throw for unsupported actions
    switch (action.endpoint) {
      // Add cases for non-habit actions if needed
      default:
        throw new Error(`Unhandled action endpoint: ${action.endpoint}`);
    }
  } catch (error) {
    onError(error.message || "Action failed");
  }
};

export default executeAction;
