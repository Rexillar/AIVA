import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useWorkspace } from '../components/workspace/provider/WorkspaceProvider';
import {
  useGetTemplatesQuery,
  useCreateTemplateMutation,
  useDeleteTemplateMutation,
  useCreateTaskFromTemplateMutation,
} from '../redux/slices/api/templateApiSlice';
import {
  FaPlus, FaClone, FaTimes, FaPlay, FaTrash, FaSearch, FaLayerGroup, FaListUl,
} from 'react-icons/fa';
import { toast } from 'sonner';

const priorityBadge = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  low: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
};

const TemplatesPage = () => {
  const { workspaceId } = useParams();
  const { workspace } = useWorkspace();
  const wId = workspaceId || workspace?._id;

  const [showForm, setShowForm] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [form, setForm] = useState({
    name: '', taskTitle: '', taskDescription: '', priority: 'medium', stage: 'todo',
    category: '', relativeDueDays: 7, subtasks: '',
  });

  const { data: templates = [], isLoading } = useGetTemplatesQuery(
    { workspaceId: wId, category: categoryFilter || undefined },
    { skip: !wId }
  );

  const [createTemplate, { isLoading: creating }] = useCreateTemplateMutation();
  const [deleteTemplate] = useDeleteTemplateMutation();
  const [createTaskFromTemplate, { isLoading: spawning }] = useCreateTaskFromTemplateMutation();

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const subtasks = form.subtasks
        ? form.subtasks.split('\n').filter(s => s.trim()).map(title => ({ title: title.trim() }))
        : [];
      await createTemplate({
        workspace: wId,
        name: form.name,
        taskTitle: form.taskTitle || form.name,
        taskDescription: form.taskDescription,
        priority: form.priority,
        stage: form.stage,
        category: form.category || undefined,
        relativeDueDays: parseInt(form.relativeDueDays) || 7,
        subtasks,
      }).unwrap();
      setShowForm(false);
      setForm({ name: '', taskTitle: '', taskDescription: '', priority: 'medium', stage: 'todo', category: '', relativeDueDays: 7, subtasks: '' });
      toast.success('Template created');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create template');
    }
  };

  const handleSpawnTask = async (templateId) => {
    try {
      const result = await createTaskFromTemplate({ id: templateId, workspaceId: wId }).unwrap();
      toast.success(`Task "${result.title || 'New task'}" created from template`);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create task');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Archive this template?')) return;
    try {
      await deleteTemplate(id).unwrap();
      toast.success('Template archived');
    } catch { toast.error('Failed to delete'); }
  };

  const categories = [...new Set(templates.filter(t => t.category).map(t => t.category))];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FaClone className="text-violet-500" /> Task Templates
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Reusable blueprints — one click to spawn a full task with subtasks
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors text-sm font-medium">
          {showForm ? <FaTimes /> : <FaPlus />} {showForm ? 'Cancel' : 'New Template'}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-gray-800 rounded-xl p-5 mb-6 shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Template Name *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent" placeholder="e.g. Weekly Report" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Task Title</label>
              <input value={form.taskTitle} onChange={e => setForm({ ...form, taskTitle: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent" placeholder="Task title when spawned" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Description</label>
              <textarea value={form.taskDescription} onChange={e => setForm({ ...form, taskDescription: e.target.value })} rows={2}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Priority</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Stage</label>
              <select value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
                <option value="todo">To Do</option><option value="in_progress">In Progress</option><option value="review">Review</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Category</label>
              <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent" placeholder="reporting, standup, etc." />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Due in (days)</label>
              <input type="number" min={1} value={form.relativeDueDays} onChange={e => setForm({ ...form, relativeDueDays: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Subtasks (one per line)</label>
              <textarea value={form.subtasks} onChange={e => setForm({ ...form, subtasks: e.target.value })} rows={3}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                placeholder={"Gather metrics\nDraft summary\nReview & send"} />
            </div>
          </div>
          <button type="submit" disabled={creating}
            className="px-5 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 text-sm font-medium">
            {creating ? 'Creating...' : 'Create Template'}
          </button>
        </form>
      )}

      {/* Category filter */}
      {categories.length > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          <button onClick={() => setCategoryFilter('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!categoryFilter ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200'}`}>
            All
          </button>
          {categories.map(c => (
            <button key={c} onClick={() => setCategoryFilter(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${categoryFilter === c ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200'}`}>
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Templates List */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">
          <FaClone className="mx-auto text-4xl mb-3 opacity-30" />
          <p className="font-medium">No templates yet</p>
          <p className="text-sm mt-1">Create reusable task blueprints to save time</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {templates.map((t) => (
            <div key={t._id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-600 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm">{t.name}</h3>
                    {t.category && <span className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-500 dark:text-gray-400 capitalize">{t.category}</span>}
                  </div>
                  {t.taskDescription && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{t.taskDescription}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    <span className={`px-2 py-0.5 rounded font-medium ${priorityBadge[t.priority] || priorityBadge.normal}`}>{t.priority}</span>
                    <span className="text-gray-500 dark:text-gray-400">{t.stage}</span>
                    {t.subtasks?.length > 0 && (
                      <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                        <FaListUl className="text-[10px]" /> {t.subtasks.length} subtasks
                      </span>
                    )}
                    <span className="text-gray-400">{t.relativeDueDays}d due</span>
                    <span className="text-gray-400">Used {t.usageCount || 0}x</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => handleSpawnTask(t._id)} disabled={spawning}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 text-xs font-medium transition-colors disabled:opacity-50"
                    title="Create task from this template">
                    <FaPlay className="text-[10px]" /> Use
                  </button>
                  <button onClick={() => handleDelete(t._id)}
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

export default TemplatesPage;
