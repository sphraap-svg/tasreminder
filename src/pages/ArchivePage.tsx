import React, { useState } from 'react';
import { Task } from '../types';
import { useTasks } from '../context/TaskContext';
import { useToast } from '../context/ToastContext';
import { Header } from '../components/layout/Header';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { SearchBar } from '../components/filters/SearchBar';
import { PriorityBadge, CategoryBadge } from '../components/ui/Badge';
import { formatDateFa, formatTimeFa } from '../utils/date';

function ArchiveIcon() {
  return (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
  );
}

interface ArchiveItemProps {
  task: Task;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
}

function ArchiveItem({ task, onRestore, onDelete }: ArchiveItemProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <>
      <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 group">
        {/* Checkmark */}
        <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-500">
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
            <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 line-through">
            {task.title}
          </p>
          {task.description && (
            <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500 line-clamp-1">
              {task.description}
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-1.5 items-center">
            <span className="text-xs text-gray-400">
              {formatDateFa(task.date)}
              {task.time && ` · ${formatTimeFa(task.time)}`}
            </span>
            <PriorityBadge priority={task.priority} />
            {task.category && <CategoryBadge label={task.category} />}
            {task.completedAt && (
              <span className="text-xs text-gray-400">
                ✓ {new Intl.DateTimeFormat('fa-IR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(task.completedAt))}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onRestore(task.id)}
            title="بازگرداندن"
            className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            title="حذف دائمی"
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="حذف دائمی"
        message={`وظیفه «${task.title}» برای همیشه حذف شود؟`}
        confirmLabel="حذف دائمی"
        danger
        onConfirm={() => {
          onDelete(task.id);
          setShowDeleteConfirm(false);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}

export function ArchivePage() {
  const { archivedTasks, restoreTask, deletePermanently } = useTasks();
  const { addToast } = useToast();
  const [search, setSearch] = useState('');

  function handleRestore(id: string) {
    restoreTask(id);
    addToast('وظیفه بازگردانده شد', 'success');
  }

  function handleDelete(id: string) {
    deletePermanently(id);
    addToast('وظیفه حذف شد', 'info');
  }

  const filtered = archivedTasks.filter(t => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      t.category?.toLowerCase().includes(q)
    );
  });

  // Sort archived: most recently completed first
  const sorted = [...filtered].sort((a, b) => {
    const ta = a.completedAt ?? a.updatedAt;
    const tb = b.completedAt ?? b.updatedAt;
    return tb.localeCompare(ta);
  });

  return (
    <div className="flex flex-col gap-4">
      <Header
        title="آرشیو"
        subtitle={archivedTasks.length > 0 ? `${archivedTasks.length} وظیفه تکمیل‌شده` : undefined}
      />

      {archivedTasks.length > 0 && (
        <SearchBar value={search} onChange={setSearch} placeholder="جستجو در آرشیو…" />
      )}

      {sorted.length === 0 ? (
        <EmptyState
          icon={<ArchiveIcon />}
          title={search ? 'چیزی پیدا نشد' : 'آرشیو هنوز خالی است'}
          description={
            search
              ? 'جستجوی دیگری امتحان کن'
              : 'وظایف تکمیل‌شده اینجا نمایش داده می‌شوند'
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          {sorted.map(task => (
            <ArchiveItem
              key={task.id}
              task={task}
              onRestore={handleRestore}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
