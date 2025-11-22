/*=================================================================
| * Project: AIVA-WEB
| * File: Notes.jsx
| * Author: Mohitraj Jadeja
| * Date Created: February 28, 2024
| * Last Modified: October 24, 2025
| *=================================================================
| * Description:
| * Notes page component for displaying and managing workspace notes.
| * Integrates the Notes component for note management functionality.
| *=================================================================
| * Copyright (c) 2025 Mohitraj Jadeja. All rights reserved.
| *=================================================================*/
// eslint-disable-next-line no-unused-vars
import React from "react";
import { useParams } from "react-router-dom";
import Notes from "../components/notes/Notes";

const NotesPage = () => {
  const { workspaceId } = useParams();

  return <Notes workspaceId={workspaceId} />;
};

export default NotesPage;
