import React, { useState, FormEvent } from 'react';
import { WorkspaceMember } from '../../types/workspace';
import { useWorkspace } from '../../context/WorkspaceContext';

interface Props {
  members: WorkspaceMember[];
  onClose: () => void;
}

export function CreateWorkspaceTaskModal({ members, onClose }: Props) {
  const { createTask } = useWorkspace();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'team' | 'personal'>('team');
  const [assignedTo, setAssignedTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setError(null);
    setLoading(true);

    const err = await createTask({
      title: title.trim(),
      description: description.trim() || undefined,
      type,
      assigned_to: type === 'personal' && assignedTo ? assignedTo : undefined,
    });

    setLoading(false);
    if (err) {
      setError(err);
    } else {
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Sheet */}
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">وظیفه جدید</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          {/* Task type tabs */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">نوع وظیفه</label>
            <div className="flex gap-2">
              {(['team', 'personal'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setType(t); if (t === 'team') setAssignedTo(''); }}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${
                    type === t
                      ? t === 'team'
                        ? 'bg-indigo-500 border-indigo-500 text-white'
                        : 'bg-pink-500 border-pink-500 text-white'
                      : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300'
                  }`}
                >
                  {t === 'team' ? '🌐 تیمی' : '👤 شخصی'}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">عنوان *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              placeholder="عنوان وظیفه..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:border-indigo-400 focus:bg-white dark:focus:bg-gray-700 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">توضیحات</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              placeholder="توضیحات اختیاری..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:border-indigo-400 focus:bg-white dark:focus:bg-gray-700 transition-all resize-none"
            />
          </div>

          {/* Assign to (personal only) */}
          {type === 'personal' && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">تخصیص به</label>
              <select
                value={assignedTo}
                onChange={e => setAssignedTo(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:border-indigo-400 transition-all appearance-none"
              >
                <option value="">انتخاب کنید...</option>
                {members.map(m => (
                  <option key={m.user_id} value={m.user_id}>
                    {m.display_name} {m.role === 'manager' ? '(مدیر)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              لغو
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="flex-1 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold transition-all duration-200 active:scale-95 shadow-sm"
            >
              {loading ? '...' : 'ایجاد'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
