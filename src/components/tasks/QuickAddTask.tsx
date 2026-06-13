import React, { useState, useRef } from 'react';
import { useTasks } from '../../context/TaskContext';
import { useToast } from '../../context/ToastContext';
import { TaskForm } from './TaskForm';
import { today } from '../../utils/date';

export function QuickAddTask() {
  const { addTask } = useTasks();
  const { addToast } = useToast();
  const [title, setTitle] = useState('');
  const [showForm, setShowForm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleQuickAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    addTask({
      title: trimmed,
      date: today(),
      priority: 'medium',
      tags: [],
      completed: false,
      archived: false,
      recurrence: 'none',
      reminderEnabled: false,
    });

    setTitle('');
    addToast('وظیفه با موفقیت اضافه شد ✓', 'success');
    inputRef.current?.focus();
  }

  return (
    <>
      <form
        onSubmit={handleQuickAdd}
        className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-card"
      >
        {/* Quick-add pencil icon */}
        <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </span>

        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="وظیفه جدید را اینجا بنویس و Enter بزن…"
          className="
            flex-1 text-sm bg-transparent text-gray-900 dark:text-gray-100
            placeholder-gray-400 dark:placeholder-gray-500
            outline-none
          "
        />

        {/* Submit (hidden, triggered via Enter) */}
        {title.trim() && (
          <button
            type="submit"
            className="flex-shrink-0 px-3 py-1.5 text-xs font-medium bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            افزودن
          </button>
        )}

        {/* Full form button */}
        <button
          type="button"
          onClick={() => setShowForm(true)}
          title="فرم کامل"
          className="flex-shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </button>
      </form>

      <TaskForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={data => {
          addTask(data);
          addToast('وظیفه با موفقیت اضافه شد ✓', 'success');
        }}
      />
    </>
  );
}
