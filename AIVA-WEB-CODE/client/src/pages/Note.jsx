/*=================================================================
 * Project: AIVA-WEB
 * File: Note.jsx
 * Author: Mohitraj Jadeja
 * Date Created: February 28, 2024
 * Last Modified: October 24, 2025
 *=================================================================
 * Description:
 * Notes page component that integrates the Notes component
 * with workspace layout for managing and editing notes.
 *=================================================================
 * Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
 *=================================================================*/
import { useParams } from "react-router-dom";
import Notes from "../components/notes/Notes";

const Note = () => {
  const { workspaceId } = useParams();

  return <Notes workspaceId={workspaceId} />;
};

export default Note;
