import React from 'react';
import { FilterType } from '../../types';

interface FilterOption {
  key: FilterType;
  label: string;
}

const FILTERS: FilterOption[] = [
  { key: 'all', label: 'همه' },
  { key: 'incomplete', label: 'انجام‌نشده' },
  { key: 'completed', label: 'انجام‌شده' },
  { key: 'priority_high', label: '🔴 فوری' },
  { key: 'priority_medium', label: '🟡 متوسط' },
  { key: 'priority_low', label: '🟢 عادی' },
];

interface FilterBarProps {
  active: FilterType;
  onChange: (f: FilterType) => void;
  categoryFilter: string;
  onCategoryChange: (c: string) => void;
  categories: string[];
}

export function FilterBar({
  active,
  onChange,
  categoryFilter,
  onCategoryChange,
  categories,
}: FilterBarProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {FILTERS.map(f => (
        <button
          key={f.key}
          onClick={() => onChange(f.key)}
          className={`
            flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors
            ${
              active === f.key
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
            }
          `}
        >
          {f.label}
        </button>
      ))}
      {categories.length > 0 && (
        <select
          value={categoryFilter}
          onChange={e => onCategoryChange(e.target.value)}
          className="
            flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium
            bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400
            border-none outline-none cursor-pointer
            appearance-none
          "
        >
          <option value="">دسته‌بندی</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      )}
    </div>
  );
}
