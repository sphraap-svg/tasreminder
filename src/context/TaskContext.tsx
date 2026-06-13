import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { Task, TaskFormData } from '../types';
import { loadTasks, saveTasks, isSeeded, markSeeded } from '../utils/storage';
import { getSeedData } from '../data/seedData';
import { generateId } from '../utils/id';
import { now, today } from '../utils/date';
import { createNextOccurrence } from '../utils/recurrence';

// ─── Actions ────────────────────────────────────────────────────────────────

type TaskAction =
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'COMPLETE_TASK'; payload: { taskId: string; next: Task | null } }
  | { type: 'RESTORE_TASK'; payload: string }
  | { type: 'DELETE_PERMANENTLY'; payload: string }
  | { type: 'MARK_REMINDER_SENT'; payload: string }
  | { type: 'SET_TASKS'; payload: Task[] };

// ─── Reducer ─────────────────────────────────────────────────────────────────

function taskReducer(state: Task[], action: TaskAction): Task[] {
  const ts = now();

  switch (action.type) {
    case 'ADD_TASK':
      return [action.payload, ...state];

    case 'UPDATE_TASK':
      return state.map(t =>
        t.id === action.payload.id ? { ...action.payload, updatedAt: ts } : t
      );

    case 'DELETE_TASK':
      return state.filter(t => t.id !== action.payload);

    case 'COMPLETE_TASK': {
      const updated = state.map(t =>
        t.id === action.payload.taskId
          ? { ...t, completed: true, archived: true, completedAt: ts, updatedAt: ts }
          : t
      );
      if (action.payload.next) {
        return [action.payload.next, ...updated];
      }
      return updated;
    }

    case 'RESTORE_TASK':
      return state.map(t =>
        t.id === action.payload
          ? { ...t, completed: false, archived: false, completedAt: null, updatedAt: ts }
          : t
      );

    case 'DELETE_PERMANENTLY':
      return state.filter(t => t.id !== action.payload);

    case 'MARK_REMINDER_SENT':
      return state.map(t =>
        t.id === action.payload ? { ...t, reminderSentAt: ts, updatedAt: ts } : t
      );

    case 'SET_TASKS':
      return action.payload;

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface TaskContextValue {
  tasks: Task[];
  addTask: (data: TaskFormData) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  restoreTask: (id: string) => void;
  deletePermanently: (id: string) => void;
  markReminderSent: (id: string) => void;
  seedTasks: () => void;
  clearAll: () => void;
  // Derived slices (memoised)
  activeTasks: Task[];
  todayTasks: Task[];
  archivedTasks: Task[];
  categories: string[];
}

const TaskContext = createContext<TaskContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, dispatch] = useReducer(taskReducer, [], loadTasks);

  // Persist every time tasks change
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  // Seed on first load
  useEffect(() => {
    if (!isSeeded()) {
      dispatch({ type: 'SET_TASKS', payload: getSeedData() });
      markSeeded();
    }
  }, []);

  // ── Mutations ──────────────────────────────────────────────────────────────

  const addTask = useCallback((data: TaskFormData) => {
    const ts = now();
    const task: Task = {
      ...data,
      id: generateId(),
      createdAt: ts,
      updatedAt: ts,
      completedAt: null,
      reminderSentAt: null,
    };
    dispatch({ type: 'ADD_TASK', payload: task });
  }, []);

  const updateTask = useCallback((task: Task) => {
    dispatch({ type: 'UPDATE_TASK', payload: task });
  }, []);

  const deleteTask = useCallback((id: string) => {
    dispatch({ type: 'DELETE_TASK', payload: id });
  }, []);

  const completeTask = useCallback((id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const next = createNextOccurrence(task);
    dispatch({ type: 'COMPLETE_TASK', payload: { taskId: id, next } });
  }, [tasks]);

  const restoreTask = useCallback((id: string) => {
    dispatch({ type: 'RESTORE_TASK', payload: id });
  }, []);

  const deletePermanently = useCallback((id: string) => {
    dispatch({ type: 'DELETE_PERMANENTLY', payload: id });
  }, []);

  const markReminderSent = useCallback((id: string) => {
    dispatch({ type: 'MARK_REMINDER_SENT', payload: id });
  }, []);

  const seedTasks = useCallback(() => {
    dispatch({ type: 'SET_TASKS', payload: getSeedData() });
    markSeeded();
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: 'SET_TASKS', payload: [] });
  }, []);

  // ── Derived slices ─────────────────────────────────────────────────────────

  const activeTasks = useMemo(
    () => tasks.filter(t => !t.archived),
    [tasks]
  );

  const todayTasks = useMemo(
    () => tasks.filter(t => !t.archived && t.date === today()),
    [tasks]
  );

  const archivedTasks = useMemo(
    () => tasks.filter(t => t.archived),
    [tasks]
  );

  const categories = useMemo(() => {
    const cats = tasks
      .map(t => t.category)
      .filter((c): c is string => Boolean(c));
    return [...new Set(cats)].sort();
  }, [tasks]);

  const value: TaskContextValue = {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    restoreTask,
    deletePermanently,
    markReminderSent,
    seedTasks,
    clearAll,
    activeTasks,
    todayTasks,
    archivedTasks,
    categories,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be inside TaskProvider');
  return ctx;
}
