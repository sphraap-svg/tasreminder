import React, { useState } from 'react';
import { getWeekDays, isToday, addDays, today as todayDateStr } from '../../utils/date';
import { useTasks } from '../../context/TaskContext';
import { Task } from '../../types';

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
  const currentMonth = jalaliMonthName(dateStr);
  let cursor = dateStr;
  let monthStart = dateStr;
  for (let i = 0; i < 31; i++) {
    const prev = addDays(cursor, -1);
    if (jalaliMonthName(prev) !== currentMonth) break;
    monthStart = prev;
    cursor = prev;
  }
  const startDate = new Date(monthStart + 'T12:00:00');
  const dow = startDate.getDay();
  const padDays = (dow + 1) % 7;
  const gridStart = addDays(monthStart, -padDays);
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}

function getNextTaskDate(tasks: Task[]): string | null {
  const td = todayDateStr();
  const sorted = [...tasks]
    .filter(t => !t.completed && !t.archived && t.date >= td)
    .sort((a, b) => a.date.localeCompare(b.date));
  return sorted[0]?.date ?? null;
}

function addMonths(dateStr: string, n: number): string {
  return addDays(dateStr, n * 30);
}

interface CalendarCardProps {
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
  onAddNote?: (date: string) => void;
  onAddEvent?: (date: string) => void;
}

export function CalendarCard({
  selectedDate,
  onSelectDate,
  onAddNote,
  onAddEvent,
}: CalendarCardProps) {
  const { activeTasks } = useTasks();
  const [mode, setMode] = useState<CalendarMode>('week');
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthAnchor, setMonthAnchor] = useState(todayDateStr());

  const nextTaskDate = getNextTaskDate(activeTasks);
  const activeSelected = selectedDate ?? nextTaskDate ?? todayDateStr();

  const weekDays = getWeekDays(weekOffset);
  const monthDays = getMonthDays(monthAnchor);
  const currentMonth = jalaliMonthName(monthAnchor);

  const displayDate = mode === 'week' ? weekDays[0] : monthAnchor;
  const displayMonth = jalaliMonthName(displayDate);
  const displayYear = jalaliYear(displayDate);

  function handleDayClick(day: string) {
    onSelectDate?.(day);
    // If clicking a day outside current view in month mode, shift anchor
    if (mode === 'month' && jalaliMonthName(day) !== currentMonth) {
      setMonthAnchor(day);
    }
  }

  function goToday() {
    setWeekOffset(0);
    setMonthAnchor(todayDateStr());
    onSelectDate?.(todayDateStr());
  }

  function prevPeriod() {
    if (mode === 'week') setWeekOffset(o => o - 1);
    else setMonthAnchor(d => addMonths(d, -1));
  }

  function nextPeriod() {
    if (mode === 'week') setWeekOffset(o => o + 1);
    else setMonthAnchor(d => addMonths(d, 1));
  }

  const isCurrentPeriod = mode === 'week'
    ? weekOffset === 0
    : jalaliMonthName(monthAnchor) === jalaliMonthName(todayDateStr()) &&
      jalaliYear(monthAnchor) === jalaliYear(todayDateStr());

  // Tasks dot: days that have at least one active task
  const taskDates = new Set(activeTasks.map(t => t.date));

  function dayStyle(day: string): React.CSSProperties {
    const isSelected = day === activeSelected;
    const todayDay = isToday(day);
    if (isSelected) {
      return {
        background: 'linear-gradient(135deg, #c026d3 0%, #7c3aed 100%)',
        boxShadow: '0 4px 16px rgba(124,58,237,0.55)',
        color: '#fff',
      };
    }
    if (todayDay) return { background: 'rgba(255,255,255,0.35)', color: '#fff', fontWeight: 800 };
    return { color: 'rgba(255,255,255,0.85)' };
  }

  function dayFaded(day: string): boolean {
    return mode === 'month' && jalaliMonthName(day) !== currentMonth;
  }

  return (
    <div className="calendar-card relative rounded-3xl overflow-hidden">
      {/* Gradient background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 75% 80% at 15% 25%, rgba(167,139,250,0.90) 0%, transparent 55%),
            radial-gradient(ellipse 65% 65% at 82% 20%, rgba(251,182,155,0.85) 0%, transparent 52%),
            radial-gradient(ellipse 55% 60% at 50% 95%, rgba(196,130,255,0.60) 0%, transparent 58%),
            rgba(240,234,255,1)
          `,
        }}
        aria-hidden
      />
      <div className="dark-grad-bg absolute inset-0 pointer-events-none opacity-0" aria-hidden />
      <style>{`
        .dark .dark-grad-bg {
          opacity: 1 !important;
          background:
            radial-gradient(ellipse 75% 80% at 15% 25%, rgba(120,60,230,0.92) 0%, transparent 55%),
            radial-gradient(ellipse 65% 65% at 82% 20%, rgba(200,80,60,0.75) 0%, transparent 52%),
            radial-gradient(ellipse 55% 60% at 50% 95%, rgba(150,60,220,0.60) 0%, transparent 58%),
            rgba(16,10,32,1);
        }
      `}</style>

      <div className="relative px-4 pt-4 pb-4 sm:px-5 sm:pt-5">

        {/* Top row: mode toggle + navigation */}
        <div className="flex items-center justify-between mb-4 gap-2">
          <div className="flex gap-0 bg-white/25 backdrop-blur-sm p-1 rounded-2xl flex-shrink-0">
            {(['week', 'month'] as CalendarMode[]).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                  mode === m
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {m === 'week' ? 'هفته' : 'ماه'}
              </button>
            ))}
          </div>

          <div className="flex-1 text-center">
            <span className="text-sm font-bold text-white/90 select-none">
              {displayMonth} {displayYear}
            </span>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {!isCurrentPeriod && (
              <button
                onClick={goToday}
                className="px-2 py-1 rounded-xl text-[10px] font-bold text-white/80 hover:text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all"
              >
                امروز
              </button>
            )}
            <button
              onClick={nextPeriod}
              aria-label="دوره بعدی"
              className="w-7 h-7 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 text-white/80 hover:text-white transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={prevPeriod}
              aria-label="دوره قبلی"
              className="w-7 h-7 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 text-white/80 hover:text-white transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Weekday labels */}
        <div className="grid grid-cols-7 mb-1">
          {WEEKDAY_SHORT.map((d, i) => (
            <div key={i} className="text-center text-[11px] font-semibold text-white/60 py-0.5">
              {d}
            </div>
          ))}
        </div>

        {/* Week view */}
        {mode === 'week' && (
          <div className="grid grid-cols-7 gap-0.5 mb-2">
            {weekDays.map(day => (
              <div key={day} className="flex flex-col items-center py-0.5 gap-0.5">
                <button
                  onClick={() => handleDayClick(day)}
                  className="w-9 h-9 flex items-center justify-center rounded-full text-sm font-bold transition-all duration-150 hover:scale-110 active:scale-95"
                  style={dayStyle(day)}
                >
                  {jalaliDayNumber(day)}
                </button>
                {taskDates.has(day) && (
                  <span className="w-1 h-1 rounded-full bg-white/60" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Month view */}
        {mode === 'month' && (
          <div className="grid grid-cols-7 gap-0.5 mb-2">
            {monthDays.map(day => (
              <div key={day} className="flex flex-col items-center py-0.5 gap-0.5">
                <button
                  onClick={() => handleDayClick(day)}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-xs font-semibold transition-all duration-150 hover:scale-110 active:scale-95"
                  style={{
                    ...dayStyle(day),
                    ...(dayFaded(day) ? { color: 'rgba(255,255,255,0.30)' } : {}),
                    ...(day === activeSelected ? dayStyle(day) : {}),
                  }}
                >
                  {jalaliDayNumber(day)}
                </button>
                {taskDates.has(day) && (
                  <span className="w-1 h-1 rounded-full bg-white/50" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-2 pt-3 border-t border-white/15">
          {onAddNote && (
            <button
              onClick={() => onAddNote(activeSelected)}
              className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white/95 bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-xl transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              یادداشت
            </button>
          )}
          <div className="flex-1" />
          {onAddEvent && (
            <button
              onClick={() => onAddEvent(activeSelected)}
              className="flex items-center gap-1 text-xs font-bold text-white/80 hover:text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-1.5 rounded-xl transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              رویداد جدید
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
