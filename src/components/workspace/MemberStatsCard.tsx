import React from 'react';
import { WorkspaceMember, WorkspaceTask } from '../../types/workspace';

interface MemberStatsCardProps {
  member: WorkspaceMember;
  tasks: WorkspaceTask[];
}

/**
 * Compact, attractive per-member card for the manager view.
 * Shows avatar + name on top, and three stat pills below:
 *   • total assigned tasks
 *   • completed tasks
 *   • remaining tasks
 */
export function MemberStatsCard({ member, tasks }: MemberStatsCardProps) {
  const assigned = tasks.filter(t => t.assigned_to === member.user_id);
  const total = assigned.length;
  const done = assigned.filter(t => t.status === 'done').length;
  const remaining = total - done;
  const isManager = member.role === 'manager';

  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className="glass-surface rounded-2xl px-3.5 py-3 flex flex-col gap-2.5">
      {/* Top: avatar + name + role */}
      <div className="flex items-center gap-2.5">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 text-white ${
            isManager ? '' : 'bg-blue-400/80 dark:bg-blue-500/60'
          }`}
          style={isManager ? { background: 'linear-gradient(135deg, #1848F5 0%, #0A2ACC 100%)' } : undefined}
        >
          {member.display_name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate leading-tight">
            {member.display_name}
          </p>
          <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500">
            {isManager ? 'مدیر' : 'عضو'} · {pct}٪ پیشرفت
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-gray-200/70 dark:bg-gray-700/60 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #1848F5 0%, #0A2ACC 100%)' }}
        />
      </div>

      {/* Three stat pills */}
      <div className="flex items-center gap-1.5">
        {/* Total */}
        <Stat
          value={total}
          label="کل"
          tone="blue"
          icon={
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          }
        />
        {/* Done */}
        <Stat
          value={done}
          label="انجام‌شده"
          tone="green"
          icon={<path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
        />
        {/* Remaining */}
        <Stat
          value={remaining}
          label="باقی‌مانده"
          tone="amber"
          icon={<path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
        />
      </div>
    </div>
  );
}

const TONES: Record<string, string> = {
  blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300',
  green: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-300',
  amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
};

function Stat({ value, label, icon, tone }: { value: number; label: string; icon: React.ReactNode; tone: string }) {
  return (
    <div className={`flex-1 flex flex-col items-center gap-0.5 rounded-xl py-1.5 ${TONES[tone]}`}>
      <div className="flex items-center gap-1">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          {icon}
        </svg>
        <span className="text-sm font-black leading-none">{value}</span>
      </div>
      <span className="text-[9px] font-semibold opacity-75 leading-none">{label}</span>
    </div>
  );
}
