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
import { Toaster } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

const ToastConfig = () => {
  const { theme } = useTheme();

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: theme === "dark" ? "#1F2937" : "#FFFFFF",
          color: theme === "dark" ? "#F3F4F6" : "#1F2937",
          border: "1px solid",
          borderColor: theme === "dark" ? "#374151" : "#E5E7EB",
        },
        offset: 20,
        duration: 2000,
        closeButton: true,
      }}
      gap={8}
      expand={false}
      richColors
    />
  );
};

export default ToastConfig;
