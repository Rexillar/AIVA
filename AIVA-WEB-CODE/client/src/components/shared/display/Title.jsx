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

const Title = ({ children, className = "" }) => {
  return (
    <h1
      className={`text-2xl font-bold text-gray-900 dark:text-white ${className}`}
    >
      {children}
    </h1>
  );
};

export default Title;
