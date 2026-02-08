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
   ⟁  DOMAIN       : PAGE COMPONENTS

   ⟁  PURPOSE      : Implement complete page views and layouts

   ⟁  WHY          : Organized application navigation and structure

   ⟁  WHAT         : Full page React components with routing

   ⟁  TECH STACK   : React • Redux • Vite
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : MEDIUM
   ⟁  DOCS : /docs/frontend/pages.md

   ⟁  USAGE RULES  : Manage routing • Handle data • User experience

        "Pages rendered. Navigation smooth. User journey optimized."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

import { useState, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
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
import { fetchExternalEvents } from "../slices/externalEventsSlice";

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
  const dispatch = useDispatch();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [viewType, setViewType] = useState("dayGridMonth");
  const [filter, setFilter] = useState("all"); // 'all', 'upcoming', 'overdue', 'completed'
  const [isAssigningMembers, setIsAssigningMembers] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);

  // Redux state for external events
  const { events: externalEvents, loading: externalEventsLoading } = useSelector(
    (state) => state.externalEvents
  );

  const { data: workspaceData, isLoading: isLoadingTasks } =
    useGetWorkspaceTasksQuery({ workspaceId });
  const { data: membersData, isLoading: isLoadingMembers } =
    useGetWorkspaceMembersQuery(workspaceId);
  const [updateTask] = useUpdateTaskMutation();

  // Fetch external events from Google Calendar when component mounts
  useEffect(() => {
    if (workspaceId) {
      // Get date range for the current month - expanded range
      const now = new Date();
      // Fetch 6 months back and 12 months forward to cover the full year
      const startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 12, 0);

      // First, cleanup stale events
      fetch(`/api/google/events/${workspaceId}/cleanup`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
        .then(response => response.json())
        .then(data => {
          console.log('[Calendar] Cleanup result:', data);
          // After cleanup, fetch fresh events
          dispatch(fetchExternalEvents({
            workspaceId,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          }));
        })
        .catch(error => {
          console.error('[Calendar] Cleanup error:', error);
          // Still fetch events even if cleanup fails
          dispatch(fetchExternalEvents({
            workspaceId,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          }));
        });
    }
  }, [workspaceId, dispatch]);

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

    // Add external Google Calendar events
    if (externalEvents && externalEvents.length > 0) {
      console.log('=== EXTERNAL EVENTS DEBUG ===');
      console.log('Total external events:', externalEvents.length);

      // Log all events to see if there are duplicates in the source data
      const eventTitles = {};
      externalEvents.forEach((event, index) => {
        const key = `${event.title}-${event.startTime}`;
        if (!eventTitles[key]) {
          eventTitles[key] = [];
        }
        eventTitles[key].push(index);

        console.log(`Event ${index}:`, {
          title: event.title,
          startTime: event.startTime,
          endTime: event.endTime,
          allDay: event.allDay,
          _id: event._id,
          googleEventId: event.googleEventId
        });
      });

      // Check for duplicates
      Object.entries(eventTitles).forEach(([key, indices]) => {
        if (indices.length > 1) {
          console.warn(`DUPLICATE FOUND: "${key}" appears ${indices.length} times at indices:`, indices);
        }
      });

      externalEvents.forEach((event) => {
        let start = event.startTime;
        let end = event.endTime || event.startTime;

        // Provide simpler date strings for all-day events to avoid timezone issues
        if (event.allDay) {
          try {
            // Extract YYYY-MM-DD from start time
            if (typeof event.startTime === 'string' && event.startTime.length >= 10) {
              start = event.startTime.slice(0, 10);
            } else {
              start = format(new Date(event.startTime), 'yyyy-MM-dd');
            }

            // For all-day events, FullCalendar uses EXCLUSIVE end dates
            // Google sends: start="2026-02-03", end="2026-02-04" for a single day event
            // FullCalendar expects: start="2026-02-03", end=undefined OR end="2026-02-04"
            // To avoid spanning, we check if it's a single day event and omit the end
            if (event.endTime) {
              let endDateStr;
              if (typeof event.endTime === 'string' && event.endTime.length >= 10) {
                endDateStr = event.endTime.slice(0, 10);
              } else {
                endDateStr = format(new Date(event.endTime), 'yyyy-MM-dd');
              }

              // Calculate day difference
              const startDate = new Date(start);
              const endDate = new Date(endDateStr);
              const diffDays = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));

              // If it's exactly 1 day difference (single day event), don't set end
              // FullCalendar will render it as a single day
              if (diffDays === 1) {
                end = undefined; // Let FullCalendar handle single day
              } else {
                end = endDateStr; // Multi-day event
              }
            } else {
              end = undefined; // Single day event
            }
          } catch (e) {
            console.error('Error formatting dates:', e);
          }
        }

        allEvents.push({
          id: `external-${event._id}`,
          title: event.title,
          start: start,
          end: end,
          allDay: event.allDay,
          backgroundColor: "#4285f4", // Google blue
          borderColor: "#4285f4",
          textColor: "#ffffff",
          extendedProps: {
            type: "external",
            source: event.source, // 'google_calendar', 'google_tasks', 'google_meet'
            description: event.description,
            location: event.location,
            meetingUrl: event.meetingUrl,
            organizer: event.organizer,
            attendees: event.attendees,
            accountEmail: event.accountEmail,
            accountName: event.accountName,
            accountAvatar: event.accountAvatar,
            externalId: event.externalId,
            isGoogleEvent: true
          },
        });
      });
    }

    return allEvents;
  }, [workspaceData, filter, externalEvents]);

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
                    const isGoogleEvent = arg.event.extendedProps.isGoogleEvent;
                    const accountEmail = arg.event.extendedProps.accountEmail;
                    const accountAvatar = arg.event.extendedProps.accountAvatar;
                    const accountName = arg.event.extendedProps.accountName;

                    return (
                      <div
                        className={`p-1.5 rounded-md transition-all hover:scale-[1.02] ${isOverdue ? "text-red-600 font-medium" : ""}`}
                      >
                        {isGoogleEvent && (
                          <div className="inline-flex items-center mr-1 gap-1">
                            <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                              <svg className="w-3 h-3 mr-0.5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                              </svg>
                            </span>
                            {accountAvatar ? (
                              <img
                                src={accountAvatar}
                                alt={accountName || accountEmail}
                                className="w-5 h-5 rounded-full border-2 border-blue-500 object-cover flex-shrink-0"
                                title={accountEmail}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextElementSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <span
                              className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full text-white flex-shrink-0"
                              style={{
                                backgroundColor: `${['#EA4335', '#34A853', '#4285F4', '#FBBC05', '#FF6D01', '#46BDC6'][accountEmail?.charCodeAt(0) % 6 || 0]}`,
                                display: accountAvatar ? 'none' : 'flex'
                              }}
                              title={accountEmail}
                            >
                              {accountEmail?.charAt(0).toUpperCase() || 'G'}
                            </span>
                          </div>
                        )}
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
                          {selectedEvent.extendedProps.type === "external"
                            ? (
                              <span className="inline-flex items-center">
                                <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Google Calendar Event
                              </span>
                            )
                            : selectedEvent.extendedProps.type === "subtask"
                              ? "Subtask"
                              : "Task"}
                        </p>
                      </Dialog.Title>

                      <div className="mt-4 space-y-4">
                        {/* Show different content for external events */}
                        {selectedEvent.extendedProps.type === "external" ? (
                          <>
                            {/* Event Time */}
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                              <div className="flex items-center gap-2">
                                <FaCalendarAlt className="text-blue-500" />
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                  Event Time
                                </h4>
                              </div>
                              <p className="mt-1 text-gray-900 dark:text-white">
                                {format(new Date(selectedEvent.start), "PPP p")}
                                {selectedEvent.end && !selectedEvent.allDay && (
                                  <span> - {format(new Date(selectedEvent.end), "p")}</span>
                                )}
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

                            {/* Location */}
                            {selectedEvent.extendedProps.location && (
                              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                  Location
                                </h4>
                                <p className="mt-1 text-gray-900 dark:text-white">
                                  {selectedEvent.extendedProps.location}
                                </p>
                              </div>
                            )}

                            {/* Meeting URL */}
                            {selectedEvent.extendedProps.meetingUrl && (
                              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                  Meeting Link
                                </h4>
                                <a
                                  href={selectedEvent.extendedProps.meetingUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-1 text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                  Join Google Meet
                                </a>
                              </div>
                            )}

                            {/* Organizer - Remove since it's now in account section */}
                            {/* {selectedEvent.extendedProps.organizer && (
                              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                  Organizer
                                </h4>
                                <p className="mt-1 text-gray-900 dark:text-white">
                                  {selectedEvent.extendedProps.organizer.displayName || selectedEvent.extendedProps.organizer.email}
                                </p>
                              </div>
                            )} */}

                            {/* Google Account with Avatar */}
                            {selectedEvent.extendedProps.accountEmail && (
                              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                  Synced from Google Account
                                </h4>
                                <div className="flex items-center gap-3 mt-2">
                                  {selectedEvent.extendedProps.accountAvatar ? (
                                    <img
                                      src={selectedEvent.extendedProps.accountAvatar}
                                      alt={selectedEvent.extendedProps.accountName || selectedEvent.extendedProps.accountEmail}
                                      className="w-10 h-10 rounded-full border-2 border-blue-500 object-cover flex-shrink-0"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextElementSibling.style.display = 'flex';
                                      }}
                                    />
                                  ) : null}
                                  <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                                    style={{
                                      backgroundColor: `${['#EA4335', '#34A853', '#4285F4', '#FBBC05', '#FF6D01', '#46BDC6'][selectedEvent.extendedProps.accountEmail.charCodeAt(0) % 6]}`,
                                      display: selectedEvent.extendedProps.accountAvatar ? 'none' : 'flex'
                                    }}
                                  >
                                    {selectedEvent.extendedProps.accountEmail.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                      {selectedEvent.extendedProps.accountName || selectedEvent.extendedProps.accountEmail}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {selectedEvent.extendedProps.accountEmail}
                                    </p>
                                    {selectedEvent.extendedProps.organizer && (
                                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Organizer: {selectedEvent.extendedProps.organizer.displayName || selectedEvent.extendedProps.organizer.email}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            {/* Original task/subtask content */}
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
                          </>
                        )}

                        {/* Assigned Members Section - Only for AIVA tasks/subtasks */}
                        {selectedEvent.extendedProps.type !== "external" && (
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
                        )}

                        {/* Member Assignment Modal - Only for AIVA tasks */}
                        {selectedEvent.extendedProps.type !== "external" && (
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
                        )}
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
