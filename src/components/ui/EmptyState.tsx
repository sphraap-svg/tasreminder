import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700/60 flex items-center justify-center mb-4 text-gray-400 dark:text-gray-500">
          {icon}
        </div>
      )}
      <p className="text-base font-medium text-gray-700 dark:text-gray-300 mb-1">{title}</p>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-500 mb-5 max-w-xs">{description}</p>
      )}
      {action}
    </div>
  );
}
