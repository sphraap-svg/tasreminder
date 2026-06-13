import { Task } from '../types';
import { isWithinReminderWindow } from './date';

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission !== 'default') return Notification.permission;
  return Notification.requestPermission();
}

export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) return 'denied';
  return Notification.permission;
}

export function sendBrowserNotification(task: Task): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    new Notification(`⏰ یادآوری: ${task.title}`, {
      body: task.description || (task.time ? `ساعت ${task.time}` : ''),
      icon: '/icons/icon-192.png',
      tag: `task-${task.id}`,
      requireInteraction: false,
    });
  } catch {
    // Some browsers restrict Notification construction
  }
}

export function shouldFireReminder(task: Task): boolean {
  if (!task.reminderEnabled) return false;
  if (task.completed || task.archived) return false;
  if (!task.time) return false;
  if (task.reminderSentAt) return false; // already fired
  return isWithinReminderWindow(task.date, task.time);
}
