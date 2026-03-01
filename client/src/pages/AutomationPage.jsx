import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useWorkspace } from '../components/workspace/provider/WorkspaceProvider';
import {
  useGetAutomationRulesQuery,
  useCreateAutomationRuleMutation,
  useDeleteAutomationRuleMutation,
  useToggleAutomationRuleMutation,
  useTriggerAutomationRuleMutation,
} from '../redux/slices/api/automationApiSlice';
import {
  FaPlus, FaBolt, FaTimes, FaTrash, FaPlay, FaToggleOn, FaToggleOff,
  FaClock, FaCheckCircle, FaBell, FaTags, FaRobot, FaMinus,
} from 'react-icons/fa';
import { toast } from 'sonner';

const eventLabels = {
  task_completed: 'Task Completed',
  task_created: 'Task Created',
  task_overdue: 'Task Overdue',
  task_stage_changed: 'Task Stage Changed',
  habit_completed: 'Habit Completed',
  habit_missed: 'Habit Missed',
  note_created: 'Note Created',
  schedule: 'Scheduled (Cron)',
};

const actionLabels = {
  create_task: 'Create Task',
  create_task_from_template: 'Create from Template',
  update_task_stage: 'Update Task Stage',
  send_notification: 'Send Notification',
  send_email: 'Send Email',
  add_activity_log: 'Log Activity',
  create_reminder: 'Create Reminder',
  complete_habit: 'Complete Habit',
  tag_task: 'Tag Task',
};

// Trigger events that support condition filters
const triggerConditionSupport = {
  task_completed: ['priority', 'label'],
  task_created: ['priority', 'label'],
  task_overdue: ['priority', 'label'],
  task_stage_changed: ['stage', 'priority', 'label'],
  habit_completed: [],
  habit_missed: [],
  note_created: ['label'],
  schedule: ['cronExpression'],
};

const defaultAction = () => ({ type: 'send_notification', params: { title: '', message: '', stage: '', priority: '', tag: '', email: '', subject: '', body: '', templateId: '', habitId: '', description: '' } });

const AutomationPage = () => {
  const { workspaceId } = useParams();
  const { workspace } = useWorkspace();
  const wId = workspaceId || workspace?._id;

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    triggerEvent: 'task_completed',
    cronExpression: '',
    condStage: '',
    condPriority: '',
    condLabel: '',
  });
  const [actions, setActions] = useState([defaultAction()]);

  const { data: rules = [], isLoading } = useGetAutomationRulesQuery(wId, { skip: !wId });
  const [createRule, { isLoading: creating }] = useCreateAutomationRuleMutation();
  const [deleteRule] = useDeleteAutomationRuleMutation();
  const [toggleRule] = useToggleAutomationRuleMutation();
  const [triggerRule, { isLoading: triggering }] = useTriggerAutomationRuleMutation();

  const updateAction = (idx, field, value) => {
    setActions(prev => prev.map((a, i) => i === idx ? (field === 'type' ? { ...a, type: value, params: defaultAction().params } : { ...a, params: { ...a.params, [field]: value } }) : a));
  };
  const addAction = () => { if (actions.length < 5) setActions(prev => [...prev, defaultAction()]); };
  const removeAction = (idx) => { if (actions.length > 1) setActions(prev => prev.filter((_, i) => i !== idx)); };

  const resetForm = () => {
    setForm({ name: '', description: '', triggerEvent: 'task_completed', cronExpression: '', condStage: '', condPriority: '', condLabel: '' });
    setActions([defaultAction()]);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const conditions = {};
      if (form.triggerEvent === 'schedule' && form.cronExpression) conditions.cronExpression = form.cronExpression;
      if (form.condStage) conditions.stage = form.condStage;
      if (form.condPriority) conditions.priority = form.condPriority;
      if (form.condLabel) conditions.label = form.condLabel;

      const cleanActions = actions.map(a => {
        const p = {};
        Object.entries(a.params).forEach(([k, v]) => { if (v) p[k] = v; });
        return { type: a.type, params: p };
      });

      await createRule({
        name: form.name,
        description: form.description || undefined,
        workspace: wId,
        trigger: { event: form.triggerEvent, conditions },
        actions: cleanActions,
      }).unwrap();
      setShowForm(false);
      resetForm();
      toast.success('Automation rule created');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create rule');
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleRule(id).unwrap();
      toast.success('Rule toggled');
    } catch { toast.error('Failed to toggle'); }
  };

  const handleTrigger = async (id) => {
    try {
      await triggerRule({ id }).unwrap();
      toast.success('Rule triggered manually');
    } catch { toast.error('Failed to trigger'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this rule?')) return;
    try {
      await deleteRule(id).unwrap();
      toast.success('Rule deleted');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FaBolt className="text-amber-500" /> Automation Rules
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Trigger actions automatically on events or schedules
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium">
          {showForm ? <FaTimes /> : <FaPlus />} {showForm ? 'Cancel' : 'New Rule'}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-gray-800 rounded-xl p-5 mb-6 shadow-sm border border-gray-200 dark:border-gray-700 space-y-5">
          {/* ── Name & Description ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Rule Name *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent" placeholder="e.g. Notify on task complete" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Description</label>
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent" placeholder="What does this rule do?" />
            </div>
          </div>

          {/* ── Trigger Section ── */}
          <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-blue-50/50 dark:bg-blue-900/10">
            <h3 className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-3">When (Trigger)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Event *</label>
                <select value={form.triggerEvent} onChange={e => setForm({ ...form, triggerEvent: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
                  {Object.entries(eventLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              {form.triggerEvent === 'schedule' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Cron Expression</label>
                  <input value={form.cronExpression} onChange={e => setForm({ ...form, cronExpression: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-amber-500 focus:border-transparent" placeholder="0 9 * * *" />
                  <p className="text-[10px] text-gray-400 mt-1">e.g. 0 9 * * 1 = Mon 9AM</p>
                </div>
              )}
              {(triggerConditionSupport[form.triggerEvent] || []).includes('stage') && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Filter by Stage</label>
                  <select value={form.condStage} onChange={e => setForm({ ...form, condStage: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
                    <option value="">Any stage</option>
                    <option value="todo">To Do</option><option value="in_progress">In Progress</option>
                    <option value="review">Review</option><option value="completed">Completed</option>
                  </select>
                </div>
              )}
              {(triggerConditionSupport[form.triggerEvent] || []).includes('priority') && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Filter by Priority</label>
                  <select value={form.condPriority} onChange={e => setForm({ ...form, condPriority: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
                    <option value="">Any priority</option>
                    <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                  </select>
                </div>
              )}
              {(triggerConditionSupport[form.triggerEvent] || []).includes('label') && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Filter by Label</label>
                  <input value={form.condLabel} onChange={e => setForm({ ...form, condLabel: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent" placeholder="e.g. urgent" />
                </div>
              )}
            </div>
          </div>

          {/* ── Actions Section ── */}
          <div className="border border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50/50 dark:bg-green-900/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wider">Then (Actions)</h3>
              <button type="button" onClick={addAction} disabled={actions.length >= 5}
                className="text-xs text-green-600 hover:text-green-700 font-medium disabled:opacity-40 flex items-center gap-1">
                <FaPlus className="text-[10px]" /> Add Action
              </button>
            </div>
            <div className="space-y-4">
              {actions.map((action, idx) => (
                <div key={idx} className="relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                  {actions.length > 1 && (
                    <button type="button" onClick={() => removeAction(idx)}
                      className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition-colors" title="Remove action">
                      <FaMinus className="text-[10px]" />
                    </button>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Action Type</label>
                      <select value={action.type} onChange={e => updateAction(idx, 'type', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
                        {Object.entries(actionLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>

                    {/* ── Notification fields ── */}
                    {action.type === 'send_notification' && (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Title</label>
                          <input value={action.params.title} onChange={e => updateAction(idx, 'title', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent" placeholder="Notification title" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Message</label>
                          <input value={action.params.message} onChange={e => updateAction(idx, 'message', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent" placeholder="Notification message" />
                        </div>
                      </>
                    )}

                    {/* ── Email fields ── */}
                    {action.type === 'send_email' && (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Recipient Email</label>
                          <input type="email" value={action.params.email} onChange={e => updateAction(idx, 'email', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent" placeholder="user@example.com" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Subject</label>
                          <input value={action.params.subject} onChange={e => updateAction(idx, 'subject', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent" placeholder="Email subject" />
                        </div>
                        <div className="sm:col-span-2 lg:col-span-3">
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Body</label>
                          <textarea value={action.params.body} onChange={e => updateAction(idx, 'body', e.target.value)} rows={2}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent" placeholder="Email body" />
                        </div>
                      </>
                    )}

                    {/* ── Create Task fields ── */}
                    {action.type === 'create_task' && (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Task Title</label>
                          <input value={action.params.title} onChange={e => updateAction(idx, 'title', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent" placeholder="New task title" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Priority</label>
                          <select value={action.params.priority} onChange={e => updateAction(idx, 'priority', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
                            <option value="">Default</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Stage</label>
                          <select value={action.params.stage} onChange={e => updateAction(idx, 'stage', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
                            <option value="todo">To Do</option><option value="in_progress">In Progress</option><option value="review">Review</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2 lg:col-span-3">
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Description</label>
                          <textarea value={action.params.description} onChange={e => updateAction(idx, 'description', e.target.value)} rows={2}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent" placeholder="Task description" />
                        </div>
                      </>
                    )}

                    {/* ── Create from Template ── */}
                    {action.type === 'create_task_from_template' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Template ID</label>
                        <input value={action.params.templateId} onChange={e => updateAction(idx, 'templateId', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-amber-500 focus:border-transparent" placeholder="Template ObjectId" />
                      </div>
                    )}

                    {/* ── Update Task Stage ── */}
                    {action.type === 'update_task_stage' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Target Stage</label>
                        <select value={action.params.stage} onChange={e => updateAction(idx, 'stage', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
                          <option value="todo">To Do</option><option value="in_progress">In Progress</option>
                          <option value="review">Review</option><option value="completed">Completed</option>
                        </select>
                      </div>
                    )}

                    {/* ── Create Reminder ── */}
                    {action.type === 'create_reminder' && (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Title</label>
                          <input value={action.params.title} onChange={e => updateAction(idx, 'title', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent" placeholder="Reminder title" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Message</label>
                          <input value={action.params.message} onChange={e => updateAction(idx, 'message', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent" placeholder="Reminder message" />
                        </div>
                      </>
                    )}

                    {/* ── Log Activity ── */}
                    {action.type === 'add_activity_log' && (
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Log Message</label>
                        <input value={action.params.message} onChange={e => updateAction(idx, 'message', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent" placeholder="Activity log message" />
                      </div>
                    )}

                    {/* ── Complete Habit ── */}
                    {action.type === 'complete_habit' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Habit ID</label>
                        <input value={action.params.habitId} onChange={e => updateAction(idx, 'habitId', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-amber-500 focus:border-transparent" placeholder="Habit ObjectId" />
                      </div>
                    )}

                    {/* ── Tag Task ── */}
                    {action.type === 'tag_task' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Tag Name</label>
                        <input value={action.params.tag} onChange={e => updateAction(idx, 'tag', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent" placeholder="e.g. reviewed" />
                      </div>
                    )}
                  </div>
                  {actions.length > 1 && (
                    <span className="absolute top-2 left-3 text-[10px] text-gray-400 font-medium">Action {idx + 1}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={creating}
            className="px-5 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 text-sm font-medium">
            {creating ? 'Creating...' : 'Create Rule'}
          </button>
        </form>
      )}

      {/* Rules List */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
        </div>
      ) : rules.length === 0 ? (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">
          <FaRobot className="mx-auto text-4xl mb-3 opacity-30" />
          <p className="font-medium">No automation rules</p>
          <p className="text-sm mt-1">Create rules to automate repetitive workflows</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {rules.map((r) => (
            <div key={r._id} className={`bg-white dark:bg-gray-800 rounded-xl p-4 border transition-colors ${r.isActive !== false ? 'border-gray-200 dark:border-gray-700' : 'border-gray-200 dark:border-gray-700 opacity-60'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <FaBolt className={`text-xs ${r.isActive !== false ? 'text-amber-500' : 'text-gray-400'}`} />
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm">{r.name}</h3>
                    {r.isActive === false && <span className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-500">Disabled</span>}
                  </div>
                  {r.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-5">{r.description}</p>}
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 rounded text-blue-600 dark:text-blue-400 font-medium">
                      <FaClock className="text-[10px]" /> {eventLabels[r.trigger?.event] || r.trigger?.event}
                    </span>
                    {r.trigger?.conditions?.cronExpression && (
                      <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-[11px]">{r.trigger.conditions.cronExpression}</span>
                    )}
                    {r.trigger?.conditions?.stage && <span className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">stage: {r.trigger.conditions.stage}</span>}
                    {r.trigger?.conditions?.priority && <span className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">priority: {r.trigger.conditions.priority}</span>}
                    {r.trigger?.conditions?.label && <span className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">label: {r.trigger.conditions.label}</span>}
                    <span className="text-gray-300 dark:text-gray-600">→</span>
                    {r.actions?.map((a, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 dark:bg-green-900/20 rounded text-green-600 dark:text-green-400 font-medium">
                        <FaCheckCircle className="text-[10px]" /> {actionLabels[a.type] || a.type}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-400">
                    <span>Executed {r.executionCount || 0}x</span>
                    {r.lastExecutedAt && <span>Last: {new Date(r.lastExecutedAt).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => handleToggle(r._id)} title={r.isActive !== false ? 'Disable' : 'Enable'}
                    className="p-2 text-gray-400 hover:text-amber-500 transition-colors">
                    {r.isActive !== false ? <FaToggleOn className="text-lg text-amber-500" /> : <FaToggleOff className="text-lg" />}
                  </button>
                  <button onClick={() => handleTrigger(r._id)} disabled={triggering} title="Test run"
                    className="p-2 text-gray-400 hover:text-green-500 transition-colors disabled:opacity-50">
                    <FaPlay className="text-xs" />
                  </button>
                  <button onClick={() => handleDelete(r._id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <FaTrash className="text-xs" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutomationPage;
