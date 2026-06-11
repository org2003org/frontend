import type { Priority, TaskStatus } from '../types/backlog.types';
export const purple = '#5B3FF3';
export const text = '#1F2937';
export const muted = '#98A2B3';
export const line = '#F2F4F7';

export const statusStyles: Record<TaskStatus, { color: string; bg: string }> = {
  Backlog: { color: '#344054', bg: '#F2F4F7' },
  'To Do': { color: '#4F46E5', bg: '#EEF2FF' },
  'In Progress': { color: '#B45309', bg: '#FEF3C7' },
  Review: { color: '#6D28D9', bg: '#F3E8FF' },
  Done: { color: '#047857', bg: '#D1FAE5' },
};

export const priorityDot: Record<Priority, string> = {
  Low: '#4CAF50',
  Medium: '#7C4DFF',
  High: '#FF9800',
};

export const labelStyles: Record<string, { color: string; bg: string }> = {
  backend: { color: '#7C3AED', bg: '#F1E8FF' },
  auth: { color: '#DB2777', bg: '#FCE7F3' },
  frontend: { color: '#4F46E5', bg: '#EEF2FF' },
  design: { color: '#D97706', bg: '#FEF3C7' },
  bug: { color: '#DC2626', bg: '#FEE2E2' },
  performance: { color: '#EA580C', bg: '#FFEDD5' },
  api: { color: '#059669', bg: '#D1FAE5' },
};

export const statusDot: Record<TaskStatus, string> = {
  Backlog: '#98A2B3',
  'To Do': '#2E90FA',
  'In Progress': '#F59E0B',
  Review: '#7C3AED',
  Done: '#12B76A',
};
