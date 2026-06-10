import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import api from './api';

export interface MemberDoc {
  _id: string;
  name: string;
  email: string;
  role?: string;
}

export interface BoardDoc {
  _id: string;
  name: string;
  workspaceId: string;
  createdAt: string;
}

export interface SprintDoc {
  _id: string;
  name: string;
  goal?: string;
  status: 'Planned' | 'Active' | 'Completed';
  startDate: string;
  endDate: string;
  boardId: string;
}

export interface TaskDoc {
  _id: string;
  title: string;
  description?: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Backlog' | 'To Do' | 'In Progress' | 'Review' | 'Done';
  assignee?: { _id: string; name: string; email: string };
  boardId: string;
  sprintId?: string | { _id: string; name: string } | null;
  storyPoints?: number;
  labels: string[];
  dueDate?: string;
  createdAt: string;
}

export type TaskStatus = 'Backlog' | 'To Do' | 'In Progress' | 'Review' | 'Done';
export type Priority = 'Low' | 'Medium' | 'High';

export const STATUS_COLORS: Record<TaskStatus, string> = {
  Backlog: '#9E9E9E',
  'To Do': '#2196F3',
  'In Progress': '#FF9800',
  Review: '#9C27B0',
  Done: '#4CAF50',
};

export const PRIORITY_COLORS: Record<Priority, { color: string; bg: string }> = {
  Low: { color: '#4CAF50', bg: '#E8F5E9' },
  Medium: { color: '#7C4DFF', bg: '#EDE7F6' },
  High: { color: '#FF9800', bg: '#FFF3E0' },
};

export const STATUS_ORDER: TaskStatus[] = ['Backlog', 'To Do', 'In Progress', 'Review', 'Done'];
export const PRIORITY_ORDER: Priority[] = ['Low', 'Medium', 'High'];

export function avatarColor(name: string): string {
  const palette = ['#7C4DFF', '#E91E63', '#009688', '#FF5722', '#3F51B5', '#0288D1', '#F57C00'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return palette[Math.abs(h) % palette.length];
}

export function getInitials(name: string): string {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function useDashboardData() {
  const { projectId } = useParams<{ projectId: string }>();

  const [loading, setLoading] = useState(true);
  const [workspaceName, setWorkspaceName] = useState('');
  const [members, setMembers] = useState<MemberDoc[]>([]);
  const [boards, setBoards] = useState<BoardDoc[]>([]);
  const [allTasks, setAllTasks] = useState<TaskDoc[]>([]);
  const [allSprints, setAllSprints] = useState<SprintDoc[]>([]);
  const [error, setError] = useState('');

  const fetchAll = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError('');
    try {
      const wsRes = await api.get('/workspaces');
      const wsList: any[] = wsRes.data.data ?? wsRes.data;
      const ws = wsList.find(
        (w: any) =>
          w.name === projectId ||
          w.name.toLowerCase().replace(/\s+/g, '-') === projectId.toLowerCase()
      );
      const wsId = ws?._id ?? wsList[0]?._id;
      if (!wsId) { setLoading(false); return; }
      setWorkspaceName(ws?.name ?? projectId);

      try {
        const memRes = await api.get(`/workspaces/${wsId}/members`);
        const memData = memRes.data.data ?? memRes.data;
        const membersList: MemberDoc[] = memData.members ?? [];
        if (memData.owner && !membersList.find((m: MemberDoc) => m._id === memData.owner._id)) {
          membersList.unshift(memData.owner);
        }
        setMembers(membersList);
      } catch { setMembers([]); }

      const boardRes = await api.get(`/boards/workspace/${wsId}`);
      const boardList: BoardDoc[] = boardRes.data.data ?? boardRes.data;
      setBoards(boardList);

      const taskPromises = boardList.map(b =>
        api.get(`/tasks/board/${b._id}`).then(r => {
          const d = r.data;
          return (Array.isArray(d) ? d : d.data ?? []) as TaskDoc[];
        }).catch(() => [] as TaskDoc[])
      );
      const sprintPromises = boardList.map(b =>
        api.get(`/sprints/board/${b._id}`).then(r => {
          const d = r.data;
          return (Array.isArray(d) ? d : d.data ?? []) as SprintDoc[];
        }).catch(() => [] as SprintDoc[])
      );

      const [taskResults, sprintResults] = await Promise.all([
        Promise.all(taskPromises),
        Promise.all(sprintPromises),
      ]);

      setAllTasks(taskResults.flat());
      setAllSprints(sprintResults.flat());
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ─── Computed KPIs ────────────────────────────────────────
  const kpis = useMemo(() => {
    const totalTasks = allTasks.length;
    const totalBoards = boards.length;
    const activeSprints = allSprints.filter(s => s.status === 'Active').length;
    const totalStoryPoints = allTasks.reduce((s, t) => s + (t.storyPoints ?? 0), 0);
    const completedTasks = allTasks.filter(t => t.status === 'Done').length;
    return { totalTasks, totalBoards, activeSprints, totalStoryPoints, completedTasks };
  }, [allTasks, boards, allSprints]);

  const statusCounts = useMemo(() => {
    const counts: Record<TaskStatus, number> = { Backlog: 0, 'To Do': 0, 'In Progress': 0, Review: 0, Done: 0 };
    allTasks.forEach(t => { if (counts[t.status] !== undefined) counts[t.status]++; });
    return counts;
  }, [allTasks]);

  const priorityCounts = useMemo(() => {
    const counts: Record<Priority, number> = { Low: 0, Medium: 0, High: 0 };
    allTasks.forEach(t => { if (counts[t.priority] !== undefined) counts[t.priority]++; });
    return counts;
  }, [allTasks]);

  const activeSprintsList = useMemo(() => {
    return allSprints.filter(s => s.status === 'Active').map(sprint => {
      const sprintTasks = allTasks.filter(t => {
        const sid = typeof t.sprintId === 'object' && t.sprintId ? t.sprintId._id : t.sprintId;
        return sid === sprint._id;
      });
      const total = sprintTasks.length;
      const done = sprintTasks.filter(t => t.status === 'Done').length;
      const totalPts = sprintTasks.reduce((s, t) => s + (t.storyPoints ?? 0), 0);
      const donePts = sprintTasks.filter(t => t.status === 'Done').reduce((s, t) => s + (t.storyPoints ?? 0), 0);
      return { ...sprint, totalTasks: total, doneTasks: done, totalPts, donePts };
    });
  }, [allSprints, allTasks]);

  const boardStats = useMemo(() => {
    return boards.map(b => {
      const tasks = allTasks.filter(t => t.boardId === b._id);
      const done = tasks.filter(t => t.status === 'Done').length;
      return { ...b, taskCount: tasks.length, doneCount: done, pct: tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0 };
    });
  }, [boards, allTasks]);

  const upcomingDeadlines = useMemo(() => {
    const now = new Date();
    return allTasks
      .filter(t => t.dueDate && t.status !== 'Done')
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 10)
      .map(t => {
        const due = new Date(t.dueDate!);
        const diffDays = Math.ceil((due.getTime() - now.getTime()) / 86400000);
        const boardName = boards.find(b => b._id === t.boardId)?.name ?? '';
        return { ...t, diffDays, boardName };
      });
  }, [allTasks, boards]);

  const memberStats = useMemo(() => {
    return members.map(m => {
      const tasks = allTasks.filter(t => t.assignee?._id === m._id);
      const pts = tasks.reduce((s, t) => s + (t.storyPoints ?? 0), 0);
      const done = tasks.filter(t => t.status === 'Done').length;
      return { ...m, taskCount: tasks.length, points: pts, doneCount: done };
    }).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.doneCount !== a.doneCount) return b.doneCount - a.doneCount;
      return b.taskCount - a.taskCount;
    });
  }, [members, allTasks]);

  return {
    loading, error, workspaceName, members, boards, allTasks, allSprints,
    kpis, statusCounts, priorityCounts, activeSprintsList,
    boardStats, upcomingDeadlines, memberStats, refresh: fetchAll,
  };
}
