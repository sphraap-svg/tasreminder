import React, { useState } from 'react';
import { useDesk } from '../hooks/useDesk';
import { DeskMember, DeskTask } from '../types/desk';

const FIELD = 'w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-shadow';

// ── Progress Bar ──────────────────────────────────────────────────────────────
function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-bold text-gray-400 dark:text-gray-500 tabular-nums w-10 text-left">
        {pct}٪
      </span>
    </div>
  );
}

// ── Stats Row ─────────────────────────────────────────────────────────────────
function StatsRow({ tasks }: { tasks: DeskTask[] }) {
  const done = tasks.filter(t => t.status === 'done').length;
  const pending = tasks.length - done;
  return (
    <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/60 px-4 py-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            باقی‌مانده <span className="font-bold text-gray-700 dark:text-gray-200">{pending}</span>
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            انجام شده <span className="font-bold text-emerald-500">{done}</span>
          </span>
        </div>
        <span className="text-xs text-gray-300 dark:text-gray-600">{tasks.length} وظیفه</span>
      </div>
      <ProgressBar done={done} total={tasks.length} />
    </div>
  );
}

// ── Task Card ─────────────────────────────────────────────────────────────────
function TaskCard({
  task,
  members,
  isManager,
  currentMemberId,
  onToggle,
  onDelete,
}: {
  task: DeskTask;
  members: DeskMember[];
  isManager: boolean;
  currentMemberId: string;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const assignee = members.find(m => m.id === task.assignedTo);
  const isDone = task.status === 'done';
  const canToggle = isManager || task.assignedTo === currentMemberId || task.type === 'public';
  const canDelete = isManager;

  return (
    <div className={`group flex items-start gap-3 rounded-2xl border px-4 py-3.5 transition-all ${
      isDone
        ? 'border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/20 opacity-70'
        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/70 shadow-sm'
    }`}>
      {/* Checkbox */}
      <button
        onClick={onToggle}
        disabled={!canToggle}
        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
          isDone
            ? 'border-emerald-400 bg-emerald-400'
            : canToggle
            ? 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
            : 'border-gray-200 dark:border-gray-700 opacity-40 cursor-not-allowed'
        }`}
      >
        {isDone && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-snug ${
          isDone ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-100'
        }`}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 leading-relaxed">{task.description}</p>
        )}
        {assignee && (
          <div className="flex items-center gap-1 mt-1.5">
            <div className="w-3.5 h-3.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-[8px] font-bold text-indigo-600 dark:text-indigo-400">
              {assignee.name.charAt(0)}
            </div>
            <span className="text-[11px] text-indigo-500 dark:text-indigo-400 font-medium">{assignee.name}</span>
          </div>
        )}
      </div>

      {/* Delete */}
      {canDelete && (
        <button
          onClick={onDelete}
          className="flex-shrink-0 p-1 rounded-lg text-gray-300 dark:text-gray-700 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all mt-0.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  );
}

// ── Task Section (pending + done split) ───────────────────────────────────────
function TaskSection({
  tasks,
  members,
  isManager,
  currentMemberId,
  onToggle,
  onDelete,
  emptyLabel,
}: {
  tasks: DeskTask[];
  members: DeskMember[];
  isManager: boolean;
  currentMemberId: string;
  onToggle: (id: string, cur: 'pending' | 'done') => void;
  onDelete: (id: string) => void;
  emptyLabel: string;
}) {
  const [showDone, setShowDone] = useState(false);
  const pending = tasks.filter(t => t.status === 'pending');
  const done = tasks.filter(t => t.status === 'done');

  if (tasks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 px-4 py-8 text-center">
        <p className="text-sm text-gray-300 dark:text-gray-600">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {tasks.length > 0 && <StatsRow tasks={tasks} />}

      {/* Pending tasks */}
      {pending.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500">
              در انتظار ({pending.length})
            </span>
          </div>
          {pending.map(t => (
            <TaskCard
              key={t.id}
              task={t}
              members={members}
              isManager={isManager}
              currentMemberId={currentMemberId}
              onToggle={() => onToggle(t.id, t.status)}
              onDelete={() => onDelete(t.id)}
            />
          ))}
        </div>
      )}

      {pending.length === 0 && done.length > 0 && (
        <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-900/10 px-4 py-3 text-center">
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">همه وظایف انجام شده ✓</p>
        </div>
      )}

      {/* Done tasks – collapsible */}
      {done.length > 0 && (
        <div>
          <button
            onClick={() => setShowDone(s => !s)}
            className="flex items-center gap-2 w-full py-1 group"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500">
              انجام شده ({done.length})
            </span>
            <svg
              className={`w-3.5 h-3.5 text-gray-400 transition-transform mr-auto ${showDone ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showDone && (
            <div className="flex flex-col gap-2 mt-2">
              {done.map(t => (
                <TaskCard
                  key={t.id}
                  task={t}
                  members={members}
                  isManager={isManager}
                  currentMemberId={currentMemberId}
                  onToggle={() => onToggle(t.id, t.status)}
                  onDelete={() => onDelete(t.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Add Task Modal ────────────────────────────────────────────────────────────
function AddTaskModal({
  members,
  onClose,
  onAdd,
}: {
  members: DeskMember[];
  onClose: () => void;
  onAdd: (title: string, type: 'public' | 'personal', assignedTo?: string, desc?: string) => string | null;
}) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'public' | 'personal'>('public');
  const [assignedTo, setAssignedTo] = useState('');
  const [desc, setDesc] = useState('');
  const [err, setErr] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const error = onAdd(title, type, type === 'personal' ? (assignedTo || undefined) : undefined, desc);
    if (error) setErr(error);
    else onClose();
  }

  const nonManagerMembers = members.filter(m => m.role === 'member');

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">وظیفه جدید</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">عنوان</label>
            <input
              autoFocus type="text" value={title}
              onChange={e => { setTitle(e.target.value); setErr(''); }}
              placeholder="چه کاری باید انجام شود؟"
              className={FIELD}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">نوع وظیفه</label>
            <div className="grid grid-cols-2 gap-2">
              {(['public', 'personal'] as const).map(t => (
                <button
                  key={t} type="button" onClick={() => setType(t)}
                  className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors ${
                    type === t
                      ? t === 'public'
                        ? 'border-blue-400 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                        : 'border-violet-400 bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-300'
                      : 'border-gray-200 dark:border-gray-600 text-gray-500'
                  }`}
                >
                  {t === 'public' ? '🌐 عمومی' : '👤 شخصی'}
                </button>
              ))}
            </div>
          </div>
          {type === 'personal' && nonManagerMembers.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">تخصیص به</label>
              <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className={FIELD}>
                <option value="">انتخاب نشده</option>
                {nonManagerMembers.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">توضیحات (اختیاری)</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2} placeholder="جزئیات بیشتر..." className={`${FIELD} resize-none`} />
          </div>
          {err && <p className="text-xs text-red-500">{err}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300">
              انصراف
            </button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-sm font-bold text-white transition-colors">
              افزودن
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Folder Colors ─────────────────────────────────────────────────────────────
const FOLDER_COLORS = [
  '#e8553a', // coral
  '#5b6ef5', // indigo
  '#9333ea', // purple
  '#0891b2', // cyan
  '#d97706', // amber
  '#059669', // emerald
  '#db2777', // pink
  '#7c3aed', // violet
];

// ── Member Folder Card ────────────────────────────────────────────────────────
function MemberFolderCard({
  member,
  tasks,
  color,
  isSelected,
  onClick,
}: {
  member: DeskMember;
  tasks: DeskTask[];
  color: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  const done = tasks.filter(t => t.status === 'done').length;
  const pending = tasks.length - done;
  const pct = tasks.length === 0 ? 0 : Math.round((done / tasks.length) * 100);

  // Lighten color for glass front
  const glassColor = color + 'cc';
  const backColor = color + 'ee';

  return (
    <button
      onClick={onClick}
      className="w-full text-right focus:outline-none group"
      style={{ aspectRatio: '1 / 1' }}
    >
      <div
        className="relative w-full h-full rounded-3xl overflow-hidden transition-transform duration-200 active:scale-95"
        style={{
          boxShadow: isSelected
            ? `0 0 0 3px ${color}, 0 8px 32px ${color}55`
            : `0 4px 24px ${color}44`,
          transform: isSelected ? 'scale(0.97)' : undefined,
        }}
      >
        {/* Back — solid color */}
        <div
          className="absolute inset-0"
          style={{ background: backColor }}
        />

        {/* Papers sticking up from behind the front cover */}
        <div className="absolute left-4 right-4 flex items-end justify-center gap-2"
          style={{ top: '6%', bottom: '42%' }}
        >
          {[8, 0, -8].map((rotate, i) => (
            <div
              key={i}
              className="rounded-xl flex-shrink-0 flex flex-col gap-1 px-2 pt-2"
              style={{
                width: '30%',
                height: '100%',
                background: 'rgba(255,255,255,0.88)',
                transform: `rotate(${rotate}deg)`,
                transformOrigin: 'bottom center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              }}
            >
              <div className="h-1.5 rounded-full bg-gray-200" style={{ width: '75%' }} />
              <div className="h-1 rounded-full bg-gray-100" style={{ width: '55%' }} />
              <div className="h-1 rounded-full bg-gray-100" style={{ width: '65%' }} />
            </div>
          ))}
        </div>

        {/* Front cover — glass */}
        <div
          className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-3 flex flex-col justify-between"
          style={{
            height: '52%',
            background: `linear-gradient(160deg, ${color}99 0%, ${glassColor} 100%)`,
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderTop: `1px solid rgba(255,255,255,0.25)`,
          }}
        >
          <div />
          <div>
            <p className="text-white font-black text-base leading-tight truncate">{member.name}</p>
            <p className="text-white/70 text-[11px] mt-0.5">
              {tasks.length === 0
                ? 'بدون وظیفه'
                : pending > 0
                ? `${pending} باقی‌مانده`
                : 'همه انجام شد ✓'}
            </p>
          </div>
          {tasks.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.25)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: 'rgba(255,255,255,0.85)' }}
                />
              </div>
              <span className="text-[10px] text-white/70 font-bold tabular-nums">{pct}٪</span>
            </div>
          )}
        </div>

        {/* Bottom glow */}
        <div
          className="absolute bottom-0 left-1/4 right-1/4 h-3 blur-xl rounded-full opacity-60"
          style={{ background: color }}
        />
      </div>
    </button>
  );
}

// ── Login Screen ──────────────────────────────────────────────────────────────
function LoginScreen({ createWorkspace, joinWorkspace, managerLogin }: {
  createWorkspace: (name: string, managerName: string, pin: string) => string | null;
  joinWorkspace: (code: string, name: string) => string | null;
  managerLogin: (code: string, pin: string) => string | null;
}) {
  const [tab, setTab] = useState<'join' | 'create' | 'manager'>('join');

  const [joinCode, setJoinCode] = useState('');
  const [joinName, setJoinName] = useState('');
  const [joinErr, setJoinErr] = useState('');

  const [wsName, setWsName] = useState('');
  const [managerName, setManagerName] = useState('');
  const [pin, setPin] = useState('');
  const [createErr, setCreateErr] = useState('');

  const [mCode, setMCode] = useState('');
  const [mPin, setMPin] = useState('');
  const [mErr, setMErr] = useState('');

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    const err = joinWorkspace(joinCode, joinName);
    if (err) setJoinErr(err); else setJoinErr('');
  }
  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const err = createWorkspace(wsName, managerName, pin);
    if (err) setCreateErr(err); else setCreateErr('');
  }
  function handleManagerLogin(e: React.FormEvent) {
    e.preventDefault();
    const err = managerLogin(mCode, mPin);
    if (err) setMErr(err); else setMErr('');
  }

  return (
    <div className="flex flex-col gap-6 pt-6 max-w-sm mx-auto">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center mx-auto mb-3">
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">میزکار</h1>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">مدیریت وظایف تیمی</p>
      </div>

      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
        {([['join', 'ورود با کد'], ['manager', 'مدیر'], ['create', 'ایجاد میزکار']] as const).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setTab(val)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === val ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'join' && (
        <form onSubmit={handleJoin} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">کد میزکار</label>
            <input autoFocus type="text" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="کد را از مدیر بگیرید" className={`${FIELD} tracking-widest font-mono`} maxLength={8} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">نام شما</label>
            <input type="text" value={joinName} onChange={e => setJoinName(e.target.value)} placeholder="مثلاً: علی رضایی" className={FIELD} />
          </div>
          {joinErr && <p className="text-xs text-red-500">{joinErr}</p>}
          <button type="submit" className="w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm transition-colors">ورود به میزکار</button>
        </form>
      )}

      {tab === 'manager' && (
        <form onSubmit={handleManagerLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">کد میزکار</label>
            <input autoFocus type="text" value={mCode} onChange={e => setMCode(e.target.value.toUpperCase())} placeholder="کد میزکار" className={`${FIELD} tracking-widest font-mono`} maxLength={8} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">پین مدیر (۴ رقم)</label>
            <input type="password" inputMode="numeric" value={mPin} onChange={e => setMPin(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="••••" className={`${FIELD} tracking-widest text-center`} maxLength={4} />
          </div>
          {mErr && <p className="text-xs text-red-500">{mErr}</p>}
          <button type="submit" className="w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm transition-colors">ورود مدیر</button>
        </form>
      )}

      {tab === 'create' && (
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">نام میزکار</label>
            <input autoFocus type="text" value={wsName} onChange={e => setWsName(e.target.value)} placeholder="مثلاً: تیم فروش اینفینیتی" className={FIELD} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">نام مدیر</label>
            <input type="text" value={managerName} onChange={e => setManagerName(e.target.value)} placeholder="نام شما" className={FIELD} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">پین مدیر (۴ رقم عددی)</label>
            <input type="password" inputMode="numeric" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="••••" className={`${FIELD} tracking-widest text-center`} maxLength={4} />
            <p className="mt-1 text-[11px] text-gray-400">این پین را نزد خودتان نگه دارید</p>
          </div>
          {createErr && <p className="text-xs text-red-500">{createErr}</p>}
          <button type="submit" className="w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm transition-colors">ایجاد میزکار</button>
        </form>
      )}
    </div>
  );
}

// ── Main DeskPage ─────────────────────────────────────────────────────────────
export function DeskPage() {
  const { session, workspace, logout, addTask, setTaskStatus, deleteTask, createWorkspace, joinWorkspace, managerLogin } = useDesk();
  const [showAdd, setShowAdd] = useState(false);
  const [tab, setTab] = useState<'public' | 'personal' | 'by-member'>('public');
  const [showCode, setShowCode] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  if (!session || !workspace) return <LoginScreen createWorkspace={createWorkspace} joinWorkspace={joinWorkspace} managerLogin={managerLogin} />;

  const isManager = session.role === 'manager';
  const members = workspace.members;
  const nonManagers = members.filter(m => m.role === 'member');

  const publicTasks = workspace.tasks.filter(t => t.type === 'public');
  const personalTasks = workspace.tasks.filter(t => {
    if (t.type !== 'personal') return false;
    if (isManager) return true;
    return t.assignedTo === session.memberId || t.createdBy === session.memberId;
  });

  function handleToggle(taskId: string, cur: 'pending' | 'done') {
    setTaskStatus(taskId, cur === 'done' ? 'pending' : 'done');
  }

  // Tab badge counts
  const pubPending = publicTasks.filter(t => t.status === 'pending').length;
  const perPending = personalTasks.filter(t => t.status === 'pending').length;

  return (
    <div className="flex flex-col gap-4 pt-4 pb-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">{workspace.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-500 dark:text-gray-400">{session.memberName}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isManager
                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
            }`}>
              {isManager ? 'مدیر' : 'عضو'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {isManager && (
            <button
              onClick={() => setShowCode(s => !s)}
              title="کد میزکار"
              className="p-2 rounded-xl text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          )}
          <button
            onClick={logout}
            title="خروج"
            className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Join code banner */}
      {isManager && showCode && (
        <div className="rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-900/10 px-4 py-4">
          <p className="text-xs text-indigo-500 dark:text-indigo-400 font-medium mb-1">کد عضویت همکاران</p>
          <p className="text-3xl font-black tracking-[0.3em] text-indigo-600 dark:text-indigo-300 font-mono">{workspace.joinCode}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">این کد را به همکاران بدهید تا وارد شوند</p>
        </div>
      )}

      {/* Members row */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {members.map(m => (
          <div key={m.id} className="flex-shrink-0 flex flex-col items-center gap-1">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
              m.role === 'manager'
                ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}>
              {m.name.charAt(0)}
            </div>
            <span className="text-[10px] text-gray-400 max-w-[44px] truncate text-center">{m.name}</span>
          </div>
        ))}
      </div>

      {/* Add task button */}
      {isManager && (
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-800 text-indigo-400 text-sm font-semibold hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          وظیفه جدید
        </button>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
        {([
          ['public', 'عمومی', pubPending],
          ['personal', 'شخصی', perPending],
          ...(isManager ? [['by-member', 'نفر به نفر', 0]] : []),
        ] as [typeof tab, string, number][]).map(([val, label, cnt]) => (
          <button
            key={val}
            onClick={() => setTab(val)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              tab === val
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {label}
            {cnt > 0 && (
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                tab === val
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
                {cnt}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Public tasks */}
      {tab === 'public' && (
        <TaskSection
          tasks={publicTasks}
          members={members}
          isManager={isManager}
          currentMemberId={session.memberId}
          onToggle={handleToggle}
          onDelete={deleteTask}
          emptyLabel="وظیفه عمومی‌ای ثبت نشده"
        />
      )}

      {/* Personal tasks */}
      {tab === 'personal' && (
        <TaskSection
          tasks={personalTasks}
          members={members}
          isManager={isManager}
          currentMemberId={session.memberId}
          onToggle={handleToggle}
          onDelete={deleteTask}
          emptyLabel="وظیفه شخصی‌ای وجود ندارد"
        />
      )}

      {/* By-member view (manager only) — folder cards */}
      {tab === 'by-member' && isManager && (
        <div className="flex flex-col gap-5">
          {nonManagers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 px-4 py-8 text-center">
              <p className="text-sm text-gray-300 dark:text-gray-600">هنوز هیچ عضوی به میزکار نپیوسته</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {nonManagers.map((member, idx) => {
                const memberTasks = workspace.tasks.filter(t =>
                  t.assignedTo === member.id || (t.type === 'personal' && t.createdBy === member.id)
                );
                const color = FOLDER_COLORS[idx % FOLDER_COLORS.length];
                const isSelected = selectedMemberId === member.id;
                return (
                  <MemberFolderCard
                    key={member.id}
                    member={member}
                    tasks={memberTasks}
                    color={color}
                    isSelected={isSelected}
                    onClick={() => setSelectedMemberId(isSelected ? null : member.id)}
                  />
                );
              })}
            </div>
          )}

          {/* Expanded task list for selected member */}
          {selectedMemberId && (() => {
            const member = nonManagers.find(m => m.id === selectedMemberId);
            if (!member) return null;
            const memberTasks = workspace.tasks.filter(t =>
              t.assignedTo === member.id || (t.type === 'personal' && t.createdBy === member.id)
            );
            const idx = nonManagers.indexOf(member);
            const color = FOLDER_COLORS[idx % FOLDER_COLORS.length];
            return (
              <div className="rounded-3xl overflow-hidden" style={{ border: `1.5px solid ${color}55` }}>
                {/* Header */}
                <div className="px-4 py-3 flex items-center gap-3"
                  style={{ background: `${color}18` }}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white"
                    style={{ background: color }}
                  >
                    {member.name.charAt(0)}
                  </div>
                  <span className="font-bold text-gray-800 dark:text-gray-100">{member.name}</span>
                  <button
                    onClick={() => setSelectedMemberId(null)}
                    className="mr-auto p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {/* Tasks */}
                <div className="px-3 pb-3 pt-2">
                  <TaskSection
                    tasks={memberTasks}
                    members={members}
                    isManager={isManager}
                    currentMemberId={session.memberId}
                    onToggle={handleToggle}
                    onDelete={deleteTask}
                    emptyLabel="وظیفه‌ای برای این عضو ثبت نشده"
                  />
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {showAdd && (
        <AddTaskModal
          members={members}
          onClose={() => setShowAdd(false)}
          onAdd={handleAdd}
        />
      )}
    </div>
  );

  function handleAdd(title: string, type: 'public' | 'personal', assignedTo?: string, desc?: string) {
    return addTask(title, type, assignedTo, desc);
  }
}
