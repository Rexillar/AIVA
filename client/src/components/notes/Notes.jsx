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
   ⟁  DOMAIN       : UI COMPONENTS

   ⟁  PURPOSE      : Provide specific functionality and operations

   ⟁  WHY          : Modular code organization and reusability

   ⟁  WHAT         : Function-based utilities and operations

   ⟁  TECH STACK   : React • Redux • Vite
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : MEDIUM
   ⟁  DOCS : /docs/frontend/components.md

   ⟁  USAGE RULES  : Follow design system • Handle props • Manage state

        "Functions implemented. Operations executed. Results delivered."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import {
  FaPlus,
  FaChevronLeft,
  FaChevronRight,
  FaFileAlt,
} from "react-icons/fa";
import { toast } from "sonner";
import {
  useGetWorkspaceNotesQuery,
  useCreateNoteMutation,
  useDeleteNoteMutation,
} from "../../redux/slices/api/noteApiSlice";
import { NotesNavBar } from "./NotesNavBar";
import NoteEditor from "./NoteEditor";
import { LoadingSpinner } from "../shared/feedback/LoadingSpinner";

const NoteCard = ({ note, isActive, onClick, onDelete }) => {
  const [showActions, setShowActions] = useState(false);

  // Helper function to strip HTML tags from content
  const stripHtml = (html) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  // Helper function to format date and time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    return `${dateStr} at ${timeStr}`;
  };

  // Get content preview
  const getContentPreview = () => {
    const plainText = stripHtml(note.content || "");
    const cleanedText = plainText.trim();

    // Check if content is just the default sticky note template
    const isDefaultStickyContent = cleanedText === "📌 Quick Note Write your thoughts here..." ||
      cleanedText.includes("Quick Note") && cleanedText.includes("Write your thoughts here");

    // Check if content is just the default simple note template
    const isDefaultSimpleContent = cleanedText === "Start writing your note..." ||
      cleanedText.includes("Start writing your note");

    if (isDefaultStickyContent || isDefaultSimpleContent || cleanedText === "") {
      return "Empty note";
    }

    return cleanedText.length > 50 ? cleanedText.substring(0, 50) + "..." : cleanedText;
  };

  return (
    <div
      className={`
        group cursor-pointer transition-all
        p-4 rounded-lg
        ${isActive
          ? "bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-500"
          : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
        }
      `}
      onClick={() => onClick(note)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <FaFileAlt className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <h3 className={`text-sm font-semibold truncate text-gray-900 dark:text-white`}>
              {note.title && note.title.trim() !== "" ? note.title : "Untitled Note"}
            </h3>
          </div>

          {/* Content preview */}
          <p className={`text-xs line-clamp-2 mb-2 ml-6 text-gray-600 dark:text-gray-400`}>
            {getContentPreview()}
          </p>

          {/* Date and time */}
          <p className={`text-xs ml-6 text-gray-500 dark:text-gray-500`}>
            {formatDateTime(note.lastEditedAt || note.updatedAt || note.createdAt)}
          </p>
        </div>

        {showActions && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note._id);
            }}
            className={`p-2 rounded-lg flex-shrink-0 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30`}
            title="Delete note"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

NoteCard.propTypes = {
  note: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string,
    content: PropTypes.string,
    mode: PropTypes.string,
    updatedAt: PropTypes.string,
    lastEditedAt: PropTypes.string,
    createdAt: PropTypes.string,
  }).isRequired,
  isActive: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export const Notes = ({ workspaceId: propWorkspaceId }) => {
  const { workspaceId: paramWorkspaceId } = useParams();
  const workspaceId = propWorkspaceId || paramWorkspaceId;

  console.log("Notes component - propWorkspaceId:", propWorkspaceId);
  console.log("Notes component - paramWorkspaceId:", paramWorkspaceId);
  console.log("Notes component - final workspaceId:", workspaceId);
  const [selectedNote, setSelectedNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const { data: notesData, isLoading, error, refetch } = useGetWorkspaceNotesQuery(workspaceId, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });

  // Debug RTK Query
  useEffect(() => {
    console.log("RTK Query state:");
    console.log("- workspaceId:", workspaceId);
    console.log("- data:", notesData);
    console.log("- isLoading:", isLoading);
    console.log("- error:", error);
  }, [workspaceId, notesData, isLoading, error]);
  const [createNote] = useCreateNoteMutation();
  const [deleteNote] = useDeleteNoteMutation();

  // Filter out trashed and archived notes
  const notes = (notesData?.notes || []).filter(
    note => note.isTrashed !== true // Allow notes that are not explicitly trashed
  );

  // Debug logging
  useEffect(() => {
    console.log("Notes component - notesData changed:", notesData);
    console.log("Notes component - filtered notes:", notes);
    console.log("Notes component - selectedNote:", selectedNote);
  }, [notesData, notes, selectedNote]);

  // Select first note by default when notes load
  const hasSelectedNote = useRef(false);
  useEffect(() => {
    if (notes.length > 0 && !hasSelectedNote.current) {
      setSelectedNote(notes[0]);
      hasSelectedNote.current = true;
    }
  }, [notes]);

  // Update selected note when notes data changes to ensure we have latest data
  useEffect(() => {
    if (selectedNote && notes.length > 0) {
      const updatedNote = notes.find(n => n._id === selectedNote._id);
      if (updatedNote && JSON.stringify(updatedNote) !== JSON.stringify(selectedNote)) {
        setSelectedNote(updatedNote);
      }
    }
  }, [notes, selectedNote]);

  const handleNewNote = async () => {
    try {
      // Calculate next note number
      const existingTitles = notes.map(n => n.title);
      let nextNumber = 1;
      let newTitle = `Note ${nextNumber}`;

      while (existingTitles.includes(newTitle)) {
        nextNumber++;
        newTitle = `Note ${nextNumber}`;
      }

      const result = await createNote({
        workspaceId,
        title: newTitle,
        content: "<p>Start writing your note...</p>",
        mode: "text",
        type: "simple",
        isTrashed: false,
        isArchived: false,
      }).unwrap();

      if (result.status && result.data) {
        // Refetch notes to ensure we have the latest list
        await refetch();
        // Set the newly created note as selected
        setSelectedNote(result.data);
        toast.success("Note created successfully");
      } else {
        toast.error("Failed to create note - no data returned");
      }
    } catch (error) {
      toast.error("Failed to create note");
      console.error("Note creation error:", error);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
      await deleteNote({ noteId, workspaceId }).unwrap();

      // Refetch notes after deletion
      await refetch();

      // Clear selection if the deleted note was selected
      if (selectedNote?._id === noteId) {
        const remainingNotes = notes.filter(n => n._id !== noteId);
        setSelectedNote(remainingNotes.length > 0 ? remainingNotes[0] : null);
      }

      toast.success("Note deleted successfully");
    } catch (error) {
      toast.error("Failed to delete note");
      console.error("Note deletion error:", error);
    }
  };

  const filteredNotes = notes.filter((note) =>
    note.title?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Debug filtered notes
  useEffect(() => {
    console.log("Filtered notes:", filteredNotes);
    console.log("Search query:", searchQuery);
  }, [filteredNotes, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar - Notes List - Positioned after main sidebar */}
      <aside
        className={`
          fixed inset-y-0 z-[110]
          border-r border-gray-200 dark:border-gray-700
          bg-white/90 dark:bg-gray-800/90 backdrop-blur-md flex flex-col
          transition-all duration-300 ease-in-out
          ${isSidebarOpen ? "w-80" : "w-16"}
          lg:flex lg:flex-col
          hidden lg:flex
        `}
        style={{
          left: 'var(--sidebar-width, 16rem)'
        }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
          {isSidebarOpen ? (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Notes</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleNewNote}
                    className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    title="Create new note"
                  >
                    <FaPlus />
                  </button>
                  <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Collapse sidebar"
                  >
                    <FaChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Search */}
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ) : (
            <div className="p-4 flex flex-col items-center gap-4">
              <button
                onClick={handleNewNote}
                className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                title="Create new note"
              >
                <FaPlus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Expand sidebar"
              >
                <FaChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Notes List */}
        {isSidebarOpen ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p className="text-sm">No notes yet</p>
                <p className="text-xs mt-2">
                  Create your first note to get started
                </p>
              </div>
            ) : (
              <div>
                {filteredNotes.map((note) => (
                  <div key={note._id}>
                    <NoteCard
                      note={note}
                      isActive={selectedNote?._id === note._id}
                      onClick={setSelectedNote}
                      onDelete={handleDeleteNote}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-2 space-y-3">
            {filteredNotes.map((note) => (
              <button
                key={note._id}
                onClick={() => setSelectedNote(note)}
                className={`
                  w-full p-3 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-110
                  ${selectedNote?._id === note._id
                    ? "bg-blue-500 text-white shadow-lg"
                    : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }
                `}
                title={note.title || "Untitled Note"}
              >
                <FaFileAlt
                  className="w-5 h-7 mx-auto transition-all duration-300 ease-in-out text-gray-500"
                  style={{
                    transform: 'rotate(-90deg) scale(1.1)',
                    transformOrigin: 'center'
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </aside>

      {/* Main Content - Note Editor or Sticky Notes Grid */}
      <main
        className="flex-1 overflow-hidden transition-all duration-300"
        style={{
          marginLeft: isSidebarOpen ? '20rem' : '4rem'
        }}
      >
        {selectedNote ? (
          <div className="h-full">
            <NoteEditor note={selectedNote} workspaceId={workspaceId} />
          </div>
        ) : filteredNotes.length > 0 ? (
          <div className="h-full overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Notes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredNotes.map((note) => (
                  <div
                    key={note._id}
                    onClick={() => setSelectedNote(note)}
                    className="group cursor-pointer"
                  >
                    <div className="p-4 rounded-lg shadow-lg transform hover:scale-105 hover:shadow-xl transition-all duration-200 min-h-[120px] flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FaFileAlt className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <h3 className="text-sm font-semibold truncate text-gray-900 dark:text-white">
                            {note.title || "Untitled Note"}
                          </h3>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNote(note._id);
                          }}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          title="Delete note"
                        >
                          ×
                        </button>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 flex-1 line-clamp-3 ml-6">
                        {(() => {
                          const tmp = document.createElement("DIV");
                          tmp.innerHTML = note.content || "";
                          const plainText = tmp.textContent || tmp.innerText || "";
                          const cleanedText = plainText.trim();

                          // Check if content is just the default simple note template
                          const isDefaultSimpleContent = cleanedText === "Start writing your note..." ||
                            cleanedText.includes("Start writing your note");

                          if (isDefaultSimpleContent || cleanedText === "") {
                            return "Empty note";
                          }

                          return cleanedText.length > 100 ? cleanedText.substring(0, 100) + "..." : cleanedText;
                        })()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-2 ml-6">
                        {(() => {
                          if (!note.lastEditedAt && !note.updatedAt && !note.createdAt) return 'No date';
                          const date = new Date(note.lastEditedAt || note.updatedAt || note.createdAt);
                          const dateStr = date.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          });
                          const timeStr = date.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          });
                          return `${dateStr} at ${timeStr}`;
                        })()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 px-4">
            <div className="text-center max-w-md">
              <FaFileAlt className="w-16 h-16 mx-auto mb-4 opacity-50 text-gray-500" />
              <p className="text-lg font-medium mb-2">
                No note selected
              </p>
              <p className="text-sm mb-4">
                Select a note from the sidebar or create a new one
              </p>
              <button
                onClick={handleNewNote}
                className="px-4 py-2 rounded-lg transition-colors bg-blue-500 hover:bg-blue-600 text-white"
              >
                Create Note
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Navigation Bar */}
      <NotesNavBar
        onNewNote={handleNewNote}
        onSearch={() => { }}
        onToggleFavorites={() => { }}
        onViewArchived={() => { }}
      />
    </div>
  );
};

Notes.propTypes = {
  workspaceId: PropTypes.string,
};

export default Notes;
