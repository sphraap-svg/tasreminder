import { Task, AppSettings, Note, CalendarEvent } from '../types';

const KEYS = {
  TASKS: 'yadadavar_tasks',
  SETTINGS: 'yadadavar_settings',
  SEEDED: 'yadadavar_seeded',
  NOTES: 'yadadavar_notes',
  EVENTS: 'yadadavar_events',
} as const;

function safeGet<T>(key: string, fallback: T, validate?: (v: unknown) => boolean): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (validate && !validate(parsed)) return fallback;
    return parsed as T;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full — silently ignore in MVP
  }
}

export function loadTasks(): Task[] {
  return safeGet<Task[]>(KEYS.TASKS, [], Array.isArray);
}

export function saveTasks(tasks: Task[]): void {
  safeSet(KEYS.TASKS, tasks);
}

const DEFAULT_SETTINGS: AppSettings = { theme: 'system' };

export function loadSettings(): AppSettings {
  return safeGet<AppSettings>(KEYS.SETTINGS, DEFAULT_SETTINGS);
}

export function saveSettings(settings: AppSettings): void {
  safeSet(KEYS.SETTINGS, settings);
}

export function isSeeded(): boolean {
  return localStorage.getItem(KEYS.SEEDED) === 'true';
}

export function markSeeded(): void {
  localStorage.setItem(KEYS.SEEDED, 'true');
}

export function loadNotes(): Note[] {
  return safeGet<Note[]>(KEYS.NOTES, [], Array.isArray);
}

export function saveNotes(notes: Note[]): void {
  safeSet(KEYS.NOTES, notes);
}

export function loadEvents(): CalendarEvent[] {
  return safeGet<CalendarEvent[]>(KEYS.EVENTS, [], Array.isArray);
}

export function saveEvents(events: CalendarEvent[]): void {
  safeSet(KEYS.EVENTS, events);
}

export function clearAllData(): void {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
}
