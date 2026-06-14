import React, { useState } from 'react';
import { Task } from '../../types';
import { useTasks } from '../../context/TaskContext';
import { useToast } from '../../context/ToastContext';
import { TaskForm } from './TaskForm';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { formatTimeFa } from '../../utils/date';
import { RECURRENCE_LABELS } from '../../utils/recurrence';

// ─── Palette ─────────────────────────────────────────────────────────────────

interface Palette {
  bg: string;
  panel: string;
  pin: string;
  pinShine: string;
  text: string;
  num: string;
  metaBg: string;
}

const PALETTE: Palette[] = [
  // 0 — peach / coral
  {
    bg: '#FFF5F0',
    panel: '#FFD9C0',
    pin: '#EF4444',
    pinShine: '#FCA5A5',
    text: '#7C2D12',
    num: '#FB923C',
    metaBg: 'rgba(255,255,255,0.55)',
  },
  // 1 — sky blue
  {
    bg: '#F0F8FF',
    panel: '#BAE0FD',
    pin: '#2563EB',
    pinShine: '#93C5FD',
    text: '#1E3A8A',
    num: '#60A5FA',
    metaBg: 'rgba(255,255,255,0.55)',
  },
  // 2 — lavender / purple
  {
    bg: '#FAF5FF',
    panel: '#E9D5FF',
    pin: '#7C3AED',
    pinShine: '#C4B5FD',
    text: '#4C1D95',
    num: '#A78BFA',
    metaBg: 'rgba(255,255,255,0.55)',
  },
  // 3 — warm amber / beige
  {
    bg: '#FFFBEB',
    panel: '#FDE68A',
    pin: '#D97706',
    pinShine: '#FCD34D',
    text: '#78350F',
    num: '#F59E0B',
    metaBg: 'rgba(255,255,255,0.55)',
  },
  // 4 — pale indigo
  {
    bg: '#EEF2FF',
    panel: '#C7D2FE',
    pin: '#4F46E5',
    pinShine: '#A5B4FC',
    text: '#312E81',
    num: '#818CF8',
    metaBg: 'rgba(255,255,255,0.55)',
  },
];

// Slight but varied rotations — alternating direction reinforces zigzag feel
const ROTATIONS = ['-2deg', '1.8deg', '-1.2deg', '2.4deg', '-1.6deg'];
const FA_NUMS = ['۰۱', '۰۲', '۰۳', '۰۴', '۰۵'];

// ─── Pin ─────────────────────────────────────────────────────────────────────

function Pin({ color, shine }: { color: string; shine: string }) {
  return (
    <div
      className="absolute -top-5 left-1/2 -translate-x-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center"
      style={{
        backgroundColor: color,
        boxShadow: `0 4px 10px ${color}88, 0 0 0 3px white`,
      }}
    >
      {/* shine dot */}
      <div
        className="w-2.5 h-2.5 rounded-full"
        style={{ backgroundColor: shine, opacity: 0.8 }}
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
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [hovered, setHovered] = useState(false);

  const c = PALETTE[index % PALETTE.length];
  const rotation = ROTATIONS[index % ROTATIONS.length];
  const faNum = FA_NUMS[Math.min(index, 4)];

  function handleComplete() {
    completeTask(task.id);
    addToast(
      task.recurrence !== 'none' ? 'انجام شد. نسخه بعدی ایجاد شد ✓' : 'وظیفه انجام شد ✓',
      'success'
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

  const cardTransform = hovered
    ? 'rotate(0deg) translateY(-6px) scale(1.025)'
    : `rotate(${rotation})`;

  return (
    <>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative w-72 sm:w-80 flex-shrink-0"
        style={{
          transform: cardTransform,
          transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), filter 0.3s ease',
          filter: hovered ? 'drop-shadow(0 20px 30px rgba(0,0,0,0.18))' : 'drop-shadow(0 6px 16px rgba(0,0,0,0.10))',
          zIndex: hovered ? 20 : 'auto',
        }}
      >
        {/* Push pin */}
        <Pin color={c.pin} shine={c.pinShine} />

        {/* Card shell */}
        <div
          className={`rounded-2xl overflow-hidden border border-white/80 transition-opacity duration-300 ${task.completed ? 'opacity-55' : ''}`}
          style={{ backgroundColor: c.bg }}
        >
          {/* Colored inner panel */}
          <div className="m-3.5 rounded-xl p-4 relative overflow-hidden" style={{ backgroundColor: c.panel }}>
            {/* Subtle paper texture lines inside panel */}
            <div
              className="absolute inset-0 rounded-xl"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 23px,rgba(255,255,255,0.35) 24px)',
              }}
            />

            {/* Task number */}
            <div
              className="relative text-5xl font-black leading-none mb-3 select-none"
              style={{ color: c.num, opacity: 0.55, direction: 'ltr', textAlign: 'left' }}
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
                style={{ color: c.text, opacity: 0.7 }}
              >
                {task.description}
              </p>
            )}

            {/* Meta chips */}
            <div className="relative flex flex-wrap gap-1.5 mt-2">
              {task.time && (
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: c.metaBg, color: c.text }}
                >
                  ⏰ {formatTimeFa(task.time)}
                </span>
              )}
              {task.category && (
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: c.metaBg, color: c.text }}
                >
                  {task.category}
                </span>
              )}
              {task.recurrence !== 'none' && (
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: c.metaBg, color: c.text }}
                >
                  🔁 {RECURRENCE_LABELS[task.recurrence]}
                </span>
              )}
              {task.reminderEnabled && task.time && !task.reminderSentAt && (
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: c.metaBg, color: c.text }}
                >
                  🔔
                </span>
              )}
            </div>
          </div>

          {/* Action strip */}
          <div className="px-4 py-3 flex items-center justify-between">
            {/* Complete */}
            <button
              onClick={handleComplete}
              disabled={task.completed}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all active:scale-95 disabled:opacity-60 disabled:cursor-default"
              style={{ backgroundColor: task.completed ? '#10B981' : c.pin }}
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

            {/* Edit / Delete */}
            <div className="flex gap-1">
              <button
                onClick={() => setShowEdit(true)}
                aria-label="ویرایش"
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-black/5 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => setShowDelete(true)}
                aria-label="حذف"
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
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
            ...task,
            ...data,
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
