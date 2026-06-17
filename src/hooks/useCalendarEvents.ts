import { useState, useCallback, useEffect } from 'react';
import { CalendarEvent } from '../types';
import { loadEvents, saveEvents } from '../utils/storage';
import { generateId } from '../utils/id';
import { now } from '../utils/date';

export function useCalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>(loadEvents);

  useEffect(() => { saveEvents(events); }, [events]);

  const addEvent = useCallback((
    date: string,
    title: string,
    time?: string,
    description?: string
  ) => {
    const ts = now();
    const event: CalendarEvent = {
      id: generateId(),
      date,
      title,
      time,
      description,
      createdAt: ts,
      updatedAt: ts,
    };
    setEvents(prev => [event, ...prev]);
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  }, []);

  const eventsForDate = useCallback(
    (date: string) => events.filter(e => e.date === date),
    [events]
  );

  return { events, addEvent, deleteEvent, eventsForDate };
}
