export type WorkspaceRole = 'manager' | 'member';
export type WorkspaceTaskType = 'team' | 'personal';
export type WorkspaceTaskStatus = 'pending' | 'done' | 'not_done';

export interface Workspace {
  id: string;
  name: string;
  created_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  display_name: string;
}

export interface WorkspaceTask {
  id: string;
  workspace_id: string;
  title: string;
  description?: string;
  type: WorkspaceTaskType;
  created_by: string;
  assigned_to?: string | null;
  status: WorkspaceTaskStatus;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
}
