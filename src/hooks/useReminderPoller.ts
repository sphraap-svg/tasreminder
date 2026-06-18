import { useEffect } from 'react';
import { useTasks } from '../context/TaskContext';
import { useToast } from '../context/ToastContext';
import { shouldFireReminder, sendBrowserNotification } from '../utils/notifications';

const POLL_INTERVAL_MS = 30_000; // check every 30 seconds

export function useReminderPoller() {
  const { tasks, markReminderSent } = useTasks();
  const { addToast } = useToast();

  useEffect(() => {
    function check() {
      tasks.forEach(task => {
        if (shouldFireReminder(task)) {
          // In-app toast
          addToast(`⏰ یادآوری: ${task.title}`, 'info');
          // Browser notification (if permission granted)
          sendBrowserNotification(task);
          // Mark so it doesn't fire again
          markReminderSent(task.id);
        }
      });
    }

    check(); // immediate check on mount / tasks change
    const id = setInterval(check, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks]);
}
