import { useState, useCallback } from 'react';
import { DeskWorkspace, DeskSession, DeskMember, DeskTask, DeskTaskType, DeskTaskStatus } from '../types/desk';
import { generateId } from '../utils/id';
import { now } from '../utils/date';

const WS_KEY = 'desk_workspaces';
const SESSION_KEY = 'desk_session';

function loadWorkspaces(): DeskWorkspace[] {
  try { return JSON.parse(localStorage.getItem(WS_KEY) ?? '[]'); } catch { return []; }
}
function saveWorkspaces(ws: DeskWorkspace[]) {
  localStorage.setItem(WS_KEY, JSON.stringify(ws));
}
function loadSession(): DeskSession | null {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null'); } catch { return null; }
}
function saveSession(s: DeskSession | null) {
  if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  else localStorage.removeItem(SESSION_KEY);
}

function encodeJoinCode(wsId: string, wsName: string): string {
  const payload = JSON.stringify({ id: wsId, name: wsName });
  return btoa(unescape(encodeURIComponent(payload)));
}

function decodeJoinCode(code: string): { id: string; name: string } | null {
  try {
    const decoded = JSON.parse(decodeURIComponent(escape(atob(code))));
    if (decoded?.id && decoded?.name) return decoded;
    return null;
  } catch {
    return null;
  }
}

export function useDesk() {
  const [workspaces, setWorkspaces] = useState<DeskWorkspace[]>(loadWorkspaces);
  const [session, setSession] = useState<DeskSession | null>(loadSession);

  const currentWs = workspaces.find(w => w.id === session?.workspaceId) ?? null;

  function persist(updated: DeskWorkspace[]) {
    setWorkspaces(updated);
    saveWorkspaces(updated);
  }

  // ── Auth ────────────────────────────────────────────────────────────────────

  const createWorkspace = useCallback((name: string, managerName: string, managerPin: string): string | null => {
    if (name.trim().length < 2) return 'نام میزکار باید حداقل ۲ حرف باشد';
    if (managerPin.length !== 4 || !/^\d{4}$/.test(managerPin)) return 'پین باید ۴ رقم عددی باشد';

    const managerId = generateId();
    const wsId = generateId();
    const manager: DeskMember = { id: managerId, name: managerName.trim(), role: 'manager', joinedAt: now() };
    const ws: DeskWorkspace = {
      id: wsId,
      name: name.trim(),
      managerPin,
      joinCode: encodeJoinCode(wsId, name.trim()),
      members: [manager],
      tasks: [],
      createdAt: now(),
    };
    const updated = [...workspaces, ws];
    persist(updated);
    const s: DeskSession = { workspaceId: ws.id, memberId: managerId, role: 'manager', memberName: managerName.trim() };
    setSession(s);
    saveSession(s);
    return null;
  }, [workspaces]);

  const joinWorkspace = useCallback((joinCode: string, memberName: string): string | null => {
    if (!memberName.trim()) return 'نام الزامی است';

    const trimmed = joinCode.trim();

    // same-device: find by stored joinCode
    let ws = workspaces.find(w => w.joinCode === trimmed);

    // cross-device: decode workspace info from the code itself
    if (!ws) {
      const decoded = decodeJoinCode(trimmed);
      if (!decoded) return 'کد وارد شده معتبر نیست';

      // if workspace already exists locally (different code format), use it
      ws = workspaces.find(w => w.id === decoded.id);

      if (!ws) {
        // create a local skeleton of the workspace on this device
        const skeletonWs: DeskWorkspace = {
          id: decoded.id,
          name: decoded.name,
          managerPin: '',
          joinCode: trimmed,
          members: [],
          tasks: [],
          createdAt: now(),
        };
        const memberId = generateId();
        const member: DeskMember = { id: memberId, name: memberName.trim(), role: 'member', joinedAt: now() };
        skeletonWs.members = [member];
        persist([...workspaces, skeletonWs]);
        const s: DeskSession = { workspaceId: skeletonWs.id, memberId, role: 'member', memberName: memberName.trim() };
        setSession(s);
        saveSession(s);
        return null;
      }
    }

    const memberId = generateId();
    const member: DeskMember = { id: memberId, name: memberName.trim(), role: 'member', joinedAt: now() };
    const updated = workspaces.map(w =>
      w.id === ws!.id ? { ...w, members: [...w.members, member] } : w
    );
    persist(updated);
    const s: DeskSession = { workspaceId: ws.id, memberId, role: 'member', memberName: memberName.trim() };
    setSession(s);
    saveSession(s);
    return null;
  }, [workspaces]);

  const managerLogin = useCallback((joinCode: string, pin: string): string | null => {
    const ws = workspaces.find(w => w.joinCode === joinCode.trim().toUpperCase());
    if (!ws) return 'کد میزکار معتبر نیست';
    if (ws.managerPin !== pin) return 'پین مدیر اشتباه است';
    const manager = ws.members.find(m => m.role === 'manager');
    if (!manager) return 'مدیر یافت نشد';
    const s: DeskSession = { workspaceId: ws.id, memberId: manager.id, role: 'manager', memberName: manager.name };
    setSession(s);
    saveSession(s);
    return null;
  }, [workspaces]);

  const logout = useCallback(() => {
    setSession(null);
    saveSession(null);
  }, []);

  // ── Tasks ───────────────────────────────────────────────────────────────────

  const addTask = useCallback((
    title: string,
    type: DeskTaskType,
    assignedTo?: string,
    description?: string,
  ): string | null => {
    if (!currentWs || !session) return 'خطا';
    if (!title.trim()) return 'عنوان الزامی است';
    const task: DeskTask = {
      id: generateId(),
      title: title.trim(),
      description: description?.trim() || undefined,
      type,
      assignedTo,
      createdBy: session.memberId,
      status: 'pending',
      createdAt: now(),
    };
    const updated = workspaces.map(w =>
      w.id === currentWs.id ? { ...w, tasks: [task, ...w.tasks] } : w
    );
    persist(updated);
    return null;
  }, [currentWs, session, workspaces]);

  const setTaskStatus = useCallback((taskId: string, status: DeskTaskStatus) => {
    if (!currentWs) return;
    const updated = workspaces.map(w =>
      w.id === currentWs.id
        ? { ...w, tasks: w.tasks.map(t => t.id === taskId ? { ...t, status } : t) }
        : w
    );
    persist(updated);
  }, [currentWs, workspaces]);

  const deleteTask = useCallback((taskId: string) => {
    if (!currentWs) return;
    const updated = workspaces.map(w =>
      w.id === currentWs.id ? { ...w, tasks: w.tasks.filter(t => t.id !== taskId) } : w
    );
    persist(updated);
  }, [currentWs, workspaces]);

  return {
    session,
    workspace: currentWs,
    createWorkspace,
    joinWorkspace,
    managerLogin,
    logout,
    addTask,
    setTaskStatus,
    deleteTask,
  };
}
