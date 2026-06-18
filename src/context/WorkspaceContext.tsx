import React, { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { Workspace, WorkspaceMember, WorkspaceTask, WorkspaceTaskStatus } from '../types/workspace';
import { sendWorkspaceAssignNotification, requestNotificationPermission } from '../utils/notifications';

interface WorkspaceContextValue {
  workspace: Workspace | null;
  members: WorkspaceMember[];
  tasks: WorkspaceTask[];
  myMember: WorkspaceMember | null;
  loading: boolean;
  error: string | null;
  createTask: (data: {
    title: string;
    description?: string;
    type: 'team' | 'personal';
    assigned_to?: string;
  }) => Promise<string | null>;
  updateTaskStatus: (taskId: string, status: WorkspaceTaskStatus) => Promise<string | null>;
  updateTask: (taskId: string, data: Partial<WorkspaceTask>) => Promise<string | null>;
  deleteTask: (taskId: string) => Promise<string | null>;
  refresh: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [tasks, setTasks] = useState<WorkspaceTask[]>([]);
  const [myMember, setMyMember] = useState<WorkspaceMember | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase || !user) {
      setWorkspace(null);
      setMembers([]);
      setTasks([]);
      setMyMember(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Load workspace membership
      const { data: memberRows, error: memberErr } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('user_id', user.id)
        .limit(1);

      if (memberErr) throw new Error(memberErr.message);
      if (!memberRows || memberRows.length === 0) {
        setWorkspace(null);
        setMembers([]);
        setTasks([]);
        setMyMember(null);
        return;
      }

      const myRow = memberRows[0] as WorkspaceMember;
      setMyMember(myRow);

      // Load workspace
      const { data: wsData, error: wsErr } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', myRow.workspace_id)
        .single();

      if (wsErr) throw new Error(wsErr.message);
      setWorkspace(wsData as Workspace);

      // Load all members of this workspace
      const { data: allMembers, error: membersErr } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('workspace_id', myRow.workspace_id);

      if (membersErr) throw new Error(membersErr.message);
      setMembers((allMembers ?? []) as WorkspaceMember[]);

      // Load tasks (RLS handles filtering)
      const { data: taskRows, error: taskErr } = await supabase
        .from('workspace_tasks')
        .select('*')
        .eq('workspace_id', myRow.workspace_id)
        .order('created_at', { ascending: false });

      if (taskErr) throw new Error(taskErr.message);
      setTasks((taskRows ?? []) as WorkspaceTask[]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'خطای ناشناخته');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  // Ask for notification permission once the user is in a workspace, so we can
  // alert them when a task gets assigned to them.
  useEffect(() => {
    if (workspace) requestNotificationPermission();
  }, [workspace]);

  // keep a ref to members so the realtime handler can resolve assigner names
  const membersRef = useRef<WorkspaceMember[]>(members);
  useEffect(() => { membersRef.current = members; }, [members]);

  // Realtime subscription for task changes
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !workspace || !user) return;

    const channel = supabase
      .channel(`workspace-tasks-${workspace.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'workspace_tasks',
        filter: `workspace_id=eq.${workspace.id}`,
      }, (payload) => {
        // Notify the assignee when a task is newly assigned to them.
        const next = payload.new as Partial<WorkspaceTask> | undefined;
        const prev = payload.old as Partial<WorkspaceTask> | undefined;
        const assignedToMe = next?.assigned_to === user.id;
        const wasAssignedToMe = prev?.assigned_to === user.id;
        const createdByMe = next?.created_by === user.id;
        if (assignedToMe && !wasAssignedToMe && !createdByMe && next?.title) {
          const by = membersRef.current.find(m => m.user_id === next.created_by);
          sendWorkspaceAssignNotification(next.title, by?.display_name);
        }
        load();
      })
      .subscribe();

    return () => { supabase!.removeChannel(channel); };
  }, [workspace, user, load]);

  async function createTask(data: {
    title: string;
    description?: string;
    type: 'team' | 'personal';
    assigned_to?: string;
  }): Promise<string | null> {
    if (!supabase || !workspace || !user) return 'خطای اتصال';
    const { error } = await supabase.from('workspace_tasks').insert({
      workspace_id: workspace.id,
      created_by: user.id,
      title: data.title,
      description: data.description ?? null,
      type: data.type,
      assigned_to: data.assigned_to ?? null,
      status: 'pending',
    });
    if (error) return error.message;
    await load();
    return null;
  }

  async function updateTaskStatus(taskId: string, status: WorkspaceTaskStatus): Promise<string | null> {
    if (!supabase) return 'خطای اتصال';
    const { error } = await supabase
      .from('workspace_tasks')
      .update({ status })
      .eq('id', taskId);
    if (error) return error.message;
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
    return null;
  }

  async function updateTask(taskId: string, data: Partial<WorkspaceTask>): Promise<string | null> {
    if (!supabase) return 'خطای اتصال';
    const { error } = await supabase
      .from('workspace_tasks')
      .update(data)
      .eq('id', taskId);
    if (error) return error.message;
    await load();
    return null;
  }

  async function deleteTask(taskId: string): Promise<string | null> {
    if (!supabase) return 'خطای اتصال';
    const { error } = await supabase
      .from('workspace_tasks')
      .delete()
      .eq('id', taskId);
    if (error) return error.message;
    setTasks(prev => prev.filter(t => t.id !== taskId));
    return null;
  }

  return (
    <WorkspaceContext.Provider value={{
      workspace, members, tasks, myMember, loading, error,
      createTask, updateTaskStatus, updateTask, deleteTask, refresh: load,
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
}
