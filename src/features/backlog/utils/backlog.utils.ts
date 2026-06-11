import type { TaskDoc } from '../types/backlog.types';

export function unwrap<T>(payload: any, fallback: T): T {
  return (payload?.data ?? payload ?? fallback) as T;
}

export function getApiError(error: any, fallback: string) {
  return error?.response?.data?.message ?? error?.message ?? fallback;
}

export function uniqueById<T extends { _id: string }>(items: T[]) {
  return Array.from(new Map(items.map((item) => [item._id, item])).values());
}

export function getSprintId(task: TaskDoc) {
  if (!task.sprintId) return null;
  return typeof task.sprintId === 'string' ? task.sprintId : task.sprintId._id;
}

export function getAssigneeId(task: TaskDoc) {
  if (!task.assignee) return '';
  return typeof task.assignee === 'string' ? task.assignee : task.assignee._id;
}

export function getAssigneeName(task: TaskDoc) {
  if (!task.assignee) return 'Unassigned';
  return typeof task.assignee === 'string' ? 'Assigned' : task.assignee.name;
}

export function initials(name: string) {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function avatarColor(name: string) {
  const palette = ['#8B5CF6', '#6366F1', '#F97316', '#0EA5E9', '#14B8A6', '#EC4899'];
  let total = 0;
  for (let i = 0; i < name.length; i += 1) total += name.charCodeAt(i);
  return palette[total % palette.length];
}

export function formatShortDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}-${day}`;
}

export function formatInputDate(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

export function formatFullDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toISOString().slice(0, 10);
}

export function timeAgo(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.floor(diff / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
