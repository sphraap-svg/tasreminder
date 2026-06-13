import { Task, RecurrenceType } from '../types';
import { generateId } from './id';
import { now, addDays, addWeeks, addMonths } from './date';

function nextDate(dateStr: string, recurrence: RecurrenceType): string | null {
  switch (recurrence) {
    case 'daily':   return addDays(dateStr, 1);
    case 'weekly':  return addWeeks(dateStr, 1);
    case 'monthly': return addMonths(dateStr, 1);
    default:        return null;
  }
}

export function createNextOccurrence(task: Task): Task | null {
  if (task.recurrence === 'none') return null;
  const date = nextDate(task.date, task.recurrence);
  if (!date) return null;

  const ts = now();
  return {
    ...task,
    id: generateId(),
    date,
    completed: false,
    completedAt: null,
    archived: false,
    reminderSentAt: null,
    // keep reminderEnabled only if the task has a time
    reminderEnabled: task.time ? task.reminderEnabled : false,
    createdAt: ts,
    updatedAt: ts,
  };
}

export const RECURRENCE_LABELS: Record<RecurrenceType, string> = {
  none: 'بدون تکرار',
  daily: 'هر روز',
  weekly: 'هر هفته',
  monthly: 'هر ماه',
};
