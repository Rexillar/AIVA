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
// Client-side validation utility

export const isValidObjectId = (id) => {
  return (
    typeof id === "string" && id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)
  );
};
