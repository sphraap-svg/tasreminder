import React, { useState } from 'react';
import { WorkspaceTask, WorkspaceMember, WorkspaceTaskStatus } from '../../types/workspace';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';

interface Props {
  task: WorkspaceTask;
  members: WorkspaceMember[];
  isManager: boolean;
}

const STATUS_LABELS: Record<WorkspaceTaskStatus, string> = {
  pending: 'در انتظار',
  done: 'انجام شد',
  not_done: 'انجام نشد',
};

const STATUS_COLORS: Record<WorkspaceTaskStatus, string> = {
  pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  done: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  not_done: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300',
};

export function WorkspaceTaskItem({ task, members, isManager }: Props) {
  const { user } = useAuth();
  const { updateTaskStatus, deleteTask } = useWorkspace();
  const [isLeaving, setIsLeaving] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const assignedMember = members.find(m => m.user_id === task.assigned_to);
  const canChangeStatus = isManager || task.assigned_to === user?.id;
  const canDelete = isManager;

  async function handleStatusCycle() {
    if (!canChangeStatus || statusLoading) return;
    const cycle: WorkspaceTaskStatus[] = ['pending', 'done', 'not_done'];
    const next = cycle[(cycle.indexOf(task.status) + 1) % cycle.length];
    setStatusLoading(true);
    await updateTaskStatus(task.id, next);
    setStatusLoading(false);
  }

  async function handleDelete() {
    if (!canDelete) return;
    setIsLeaving(true);
    setTimeout(() => deleteTask(task.id), 210);
  }

  return (
    <div className={`task-item${task.status === 'done' ? ' task-item--done' : ''}${isLeaving ? ' leaving' : ''} group relative flex items-start gap-3 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-200`}>
      {/* Status button */}
      <button
        onClick={handleStatusCycle}
        disabled={!canChangeStatus || statusLoading}
        title={canChangeStatus ? 'تغییر وضعیت' : 'دسترسی محدود'}
        className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
          task.status === 'done'
            ? 'bg-emerald-500 border-emerald-500 text-white'
            : task.status === 'not_done'
            ? 'bg-red-400 border-red-400 text-white'
            : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'
        } ${canChangeStatus ? 'cursor-pointer' : 'cursor-default'}`}
      >
        {task.status === 'done' && (
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
            <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        )}
        {task.status === 'not_done' && (
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" d="M3 3l6 6M9 3l-6 6" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 flex-wrap">
          <p className={`text-sm font-medium leading-snug ${task.status !== 'pending' ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-100'}`}>
            {task.title}
          </p>
          {/* Type badge */}
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
            task.type === 'team'
              ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300'
              : 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-300'
          }`}>
            {task.type === 'team' ? 'تیمی' : 'شخصی'}
          </span>
        </div>

        {task.description && (
          <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {/* Status badge */}
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[task.status]}`}>
            {STATUS_LABELS[task.status]}
          </span>
          {/* Assigned to */}
          {assignedMember && (
            <span className="text-[10px] text-gray-400 dark:text-gray-500">
              → {assignedMember.display_name}
            </span>
          )}
        </div>
      </div>

      {/* Delete (manager only) */}
      {canDelete && (
        <button
          onClick={handleDelete}
          disabled={isLeaving}
          title="حذف"
          className="flex-shrink-0 p-1.5 rounded-lg text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  );
}
