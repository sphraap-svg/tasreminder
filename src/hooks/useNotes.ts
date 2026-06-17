import { useState, useCallback, useEffect } from 'react';
import { Note } from '../types';
import { loadNotes, saveNotes } from '../utils/storage';
import { generateId } from '../utils/id';
import { now } from '../utils/date';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>(loadNotes);

  useEffect(() => { saveNotes(notes); }, [notes]);

  const addNote = useCallback((date: string, content: string) => {
    const ts = now();
    const note: Note = { id: generateId(), date, content, createdAt: ts, updatedAt: ts };
    setNotes(prev => [note, ...prev]);
  }, []);

  const updateNote = useCallback((id: string, content: string) => {
    setNotes(prev =>
      prev.map(n => n.id === id ? { ...n, content, updatedAt: now() } : n)
    );
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  }, []);

  const notesForDate = useCallback(
    (date: string) => notes.filter(n => n.date === date),
    [notes]
  );

  return { notes, addNote, updateNote, deleteNote, notesForDate };
}
