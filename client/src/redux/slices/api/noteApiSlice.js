/*═══════════════════════════════════════════════════════════════════════════════

        █████╗ ██╗██╗   ██╗ █████╗
       ██╔══██╗██║██║   ██║██╔══██╗
       ███████║██║██║   ██║███████║
       ██╔══██║██║╚██╗ ██╔╝██╔══██║
       ██║  ██║██║ ╚████╔╝ ██║  ██║
       ╚═╝  ╚═╝╚═╝  ╚═══╝  ╚═╝  ╚═╝

   ──◈──  A I V A  ::  A I   V I R T U A L   A S S I S T A N T  ──◈──

   ◉  Deterministic Execution System
   ◉  Rule-Bound • State-Aware • Non-Emotive

   ⟁  SYSTEM LAYER : FRONTEND CORE
   ⟁  DOMAIN       : STATE MANAGEMENT

   ⟁  PURPOSE      : Provide specific functionality and operations

   ⟁  WHY          : Modular code organization and reusability

   ⟁  WHAT         : Function-based utilities and operations

   ⟁  TECH STACK   : React • Redux • Vite
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : HIGH
   ⟁  DOCS : /docs/frontend/state-management.md

   ⟁  USAGE RULES  : Immutable updates • Action types • Error handling

        "Functions implemented. Operations executed. Results delivered."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

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

    // AI Smart Format - parse & format unstructured text using Gemini
    aiFormatContent: builder.mutation({
      query: ({ noteId, text, outputFormat, customInstruction }) => ({
        url: `${NOTES_URL}/${noteId}/ai-format`,
        method: "POST",
        body: { text, outputFormat, customInstruction },
      }),
      transformResponse: (response) => ({
        status: response.status,
        data: response.data,
      }),
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
  useAiFormatContentMutation,
} = noteApiSlice;
