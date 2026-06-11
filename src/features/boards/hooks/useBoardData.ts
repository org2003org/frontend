import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/api';

import {
  getTaskComments,
  createTaskComment,
  updateTask,
  getWorkspaceMembers,
} from '../../backlog/api/backlog.api';
import type { CommentDoc, UserDoc as BacklogUserDoc } from '../../backlog/types/backlog.types';
import { getApiError } from '../../backlog/utils/backlog.utils';

import type { BoardDoc, SprintDoc, TaskDoc, TaskStatus } from '../types/boards.types';

export interface UseBoardDataReturn {
  // Workspace
  workspaceMongoId: string | null;
  workspaceError: string;

  // Boards
  boards: BoardDoc[];
  selectedBoardId: string | null;
  loadingBoards: boolean;
  boardsError: string;
  selectBoard: (id: string) => void;
  handleBoardCreated: (board: BoardDoc) => void;

  // Sprints
  sprints: SprintDoc[];
  loadingSprints: boolean;
  selectedSprintId: string;
  setSelectedSprintId: (id: string) => void;

  // Tasks
  tasks: TaskDoc[];
  loadingTasks: boolean;
  tasksError: string;
  issueNumbers: Record<string, string>;

  // Team members
  teamMembers: BacklogUserDoc[];

  // Task detail dialog
  selectedTask: TaskDoc | null;
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  comments: CommentDoc[];
  commentsLoading: boolean;
  savingTask: boolean;
  handlePatchSelectedTask: (patch: Partial<TaskDoc>) => Promise<void>;
  handleAddComment: (text: string) => Promise<void>;

  // Create issue
  handleCreatedIssue: (task: any) => void;

  // Drag & drop
  handleDragStart: (taskId: string, from: TaskStatus) => void;
  handleDrop: (to: TaskStatus) => Promise<void>;
}

export function useBoardData(projectId?: string): UseBoardDataReturn {
  const { user } = useAuth();

  // ── Workspace ──
  const [workspaceMongoId, setWorkspaceMongoId] = useState<string | null>(null);
  const [workspaceError, setWorkspaceError] = useState('');

  // ── Boards ──
  const [boards, setBoards] = useState<BoardDoc[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [loadingBoards, setLoadingBoards] = useState(true);
  const [boardsError, setBoardsError] = useState('');

  // ── Sprints ──
  const [sprints, setSprints] = useState<SprintDoc[]>([]);
  const [loadingSprints, setLoadingSprints] = useState(false);
  const [selectedSprintId, setSelectedSprintId] = useState('');

  // ── Tasks ──
  const [tasks, setTasks] = useState<TaskDoc[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [tasksError, setTasksError] = useState('');

  // ── Drag ──
  const [dragState, setDragState] = useState<{ taskId: string; from: TaskStatus } | null>(null);

  // ── Team members ──
  const [teamMembers, setTeamMembers] = useState<BacklogUserDoc[]>([]);

  // ── Task detail dialog ──
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [comments, setComments] = useState<CommentDoc[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [savingTask, setSavingTask] = useState(false);

  // ── 1. Resolve workspace Mongo _id ──
  useEffect(() => {
    if (!projectId) return;
    api.get('/workspaces')
      .then(({ data }) => {
        const list: any[] = data.data ?? data;
        const ws = list.find((w: any) =>
          w.name === projectId ||
          w.name.toLowerCase().replace(/\s+/g, '-') === projectId.toLowerCase()
        );
        setWorkspaceMongoId(ws ? ws._id : list[0]?._id ?? null);
      })
      .catch(() => setWorkspaceError('Could not load workspace info'));
  }, [projectId]);

  // ── 2. Fetch team members ──
  useEffect(() => {
    if (!workspaceMongoId) return;
    getWorkspaceMembers(workspaceMongoId)
      .then(setTeamMembers)
      .catch(() => setTeamMembers([]));
  }, [workspaceMongoId]);

  // ── 3. Fetch boards ──
  const fetchBoards = useCallback(async () => {
    if (!workspaceMongoId) return;
    setLoadingBoards(true);
    setBoardsError('');
    try {
      const { data } = await api.get(`/boards/workspace/${workspaceMongoId}`);
      const list: BoardDoc[] = data.data ?? data;
      setBoards(list);
      if (list.length > 0 && !selectedBoardId) setSelectedBoardId(list[0]._id);
    } catch (e: any) {
      setBoardsError(e?.response?.data?.message ?? 'Failed to load boards');
    } finally {
      setLoadingBoards(false);
    }
  }, [workspaceMongoId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchBoards(); }, [fetchBoards]);

  // ── 4. Fetch sprints on board change ──
  useEffect(() => {
    if (!selectedBoardId) { setSprints([]); return; }
    setLoadingSprints(true);
    setSelectedSprintId('');
    api.get(`/sprints/board/${selectedBoardId}`)
      .then(({ data }) => setSprints(data.data ?? data ?? []))
      .catch(() => setSprints([]))
      .finally(() => setLoadingSprints(false));
  }, [selectedBoardId]);

  // ── 5. Fetch tasks ──
  const fetchTasks = useCallback(async () => {
    if (!selectedBoardId) return;
    setLoadingTasks(true);
    setTasksError('');
    try {
      const { data } = await api.get(`/tasks/board/${selectedBoardId}`);
      setTasks(Array.isArray(data) ? data : (data.data ?? []));
    } catch (e: any) {
      setTasksError(e?.response?.data?.message ?? 'Failed to load tasks');
    } finally {
      setLoadingTasks(false);
    }
  }, [selectedBoardId]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // ── Issue numbers ──
  const issueNumbers = useMemo(() =>
    tasks.reduce<Record<string, string>>((acc, task, i) => {
      acc[task._id] = `ZAB-${i + 1}`;
      return acc;
    }, {}),
  [tasks]);

  // ── Selected task ──
  const selectedTask = useMemo(
    () => tasks.find(t => t._id === selectedTaskId) ?? null,
    [tasks, selectedTaskId],
  );

  // ── Load comments when a task is selected ──
  useEffect(() => {
    if (!selectedTaskId) { setComments([]); return; }
    setCommentsLoading(true);
    getTaskComments(selectedTaskId)
      .then(setComments)
      .catch(() => setComments([]))
      .finally(() => setCommentsLoading(false));
  }, [selectedTaskId]);

  // ── Patch selected task ──
  const handlePatchSelectedTask = async (patch: Partial<TaskDoc>) => {
    if (!selectedTaskId) return;
    setSavingTask(true);
    const previousTasks = tasks;
    setTasks(prev => prev.map(t => t._id === selectedTaskId ? { ...t, ...patch } : t));
    try {
      const updated = await updateTask(selectedTaskId, patch as any);
      setTasks(prev => prev.map(t => t._id === selectedTaskId ? { ...t, ...updated as any } : t));
    } catch (err: any) {
      setTasks(previousTasks);
      setTasksError(getApiError(err, 'Failed to save task'));
    } finally {
      setSavingTask(false);
    }
  };

  // ── Add comment ──
  const handleAddComment = async (commentText: string) => {
    if (!selectedTaskId) return;
    const created = await createTaskComment(selectedTaskId, commentText);
    const commentWithUser: CommentDoc = {
      ...created,
      userId:
        typeof created.userId === 'object' && created.userId
          ? created.userId
          : user
            ? { _id: user._id, name: user.name, email: user.email, role: user.role }
            : created.userId,
      createdAt: created.createdAt ?? new Date().toISOString(),
    };
    setComments(prev => [...prev, commentWithUser]);
  };

  // ── Created issue ──
  const handleCreatedIssue = (task: any) => setTasks(prev => [task, ...prev]);

  // ── Board selection ──
  const selectBoard = (id: string) => {
    setSelectedBoardId(id);
    setTasks([]);
  };

  const handleBoardCreated = (board: BoardDoc) => {
    setBoards(prev => [...prev, board]);
    setSelectedBoardId(board._id);
    setTasks([]);
    setSprints([]);
  };

  // ── Drag & drop ──
  const handleDragStart = (taskId: string, from: TaskStatus) => setDragState({ taskId, from });

  const handleDrop = async (to: TaskStatus) => {
    if (!dragState || dragState.from === to) { setDragState(null); return; }
    const { taskId, from } = dragState;
    setDragState(null);
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: to } : t));
    try {
      await api.put(`/tasks/${taskId}/status`, { status: to });
    } catch {
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: from } : t));
    }
  };

  return {
    workspaceMongoId,
    workspaceError,
    boards,
    selectedBoardId,
    loadingBoards,
    boardsError,
    selectBoard,
    handleBoardCreated,
    sprints,
    loadingSprints,
    selectedSprintId,
    setSelectedSprintId,
    tasks,
    loadingTasks,
    tasksError,
    issueNumbers,
    teamMembers,
    selectedTask,
    selectedTaskId,
    setSelectedTaskId,
    comments,
    commentsLoading,
    savingTask,
    handlePatchSelectedTask,
    handleAddComment,
    handleCreatedIssue,
    handleDragStart,
    handleDrop,
  };
}
