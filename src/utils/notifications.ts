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

export function sendBrowserNotification(task: Task): void {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return;
  try {
    new Notification(`⏰ یادآوری: ${task.title}`, {
      body: task.time ? `ساعت ${task.time}${task.description ? ` — ${task.description}` : ''}` : (task.description || ''),
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: `task-${task.id}`,
      requireInteraction: false,
      // @ts-ignore — dir is valid in the Notification API but not typed in all TS versions
      dir: 'rtl',
    });
  } catch {
    // Notification constructor blocked in some browser contexts (e.g. non-secure)
  }
}

export function sendTestNotification(): void {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return;
  try {
    new Notification('🔔 یادآور — اعلان آزمایشی', {
      body: 'یادآوری‌های مرورگر با موفقیت فعال هستند ✓',
      icon: '/icons/icon-192.png',
      tag: 'test-notification',
      requireInteraction: false,
    });
  } catch { /* ignore */ }
}

export function shouldFireReminder(task: Task): boolean {
  if (!task.reminderEnabled) return false;
  if (task.completed || task.archived) return false;
  if (!task.time) return false;
  if (task.reminderSentAt) return false;
  return isWithinReminderWindow(task.date, task.time);
}
