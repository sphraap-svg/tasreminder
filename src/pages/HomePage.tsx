import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { useToast } from '../context/ToastContext';
import { useDesk } from '../hooks/useDesk';
import { today, formatShortDateFa, formatWeekdayFa } from '../utils/date';
import { Task } from '../types';
import { TaskForm } from '../components/tasks/TaskForm';
import { useNavigate } from 'react-router-dom';

type HomeTab = 'today' | 'desk' | 'weekly' | 'all';

// ─── Priority helpers ────────────────────────────────────────────────────────

const PRIORITY_FA: Record<string, string> = { high: 'بالا', medium: 'متوسط', low: 'پایین' };
const PRIORITY_CLASS: Record<string, string> = {
  high: 'priority-high',
  medium: 'priority-medium',
  low: 'priority-low',
};

// ─── Icons ───────────────────────────────────────────────────────────────────

function ClockIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

function CheckIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function PencilIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

// ─── Featured Task Card (big blue card) ──────────────────────────────────────

interface FeaturedTaskCardProps {
  task: Task;
  onComplete: () => void;
  onEdit: () => void;
  stackCount: number;
}

function FeaturedTaskCard({ task, onComplete, onEdit, stackCount }: FeaturedTaskCardProps) {
  const [completing, setCompleting] = useState(false);

  const timeLabel = task.time
    ? new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit', hour12: true }).format(
        new Date(`${task.date}T${task.time}:00`)
      )
    : null;

  function handleComplete() {
    if (completing) return;
    setCompleting(true);
    setTimeout(() => {
      onComplete();
      setCompleting(false);
    }, 380);
  }

  return (
    <div
      className="relative"
      style={{ paddingTop: stackCount >= 2 ? '44px' : stackCount === 1 ? '22px' : '0' }}
    >
      {/* Ghost cards — inside the paddingTop area, no negative translateY */}
      {stackCount >= 2 && (
        <div
          className={`featured-stack-ghost-2 absolute inset-x-3 ${completing ? 'ghost-to-front' : ''}`}
          style={{ height: '88px', top: '0px' }}
        />
      )}
      {stackCount >= 1 && (
        <div
          className={`featured-stack-ghost absolute inset-x-1.5 ${completing ? 'ghost-to-front' : ''}`}
          style={{ height: '88px', top: '11px', animationDelay: '50ms' }}
        />
      )}

      {/* Main card */}
      <div
        className={`featured-task-card p-6 home-card-enter ${completing ? 'featured-card-to-back' : ''}`}
        style={{ animationDelay: completing ? '0ms' : '80ms' }}
      >
        {/* Row 1: priority + time */}
        <div className="flex items-center justify-between mb-5" dir="rtl">
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${PRIORITY_CLASS[task.priority] || 'priority-medium'} bg-white/20 !text-white`}>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd"/></svg>
            {PRIORITY_FA[task.priority] || 'متوسط'}
          </span>

          {timeLabel && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold text-white/90" style={{ background: 'rgba(255,255,255,0.18)' }}>
              <ClockIcon />
              <span>{timeLabel}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h2
          className="text-2xl font-black text-white leading-snug mb-7"
          dir="rtl"
          style={{ fontFamily: '"Vazirmatn", system-ui, sans-serif', letterSpacing: '-0.01em' }}
        >
          {task.title}
        </h2>

        {/* Bottom: slide-to-done + edit */}
        <div className="flex items-center gap-3" dir="rtl">
          <button
            onClick={handleComplete}
            disabled={completing}
            className="slide-to-done-track flex-1 flex items-center gap-2.5 px-2 py-2 text-white text-sm font-semibold disabled:opacity-70"
            dir="rtl"
          >
            <span
              className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-transform ${completing ? 'scale-90' : ''}`}
              style={{ background: 'rgba(255,255,255,0.95)' }}
            >
              {completing
                ? <svg className="w-4 h-4 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                : <CheckIcon className="w-4 h-4 text-blue-600" />
              }
            </span>
            <span className="flex-1 text-right text-sm text-white/90">
              {completing ? 'در حال ثبت…' : 'بکش تا تموم بشه'}
            </span>
            {!completing && <span className="text-white/40 text-base tracking-widest">›››</span>}
          </button>

          <button
            onClick={onEdit}
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.95)' }}
            aria-label="ویرایش"
          >
            <PencilIcon className="w-4 h-4 text-blue-600" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Mini Task Row ────────────────────────────────────────────────────────────

function MiniTaskCard({ task, onComplete }: { task: Task; onComplete: () => void }) {
  const timeLabel = task.time
    ? new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit', hour12: true }).format(
        new Date(`${task.date}T${task.time}:00`)
      )
    : null;

  return (
    <div className="mini-task-card flex items-center gap-3 px-4 py-3.5" dir="rtl">
      <button
        onClick={onComplete}
        className="w-6 h-6 rounded-full border-2 border-blue-300 flex items-center justify-center flex-shrink-0 hover:bg-blue-500 hover:border-blue-500 transition-colors group"
        aria-label="انجام شد"
      >
        <CheckIcon className="w-3 h-3 text-transparent group-hover:text-white" />
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{task.title}</p>
        {timeLabel && (
          <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-0.5">
            <ClockIcon className="w-3 h-3" />
            {timeLabel}
          </p>
        )}
      </div>
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PRIORITY_CLASS[task.priority]}`}>
        {PRIORITY_FA[task.priority]}
      </span>
    </div>
  );
}

// ─── Desk Section ─────────────────────────────────────────────────────────────

function DeskSection({ workspace, onGoToDesk }: { workspace: ReturnType<typeof useDesk>['workspace']; onGoToDesk: () => void }) {
  if (!workspace) {
    return (
      <div className="mini-task-card p-5 flex flex-col items-center gap-3 text-center">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #E8EFFE 0%, #DBEAFE 100%)' }}>
          <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-800 dark:text-gray-100">میزکار پیکربندی نشده</p>
          <p className="text-xs text-gray-400 mt-1">برای دسترسی به وظایف تیمی، میزکار بساز یا بهش بپیوند</p>
        </div>
        <button
          onClick={onGoToDesk}
          className="px-4 py-2 rounded-xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #1848F5 0%, #0A2ACC 100%)' }}
        >
          رفتن به میزکار
        </button>
      </div>
    );
  }

  const pendingTasks = workspace.tasks?.filter(t => t.status !== 'done') ?? [];

  return (
    <div className="flex flex-col gap-2">
      {/* Workspace header */}
      <div className="flex items-center justify-between px-1" dir="rtl">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs font-black" style={{ background: 'linear-gradient(135deg, #1848F5 0%, #0A2ACC 100%)' }}>
            {workspace.name[0]}
          </div>
          <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{workspace.name}</span>
          {pendingTasks.length > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full text-blue-600 dark:text-blue-300" style={{ background: 'rgba(24,72,245,0.10)' }}>
              {pendingTasks.length} وظیفه
            </span>
          )}
        </div>
        <button onClick={onGoToDesk} className="text-xs text-blue-500 font-medium">مشاهده همه</button>
      </div>

      {pendingTasks.length === 0 ? (
        <div className="mini-task-card p-4 text-center">
          <p className="text-sm text-gray-400">همه وظایف انجام شده</p>
        </div>
      ) : (
        pendingTasks.slice(0, 5).map(t => (
          <div key={t.id} className="mini-task-card flex items-center gap-3 px-4 py-3.5" dir="rtl">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${t.status === 'done' ? 'bg-green-500' : 'bg-gray-300'}`} />
            <p className="flex-1 text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{t.title}</p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-blue-600 dark:text-blue-300" style={{ background: 'rgba(24,72,245,0.08)' }}>
              {t.status === 'done' ? 'انجام شده' : 'در انتظار'}
            </span>
          </div>
        ))
      )}
    </div>
  );
}

// ─── Weekly Tasks Section ─────────────────────────────────────────────────────

function WeeklySection({ tasks, onComplete, onAdd }: { tasks: Task[]; onComplete: (id: string) => void; onAdd: () => void }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1" dir="rtl">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-800 dark:text-gray-100">وظایف هفتگی</span>
          {tasks.length > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full text-blue-600 dark:text-blue-300" style={{ background: 'rgba(24,72,245,0.10)' }}>
              {tasks.length}
            </span>
          )}
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 text-xs text-blue-500 font-bold px-2 py-1 rounded-lg transition-colors"
          style={{ background: 'rgba(24,72,245,0.07)' }}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          افزودن
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="mini-task-card p-5 flex flex-col items-center gap-2 text-center">
          <p className="text-sm text-gray-400">هیچ وظیفه هفتگی ست نشده</p>
          <button
            onClick={onAdd}
            className="text-xs font-bold text-blue-500"
          >
            + اضافه کن
          </button>
        </div>
      ) : (
        tasks.map(task => (
          <MiniTaskCard key={task.id} task={task} onComplete={() => onComplete(task.id)} />
        ))
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function HomePage() {
  const [activeTab, setActiveTab] = useState<HomeTab>('today');
  const [showAddTask, setShowAddTask] = useState(false);
  const [addWeeklyDefault, setAddWeeklyDefault] = useState(false);

  const { todayTasks, activeTasks, addTask, completeTask } = useTasks();
  const { addToast } = useToast();
  const { workspace } = useDesk();
  const navigate = useNavigate();

  const todayStr = today();
  const todayActive = todayTasks.filter(t => !t.completed);
  const weeklyTasks = activeTasks.filter(t => t.recurrence === 'weekly' && !t.completed);
  const allActive = activeTasks.filter(t => !t.completed);

  const deskPending = workspace?.tasks?.filter(t => t.status !== 'done') ?? [];

  const tabs: { key: HomeTab; label: string; count: number }[] = [
    { key: 'today', label: 'امروز', count: todayActive.length },
    { key: 'desk', label: workspace?.name || 'میزکار', count: deskPending.length },
    { key: 'weekly', label: 'هفتگی', count: weeklyTasks.length },
    { key: 'all', label: 'همه', count: allActive.length },
  ];

  // Which tasks are shown as featured/list for task-based tabs
  const displayTasks: Task[] =
    activeTab === 'today' ? todayActive
    : activeTab === 'weekly' ? weeklyTasks
    : activeTab === 'all' ? allActive
    : [];

  // Sort: high priority first, then by time
  const sorted = [...displayTasks].sort((a, b) => {
    const pOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
    const diff = (pOrder[a.priority] ?? 1) - (pOrder[b.priority] ?? 1);
    if (diff !== 0) return diff;
    return (a.time ?? '99:99').localeCompare(b.time ?? '99:99');
  });

  const featuredTask = sorted[0];
  const restTasks = sorted.slice(1, 5);
  const extraCount = sorted.length - 5;

  function handleComplete(id: string) {
    completeTask(id);
    addToast('وظیفه انجام شد ✓', 'success');
  }

  function handleAddTask() {
    setAddWeeklyDefault(false);
    setShowAddTask(true);
  }

  function handleAddWeekly() {
    setAddWeeklyDefault(true);
    setShowAddTask(true);
  }

  const weekdayLabel = formatWeekdayFa(todayStr);
  const dateLabel = formatShortDateFa(todayStr);

  return (
    <div className="flex flex-col gap-5 pt-4 pb-28" dir="rtl">

      {/* ── Greeting card ── */}
      <div
        className="home-card-enter home-card px-5 py-4 flex items-center justify-between"
        style={{ animationDelay: '0ms' }}
      >
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
            {weekdayLabel}، {dateLabel}
          </p>
          <h1
            className="text-2xl font-black text-gray-900 dark:text-gray-50 mt-0.5 leading-tight"
            style={{ fontFamily: '"Vazirmatn", system-ui, sans-serif' }}
          >
            سلام،{' '}
            <span className="text-blue-600 dark:text-blue-400">امروزت</span>{' '}
            چطوره؟
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-2xl flex items-center justify-center text-gray-500 dark:text-gray-400 glass-surface hover:text-blue-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Filter tabs ── */}
      <div
        className="home-card-enter flex gap-2 overflow-x-auto scrollbar-hide"
        style={{ animationDelay: '40ms' }}
        dir="rtl"
      >
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
              activeTab === tab.key ? 'tab-chip-active' : 'tab-chip-inactive'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-xs font-black ${activeTab === tab.key ? 'text-blue-100' : 'text-gray-400'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Desk tab ── */}
      {activeTab === 'desk' && (
        <div className="home-card-enter" style={{ animationDelay: '80ms' }}>
          <DeskSection workspace={workspace} onGoToDesk={() => navigate('/desk')} />
        </div>
      )}

      {/* ── Weekly tab ── */}
      {activeTab === 'weekly' && (
        <div className="home-card-enter" style={{ animationDelay: '80ms' }}>
          <WeeklySection tasks={weeklyTasks} onComplete={handleComplete} onAdd={handleAddWeekly} />
        </div>
      )}

      {/* ── Today / All tabs: featured card + list ── */}
      {(activeTab === 'today' || activeTab === 'all') && (
        <>
          {featuredTask ? (
            <div className="home-card-enter" style={{ animationDelay: '80ms' }}>
              <FeaturedTaskCard
                task={featuredTask}
                stackCount={Math.min(restTasks.length, 2)}
                onComplete={() => handleComplete(featuredTask.id)}
                onEdit={() => navigate('/today')}
              />
            </div>
          ) : (
            <div className="home-card-enter mini-task-card p-6 flex flex-col items-center gap-3 text-center" style={{ animationDelay: '80ms' }}>
              <div className="w-14 h-14 rounded-3xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #E8EFFE 0%, #DBEAFE 100%)' }}>
                <CheckIcon className="w-7 h-7 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                  {activeTab === 'today' ? 'امروز کاری نداری' : 'همه وظایف انجام شده!'}
                </p>
                <p className="text-xs text-gray-400 mt-1">از دکمه + وظیفه اضافه کن</p>
              </div>
            </div>
          )}

          {/* Rest tasks list */}
          {restTasks.length > 0 && (
            <div className="home-card-enter flex flex-col gap-2" style={{ animationDelay: '140ms' }}>
              {restTasks.map((task, i) => (
                <div key={task.id} style={{ animationDelay: `${140 + i * 40}ms` }}>
                  <MiniTaskCard task={task} onComplete={() => handleComplete(task.id)} />
                </div>
              ))}

              {extraCount > 0 && (
                <button
                  onClick={() => navigate(activeTab === 'today' ? '/today' : '/today')}
                  className="mini-task-card flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-bold text-blue-600 dark:text-blue-400"
                >
                  <span>{extraCount} وظیفه دیگه</span>
                  <ArrowLeftIcon />
                </button>
              )}
            </div>
          )}

          {/* Quick link to all today tasks */}
          {featuredTask && (
            <button
              onClick={() => navigate('/today')}
              className="home-card-enter flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold text-blue-600 dark:text-blue-400 glass-surface"
              style={{ animationDelay: '200ms' }}
              dir="rtl"
            >
              <span>مشاهده همه وظایف</span>
              <ArrowLeftIcon />
            </button>
          )}
        </>
      )}

      {/* ── FAB: Add task ── */}
      <button
        onClick={handleAddTask}
        className="home-fab fixed bottom-24 left-4 w-14 h-14 rounded-full flex items-center justify-center text-white z-30 md:bottom-8"
        aria-label="افزودن وظیفه"
      >
        <PlusIcon />
      </button>

      {/* ── Task form modal ── */}
      <TaskForm
        open={showAddTask}
        onClose={() => { setShowAddTask(false); setAddWeeklyDefault(false); }}
        defaultDate={todayStr}
        defaultRecurrence={addWeeklyDefault ? 'weekly' : undefined}
        onSubmit={data => {
          addTask(data);
          addToast('وظیفه اضافه شد ✓', 'success');
          setShowAddTask(false);
          setAddWeeklyDefault(false);
        }}
      />
    </div>
  );
}
