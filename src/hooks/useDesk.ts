import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { DeskWorkspace, DeskSession, DeskMember, DeskTask, DeskTaskType, DeskTaskStatus } from '../types/desk';
import { generateId } from '../utils/id';
import { now } from '../utils/date';

const SESSION_KEY = 'desk_session';

// ── description metadata codec ────────────────────────────────────────────────
// The live `desk_tasks` table has no `urgent` / `completion_note` columns, so we
// transparently pack those fields into the existing `description` column behind a
// sentinel. Everything outside this hook sees clean DeskTask fields.
const META_MARK = '§META§';

interface DeskMeta { urgent?: boolean; completionNote?: string }

function packDescription(description: string | undefined, meta: DeskMeta): string | null {
  const payload: Record<string, unknown> = {};
  if (meta.urgent) payload.u = 1;
  if (meta.completionNote) payload.n = meta.completionNote;
  const base = (description ?? '').trim();
  if (Object.keys(payload).length === 0) return base || null;
  return `${base}\n${META_MARK}${JSON.stringify(payload)}`;
}

function unpackDescription(stored: string | null | undefined): {
  description?: string; urgent: boolean; completionNote?: string;
} {
  if (!stored) return { description: undefined, urgent: false, completionNote: undefined };
  const i = stored.indexOf(META_MARK);
  if (i === -1) return { description: stored, urgent: false, completionNote: undefined };
  const desc = stored.slice(0, i).replace(/\n+$/, '');
  let meta: any = {};
  try { meta = JSON.parse(stored.slice(i + META_MARK.length)); } catch { /* ignore */ }
  return {
    description: desc || undefined,
    urgent: !!meta.u,
    completionNote: meta.n || undefined,
  };
}

// ── urgent-task notifications ─────────────────────────────────────────────────
function showUrgentNotification(title: string) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const icon = `${import.meta.env.BASE_URL}icons/icon-192.png`;
  const body = 'مدیر یک کار فوری برای شما تعیین کرده';
  const opts: NotificationOptions = {
    body, icon, badge: icon, tag: `urgent-${Date.now()}`, requireInteraction: true,
    // @ts-ignore
    dir: 'rtl',
  };
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(reg => reg.showNotification(`🚨 کار فوری: ${title}`, opts))
      .catch(() => { try { new Notification(`🚨 کار فوری: ${title}`, opts); } catch { /* ignore */ } });
  } else {
    try { new Notification(`🚨 کار فوری: ${title}`, opts); } catch { /* ignore */ }
  }
}

// Remember which urgent tasks we've already alerted on (per member), so neither
// the realtime path, the polling fallback, nor reopening the app double-fires.
function notifiedKey(memberId: string) { return `desk_notified_urgent_${memberId}`; }
function loadNotified(memberId: string): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(notifiedKey(memberId)) ?? '[]')); }
  catch { return new Set(); }
}
function saveNotified(memberId: string, ids: Set<string>) {
  try { localStorage.setItem(notifiedKey(memberId), JSON.stringify([...ids].slice(-200))); }
  catch { /* ignore */ }
}

function loadSession(): DeskSession | null {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null'); } catch { return null; }
}
function saveSession(s: DeskSession | null) {
  if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  else localStorage.removeItem(SESSION_KEY);
}

export function useDesk() {
  const [session, setSession] = useState<DeskSession | null>(loadSession);
  const [workspace, setWorkspace] = useState<DeskWorkspace | null>(null);
  const [loading, setLoading] = useState(false);

  const loadWorkspace = useCallback(async (workspaceId: string) => {
    if (!supabase) return;
    setLoading(true);
    try {
      const { data: ws } = await supabase
        .from('desk_workspaces')
        .select('*')
        .eq('id', workspaceId)
        .single();
      if (!ws) { setWorkspace(null); return; }

      const { data: members } = await supabase
        .from('desk_members')
        .select('*')
        .eq('workspace_id', workspaceId);

      const { data: tasks } = await supabase
        .from('desk_tasks')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      setWorkspace({
        id: ws.id,
        name: ws.name,
        managerPin: ws.manager_pin,
        joinCode: ws.join_code,
        members: (members ?? []).map((m: any) => ({
          id: m.id, name: m.name, role: m.role, joinedAt: m.joined_at,
        })),
        tasks: (tasks ?? []).map((t: any) => {
          const meta = unpackDescription(t.description);
          return {
            id: t.id, title: t.title, description: meta.description,
            type: t.type, assignedTo: t.assigned_to, createdBy: t.created_by,
            status: t.status, urgent: meta.urgent,
            completionNote: meta.completionNote,
            createdAt: t.created_at,
          };
        }),
        createdAt: ws.created_at,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.workspaceId) loadWorkspace(session.workspaceId);
    else setWorkspace(null);
  }, [session, loadWorkspace]);

  // Ask for notification permission once in a workspace so urgent-task alerts
  // can actually reach this member.
  useEffect(() => {
    if (session?.workspaceId && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => { /* ignore */ });
    }
  }, [session?.workspaceId]);

  // Realtime sync for members and tasks (+ polling fallback in case Realtime
  // is not enabled on the desk_* tables). Notifications themselves are fired by
  // the deduped checker effect below, driven off the loaded `workspace`.
  useEffect(() => {
    if (!supabase || !session?.workspaceId) return;
    const wsId = session.workspaceId;

    const channel = supabase
      .channel(`desk-${wsId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'desk_members', filter: `workspace_id=eq.${wsId}` }, () => loadWorkspace(wsId))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'desk_tasks', filter: `workspace_id=eq.${wsId}` }, () => loadWorkspace(wsId))
      .subscribe();

    // Polling fallback — keeps tasks (and therefore urgent alerts) flowing even
    // if Realtime isn't delivering, as long as the app is open/foreground.
    const poll = setInterval(() => {
      if (document.visibilityState === 'visible') loadWorkspace(wsId);
    }, 20_000);
    const onVisible = () => { if (document.visibilityState === 'visible') loadWorkspace(wsId); };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);

    return () => {
      supabase!.removeChannel(channel);
      clearInterval(poll);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [session?.workspaceId, loadWorkspace]);

  // Fire urgent notifications for tasks assigned to me that I haven't been
  // alerted about yet. Runs after every load (realtime, poll, or initial), so
  // it also catches up urgent tasks created while the app was closed.
  useEffect(() => {
    if (!workspace || !session) return;
    const me = session.memberId;
    // First run for this member: seed silently so we don't dump every existing
    // urgent task as a notification at once.
    const firstRun = localStorage.getItem(notifiedKey(me)) === null;
    const notified = loadNotified(me);
    let changed = false;
    for (const t of workspace.tasks) {
      if (!t.urgent || t.status !== 'pending') continue;
      const isForMe = t.assignedTo
        ? t.assignedTo === me
        : t.createdBy !== me; // public urgent → everyone but the creator
      if (!isForMe) continue;
      if (notified.has(t.id)) continue;
      if (!firstRun) showUrgentNotification(t.title);
      notified.add(t.id);
      changed = true;
    }
    if (changed || firstRun) saveNotified(me, notified);
  }, [workspace, session]);

  const createWorkspace = useCallback(async (name: string, managerName: string, managerPin: string): Promise<string | null> => {
    if (!supabase) return 'Supabase پیکربندی نشده';
    if (name.trim().length < 2) return 'نام میزکار باید حداقل ۲ حرف باشد';
    if (managerPin.length !== 4 || !/^\d{4}$/.test(managerPin)) return 'پین باید ۴ رقم عددی باشد';

    const wsId = generateId();
    const managerId = generateId();
    const joinCode = generateId().slice(0, 8).toUpperCase();

    const { error: wsErr } = await supabase.from('desk_workspaces').insert({
      id: wsId, name: name.trim(), manager_pin: managerPin, join_code: joinCode,
    });
    if (wsErr) return wsErr.message;

    const { error: mErr } = await supabase.from('desk_members').insert({
      id: managerId, workspace_id: wsId, name: managerName.trim(), role: 'manager', joined_at: now(),
    });
    if (mErr) return mErr.message;

    const s: DeskSession = { workspaceId: wsId, memberId: managerId, role: 'manager', memberName: managerName.trim() };
    setSession(s);
    saveSession(s);
    return null;
  }, []);

  const joinWorkspace = useCallback(async (joinCode: string, memberName: string): Promise<string | null> => {
    if (!supabase) return 'Supabase پیکربندی نشده';
    if (!memberName.trim()) return 'نام الزامی است';

    const { data: ws } = await supabase
      .from('desk_workspaces')
      .select('*')
      .eq('join_code', joinCode.trim().toUpperCase())
      .single();

    if (!ws) return 'کد وارد شده معتبر نیست';

    const memberId = generateId();
    const { error } = await supabase.from('desk_members').insert({
      id: memberId, workspace_id: ws.id, name: memberName.trim(), role: 'member', joined_at: now(),
    });
    if (error) return error.message;

    const s: DeskSession = { workspaceId: ws.id, memberId, role: 'member', memberName: memberName.trim() };
    setSession(s);
    saveSession(s);
    return null;
  }, []);

  const managerLogin = useCallback(async (joinCode: string, pin: string): Promise<string | null> => {
    if (!supabase) return 'Supabase پیکربندی نشده';

    const { data: ws } = await supabase
      .from('desk_workspaces')
      .select('*')
      .eq('join_code', joinCode.trim().toUpperCase())
      .single();

    if (!ws) return 'کد میزکار معتبر نیست';
    if (ws.manager_pin !== pin) return 'پین مدیر اشتباه است';

    const { data: members } = await supabase
      .from('desk_members')
      .select('*')
      .eq('workspace_id', ws.id)
      .eq('role', 'manager');

    const manager = members?.[0];
    if (!manager) return 'مدیر یافت نشد';

    const s: DeskSession = { workspaceId: ws.id, memberId: manager.id, role: 'manager', memberName: manager.name };
    setSession(s);
    saveSession(s);
    return null;
  }, []);

  const logout = useCallback(() => {
    setSession(null);
    saveSession(null);
    setWorkspace(null);
  }, []);

  const addTask = useCallback(async (
    title: string, type: DeskTaskType, assignedTo?: string, description?: string, urgent?: boolean,
  ): Promise<string | null> => {
    if (!supabase || !workspace || !session) return 'خطا';
    if (!title.trim()) return 'عنوان الزامی است';

    const { error } = await supabase.from('desk_tasks').insert({
      id: generateId(),
      workspace_id: workspace.id,
      title: title.trim(),
      description: packDescription(description, { urgent: urgent ?? false }),
      type,
      assigned_to: assignedTo ?? null,
      created_by: session.memberId,
      status: 'pending',
      created_at: now(),
    });
    return error ? error.message : null;
  }, [workspace, session]);

  const setTaskStatus = useCallback(async (taskId: string, status: DeskTaskStatus, completionNote?: string) => {
    if (!supabase) return;
    const update: Record<string, any> = { status };
    if (status === 'done' && completionNote !== undefined) {
      // Repack the completion note into `description`, preserving the real
      // description and the urgent flag already stored there.
      const { data: row } = await supabase
        .from('desk_tasks')
        .select('description')
        .eq('id', taskId)
        .single();
      const meta = unpackDescription(row?.description);
      update.description = packDescription(meta.description, {
        urgent: meta.urgent,
        completionNote: completionNote || undefined,
      });
    }
    await supabase.from('desk_tasks').update(update).eq('id', taskId);
  }, []);

  const deleteTask = useCallback(async (taskId: string) => {
    if (!supabase) return;
    await supabase.from('desk_tasks').delete().eq('id', taskId);
  }, []);

  return {
    session, workspace, loading,
    createWorkspace, joinWorkspace, managerLogin, logout,
    addTask, setTaskStatus, deleteTask,
  };

}
