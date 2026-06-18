export type DeskRole = 'manager' | 'member';
export type DeskTaskStatus = 'pending' | 'done';
export type DeskTaskType = 'public' | 'personal';

export interface DeskMember {
  id: string;
  name: string;
  role: DeskRole;
  joinedAt: string;
}

export interface DeskTask {
  id: string;
  title: string;
  description?: string;
  type: DeskTaskType;
  assignedTo?: string; // member id (for personal tasks)
  createdBy: string;   // member id
  status: DeskTaskStatus;
  urgent?: boolean;
  completionNote?: string;
  createdAt: string;
}

export interface DeskWorkspace {
  id: string;
  name: string;
  managerPin: string; // 4-digit PIN for manager
  joinCode: string;   // code manager shares with members
  members: DeskMember[];
  tasks: DeskTask[];
  createdAt: string;
}

export interface DeskSession {
  workspaceId: string;
  memberId: string;
  role: DeskRole;
  memberName: string;
}
