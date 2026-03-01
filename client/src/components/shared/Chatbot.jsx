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
 
import { useWorkspace } from "../workspace/provider/WorkspaceProvider";
import { useDispatch, useSelector } from "react-redux";
import {
  useSendMessageMutation,
  useGetChatHistoryQuery,
} from "../../redux/slices/api/chatApiSlice";
import {
  useGetHabitsQuery,
  useCreateHabitMutation,
  useUpdateHabitMutation,
  useDeleteHabitMutation,
  useToggleHabitCompletionMutation,
} from "../../redux/slices/api/habitApiSlice";
import {
  useGetWorkspacesQuery,
  useCreateWorkspaceMutation,
  useUpdateWorkspaceMutation,
  useDeleteWorkspaceMutation,
} from "../../redux/slices/api/workspaceApiSlice";
import {
  useGetTasksQuery,
  useDeleteTaskMutation,
  useGetWorkspaceTasksQuery
} from "../../redux/slices/api/taskApiSlice";
import { useGetWorkspaceNotesQuery } from "../../redux/slices/api/noteApiSlice";
import {
  FaRobot,
  FaTimes,
  FaPaperPlane,
  FaLightbulb,
  FaTasks,
  FaFire,
} from "react-icons/fa";
import { ConfirmationDialog } from "./ConfirmationDialog";
import {
  openConfirmationDialog,
  closeConfirmationDialog,
  setDialogLoading,
  selectIsDialogOpen,
  selectDialogTitle,
  selectDialogMessage,
  selectDialogOptions,
  selectDialogContext,
  selectDialogLoading,
} from "../../redux/slices/ambiguityDialogSlice";
import { getAmbiguityManager } from "../../services/ambiguityStateManager";

export const Chatbot = () => {
  const { workspace } = useWorkspace();
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [sendMessage] = useSendMessageMutation();
  const [isSending, setIsSending] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [slashCommand, setSlashCommand] = useState(null);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedWorkspaceForCommand, setSelectedWorkspaceForCommand] =
    useState(null);  
  const [commandStep, setCommandStep] = useState("command"); // 'command', 'workspace', 'entity'
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  
  // Ambiguity dialog state from Redux
  const isDialogOpen = useSelector(selectIsDialogOpen);
  const dialogTitle = useSelector(selectDialogTitle);
  const dialogMessage = useSelector(selectDialogMessage);
  const dialogOptions = useSelector(selectDialogOptions);
  const dialogContext = useSelector(selectDialogContext);
  const dialogLoading = useSelector(selectDialogLoading);
  
  const ambiguityManager = getAmbiguityManager();  

  const { data: habits = [] } = useGetHabitsQuery(
    { workspaceId: workspace?._id },
    { skip: !workspace?._id },
  );
  const [createHabit] = useCreateHabitMutation();
  const [updateHabit] = useUpdateHabitMutation();
  const [deleteHabit] = useDeleteHabitMutation();
  const [toggleHabitCompletion] = useToggleHabitCompletionMutation();

  const [createWorkspace] = useCreateWorkspaceMutation();
  const [updateWorkspace] = useUpdateWorkspaceMutation();
  const [deleteWorkspace] = useDeleteWorkspaceMutation();
  
  const [deleteTask] = useDeleteTaskMutation();
  
  // Get all tasks for current workspace
  const { data: workspaceTasks } = useGetWorkspaceTasksQuery(
    {
      workspaceId: workspace?._id,
      filter: 'active',
      status: 'all'
    },
    { skip: !workspace?._id }
  );

  const { data: chatHistory } = useGetChatHistoryQuery(workspace?._id, {
    skip: !workspace?._id,
    pollingInterval: isOpen ? 30000 : 0,
  });

  // API queries for slash commands
  const { data: workspaces = [] } = useGetWorkspacesQuery(undefined, {
    skip: !isOpen,
  });
  const { data: tasks = [] } = useGetTasksQuery(
    { workspaceId: workspace?._id },
    { skip: !workspace?._id || !isOpen },
  );
  const { data: notes } = useGetWorkspaceNotesQuery(workspace?._id, {
    skip: !workspace?._id || !isOpen,
  });

  // Slash command definitions
  const slashCommands = {
    "/t": { name: "task", icon: "📋", description: "Select a task" },
    "/h": { name: "habit", icon: "💡", description: "Select a habit" },
    "/w": { name: "workspace", icon: "🗂️", description: "Select a workspace" },
    "/n": { name: "note", icon: "📝", description: "Select a note" },
    "/st": { name: "subtask", icon: "✅", description: "Select a subtask" },
  };

  // Handle input change and detect slash commands
  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    // Detect slash commands
    const words = value.split(" ");
    const lastWord = words[words.length - 1];

    if (lastWord.startsWith("/") && lastWord.length >= 1) {
      // Show command menu if just "/" or partial command
      const matchingCommands = Object.entries(slashCommands).filter(([cmd]) =>
        cmd.startsWith(lastWord),
      );

      if (matchingCommands.length > 0) {
        setShowDropdown(true);
        setSlashCommand(null); // No specific command selected yet

        // Show available commands
        const commandItems = matchingCommands.map(([cmd, info]) => ({
          id: cmd,
          label: `${cmd} - ${info.description}`,
          icon: info.icon,
          command: cmd,
          type: "command",
        }));
        setFilteredItems(commandItems);
        setSelectedIndex(0);
      } else {
        setShowDropdown(false);
      }
    } else {
      setShowDropdown(false);
      setSlashCommand(null);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showDropdown || filteredItems.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(
          (prev) => (prev - 1 + filteredItems.length) % filteredItems.length,
        );
        break;
      case "Enter":
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          handleItemSelect(filteredItems[selectedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setShowDropdown(false);
        setSlashCommand(null);
        setCommandStep("command");
        setSelectedIndex(0);
        break;
      default:
        break;
    }
  };

  // Handle item selection from dropdown
  const handleItemSelect = (item) => {
    if (item.type === "command") {
      // User selected a command, now show workspace selection
      const words = message.split(" ");
      words[words.length - 1] = item.command;
      setMessage(words.join(" "));

      const command = slashCommands[item.command];
      setSlashCommand(command);
      setCommandStep("workspace");

      // Show workspace selection for commands that need filtering
      if (["task", "habit", "note", "subtask"].includes(command.name)) {
        const workspaceItems = (workspaces?.data || []).map((w) => ({
          id: w._id,
          label: w.name,
          type: "workspace-select",
          workspaceId: w._id,
        }));
        // Add "Current Workspace" option
        if (workspace?._id) {
          workspaceItems.unshift({
            id: "current",
            label: `📍 ${workspace.name} (Current)`,
            type: "workspace-select",
            workspaceId: workspace._id,
          });
        }
        setFilteredItems(workspaceItems);
        setShowDropdown(workspaceItems.length > 0);
      } else {
        // For workspace command, directly show workspaces
        const items = (workspaces?.data || []).map((w) => ({
          id: w._id,
          label: w.name,
          type: "workspace",
        }));
        setFilteredItems(items);
        setShowDropdown(items.length > 0);
        setCommandStep("entity");
      }
    } else if (item.type === "workspace-select") {
      // User selected a workspace, now show filtered entities
      setSelectedWorkspaceForCommand(item.workspaceId);
      setCommandStep("entity");

      // Fetch and show entities based on command type and selected workspace
      let items = [];
      switch (slashCommand.name) {
        case "task":
          items = (tasks || [])
            .filter((t) => t.workspace === item.workspaceId)
            .map((t) => ({ id: t._id, label: t.title, type: "task" }));
          break;
        case "habit":
          items = (habits || [])
            .filter((h) => h.workspace === item.workspaceId)
            .map((h) => ({ id: h._id, label: h.title, type: "habit" }));
          break;
        case "note":
          items = (notes?.notes || [])
            .filter((n) => n.workspace === item.workspaceId)
            .map((n) => ({ id: n._id, label: n.title, type: "note" }));
          break;
        case "subtask": {
          const allSubtasks = (tasks || [])
            .filter((t) => t.workspace === item.workspaceId)
            .flatMap((t) =>
              (t.subtasks || []).map((st) => ({
                id: st._id,
                label: `${t.title} → ${st.title}`,
                type: "subtask",
                taskId: t._id,
              })),
            );
          items = allSubtasks;
          break;
        }
        default:
          items = [];
      }
      setFilteredItems(items);
      setShowDropdown(items.length > 0);
    } else {
      // User selected an entity, insert it into the message
      const words = message.split(" ");
      words[words.length - 1] = `${item.label} `;
      setMessage(words.join(" "));
      setShowDropdown(false);
      setSlashCommand(null);
      setSelectedWorkspaceForCommand(null);
      setCommandStep("command");
    }
    inputRef.current?.focus();
  };

  const quickActions = [
    { label: "➕ Task", icon: FaTasks, prompt: "Create a new task" },
    { label: "📋 Tasks", icon: FaTasks, prompt: "Show all my tasks" },
    { label: "💡 Habit", icon: FaLightbulb, prompt: "Add a new habit" },
    { label: "📊 Progress", icon: FaTasks, prompt: "Show my progress" },
    { label: "🗂️ Workspace", icon: FaLightbulb, prompt: "Create workspace" },
    { label: "📝 Note", icon: FaLightbulb, prompt: "Create a note" },
    { label: "🔔 Alerts", icon: FaFire, prompt: "Show notifications" },
    { label: "⏰ Reminder", icon: FaFire, prompt: "Set a reminder" },
  ];

  const handleAddHabit = async (habitName, frequency = "daily") => {
    const existingHabit = habits?.find(
      (h) => h.title.toLowerCase() === habitName.toLowerCase(),
    );
    if (existingHabit) {
      await updateHabit({ id: existingHabit._id, frequency }).unwrap();
      return `Updated your '${habitName}' habit to ${frequency}! 💪`;
    } else {
      await createHabit({
        title: habitName,
        frequency,
        workspace: workspace?._id,
        category: "other",
        visibility: "private",
      }).unwrap();
      return `New habit '${habitName}' created! 🎉`;
    }
  };
  
  // Execute bulk delete of all tasks
  const executeBulkDelete = async (workspaceId) => {
    try {
      const tasks = workspaceTasks?.tasks || [];
      
      if (tasks.length === 0) {
        return "No tasks to delete.";
      }
      
      let deletedCount = 0;
      let failedCount = 0;
      
      // Delete all tasks one by one
      for (const task of tasks) {
        try {
          await deleteTask({
            taskId: task._id,
            workspaceId: workspaceId
          }).unwrap();
          deletedCount++;
        } catch (error) {
          failedCount++;
          console.error(`Failed to delete task ${task._id}:`, error);
        }
      }
      
      if (failedCount === 0) {
        return `✅ Successfully deleted all ${deletedCount} tasks.`;
      } else {
        return `⚠️ Deleted ${deletedCount} tasks. ${failedCount} failed.`;
      }
    } catch (error) {
      console.error('Bulk delete error:', error);
      return "Error deleting tasks.";
    }
  };

  const executeAction = async (action) => {
    let result = "";
    try {
      switch (action.endpoint) {
        case "/api/habits":
          if (action.method === "POST") {
            await createHabit({
              ...action.body,
              workspace: workspace?._id,
            }).unwrap();
            result = "Habit created successfully!";
          } else if (action.method === "PATCH") {
            const habit = habits.find(
              (h) => h.title.toLowerCase() === action.body.title?.toLowerCase(),
            );
            if (habit) {
              const updates = { ...action.body };
              delete updates.title;
              await updateHabit({ id: habit._id, ...updates }).unwrap();
              result = "Habit updated successfully!";
            } else {
              result = "Habit not found.";
            }
          } else if (action.method === "DELETE") {
            const habit = habits.find(
              (h) => h.title.toLowerCase() === action.body.title?.toLowerCase(),
            );
            if (habit) {
              await deleteHabit(habit._id).unwrap();
              result = "Habit deleted successfully!";
            } else {
              result = "Habit not found.";
            }
          }
          break;
        case "/api/completions":
          if (action.method === "POST") {
            const habit = habits.find(
              (h) =>
                h.title.toLowerCase() === action.body.habitName?.toLowerCase(),
            );
            if (habit) {
              await toggleHabitCompletion({
                id: habit._id,
                date: new Date(),
                note: "",
              }).unwrap();
              result = "Habit marked as complete!";
            } else {
              result =
                'Habit not found. Try adding it first with "add [habit name]".';
            }
          }
          break;
        case "/api/analytics":
          if (action.method === "GET") {
            result = "Fetching your progress...";
          }
          break;
        case "/api/workspaces":
          if (action.method === "POST") {
            await createWorkspace({ ...action.body }).unwrap();
            result = "Workspace created successfully! 🗂️";
          } else if (action.method === "PUT") {
            const workspaceToUpdate = (workspaces?.data || []).find(
              (w) => w.name.toLowerCase() === action.body.name?.toLowerCase(),
            );
            if (workspaceToUpdate) {
              await updateWorkspace({
                id: workspaceToUpdate._id,
                ...action.body,
              }).unwrap();
              result = "Workspace updated successfully! ✅";
            } else {
              result = "Workspace not found.";
            }
          } else if (action.method === "DELETE") {
            const workspaceToDelete = (workspaces?.data || []).find(
              (w) => w.name.toLowerCase() === action.body.name?.toLowerCase(),
            );
            if (workspaceToDelete) {
              await deleteWorkspace(workspaceToDelete._id).unwrap();
              result = "Workspace deleted successfully! 🗑️";
            } else {
              result = "Workspace not found.";
            }
          }
          break;
        default:
          result = "Action not supported.";
      }
    } catch (error) {
      result = "Error executing action.";
    }
    return result;
  };

  // Handle confirmation dialog option selection
  const handleDialogOptionSelect = async (optionId) => {
    dispatch(setDialogLoading(true));
    
    try {
      const result = ambiguityManager.processSelection(optionId);
      
      if (!result.valid) {
        setChat((prev) => [...prev, { role: "assistant", content: result.message }]);
        dispatch(closeConfirmationDialog());
        ambiguityManager.clearAmbiguityState();
        return;
      }
      
      const { selectedOption, context } = result;
      
      // Execute the action based on selected option
      if (selectedOption.action) {
        const actionResult = await executeAction(selectedOption.action);
        setChat((prev) => [
          ...prev,
          { role: "assistant", content: `${selectedOption.label}: ${actionResult}` }
        ]);
      } else {
        // Send the selection back to backend for processing
        const followUpResult = await sendMessage({
          message: selectedOption.label,
          workspaceId: workspace?._id,
          selectedOptionId: optionId,
          contextData: context
        }).unwrap();
        
        setChat((prev) => [
          ...prev,
          { role: "assistant", content: followUpResult.reply }
        ]);
      }
      
      // Clear state and close dialog
      ambiguityManager.clearAmbiguityState();
      dispatch(closeConfirmationDialog());
      
    } catch (error) {
      setChat((prev) => [
        ...prev,
        { role: "assistant", content: "Error processing your selection." }
      ]);
      dispatch(closeConfirmationDialog());
      ambiguityManager.clearAmbiguityState();
    } finally {
      dispatch(setDialogLoading(false));
    }
  };

  // Handle confirmation dialog cancel
  const handleDialogCancel = () => {
    ambiguityManager.clearAmbiguityState();
    dispatch(closeConfirmationDialog());
    setChat((prev) => [
      ...prev,
      { role: "assistant", content: "Okay, let me know if you'd like to do something else!" }
    ]);
  };

  const handleSend = async (msg = message) => {
    if (!msg.trim()) return;
    
    // Check if we're in a locked ambiguity state
    if (ambiguityManager.isLocked()) {
      const result = ambiguityManager.processNaturalInput(msg);
      
      if (result.requiresDialog) {
        // Input was ambiguous or doesn't match - keep dialog open
        setChat((prev) => [
          ...prev,
          { role: "user", content: msg },
          { role: "assistant", content: result.message }
        ]);
        setMessage("");
        return;
      }
      
      if (result.type === 'matched') {
        // User typed something that clearly matches an option
        await handleDialogOptionSelect(result.selectedOption.id);
        return;
      }
    }
    
    setIsSending(true);
    const userMsg = { role: "user", content: msg };
    setChat([...chat, userMsg]);
    setMessage("");
    setIsTyping(true);

    // Check for simple "add" commands locally
    const addMatch = msg.match(/^add (.+?)( daily| weekly)?$/i);
    if (addMatch) {
      const habitName = addMatch[1].trim();
      const frequency = addMatch[2] ? addMatch[2].trim() : "daily";
      try {
        const result = await handleAddHabit(habitName, frequency);
        setChat((prev) => [...prev, { role: "assistant", content: result }]);
      } catch (error) {
        setChat((prev) => [
          ...prev,
          { role: "assistant", content: "Error adding habit." },
        ]);
      }
      setIsTyping(false);
      setIsSending(false);
      return;
    }

    // Handle pending actions
    if (pendingAction && msg.toLowerCase().includes("yes")) {
      const result = await executeAction(pendingAction);
      setChat((prev) => [...prev, { role: "assistant", content: result }]);
      setPendingAction(null);
      setIsTyping(false);
      setIsSending(false);
      return;
    } else if (pendingAction) {
      setChat((prev) => [
        ...prev,
        { role: "assistant", content: "Action cancelled." },
      ]);
      setPendingAction(null);
      setIsTyping(false);
      setIsSending(false);
      return;
    }

    // Send to AI
    try {
      const result = await sendMessage({
        message: msg,
        workspaceId: workspace?._id,
      }).unwrap();
      
      const { action, reply, requiresExplicitChoice, choiceData, requiresExecution } = result;
      
      // Check if AI response requires explicit choice dialog
      if (requiresExplicitChoice && choiceData) {
        // Enter ambiguity state and show dialog
        ambiguityManager.enterAmbiguityState(
          choiceData.question,
          choiceData.options,
          { assistantMessage: reply, originalIntent: choiceData.intent }
        );
        
        dispatch(openConfirmationDialog({
          title: choiceData.title || "Please Choose",
          message: choiceData.question,
          options: choiceData.options,
          context: { assistantMessage: reply }
        }));
        
        setChat((prev) => [...prev, { role: "assistant", content: reply }]);
      } else if (action) {
        if (action.requires_confirmation) {
          setPendingAction(action);
          setChat((prev) => [...prev, { role: "assistant", content: reply }]);
        } else if (requiresExecution && action?.type === 'DELETE_ALL_TASKS') {
          // Execute bulk delete
          const actionResult = await executeBulkDelete(action.workspaceId);
          setChat((prev) => [
            ...prev,
            { role: "assistant", content: actionResult },
          ]);
        } else {
          const actionResult = await executeAction(action);
          setChat((prev) => [
            ...prev,
            { role: "assistant", content: reply || actionResult },
          ]);
        }
      } else {
        setChat((prev) => [...prev, { role: "assistant", content: reply }]);
      }
    } catch (error) {
      setChat((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
      console.error('Chat error:', error);
    }
    setIsTyping(false);
    setIsSending(false);
  };

  const handleQuickAction = (prompt) => {
    handleSend(prompt);
  };

  useEffect(() => {
    if (isOpen && chat.length === 0) {
      setChat([
        {
          role: "assistant",
          content: `Assistant ready.

Try:
- "list all workspaces"
- "show my tasks"
- "create task code review"
- "show reminders"`,
        },
      ]);
    }
  }, [isOpen, chat.length]);

  useEffect(() => {
    if (chatHistory && Array.isArray(chatHistory) && chatHistory.length > 0) {
      // Only update if chatHistory has valid messages
      const validMessages = chatHistory.filter(
        (msg) => msg && msg.content && msg.role,
      );
      if (validMessages.length > 0 && validMessages.length > chat.length) {
        setChat(validMessages);
      }
    }
  }, [chatHistory, chat.length]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-2">
      {/* Confirmation Dialog for Ambiguous Choices */}
      <ConfirmationDialog
        isOpen={isDialogOpen}
        title={dialogTitle}
        message={dialogMessage}
        options={dialogOptions}
        assistantMessage={dialogContext?.assistantMessage}
        onSelect={handleDialogOptionSelect}
        onCancel={handleDialogCancel}
        loading={dialogLoading}
      />
      
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-80 h-96 flex flex-col animate-slideUp mb-2">
          <div className="flex justify-between items-center p-4 border-b bg-indigo-600 text-white rounded-t-lg">
            <h3 className="font-semibold flex items-center">
              <FaRobot className="mr-2" /> Assistant
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200"
            >
              <FaTimes />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="p-2 border-b bg-gray-50 dark:bg-gray-700">
            <div className="flex space-x-1 overflow-x-auto">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickAction(action.prompt)}
                  className="flex items-center space-x-1 px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded text-xs hover:bg-indigo-200 dark:hover:bg-indigo-800 whitespace-nowrap"
                >
                  <action.icon size={12} />
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            {chat.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-3 ${msg.role === "user" ? "text-right" : "text-left"}`}
              >
                <span
                  className={`inline-block p-3 rounded-lg max-w-xs ${
                    msg.role === "user"
                      ? "bg-indigo-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  }`}
                >
                  {msg.content}
                </span>
              </div>
            ))}
            {isTyping && (
              <div className="text-left mb-3">
                <span className="inline-block p-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </span>
              </div>
            )}
          </div>
          <div className="p-4 border-t">
            {/* Slash Command Dropdown */}
            {showDropdown && filteredItems.length > 0 && (
              <div className="mb-2 max-h-40 overflow-y-auto border rounded bg-white dark:bg-gray-700 shadow-lg">
                {commandStep === "command" && (
                  <div className="p-2 text-xs text-gray-500 dark:text-gray-400 border-b">
                    ⚡ Available Slash Commands
                  </div>
                )}
                {commandStep === "workspace" && slashCommand && (
                  <div className="p-2 text-xs text-gray-500 dark:text-gray-400 border-b">
                    🗂️ Select Workspace for {slashCommand.description}
                  </div>
                )}
                {commandStep === "entity" && slashCommand && (
                  <div className="p-2 text-xs text-gray-500 dark:text-gray-400 border-b">
                    {slashCommand.icon} {slashCommand.description}
                  </div>
                )}
                {filteredItems.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => handleItemSelect(item)}
                    className={`w-full text-left p-2 text-sm border-b last:border-b-0 ${
                      idx === selectedIndex
                        ? "bg-indigo-200 dark:bg-indigo-800"
                        : "hover:bg-indigo-100 dark:hover:bg-indigo-900"
                    }`}
                  >
                    {item.icon && <span className="mr-2">{item.icon}</span>}
                    {item.label}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="flex">
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onKeyPress={(e) =>
                  e.key === "Enter" && !showDropdown && handleSend()
                }
                placeholder="Ask Assistant (tasks, habits, notes, workspaces, reminders)"
                className="flex-1 p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={() => handleSend()}
                disabled={isSending || !message.trim()}
                className="p-2 bg-indigo-600 text-white rounded-r hover:bg-indigo-700 disabled:opacity-50"
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Static Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-all ${isOpen ? "animate-bounce" : "animate-pulse"}`}
        title={isOpen ? "Close Assistant" : "Open Assistant"}
      >
        <FaRobot size={24} />
      </button>
    </div>
  );
};

export default Chatbot;
