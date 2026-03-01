import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useWorkspace } from '../components/workspace/provider/WorkspaceProvider';
import {
  useGetKnowledgeIndexQuery,
  useLazySearchKnowledgeQuery,
  useLazyExportKnowledgeBaseQuery,
  useGetDecisionLogsQuery,
  useCreateDecisionLogMutation,
  useDeleteDecisionLogMutation,
} from '../redux/slices/api/knowledgeApiSlice';
import {
  FaLightbulb, FaPlus, FaTimes, FaTrash, FaSearch, FaDownload,
  FaBook, FaTasks, FaStickyNote, FaHistory, FaBrain, FaChevronDown, FaChevronUp,
  FaUsers, FaHeartbeat, FaTag, FaKey, FaExclamationCircle, FaStar, FaRegCalendarAlt,
} from 'react-icons/fa';
import { toast } from 'sonner';

const KnowledgePage = () => {
  const { workspaceId } = useParams();
  const { workspace } = useWorkspace();
  const wId = workspaceId || workspace?._id;

  const [tab, setTab] = useState('index');
  const [showDecisionForm, setShowDecisionForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const [form, setForm] = useState({
    title: '', type: 'decision', context: '', decision: '',
    reasoning: '', outcome: '', lessonsLearned: '', tags: '',
  });

  const { data: indexData, isLoading: indexLoading } = useGetKnowledgeIndexQuery(wId, { skip: !wId || tab !== 'index' });
  const { data: decisions = [], isLoading: decisionsLoading } = useGetDecisionLogsQuery(wId, { skip: !wId || tab !== 'decisions' });
  const [triggerSearch, { data: searchResults, isLoading: searching }] = useLazySearchKnowledgeQuery();
  const [triggerExport, { isLoading: exporting }] = useLazyExportKnowledgeBaseQuery();
  const [createDecision, { isLoading: creating }] = useCreateDecisionLogMutation();
  const [deleteDecision] = useDeleteDecisionLogMutation();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim() || !wId) return;
    triggerSearch({ workspaceId: wId, q: searchQuery.trim() });
  };

  const handleExport = async (format) => {
    try {
      const data = await triggerExport({ workspaceId: wId, format }).unwrap();
      const blob = new Blob([format === 'json' ? JSON.stringify(data, null, 2) : data], {
        type: format === 'json' ? 'application/json' : 'text/markdown',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `knowledge-base.${format === 'json' ? 'json' : 'md'}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Export downloaded');
    } catch { toast.error('Export failed'); }
  };

  const handleCreateDecision = async (e) => {
    e.preventDefault();
    try {
      const body = {
        title: form.title, type: form.type, context: form.context,
        decision: form.decision, reasoning: form.reasoning,
        outcome: form.outcome, lessonsLearned: form.lessonsLearned,
        workspace: wId,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };
      await createDecision(body).unwrap();
      setShowDecisionForm(false);
      setForm({ title: '', type: 'decision', context: '', decision: '', reasoning: '', outcome: '', lessonsLearned: '', tags: '' });
      toast.success('Decision log created');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create decision log');
    }
  };

  const handleDeleteDecision = async (id) => {
    if (!window.confirm('Delete this decision log?')) return;
    try {
      await deleteDecision(id).unwrap();
      toast.success('Deleted');
    } catch { toast.error('Failed to delete'); }
  };

  // Workspace type detection
  const isPublic = workspace?.type === 'PublicWorkspace' || workspace?.visibility === 'public';

  // Extract data from actual server response shape
  const summary = indexData?.summary || {};
  const healthScore = summary.healthScore ?? 0;
  const healthColor = healthScore >= 70 ? 'green' : healthScore >= 40 ? 'yellow' : 'red';

  const typeColor = { decision: 'blue', retrospective: 'purple', learning: 'green' };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FaLightbulb className="text-yellow-500" /> Knowledge Hub
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Workspace intelligence — browse, search, log decisions, and export
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => handleExport('json')} disabled={exporting}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 transition-colors">
            <FaDownload /> JSON
          </button>
          <button onClick={() => handleExport('markdown')} disabled={exporting}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 transition-colors">
            <FaDownload /> Markdown
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
        {[
          { key: 'index', label: 'Knowledge Index', icon: FaBrain },
          { key: 'decisions', label: 'Decision Logs', icon: FaHistory },
          { key: 'search', label: 'Search', icon: FaSearch },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${tab === t.key ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>
            <t.icon className="text-[11px]" /> {t.label}
          </button>
        ))}
      </div>

      {/* ═══════════ KNOWLEDGE INDEX TAB ═══════════ */}
      {tab === 'index' && (
        <div>
          {indexLoading ? (
            <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500" /></div>
          ) : !indexData ? (
            <div className="text-center py-16 text-gray-500 dark:text-gray-400">
              <FaBrain className="mx-auto text-4xl mb-3 opacity-20" />
              <p className="font-medium">No knowledge data available</p>
              <p className="text-xs mt-1">Create notes, tasks, sources, and decisions to build your knowledge base</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Health Score + Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {/* Health Score Card */}
                <div className="col-span-2 sm:col-span-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex flex-col items-center justify-center">
                  <div className={`relative w-16 h-16 mb-2`}>
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-200 dark:text-gray-700" />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none" strokeWidth="3" strokeDasharray={`${healthScore}, 100`}
                        className={healthScore >= 70 ? 'stroke-green-500' : healthScore >= 40 ? 'stroke-yellow-500' : 'stroke-red-500'} strokeLinecap="round" />
                    </svg>
                    <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${healthScore >= 70 ? 'text-green-600' : healthScore >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {healthScore}
                    </span>
                  </div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Health</p>
                </div>

                {/* Stat Cards */}
                {[
                  { label: 'Tasks', value: summary.totalTasks ?? 0, icon: FaTasks, gradient: 'from-blue-500 to-blue-600' },
                  { label: 'Notes', value: summary.totalNotes ?? 0, icon: FaStickyNote, gradient: 'from-emerald-500 to-emerald-600' },
                  { label: 'Sources', value: summary.totalSources ?? 0, icon: FaBook, gradient: 'from-purple-500 to-purple-600' },
                  { label: 'Decisions', value: summary.totalDecisions ?? 0, icon: FaHistory, gradient: 'from-orange-500 to-orange-600' },
                  ...(isPublic ? [{ label: 'Contributors', value: summary.uniqueContributors ?? 0, icon: FaUsers, gradient: 'from-pink-500 to-pink-600' }] : []),
                ].map(s => (
                  <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 relative overflow-hidden">
                    <div className={`absolute top-0 right-0 w-12 h-12 bg-gradient-to-br ${s.gradient} opacity-10 rounded-bl-3xl`} />
                    <s.icon className={`text-lg bg-gradient-to-br ${s.gradient} text-transparent bg-clip-text mb-2`}
                      style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Activity Banner */}
              {indexData.activity && (
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/10 dark:to-amber-900/10 border border-yellow-200 dark:border-yellow-800/40 rounded-xl p-4 flex flex-wrap items-center gap-4 text-sm">
                  <span className="flex items-center gap-1.5 text-yellow-700 dark:text-yellow-300 font-medium">
                    <FaRegCalendarAlt className="text-xs" /> Activity (last 30 days)
                  </span>
                  <span className="text-yellow-600 dark:text-yellow-400">
                    <strong>{indexData.activity.notesLastMonth ?? 0}</strong> notes created
                  </span>
                  {indexData.activity.lastUpdated && (
                    <span className="text-yellow-600/70 dark:text-yellow-400/70 text-xs">
                      Last update: {new Date(indexData.activity.lastUpdated).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}

              {/* Two-Column: Topics + Keywords */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Top Topics */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <FaTag className="text-yellow-500 text-xs" /> Top Topics
                  </h3>
                  {indexData.topTopics?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {indexData.topTopics.map((t, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 text-xs rounded-full font-medium border border-yellow-200 dark:border-yellow-800/40">
                          {t.topic || t.name || t} <span className="text-yellow-500/60">{t.count ? `(${t.count})` : ''}</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">No topics found — add tags to your notes</p>
                  )}
                </div>

                {/* Top Keywords */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <FaKey className="text-indigo-500 text-xs" /> Top Keywords
                  </h3>
                  {indexData.topKeywords?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {indexData.topKeywords.map((k, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-xs rounded-full font-medium border border-indigo-200 dark:border-indigo-800/40">
                          {k.keyword || k} <span className="text-indigo-500/60">{k.count ? `(${k.count})` : ''}</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">No keywords yet — keywords are extracted from AI analysis</p>
                  )}
                </div>
              </div>

              {/* Three-Column: Sources, Contributors, Gaps */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Sources by Type */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <FaBook className="text-purple-500 text-xs" /> Sources by Type
                  </h3>
                  {indexData.sourcesByType && Object.keys(indexData.sourcesByType).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(indexData.sourcesByType).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">{type}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min(100, (count / Math.max(1, summary.totalSources)) * 100)}%` }} />
                            </div>
                            <span className="text-xs font-medium text-gray-900 dark:text-white w-5 text-right">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">No sources added yet</p>
                  )}
                </div>

                {/* Top Contributors (public workspaces only) */}
                {isPublic ? (
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <FaUsers className="text-pink-500 text-xs" /> Top Contributors
                    </h3>
                    {indexData.topContributors?.length > 0 ? (
                      <div className="space-y-2.5">
                        {indexData.topContributors.map((c, i) => (
                          <div key={i} className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                              {(c.name || '?').charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{c.name}</p>
                              <p className="text-[10px] text-gray-500">{c.notes} note{c.notes !== 1 ? 's' : ''} {c.recentActivity && <span className="text-green-500">● active</span>}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">No contributors yet</p>
                    )}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <FaTag className="text-teal-500 text-xs" /> Knowledge Categories
                    </h3>
                    {indexData.knowledgeCategories?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {indexData.knowledgeCategories.map((cat, i) => (
                          <span key={i} className="px-2.5 py-1 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 text-xs rounded-full font-medium border border-teal-200 dark:border-teal-800/40">
                            {typeof cat === 'string' ? cat : cat.name || cat.category}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">No categories — add tags to organize</p>
                    )}
                  </div>
                )}

                {/* Knowledge Gaps */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <FaExclamationCircle className="text-red-400 text-xs" /> Knowledge Gaps
                  </h3>
                  {indexData.knowledgeGaps?.length > 0 ? (
                    <div className="space-y-1.5">
                      {indexData.knowledgeGaps.map((gap, i) => (
                        <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 bg-red-50 dark:bg-red-900/10 rounded-lg">
                          <span className="w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0" />
                          <span className="text-xs text-red-700 dark:text-red-400 capitalize">{gap}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                      <FaStar className="text-green-500" /> No major gaps — great coverage!
                    </div>
                  )}
                </div>
              </div>

              {/* Recommendations */}
              {indexData.recommendations?.length > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-800/40 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <FaLightbulb className="text-blue-500" /> Recommendations
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {indexData.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-blue-700 dark:text-blue-300">
                        <span className="mt-0.5 text-blue-400">→</span>
                        <span>{typeof rec === 'string' ? rec : rec.message || rec.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══════════ DECISION LOGS TAB ═══════════ */}
      {tab === 'decisions' && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowDecisionForm(!showDecisionForm)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium transition-colors">
              {showDecisionForm ? <FaTimes /> : <FaPlus />} {showDecisionForm ? 'Cancel' : 'New Decision Log'}
            </button>
          </div>

          {showDecisionForm && (
            <form onSubmit={handleCreateDecision} className="bg-white dark:bg-gray-800 rounded-xl p-5 mb-6 shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Title *</label>
                  <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
                    <option value="decision">Decision</option>
                    <option value="retrospective">Retrospective</option>
                    <option value="learning">Learning</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Tags (comma-separated)</label>
                  <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent" placeholder="e.g. architecture, performance" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Context</label>
                  <textarea value={form.context} onChange={e => setForm({ ...form, context: e.target.value })} rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent" placeholder="What situation led to this?" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Decision</label>
                  <textarea value={form.decision} onChange={e => setForm({ ...form, decision: e.target.value })} rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent" placeholder="What was decided?" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Reasoning</label>
                  <textarea value={form.reasoning} onChange={e => setForm({ ...form, reasoning: e.target.value })} rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Outcome</label>
                  <textarea value={form.outcome} onChange={e => setForm({ ...form, outcome: e.target.value })} rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Lessons Learned</label>
                  <textarea value={form.lessonsLearned} onChange={e => setForm({ ...form, lessonsLearned: e.target.value })} rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent" />
                </div>
              </div>
              <button type="submit" disabled={creating}
                className="px-5 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 text-sm font-medium">
                {creating ? 'Creating...' : 'Save Decision Log'}
              </button>
            </form>
          )}

          {decisionsLoading ? (
            <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500" /></div>
          ) : decisions.length === 0 ? (
            <div className="text-center py-16 text-gray-500 dark:text-gray-400">
              <FaHistory className="mx-auto text-3xl mb-2 opacity-30" />
              <p className="text-sm font-medium">No decision logs yet</p>
              <p className="text-xs mt-1">Document decisions, retrospectives, and learnings</p>
            </div>
          ) : (
            <div className="space-y-3">
              {decisions.map(d => {
                const color = typeColor[d.type] || 'gray';
                const isExpanded = expandedId === d._id;
                return (
                  <div key={d._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 flex items-start justify-between gap-3 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : d._id)}>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize
                            ${color === 'blue' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : ''}
                            ${color === 'purple' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : ''}
                            ${color === 'green' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : ''}
                            ${color === 'gray' ? 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300' : ''}
                          `}>{d.type}</span>
                          <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">{d.title}</h3>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                          <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                          {d.tags?.length > 0 && d.tags.map((t, i) => (
                            <span key={i} className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">{t}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteDecision(d._id); }}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                          <FaTrash className="text-xs" />
                        </button>
                        {isExpanded ? <FaChevronUp className="text-xs text-gray-400" /> : <FaChevronDown className="text-xs text-gray-400" />}
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-3 space-y-3 text-sm text-gray-700 dark:text-gray-300">
                        {d.context && <div><span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Context</span><p className="mt-1">{d.context}</p></div>}
                        {d.decision && <div><span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Decision</span><p className="mt-1">{d.decision}</p></div>}
                        {d.reasoning && <div><span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Reasoning</span><p className="mt-1">{d.reasoning}</p></div>}
                        {d.outcome && <div><span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Outcome</span><p className="mt-1">{d.outcome}</p></div>}
                        {d.lessonsLearned && <div><span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Lessons Learned</span><p className="mt-1">{d.lessonsLearned}</p></div>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══════════ SEARCH TAB ═══════════ */}
      {tab === 'search' && (
        <div>
          <form onSubmit={handleSearch} className="flex items-center gap-2 mb-6">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search across all knowledge..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent" />
            </div>
            <button type="submit" disabled={searching}
              className="px-5 py-2.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 text-sm font-medium transition-colors">
              {searching ? 'Searching...' : 'Search'}
            </button>
          </form>

          {searching ? (
            <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500" /></div>
          ) : searchResults ? (
            Array.isArray(searchResults) && searchResults.length > 0 ? (
              <div className="space-y-3">
                {searchResults.map((r, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{r.type || 'result'}</span>
                      {r.score != null && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${r.score > 0.7 ? 'bg-green-100 text-green-700' : r.score > 0.4 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                          {(r.score * 100).toFixed(0)}% match
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">{r.title || r.name || 'Untitled'}</h3>
                    {(r.snippet || r.content) && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{r.snippet || r.content}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-16 text-sm">No results found for &quot;{searchQuery}&quot;</p>
            )
          ) : (
            <div className="text-center py-16 text-gray-500 dark:text-gray-400">
              <FaSearch className="mx-auto text-3xl mb-2 opacity-30" />
              <p className="text-sm">Search across tasks, notes, sources, and decisions</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KnowledgePage;
