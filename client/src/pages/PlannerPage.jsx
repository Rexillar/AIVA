import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useWorkspace } from '../components/workspace/provider/WorkspaceProvider';
import {
  useGetDailyPlanQuery,
  useGetScheduleConflictsQuery,
  useLazyGetSuggestedDayQuery,
} from '../redux/slices/api/orchestrationApiSlice';
import {
  FaProjectDiagram, FaCalendarDay, FaExclamationTriangle, FaMagic,
  FaCheckCircle, FaClock, FaRegCalendarAlt, FaTasks, FaSun, FaMoon,
} from 'react-icons/fa';
import { toast } from 'sonner';

const PlannerPage = () => {
  const { workspaceId } = useParams();
  const { workspace } = useWorkspace();
  const wId = workspaceId || workspace?._id;

  const today = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(today);
  const [estimatedHours, setEstimatedHours] = useState(2);
  const [lookAhead, setLookAhead] = useState(7);

  const { data: dailyPlan, isLoading: planLoading } = useGetDailyPlanQuery(
    { workspaceId: wId, date: selectedDate },
    { skip: !wId }
  );
  const { data: conflicts, isLoading: conflictsLoading } = useGetScheduleConflictsQuery(
    { workspaceId: wId, lookAheadDays: lookAhead },
    { skip: !wId }
  );
  const [triggerSuggest, { data: suggestion, isLoading: suggesting }] = useLazyGetSuggestedDayQuery();

  const handleSuggest = () => {
    if (!wId) return;
    triggerSuggest({ workspaceId: wId, estimatedHours, lookAheadDays: 14 })
      .unwrap()
      .then(() => toast.success('Best day found'))
      .catch(() => toast.error('Could not suggest a day'));
  };

  // Flatten daily plan items for timeline
  const timelineItems = useMemo(() => {
    if (!dailyPlan) return [];
    const items = [];
    if (dailyPlan.tasks) {
      dailyPlan.tasks.forEach((t) => items.push({ ...t, _type: 'task' }));
    }
    if (dailyPlan.events) {
      dailyPlan.events.forEach((e) => items.push({ ...e, _type: 'event' }));
    }
    if (dailyPlan.habits) {
      dailyPlan.habits.forEach((h) => items.push({ ...h, _type: 'habit' }));
    }
    if (dailyPlan.reminders) {
      dailyPlan.reminders.forEach((r) => items.push({ ...r, _type: 'reminder' }));
    }
    // Sort by time if available
    items.sort((a, b) => {
      const tA = a.dueDate || a.startTime || a.time || '';
      const tB = b.dueDate || b.startTime || b.time || '';
      return tA.localeCompare(tB);
    });
    return items;
  }, [dailyPlan]);

  const typeStyles = {
    task: { icon: FaTasks, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    event: { icon: FaRegCalendarAlt, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    habit: { icon: FaCheckCircle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
    reminder: { icon: FaClock, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FaProjectDiagram className="text-indigo-500" /> Daily Planner
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            View your daily plan, detect conflicts, and find the best time for new work
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Timeline */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                <FaCalendarDay className="text-indigo-500" /> {selectedDate === today ? "Today's Plan" : `Plan for ${selectedDate}`}
              </h2>
            </div>
            <div className="p-4">
              {planLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-indigo-600" />
                </div>
              ) : timelineItems.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <FaSun className="mx-auto text-3xl mb-2 opacity-30" />
                  <p className="text-sm font-medium">Nothing scheduled</p>
                  <p className="text-xs mt-1">Your day is free — or no plan data yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {timelineItems.map((item, idx) => {
                    const style = typeStyles[item._type] || typeStyles.task;
                    const Icon = style.icon;
                    const timeStr = item.dueDate ? new Date(item.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : item.startTime || item.time || '';
                    return (
                      <div key={idx} className={`flex items-start gap-3 p-3 rounded-lg ${style.bg}`}>
                        <Icon className={`mt-0.5 ${style.color} flex-shrink-0`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{item.title || item.name || item.text || 'Untitled'}</p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                            {timeStr && <span className="flex items-center gap-1"><FaClock className="text-[10px]" />{timeStr}</span>}
                            <span className="capitalize bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">{item._type}</span>
                            {item.priority && <span className="capitalize">{item.priority}</span>}
                            {item.stage && <span>{item.stage}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Summary stats */}
              {dailyPlan && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Tasks', value: dailyPlan.tasks?.length || 0, color: 'text-blue-600' },
                    { label: 'Events', value: dailyPlan.events?.length || 0, color: 'text-purple-600' },
                    { label: 'Habits', value: dailyPlan.habits?.length || 0, color: 'text-green-600' },
                    { label: 'Reminders', value: dailyPlan.reminders?.length || 0, color: 'text-orange-600' },
                  ].map(s => (
                    <div key={s.label} className="text-center">
                      <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400">{s.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-5">
          {/* Conflicts */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                <FaExclamationTriangle className="text-yellow-500" /> Conflicts
                <span className="text-xs text-gray-400 font-normal">next {lookAhead} days</span>
              </h2>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <label className="text-xs text-gray-500">Look ahead:</label>
                <select value={lookAhead} onChange={e => setLookAhead(+e.target.value)}
                  className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs">
                  <option value={3}>3 days</option><option value={7}>7 days</option><option value={14}>14 days</option><option value={30}>30 days</option>
                </select>
              </div>
              {conflictsLoading ? (
                <div className="flex justify-center py-6"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-500" /></div>
              ) : !conflicts || (Array.isArray(conflicts) && conflicts.length === 0) ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No conflicts detected</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {(Array.isArray(conflicts) ? conflicts : conflicts.conflicts || []).map((c, i) => (
                    <div key={i} className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-xs">
                      <p className="font-medium text-yellow-700 dark:text-yellow-300">{c.description || c.message || c.type || 'Conflict'}</p>
                      {c.date && <p className="text-yellow-600 dark:text-yellow-400 mt-0.5">{new Date(c.date).toLocaleDateString()}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Suggest Best Day */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                <FaMagic className="text-violet-500" /> Find Best Day
              </h2>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Estimated Hours Needed</label>
                <input type="number" min="0.5" max="12" step="0.5" value={estimatedHours} onChange={e => setEstimatedHours(+e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500" />
              </div>
              <button onClick={handleSuggest} disabled={suggesting}
                className="w-full px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-2">
                {suggesting ? 'Analyzing...' : <><FaMagic /> Suggest Day</>}
              </button>
              {suggestion && (
                <div className="space-y-2">
                  {/* Best day highlight */}
                  {suggestion.bestDay && (
                    <div className="p-3 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
                      <p className="text-xs font-semibold text-violet-500 uppercase tracking-wider mb-1">Best Day</p>
                      <p className="text-sm font-medium text-violet-700 dark:text-violet-300 flex items-center gap-2">
                        <FaCalendarDay />
                        {new Date(suggestion.bestDay.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-xs text-violet-600 dark:text-violet-400 mt-1">
                        {suggestion.bestDay.freeHours?.toFixed(1)}h free &middot; {suggestion.bestDay.meetingHours?.toFixed(1)}h meetings &middot; {suggestion.bestDay.taskHours?.toFixed(1)}h tasks
                      </p>
                    </div>
                  )}
                  {!suggestion.bestDay && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm text-yellow-700 dark:text-yellow-300">
                      No day with enough free hours found in the next 14 days.
                    </div>
                  )}
                  {/* Other suggestions */}
                  {suggestion.suggestions && suggestion.suggestions.length > 1 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Other Options</p>
                      <div className="space-y-1.5">
                        {suggestion.suggestions.slice(1, 5).map((s, i) => (
                          <div key={i} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-xs">
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {new Date(s.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400">{s.freeHours?.toFixed(1)}h free</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlannerPage;
