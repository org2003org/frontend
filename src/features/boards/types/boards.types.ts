export type Priority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'Backlog' | 'To Do' | 'In Progress' | 'Review' | 'Done';
export type SprintStatus = 'Planned' | 'Active' | 'Completed';

export interface BoardDoc {
  _id: string;
  name: string;
  workspaceId: string;
  createdAt: string;
}

export interface SprintDoc {
  _id: string;
  name: string;
  status: SprintStatus;
  startDate: string;
  endDate: string;
  boardId: string;
}

export interface TaskDoc {
  _id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  assignee?: { _id: string; name: string; email: string } | string | null;
  boardId: string;
  sprintId?: string | null;
  storyPoints?: number;
  labels: string[];
  dueDate?: string;
  createdAt: string;
}
