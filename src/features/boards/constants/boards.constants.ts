import type { Priority, TaskStatus, SprintStatus } from '../types/boards.types';

export const PRIORITY_CONFIG: Record<Priority, { color: string; bg: string }> = {
  Low:    { color: '#4CAF50', bg: '#E8F5E9' },
  Medium: { color: '#7C4DFF', bg: '#EDE7F6' },
  High:   { color: '#FF9800', bg: '#FFF3E0' },
};

export const LABEL_COLORS: Record<string, { color: string; bg: string }> = {
  Frontend:    { color: '#7C4DFF', bg: '#EDE7F6' },
  Backend:     { color: '#0288D1', bg: '#E1F5FE' },
  Design:      { color: '#E91E63', bg: '#FCE4EC' },
  API:         { color: '#00897B', bg: '#E0F2F1' },
  Bug:         { color: '#F44336', bg: '#FFEBEE' },
  Performance: { color: '#FF5722', bg: '#FBE9E7' },
  Auth:        { color: '#6D4C41', bg: '#EFEBE9' },
  DevOps:      { color: '#546E7A', bg: '#ECEFF1' },
};

export const COLUMN_ORDER: TaskStatus[] = ['Backlog', 'To Do', 'In Progress', 'Review', 'Done'];

export const COLUMN_DOT: Record<TaskStatus, string> = {
  'Backlog':     '#9E9E9E',
  'To Do':       '#2196F3',
  'In Progress': '#FF9800',
  'Review':      '#9C27B0',
  'Done':        '#4CAF50',
};

export const SPRINT_STATUS_COLOR: Record<SprintStatus, { color: string; bg: string }> = {
  Planned:   { color: '#757575', bg: '#F5F5F5' },
  Active:    { color: '#00897B', bg: '#E0F2F1' },
  Completed: { color: '#7C4DFF', bg: '#EDE7F6' },
};
