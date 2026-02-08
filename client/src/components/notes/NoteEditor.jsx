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

import React, { useState, useEffect, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import PropTypes from "prop-types";
import { useUpdateNoteMutation } from "../../redux/slices/api/noteApiSlice";
import { toast } from "sonner";
import { debounce } from "lodash";

const colors = [
  "#000000", // black
  "#FF0000", // red
  "#00FF00", // green
  "#0000FF", // blue
  "#FFA500", // orange
  "#800080", // purple
  "#FFC0CB", // pink
  "#A52A2A", // brown
];

const ColorSelector = ({ editor }) => {
  if (!editor) return null;

  return (
    <div className="flex gap-2 mb-2">
      {colors.map((color) => (
        <button
          key={color}
          onClick={() => editor.chain().focus().setColor(color).run()}
          className={`w-6 h-6 rounded-full border border-gray-300 ${editor.isActive("textStyle", { color })
            ? "ring-2 ring-offset-2 ring-blue-500"
            : ""
            }`}
          style={{ backgroundColor: color }}
          title={color}
        />
      ))}
      <button
        onClick={() => editor.chain().focus().unsetColor().run()}
        className="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
        title="Remove color"
      >
        Clear
      </button>
    </div>
  );
};

const NoteEditor = ({ note, workspaceId }) => {
  const [title, setTitle] = useState("");
  const [updateNote] = useUpdateNoteMutation();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedNoteId, setLastSavedNoteId] = useState(null);
  const [isContentLoaded, setIsContentLoaded] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit, TextStyle, Color],
    content: "<p></p>",
    editable: true,
    onUpdate: ({ editor }) => {
      if (isContentLoaded) {
        const html = editor.getHTML();
        debouncedSave({ content: html });
      }
    },
  });

  // Load note content and title when note changes
  useEffect(() => {
    if (editor && editor.isEditable && note && note._id) {
      // Check if we're switching to a different note
      const isDifferentNote = lastSavedNoteId !== note._id;

      if (isDifferentNote) {
        console.log("Loading note:", note._id, "Title:", note.title, "Content length:", note.content?.length);

        // Disable content loaded flag during update
        setIsContentLoaded(false);

        // Update editor content
        const noteContent = note.content || "<p>Start writing...</p>";
        console.log("Setting editor content:", noteContent);

        // Use setTimeout to ensure editor is ready
        setTimeout(() => {
          if (editor && editor.commands) {
            editor.commands.setContent(noteContent, false);

            // Verify content was set
            setTimeout(() => {
              const currentContent = editor.getHTML();
              console.log("Editor content after setting:", currentContent);
            }, 50);
          }
        }, 50);

        // Update title
        const noteTitle = note.title || "";
        setTitle(noteTitle);

        // Update tracking
        setLastSavedNoteId(note._id);

        // Re-enable content loaded flag after a brief delay
        setTimeout(() => {
          setIsContentLoaded(true);
        }, 200);
      }
    }
  }, [note, editor, lastSavedNoteId]);

  const debouncedSave = useCallback( // eslint-disable-line react-hooks/exhaustive-deps
    debounce(async (updates) => {
      if (!note?._id || !workspaceId) {
        console.warn("Cannot save: missing note ID or workspace ID");
        return;
      }

      setIsSaving(true);
      try {
        const result = await updateNote({
          noteId: note._id,
          workspaceId,
          ...updates,
        }).unwrap();

        if (result.status) {
          toast.success("Saved", {
            duration: 1000,
            position: "bottom-right",
          });
        }
      } catch (error) {
        console.error("Save error:", error);
        toast.error("Failed to save changes", {
          duration: 2000,
          position: "bottom-right",
        });
      } finally {
        setIsSaving(false);
      }
    }, 1500),
    [note?._id, workspaceId, updateNote],
  );

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);

    // Save the title change immediately with debounce
    if (note?._id && workspaceId) {
      console.log("Saving title:", newTitle, "for note:", note._id);
      debouncedSave({ title: newTitle });
    } else {
      console.warn("Cannot save title - missing note ID or workspace ID");
    }
  };

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  // Return early if no note is provided
  if (!note) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
        <p>No note selected</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header with Title and Save Status */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-gray-100 dark:border-gray-800">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Untitled Note"
          className="flex-1 text-3xl font-bold bg-transparent focus:outline-none border-none placeholder:text-gray-400 dark:placeholder:text-gray-600 text-gray-900 dark:text-gray-100"
        />
        {isSaving && (
          <div className="text-sm text-blue-500 dark:text-blue-400 font-medium animate-pulse ml-4">
            Saving...
          </div>
        )}
        {!isSaving && lastSavedNoteId === note._id && (
          <div className="text-sm text-green-500 dark:text-green-400 font-medium ml-4">
            Saved
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="px-8 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium mr-2">
              Text Color:
            </span>
            <ColorSelector editor={editor} />
          </div>
        </div>

        {/* Editor Canvas */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="max-w-4xl mx-auto">
            <EditorContent
              editor={editor}
              className="prose prose-lg dark:prose-invert max-w-none min-h-[calc(100vh-300px)] focus:outline-none
                [&_.ProseMirror]:outline-none
                [&_.ProseMirror]:border-none
                [&_.ProseMirror]:min-h-[calc(100vh-300px)]
                [&_.ProseMirror]:text-base
                [&_.ProseMirror]:leading-relaxed
                [&_.ProseMirror]:text-gray-900
                [&_.ProseMirror]:dark:text-gray-100
                [&_.ProseMirror_p]:my-2
                [&_.ProseMirror_p]:text-gray-900
                [&_.ProseMirror_p]:dark:text-gray-100"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

ColorSelector.propTypes = {
  editor: PropTypes.object,
};

NoteEditor.propTypes = {
  note: PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string,
    content: PropTypes.string,
  }),
  workspaceId: PropTypes.string,
};

export default NoteEditor;
