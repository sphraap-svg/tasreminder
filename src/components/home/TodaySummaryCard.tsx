import React from 'react';
import { useTasks } from '../../context/TaskContext';
import { today } from '../../utils/date';
import { useNavigate } from 'react-router-dom';

export function TodaySummaryCard() {
  const { tasks } = useTasks();
  const navigate = useNavigate();
  const todayStr = today();

  const todayAll = tasks.filter(t => t.date === todayStr && !t.archived);
  const done = todayAll.filter(t => t.completed).length;
  const remaining = todayAll.filter(t => !t.completed).length;
  const total = todayAll.length;
  const progress = total > 0 ? done / total : 0;

  return (
    <div
      className="home-card p-5 cursor-pointer"
      onClick={() => navigate('/today')}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate('/today')}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 tracking-wide">امروز</span>
        <svg className="w-4 h-4 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </div>

      {total === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500">هنوز وظیفه‌ای امروز نداری</p>
      ) : (
        <>
          <div className="flex items-end gap-3 mb-3">
            <div>
              <span className="text-3xl font-black text-gray-900 dark:text-gray-50 tabular-nums">
                {new Intl.NumberFormat('fa-IR').format(done)}
              </span>
              <span className="text-sm text-gray-400 dark:text-gray-500 mr-1">
                از {new Intl.NumberFormat('fa-IR').format(total)}
              </span>
            </div>
            {remaining > 0 && (
              <span className="mb-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300">
                {new Intl.NumberFormat('fa-IR').format(remaining)} باقی
              </span>
            )}
            {remaining === 0 && total > 0 && (
              <span className="mb-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300">
                همه انجام شد ✓
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progress * 100}%`,
                background: progress === 1
                  ? 'linear-gradient(90deg, #10b981, #34d399)'
                  : 'linear-gradient(90deg, #6366f1, #818cf8)',
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
