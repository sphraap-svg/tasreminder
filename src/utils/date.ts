import dayjs from 'dayjs';

export function today(): string {
  return dayjs().format('YYYY-MM-DD');
}

export function now(): string {
  return new Date().toISOString();
}

export function formatDateFa(dateStr: string): string {
  try {
    const date = new Date(dateStr + 'T12:00:00');
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function formatShortDateFa(dateStr: string): string {
  try {
    const date = new Date(dateStr + 'T12:00:00');
    return new Intl.DateTimeFormat('fa-IR', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function formatWeekdayFa(dateStr: string): string {
  try {
    const date = new Date(dateStr + 'T12:00:00');
    return new Intl.DateTimeFormat('fa-IR', { weekday: 'long' }).format(date);
  } catch {
    return dateStr;
  }
}

export function formatTimeFa(timeStr: string): string {
  try {
    const [h, m] = timeStr.split(':');
    const date = new Date();
    date.setHours(Number(h), Number(m), 0, 0);
    return new Intl.DateTimeFormat('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return timeStr;
  }
}

export function formatTodayHeaderFa(): string {
  return new Intl.DateTimeFormat('fa-IR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());
}

export function isToday(dateStr: string): boolean {
  return dateStr === today();
}

export function isPast(dateStr: string): boolean {
  return dateStr < today();
}

export function isFuture(dateStr: string): boolean {
  return dateStr > today();
}

export function addDays(dateStr: string, days: number): string {
  return dayjs(dateStr).add(days, 'day').format('YYYY-MM-DD');
}

export function addWeeks(dateStr: string, weeks: number): string {
  return dayjs(dateStr).add(weeks, 'week').format('YYYY-MM-DD');
}

export function addMonths(dateStr: string, months: number): string {
  return dayjs(dateStr).add(months, 'month').format('YYYY-MM-DD');
}

// Returns 7 dates starting from the nearest Saturday (Persian week: Sat→Fri)
export function getWeekDays(weekOffset: number = 0): string[] {
  const d = dayjs();
  const dow = d.day(); // 0=Sun … 6=Sat
  const daysToLastSat = (dow + 1) % 7;
  const startOfWeek = d.subtract(daysToLastSat, 'day').add(weekOffset * 7, 'day');
  return Array.from({ length: 7 }, (_, i) =>
    startOfWeek.add(i, 'day').format('YYYY-MM-DD')
  );
}

export function getWeekLabel(weekOffset: number = 0): string {
  const days = getWeekDays(weekOffset);
  const start = formatShortDateFa(days[0]);
  const end = formatShortDateFa(days[6]);
  if (weekOffset === 0) return `این هفته  •  ${start} تا ${end}`;
  if (weekOffset === -1) return `هفته گذشته  •  ${start} تا ${end}`;
  if (weekOffset === 1) return `هفته آینده  •  ${start} تا ${end}`;
  return `${start} تا ${end}`;
}

export function isTimeReached(dateStr: string, timeStr: string): boolean {
  const taskDateTime = new Date(`${dateStr}T${timeStr}:00`);
  return new Date() >= taskDateTime;
}

export function isWithinReminderWindow(dateStr: string, timeStr: string): boolean {
  const taskDateTime = new Date(`${dateStr}T${timeStr}:00`);
  if (isNaN(taskDateTime.getTime())) return false;
  const now = new Date();
  const diffMs = now.getTime() - taskDateTime.getTime();
  // Fire from 5 minutes before up to 2 hours after task time
  return diffMs >= -5 * 60 * 1000 && diffMs <= 2 * 60 * 60 * 1000;
}
