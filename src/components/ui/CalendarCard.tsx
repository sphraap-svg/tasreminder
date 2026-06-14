import React, { useState } from 'react';
import { getWeekDays, isToday, addDays } from '../../utils/date';

type CalendarMode = 'week' | 'month';

const WEEKDAY_SHORT = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

function jalaliDayNumber(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat('fa-IR', { day: 'numeric' }).format(
      new Date(dateStr + 'T12:00:00')
    );
  } catch { return ''; }
}

function jalaliMonthName(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat('fa-IR', { month: 'long' }).format(
      new Date(dateStr + 'T12:00:00')
    );
  } catch { return ''; }
}

function jalaliYear(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(
      new Date(dateStr + 'T12:00:00')
    );
  } catch { return ''; }
}

function getMonthDays(dateStr: string): string[] {
  // Build 6 weeks (42 cells) starting from the first Saturday on or before the Jalali month start
  const today = dateStr;
  // Find current Jalali month start: go back up to 31 days until month changes
  const currentMonth = jalaliMonthName(today);
  let cursor = today;
  let monthStart = today;
  for (let i = 0; i < 31; i++) {
    const prev = addDays(cursor, -1);
    if (jalaliMonthName(prev) !== currentMonth) break;
    monthStart = prev;
    cursor = prev;
  }
  // Pad to nearest Saturday (Persian week start)
  const startDate = new Date(monthStart + 'T12:00:00');
  const dow = startDate.getDay(); // 0=Sun..6=Sat
  const padDays = (dow + 1) % 7; // days since last Saturday
  const gridStart = addDays(monthStart, -padDays);
  // Build 42 days (6 weeks)
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}

export function CalendarCard() {
  const [mode, setMode] = useState<CalendarMode>('week');
  const weekDays = getWeekDays(0);
  const todayStr = weekDays.find(d => isToday(d)) ?? weekDays[0];
  const headerDate = isToday(todayStr) ? todayStr : weekDays[3];

  const monthDays = getMonthDays(headerDate);
  const currentMonth = jalaliMonthName(headerDate);
  const currentYear = jalaliYear(headerDate);

  return (
    <div
      className="calendar-card relative rounded-3xl overflow-hidden mb-2"
      style={{
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        background: 'rgba(255,255,255,0.55)',
        boxShadow: '0 8px 32px rgba(99,102,241,0.10), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.90)',
        border: '1.5px solid rgba(255,255,255,0.75)',
      }}
    >
      {/* Dark mode override via Tailwind class + inline override approach */}
      <style>{`
        .dark .calendar-card {
          background: rgba(20,22,40,0.62) !important;
          box-shadow: 0 8px 32px rgba(80,60,200,0.18), 0 2px 8px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.08) !important;
          border-color: rgba(100,80,220,0.25) !important;
        }
      `}</style>

      {/* Gradient border overlay */}
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.05) 100%)',
          padding: '1.5px',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        } as React.CSSProperties}
        aria-hidden
      />

      <div className="relative px-5 pt-5 pb-4">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col leading-tight">
            <span className="text-xl font-black text-gray-800 dark:text-gray-100">{currentMonth}</span>
            <span className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{currentYear}</span>
          </div>

          {/* Mode toggle + settings */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1 bg-gray-100/80 dark:bg-white/10 p-1 rounded-2xl">
              {(['week', 'month'] as CalendarMode[]).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all duration-200 ${
                    mode === m
                      ? 'bg-white dark:bg-white/20 text-indigo-600 dark:text-indigo-300 shadow-sm'
                      : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  {m === 'week' ? 'هفته' : 'ماه'}
                </button>
              ))}
            </div>

            <button
              title="تنظیمات تقویم"
              className="p-1.5 rounded-xl text-gray-400 dark:text-gray-500 hover:text-indigo-500 hover:bg-indigo-50/60 dark:hover:bg-white/10 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Weekday labels */}
        <div className="grid grid-cols-7 mb-1.5">
          {WEEKDAY_SHORT.map((d, i) => (
            <div key={i} className="text-center text-[11px] font-semibold text-gray-400 dark:text-gray-500 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Week view: single row */}
        {mode === 'week' && (
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map(day => {
              const today = isToday(day);
              return (
                <div key={day} className="flex justify-center">
                  <div
                    className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-bold transition-all duration-200 cursor-default select-none ${
                      today
                        ? 'text-white shadow-md'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-white/10'
                    }`}
                    style={today ? {
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      boxShadow: '0 4px 14px rgba(99,102,241,0.40)',
                    } : undefined}
                  >
                    {jalaliDayNumber(day)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Month view: 6-week grid */}
        {mode === 'month' && (
          <div className="grid grid-cols-7 gap-0.5">
            {monthDays.map(day => {
              const today = isToday(day);
              const isCurrentMonth = jalaliMonthName(day) === currentMonth;
              return (
                <div key={day} className="flex justify-center py-0.5">
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-semibold transition-all duration-200 cursor-default select-none ${
                      today
                        ? 'text-white shadow-sm'
                        : isCurrentMonth
                        ? 'text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-white/10'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                    style={today ? {
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      boxShadow: '0 2px 8px rgba(99,102,241,0.35)',
                    } : undefined}
                  >
                    {jalaliDayNumber(day)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer buttons */}
        <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100/60 dark:border-white/10">
          <button className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            یادداشت اضافه کن...
          </button>
          <div className="flex-1" />
          <button className="flex items-center gap-1 text-xs font-semibold text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            رویداد جدید
          </button>
        </div>
      </div>
    </div>
  );
}
