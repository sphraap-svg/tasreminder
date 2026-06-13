import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { Header } from '../components/layout/Header';
import { QuickAddTask } from '../components/tasks/QuickAddTask';
import { TaskList } from '../components/tasks/TaskList';
import { SearchBar } from '../components/filters/SearchBar';
import { FilterBar } from '../components/filters/FilterBar';
import { EmptyState } from '../components/ui/EmptyState';
import { formatTodayHeaderFa } from '../utils/date';
import { FilterType } from '../types';

function ChecklistIcon() {
  return (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}

export function TodayPage() {
  const { todayTasks, categories } = useTasks();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [categoryFilter, setCategoryFilter] = useState('');

  const totalCount = todayTasks.length;
  const completedCount = todayTasks.filter(t => t.completed).length;
  const remainingCount = totalCount - completedCount;
  const allDone = totalCount > 0 && remainingCount === 0;

  return (
    <div className="flex flex-col gap-4">
      <Header
        title="امروز"
        subtitle={formatTodayHeaderFa()}
      />

      {/* Summary strip */}
      {totalCount > 0 && (
        <div className="flex gap-3">
          {[
            { label: 'کل', value: totalCount, color: 'text-gray-700 dark:text-gray-300' },
            { label: 'انجام‌شده', value: completedCount, color: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'باقی‌مانده', value: remainingCount, color: 'text-indigo-600 dark:text-indigo-400' },
          ].map(s => (
            <div
              key={s.label}
              className="flex-1 bg-white dark:bg-gray-800 rounded-xl px-3 py-2.5 text-center border border-gray-100 dark:border-gray-700"
            >
              <p className={`text-lg font-bold leading-none ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Quick add */}
      <QuickAddTask />

      {/* Search */}
      <SearchBar value={search} onChange={setSearch} />

      {/* Filters */}
      <FilterBar
        active={filter}
        onChange={f => setFilter(f)}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        categories={categories}
      />

      {/* Task list */}
      <TaskList
        tasks={todayTasks}
        filter={filter}
        search={search}
        categoryFilter={categoryFilter}
        emptyNode={
          allDone ? (
            <EmptyState
              icon={<StarIcon />}
              title="همه کارهای امروز انجام شدند!"
              description="عالیه، امروز رو به خوبی پشت سر گذاشتی 🎉"
            />
          ) : (
            <EmptyState
              icon={<ChecklistIcon />}
              title={search || filter !== 'all' ? 'وظیفه‌ای پیدا نشد' : 'امروز هنوز وظیفه‌ای ثبت نکرده‌ای'}
              description={
                search || filter !== 'all'
                  ? 'فیلتر یا جستجو را تغییر بده'
                  : 'اولین وظیفه امروزت را از بالا اضافه کن'
              }
            />
          )
        }
      />
    </div>
  );
}
