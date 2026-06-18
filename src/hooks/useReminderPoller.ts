import { useEffect, useRef } from 'react';
import { useTasks } from '../context/TaskContext';
import { useToast } from '../context/ToastContext';
import { shouldFireReminder, sendBrowserNotification } from '../utils/notifications';

const POLL_INTERVAL_MS = 30_000;

export function useReminderPoller() {
  const { tasks, markReminderSent } = useTasks();
  const { addToast } = useToast();

  // keep latest refs so the interval closure always sees current values
  const tasksRef = useRef(tasks);
  const markRef = useRef(markReminderSent);
  const toastRef = useRef(addToast);

  useEffect(() => { tasksRef.current = tasks; }, [tasks]);
  useEffect(() => { markRef.current = markReminderSent; }, [markReminderSent]);
  useEffect(() => { toastRef.current = addToast; }, [addToast]);

  useEffect(() => {
    function check() {
      tasksRef.current.forEach(task => {
        if (shouldFireReminder(task)) {
          markRef.current(task.id);
          toastRef.current(`⏰ یادآوری: ${task.title}`, 'info');
          sendBrowserNotification(task);
        }
      });
    }

    check();
    const id = setInterval(check, POLL_INTERVAL_MS);

    // Mobile browsers freeze setInterval while the tab is backgrounded, so a
    // reminder whose time passed while the app was hidden never fires. Re-check
    // the moment the user returns to (or refocuses) the app — this catches up
    // any reminder still inside its window.
    const onVisible = () => { if (document.visibilityState === 'visible') check(); };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', check);

    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', check);
    };
  }, []); // stable interval — never resets
}
