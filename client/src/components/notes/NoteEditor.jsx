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

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import PropTypes from "prop-types";
import { useUpdateNoteMutation, useAiFormatContentMutation } from "../../redux/slices/api/noteApiSlice";
import { toast } from "sonner";
import { debounce } from "lodash";
import {
  FaBold, FaItalic, FaUnderline, FaStrikethrough,
  FaAlignLeft, FaAlignCenter, FaAlignRight, FaAlignJustify,
  FaListUl, FaListOl, FaQuoteRight, FaCode,
  FaUndo, FaRedo, FaHighlighter, FaSubscript, FaSuperscript,
  FaRemoveFormat, FaMagic, FaTimes, FaTable,
  FaSpinner, FaClipboard, FaCheck, FaChevronDown, FaChevronUp,
  FaPaperPlane, FaExchangeAlt
} from "react-icons/fa";

const textColors = [
  "#000000", "#FF0000", "#00FF00", "#0000FF",
  "#FFA500", "#800080", "#FFC0CB", "#A52A2A"
];

const highlightColors = [
  "#FFFF00", "#00FFFF", "#FF00FF", "#90EE90",
  "#FFB6C1", "#FFA500", "#87CEEB", "#DDA0DD"
];

const EditorToolbar = ({ editor, onToggleAIPanel, isAIPanelOpen }) => {
  if (!editor) return null;

  const ToolbarButton = ({ onClick, active, icon: Icon, title }) => (
    <button
      onClick={onClick}
      className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
        active ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
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
              className={`w-5 h-5 rounded border border-gray-300 dark:border-gray-600 ${
                editor.isActive("textStyle", { color }) ? "ring-2 ring-blue-500" : ""
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
              className={`w-5 h-5 rounded border border-gray-300 dark:border-gray-600 ${
                editor.isActive("highlight", { color }) ? "ring-2 ring-blue-500" : ""
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
        <div className="flex gap-1 px-2 border-r border-gray-300 dark:border-gray-600">
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

        {/* AI Format Toggle - Direct Mode */}
        <div className="flex gap-1 px-2">
          <button
            onClick={onToggleAIPanel}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              isAIPanelOpen
                ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md"
                : "bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 text-purple-700 dark:text-purple-300 hover:from-purple-100 hover:to-blue-100 dark:hover:from-purple-900/50 dark:hover:to-blue-900/50 border border-purple-200 dark:border-purple-700"
            }`}
            title="AI Smart Format - Parse & format any messy data directly (Ctrl+Shift+F)"
          >
            <FaMagic className="w-3.5 h-3.5" />
            AI Format
            {isAIPanelOpen
              ? <FaChevronUp className="w-3 h-3" />
              : <FaChevronDown className="w-3 h-3" />
            }
          </button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   OUTPUT FORMAT OPTIONS
   ═══════════════════════════════════════════════════════════════════════════ */
const OUTPUT_FORMATS = [
  { value: 'auto', label: 'Auto-Detect', icon: '🪄', desc: 'Let AI choose the best format' },
  { value: 'table', label: 'Table', icon: '📊', desc: 'HTML table with headers' },
  { value: 'json', label: 'JSON', icon: '{ }', desc: 'Structured JSON array' },
  { value: 'csv', label: 'CSV', icon: '📋', desc: 'Comma-separated values' },
  { value: 'list', label: 'List', icon: '📝', desc: 'Bulleted list' },
  { value: 'markdown', label: 'Markdown Table', icon: '📐', desc: 'Markdown-style table' },
];

/* ═══════════════════════════════════════════════════════════════════════════
   AI DIRECT FORMAT PANEL (inline below toolbar)
   Paste any messy text → AI formats → inserts directly into the editor
   ═══════════════════════════════════════════════════════════════════════════ */
const AIDirectFormatPanel = ({ isOpen, noteId, onInsert, onClose }) => {
  const [inputText, setInputText] = useState('');
  const [outputFormat, setOutputFormat] = useState('auto');
  const [customInstruction, setCustomInstruction] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [preview, setPreview] = useState('');
  const [isFormatting, setIsFormatting] = useState(false);
  const [hasFormatted, setHasFormatted] = useState(false);
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'input' | 'preview'
  const inputRef = useRef(null);

  const [aiFormat] = useAiFormatContentMutation();

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setPreview('');
      setHasFormatted(false);
      setIsFormatting(false);
    }
  }, [isOpen]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleFormat = async () => {
    if (!inputText.trim()) {
      toast.error('Paste some text to format');
      return;
    }

    setIsFormatting(true);
    setHasFormatted(false);

    try {
      const result = await aiFormat({
        noteId,
        text: inputText.trim(),
        outputFormat,
        customInstruction: showCustom ? customInstruction : undefined,
      }).unwrap();

      if (result.status && result.data?.formatted) {
        setPreview(result.data.formatted);
        setHasFormatted(true);
        setViewMode('split');
        toast.success('Formatted successfully!');
      } else {
        toast.error('Failed to format content');
      }
    } catch (error) {
      console.error('AI Format error:', error);
      toast.error(error?.data?.message || 'Failed to format content');
    } finally {
      setIsFormatting(false);
    }
  };

  const handleInsert = () => {
    if (preview) {
      onInsert(preview);
      setInputText('');
      setPreview('');
      setHasFormatted(false);
      toast.success('Formatted content inserted into note');
    }
  };

  const handleInsertAndClose = () => {
    handleInsert();
    onClose();
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputText(text);
        toast.success('Pasted from clipboard');
      }
    } catch {
      toast.error('Could not read clipboard');
    }
  };

  // Ctrl+Enter to format
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleFormat();
    }
  };

  if (!isOpen) return null;

  const selectedFormat = OUTPUT_FORMATS.find(f => f.value === outputFormat);

  return (
    <div className="border-b-2 border-purple-300 dark:border-purple-700 bg-gradient-to-b from-purple-50/50 to-white dark:from-purple-900/10 dark:to-gray-900 transition-all duration-300">
      {/* Panel Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-purple-100 dark:border-purple-800/50">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <FaMagic className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">AI Smart Format</span>
            <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:inline">— Paste any messy data, AI formats it directly</span>
          </div>

          {/* Format Selector */}
          <div className="relative ml-4">
            <button
              onClick={() => setShowFormatDropdown(!showFormatDropdown)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <span>{selectedFormat?.icon}</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">{selectedFormat?.label}</span>
              <FaChevronDown className="w-2.5 h-2.5 text-gray-400" />
            </button>
            {showFormatDropdown && (
              <div className="absolute top-full left-0 mt-1 w-60 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-xl z-50 overflow-hidden">
                {OUTPUT_FORMATS.map(fmt => (
                  <button
                    key={fmt.value}
                    onClick={() => { setOutputFormat(fmt.value); setShowFormatDropdown(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      outputFormat === fmt.value ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                    }`}
                  >
                    <span className="text-base">{fmt.icon}</span>
                    <div>
                      <div className="text-xs font-medium text-gray-800 dark:text-gray-200">{fmt.label}</div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400">{fmt.desc}</div>
                    </div>
                    {outputFormat === fmt.value && <FaCheck className="w-3 h-3 text-blue-500 ml-auto" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Custom instruction toggle */}
          <button
            onClick={() => setShowCustom(!showCustom)}
            className={`text-xs px-2 py-1 rounded-lg transition-colors ${
              showCustom
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            + Custom
          </button>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* View mode toggles */}
          <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
            {['input', 'split', 'preview'].map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-2 py-1 text-[10px] uppercase font-medium transition-colors ${
                  viewMode === mode
                    ? 'bg-purple-500 text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500 transition-colors"
          >
            <FaTimes className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Custom instruction row */}
      {showCustom && (
        <div className="px-4 py-2 border-b border-purple-100/50 dark:border-purple-800/30 bg-purple-50/30 dark:bg-purple-900/5">
          <input
            type="text"
            value={customInstruction}
            onChange={e => setCustomInstruction(e.target.value)}
            placeholder="e.g., Add a 'Pass/Fail' column for scores >= 90, sort by name, calculate average..."
            className="w-full px-3 py-1.5 text-xs border border-purple-200 dark:border-purple-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder:text-gray-400"
            onKeyDown={handleKeyDown}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className={`flex ${viewMode === 'split' ? 'flex-row' : 'flex-col'}`} style={{ height: '280px' }}>
        {/* Input Area */}
        {(viewMode === 'input' || viewMode === 'split') && (
          <div className={`flex flex-col ${viewMode === 'split' ? 'flex-1 border-r border-purple-100 dark:border-purple-800/30' : 'flex-1'}`}>
            <div className="flex items-center justify-between px-3 py-1.5">
              <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Input — Paste your raw data</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePasteFromClipboard}
                  className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  title="Paste from clipboard"
                >
                  <FaClipboard className="w-2.5 h-2.5" />
                  Paste
                </button>
                {inputText && (
                  <button
                    onClick={() => setInputText('')}
                    className="text-[10px] px-2 py-0.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Paste any messy data here...\n\nname: Mohit age 21 city Rajkot score 88\nRahul,22,Ahmedabad,91\n{"name":"Kunal" "age":20 "city":"Surat"}\nNeha | 23 | Vadodara | 95\n\nCtrl+Enter to format`}
              className="flex-1 w-full resize-none px-3 py-2 text-xs font-mono bg-white/50 dark:bg-gray-800/50 border-0 focus:outline-none text-gray-800 dark:text-gray-200 placeholder:text-gray-300 dark:placeholder:text-gray-600"
              spellCheck={false}
            />
            {/* Format Button */}
            <div className="px-3 py-2 flex items-center gap-2">
              <button
                onClick={handleFormat}
                disabled={isFormatting || !inputText.trim()}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-xs transition-all ${
                  isFormatting || !inputText.trim()
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-md'
                }`}
              >
                {isFormatting ? (
                  <>
                    <FaSpinner className="w-3 h-3 animate-spin" />
                    Formatting...
                  </>
                ) : (
                  <>
                    <FaMagic className="w-3 h-3" />
                    Format with AI
                  </>
                )}
              </button>
              {hasFormatted && (
                <button
                  onClick={handleInsert}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-green-500 hover:bg-green-600 text-white shadow-md transition-all"
                  title="Insert formatted content into editor"
                >
                  <FaPaperPlane className="w-3 h-3" />
                  Insert
                </button>
              )}
            </div>
          </div>
        )}

        {/* Preview Area */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex items-center justify-between px-3 py-1.5">
              <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Preview</span>
              <div className="flex items-center gap-2">
                {hasFormatted && (
                  <>
                    <button
                      onClick={handleFormat}
                      className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                    >
                      <FaExchangeAlt className="w-2.5 h-2.5" />
                      Re-format
                    </button>
                    <button
                      onClick={handleInsertAndClose}
                      className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-lg font-medium bg-green-500 hover:bg-green-600 text-white transition-colors"
                    >
                      <FaCheck className="w-2.5 h-2.5" />
                      Insert & Close
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-auto px-3 pb-3">
              {preview ? (
                <div
                  className="prose prose-xs dark:prose-invert max-w-none text-sm
                    [&_table]:border-collapse [&_table]:w-full [&_table]:text-xs
                    [&_td]:border [&_td]:border-gray-300 [&_td]:dark:border-gray-600 [&_td]:px-3 [&_td]:py-1.5 [&_td]:text-gray-800 [&_td]:dark:text-gray-200
                    [&_th]:border [&_th]:border-gray-300 [&_th]:dark:border-gray-600 [&_th]:px-3 [&_th]:py-1.5 [&_th]:font-semibold [&_th]:text-left [&_th]:bg-purple-100 [&_th]:dark:bg-purple-900/40 [&_th]:text-gray-900 [&_th]:dark:text-gray-100
                    [&_pre]:bg-gray-50 [&_pre]:dark:bg-gray-800 [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:text-xs [&_pre]:overflow-x-auto
                    [&_code]:text-xs [&_ul]:text-xs [&_li]:text-xs"
                  dangerouslySetInnerHTML={{ __html: preview }}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
                  <div className="text-center">
                    <FaTable className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-xs">Formatted output appears here</p>
                    <p className="text-[10px] mt-0.5">Paste data → Click Format → Insert into note</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

AIDirectFormatPanel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  noteId: PropTypes.string,
  onInsert: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

/* ═══════════════════════════════════════════════════════════════════════════
   NOTE EDITOR (main component)
   ═══════════════════════════════════════════════════════════════════════════ */
const NoteEditor = ({ note, workspaceId }) => {
  const [title, setTitle] = useState("");
  const [updateNote] = useUpdateNoteMutation();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedNoteId, setLastSavedNoteId] = useState(null);
  const [isContentLoaded, setIsContentLoaded] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [showAIPanel, setShowAIPanel] = useState(false);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+F or Cmd+F for Find
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setShowFindReplace(true);
      }
      // Ctrl+Shift+F for AI Format panel
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        setShowAIPanel(prev => !prev);
      }
      // Escape to close panels
      if (e.key === 'Escape') {
        if (showFindReplace) setShowFindReplace(false);
        if (showAIPanel) setShowAIPanel(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showFindReplace, showAIPanel]);

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
      Table.configure({
        resizable: true,
        HTMLAttributes: { class: 'aiva-table' },
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: "<p></p>",
    editable: true,
    onUpdate: ({ editor: ed }) => {
      if (isContentLoaded) {
        const html = ed.getHTML();
        debouncedSave({ content: html });
      }
    },
  });

  // Load note content and title when note changes
  useEffect(() => {
    if (editor && editor.isEditable && note && note._id) {
      const isDifferentNote = lastSavedNoteId !== note._id;

      if (isDifferentNote) {
        console.log("Loading note:", note._id, "Title:", note.title, "Content length:", note.content?.length);

        setIsContentLoaded(false);
        const noteContent = note.content || "<p>Start writing...</p>";

        setTimeout(() => {
          if (editor && editor.commands) {
            editor.commands.setContent(noteContent, false);
            setTimeout(() => {
              const currentContent = editor.getHTML();
              console.log("Editor content after setting:", currentContent);
            }, 50);
          }
        }, 50);

        setTitle(note.title || "");
        setLastSavedNoteId(note._id);

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
    if (note?._id && workspaceId) {
      debouncedSave({ title: newTitle });
    }
  };

  // Sanitize HTML table for TipTap compatibility
  const sanitizeTableHtml = useCallback((html) => {
    let clean = html;
    // 1. Strip thead/tbody/tfoot/colgroup/col/caption
    clean = clean.replace(/<\/?(?:thead|tbody|tfoot|caption)[^>]*>/gi, '');
    clean = clean.replace(/<colgroup[\s\S]*?<\/colgroup>/gi, '');
    clean = clean.replace(/<col[^>]*\/?>/gi, '');
    // 2. Strip ALL inline styles from table elements
    clean = clean.replace(/(<(?:table|tr|th|td)[^>]*?)\s+style\s*=\s*"[^"]*"/gi, '$1');
    clean = clean.replace(/(<(?:table|tr|th|td)[^>]*?)\s+style\s*=\s*'[^']*'/gi, '$1');
    // 3. Strip class/bgcolor/width/height/align attributes
    clean = clean.replace(/(<(?:table|tr|th|td)[^>]*?)\s+(?:class|bgcolor|width|height|align|valign|cellpadding|cellspacing|border)\s*=\s*(?:"[^"]*"|'[^']*'|\S+)/gi, '$1');
    // 4. CRITICAL: Remove ALL whitespace between tags (TipTap treats whitespace as text nodes → empty cells)
    clean = clean.replace(/>\s+</g, '><');
    // 5. Clean up
    clean = clean.replace(/\s+>/g, '>');
    clean = clean.replace(/<\s+/g, '<');
    return clean;
  }, []);

  // Insert AI-formatted HTML into editor
  const handleAIInsert = useCallback((html) => {
    if (editor) {
      const cleanHtml = sanitizeTableHtml(html);
      console.log('[AI Insert] Clean HTML:', cleanHtml);
      editor.chain().focus().insertContent(cleanHtml).run();
      setTimeout(() => {
        debouncedSave({ content: editor.getHTML() });
      }, 100);
    }
  }, [editor, debouncedSave, sanitizeTableHtml]);

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
        <div className="flex items-center gap-3 ml-4">
          {isSaving && (
            <div className="text-sm text-blue-500 dark:text-blue-400 font-medium animate-pulse">
              Saving...
            </div>
          )}
          {!isSaving && lastSavedNoteId === note._id && (
            <div className="text-sm text-green-500 dark:text-green-400 font-medium">
              Saved
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar (with AI Format toggle built in) */}
        <EditorToolbar
          editor={editor}
          onToggleAIPanel={() => setShowAIPanel(p => !p)}
          isAIPanelOpen={showAIPanel}
        />

        {/* AI Direct Format Panel (slides in below toolbar) */}
        <AIDirectFormatPanel
          isOpen={showAIPanel}
          noteId={note?._id}
          onInsert={handleAIInsert}
          onClose={() => setShowAIPanel(false)}
        />

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
              Ctrl+F to find, Esc to close
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
                [&_.ProseMirror_*]:cursor-text
                [&_.ProseMirror_table]:border-collapse
                [&_.ProseMirror_table]:w-full
                [&_.ProseMirror_table]:my-4
                [&_.ProseMirror_td]:border
                [&_.ProseMirror_td]:border-gray-300
                [&_.ProseMirror_td]:dark:border-gray-600
                [&_.ProseMirror_td]:px-3
                [&_.ProseMirror_td]:py-2
                [&_.ProseMirror_td]:text-sm
                [&_.ProseMirror_th]:border
                [&_.ProseMirror_th]:border-gray-300
                [&_.ProseMirror_th]:dark:border-gray-600
                [&_.ProseMirror_th]:px-3
                [&_.ProseMirror_th]:py-2
                [&_.ProseMirror_th]:text-sm
                [&_.ProseMirror_th]:font-semibold
                [&_.ProseMirror_th]:!bg-purple-100
                [&_.ProseMirror_th]:dark:!bg-purple-900/40
                [&_.ProseMirror_th]:!text-gray-900
                [&_.ProseMirror_th]:dark:!text-gray-100
                [&_.ProseMirror_th]:text-left
                [&_.ProseMirror_td]:!text-gray-800
                [&_.ProseMirror_td]:dark:!text-gray-200
                [&_.ProseMirror_.selectedCell]:bg-blue-100
                [&_.ProseMirror_.selectedCell]:dark:bg-blue-900/30
                [&_.ProseMirror_.column-resize-handle]:bg-blue-500
                [&_.ProseMirror_.column-resize-handle]:w-0.5
                [&_.ProseMirror_.tableWrapper]:overflow-x-auto
                [&_.ProseMirror_.tableWrapper]:my-4"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

EditorToolbar.propTypes = {
  editor: PropTypes.object,
  onToggleAIPanel: PropTypes.func,
  isAIPanelOpen: PropTypes.bool,
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
