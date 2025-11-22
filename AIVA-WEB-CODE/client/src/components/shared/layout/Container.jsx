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
import clsx from "clsx";

const Container = ({
  children,
  className,
  size = "default",
  padding = true,
  fluid,
  ...props
}) => {
  const maxWidths = {
    sm: "max-w-screen-sm",
    md: "max-w-screen-md",
    lg: "max-w-screen-lg",
    xl: "max-w-screen-xl",
    "2xl": "max-w-screen-2xl",
    default: "max-w-7xl",
  };

  return (
    <div
      className={clsx(
        "w-full mx-auto",
        !fluid && maxWidths[size],
        padding && "px-4 sm:px-6 lg:px-8",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

Container.displayName = "Container";
export { Container };
export default Container;
