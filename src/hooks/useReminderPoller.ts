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
    return () => clearInterval(id);
  }, []); // stable interval — never resets
}
