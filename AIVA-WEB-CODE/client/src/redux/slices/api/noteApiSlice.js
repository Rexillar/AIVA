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
import { apiSlice } from "../../slices/apiSlice";

const NOTES_URL = "/notes";

// Helper function to validate workspace ID
const isValidWorkspaceId = (id) => id && /^[0-9a-fA-F]{24}$/.test(id);

export const noteApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all notes for a workspace
    getWorkspaceNotes: builder.query({
      query: (workspaceId) => {
        if (!isValidWorkspaceId(workspaceId)) {
          throw new Error("Invalid workspace ID");
        }
        return {
          url: NOTES_URL,
          method: "GET",
          params: { workspace: workspaceId },
        };
      },
      transformResponse: (response) => {
        if (!response?.status) {
          return { notes: [] };
        }
        return {
          status: true,
          notes: response.data || [],
        };
      },
      providesTags: (result, error, workspaceId) => [
        { type: "Note", id: workspaceId },
        "Note",
      ],
    }),

    // Get a single note by ID
    getNote: builder.query({
      query: (noteId) => ({
        url: `${NOTES_URL}/${noteId}`,
        method: "GET",
      }),
      transformResponse: (response) => {
        if (!response?.status) {
          return null;
        }
        return response.data;
      },
      providesTags: (result, error, noteId) => [{ type: "Note", id: noteId }],
    }),

    // Create a new note
    createNote: builder.mutation({
      query: ({ workspaceId, ...data }) => ({
        url: NOTES_URL,
        method: "POST",
        body: { ...data, workspace: workspaceId },
      }),
      transformResponse: (response) => ({
        status: response.status,
        data: response.data,
      }),
      invalidatesTags: (result, error, { workspaceId }) => [
        { type: "Note", id: workspaceId },
        "Note",
      ],
    }),

    // Update a note
    updateNote: builder.mutation({
      query: ({ noteId, ...data }) => ({
        url: `${NOTES_URL}/${noteId}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response) => ({
        status: response.status,
        data: response.data,
      }),
      invalidatesTags: (result, error, { workspaceId, noteId }) => [
        { type: "Note", id: workspaceId },
        { type: "Note", id: noteId },
        "Note",
      ],
    }),

    // Delete a note
    deleteNote: builder.mutation({
      query: ({ noteId }) => ({
        url: `${NOTES_URL}/${noteId}`,
        method: "DELETE",
      }),
      transformResponse: (response) => ({
        status: response.status,
        message: response.message,
      }),
      invalidatesTags: (result, error, { workspaceId }) => [
        { type: "Note", id: workspaceId },
        "Note",
      ],
    }),

    // Share a note with other users
    shareNote: builder.mutation({
      query: ({ noteId, users }) => ({
        url: `${NOTES_URL}/${noteId}/share`,
        method: "POST",
        body: { users },
      }),
      transformResponse: (response) => ({
        status: response.status,
        data: response.data,
      }),
      invalidatesTags: (result, error, { noteId }) => [
        { type: "Note", id: noteId },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetWorkspaceNotesQuery,
  useGetNoteQuery,
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
  useShareNoteMutation,
} = noteApiSlice;
