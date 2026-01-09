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
import { FaBug, FaThumbsUp, FaUser } from "react-icons/fa"; // Example imports
import { MdOutlineMessage, MdOutlineDoneAll } from "react-icons/md";
import { GrInProgress } from "react-icons/gr";

export const TASKTYPEICON = {
  high: (
    <div className="text-red-600">
      <FaBug size={24} />
    </div>
  ),
  medium: (
    <div className="text-yellow-600">
      <FaBug size={24} />
    </div>
  ),
  low: (
    <div className="text-blue-600">
      <FaBug size={24} />
    </div>
  ),
  commented: (
    <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white">
      <MdOutlineMessage />
    </div>
  ),
  started: (
    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
      <FaThumbsUp size={20} />
    </div>
  ),
  assigned: (
    <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-500 text-white">
      <FaUser size={14} />
    </div>
  ),
  completed: (
    <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white">
      <MdOutlineDoneAll size={24} />
    </div>
  ),
  "in progress": (
    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-violet-600 text-white">
      <GrInProgress size={16} />
    </div>
  ),
};
