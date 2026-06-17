export type TaskPriority = 'low' | 'medium' | 'high';
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly';
export type ThemeMode = 'light' | 'dark' | 'system';
export type ToastType = 'success' | 'error' | 'info' | 'warning';
export type FilterType =
  | 'all'
  | 'incomplete'
  | 'completed'
  | 'priority_high'
  | 'priority_medium'
  | 'priority_low';

export interface Note {
  id: string;
  date: string; // YYYY-MM-DD
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD (Gregorian, stored internally)
  time?: string; // HH:mm
  priority: TaskPriority;
  category?: string;
  tags: string[];
  completed: boolean;
  completedAt?: string | null;
  archived: boolean;
  recurrence: RecurrenceType;
  reminderEnabled: boolean;
  reminderSentAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

export interface AppSettings {
  theme: ThemeMode;
}

export type TaskFormData = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt' | 'reminderSentAt'>;
