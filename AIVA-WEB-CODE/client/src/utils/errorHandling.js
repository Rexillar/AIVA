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
export const handleApiError = (error, toast) => {
  //console.error('API Error:', error);

  if (error.status === "FETCH_ERROR") {
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
