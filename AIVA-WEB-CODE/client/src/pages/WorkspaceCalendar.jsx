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
import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  useGetWorkspaceTasksQuery,
  useUpdateTaskMutation,
} from "../redux/slices/api/taskApiSlice";
import { LoadingSpinner } from "../components/shared/feedback/LoadingSpinner";
import { format, differenceInDays, isPast } from "date-fns";
import {
  FaCalendarAlt,
  FaClock,
  FaExclamationTriangle,
  FaFilter,
  FaChartBar,
  FaUserPlus,
  FaUsers,
} from "react-icons/fa";
import { useGetWorkspaceMembersQuery } from "../redux/slices/api/workspaceApiSlice";
import { toast, Toaster } from "react-hot-toast";

const priorityColors = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-emerald-500",
};

const categoryColors = {
  research: "bg-indigo-500",
  writing: "bg-violet-500",
  coding: "bg-pink-500",
  reading: "bg-teal-500",
  review: "bg-orange-500",
  other: "bg-gray-500",
};

const statusColors = {
  completed:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  in_progress:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  review:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  todo: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
};

const WorkspaceCalendar = () => {
  const { workspaceId } = useParams();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [viewType, setViewType] = useState("dayGridMonth");
  const [filter, setFilter] = useState("all"); // 'all', 'upcoming', 'overdue', 'completed'
  const [isAssigningMembers, setIsAssigningMembers] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);

  const { data: workspaceData, isLoading: isLoadingTasks } =
    useGetWorkspaceTasksQuery({ workspaceId });
  const { data: membersData, isLoading: isLoadingMembers } =
    useGetWorkspaceMembersQuery(workspaceId);
  const [updateTask] = useUpdateTaskMutation();

  const events = useMemo(() => {
    if (!workspaceData?.tasks) return [];

    const allEvents = [];
    const now = new Date();

    // Add main tasks
    workspaceData.tasks.forEach((task) => {
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        const isOverdue = isPast(dueDate) && task.stage !== "completed";
        const daysUntilDue = differenceInDays(dueDate, now);

        // Apply filters
        if (
          filter === "upcoming" &&
          (daysUntilDue < 0 || task.stage === "completed")
        )
          return;
        if (filter === "overdue" && !isOverdue) return;
        if (filter === "completed" && task.stage !== "completed") return;

        allEvents.push({
          id: task._id,
          title: task.title,
          start: task.dueDate,
          end: task.dueDate,
          allDay: true,
          display: isOverdue ? "background" : "auto",
          backgroundColor: isOverdue
            ? "#fee2e2" // Light red background for overdue tasks
            : task.priority === "high"
              ? "#ef4444"
              : task.priority === "medium"
                ? "#f59e0b"
                : "#10b981",
          borderColor: isOverdue
            ? "#ef4444"
            : task.priority === "high"
              ? "#ef4444"
              : task.priority === "medium"
                ? "#f59e0b"
                : "#10b981",
          textColor: isOverdue ? "#ef4444" : "#ffffff",
          extendedProps: {
            type: "task",
            description: task.description,
            priority: task.priority,
            status: task.stage,
            category: task.category || "other",
            isOverdue,
            daysUntilDue,
            assignedMembers: task.assignedTo || [],
          },
        });
      }

      // Add subtasks
      task.subtasks?.forEach((subtask) => {
        if (subtask.dueDate) {
          const dueDate = new Date(subtask.dueDate);
          const isOverdue = isPast(dueDate) && subtask.status !== "completed";
          const daysUntilDue = differenceInDays(dueDate, now);

          // Apply filters
          if (
            filter === "upcoming" &&
            (daysUntilDue < 0 || subtask.status === "completed")
          )
            return;
          if (filter === "overdue" && !isOverdue) return;
          if (filter === "completed" && subtask.status !== "completed") return;

          const categoryColor = {
            research: "#6366f1",
            writing: "#8b5cf6",
            coding: "#ec4899",
            reading: "#14b8a6",
            review: "#f97316",
            other: "#6b7280",
          }[subtask.category || "other"];

          allEvents.push({
            id: `${task._id}-${subtask._id}`,
            title: `${task.title} > ${subtask.title}`,
            start: subtask.dueDate,
            end: subtask.dueDate,
            allDay: true,
            display: isOverdue ? "background" : "auto",
            backgroundColor: isOverdue ? "#fee2e2" : categoryColor,
            borderColor: isOverdue ? "#ef4444" : categoryColor,
            textColor: isOverdue ? "#ef4444" : "#ffffff",
            extendedProps: {
              type: "subtask",
              parentTask: task.title,
              description: subtask.description,
              priority: subtask.priority,
              status: subtask.status,
              category: subtask.category || "other",
              estimatedDuration: subtask.estimatedDuration,
              progress: subtask.progress,
              isOverdue,
              daysUntilDue,
              assignedMembers: subtask.assignedTo || [],
            },
          });
        }
      });
    });

    return allEvents;
  }, [workspaceData, filter]);

  const handleEventClick = (info) => {
    setSelectedEvent(info.event);
    setSelectedMembers(info.event.extendedProps.assignedMembers || []);
  };

  const handleAssignMembers = async () => {
    if (!selectedEvent) return;

    try {
      const taskId = selectedEvent.id.includes("-")
        ? selectedEvent.id.split("-")[1] // Subtask ID
        : selectedEvent.id; // Main task ID

      const result = await updateTask({
        taskId,
        assignedTo: selectedMembers,
        lastModified: new Date(),
      }).unwrap();

      if (result.status) {
        toast.success("Members assigned successfully");
        setIsAssigningMembers(false);
      }
    } catch (error) {
      toast.error("Failed to assign members");
      //console.error('Error assigning members:', error);
    }
  };

  const getDueDateStatus = (daysUntilDue, isOverdue) => {
    if (isOverdue) return { text: "Overdue", color: "text-red-500" };
    if (daysUntilDue === 0)
      return { text: "Due today", color: "text-amber-500" };
    if (daysUntilDue === 1)
      return { text: "Due tomorrow", color: "text-amber-500" };
    if (daysUntilDue <= 7)
      return { text: `Due in ${daysUntilDue} days`, color: "text-blue-500" };
    return { text: `Due in ${daysUntilDue} days`, color: "text-gray-500" };
  };

  if (isLoadingTasks || isLoadingMembers) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Toaster position="top-right" />
      <div className="h-full flex flex-col">
        {/* Fixed Header */}
        <div className="flex-none bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FaCalendarAlt className="text-blue-500" />
                  Workspace Calendar
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Manage and track your workspace tasks and deadlines
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaFilter className="text-gray-400" />
                  </div>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="all">All Tasks</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="overdue">Overdue</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaChartBar className="text-gray-400" />
                  </div>
                  <select
                    value={viewType}
                    onChange={(e) => setViewType(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="dayGridMonth">Month View</option>
                    <option value="timeGridWeek">Week View</option>
                    <option value="timeGridDay">Day View</option>
                    <option value="listWeek">List View</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Stats Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Total Tasks
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-blue-600 dark:text-blue-400">
                      {events.length}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <FaCalendarAlt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Overdue
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-red-600 dark:text-red-400">
                      {events.filter((e) => e.extendedProps.isOverdue).length}
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                    <FaExclamationTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Due Today
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-amber-600 dark:text-amber-400">
                      {
                        events.filter((e) => e.extendedProps.daysUntilDue === 0)
                          .length
                      }
                    </p>
                  </div>
                  <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                    <FaClock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Completed
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-green-600 dark:text-green-400">
                      {
                        events.filter(
                          (e) => e.extendedProps.status === "completed",
                        ).length
                      }
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <FaCalendarAlt className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Calendar Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="calendar-container p-4">
                <style>
                  {`
                    .fc {
                      max-width: 100%;
                      height: calc(100vh - 16rem) !important;
                      background: white;
                      border-radius: 0.5rem;
                      overflow: hidden;
                    }
                    .fc-view {
                      height: 100% !important;
                    }
                    .fc-scroller {
                      height: 100% !important;
                    }
                    .fc .fc-toolbar {
                      padding: 1rem;
                      margin: 0;
                      background: #f9fafb;
                      border-bottom: 1px solid #e5e7eb;
                    }
                    .fc .fc-toolbar-title {
                      font-size: 1.25rem;
                      font-weight: 600;
                    }
                    .fc .fc-button {
                      background-color: #3b82f6;
                      border: none;
                      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
                      padding: 0.5rem 1rem;
                      font-weight: 500;
                    }
                    .fc .fc-button:hover {
                      background-color: #2563eb;
                    }
                    .fc .fc-button-primary:not(:disabled).fc-button-active,
                    .fc .fc-button-primary:not(:disabled):active {
                      background-color: #1d4ed8;
                    }
                    .fc-event {
                      cursor: pointer;
                      transition: transform 0.15s ease;
                    }
                    .fc-event:hover {
                      transform: translateY(-1px);
                    }
                    .dark .fc {
                      background: #1f2937;
                      color: #e5e7eb;
                    }
                    .dark .fc-toolbar {
                      background: #111827;
                      border-color: #374151;
                    }
                    .dark .fc-button {
                      background-color: #374151;
                    }
                    .dark .fc-button:hover {
                      background-color: #4b5563;
                    }
                    .dark .fc-button-active {
                      background-color: #6b7280;
                    }
                    .dark .fc-day {
                      background: #1f2937;
                    }
                    .dark .fc-day-today {
                      background: #374151 !important;
                    }
                  `}
                </style>
                <FullCalendar
                  plugins={[
                    dayGridPlugin,
                    timeGridPlugin,
                    listPlugin,
                    interactionPlugin,
                  ]}
                  initialView={viewType}
                  headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
                  }}
                  events={events}
                  eventClick={handleEventClick}
                  height="100%"
                  expandRows={true}
                  stickyHeaderDates={true}
                  nowIndicator={true}
                  dayMaxEvents={true}
                  eventTimeFormat={{
                    hour: "2-digit",
                    minute: "2-digit",
                    meridiem: false,
                  }}
                  eventContent={(arg) => {
                    const isOverdue = arg.event.extendedProps.isOverdue;
                    return (
                      <div
                        className={`p-1.5 rounded-md transition-all hover:scale-[1.02] ${isOverdue ? "text-red-600 font-medium" : ""}`}
                      >
                        {isOverdue && (
                          <FaExclamationTriangle className="inline mr-1" />
                        )}
                        {arg.event.title}
                      </div>
                    );
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Details Modal */}
      <Transition appear show={!!selectedEvent} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setSelectedEvent(null)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  {selectedEvent && (
                    <>
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-semibold leading-6 text-gray-900 dark:text-white"
                      >
                        {selectedEvent.title}
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {selectedEvent.extendedProps.type === "subtask"
                            ? "Subtask"
                            : "Task"}
                        </p>
                      </Dialog.Title>

                      <div className="mt-4 space-y-4">
                        {/* Due Date with Status */}
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                          <div className="flex items-center gap-2">
                            <FaCalendarAlt className="text-gray-400" />
                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Due Date
                            </h4>
                          </div>
                          <p className="mt-1 text-gray-900 dark:text-white">
                            {format(new Date(selectedEvent.start), "PPP")}
                          </p>
                          <p
                            className={`text-sm mt-1 ${getDueDateStatus(selectedEvent.extendedProps.daysUntilDue, selectedEvent.extendedProps.isOverdue).color}`}
                          >
                            {
                              getDueDateStatus(
                                selectedEvent.extendedProps.daysUntilDue,
                                selectedEvent.extendedProps.isOverdue,
                              ).text
                            }
                          </p>
                        </div>

                        {/* Description */}
                        {selectedEvent.extendedProps.description && (
                          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Description
                            </h4>
                            <p className="mt-1 text-gray-900 dark:text-white">
                              {selectedEvent.extendedProps.description}
                            </p>
                          </div>
                        )}

                        {/* Status and Priority */}
                        <div className="flex gap-2">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${statusColors[selectedEvent.extendedProps.status]}`}
                          >
                            {selectedEvent.extendedProps.status}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs rounded-full text-white ${priorityColors[selectedEvent.extendedProps.priority]}`}
                          >
                            {selectedEvent.extendedProps.priority}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs rounded-full text-white ${categoryColors[selectedEvent.extendedProps.category]}`}
                          >
                            {selectedEvent.extendedProps.category}
                          </span>
                        </div>

                        {/* Subtask-specific information */}
                        {selectedEvent.extendedProps.type === "subtask" && (
                          <>
                            {/* Parent Task */}
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Parent Task
                              </h4>
                              <p className="mt-1 text-gray-900 dark:text-white">
                                {selectedEvent.extendedProps.parentTask}
                              </p>
                            </div>

                            {/* Progress */}
                            {selectedEvent.extendedProps.progress !==
                              undefined && (
                              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                  Progress
                                </h4>
                                <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                  <div
                                    className="bg-blue-600 h-2.5 rounded-full"
                                    style={{
                                      width: `${selectedEvent.extendedProps.progress}%`,
                                    }}
                                  ></div>
                                </div>
                                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                  {selectedEvent.extendedProps.progress}%
                                  Complete
                                </p>
                              </div>
                            )}

                            {/* Estimated Duration */}
                            {selectedEvent.extendedProps.estimatedDuration && (
                              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <FaClock className="text-gray-400" />
                                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Estimated Duration
                                  </h4>
                                </div>
                                <p className="mt-1 text-gray-900 dark:text-white">
                                  {
                                    selectedEvent.extendedProps
                                      .estimatedDuration
                                  }{" "}
                                  minutes
                                </p>
                              </div>
                            )}
                          </>
                        )}

                        {/* Assigned Members Section */}
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <FaUsers className="text-gray-400" />
                              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Assigned Members
                              </h4>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setIsAssigningMembers(true)}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                              >
                                <FaUserPlus className="w-4 h-4" />
                                Add Member
                              </button>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {selectedEvent.extendedProps.assignedMembers?.map(
                              (member) => (
                                <div
                                  key={member._id}
                                  className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                >
                                  <span>{member.name}</span>
                                  <button
                                    onClick={() => {
                                      setSelectedMembers(
                                        selectedMembers.filter(
                                          (m) => m._id !== member._id,
                                        ),
                                      );
                                      handleAssignMembers();
                                    }}
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              ),
                            )}
                          </div>
                        </div>

                        {/* Member Assignment Modal */}
                        <Transition
                          appear
                          show={isAssigningMembers}
                          as={Fragment}
                        >
                          <Dialog
                            as="div"
                            className="relative z-50"
                            onClose={() => setIsAssigningMembers(false)}
                          >
                            <div className="fixed inset-0 bg-black bg-opacity-25" />
                            <div className="fixed inset-0 overflow-y-auto">
                              <div className="flex min-h-full items-center justify-center p-4">
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                                  <Dialog.Title
                                    as="h3"
                                    className="text-lg font-semibold mb-4 text-gray-900 dark:text-white"
                                  >
                                    Assign Members
                                  </Dialog.Title>
                                  <div className="space-y-4">
                                    {membersData?.members?.map((member) => (
                                      <label
                                        key={member._id}
                                        className="flex items-center space-x-3 cursor-pointer"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={selectedMembers.some(
                                            (m) => m._id === member._id,
                                          )}
                                          onChange={(e) => {
                                            if (e.target.checked) {
                                              setSelectedMembers([
                                                ...selectedMembers,
                                                member,
                                              ]);
                                            } else {
                                              setSelectedMembers(
                                                selectedMembers.filter(
                                                  (m) => m._id !== member._id,
                                                ),
                                              );
                                            }
                                          }}
                                          className="form-checkbox h-5 w-5 text-blue-600"
                                        />
                                        <span className="text-gray-900 dark:text-white">
                                          {member.name}
                                        </span>
                                      </label>
                                    ))}
                                  </div>
                                  <div className="mt-6 flex justify-end space-x-3">
                                    <button
                                      onClick={() =>
                                        setIsAssigningMembers(false)
                                      }
                                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={handleAssignMembers}
                                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                    >
                                      Save
                                    </button>
                                  </div>
                                </Dialog.Panel>
                              </div>
                            </div>
                          </Dialog>
                        </Transition>
                      </div>

                      <div className="mt-6 flex justify-end">
                        <button
                          type="button"
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                          onClick={() => setSelectedEvent(null)}
                        >
                          Close
                        </button>
                      </div>
                    </>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default WorkspaceCalendar;
