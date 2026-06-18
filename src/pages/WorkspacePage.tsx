import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { useAuth } from '../context/AuthContext';
import { WorkspaceTaskItem } from '../components/workspace/WorkspaceTaskItem';
import { CreateWorkspaceTaskModal } from '../components/workspace/CreateWorkspaceTaskModal';
import { WorkspaceTask } from '../types/workspace';

type TabFilter = 'all' | 'team' | 'personal';

function EmptyWorkspace() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-400">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <div>
        <h3 className="text-base font-bold text-gray-700 dark:text-gray-300">به هیچ تیمی تعلق ندارید</h3>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 max-w-xs">
          از مدیر تیم خود بخواهید شما را به workspace اضافه کند.
        </p>
      </div>
    </div>
  );
}

export function WorkspacePage() {
  const { user, signOut } = useAuth();
  const { workspace, members, tasks, myMember, loading, error, refresh } = useWorkspace();
  const [tab, setTab] = useState<TabFilter>('all');
  const [showCreate, setShowCreate] = useState(false);

  const isManager = myMember?.role === 'manager';

  const filteredTasks: WorkspaceTask[] = tasks.filter(t => {
    if (tab === 'all') return true;
    return t.type === tab;
  });

  const teamTasks = filteredTasks.filter(t => t.type === 'team');
  const personalTasks = filteredTasks.filter(t => t.type === 'personal');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-indigo-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0 pb-4">
      {/* Header */}
      <div className="pt-8 pb-5 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
            {workspace?.name ?? 'میزکار تیمی'}
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
            {myMember?.display_name ?? user?.email}
            {myMember && (
              <span className={`mr-1.5 text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                isManager
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
              }`}>
                {isManager ? 'مدیر' : 'عضو'}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh */}
          <button
            onClick={refresh}
            title="بروزرسانی"
            className="p-2 rounded-xl text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          {/* Sign out */}
          <button
            onClick={signOut}
            title="خروج"
            className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* No workspace */}
      {!workspace && !loading && !error && <EmptyWorkspace />}

      {workspace && (
        <>
          {/* Members strip */}
          <div className="flex gap-2 overflow-x-auto pb-1 mb-4 no-scrollbar">
            {members.map(m => (
              <div
                key={m.user_id}
                title={m.display_name}
                className="flex-shrink-0 flex flex-col items-center gap-1"
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                  m.role === 'manager'
                    ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}>
                  {m.display_name.charAt(0)}
                </div>
                <span className="text-[10px] text-gray-400 max-w-[40px] truncate">{m.display_name}</span>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl mb-4">
            {([['all', 'همه'], ['team', 'تیمی'], ['personal', 'شخصی']] as [TabFilter, string][]).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setTab(val)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                  tab === val
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Create button (manager only) */}
          {isManager && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center justify-center gap-2 w-full py-3 mb-4 rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-800 text-indigo-400 dark:text-indigo-500 text-sm font-semibold hover:border-indigo-400 dark:hover:border-indigo-600 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              وظیفه جدید
            </button>
          )}

          {/* Task lists */}
          {filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
              <svg className="w-10 h-10 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-sm text-gray-400 dark:text-gray-500">وظیفه‌ای یافت نشد</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Team tasks */}
              {(tab === 'all' || tab === 'team') && teamTasks.length > 0 && (
                <section>
                  {tab === 'all' && (
                    <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">وظایف تیمی ({teamTasks.length})</h2>
                  )}
                  <div className="flex flex-col gap-2">
                    {teamTasks.map(task => (
                      <WorkspaceTaskItem
                        key={task.id}
                        task={task}
                        members={members}
                        isManager={isManager}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Personal tasks */}
              {(tab === 'all' || tab === 'personal') && personalTasks.length > 0 && (
                <section>
                  {tab === 'all' && (
                    <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">وظایف شخصی ({personalTasks.length})</h2>
                  )}
                  <div className="flex flex-col gap-2">
                    {personalTasks.map(task => (
                      <WorkspaceTaskItem
                        key={task.id}
                        task={task}
                        members={members}
                        isManager={isManager}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </>
      )}

      {/* Create modal */}
      {showCreate && (
        <CreateWorkspaceTaskModal
          members={members}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  );
}
