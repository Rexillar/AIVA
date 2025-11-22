/*=================================================================
 * Project: AIVA-WEB
 * File: BoardView.jsx
 * Author: Mohitraj Jadeja
 * Date Created: February 28, 2024
 * Last Modified: February 28, 2024
 *=================================================================
 * Description:
 * BoardView component for displaying the board view.
 *=================================================================
 * Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
 *=================================================================*/
import React from "react";
import TaskCard from "../../tasks/cards/TaskCard";

const BoardView = ({ tasks }) => {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="w-full py-4 text-center">
        <p>No tasks available</p>
      </div>
    );
  }

  return (
    <div className="w-full py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 2xl:gap-10">
      {tasks.map((task, index) => (
        <TaskCard task={task} key={index} />
      ))}
    </div>
  );
};

export default BoardView;
