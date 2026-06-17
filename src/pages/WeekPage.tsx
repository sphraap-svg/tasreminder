import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { Header } from '../components/layout/Header';
import { TaskItem } from '../components/tasks/TaskItem';
import { Button } from '../components/ui/Button';
import { TaskForm } from '../components/tasks/TaskForm';
import { EmptyState } from '../components/ui/EmptyState';
import { useToast } from '../context/ToastContext';
import {
  getWeekDays,
  getWeekLabel,
  formatWeekdayFa,
  formatShortDateFa,
  isToday,
} from '../utils/date';

function CalIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

export function WeekPage() {
  const { activeTasks, addTask } = useTasks();
  const { addToast } = useToast();
  const [weekOffset, setWeekOffset] = useState(0);
  const [addForDate, setAddForDate] = useState<string | null>(null);
  const days = getWeekDays(weekOffset);

  const tasksByDay: Record<string, typeof activeTasks> = {};
  days.forEach(d => {
    tasksByDay[d] = activeTasks.filter(t => t.date === d);
  });

  const totalWeekTasks = Object.values(tasksByDay).flat().length;

  return (
    <div className="flex flex-col gap-4">
      {/* Header with week navigation */}
      <Header
        title="نمای هفتگی"
        action={
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setWeekOffset(o => o - 1)}
              aria-label="هفته قبل"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Button>
            {weekOffset !== 0 && (
              <Button variant="ghost" size="sm" onClick={() => setWeekOffset(0)}>
                امروز
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setWeekOffset(o => o + 1)}
              aria-label="هفته بعد"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
          </div>
        }
      />

      {/* Week label */}
      <p className="text-xs text-gray-700 dark:text-gray-300 -mt-2">
        {getWeekLabel(weekOffset)}
        {totalWeekTasks > 0 && (
          <span className="mr-2 px-2 py-0.5 rounded-full bg-violet-100/80 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs">
            {totalWeekTasks} وظیفه
          </span>
        )}
      </p>

      {/* Day columns */}
      {days.map(day => {
        const dayTasks = tasksByDay[day];
        const isTd = isToday(day);

        return (
          <div
            key={day}
            className={`
              rounded-2xl border overflow-hidden
              glass-surface
              ${isTd ? 'ring-1 ring-violet-300/50 dark:ring-violet-700/40' : ''}
            `}
          >
            {/* Day header */}
            <div
              className={`
                flex items-center justify-between px-4 py-3 border-b
                border-b border-white/50 dark:border-violet-900/30
              `}
            >
              <div className="flex items-center gap-2">
                {isTd && (
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0" />
                )}
                <span
                  className={`text-sm font-semibold ${
                    isTd
                      ? 'text-violet-700 dark:text-violet-300'
                      : 'text-gray-700 dark:text-gray-200'
                  }`}
                >
                  {formatWeekdayFa(day)}
                  {isTd && <span className="mr-1 text-xs font-normal text-violet-500 dark:text-violet-400">(امروز)</span>}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {formatShortDateFa(day)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {dayTasks.length > 0 && (
                  <span className="text-xs text-gray-400">{dayTasks.length} وظیفه</span>
                )}
                <button
                  onClick={() => setAddForDate(day)}
                  className="p-1 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-white/60 dark:hover:bg-violet-900/20 transition-colors"
                  aria-label="افزودن وظیفه"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Tasks */}
            <div className="p-3">
              {dayTasks.length === 0 ? (
                <p className="text-xs text-center text-gray-500 dark:text-gray-500 py-3">
                  وظیفه‌ای ثبت نشده
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {dayTasks.map(task => (
                    <TaskItem key={task.id} task={task} />
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* No tasks at all for the week */}
      {totalWeekTasks === 0 && (
        <EmptyState
          icon={<CalIcon />}
          title="این هفته هنوز وظیفه‌ای ندارید"
          description="روی + کنار هر روز کلیک کن تا وظیفه اضافه کنی"
        />
      )}

      {/* Add task modal for a specific day */}
      <TaskForm
        open={addForDate !== null}
        onClose={() => setAddForDate(null)}
        defaultDate={addForDate ?? undefined}
        onSubmit={data => {
          addTask(data);
          addToast('وظیفه با موفقیت اضافه شد ✓', 'success');
          setAddForDate(null);
        }}
      />
    </div>
  );
}
