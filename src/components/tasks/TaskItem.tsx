import React, { useState } from 'react';
import { Task } from '../../types';
import { useTasks } from '../../context/TaskContext';
import { useToast } from '../../context/ToastContext';
import { PriorityBadge, CategoryBadge, TagBadge } from '../ui/Badge';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { TaskForm } from './TaskForm';
import { formatTimeFa } from '../../utils/date';
import { RECURRENCE_LABELS } from '../../utils/recurrence';

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const { completeTask, deleteTask, updateTask } = useTasks();
  const { addToast } = useToast();
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  function handleComplete() {
    completeTask(task.id);
    addToast(
      task.recurrence !== 'none'
        ? 'انجام شد. نسخه بعدی ایجاد شد ✓'
        : 'وظیفه انجام شد ✓',
      'success'
    );
  }

  function handleDelete() {
    setShowDelete(false);
    setIsLeaving(true);
    setTimeout(() => {
      deleteTask(task.id);
      addToast('وظیفه حذف شد', 'info');
    }, 210);
  }

  function handleEdit(data: Task) {
    updateTask({ ...task, ...data, id: task.id, createdAt: task.createdAt });
    addToast('وظیفه ویرایش شد ✓', 'success');
  }

  const itemClass = [
    'task-item',
    task.completed ? 'task-item--done' : '',
    isLeaving ? 'leaving' : '',
    'group relative flex items-start gap-3 p-4 rounded-2xl transition-colors duration-200',
    task.completed ? 'opacity-60' : '',
  ].filter(Boolean).join(' ');

  return (
    <>
      <div className={itemClass}>
        {/* Completion checkbox */}
        <button
          onClick={handleComplete}
          aria-label="علامت انجام"
          className={`
            flex-shrink-0 mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
            ${task.completed
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
            }
          `}
        >
          {task.completed && (
            <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
              <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p
            className={`
              text-sm font-medium leading-snug
              ${task.completed
                ? 'line-through text-gray-400 dark:text-gray-500'
                : 'text-gray-900 dark:text-gray-100'
              }
            `}
          >
            {task.title}
          </p>

          {task.description && (
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
              {task.description}
            </p>
          )}

          {/* Meta row */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {task.time && (
              <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                </svg>
                {formatTimeFa(task.time)}
              </span>
            )}
            <PriorityBadge priority={task.priority} />
            {task.category && <CategoryBadge label={task.category} />}
            {task.tags.slice(0, 2).map(tag => (
              <TagBadge key={tag} label={tag} />
            ))}
            {task.recurrence !== 'none' && (
              <span className="text-xs text-indigo-500 dark:text-indigo-400">
                🔁 {RECURRENCE_LABELS[task.recurrence]}
              </span>
            )}
            {task.reminderEnabled && task.time && !task.reminderSentAt && (
              <span className="text-xs text-amber-500">🔔</span>
            )}
          </div>
        </div>

        {/* Actions — appear on hover/focus */}
        <div className="flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setShowEdit(true)}
            aria-label="ویرایش"
            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-white/60 dark:hover:bg-blue-900/20 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => setShowDelete(true)}
            aria-label="حذف"
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Edit modal */}
      <TaskForm
        open={showEdit}
        onClose={() => setShowEdit(false)}
        onSubmit={data => handleEdit({ ...task, ...data, id: task.id, createdAt: task.createdAt, completedAt: task.completedAt, reminderSentAt: task.reminderSentAt })}
        initialData={task}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        open={showDelete}
        title="حذف وظیفه"
        message={`آیا می‌خواهی وظیفه «${task.title}» را حذف کنی؟ این عمل قابل بازگشت نیست.`}
        confirmLabel="حذف"
        danger
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </>
  );
}
