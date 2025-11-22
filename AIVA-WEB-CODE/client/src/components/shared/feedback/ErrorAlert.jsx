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
import React from "react";

const ErrorAlert = ({ message }) => (
  <div
    className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
    role="alert"
  >
    <span className="block sm:inline">{message}</span>
  </div>
);

ErrorAlert.displayName = "ErrorAlert";
export { ErrorAlert };
export default ErrorAlert;
