import { Task } from '../types';
import { isWithinReminderWindow } from './date';

export function isNotificationSupported(): boolean {
  return 'Notification' in window;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'denied';
  if (Notification.permission !== 'default') return Notification.permission;
  return Notification.requestPermission();
}

export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

const ICON = `${import.meta.env.BASE_URL}icons/icon-192.png`;

async function showNotification(title: string, options: NotificationOptions): Promise<void> {
  // Prefer service worker showNotification (works in PWA/iOS context)
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, options);
      return;
    } catch { /* fall through */ }
  }
  // Fallback to Notification constructor
  try {
    new Notification(title, options);
  } catch { /* ignore */ }
}

export function sendBrowserNotification(task: Task): void {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return;
  showNotification(`⏰ یادآوری: ${task.title}`, {
    body: task.time ? `ساعت ${task.time}${task.description ? ` — ${task.description}` : ''}` : (task.description || ''),
    icon: ICON,
    badge: ICON,
    tag: `task-${task.id}`,
    requireInteraction: false,
    // @ts-ignore
    dir: 'rtl',
  });
}

/** Notify the assignee that a team/personal task was assigned to them. */
export function sendWorkspaceAssignNotification(title: string, byName?: string): void {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return;
  showNotification('📋 وظیفه جدید برای شما', {
    body: byName ? `${byName} وظیفه «${title}» را به شما واگذار کرد` : `وظیفه «${title}» به شما واگذار شد`,
    icon: ICON,
    badge: ICON,
    tag: `ws-assign-${title}`,
    requireInteraction: false,
    // @ts-ignore
    dir: 'rtl',
  });
}

export function sendTestNotification(): void {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return;
  showNotification('🔔 Reminder it — اعلان آزمایشی', {
    body: 'یادآوری‌های مرورگر با موفقیت فعال هستند ✓',
    icon: ICON,
    tag: 'test-notification',
    requireInteraction: false,
  });
}

export function shouldFireReminder(task: Task): boolean {
  if (!task.reminderEnabled) return false;
  if (task.completed || task.archived) return false;
  if (!task.time) return false;
  if (task.reminderSentAt) return false;
  return isWithinReminderWindow(task.date, task.time);
}
