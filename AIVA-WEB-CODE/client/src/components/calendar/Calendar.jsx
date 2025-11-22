import React, { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  parseISO,
  isSameDay,
} from "date-fns";
import {
  FaBell,
  FaCalendarPlus,
  FaTasks,
  FaChevronLeft,
  FaChevronRight,
  FaPlus,
  FaTimes,
} from "react-icons/fa";
import { useWorkspace } from "../workspace/provider/WorkspaceProvider";
import {
  useGetRemindersQuery,
  useCreateReminderMutation,
} from "../../redux/slices/api/reminderApiSlice";
import {
  useGetTasksQuery,
  useCreateTaskMutation,
} from "../../redux/slices/api/taskApiSlice";
import ReminderForm from "./CalendarReminder";
import { toast } from "sonner";

const TaskIndicator = ({ task }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-orange-500";
      case "low":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStageColor = (stage) => {
    switch (stage) {
      case "todo":
        return "bg-yellow-500";
      case "in_progress":
        return "bg-blue-500";
      case "review":
        return "bg-purple-500";
      case "completed":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "high":
        return "🔴";
      case "medium":
        return "🟡";
      case "low":
        return "🔵";
      default:
        return "⚪";
    }
  };

  const getStageIcon = (stage) => {
    switch (stage) {
      case "todo":
        return "📋";
      case "in_progress":
        return "🔄";
      case "review":
        return "👀";
      case "completed":
        return "✅";
      default:
        return "📝";
    }
  };

  return (
    <div className="group relative rounded-lg mb-1 overflow-hidden transition-all hover:shadow-md bg-white dark:bg-gray-800">
      {/* Dual-color indicator */}
      <div className="absolute left-0 top-0 bottom-0 flex flex-col w-1.5">
        <div className={`flex-1 ${getPriorityColor(task.priority)}`} />
        <div className={`flex-1 ${getStageColor(task.stage)}`} />
      </div>

      <div className="px-3 py-1">
        {/* Task Title and Icons */}
        <div className="flex items-center gap-1">
          <span className="text-[10px]">{getPriorityIcon(task.priority)}</span>
          <span className="text-[10px]">{getStageIcon(task.stage)}</span>
          <span className="text-xs font-medium dark:text-white truncate flex-1">
            {task.title}
          </span>
        </div>

        {/* Labels */}
        {task.labels && task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {task.labels.map((label, index) => (
              <span
                key={index}
                className="px-1.5 py-0.5 text-[10px] rounded-full text-white"
                style={{ backgroundColor: label.color || "#3B82F6" }}
              >
                {label.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Hover Details */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div className="text-white text-xs text-center p-1">
          <div>{task.title}</div>
          <div className="text-[10px] opacity-75">
            {task.description && task.description.substring(0, 50)}
            {task.description && task.description.length > 50 ? "..." : ""}
          </div>
        </div>
      </div>
    </div>
  );
};

const EventIndicator = ({ type, count }) => {
  const colors = {
    task: "bg-purple-500",
    reminder: "bg-blue-500",
    event: "bg-green-500",
  };

  return (
    <div
      className={`flex items-center space-x-1 ${colors[type]} bg-opacity-20 dark:bg-opacity-30 px-2 py-0.5 rounded-full`}
    >
      {type === "task" && (
        <FaTasks className={`w-3 h-3 ${colors[type]} text-opacity-90`} />
      )}
      {type === "reminder" && (
        <FaBell className={`w-3 h-3 ${colors[type]} text-opacity-90`} />
      )}
      {type === "event" && (
        <FaCalendarPlus className={`w-3 h-3 ${colors[type]} text-opacity-90`} />
      )}
      <span className={`text-xs ${colors[type]} text-opacity-90`}>{count}</span>
    </div>
  );
};

const CalendarDay = ({ day, currentDate, events, onDateClick }) => {
  const isCurrentMonth = isSameMonth(day, currentDate);
  const isCurrentDay = isToday(day);
  const dayEvents = events.filter((event) =>
    isSameDay(parseISO(event.date), day),
  );

  const tasks = dayEvents.filter((e) => e.type === "task");
  const reminders = dayEvents.filter((e) => e.type === "reminder");
  const calendarEvents = dayEvents.filter((e) => e.type === "event");

  return (
    <button
      type="button"
      onClick={() => onDateClick(day)}
      className={`
        relative h-32 p-2 border border-gray-200 dark:border-gray-700 
        transition-all duration-200 group text-left
        ${isCurrentMonth ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-900"}
        ${isCurrentDay ? "ring-2 ring-blue-500 dark:ring-blue-400" : ""}
        hover:bg-blue-50 dark:hover:bg-blue-900/20
        focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
      `}
    >
      <span
        className={`
        text-sm font-medium block mb-1
        ${!isCurrentMonth && "text-gray-400 dark:text-gray-600"}
        ${isCurrentDay && "text-blue-600 dark:text-blue-400"}
      `}
      >
        {format(day, "d")}
      </span>

      <div className="space-y-1 overflow-y-auto max-h-[80px] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        {tasks.map((task, index) => (
          <TaskIndicator key={task._id || index} task={task} />
        ))}
        {reminders.length > 0 && (
          <EventIndicator type="reminder" count={reminders.length} />
        )}
        {calendarEvents.length > 0 && (
          <EventIndicator type="event" count={calendarEvents.length} />
        )}
      </div>

      {/* Hover Preview */}
      {dayEvents.length > 0 && (
        <div
          className="
          absolute left-0 right-0 bottom-0 p-2
          bg-gradient-to-t from-gray-100 dark:from-gray-700
          to-transparent opacity-0 group-hover:opacity-100
          transition-opacity duration-200
        "
        >
          <div className="text-xs text-gray-600 dark:text-gray-300 truncate">
            {dayEvents.length} items
          </div>
        </div>
      )}
    </button>
  );
};

export const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddType, setQuickAddType] = useState(null);

  const { workspace } = useWorkspace();
  const { data: reminders } = useGetRemindersQuery(workspace?._id);
  const { data: tasks } = useGetTasksQuery(workspace?._id);
  const [createReminder] = useCreateReminderMutation();
  const [createTask] = useCreateTaskMutation();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Combine tasks and reminders into a single events array
  const events = [
    ...(tasks?.data?.map((task) => ({
      ...task,
      type: "task",
      date: task.dueDate,
    })) || []),
    ...(reminders?.data?.map((reminder) => ({
      ...reminder,
      type: "reminder",
    })) || []),
  ];

  const handleDateClick = (date) => {
    if (!workspace) {
      toast.error("Please select a workspace first");
      return;
    }
    setSelectedDate(date);
    setShowForm(true);
  };

  const handleQuickAdd = (type) => {
    if (!workspace) {
      toast.error("Please select a workspace first");
      return;
    }
    setQuickAddType(type);
    setShowQuickAdd(false);
    setShowForm(true);
  };

  const handleSubmit = async (formData) => {
    try {
      const { type, ...data } = formData;

      switch (type) {
        case "task":
          await createTask({
            ...data,
            dueDate: format(data.date, "yyyy-MM-dd"),
            workspaceId: workspace._id,
            stage: "todo",
          }).unwrap();
          toast.success("Task added successfully");
          break;

        case "reminder":
          await createReminder({
            ...data,
            date: format(data.date, "yyyy-MM-dd"),
            workspaceId: workspace._id,
          }).unwrap();
          toast.success("Reminder added successfully");
          break;

        case "event":
          await createReminder({
            ...data,
            date: format(data.date, "yyyy-MM-dd"),
            workspaceId: workspace._id,
            isEvent: true,
          }).unwrap();
          toast.success("Event added successfully");
          break;

        default:
          throw new Error("Invalid item type");
      }

      setShowForm(false);
      setSelectedDate(null);
      setQuickAddType(null);
    } catch (error) {
      //console.error('Error adding item:', error);
      toast.error("Failed to add item");
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl relative">
      {/* Instructions Card */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center space-x-3">
        <div>
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
            Add Events & Reminders
          </h3>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            Click the + button to add a new event or reminder, or click on any
            date to add directly to that day.
          </p>
        </div>
      </div>

      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() =>
                setCurrentDate(
                  new Date(currentDate.setMonth(currentDate.getMonth() - 1)),
                )
              }
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
            >
              <FaChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() =>
                setCurrentDate(
                  new Date(currentDate.setMonth(currentDate.getMonth() + 1)),
                )
              }
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
            >
              <FaChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 text-sm">
            <span className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-gray-600 dark:text-gray-400">Tasks</span>
            </span>
            <span className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-gray-600 dark:text-gray-400">
                Reminders
              </span>
            </span>
            <span className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-600 dark:text-gray-400">Events</span>
            </span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
        {/* Day headers */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800"
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((day) => (
          <CalendarDay
            key={day.toISOString()}
            day={day}
            currentDate={currentDate}
            events={events}
            onDateClick={handleDateClick}
          />
        ))}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        {showQuickAdd ? (
          <div className="absolute bottom-16 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-2 space-y-2 w-48">
            <button
              onClick={() => handleQuickAdd("event")}
              className="w-full flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FaCalendarPlus className="w-4 h-4 text-green-500" />
              <span>Add Event</span>
            </button>
            <button
              onClick={() => handleQuickAdd("reminder")}
              className="w-full flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FaBell className="w-4 h-4 text-blue-500" />
              <span>Add Reminder</span>
            </button>
            <button
              onClick={() => handleQuickAdd("task")}
              className="w-full flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FaTasks className="w-4 h-4 text-purple-500" />
              <span>Add Task</span>
            </button>
          </div>
        ) : null}

        <button
          onClick={() => setShowQuickAdd(!showQuickAdd)}
          className="w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {showQuickAdd ? (
            <FaTimes className="w-6 h-6" />
          ) : (
            <FaPlus className="w-6 h-6" />
          )}
        </button>
      </div>

      {showForm && (
        <ReminderForm
          date={selectedDate || new Date()}
          workspace={workspace}
          onClose={() => {
            setShowForm(false);
            setSelectedDate(null);
            setQuickAddType(null);
          }}
          onSubmit={handleSubmit}
          defaultType={quickAddType}
        />
      )}
    </div>
  );
};
