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
import { Tab } from "@headlessui/react";
import clsx from "clsx";

const Tabs = ({ tabs, className }) => {
  return (
    <Tab.Group>
      <Tab.List
        className={clsx(
          "flex space-x-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800",
          className,
        )}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.key}
            className={({ selected }) =>
              clsx(
                "w-full rounded-lg py-2.5 text-sm font-medium leading-5",
                "ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
                selected
                  ? "bg-white text-blue-600 shadow dark:bg-gray-700 dark:text-blue-400"
                  : "text-gray-600 hover:bg-white/[0.12] hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300",
              )
            }
          >
            {tab.label}
          </Tab>
        ))}
      </Tab.List>
      <Tab.Panels className="mt-4">
        {tabs.map((tab) => (
          <Tab.Panel
            key={tab.key}
            className={clsx(
              "rounded-xl bg-white p-3 dark:bg-gray-800",
              "ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
            )}
          >
            {tab.content}
          </Tab.Panel>
        ))}
      </Tab.Panels>
    </Tab.Group>
  );
};

export const TabItem = ({ children, className }) => {
  return <div className={clsx("space-y-4", className)}>{children}</div>;
};

export default Tabs;
