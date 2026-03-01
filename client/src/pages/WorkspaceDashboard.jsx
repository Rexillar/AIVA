/*═══════════════════════════════════════════════════════════════════════════════
   AIVA — Workspace Dashboard
   Integrated hub: Tasks + Notes + Habits + Reminders + Team
   Workspace-type aware: Private (personal) | Public (collaboration)
═══════════════════════════════════════════════════════════════════════════════*/

import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LoadingSpinner } from "../components/shared";
import {
  FaTasks, FaCheckCircle, FaClock, FaExclamationTriangle,
  FaStickyNote, FaBolt, FaUsers, FaFlag,
  FaCalendarAlt, FaBrain, FaRocket, FaChartLine,
  FaArrowRight, FaLock, FaGlobe, FaBell,
} from "react-icons/fa";
import Chart from "../components/dashboard/charts/Chart";
import { toast } from "sonner";
import { useGetWorkspaceTasksQuery } from "../redux/slices/api/taskApiSlice";
import { useGetWorkspaceQuery } from "../redux/slices/api/workspaceApiSlice";
import { useGetWorkspaceNotesQuery } from "../redux/slices/api/noteApiSlice";
import { useGetHabitsQuery } from "../redux/slices/api/habitApiSlice";
import { useGetRemindersQuery } from "../redux/slices/api/reminderApiSlice";
import WorkspaceInvitations from "../components/workspace/management/WorkspaceInvitations";
import { HabitWidget } from "../components/dashboard/widgets/HabitWidget";
import { format, subDays, eachDayOfInterval } from "date-fns";

import PropTypes from "prop-types";

/* ── Helpers ───────────────────────────────────────────────────────────── */
const isPublicWorkspace = (ws) =>
  ws?.type === "PublicWorkspace" || ws?.visibility === "public";

const stageLabel = (s) =>
  s === "in_progress" ? "In Progress" : s === "completed" ? "Completed" : s === "review" ? "In Review" : "Todo";

const stageBadge = (s) =>
  s === "completed" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
    : s === "review" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
    : s === "in_progress" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
    : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";

/* ── Stat Card ─────────────────────────────────────────────────────────── */
const StatCard = ({ title, value, icon: Icon, gradient, subtitle, onClick }) => (
  <div
    onClick={onClick}
    className={`relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-200 ${onClick ? "cursor-pointer hover:shadow-md hover:scale-[1.02]" : ""}`}
  >
    <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${gradient} opacity-10 rounded-bl-[40px]`} />
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        {subtitle && <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient} bg-opacity-10`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
  </div>
);

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.elementType.isRequired,
  gradient: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  onClick: PropTypes.func,
};

/* ── Main Dashboard ────────────────────────────────────────────────────── */
const WorkspaceDashboard = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  const isValid = workspaceId && /^[0-9a-fA-F]{24}$/.test(workspaceId);

  // ── Data fetching ──
  const { data: workspace } = useGetWorkspaceQuery(workspaceId, { skip: !isValid });

  const {
    data: taskData,
    isLoading: tasksLoading,
    error: tasksError,
    refetch: refetchTasks,
  } = useGetWorkspaceTasksQuery({ workspaceId }, { skip: !isValid, refetchOnMountOrArgChange: true });

  const { data: notesData } = useGetWorkspaceNotesQuery(workspaceId, { skip: !isValid });
  const { data: habitsData } = useGetHabitsQuery({ workspaceId }, { skip: !isValid });
  const { data: remindersData } = useGetRemindersQuery(workspaceId, { skip: !isValid });

  const isPublic = isPublicWorkspace(workspace);

  // ── Derived data ──
  const allTasks = useMemo(() => taskData?.tasks || [], [taskData]);
  const notes = useMemo(() => notesData?.notes || [], [notesData]);
  const habits = useMemo(() => (Array.isArray(habitsData) ? habitsData : []), [habitsData]);
  const reminders = useMemo(() => {
    const raw = remindersData?.data || remindersData || [];
    return Array.isArray(raw) ? raw : [];
  }, [remindersData]);

  // ── Task stats ──
  const stats = useMemo(() => {
    const total = allTasks.length;
    const todo = allTasks.filter(t => t.stage === "todo").length;
    const in_progress = allTasks.filter(t => t.stage === "in_progress").length;
    const review = allTasks.filter(t => t.stage === "review").length;
    const completed = allTasks.filter(t => t.stage === "completed").length;
    const highPriority = allTasks.filter(t => t.priority === "high" && t.stage !== "completed").length;
    const overdue = allTasks.filter(t => {
      const d = new Date(t.dueDate);
      return t.dueDate && !isNaN(d.getTime()) && d < new Date() && t.stage !== "completed";
    }).length;
    const active = in_progress + review;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, todo, in_progress, review, completed, highPriority, overdue, active, completionRate };
  }, [allTasks]);

  // ── Productivity trends (last 7 days) ──
  const trends = useMemo(() => {
    try {
      const days = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() });
      return days.map(date => {
        const fmt = format(date, "yyyy-MM-dd");
        const created = allTasks.filter(t => t.createdAt && format(new Date(t.createdAt), "yyyy-MM-dd") === fmt).length;
        const done = allTasks.filter(t => t.stage === "completed" && t.updatedAt && format(new Date(t.updatedAt), "yyyy-MM-dd") === fmt).length;
        return { name: format(date, "MMM dd"), "Created": created, "Completed": done };
      });
    } catch { return []; }
  }, [allTasks]);

  // ── Chart data ──
  const chartData = [
    { name: "Todo", value: stats.todo, color: "#6b7280" },
    { name: "In Progress", value: stats.in_progress, color: "#f59e0b" },
    { name: "Review", value: stats.review, color: "#3b82f6" },
    { name: "Completed", value: stats.completed, color: "#10b981" },
  ].filter(i => i.value > 0);

  const priorityData = [
    { name: "High", value: allTasks.filter(t => t.priority === "high").length, color: "#ef4444" },
    { name: "Medium", value: allTasks.filter(t => t.priority === "medium").length, color: "#eab308" },
    { name: "Low", value: allTasks.filter(t => t.priority === "low").length, color: "#22c55e" },
  ].filter(i => i.value > 0);

  // ── Upcoming tasks (due within 7 days, not completed) ──
  const upcomingTasks = useMemo(() => {
    const now = new Date();
    const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return allTasks
      .filter(t => t.dueDate && t.stage !== "completed" && new Date(t.dueDate) >= now && new Date(t.dueDate) <= weekAhead)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);
  }, [allTasks]);

  // ── AI Insights ──
  const insights = useMemo(() => {
    const list = [];
    if (stats.completionRate >= 80 && stats.total > 0) list.push({ type: "success", icon: FaRocket, title: "High Performer!", msg: `${stats.completionRate}% completion — excellent productivity!` });
    else if (stats.completionRate >= 50 && stats.total > 0) list.push({ type: "info", icon: FaChartLine, title: "Good Progress", msg: `You're on track with a ${stats.completionRate}% completion rate.` });
    if (stats.overdue > 0) list.push({ type: "warning", icon: FaExclamationTriangle, title: "Overdue Tasks", msg: `${stats.overdue} task${stats.overdue > 1 ? "s are" : " is"} overdue. Consider reprioritizing.` });
    if (stats.highPriority > 3) list.push({ type: "warning", icon: FaFlag, title: "Priority Stack", msg: `${stats.highPriority} high-priority tasks need attention.` });
    if (stats.active > 10) list.push({ type: "info", icon: FaClock, title: "Heavy Workload", msg: `${stats.active} active tasks — consider breaking them down.` });
    if (notes.length === 0 && stats.total > 0) list.push({ type: "info", icon: FaStickyNote, title: "Start Documenting", msg: "No notes yet. Document decisions and ideas alongside tasks." });
    return list;
  }, [stats, notes.length]);

  // ── Team info (public workspaces only) ──
  const memberCount = workspace?.members?.length || 0;

  /* ── Loading / Error states ── */
  if (!isValid) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-center text-red-500 p-4">
          <h2 className="text-xl font-semibold mb-2">Invalid Workspace ID</h2>
          <p>The workspace ID format is invalid. Please check the URL.</p>
        </div>
      </div>
    );
  }

  if (tasksLoading) {
    return <div className="flex items-center justify-center min-h-[400px]"><LoadingSpinner /></div>;
  }

  if (tasksError) {
    const msg = tasksError.data?.message || "Failed to load workspace data";
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-center text-red-500 p-4">
          <h2 className="text-xl font-semibold mb-2">Error Loading Dashboard</h2>
          <p>{msg}</p>
          <button onClick={() => refetchTasks()} className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700">Retry</button>
        </div>
      </div>
    );
  }

  /* ── Render ───────────────────────────────────────────────────────────── */
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">

      {/* ── Workspace Invitations (public only) ── */}
      {isPublic && (
        <div className="mb-2">
          <WorkspaceInvitations />
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {workspace?.name || taskData?.workspace?.name || "Dashboard"}
            </h1>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${isPublic ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"}`}>
              {isPublic ? <><FaGlobe className="w-2.5 h-2.5" /> Public</> : <><FaLock className="w-2.5 h-2.5" /> Private</>}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {isPublic ? "Team workspace — collaborate with members" : "Personal workspace — your private productivity hub"}
          </p>
        </div>
        {tasksError && (
          <button onClick={() => refetchTasks()} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Retry</button>
        )}
      </div>

      {/* ── Stats Grid ── */}
      <div className={`grid gap-4 ${isPublic ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"}`}>
        <StatCard title="Total Tasks" value={stats.total} icon={FaTasks} gradient="from-blue-500 to-blue-600"
          onClick={() => navigate(`/workspace/${workspaceId}/tasks`)} />
        <StatCard title="Active" value={stats.active} icon={FaClock} gradient="from-amber-500 to-amber-600"
          subtitle={`${stats.in_progress} working · ${stats.review} review`} />
        <StatCard title="Completed" value={stats.completed} icon={FaCheckCircle} gradient="from-emerald-500 to-emerald-600"
          subtitle={stats.total > 0 ? `${stats.completionRate}% done` : undefined} />
        <StatCard title="Overdue" value={stats.overdue} icon={FaExclamationTriangle} gradient="from-red-500 to-red-600" />
        <StatCard title="Notes" value={notes.length} icon={FaStickyNote} gradient="from-purple-500 to-purple-600"
          onClick={() => navigate(`/workspace/${workspaceId}/notes`)} />
        {isPublic && (
          <StatCard title="Members" value={memberCount} icon={FaUsers} gradient="from-pink-500 to-pink-600"
            onClick={() => navigate(`/workspace/${workspaceId}/team`)} />
        )}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FaTasks className="text-blue-500" /> Task Distribution
          </h2>
          {chartData.length > 0 ? (
            <div className="h-64"><Chart data={chartData} height={250} /></div>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-gray-400 text-sm">No tasks yet</div>
          )}
        </div>

        {/* Priority Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FaFlag className="text-orange-500" /> Priority Breakdown
          </h2>
          {priorityData.length > 0 ? (
            <div className="h-64"><Chart data={priorityData} height={250} /></div>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-gray-400 text-sm">No priority data</div>
          )}
        </div>

        {/* Completion Rate */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
          <div className="relative w-32 h-32 mb-4">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 36 36">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-200 dark:text-gray-700" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" strokeWidth="3" strokeDasharray={`${stats.completionRate}, 100`}
                className={stats.completionRate >= 70 ? "stroke-emerald-500" : stats.completionRate >= 40 ? "stroke-amber-500" : "stroke-red-500"} strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-gray-900 dark:text-white">
              {stats.completionRate}%
            </span>
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completion Rate</p>
          <p className="text-xs text-gray-400 mt-1">{stats.completed} of {stats.total} tasks done</p>
        </div>
      </div>

      {/* ── Productivity Trends ── */}
      {trends.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FaChartLine className="text-indigo-500" /> Productivity (Last 7 Days)
            </h2>
          </div>
          <div className="h-56">
            <Chart data={trends} height={220} type="line" showLegend={true} />
          </div>
        </div>
      )}

      {/* ── Middle Row: Upcoming + Habits + Insights ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Upcoming Tasks */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FaCalendarAlt className="text-blue-500" /> Upcoming (7 days)
            </h2>
            <button onClick={() => navigate(`/workspace/${workspaceId}/calendar`)}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Calendar <FaArrowRight className="w-2.5 h-2.5" />
            </button>
          </div>
          {upcomingTasks.length > 0 ? (
            <div className="space-y-2.5">
              {upcomingTasks.map(t => (
                <div key={t._id} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{t.title}</p>
                    <p className="text-[11px] text-gray-500">{t.dueDate ? format(new Date(t.dueDate), "MMM dd, h:mm a") : "No date"}</p>
                  </div>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-medium ${stageBadge(t.stage)}`}>{stageLabel(t.stage)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">No upcoming deadlines</p>
          )}
        </div>

        {/* Habits */}
        <div className="h-full">
          <HabitWidget />
        </div>

        {/* AI Insights */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FaBrain className="text-purple-500" /> AI Insights
          </h2>
          {insights.length > 0 ? (
            <div className="space-y-2.5">
              {insights.map((ins, i) => (
                <div key={i} className={`p-3 rounded-lg border-l-4 ${
                  ins.type === "success" ? "border-green-500 bg-green-50 dark:bg-green-900/10" :
                  ins.type === "warning" ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10" :
                  "border-blue-500 bg-blue-50 dark:bg-blue-900/10"
                }`}>
                  <div className="flex items-start gap-2">
                    <ins.icon className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${
                      ins.type === "success" ? "text-green-600" : ins.type === "warning" ? "text-yellow-600" : "text-blue-600"
                    }`} />
                    <div>
                      <p className="text-xs font-semibold text-gray-900 dark:text-white">{ins.title}</p>
                      <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-0.5">{ins.msg}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <FaBrain className="mx-auto text-2xl text-gray-300 mb-2" />
              <p className="text-sm text-gray-400">Add more tasks to get insights</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Quick Summaries Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Recent Notes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Recent Notes</h3>
            <button onClick={() => navigate(`/workspace/${workspaceId}/notes`)}
              className="text-[11px] text-blue-600 hover:text-blue-700 flex items-center gap-1">
              All <FaArrowRight className="w-2 h-2" />
            </button>
          </div>
          {notes.length > 0 ? (
            <div className="space-y-2">
              {notes.slice(0, 4).map(n => (
                <div key={n._id} className="flex items-center gap-2 text-sm">
                  <FaStickyNote className="text-purple-400 text-xs flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300 truncate">{n.title || "Untitled"}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 py-3 text-center">No notes yet</p>
          )}
        </div>

        {/* Active Reminders */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reminders</h3>
          </div>
          {reminders.length > 0 ? (
            <div className="space-y-2">
              {reminders.slice(0, 4).map((r, i) => (
                <div key={r._id || i} className="flex items-center gap-2 text-sm">
                  <FaBell className="text-amber-400 text-xs flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300 truncate">{r.title || r.message || "Reminder"}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 py-3 text-center">No active reminders</p>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Quick Links</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Tasks", icon: FaTasks, path: "tasks", color: "text-blue-500" },
              { label: "Calendar", icon: FaCalendarAlt, path: "calendar", color: "text-green-500" },
              { label: "Canvas", icon: FaBolt, path: "canvas", color: "text-orange-500" },
              { label: "Drive", icon: FaRocket, path: "drive", color: "text-indigo-500" },
            ].map(l => (
              <button key={l.path} onClick={() => navigate(`/workspace/${workspaceId}/${l.path}`)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 text-sm text-gray-700 dark:text-gray-300 transition-colors">
                <l.icon className={`w-3.5 h-3.5 ${l.color}`} /> {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Public Workspace: Team Overview ── */}
      {isPublic && memberCount > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FaUsers className="text-pink-500" /> Team Members
            </h2>
            <button onClick={() => navigate(`/workspace/${workspaceId}/team`)}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Manage <FaArrowRight className="w-2.5 h-2.5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {workspace.members.slice(0, 12).map((m, i) => {
              const name = m.user?.name || m.user?.email || "Member";
              return (
                <div key={m.user?._id || i} className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900 dark:text-white">{name}</p>
                    <p className="text-[10px] text-gray-500 capitalize">{m.role}</p>
                  </div>
                </div>
              );
            })}
            {memberCount > 12 && (
              <div className="flex items-center px-3 py-2 text-xs text-gray-500">+{memberCount - 12} more</div>
            )}
          </div>
        </div>
      )}

      {/* ── Recent Tasks ── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FaTasks className="text-blue-500" /> Recent Tasks
          </h2>
          <button onClick={() => navigate(`/workspace/${workspaceId}/tasks`)}
            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
            All Tasks <FaArrowRight className="w-2.5 h-2.5" />
          </button>
        </div>
        {allTasks.length > 0 ? (
          <div className="space-y-2.5">
            {allTasks.slice(0, 8).map(task => (
              <div key={task._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {task.isGoogleTask && (
                    <span className="px-1.5 py-0.5 text-[9px] font-medium text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 rounded">G</span>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">{task.title}</h3>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500">
                      {task.dueDate && <span>{format(new Date(task.dueDate), "MMM dd")}</span>}
                      {task.priority && (
                        <span className={`capitalize ${task.priority === "high" ? "text-red-500" : task.priority === "medium" ? "text-amber-500" : "text-gray-400"}`}>
                          {task.priority}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className={`ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-medium ${stageBadge(task.stage)}`}>
                  {stageLabel(task.stage)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FaTasks className="mx-auto text-3xl text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">No tasks yet — create your first task to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkspaceDashboard;
