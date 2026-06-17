import React, { useState } from 'react';
import { CalendarCard } from '../components/ui/CalendarCard';
import { useTasks } from '../context/TaskContext';
import { useNotes } from '../hooks/useNotes';
import { useCalendarEvents } from '../hooks/useCalendarEvents';
import { TaskForm } from '../components/tasks/TaskForm';
import { TaskFormData } from '../types';
import { today, formatWeekdayFa, formatShortDateFa, isToday } from '../utils/date';
import { Modal } from '../components/ui/Modal';

// ── Mini modal for notes ──────────────────────────────────────────────────────
function NoteModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (content: string) => void;
}) {
  const [content, setContent] = useState('');

  function handleSave() {
    if (!content.trim()) return;
    onSave(content.trim());
    setContent('');
    onClose();
  }

  function handleClose() {
    setContent('');
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title="یادداشت جدید">
      <div className="flex flex-col gap-4">
        <textarea
          autoFocus
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="یادداشت خود را بنویسید..."
          rows={5}
          className="w-full px-3 py-2.5 text-sm rounded-xl glass-surface text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
        />
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            انصراف
          </button>
          <button
            onClick={handleSave}
            disabled={!content.trim()}
            className="flex-1 py-2.5 rounded-xl disabled:opacity-40 text-sm font-bold text-white transition-all hover:opacity-90"
            style={{background: 'linear-gradient(135deg, #c026d3 0%, #7c3aed 100%)'}}
          >
            ذخیره
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Mini modal for events ─────────────────────────────────────────────────────
function EventModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (title: string, time?: string, description?: string) => void;
}) {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  function handleSave() {
    if (!title.trim()) { setError('عنوان رویداد الزامی است'); return; }
    onSave(title.trim(), time || undefined, description.trim() || undefined);
    setTitle(''); setTime(''); setDescription(''); setError('');
    onClose();
  }

  function handleClose() {
    setTitle(''); setTime(''); setDescription(''); setError('');
    onClose();
  }

  const FIELD = 'w-full px-3 py-2.5 text-sm rounded-xl glass-surface text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400 transition-shadow';

  return (
    <Modal open={open} onClose={handleClose} title="رویداد جدید">
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            عنوان <span className="text-red-500">*</span>
          </label>
          <input
            autoFocus
            type="text"
            value={title}
            onChange={e => { setTitle(e.target.value); setError(''); }}
            placeholder="مثلاً: جلسه کاری"
            className={FIELD}
          />
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            ساعت (اختیاری)
          </label>
          <input type="time" value={time} onChange={e => setTime(e.target.value)} className={FIELD} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            توضیحات (اختیاری)
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="جزئیات بیشتر..."
            rows={2}
            className={`${FIELD} resize-none`}
          />
        </div>
        <div className="flex gap-3 pt-1">
          <button
            onClick={handleClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            انصراف
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-600 text-sm font-bold text-white transition-colors"
          >
            افزودن رویداد
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Main CalendarPage ─────────────────────────────────────────────────────────
export function CalendarPage() {
  const { tasks, addTask, completeTask, deleteTask } = useTasks();
  const { addNote, deleteNote, notesForDate } = useNotes();
  const { addEvent, deleteEvent, eventsForDate } = useCalendarEvents();

  const [selectedDate, setSelectedDate] = useState(today());
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);

  const dayTasks = tasks.filter(t => !t.archived && t.date === selectedDate);
  const dayNotes = notesForDate(selectedDate);
  const dayEvents = eventsForDate(selectedDate);

  const selectedIsToday = isToday(selectedDate);
  const selectedIsPast = selectedDate < today();

  function handleAddTask(data: TaskFormData) {
    addTask({ ...data, date: selectedDate });
  }

  const dayLabel = `${formatWeekdayFa(selectedDate)} ${formatShortDateFa(selectedDate)}`;

  return (
    <div className="flex flex-col gap-4 pt-4 pb-6">
      {/* Calendar widget */}
      <CalendarCard
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        onAddNote={() => setShowNoteModal(true)}
        onAddEvent={() => setShowEventModal(true)}
      />

      {/* Selected day header */}
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-gray-800 dark:text-gray-200">{dayLabel}</h2>
          {selectedIsToday && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{background: 'linear-gradient(135deg, #c026d3 0%, #7c3aed 100%)'}}>امروز</span>
          )}
          {selectedIsPast && !selectedIsToday && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400">گذشته</span>
          )}
        </div>
        <button
          onClick={() => setShowTaskForm(true)}
          className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl text-white transition-all hover:opacity-90"
          style={{background: 'linear-gradient(135deg, #c026d3 0%, #7c3aed 100%)'}}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          وظیفه جدید
        </button>
      </div>

      {/* Tasks section */}
      <section>
        <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">وظایف</h3>
        {dayTasks.length === 0 ? (
          <div className="glass-surface rounded-2xl px-4 py-5 text-center" style={{borderStyle: 'dashed'}}>
            <p className="text-sm text-gray-600 dark:text-gray-300">وظیفه‌ای برای این روز ثبت نشده</p>
            <button
              onClick={() => setShowTaskForm(true)}
              className="mt-2 text-xs text-violet-600 hover:text-violet-700 dark:text-violet-400 font-medium"
            >
              + افزودن وظیفه
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {dayTasks.map(t => (
              <div
                key={t.id}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 glass-surface ${
                  t.completed ? 'opacity-60' : ''
                }`}
              >
                {/* Complete toggle */}
                <button
                  onClick={() => completeTask(t.id)}
                  disabled={t.completed}
                  className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                    t.completed
                      ? 'border-emerald-400 bg-emerald-400'
                      : 'border-gray-300 dark:border-gray-600 hover:border-violet-500'
                  }`}
                >
                  {t.completed && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${t.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-100'}`}>
                    {t.title}
                  </p>
                  {t.time && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit', hour12: false }).format(
                        new Date(`${t.date}T${t.time}:00`)
                      )}
                    </p>
                  )}
                </div>

                {/* Priority dot */}
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  t.priority === 'high' ? 'bg-red-400' :
                  t.priority === 'medium' ? 'bg-amber-400' : 'bg-green-400'
                }`} />

                {/* Delete */}
                <button
                  onClick={() => deleteTask(t.id)}
                  className="text-gray-300 dark:text-gray-600 hover:text-red-400 transition-colors flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Events section */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">رویدادها</h3>
          <button
            onClick={() => setShowEventModal(true)}
            className="text-xs text-violet-500 hover:text-violet-600 font-medium"
          >
            + رویداد جدید
          </button>
        </div>
        {dayEvents.length === 0 ? (
          <div className="glass-surface rounded-2xl px-4 py-4 text-center" style={{borderStyle: 'dashed'}}>
            <p className="text-sm text-gray-600 dark:text-gray-300">رویدادی ثبت نشده</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {dayEvents
              .sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''))
              .map(ev => (
              <div
                key={ev.id}
                className="flex items-start gap-3 rounded-2xl border border-violet-100 dark:border-violet-900/40 bg-violet-50/60 dark:bg-violet-900/10 px-4 py-3"
              >
                <div className="w-1 self-stretch rounded-full bg-violet-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{ev.title}</p>
                  {ev.time && (
                    <p className="text-xs text-violet-500 dark:text-violet-400 mt-0.5">
                      {new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit', hour12: false }).format(
                        new Date(`${ev.date}T${ev.time}:00`)
                      )}
                    </p>
                  )}
                  {ev.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{ev.description}</p>
                  )}
                </div>
                <button
                  onClick={() => deleteEvent(ev.id)}
                  className="text-gray-300 dark:text-gray-600 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Notes section */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">یادداشت‌ها</h3>
          <button
            onClick={() => setShowNoteModal(true)}
            className="text-xs text-amber-500 hover:text-amber-600 font-medium"
          >
            + یادداشت جدید
          </button>
        </div>
        {dayNotes.length === 0 ? (
          <div className="glass-surface rounded-2xl px-4 py-4 text-center" style={{borderStyle: 'dashed'}}>
            <p className="text-sm text-gray-600 dark:text-gray-300">یادداشتی برای این روز وجود ندارد</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {dayNotes.map(note => (
              <div
                key={note.id}
                className="flex items-start gap-3 rounded-2xl border border-amber-100 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-900/10 px-4 py-3"
              >
                <svg className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <p className="flex-1 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{note.content}</p>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="text-gray-300 dark:text-gray-600 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modals */}
      <TaskForm
        open={showTaskForm}
        onClose={() => setShowTaskForm(false)}
        onSubmit={handleAddTask}
        defaultDate={selectedDate}
      />
      <NoteModal
        open={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        onSave={(content) => addNote(selectedDate, content)}
      />
      <EventModal
        open={showEventModal}
        onClose={() => setShowEventModal(false)}
        onSave={(title, time, description) => addEvent(selectedDate, title, time, description)}
      />
    </div>
  );
}
