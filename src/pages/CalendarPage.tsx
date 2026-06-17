import React from 'react';
import { CalendarCard } from '../components/ui/CalendarCard';
import { useTasks } from '../context/TaskContext';
import { getWeekDays, formatWeekdayFa, formatShortDateFa, isToday } from '../utils/date';

export function CalendarPage() {
  const { activeTasks } = useTasks();
  const days = getWeekDays(0);

  return (
    <div className="flex flex-col gap-4 pt-4">
      <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">تقویم</h1>

      <CalendarCard />

      {/* This week's tasks grouped by day */}
      <div className="flex flex-col gap-3 mt-2">
        <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">وظایف این هفته</h2>
        {days.map(day => {
          const dayTasks = activeTasks.filter(t => t.date === day);
          return (
            <div key={day} className={`rounded-2xl border px-4 py-3 ${
              isToday(day)
                ? 'border-indigo-200 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-900/20'
                : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/50'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-bold ${isToday(day) ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {formatWeekdayFa(day)}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">{formatShortDateFa(day)}</span>
                {isToday(day) && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500 text-white">امروز</span>
                )}
              </div>
              {dayTasks.length === 0 ? (
                <p className="text-xs text-gray-300 dark:text-gray-600">بدون وظیفه</p>
              ) : (
                <div className="flex flex-col gap-1">
                  {dayTasks.map(t => (
                    <div key={t.id} className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${t.completed ? 'bg-emerald-400' : 'bg-indigo-400'}`} />
                      <span className={`text-xs ${t.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-200'}`}>
                        {t.title}
                      </span>
                      {t.time && (
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 mr-auto">
                          {new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit', hour12: false }).format(
                            new Date(`${t.date}T${t.time}:00`)
                          )}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
