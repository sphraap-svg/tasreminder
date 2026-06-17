import React, { useState, useEffect } from 'react';
import { Task, TaskFormData, TaskPriority, RecurrenceType } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { today } from '../../utils/date';
import { RECURRENCE_LABELS } from '../../utils/recurrence';

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => void;
  initialData?: Task | null;
  defaultDate?: string;
}

const PRIORITY_OPTIONS: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'low', label: 'عادی', color: 'border-green-400 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' },
  { value: 'medium', label: 'متوسط', color: 'border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' },
  { value: 'high', label: 'فوری', color: 'border-red-400 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' },
];

const RECURRENCE_OPTIONS: { value: RecurrenceType; label: string }[] = Object.entries(
  RECURRENCE_LABELS
).map(([value, label]) => ({ value: value as RecurrenceType, label }));

const FIELD =
  'w-full px-3 py-2.5 text-sm rounded-xl glass-surface text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-shadow';

function emptyForm(defaultDate: string): TaskFormData {
  return {
    title: '',
    description: '',
    date: defaultDate,
    time: '',
    priority: 'medium',
    category: '',
    tags: [],
    completed: false,
    archived: false,
    recurrence: 'none',
    reminderEnabled: false,
  };
}

export function TaskForm({ open, onClose, onSubmit, initialData, defaultDate }: TaskFormProps) {
  const baseDate = defaultDate ?? today();
  const [form, setForm] = useState<TaskFormData>(emptyForm(baseDate));
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<{ title?: string }>({});

  // Sync form when modal opens
  useEffect(() => {
    if (!open) return;
    if (initialData) {
      setForm({
        title: initialData.title,
        description: initialData.description ?? '',
        date: initialData.date,
        time: initialData.time ?? '',
        priority: initialData.priority,
        category: initialData.category ?? '',
        tags: initialData.tags,
        completed: initialData.completed,
        archived: initialData.archived,
        recurrence: initialData.recurrence,
        reminderEnabled: initialData.reminderEnabled,
      });
      setTagInput(initialData.tags.join('، '));
    } else {
      setForm(emptyForm(baseDate));
      setTagInput('');
    }
    setErrors({});
  }, [open, initialData, baseDate]);

  // When time is set, auto-enable reminder
  useEffect(() => {
    if (form.time) {
      setForm(f => ({ ...f, reminderEnabled: true }));
    }
  }, [form.time]);

  function set<K extends keyof TaskFormData>(key: K, value: TaskFormData[K]) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setErrors({ title: 'عنوان وظیفه الزامی است' });
      return;
    }
    const tags = tagInput
      .split(/[،,]+/)
      .map(t => t.trim())
      .filter(Boolean);

    onSubmit({
      ...form,
      title: form.title.trim(),
      description: form.description?.trim() || undefined,
      time: form.time || undefined,
      category: form.category?.trim() || undefined,
      tags,
      reminderEnabled: form.time ? form.reminderEnabled : false,
    });
    onClose();
  }

  const isEdit = Boolean(initialData);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'ویرایش وظیفه' : 'وظیفه جدید'}
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            عنوان <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={e => { set('title', e.target.value); setErrors({}); }}
            placeholder="چه کاری باید انجام بدی؟"
            className={FIELD}
            autoFocus
          />
          {errors.title && (
            <p className="mt-1 text-xs text-red-500">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            توضیحات
          </label>
          <textarea
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="جزئیات بیشتر (اختیاری)"
            rows={2}
            className={`${FIELD} resize-none`}
          />
        </div>

        {/* Date + Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              تاریخ
            </label>
            <input
              type="date"
              value={form.date}
              onChange={e => set('date', e.target.value)}
              className={FIELD}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              ساعت
            </label>
            <input
              type="time"
              value={form.time}
              onChange={e => set('time', e.target.value)}
              className={FIELD}
            />
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            اولویت
          </label>
          <div className="grid grid-cols-3 gap-2">
            {PRIORITY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => set('priority', opt.value)}
                className={`
                  py-2 text-xs font-medium rounded-xl border-2 transition-colors
                  ${form.priority === opt.value ? opt.color : 'border-gray-200 bg-white text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400'}
                `}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category + Tags */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              دسته‌بندی
            </label>
            <input
              type="text"
              value={form.category}
              onChange={e => set('category', e.target.value)}
              placeholder="مثلاً: کاری، خانه"
              className={FIELD}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              برچسب‌ها
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              placeholder="با کاما جدا کن"
              className={FIELD}
            />
          </div>
        </div>

        {/* Recurrence */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            تکرار
          </label>
          <select
            value={form.recurrence}
            onChange={e => set('recurrence', e.target.value as RecurrenceType)}
            className={FIELD}
          >
            {RECURRENCE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Reminder toggle (only when time is set) */}
        {form.time && (
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <button
              type="button"
              role="switch"
              aria-checked={form.reminderEnabled}
              onClick={() => set('reminderEnabled', !form.reminderEnabled)}
              className={`
                relative flex-shrink-0 w-10 h-6 rounded-full transition-colors duration-200
                ${form.reminderEnabled ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'}
              `}
            >
              <span
                className={`
                  absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200
                  ${form.reminderEnabled ? 'translate-x-[1.25rem]' : 'translate-x-1'}
                `}
              />
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              یادآوری فعال شود
            </span>
          </label>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            انصراف
          </Button>
          <Button type="submit" variant="primary" className="flex-1">
            {isEdit ? 'ذخیره تغییرات' : 'افزودن وظیفه'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
