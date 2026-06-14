import React, { useState } from 'react';
import { Task } from '../../types';
import { useTasks } from '../../context/TaskContext';
import { useToast } from '../../context/ToastContext';
import { TaskForm } from './TaskForm';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { formatTimeFa } from '../../utils/date';
import { RECURRENCE_LABELS } from '../../utils/recurrence';

// ─── Glassmorphism palette ────────────────────────────────────────────────────

interface Palette {
  cardBg: string;      // translucent card shell background
  panelBg: string;     // translucent inner panel
  border: string;      // glass border / inset highlight
  pin: string;
  pinShine: string;
  pinGlow: string;     // outer glow ring
  text: string;
  num: string;
  metaBg: string;
  actionBg: string;    // action strip frosted background
  shadow: string;      // layered card shadow
}

const PALETTE: Palette[] = [
  // 0 — peach / coral
  {
    cardBg:   'rgba(255, 232, 218, 0.28)',  // was 0.68 — lower opacity lets backdrop-blur show through
    panelBg:  'rgba(255, 185, 140, 0.88)',  // was 0.50 — higher opacity for text readability
    border:   'rgba(255, 255, 255, 0.62)',  // kept for reference; border now from CSS ::before
    pin:      '#EF4444',
    pinShine: '#FCA5A5',
    pinGlow:  'rgba(239, 68, 68, 0.48)',
    text:     '#7C2D12',
    num:      '#FB923C',
    metaBg:   'rgba(255,255,255,0.62)',
    actionBg: 'rgba(255, 240, 228, 0.62)',
    shadow:   '0 12px 44px rgba(239,68,68,0.22), 0 3px 14px rgba(0,0,0,0.12), inset 0 1px 1px rgba(255,255,255,0.80)',
  },
  // 1 — sky blue
  {
    cardBg:   'rgba(218, 240, 255, 0.28)',
    panelBg:  'rgba(110, 195, 255, 0.88)',
    border:   'rgba(255, 255, 255, 0.62)',
    pin:      '#2563EB',
    pinShine: '#93C5FD',
    pinGlow:  'rgba(37, 99, 235, 0.48)',
    text:     '#1E3A8A',
    num:      '#60A5FA',
    metaBg:   'rgba(255,255,255,0.62)',
    actionBg: 'rgba(215, 238, 255, 0.62)',
    shadow:   '0 12px 44px rgba(37,99,235,0.22), 0 3px 14px rgba(0,0,0,0.12), inset 0 1px 1px rgba(255,255,255,0.80)',
  },
  // 2 — lavender / purple
  {
    cardBg:   'rgba(240, 228, 255, 0.28)',
    panelBg:  'rgba(192, 158, 255, 0.88)',
    border:   'rgba(255, 255, 255, 0.62)',
    pin:      '#7C3AED',
    pinShine: '#C4B5FD',
    pinGlow:  'rgba(124, 58, 237, 0.48)',
    text:     '#4C1D95',
    num:      '#A78BFA',
    metaBg:   'rgba(255,255,255,0.62)',
    actionBg: 'rgba(238, 226, 255, 0.62)',
    shadow:   '0 12px 44px rgba(124,58,237,0.22), 0 3px 14px rgba(0,0,0,0.12), inset 0 1px 1px rgba(255,255,255,0.80)',
  },
  // 3 — warm amber / golden
  {
    cardBg:   'rgba(255, 248, 218, 0.28)',
    panelBg:  'rgba(255, 208, 72, 0.88)',
    border:   'rgba(255, 255, 255, 0.62)',
    pin:      '#D97706',
    pinShine: '#FCD34D',
    pinGlow:  'rgba(217, 119, 6, 0.48)',
    text:     '#78350F',
    num:      '#F59E0B',
    metaBg:   'rgba(255,255,255,0.62)',
    actionBg: 'rgba(255, 244, 208, 0.62)',
    shadow:   '0 12px 44px rgba(217,119,6,0.22), 0 3px 14px rgba(0,0,0,0.12), inset 0 1px 1px rgba(255,255,255,0.80)',
  },
  // 4 — pale indigo
  {
    cardBg:   'rgba(225, 232, 255, 0.28)',
    panelBg:  'rgba(155, 175, 255, 0.88)',
    border:   'rgba(255, 255, 255, 0.62)',
    pin:      '#4F46E5',
    pinShine: '#A5B4FC',
    pinGlow:  'rgba(79, 70, 229, 0.48)',
    text:     '#312E81',
    num:      '#818CF8',
    metaBg:   'rgba(255,255,255,0.62)',
    actionBg: 'rgba(222, 228, 255, 0.62)',
    shadow:   '0 12px 44px rgba(79,70,229,0.22), 0 3px 14px rgba(0,0,0,0.12), inset 0 1px 1px rgba(255,255,255,0.80)',
  },
];

const ROTATIONS = ['-2deg', '1.8deg', '-1.2deg', '2.4deg', '-1.6deg'];
const FA_NUMS   = ['۰۱', '۰۲', '۰۳', '۰۴', '۰۵'];

// ─── Glass pin ────────────────────────────────────────────────────────────────

function Pin({ color, shine, glow }: { color: string; shine: string; glow: string }) {
  return (
    <div
      className="absolute -top-5 left-1/2 -translate-x-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center"
      style={{
        backgroundColor: color,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        boxShadow: `0 4px 14px ${glow}, 0 0 0 3px rgba(255,255,255,0.82), 0 0 0 5px ${glow}`,
      }}
    >
      {/* crescent shine */}
      <div
        className="absolute top-1 right-1 w-2 h-2 rounded-full opacity-70"
        style={{ backgroundColor: 'rgba(255,255,255,0.85)' }}
      />
      {/* center dot */}
      <div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: shine, opacity: 0.88 }}
      />
    </div>
  );
}

// ─── Main card ────────────────────────────────────────────────────────────────

interface FloatingTaskCardProps {
  task: Task;
  index: number;
}

export function FloatingTaskCard({ task, index }: FloatingTaskCardProps) {
  const { completeTask, deleteTask, updateTask } = useTasks();
  const { addToast } = useToast();
  const [showEdit,   setShowEdit]   = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [hovered,    setHovered]    = useState(false);
  const [pressed,    setPressed]    = useState(false);
  const [wobbling,   setWobbling]   = useState(false);

  const c        = PALETTE[index % PALETTE.length];
  const rotation = ROTATIONS[index % ROTATIONS.length];
  const faNum    = FA_NUMS[Math.min(index, 4)];

  // ── Task actions ─────────────────────────────────────────────────

  function handleComplete() {
    completeTask(task.id);
    addToast(
      task.recurrence !== 'none' ? 'انجام شد. نسخه بعدی ایجاد شد ✓' : 'وظیفه انجام شد ✓',
      'success',
    );
  }

  function handleDelete() {
    deleteTask(task.id);
    addToast('وظیفه حذف شد', 'info');
    setShowDelete(false);
  }

  function handleEdit(data: Task) {
    updateTask({ ...task, ...data, id: task.id, createdAt: task.createdAt });
    addToast('وظیفه ویرایش شد ✓', 'success');
  }

  // ── Interaction handlers (pointer events cover mouse + touch) ────

  function handlePointerEnter() { setHovered(true); }
  function handlePointerLeave() { setHovered(false); setPressed(false); }
  function handlePointerDown()  { setPressed(true); }
  function handlePointerUp()    { setPressed(false); }

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest('button')) return;
    if (wobbling) return;
    setWobbling(true);
  }

  function handleAnimationEnd() {
    setWobbling(false);
  }

  // ── CSS class composition (all transforms live in CSS, not JS) ───
  //
  // Priority order in CSS: card-pressed > card-hovered > base.
  // Both classes can be active simultaneously; the later CSS rule wins.

  const wrapperClass = [
    'glass-card-wrapper relative w-72 sm:w-80 flex-shrink-0 cursor-pointer',
    hovered   ? 'card-hovered'  : '',
    pressed   ? 'card-pressed'  : '',
    wobbling  ? 'card-wobbling' : '',
  ].filter(Boolean).join(' ');

  return (
    <>
      {/* ── Outer wrapper: CSS classes drive all transforms ──────── */}
      <div
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerLeave}
        onClick={handleClick}
        className={wrapperClass}
        // Only the per-card base rotation is set here; everything else is CSS
        style={{ '--card-rot': rotation } as React.CSSProperties}
      >
        {/* ── Inner wrapper: wobble animation pivoting at the pin ── */}
        <div
          className={wobbling ? 'card-wobble' : undefined}
          onAnimationEnd={handleAnimationEnd}
        >
          {/* Push pin */}
          <Pin color={c.pin} shine={c.pinShine} glow={c.pinGlow} />

          {/* Card shell — glassmorphism */}
          <div
            className={`glass-card-shell rounded-2xl overflow-hidden transition-opacity duration-300 ${task.completed ? 'opacity-55' : ''}`}
            style={{
              backgroundColor: c.cardBg,
              boxShadow: c.shadow,
            }}
          >
            {/* Top edge reflection (full-width frosted highlight) */}
            <div
              className="absolute top-0 left-0 right-0 h-20 pointer-events-none rounded-t-2xl z-10"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0) 100%)',
              }}
              aria-hidden="true"
            />

            {/* ── Colored inner panel ─────────────────────────────── */}
            <div
              className="m-3.5 rounded-xl p-4 relative overflow-hidden"
              style={{ backgroundColor: c.panelBg, backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
            >
              {/* Paper rule lines */}
              <div
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{
                  backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 23px,rgba(255,255,255,0.30) 24px)',
                }}
              />

              {/* Diagonal reflection on panel */}
              <div
                className="absolute top-0 right-0 bottom-0 w-3/5 pointer-events-none rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0) 55%)',
                }}
                aria-hidden="true"
              />

              {/* Task number */}
              <div
                className="relative text-5xl font-black leading-none mb-3 select-none"
                style={{ color: c.num, opacity: 0.52, direction: 'ltr', textAlign: 'left' }}
              >
                {faNum}
              </div>

              {/* Title */}
              <h3
                className={`relative text-base font-bold leading-snug mb-1 ${task.completed ? 'line-through' : ''}`}
                style={{ color: c.text }}
              >
                {task.title}
              </h3>

              {/* Description */}
              {task.description && (
                <p
                  className="relative text-xs leading-relaxed line-clamp-2 mb-2"
                  style={{ color: c.text, opacity: 0.72 }}
                >
                  {task.description}
                </p>
              )}

              {/* Meta chips */}
              <div className="relative flex flex-wrap gap-1.5 mt-2">
                {task.time && (
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: c.metaBg, color: c.text, backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
                  >
                    ⏰ {formatTimeFa(task.time)}
                  </span>
                )}
                {task.category && (
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: c.metaBg, color: c.text, backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
                  >
                    {task.category}
                  </span>
                )}
                {task.recurrence !== 'none' && (
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: c.metaBg, color: c.text, backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
                  >
                    🔁 {RECURRENCE_LABELS[task.recurrence]}
                  </span>
                )}
                {task.reminderEnabled && task.time && !task.reminderSentAt && (
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: c.metaBg, color: c.text, backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
                  >
                    🔔
                  </span>
                )}
              </div>
            </div>

            {/* ── Action strip ────────────────────────────────────── */}
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{ backgroundColor: c.actionBg, backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
            >
              <button
                onClick={handleComplete}
                disabled={task.completed}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all active:scale-95 disabled:opacity-60 disabled:cursor-default"
                style={{
                  backgroundColor: task.completed ? '#10B981' : c.pin,
                  boxShadow: `0 2px 10px ${c.pinGlow}`,
                }}
              >
                {task.completed ? (
                  <> ✓ انجام شد</>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    انجام شد
                  </>
                )}
              </button>

              <div className="flex gap-1">
                <button
                  onClick={() => setShowEdit(true)}
                  aria-label="ویرایش"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white/40 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => setShowDelete(true)}
                  aria-label="حذف"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50/60 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <TaskForm
        open={showEdit}
        onClose={() => setShowEdit(false)}
        onSubmit={data =>
          handleEdit({
            ...task, ...data,
            id: task.id,
            createdAt: task.createdAt,
            completedAt: task.completedAt,
            reminderSentAt: task.reminderSentAt,
          })
        }
        initialData={task}
      />
      <ConfirmDialog
        open={showDelete}
        title="حذف وظیفه"
        message={`آیا می‌خواهی وظیفه «${task.title}» را حذف کنی؟ این عمل قابل بازگشت نیست.`}
        confirmLabel="حذف"
        danger
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </>
  );
}
