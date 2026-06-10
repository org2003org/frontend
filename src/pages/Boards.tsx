import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Chip, Avatar, IconButton, Button, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions,
  MenuItem, Select, ToggleButton,
  ToggleButtonGroup, Tooltip, Divider,
  Paper, InputAdornment, LinearProgress, CircularProgress,
  Alert, Skeleton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import FlagIcon from '@mui/icons-material/Flag';
import CloseIcon from '@mui/icons-material/Close';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import RunCircleIcon from '@mui/icons-material/RunCircle';
import api from '../api/api';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ─── Types ─────────────────────────────────────────────────────────────────────

type Priority = 'Low' | 'Medium' | 'High';
type TaskStatus = 'Backlog' | 'To Do' | 'In Progress' | 'Review' | 'Done';
type SprintStatus = 'Planned' | 'Active' | 'Completed';

interface BoardDoc {
  _id: string;
  name: string;
  workspaceId: string;
  createdAt: string;
}

interface SprintDoc {
  _id: string;
  name: string;
  status: SprintStatus;
  startDate: string;
  endDate: string;
  boardId: string;
}

interface TaskDoc {
  _id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  assignee?: { _id: string; name: string; email: string };
  boardId: string;
  sprintId?: string | null;
  storyPoints?: number;
  labels: string[];
  dueDate?: string;
  createdAt: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const PRIORITY_CONFIG: Record<Priority, { color: string; bg: string }> = {
  Low:    { color: '#4CAF50', bg: '#E8F5E9' },
  Medium: { color: '#7C4DFF', bg: '#EDE7F6' },
  High:   { color: '#FF9800', bg: '#FFF3E0' },
};

const LABEL_COLORS: Record<string, { color: string; bg: string }> = {
  Frontend:    { color: '#7C4DFF', bg: '#EDE7F6' },
  Backend:     { color: '#0288D1', bg: '#E1F5FE' },
  Design:      { color: '#E91E63', bg: '#FCE4EC' },
  API:         { color: '#00897B', bg: '#E0F2F1' },
  Bug:         { color: '#F44336', bg: '#FFEBEE' },
  Performance: { color: '#FF5722', bg: '#FBE9E7' },
  Auth:        { color: '#6D4C41', bg: '#EFEBE9' },
  DevOps:      { color: '#546E7A', bg: '#ECEFF1' },
};

const COLUMN_ORDER: TaskStatus[] = ['Backlog', 'To Do', 'In Progress', 'Review', 'Done'];
const COLUMN_DOT: Record<TaskStatus, string> = {
  'Backlog':     '#9E9E9E',
  'To Do':       '#2196F3',
  'In Progress': '#FF9800',
  'Review':      '#9C27B0',
  'Done':        '#4CAF50',
};

const SPRINT_STATUS_COLOR: Record<SprintStatus, { color: string; bg: string }> = {
  Planned:   { color: '#757575', bg: '#F5F5F5' },
  Active:    { color: '#00897B', bg: '#E0F2F1' },
  Completed: { color: '#7C4DFF', bg: '#EDE7F6' },
};

function avatarColor(name: string): string {
  const palette = ['#7C4DFF', '#E91E63', '#009688', '#FF5722', '#3F51B5', '#0288D1', '#F57C00'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return palette[Math.abs(h) % palette.length];
}

function initials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (diff === 0) return 'today';
  if (diff === 1) return '1d';
  return `${diff}d`;
}

// ─── Priority Badge ────────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: Priority }) {
  const cfg = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.Medium;
  return (
    <Chip
      label={priority} size="small"
      icon={<FlagIcon style={{ fontSize: 11, color: cfg.color }} />}
      sx={{
        bgcolor: cfg.bg, color: cfg.color, fontWeight: 700,
        fontSize: '0.66rem', height: 21,
        border: `1px solid ${cfg.color}30`,
        '& .MuiChip-icon': { ml: '5px' },
      }}
    />
  );
}

// ─── Task Card ─────────────────────────────────────────────────────────────────

function TaskCard({
  task, columnId, onDragStart,
}: { task: TaskDoc; columnId: TaskStatus; onDragStart: (id: string, from: TaskStatus) => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Paper
      draggable
      onDragStart={() => onDragStart(task._id, columnId)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      elevation={hovered ? 4 : 1}
      sx={{
        p: 1.8, mb: 1.5, borderRadius: '12px', cursor: 'grab',
        border: '1px solid', borderColor: hovered ? '#7C4DFF40' : '#F0F0F0',
        transition: 'all 0.2s ease',
        transform: hovered ? 'translateY(-2px)' : 'none',
        bgcolor: 'white',
        '&:active': { cursor: 'grabbing' },
      }}
    >
      {task.labels.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
          {task.labels.map((lbl, i) => {
            const cfg = LABEL_COLORS[lbl] ?? { color: '#757575', bg: '#F5F5F5' };
            return (
              <Chip key={i} label={lbl} size="small"
                sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 700, fontSize: '0.64rem', height: 18, border: `1px solid ${cfg.color}30` }} />
            );
          })}
        </Box>
      )}

      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, lineHeight: 1.4, color: '#1A1A2E', fontSize: '0.83rem' }}>
        {task.title}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <PriorityBadge priority={task.priority} />
        {task.storyPoints != null && (
          <Typography variant="caption" sx={{ color: '#9E9E9E', fontWeight: 500 }}>{task.storyPoints} pts</Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {task.assignee ? (
          <Tooltip title={task.assignee.name}>
            <Avatar sx={{ width: 24, height: 24, bgcolor: avatarColor(task.assignee.name), fontSize: '0.6rem', fontWeight: 700 }}>
              {initials(task.assignee.name)}
            </Avatar>
          </Tooltip>
        ) : (
          <Avatar sx={{ width: 24, height: 24, bgcolor: '#E0E0E0', fontSize: '0.6rem' }}>?</Avatar>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          {task.dueDate && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
              <CalendarTodayOutlinedIcon sx={{ fontSize: 11, color: '#BDBDBD' }} />
              <Typography variant="caption" sx={{ color: '#BDBDBD', fontSize: '0.67rem' }}>{formatDate(task.dueDate)}</Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 11, color: '#BDBDBD' }} />
            <Typography variant="caption" sx={{ color: '#BDBDBD', fontSize: '0.67rem' }}>{formatDate(task.createdAt)}</Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}


// ─── Create Board Dialog ─────────────────────────────────────────────────────────────────

function CreateBoardDialog({
  open, onClose, workspaceId, onCreated,
}: {
  open: boolean; onClose: () => void; workspaceId: string; onCreated: (board: BoardDoc) => void;
}) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSaving(true); setError('');
    try {
      const { data } = await api.post('/boards', { name: name.trim(), workspaceId });
      onCreated(data.data ?? data);
      setName(''); onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to create board');
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
      slotProps={{ paper: { sx: { borderRadius: '16px' } } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>New Board</Typography>
        <IconButton onClick={onClose} size="small"><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 1.5 }}>{error}</Alert>}
        <TextField fullWidth autoFocus label="Board name" size="small" sx={{ mt: 1 }}
          value={name} onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }} />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', color: '#757575' }}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!name.trim() || saving}
          startIcon={saving ? <CircularProgress size={14} color="inherit" /> : null}
          sx={{
            textTransform: 'none', borderRadius: '8px',
            background: 'linear-gradient(135deg, #7C4DFF, #651FFF)',
            '&:hover': { background: 'linear-gradient(135deg, #651FFF, #4527A0)' },
          }}>
          {saving ? 'Creating…' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Board Selector Panel ──────────────────────────────────────────────────────

function BoardSelector({
  boards, selectedId, onSelect, onNewBoard, loadingBoards,
}: {
  boards: BoardDoc[]; selectedId: string | null;
  onSelect: (id: string) => void; onNewBoard: () => void; loadingBoards: boolean;
}) {
  return (
    <Box sx={{
      width: 200, flexShrink: 0, borderRight: '1px solid #F0F0F0',
      pr: 2, display: 'flex', flexDirection: 'column', gap: 0.5, overflowY: 'auto',
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: '#9E9E9E', letterSpacing: 0.8, fontSize: '0.68rem' }}>
          BOARDS
        </Typography>
        <Tooltip title="New board">
          <IconButton size="small" onClick={onNewBoard} sx={{ color: '#7C4DFF' }}>
            <AddIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {loadingBoards
        ? [1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={34} sx={{ borderRadius: '8px' }} />)
        : boards.length === 0
          ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <DashboardCustomizeIcon sx={{ color: '#E0E0E0', fontSize: 32 }} />
              <Typography variant="caption" sx={{ color: '#BDBDBD', display: 'block', mt: 0.5 }}>No boards yet</Typography>
            </Box>
          )
          : boards.map(board => (
            <Box key={board._id} onClick={() => onSelect(board._id)} sx={{
              px: 1.5, py: 0.9, borderRadius: '8px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 1,
              bgcolor: selectedId === board._id ? '#EDE7F6' : 'transparent',
              border: `1px solid ${selectedId === board._id ? '#7C4DFF40' : 'transparent'}`,
              transition: 'all 0.15s ease',
              '&:hover': { bgcolor: selectedId === board._id ? '#EDE7F6' : '#F5F5F5' },
            }}>
              <ViewKanbanIcon sx={{ fontSize: 15, color: selectedId === board._id ? '#7C4DFF' : '#BDBDBD', flexShrink: 0 }} />
              <Typography variant="body2" noWrap sx={{
                fontWeight: selectedId === board._id ? 700 : 500,
                color: selectedId === board._id ? '#7C4DFF' : '#424242',
                fontSize: '0.81rem',
              }}>
                {board.name}
              </Typography>
            </Box>
          ))
      }
    </Box>
  );
}

// ─── Sprint Filter Chip ────────────────────────────────────────────────────────

function SprintFilter({
  sprints, selectedSprintId, onChange, loading,
}: {
  sprints: SprintDoc[]; selectedSprintId: string; onChange: (id: string) => void; loading: boolean;
}) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const selected = sprints.find(s => s._id === selectedSprintId);

  if (loading) return <Skeleton variant="rounded" width={110} height={30} sx={{ borderRadius: '8px' }} />;
  if (sprints.length === 0) return null;

  return (
    <>
      <Button
        size="small"
        startIcon={<RunCircleIcon sx={{ fontSize: 15 }} />}
        endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 15 }} />}
        onClick={e => setAnchor(e.currentTarget)}
        sx={{
          textTransform: 'none', fontWeight: 600, fontSize: '0.78rem',
          color: selected ? SPRINT_STATUS_COLOR[selected.status].color : '#757575',
          bgcolor: selected ? SPRINT_STATUS_COLOR[selected.status].bg : '#F5F5F5',
          border: `1px solid ${selected ? SPRINT_STATUS_COLOR[selected.status].color + '40' : '#E0E0E0'}`,
          borderRadius: '8px', px: 1.2, py: 0.4,
          '&:hover': { opacity: 0.85 },
        }}
      >
        {selected ? selected.name : 'All Sprints'}
      </Button>

      <Select
        open={Boolean(anchor)}
        onOpen={() => {}}
        onClose={() => setAnchor(null)}
        value={selectedSprintId}
        onChange={e => { onChange(e.target.value as string); setAnchor(null); }}
        sx={{ display: 'none' }}
        MenuProps={{ anchorEl: anchor, open: Boolean(anchor), onClose: () => setAnchor(null) }}
      >
        <MenuItem value="">All Sprints</MenuItem>
        {sprints.map(s => (
          <MenuItem key={s._id} value={s._id}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <RunCircleIcon sx={{ fontSize: 14, color: SPRINT_STATUS_COLOR[s.status].color }} />
              {s.name}
              <Chip label={s.status} size="small"
                sx={{ height: 17, fontSize: '0.6rem', fontWeight: 700,
                  color: SPRINT_STATUS_COLOR[s.status].color,
                  bgcolor: SPRINT_STATUS_COLOR[s.status].bg }} />
            </Box>
          </MenuItem>
        ))}
      </Select>
    </>
  );
}

// ─── Kanban Column ─────────────────────────────────────────────────────────────

function KanbanColumn({
  status, tasks, onDragStart, onDrop, loadingTasks,
}: {
  status: TaskStatus; tasks: TaskDoc[];
  onDragStart: (id: string, from: TaskStatus) => void;
  onDrop: (to: TaskStatus) => void;
  loadingTasks: boolean;
}) {
  const [dragOver, setDragOver] = useState(false);
  const totalPoints = tasks.reduce((s, t) => s + (t.storyPoints ?? 0), 0);

  return (
    <Box
      sx={{ width: 260, minWidth: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', height: '100%' }}
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={() => { setDragOver(false); onDrop(status); }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, px: 0.5, flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLUMN_DOT[status] }} />
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#1A1A2E', fontSize: '0.82rem' }}>{status}</Typography>
          <Chip label={tasks.length} size="small"
            sx={{ height: 17, fontSize: '0.61rem', bgcolor: '#F0F0F0', color: '#757575', fontWeight: 700 }} />
          {totalPoints > 0 && (
            <Typography variant="caption" sx={{ color: '#BDBDBD', fontWeight: 500, fontSize: '0.7rem' }}>{totalPoints}pts</Typography>
          )}
        </Box>
      </Box>

      {/* Cards — scrollable */}
      <Box sx={{
        flex: 1, overflowY: 'auto', borderRadius: '12px',
        transition: 'all 0.2s ease',
        bgcolor: dragOver ? '#EDE7F610' : 'transparent',
        border: dragOver ? '2px dashed #7C4DFF50' : '2px dashed transparent',
        pr: 0.5,
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-thumb': { bgcolor: '#E0E0E0', borderRadius: 4 },
        '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
      }}>
        {loadingTasks
          ? [1, 2].map(i => <Skeleton key={i} variant="rounded" height={110} sx={{ mb: 1.5, borderRadius: '12px' }} />)
          : tasks.map(task => (
            <TaskCard key={task._id} task={task} columnId={status} onDragStart={onDragStart} />
          ))
        }
      </Box>
    </Box>
  );
}

// ─── Main Boards Page ──────────────────────────────────────────────────────────

export default function Boards() {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();

  // Workspace
  const [workspaceMongoId, setWorkspaceMongoId] = useState<string | null>(null);

  // Boards
  const [boards, setBoards] = useState<BoardDoc[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [loadingBoards, setLoadingBoards] = useState(true);
  const [boardsError, setBoardsError] = useState('');
  const [createBoardOpen, setCreateBoardOpen] = useState(false);

  // Sprints
  const [sprints, setSprints] = useState<SprintDoc[]>([]);
  const [loadingSprints, setLoadingSprints] = useState(false);
  const [selectedSprintId, setSelectedSprintId] = useState(''); // '' = all

  // Tasks
  const [tasks, setTasks] = useState<TaskDoc[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [tasksError, setTasksError] = useState('');

  // Drag
  const [dragState, setDragState] = useState<{ taskId: string; from: TaskStatus } | null>(null);

  // Filters
  const [filterMode, setFilterMode] = useState<'all' | 'mine' | 'unassigned'>('all');
  const [searchQuery, setSearchQuery] = useState('');


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
      .catch(() => setBoardsError('Could not load workspace info'));
  }, [projectId]);

  // ── 2. Fetch boards ──
  const fetchBoards = useCallback(async () => {
    if (!workspaceMongoId) return;
    setLoadingBoards(true); setBoardsError('');
    try {
      const { data } = await api.get(`/boards/workspace/${workspaceMongoId}`);
      const list: BoardDoc[] = data.data ?? data;
      setBoards(list);
      if (list.length > 0 && !selectedBoardId) setSelectedBoardId(list[0]._id);
    } catch (e: any) {
      setBoardsError(e?.response?.data?.message ?? 'Failed to load boards');
    } finally { setLoadingBoards(false); }
  }, [workspaceMongoId]);

  useEffect(() => { fetchBoards(); }, [fetchBoards]);

  // ── 3. Fetch sprints when board changes ──
  useEffect(() => {
    if (!selectedBoardId) { setSprints([]); return; }
    setLoadingSprints(true);
    setSelectedSprintId(''); // reset sprint filter on board change
    api.get(`/sprints/board/${selectedBoardId}`)
      .then(({ data }) => {
        const list: SprintDoc[] = data.data ?? data ?? [];
        setSprints(list);
      })
      .catch(() => setSprints([]))
      .finally(() => setLoadingSprints(false));
  }, [selectedBoardId]);

  // ── 4. Fetch tasks ──
  const fetchTasks = useCallback(async () => {
    if (!selectedBoardId) return;
    setLoadingTasks(true); setTasksError('');
    try {
      const { data } = await api.get(`/tasks/board/${selectedBoardId}`);
      const list: TaskDoc[] = Array.isArray(data) ? data : (data.data ?? []);
      setTasks(list);
    } catch (e: any) {
      setTasksError(e?.response?.data?.message ?? 'Failed to load tasks');
    } finally { setLoadingTasks(false); }
  }, [selectedBoardId]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

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

  const handleBoardCreated = (board: BoardDoc) => {
    setBoards(prev => [...prev, board]);
    setSelectedBoardId(board._id);
    setTasks([]); setSprints([]);
  };

  // ── Filtering ──
  const filteredTasks = tasks.filter(task => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || task.title.toLowerCase().includes(q) || task.labels.some(l => l.toLowerCase().includes(q));
    const matchesAssignee =
      filterMode === 'all' ? true :
      filterMode === 'mine' ? task.assignee?.email === user?.email :
      !task.assignee;
    const matchesSprint =
      !selectedSprintId ? true :
      (task.sprintId === selectedSprintId || (task.sprintId as any)?._id === selectedSprintId);
    return matchesSearch && matchesAssignee && matchesSprint;
  });

  const tasksByStatus = (status: TaskStatus) => filteredTasks.filter(t => t.status === status);

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'Done').length;
  const progress = totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0;
  const selectedBoard = boards.find(b => b._id === selectedBoardId);

  return (
    // Full height, no outer scroll — fills the AppLayout main box exactly
    <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, display: 'flex', overflow: 'hidden', p: 3, pt: 2.5, gap: 2 }}>

      {/* ── Board Selector ── */}
      <BoardSelector
        boards={boards} selectedId={selectedBoardId}
        onSelect={id => { setSelectedBoardId(id); setTasks([]); }}
        onNewBoard={() => setCreateBoardOpen(true)}
        loadingBoards={loadingBoards}
      />

      {/* ── Main Kanban Area ── */}
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {boardsError && <Alert severity="error" sx={{ mb: 1.5 }}>{boardsError}</Alert>}

        {/* ── Toolbar ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1, flexShrink: 0 }}>
          {/* Left side */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            {selectedBoard && (
              <>
                <Typography variant="body1" sx={{ fontWeight: 700, color: '#1A1A2E', fontSize: '0.95rem' }}>
                  {selectedBoard.name}
                </Typography>
                <Divider orientation="vertical" flexItem sx={{ height: 16, my: 'auto' }} />
              </>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ViewKanbanIcon sx={{ fontSize: 15, color: '#7C4DFF' }} />
              <Typography variant="body2" sx={{ color: '#9E9E9E', fontSize: '0.76rem' }}>Kanban</Typography>
            </Box>

            <Divider orientation="vertical" flexItem sx={{ height: 16, my: 'auto' }} />

            {/* Sprint filter */}
            <SprintFilter
              sprints={sprints}
              selectedSprintId={selectedSprintId}
              onChange={setSelectedSprintId}
              loading={loadingSprints}
            />

            <Divider orientation="vertical" flexItem sx={{ height: 16, my: 'auto' }} />

            {/* Assignee filter */}
            <ToggleButtonGroup
              value={filterMode} exclusive
              onChange={(_, v) => { if (v) setFilterMode(v); }}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  textTransform: 'none', fontSize: '0.74rem', fontWeight: 600,
                  px: 1.1, py: 0.25, border: 'none', borderRadius: '6px !important', color: '#9E9E9E',
                  '&.Mui-selected': { color: '#7C4DFF', bgcolor: '#EDE7F6' },
                },
              }}
            >
              <ToggleButton value="all">All</ToggleButton>
              <ToggleButton value="mine">Mine</ToggleButton>
              <ToggleButton value="unassigned">Unassigned</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        {/* ── Progress bar ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5, flexShrink: 0 }}>
          <LinearProgress variant="determinate" value={progress}
            sx={{
              flex: 1, height: 5, borderRadius: 3, bgcolor: '#F0F0F0',
              '& .MuiLinearProgress-bar': { borderRadius: 3, background: 'linear-gradient(90deg, #7C4DFF, #651FFF)' },
            }} />
          <Typography variant="caption" sx={{ color: '#9E9E9E', whiteSpace: 'nowrap', fontWeight: 600, fontSize: '0.72rem' }}>
            {doneTasks}/{totalTasks} done
          </Typography>
          {selectedSprintId && (
            <Chip
              label={`Sprint: ${sprints.find(s => s._id === selectedSprintId)?.name ?? ''}`}
              size="small" onDelete={() => setSelectedSprintId('')}
              sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, bgcolor: '#EDE7F6', color: '#7C4DFF' }}
            />
          )}
        </Box>

        {tasksError && <Alert severity="error" sx={{ mb: 1.5 }}>{tasksError}</Alert>}

        {/* ── Empty state ── */}
        {!selectedBoardId && !loadingBoards && (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <DashboardCustomizeIcon sx={{ fontSize: 52, color: '#E0E0E0' }} />
            <Typography variant="h6" sx={{ color: '#BDBDBD', fontWeight: 600 }}>No board selected</Typography>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setCreateBoardOpen(true)}
              sx={{ textTransform: 'none', borderRadius: '10px', borderColor: '#7C4DFF', color: '#7C4DFF' }}>
              Create your first board
            </Button>
          </Box>
        )}

        {/* ── Kanban columns ── */}
        {selectedBoardId && (
          <Box sx={{
            display: 'flex',
            gap: 2,
            flex: 1,
            minHeight: 0,
            minWidth: 0,
            overflow: 'hidden',
          }}>
            {/* Only THIS box scrolls horizontally — everything above stays fixed */}
            <Box sx={{
              display: 'flex',
              gap: 2,
              overflowX: 'auto',
              overflowY: 'hidden',
              flex: 1,
              minWidth: 0,
              pb: 1,
              alignItems: 'stretch',
              '&::-webkit-scrollbar': { height: 5 },
              '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
              '&::-webkit-scrollbar-thumb': { bgcolor: '#D0C8F0', borderRadius: 4 },
            }}>
              {COLUMN_ORDER.map(status => (
                <KanbanColumn
                  key={status} status={status}
                  tasks={tasksByStatus(status)}
                  onDragStart={handleDragStart}
                  onDrop={handleDrop}
                  loadingTasks={loadingTasks}
                />
              ))}
            </Box>
          </Box>
        )}
      </Box>

      {/* ── Dialogs ── */}
      {workspaceMongoId && (
        <CreateBoardDialog
          open={createBoardOpen} onClose={() => setCreateBoardOpen(false)}
          workspaceId={workspaceMongoId} onCreated={handleBoardCreated}
        />
      )}
    </Box>
  );
}
