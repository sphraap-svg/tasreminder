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

/** Move a date forward by N months (approximate using 30-day jumps then adjust) */
function addMonths(dateStr: string, n: number): string {
  return addDays(dateStr, n * 30);
}

export function CalendarCard() {
  const { activeTasks } = useTasks();
  const [mode, setMode] = useState<CalendarMode>('week');
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthAnchor, setMonthAnchor] = useState(todayDateStr());

  const nextTaskDate = getNextTaskDate(activeTasks);
  const focalDate = nextTaskDate ?? todayDateStr();

  const weekDays = getWeekDays(weekOffset);
  const monthDays = getMonthDays(monthAnchor);
  const currentMonth = jalaliMonthName(monthAnchor);
  const currentYear = jalaliYear(monthAnchor);

  // Header display: in week mode show the month of first visible day; in month mode show anchor month
  const displayDate = mode === 'week' ? weekDays[0] : monthAnchor;
  const displayMonth = jalaliMonthName(displayDate);
  const displayYear = jalaliYear(displayDate);

  function goToday() {
    setWeekOffset(0);
    setMonthAnchor(todayDateStr());
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
          {/* Mode toggle */}
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

          {/* Month/period label */}
          <div className="flex-1 text-center">
            <span className="text-sm font-bold text-white/90 select-none">
              {displayMonth} {displayYear}
            </span>
          </div>

          {/* Navigation arrows */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {!isCurrentPeriod && (
              <button
                onClick={goToday}
                title="برو به امروز"
                className="px-2 py-1 rounded-xl text-[10px] font-bold text-white/80 hover:text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all"
              >
                امروز
              </button>
            )}
            {/* RTL: next is left arrow (←), prev is right arrow (→) */}
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
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {weekDays.map(day => {
              const isFocal = day === focalDate;
              const todayDay = isToday(day);
              return (
                <div key={day} className="flex justify-center py-0.5">
                  <div
                    className="w-9 h-9 flex items-center justify-center rounded-full text-sm font-bold select-none cursor-default transition-all duration-200"
                    style={
                      isFocal
                        ? {
                            background: 'linear-gradient(135deg, #c026d3 0%, #7c3aed 100%)',
                            boxShadow: '0 4px 16px rgba(124,58,237,0.55)',
                            color: '#fff',
                          }
                        : todayDay
                        ? { background: 'rgba(255,255,255,0.35)', color: '#fff', fontWeight: 800 }
                        : { color: 'rgba(255,255,255,0.85)' }
                    }
                  >
                    {jalaliDayNumber(day)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Month view */}
        {mode === 'month' && (
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {monthDays.map(day => {
              const isFocal = day === focalDate;
              const todayDay = isToday(day);
              const isCurrentMonth = jalaliMonthName(day) === currentMonth;
              return (
                <div key={day} className="flex justify-center py-0.5">
                  <div
                    className="w-8 h-8 flex items-center justify-center rounded-full text-xs font-semibold select-none cursor-default transition-all duration-200"
                    style={
                      isFocal
                        ? {
                            background: 'linear-gradient(135deg, #c026d3 0%, #7c3aed 100%)',
                            boxShadow: '0 2px 10px rgba(124,58,237,0.50)',
                            color: '#fff',
                          }
                        : todayDay
                        ? { background: 'rgba(255,255,255,0.35)', color: '#fff', fontWeight: 800 }
                        : isCurrentMonth
                        ? { color: 'rgba(255,255,255,0.85)' }
                        : { color: 'rgba(255,255,255,0.30)' }
                    }
                  >
                    {jalaliDayNumber(day)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-2 pt-3 border-t border-white/15 mt-2">
          <button className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white/90 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            یادداشت اضافه کن...
          </button>
          <div className="flex-1" />
          <button className="flex items-center gap-1 text-xs font-bold text-white/80 hover:text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-1.5 rounded-xl transition-all">
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
