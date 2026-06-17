import React, { useState, useEffect } from 'react';
import { useTasks } from '../../context/TaskContext';
import { Task } from '../../types';

function getNextTask(activeTasks: Task[]): Task | null {
  const now = new Date();
  return (
    [...activeTasks]
      .filter(t => {
        // Include tasks with a time today-or-future, or tasks with a future date
        const taskDT = new Date(t.date + (t.time ? `T${t.time}:00` : 'T23:59:59'));
        return taskDT >= now;
      })
      .sort((a, b) => {
        const da = new Date(a.date + (a.time ? `T${a.time}:00` : 'T23:59:59'));
        const db = new Date(b.date + (b.time ? `T${b.time}:00` : 'T23:59:59'));
        return da.getTime() - db.getTime();
      })[0] ?? null
  );
}

function msRemaining(task: Task): number {
  const taskDT = new Date(task.date + (task.time ? `T${task.time}:00` : 'T23:59:59'));
  return taskDT.getTime() - Date.now();
}

function formatRemaining(ms: number): string {
  if (ms <= 0) return 'الان';
  const totalMins = Math.floor(ms / 60000);
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  const days = Math.floor(hours / 24);
  if (days >= 1) return `${new Intl.NumberFormat('fa-IR').format(days)} روز دیگر`;
  if (hours >= 1 && mins > 0) return `${new Intl.NumberFormat('fa-IR').format(hours)} ساعت و ${new Intl.NumberFormat('fa-IR').format(mins)} دقیقه`;
  if (hours >= 1) return `${new Intl.NumberFormat('fa-IR').format(hours)} ساعت دیگر`;
  return `${new Intl.NumberFormat('fa-IR').format(mins)} دقیقه دیگر`;
}

export function NextTaskCard() {
  const { activeTasks } = useTasks();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30000); // refresh every 30s
    return () => clearInterval(id);
  }, []);

  const next = getNextTask(activeTasks);
  const ms = next ? msRemaining(next) : null;

  if (!next) {
    return (
      <div className="home-card p-5 flex flex-col justify-between min-h-[130px]">
        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 tracking-wide">وظیفه بعدی</span>
        <div className="flex flex-col items-center justify-center flex-1 py-3 gap-1">
          <svg className="w-7 h-7 text-gray-200 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">وظیفه‌ای در راه نیست</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-card p-5 flex flex-col justify-between min-h-[130px] relative overflow-hidden">
      <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 tracking-wide">وظیفه بعدی</span>
      <div className="flex-1 flex flex-col justify-end gap-1 mt-2">
        <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 leading-tight tabular-nums" dir="ltr">
          {ms !== null && ms > 0 ? formatRemaining(ms) : (
            <span className="text-amber-500">گذشته</span>
          )}
        </div>
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 line-clamp-2 leading-snug">
          {next.title}
        </p>
        {next.time && (
          <p className="text-[10px] text-gray-400 dark:text-gray-500">
            {new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit', hour12: false }).format(
              new Date(next.date + `T${next.time}:00`)
            )}
          </p>
        )}
      </div>
      {/* Decorative */}
      <div
        className="absolute -top-4 -right-4 w-20 h-20 rounded-full pointer-events-none opacity-15"
        style={{ background: 'radial-gradient(circle, #818cf8 0%, transparent 70%)' }}
        aria-hidden
      />
      {/* suppress unused tick warning */}
      {tick > 0 && null}
    </div>
  );
}
