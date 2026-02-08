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
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import PropTypes from "prop-types";
import { useUpdateNoteMutation } from "../../redux/slices/api/noteApiSlice";
import { toast } from "sonner";
import { debounce } from "lodash";
import {
  FaBold, FaItalic, FaUnderline, FaStrikethrough,
  FaAlignLeft, FaAlignCenter, FaAlignRight, FaAlignJustify,
  FaListUl, FaListOl, FaQuoteRight, FaCode,
  FaUndo, FaRedo, FaHighlighter, FaSubscript, FaSuperscript,
  FaRemoveFormat, FaParagraph
} from "react-icons/fa";

const textColors = [
  "#000000", "#FF0000", "#00FF00", "#0000FF",
  "#FFA500", "#800080", "#FFC0CB", "#A52A2A"
];

const highlightColors = [
  "#FFFF00", "#00FFFF", "#FF00FF", "#90EE90",
  "#FFB6C1", "#FFA500", "#87CEEB", "#DDA0DD"
];

const EditorToolbar = ({ editor }) => {
  if (!editor) return null;

  const ToolbarButton = ({ onClick, active, icon: Icon, title }) => (
    <button
      onClick={onClick}
      className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${active ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
        }`}
      title={title}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-10">
      {/* Main Toolbar */}
      <div className="px-4 py-2 flex flex-wrap items-center gap-1">
        {/* Undo/Redo */}
        <div className="flex gap-1 pr-2 border-r border-gray-300 dark:border-gray-600">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            icon={FaUndo}
            title="Undo (Ctrl+Z)"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            icon={FaRedo}
            title="Redo (Ctrl+Y)"
          />
        </div>

        {/* Headings */}
        <select
          onChange={(e) => {
            const level = parseInt(e.target.value);
            if (level === 0) {
              editor.chain().focus().setParagraph().run();
            } else {
              editor.chain().focus().setHeading({ level }).run();
            }
          }}
          className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          title="Heading Level"
        >
          <option value="0">Normal</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
          <option value="4">Heading 4</option>
          <option value="5">Heading 5</option>
          <option value="6">Heading 6</option>
        </select>

        {/* Text Formatting */}
        <div className="flex gap-1 px-2 border-r border-gray-300 dark:border-gray-600">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            icon={FaBold}
            title="Bold (Ctrl+B)"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            icon={FaItalic}
            title="Italic (Ctrl+I)"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive("underline")}
            icon={FaUnderline}
            title="Underline (Ctrl+U)"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive("strike")}
            icon={FaStrikethrough}
            title="Strikethrough"
          />
        </div>

        {/* Sub/Superscript */}
        <div className="flex gap-1 px-2 border-r border-gray-300 dark:border-gray-600">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            active={editor.isActive("subscript")}
            icon={FaSubscript}
            title="Subscript"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            active={editor.isActive("superscript")}
            icon={FaSuperscript}
            title="Superscript"
          />
        </div>

        {/* Text Color */}
        <div className="flex gap-1 items-center px-2 border-r border-gray-300 dark:border-gray-600">
          <span className="text-xs text-gray-600 dark:text-gray-400">Color:</span>
          {textColors.map((color) => (
            <button
              key={color}
              onClick={() => editor.chain().focus().setColor(color).run()}
              className={`w-5 h-5 rounded border border-gray-300 dark:border-gray-600 ${editor.isActive("textStyle", { color }) ? "ring-2 ring-blue-500" : ""
                }`}
              style={{ backgroundColor: color }}
              title={`Text color ${color}`}
            />
          ))}
          <button
            onClick={() => editor.chain().focus().unsetColor().run()}
            className="px-1 py-0.5 text-xs bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
            title="Clear color"
          >
            ✕
          </button>
        </div>

        {/* Highlight */}
        <div className="flex gap-1 items-center px-2 border-r border-gray-300 dark:border-gray-600">
          <FaHighlighter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          {highlightColors.map((color) => (
            <button
              key={color}
              onClick={() => editor.chain().focus().toggleHighlight({ color }).run()}
              className={`w-5 h-5 rounded border border-gray-300 dark:border-gray-600 ${editor.isActive("highlight", { color }) ? "ring-2 ring-blue-500" : ""
                }`}
              style={{ backgroundColor: color }}
              title={`Highlight ${color}`}
            />
          ))}
          <button
            onClick={() => editor.chain().focus().unsetHighlight().run()}
            className="px-1 py-0.5 text-xs bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
            title="Clear highlight"
          >
            ✕
          </button>
        </div>

        {/* Alignment */}
        <div className="flex gap-1 px-2 border-r border-gray-300 dark:border-gray-600">
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            active={editor.isActive({ textAlign: "left" })}
            icon={FaAlignLeft}
            title="Align Left"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            active={editor.isActive({ textAlign: "center" })}
            icon={FaAlignCenter}
            title="Align Center"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            active={editor.isActive({ textAlign: "right" })}
            icon={FaAlignRight}
            title="Align Right"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            active={editor.isActive({ textAlign: "justify" })}
            icon={FaAlignJustify}
            title="Justify"
          />
        </div>

        {/* Lists */}
        <div className="flex gap-1 px-2 border-r border-gray-300 dark:border-gray-600">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
            icon={FaListUl}
            title="Bullet List"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
            icon={FaListOl}
            title="Numbered List"
          />
        </div>

        {/* Other */}
        <div className="flex gap-1 px-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
            icon={FaQuoteRight}
            title="Blockquote"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive("codeBlock")}
            icon={FaCode}
            title="Code Block"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
            icon={FaRemoveFormat}
            title="Clear Formatting"
          />
        </div>
      </div>
    </div>
  );
};

const NoteEditor = ({ note, workspaceId }) => {
  const [title, setTitle] = useState("");
  const [updateNote] = useUpdateNoteMutation();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedNoteId, setLastSavedNoteId] = useState(null);
  const [isContentLoaded, setIsContentLoaded] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+F or Cmd+F for Find
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setShowFindReplace(true);
      }
      // Escape to close find/replace
      if (e.key === 'Escape' && showFindReplace) {
        setShowFindReplace(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showFindReplace]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Underline,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
      }),
      Subscript,
      Superscript,
    ],
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
          placeholder="Note title"
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
        <EditorToolbar editor={editor} />

        {/* Find & Replace Panel */}
        {showFindReplace && (
          <div className="px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 flex items-center gap-3">
            <input
              type="text"
              placeholder="Find..."
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800"
            />
            <input
              type="text"
              placeholder="Replace with..."
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800"
            />
            <button
              onClick={() => {
                if (editor && findText) {
                  const content = editor.getText();
                  const regex = new RegExp(findText, 'gi');
                  const newContent = content.replace(regex, replaceText);
                  editor.commands.setContent(newContent);
                }
              }}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Replace All
            </button>
            <button
              onClick={() => setShowFindReplace(false)}
              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Close
            </button>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Press Ctrl+F to find, Esc to close
            </span>
          </div>
        )}

        {/* Editor Canvas */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="max-w-4xl mx-auto">
            <EditorContent
              editor={editor}
              className="prose prose-lg dark:prose-invert max-w-none min-h-[calc(100vh-300px)] focus:outline-none
                select-text
                [&_.ProseMirror]:outline-none
                [&_.ProseMirror]:border-none
                [&_.ProseMirror]:min-h-[calc(100vh-300px)]
                [&_.ProseMirror]:text-base
                [&_.ProseMirror]:leading-relaxed
                [&_.ProseMirror]:text-gray-900
                [&_.ProseMirror]:dark:text-gray-100
                [&_.ProseMirror]:cursor-text
                [&_.ProseMirror]:select-text
                [&_.ProseMirror_p]:my-2
                [&_.ProseMirror_p]:text-gray-900
                [&_.ProseMirror_p]:dark:text-gray-100
                [&_.ProseMirror_*]:select-text
                [&_.ProseMirror_*]:cursor-text"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

EditorToolbar.propTypes = {
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
