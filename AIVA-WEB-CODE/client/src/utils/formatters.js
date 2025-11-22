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
import { format, parseISO, isValid } from "date-fns";

// Format date to day-month-year
export const formatDate = (date) => {
  if (!date) return "Invalid Date";
  const month = date.toLocaleString("en-US", { month: "short" });
  const day = date.getDate();
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

// Format date string to yyyy-mm-dd
export const dateFormatter = (dateString) => {
  const inputDate = new Date(dateString);
  if (isNaN(inputDate)) return "Invalid Date";

  const year = inputDate.getFullYear();
  const month = String(inputDate.getMonth() + 1).padStart(2, "0");
  const day = String(inputDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Format date with fallback
export const formatDateWithFallback = (dateString) => {
  if (!dateString) return "Not set";
  const date =
    typeof dateString === "string" ? parseISO(dateString) : dateString;
  return isValid(date) ? format(date, "MMM d, yyyy") : "Invalid date";
};

// Get user initials from name
export const getInitials = (name) => {
  if (!name) return "";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};
