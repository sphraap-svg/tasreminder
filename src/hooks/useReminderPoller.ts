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

  // ── Scheduled notifications (Notification Triggers API) ─────────────────────
  // On supporting engines (Chromium / Android) this fires the reminder at the
  // exact time even when the app is fully closed — no server needed. Unsupported
  // engines (iOS Safari, Firefox) silently fall back to the foreground poller.
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    // @ts-ignore — feature detection
    if (typeof window.TimestampTrigger === 'undefined') return;
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    let active = true;
    const ICON = `${import.meta.env.BASE_URL}icons/icon-192.png`;

    navigator.serviceWorker.ready.then(async (reg) => {
      if (!active) return;
      // Clear previously scheduled (not-yet-fired) reminders we manage, then
      // re-schedule from the current task list so add/edit/complete stay in sync.
      try {
        const pending = await reg.getNotifications({ includeTriggered: false } as any);
        pending.forEach(n => { if (n.tag?.startsWith('reminder-')) n.close(); });
      } catch { /* ignore */ }

      const nowMs = Date.now();
      for (const task of tasks) {
        if (!task.reminderEnabled || task.completed || task.archived || !task.time) continue;
        const ts = new Date(`${task.date}T${task.time}:00`).getTime();
        if (isNaN(ts) || ts <= nowMs) continue;
        try {
          await reg.showNotification(`⏰ یادآوری: ${task.title}`, {
            tag: `reminder-${task.id}`,
            body: task.description || `ساعت ${task.time}`,
            icon: ICON, badge: ICON,
            data: { url: `${import.meta.env.BASE_URL}` },
            // @ts-ignore — Notification Triggers
            showTrigger: new window.TimestampTrigger(ts),
            // @ts-ignore
            dir: 'rtl',
          });
        } catch { /* ignore */ }
      }
    }).catch(() => { /* ignore */ });

    return () => { active = false; };
  }, [tasks]);
}
