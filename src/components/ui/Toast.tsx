import React from 'react';
import { useToast } from '../../context/ToastContext';
import { ToastType } from '../../types';

const toastStyles: Record<ToastType, string> = {
  success: 'bg-emerald-500 text-white',
  error: 'bg-red-500 text-white',
  info: 'bg-indigo-500 text-white',
  warning: 'bg-amber-500 text-white',
};

const icons: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: '⏰',
  warning: '⚠',
};

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-24 sm:bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`
            flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg
            animate-toast-in pointer-events-auto cursor-pointer
            ${toastStyles[toast.type]}
          `}
          onClick={() => removeToast(toast.id)}
        >
          <span className="text-lg leading-none">{icons[toast.type]}</span>
          <span className="text-sm font-medium flex-1">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
