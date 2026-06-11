export type Priority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'Backlog' | 'To Do' | 'In Progress' | 'Review' | 'Done';
export type SprintStatus = 'Planned' | 'Active' | 'Completed';

export type UserDoc = {
  _id: string;
  name: string;
  email?: string;
  role?: string;
};

export type WorkspaceDoc = {
  _id: string;
  name: string;
};

export type BoardDoc = {
  _id: string;
  name: string;
  workspaceId: string | { _id: string; name?: string };
};

export type SprintDoc = {
  _id: string;
  name: string;
  goal?: string;
  status: SprintStatus;
  startDate?: string;
  endDate?: string;
  boardId: string;
};

export type ChecklistItem = {
  _id?: string;
  text: string;
  isDone: boolean;
};

export type TaskDoc = {
  _id: string;
  title: string;
  description?: string;
  priority?: Priority;
  status?: TaskStatus;
  assignee?: UserDoc | string | null;
  boardId: string;
  sprintId?: SprintDoc | string | null;
  storyPoints?: number;
  labels?: string[];
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
  aiGeneratedDetails?: {
    acceptanceCriteria?: string[];
    subtasksChecklist?: ChecklistItem[];
  };
};

export type CommentDoc = {
  _id: string;
  text: string;
  userId?: UserDoc | string;
  createdAt?: string;
};

export type SprintGroup = {
  id: string;
  title: string;
  statusLabel: string;
  tasks: TaskDoc[];
  sprint?: SprintDoc;
};