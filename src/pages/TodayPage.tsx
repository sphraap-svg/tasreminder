import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { QuickAddTask } from '../components/tasks/QuickAddTask';
import { TaskList } from '../components/tasks/TaskList';
import { SearchBar } from '../components/filters/SearchBar';
import { FilterBar } from '../components/filters/FilterBar';
import { EmptyState } from '../components/ui/EmptyState';
import { FloatingTaskCard } from '../components/tasks/FloatingTaskCard';
import { formatTodayHeaderFa } from '../utils/date';
import { FilterType } from '../types';

// ─── Icon helpers ─────────────────────────────────────────────────────────────

function StarIcon() {
  return (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}

function ChecklistIcon() {
  return (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}

// ─── Dotted connector between cards ──────────────────────────────────────────

function CardConnector({ fromLeft }: { fromLeft: boolean }) {
  return (
    <>
      {/* Desktop: curved SVG path */}
      <div className="relative h-10 w-full hidden md:block" aria-hidden="true">
        <svg
          viewBox="0 0 576 40"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <path
            d={
              fromLeft
                ? 'M 160 2 C 288 12 288 28 416 38'
                : 'M 416 2 C 288 12 288 28 160 38'
            }
            fill="none"
            stroke="#C7D2DB"
            strokeWidth="2"
            strokeDasharray="6 7"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Mobile: simple vertical dotted line */}
      <div className="flex justify-center md:hidden" aria-hidden="true">
        <div className="w-0 border-l-2 border-dashed border-gray-300 dark:border-gray-600 h-8" />
      </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function TodayPage() {
  const { todayTasks, categories } = useTasks();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Split tasks for pinboard vs. list
  const activeTasks = todayTasks.filter(t => !t.completed && !t.archived);
  const completedToday = todayTasks.filter(t => t.completed);
  const pinnedTasks = activeTasks.slice(0, 5);
  const extraTasks = activeTasks.slice(5);

  const totalCount = todayTasks.length;
  const completedCount = completedToday.length;
  const remainingCount = activeTasks.length;
  const allDone = totalCount > 0 && remainingCount === 0;

  return (
    <div className="flex flex-col gap-0">

      {/* ── Board: paper background ── */}
      <div className="pinboard-paper rounded-2xl overflow-hidden shadow-sm mx-0.5">

        {/* Board header */}
        <div className="text-center px-6 pt-8 pb-5">
          <h1 className="text-4xl font-black text-gray-800 dark:text-gray-100 tracking-tighter leading-none">
            امروز
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2 font-medium">
            {formatTodayHeaderFa()}
          </p>

          {/* Summary pills */}
          {totalCount > 0 && (
            <div className="flex gap-2 justify-center mt-4 flex-wrap">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/70 dark:bg-white/10 text-gray-600 dark:text-gray-300 shadow-sm">
                کل {totalCount}
              </span>
              {completedCount > 0 && (
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 shadow-sm">
                  ✓ {completedCount} انجام‌شده
                </span>
              )}
              {remainingCount > 0 && (
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 shadow-sm">
                  {remainingCount} باقی‌مانده
                </span>
              )}
            </div>
          )}
        </div>

        {/* Quick add */}
        <div className="px-4 pb-6">
          <QuickAddTask />
        </div>

        {/* ── All-done state ── */}
        {allDone && (
          <div className="px-4 pb-10">
            <EmptyState
              icon={<StarIcon />}
              title="همه کارهای امروز انجام شدند!"
              description="عالیه، امروز رو به خوبی پشت سر گذاشتی 🎉"
            />
          </div>
        )}

        {/* ── No tasks state ── */}
        {!allDone && totalCount === 0 && (
          <div className="px-4 pb-10">
            <EmptyState
              icon={<ChecklistIcon />}
              title="امروز هنوز وظیفه‌ای ثبت نکرده‌ای"
              description="اولین وظیفه امروزت را از بالا اضافه کن"
            />
          </div>
        )}

        {/* ── Pinboard cards ── */}
        {pinnedTasks.length > 0 && (
          <div className="px-4 md:px-10 pb-10">
            {/* Card label */}
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 text-center mb-6 tracking-wide uppercase">
              وظایف اصلی
            </p>

            {/* Cards + connectors */}
            <div className="flex flex-col items-center max-w-xl mx-auto">
              {pinnedTasks.map((task, i) => (
                <React.Fragment key={task.id}>
                  {/* Card row — alternates left / right on desktop */}
                  <div
                    className={`flex w-full justify-center ${
                      i % 2 === 0 ? 'md:justify-start' : 'md:justify-end'
                    }`}
                  >
                    <FloatingTaskCard task={task} index={i} />
                  </div>

                  {/* Connector to next card */}
                  {i < pinnedTasks.length - 1 && (
                    <CardConnector fromLeft={i % 2 === 0} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Extra tasks (6th+ active today tasks) ── */}
      {extraTasks.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-3 px-1">
            باقی وظایف امروز ({extraTasks.length})
          </p>
          <TaskList
            tasks={extraTasks}
            filter="all"
            search=""
            categoryFilter=""
          />
        </div>
      )}

      {/* ── Search / Filter toggle ── */}
      <div className="mt-4">
        <button
          onClick={() => setShowFilters(v => !v)}
          className="flex items-center gap-2 text-xs font-medium text-gray-400 dark:text-gray-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors px-1 py-2"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {showFilters ? 'بستن جستجو' : 'جستجو و فیلتر'}
          <svg
            className={`w-3 h-3 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showFilters && (
          <div className="flex flex-col gap-3 mt-1">
            <SearchBar value={search} onChange={setSearch} />
            <FilterBar
              active={filter}
              onChange={setFilter}
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
              categories={categories}
            />
            <TaskList
              tasks={todayTasks}
              filter={filter}
              search={search}
              categoryFilter={categoryFilter}
              emptyNode={
                <EmptyState
                  icon={<ChecklistIcon />}
                  title="وظیفه‌ای پیدا نشد"
                  description="فیلتر یا جستجو را تغییر بده"
                />
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
