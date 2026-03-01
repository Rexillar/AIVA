import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useWorkspace } from '../components/workspace/provider/WorkspaceProvider';
import {
  useGetSourcesQuery,
  useCreateSourceMutation,
  useDeleteSourceMutation,
} from '../redux/slices/api/sourceApiSlice';
import {
  FaPlus, FaBook, FaLink, FaSearch, FaTimes,
  FaStar, FaExternalLinkAlt, FaTrash, FaGraduationCap,
  FaGlobe, FaFileAlt, FaVideo as FaFilm,
} from 'react-icons/fa';
import { toast } from 'sonner';

const typeIcons = {
  website: FaGlobe,
  academic_paper: FaGraduationCap,
  book: FaBook,
  article: FaFileAlt,
  video: FaFilm,
};

const credibilityColor = (score) => {
  if (score >= 8) return 'text-green-500';
  if (score >= 5) return 'text-yellow-500';
  return 'text-red-400';
};

const SourcesPage = () => {
  const { workspaceId } = useParams();
  const { workspace } = useWorkspace();
  const wId = workspaceId || workspace?._id;

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', url: '', type: 'website', authors: '', doi: '', publicationDate: '',
  });

  const { data: sourcesData, isLoading } = useGetSourcesQuery(
    { workspaceId: wId, search, type: typeFilter || undefined },
    { skip: !wId }
  );
  const sources = sourcesData?.sources || sourcesData || [];

  const [createSource, { isLoading: creating }] = useCreateSourceMutation();
  const [deleteSource] = useDeleteSourceMutation();

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createSource({
        workspace: wId,
        title: form.title,
        url: form.url || undefined,
        type: form.type,
        authors: form.authors ? form.authors.split(',').map(a => a.trim()) : [],
        doi: form.doi || undefined,
        publicationDate: form.publicationDate || undefined,
      }).unwrap();
      setShowForm(false);
      setForm({ title: '', url: '', type: 'website', authors: '', doi: '', publicationDate: '' });
      toast.success('Source added');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create source');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this source?')) return;
    try {
      await deleteSource(id).unwrap();
      toast.success('Source deleted');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FaBook className="text-indigo-500" /> Research Sources
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage citations, track credibility, and link to notes
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          {showForm ? <FaTimes /> : <FaPlus />}
          {showForm ? 'Cancel' : 'Add Source'}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-gray-800 rounded-xl p-5 mb-6 shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Title *</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="Source title" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
                <option value="website">Website</option>
                <option value="academic_paper">Academic Paper</option>
                <option value="book">Book</option>
                <option value="article">Article</option>
                <option value="video">Video</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">URL</label>
              <input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">DOI</label>
              <input value={form.doi} onChange={e => setForm({ ...form, doi: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="10.xxxx/..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Authors (comma-separated)</label>
              <input value={form.authors} onChange={e => setForm({ ...form, authors: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="Author 1, Author 2" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Publication Date</label>
              <input type="date" value={form.publicationDate} onChange={e => setForm({ ...form, publicationDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
            </div>
          </div>
          <button type="submit" disabled={creating}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium">
            {creating ? 'Adding...' : 'Add Source'}
          </button>
        </form>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search sources..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
          <option value="">All Types</option>
          <option value="website">Website</option>
          <option value="academic_paper">Academic Paper</option>
          <option value="book">Book</option>
          <option value="article">Article</option>
          <option value="video">Video</option>
        </select>
      </div>

      {/* Source List */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : sources.length === 0 ? (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">
          <FaBook className="mx-auto text-4xl mb-3 opacity-30" />
          <p className="font-medium">No sources yet</p>
          <p className="text-sm mt-1">Add your first research source to get started</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {sources.map((s) => {
            const Icon = typeIcons[s.type] || FaFileAlt;
            return (
              <div key={s._id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5 p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30">
                      <Icon className="text-indigo-500 text-sm" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">{s.title}</h3>
                      {s.authors?.length > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.authors.join(', ')}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="capitalize px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">{s.type?.replace('_', ' ')}</span>
                        {s.doi && <span className="flex items-center gap-1"><FaLink className="text-[10px]" /> {s.doi}</span>}
                        {typeof s.credibilityScore === 'number' && (
                          <span className={`flex items-center gap-1 font-semibold ${credibilityColor(s.credibilityScore)}`}>
                            <FaStar className="text-[10px]" /> {s.credibilityScore}/10
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {s.url && (
                      <a href={s.url} target="_blank" rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-indigo-500 transition-colors">
                        <FaExternalLinkAlt className="text-xs" />
                      </a>
                    )}
                    <button onClick={() => handleDelete(s._id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                      <FaTrash className="text-xs" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SourcesPage;
