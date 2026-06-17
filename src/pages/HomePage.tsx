import React, { useState } from 'react';
import { CalendarCard } from '../components/ui/CalendarCard';
import { ClockCard } from '../components/home/ClockCard';
import { NextTaskCard } from '../components/home/NextTaskCard';
import { TodaySummaryCard } from '../components/home/TodaySummaryCard';
import { useNotes } from '../hooks/useNotes';
import { useCalendarEvents } from '../hooks/useCalendarEvents';
import { Modal } from '../components/ui/Modal';
import { today, formatWeekdayFa, formatShortDateFa, isToday } from '../utils/date';

function NoteModal({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (c: string) => void }) {
  const [content, setContent] = useState('');
  function handleSave() {
    if (!content.trim()) return;
    onSave(content.trim());
    setContent('');
    onClose();
  }
  return (
    <Modal open={open} onClose={() => { setContent(''); onClose(); }} title="یادداشت جدید">
      <div className="flex flex-col gap-4">
        <textarea autoFocus value={content} onChange={e => setContent(e.target.value)} placeholder="یادداشت خود را بنویسید..." rows={5} className="w-full px-3 py-2.5 text-sm rounded-xl glass-surface text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none" />
        <div className="flex gap-3">
          <button onClick={() => { setContent(''); onClose(); }} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300">انصراف</button>
          <button onClick={handleSave} disabled={!content.trim()} className="flex-1 py-2.5 rounded-xl disabled:opacity-40 text-sm font-bold text-white transition-all hover:opacity-90" style={{background: 'linear-gradient(135deg, #c026d3 0%, #7c3aed 100%)'}}>ذخیره</button>
        </div>
      </div>
    </Modal>
  );
}

function EventModal({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (title: string, time?: string) => void }) {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [err, setErr] = useState('');
  const FIELD = 'w-full px-3 py-2.5 text-sm rounded-xl glass-surface text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400';
  function handleSave() {
    if (!title.trim()) { setErr('عنوان الزامی است'); return; }
    onSave(title.trim(), time || undefined);
    setTitle(''); setTime(''); setErr('');
    onClose();
  }
  return (
    <Modal open={open} onClose={() => { setTitle(''); setTime(''); setErr(''); onClose(); }} title="رویداد جدید">
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">عنوان <span className="text-red-500">*</span></label>
          <input autoFocus type="text" value={title} onChange={e => { setTitle(e.target.value); setErr(''); }} placeholder="مثلاً: جلسه کاری" className={FIELD} />
          {err && <p className="mt-1 text-xs text-red-500">{err}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">ساعت (اختیاری)</label>
          <input type="time" value={time} onChange={e => setTime(e.target.value)} className={FIELD} />
        </div>
        <div className="flex gap-3 pt-1">
          <button onClick={() => { setTitle(''); setTime(''); setErr(''); onClose(); }} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300">انصراف</button>
          <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-600 text-sm font-bold text-white transition-colors">افزودن</button>
        </div>
      </div>
    </Modal>
  );
}

export function HomePage() {
  const [selectedDate, setSelectedDate] = useState(today());
  const { addNote, deleteNote, notesForDate } = useNotes();
  const { addEvent, deleteEvent, eventsForDate } = useCalendarEvents();
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);

  const dayNotes = notesForDate(selectedDate);
  const dayEvents = eventsForDate(selectedDate);
  const hasContent = dayNotes.length > 0 || dayEvents.length > 0;
  const selectedIsToday = isToday(selectedDate);

  return (
    <div className="home-page-bg flex flex-col gap-3 pt-2 pb-4">
      {/* Greeting */}
      <div className="home-card-enter" style={{ animationDelay: '0ms' }}>
        <h1 className="text-xl font-black text-gray-900 dark:text-gray-50 tracking-tight px-1">
          سلام 👋
        </h1>
      </div>

      {/* Calendar — selectable */}
      <div className="home-card-enter" style={{ animationDelay: '60ms' }}>
        <CalendarCard
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onAddNote={() => setShowNoteModal(true)}
          onAddEvent={() => setShowEventModal(true)}
        />
      </div>

      {/* Selected day panel — only shown when a non-today day is selected or there's content */}
      {(!selectedIsToday || hasContent) && (
        <div className="home-card-enter glass-surface rounded-2xl px-4 py-4 flex flex-col gap-3" style={{ animationDelay: '90ms' }}>
          {/* Day label */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                {formatWeekdayFa(selectedDate)} {formatShortDateFa(selectedDate)}
              </span>
              {selectedIsToday && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{background: 'linear-gradient(135deg, #c026d3 0%, #7c3aed 100%)'}}>امروز</span>
              )}
            </div>
            <div className="flex gap-1">
              <button onClick={() => setShowNoteModal(true)} className="text-xs text-amber-500 hover:text-amber-600 font-medium px-2 py-1 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors">+ یادداشت</button>
              <button onClick={() => setShowEventModal(true)} className="text-xs text-violet-500 hover:text-violet-600 font-medium px-2 py-1 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-900/10 transition-colors">+ رویداد</button>
            </div>
          </div>

          {/* Events */}
          {dayEvents.length > 0 && (
            <div className="flex flex-col gap-1.5">
              {dayEvents
                .sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''))
                .map(ev => (
                <div key={ev.id} className="flex items-center gap-2 rounded-xl bg-violet-50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-900/30 px-3 py-2">
                  <div className="w-1 h-full min-h-[20px] rounded-full bg-violet-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-100">{ev.title}</span>
                    {ev.time && (
                      <span className="text-[10px] text-violet-500 mr-1.5">
                        {new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(`${ev.date}T${ev.time}:00`))}
                      </span>
                    )}
                  </div>
                  <button onClick={() => deleteEvent(ev.id)} className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Notes */}
          {dayNotes.length > 0 && (
            <div className="flex flex-col gap-1.5">
              {dayNotes.map(note => (
                <div key={note.id} className="flex items-start gap-2 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 px-3 py-2">
                  <svg className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  <p className="flex-1 text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{note.content}</p>
                  <button onClick={() => deleteNote(note.id)} className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Empty state when day selected but no content */}
          {!hasContent && (
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-1">برای این روز رویداد یا یادداشتی ندارید</p>
          )}
        </div>
      )}

      {/* Clock + Next task */}
      <div className="grid grid-cols-2 gap-3 home-card-enter" style={{ animationDelay: '120ms' }}>
        <ClockCard />
        <NextTaskCard />
      </div>

      {/* Today summary */}
      <div className="home-card-enter" style={{ animationDelay: '180ms' }}>
        <TodaySummaryCard />
      </div>

      <NoteModal open={showNoteModal} onClose={() => setShowNoteModal(false)} onSave={c => addNote(selectedDate, c)} />
      <EventModal open={showEventModal} onClose={() => setShowEventModal(false)} onSave={(t, time) => addEvent(selectedDate, t, time)} />
    </div>
  );
}
