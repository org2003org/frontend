import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Grid, Card, LinearProgress,
  Avatar, Chip, IconButton, Divider, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert,
  Menu, MenuItem, ListItemIcon, ListItemText
} from '@mui/material';
import {
  Bolt as ZapIcon,
  CalendarToday as CalendarIcon,
  TrackChanges as TargetIcon,
  TrendingUp as TrendingUpIcon,
  People as UsersIcon,
  Add as PlusIcon,
  MoreHoriz as MoreHorizontalIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { sprintApi } from '../api/sprintApi';
import type { Sprint } from '../api/sprintApi';
import api from '../api/api';

import BoardSidebar from '../features/boards/components/BoardSidebar';
import type { BoardDoc } from '../features/boards/types/boards.types';
import CreateIssueDialog from '../features/backlog/components/CreateIssueDialog';
import { getWorkspaceMembers } from '../features/backlog/api/backlog.api';
import type { UserDoc as BacklogUserDoc } from '../features/backlog/types/backlog.types';


const statusColors: Record<string, { bg: string; text: string }> = {
  Backlog: { bg: '#f3f4f6', text: '#4b5563' },
  'To Do': { bg: '#e0e7ff', text: '#4338ca' },
  'In Progress': { bg: '#fef3c7', text: '#b45309' },
  Review: { bg: '#f3e8ff', text: '#7e22ce' },
  Done: { bg: '#d1fae5', text: '#047857' },
};

const statusLabels: Record<string, string> = {
  Backlog: 'Backlog', 'To Do': 'To Do',
  'In Progress': 'In Progress', Review: 'Review', Done: 'Done',
};

const priorityDot: Record<string, string> = {
  High: '#f59e0b', Medium: '#3b82f6', Low: '#9ca3af',
};



export interface UserDoc {
  _id: string;
  name: string;
  email: string;
}

export interface TaskDoc {
  _id: string;
  title: string;
  status: string;
  priority: string;
  assignee?: UserDoc;
  sprintId?: { _id: string; name: string } | string;
  storyPoints?: number;
}



function initials(name: string): string {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function avatarColor(name: string): string {
  if (!name) return '#E0E0E0';
  const palette = ['#7C4DFF', '#E91E63', '#009688', '#FF5722', '#3F51B5', '#0288D1', '#F57C00'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return palette[Math.abs(h) % palette.length];
}

function sprintMatchesTask(sprintId: string, task: TaskDoc): boolean {
  return !!task.sprintId && (
    typeof task.sprintId === 'object'
      ? task.sprintId._id === sprintId
      : task.sprintId === sprintId
  );
}


function computeSprintStatus(sprint: Sprint): 'Planned' | 'Active' | 'Completed' {
  const now = Date.now();
  const start = new Date(sprint.startDate).getTime();
  const end = new Date(sprint.endDate).getTime();
  if (now < start) return 'Planned';
  if (now > end) return 'Completed';
  return 'Active';
}



const SprintCard = ({
  sprint, allTasks, onAddTask, onEdit, onDelete,
}: {
  sprint: Sprint;
  allTasks: TaskDoc[];
  onAddTask: (sprintId: string) => void;
  onEdit: (sprint: Sprint) => void;
  onDelete: (sprintId: string) => void;
}) => {
  const status = computeSprintStatus(sprint);
  const isActive = status === 'Active';
  const isCompleted = status === 'Completed';
  const sprintId = sprint._id ?? sprint.id ?? '';
  const sprintTasks = allTasks.filter(t => sprintMatchesTask(sprintId, t));

  const completedPts = sprintTasks.filter(t => t.status === 'Done').reduce((s, t) => s + (t.storyPoints || 0), 0);
  const totalPts = sprintTasks.reduce((s, t) => s + (t.storyPoints || 0), 0);
  const pct = totalPts > 0 ? Math.round((completedPts / totalPts) * 100) : 0;

  const daysLeft = isActive && sprint.endDate
    ? Math.max(0, Math.ceil((new Date(sprint.endDate).getTime() - Date.now()) / 86400000))
    : 0;

  const statusChipColor = isActive ? 'success' : status === 'Planned' ? 'info' : 'default';

  return (
    <Card variant="outlined" sx={{ mb: 2, borderRadius: 2, borderColor: isActive ? 'primary.light' : isCompleted ? 'success.light' : 'grey.200', boxShadow: isActive ? 3 : 1 }}>
      <Box sx={{ px: 3, py: 2, bgcolor: isActive ? '#f0f4ff' : isCompleted ? '#f0fdf4' : 'grey.50' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <ZapIcon fontSize="small" color={isActive ? 'primary' : 'disabled'} />
              <Typography variant="h6" color={isActive ? 'primary.dark' : 'text.primary'}>{sprint.name}</Typography>
              <Chip
                label={status}
                size="small"
                color={statusChipColor as 'success' | 'info' | 'default'}
                sx={{ fontWeight: 500, height: 20 }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">{sprint.goal}</Typography>
          </Box>
          <SprintMenu sprint={sprint} onEdit={onEdit} onDelete={onDelete} />
        </Box>

        <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CalendarIcon fontSize="small" color="action" sx={{ fontSize: 16 }} />
            <Typography variant="caption" color="text.secondary">
              {sprint.startDate ? new Date(sprint.startDate).toLocaleDateString() : '?'} →{' '}
              {sprint.endDate ? new Date(sprint.endDate).toLocaleDateString() : '?'}
            </Typography>
          </Box>
          {isActive && sprint.endDate && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TargetIcon fontSize="small" color="primary" sx={{ fontSize: 16 }} />
              <Typography variant="caption" color="primary.main" sx={{ fontWeight: 500 }}>{daysLeft} days left</Typography>
            </Box>
          )}
        </Box>
      </Box>

      <Divider />

      {/* Progress */}
      <Box sx={{ px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">Sprint Progress</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">{completedPts} / {totalPts} pts</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{pct}%</Typography>
          </Box>
        </Box>
        <LinearProgress
          variant="determinate"
          value={pct}
          sx={{
            height: 8, borderRadius: 4, bgcolor: 'grey.100',
            '& .MuiLinearProgress-bar': {
              bgcolor: isCompleted ? 'success.main' : isActive ? 'primary.main' : 'grey.400',
            },
          }}
        />

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          {[
            { label: 'To Do', count: sprintTasks.filter(t => t.status === 'To Do').length, color: '#818cf8' },
            { label: 'In Progress', count: sprintTasks.filter(t => t.status === 'In Progress').length, color: '#fbbf24' },
            { label: 'Review', count: sprintTasks.filter(t => t.status === 'Review').length, color: '#c084fc' },
            { label: 'Done', count: sprintTasks.filter(t => t.status === 'Done').length, color: '#34d399' },
          ].map(s => s.count > 0 && (
            <Box key={s.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: s.color }} />
              <Typography variant="caption" color="text.secondary">{s.count} {s.label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Divider />

      {/* Task rows */}
      <Stack divider={<Divider />} sx={{ bgcolor: 'white' }}>
        {sprintTasks.map(task => {
          const statusConfig = statusColors[task.status] || { bg: '#f3f4f6', text: '#4b5563' };
          const priorityColor = priorityDot[task.priority] || '#9ca3af';
          return (
            <Box key={task._id} sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 3, py: 1.5, '&:hover': { bgcolor: 'grey.50', cursor: 'pointer' } }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: priorityColor }} />
              <Chip
                label={statusLabels[task.status] || task.status}
                size="small"
                sx={{ bgcolor: statusConfig.bg, color: statusConfig.text, fontWeight: 500, height: 20, fontSize: '0.7rem' }}
              />
              <Typography variant="body2" sx={{ flex: 1, '&:hover': { color: 'primary.main' } }}>{task.title}</Typography>
              <Chip label={`${task.storyPoints || 0}pt`} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem', bgcolor: 'grey.50' }} />
              <Avatar sx={{ width: 24, height: 24, fontSize: '0.6rem', bgcolor: avatarColor(task.assignee?.name || '?') }}>
                {initials(task.assignee?.name || '?')}
              </Avatar>
            </Box>
          );
        })}
        {!isCompleted && (
          <Box
            onClick={() => onAddTask(sprintId)}
            sx={{
              display: 'flex', alignItems: 'center', gap: 1,
              px: 3, py: 1.5, cursor: 'pointer',
              '&:hover': { bgcolor: '#EDE7F6' },
              transition: 'background 0.15s',
            }}
          >
            <PlusIcon fontSize="small" sx={{ color: '#7C4DFF' }} />
            <Typography variant="body2" sx={{ color: '#7C4DFF', fontWeight: 600 }}>Add task</Typography>
          </Box>
        )}
      </Stack>
    </Card>
  );
};



function SprintMenu({ sprint, onEdit, onDelete }: {
  sprint: Sprint;
  onEdit: (sprint: Sprint) => void;
  onDelete: (sprintId: string) => void;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const sprintId = sprint._id ?? sprint.id ?? '';

  return (
    <>
      <IconButton size="small" onClick={e => setAnchorEl(e.currentTarget)}>
        <MoreHorizontalIcon fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        slotProps={{ paper: { sx: { borderRadius: '10px', minWidth: 140 } } }}
      >
        <MenuItem onClick={() => { setAnchorEl(null); onEdit(sprint); }}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setAnchorEl(null); onDelete(sprintId); }} sx={{ color: 'error.main' }}>
          <ListItemIcon><DeleteIcon fontSize="small" sx={{ color: 'error.main' }} /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}



function EditSprintDialog({ open, onClose, sprint, onUpdated }: {
  open: boolean; onClose: () => void; sprint: Sprint | null; onUpdated: (sprint: Sprint) => void;
}) {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Populate form when sprint changes
  useEffect(() => {
    if (open && sprint) {
      setName(sprint.name || '');
      setGoal(sprint.goal || '');
      setStartDate(sprint.startDate ? new Date(sprint.startDate).toISOString().slice(0, 10) : '');
      setEndDate(sprint.endDate ? new Date(sprint.endDate).toISOString().slice(0, 10) : '');
      setError('');
    }
  }, [open, sprint]);

  const handleSubmit = async () => {
    if (!sprint || !name.trim() || !startDate || !endDate) return;
    const sprintId = sprint._id ?? sprint.id ?? '';
    setSaving(true);
    setError('');
    try {
      const updated = await sprintApi.updateSprint(sprintId, { name: name.trim(), goal: goal.trim(), startDate, endDate });
      onUpdated(updated);
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to update sprint');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
      slotProps={{ paper: { sx: { borderRadius: '16px' } } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>Edit Sprint</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1, mt: 1 }}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField autoFocus label="Sprint Name" size="small" fullWidth value={name} onChange={e => setName(e.target.value)} />
        <TextField label="Sprint Goal" size="small" fullWidth value={goal} onChange={e => setGoal(e.target.value)} multiline rows={2} />
        <TextField
          size="small" type="date" fullWidth label="Start Date"
          slotProps={{ inputLabel: { shrink: true } }}
          value={startDate} onChange={e => setStartDate(e.target.value)}
        />
        <TextField
          size="small" type="date" fullWidth label="End Date"
          slotProps={{ inputLabel: { shrink: true } }}
          value={endDate} onChange={e => setEndDate(e.target.value)}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!name.trim() || !startDate || !endDate || saving}
          sx={{
            textTransform: 'none', borderRadius: '8px',
            background: 'linear-gradient(135deg, #7C4DFF, #651FFF)',
            '&:hover': { background: 'linear-gradient(135deg, #651FFF, #4527A0)' },
          }}
        >
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}



function CreateSprintDialog({ open, onClose, boardId, onCreated }: {
  open: boolean; onClose: () => void; boardId: string; onCreated: (sprint: Sprint) => void;
}) {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Reset form when dialog opens
  useEffect(() => {
    if (open) { setName(''); setGoal(''); setStartDate(''); setEndDate(''); setError(''); }
  }, [open]);

  const handleSubmit = async () => {
    if (!name.trim() || !startDate || !endDate) return;
    setSaving(true);
    setError('');
    try {
      const newSprint = await sprintApi.createSprint({ boardId, name: name.trim(), goal: goal.trim(), startDate, endDate, status: 'Planned' });
      onCreated(newSprint);
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to create sprint');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
      slotProps={{ paper: { sx: { borderRadius: '16px' } } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>New Sprint</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1, mt: 1 }}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField autoFocus label="Sprint Name" size="small" fullWidth value={name} onChange={e => setName(e.target.value)} />
        <TextField label="Sprint Goal" size="small" fullWidth value={goal} onChange={e => setGoal(e.target.value)} multiline rows={2} />
        <TextField
          size="small" type="date" fullWidth label="Start Date"
          slotProps={{ inputLabel: { shrink: true } }}
          value={startDate} onChange={e => setStartDate(e.target.value)}
        />
        <TextField
          size="small" type="date" fullWidth label="End Date"
          slotProps={{ inputLabel: { shrink: true } }}
          value={endDate} onChange={e => setEndDate(e.target.value)}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!name.trim() || !startDate || !endDate || saving}
          sx={{
            textTransform: 'none', borderRadius: '8px',
            background: 'linear-gradient(135deg, #7C4DFF, #651FFF)',
            '&:hover': { background: 'linear-gradient(135deg, #651FFF, #4527A0)' },
          }}
        >
          {saving ? 'Creating…' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}



export default function Sprints() {
  const { projectId } = useParams<{ projectId: string }>();

  // ── Workspace & boards ──
  const [workspaceMongoId, setWorkspaceMongoId] = useState<string | null>(null);
  const [boards, setBoards] = useState<BoardDoc[]>([]);
  const [loadingBoards, setLoadingBoards] = useState(true);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);

  // ── Sprints & tasks for selected board ──
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [tasks, setTasks] = useState<TaskDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  // ── Team members (for CreateIssueDialog) ──
  const [teamMembers, setTeamMembers] = useState<BacklogUserDoc[]>([]);

  // ── Create Issue dialog state ──
  const [createIssueOpen, setCreateIssueOpen] = useState(false);
  const [createForSprintId, setCreateForSprintId] = useState<string>('');

  // ── Edit / Delete sprint state ──
  const [editOpen, setEditOpen] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);

  // 1. Resolve workspace + load boards
  useEffect(() => {
    if (!projectId) return;
    const init = async () => {
      try {
        const { data } = await api.get('/workspaces');
        const list = data.data ?? data;
        const ws = list.find((w: any) =>
          w.name === projectId ||
          w.name.toLowerCase().replace(/\s+/g, '-') === projectId.toLowerCase()
        );
        const wsId = ws ? ws._id : list[0]?._id ?? null;
        setWorkspaceMongoId(wsId);

        if (wsId) {
          const boardRes = await api.get(`/boards/workspace/${wsId}`);
          const boardList: BoardDoc[] = boardRes.data.data ?? boardRes.data ?? [];
          setBoards(boardList);
          if (boardList.length > 0) setSelectedBoardId(boardList[0]._id);

          // Fetch team members for CreateIssueDialog
          getWorkspaceMembers(wsId).then(setTeamMembers).catch(() => setTeamMembers([]));
        }
      } catch (e) {
        console.error('Failed to load workspace/boards', e);
      } finally {
        setLoadingBoards(false);
      }
    };
    init();
  }, [projectId]);

  // 2. Fetch sprints + tasks whenever selectedBoardId changes
  const fetchSprintsAndTasks = useCallback(async () => {
    if (!selectedBoardId) return;
    setLoading(true);
    try {
      const [fetchedSprints, taskRes] = await Promise.all([
        sprintApi.getSprintsByBoard(selectedBoardId),
        api.get(`/tasks/board/${selectedBoardId}`),
      ]);
      setSprints(fetchedSprints || []);
      setTasks(Array.isArray(taskRes.data) ? taskRes.data : (taskRes.data.data ?? []));
    } catch (e) {
      console.error('Failed to fetch sprints or tasks:', e);
    } finally {
      setLoading(false);
    }
  }, [selectedBoardId]);

  useEffect(() => { fetchSprintsAndTasks(); }, [fetchSprintsAndTasks]);

  // Handle board created from sidebar
  const handleBoardCreated = (board: BoardDoc) => {
    setBoards(prev => [...prev, board]);
    setSelectedBoardId(board._id);
    setSprints([]);
    setTasks([]);
  };

  // Handle board selected from sidebar
  const handleSelectBoard = (id: string) => {
    setSelectedBoardId(id);
    setSprints([]);
    setTasks([]);
  };

  // Open CreateIssueDialog pre-filled for a specific sprint
  const handleAddTask = (sprintId: string) => {
    setCreateForSprintId(sprintId);
    setCreateIssueOpen(true);
  };

  // Append newly created task to local state (instant UI update)
  const handleIssueCreated = (task: any) => {
    setTasks(prev => [task, ...prev]);
  };

  // Open edit dialog for a sprint
  const handleEditSprint = (sprint: Sprint) => {
    setEditingSprint(sprint);
    setEditOpen(true);
  };

  // Delete a sprint
  const handleDeleteSprint = async (sprintId: string) => {
    try {
      await sprintApi.deleteSprint(sprintId);
      setSprints(prev => prev.filter(s => (s._id ?? s.id) !== sprintId));
    } catch (e) {
      console.error('Failed to delete sprint', e);
    }
  };

  // Handle sprint updated from edit dialog
  const handleSprintUpdated = (updated: Sprint) => {
    setSprints(prev => prev.map(s => (s._id ?? s.id) === (updated._id ?? updated.id) ? updated : s));
  };

  // ── Derived stats ──
  const usersMap = new Map<string, UserDoc>();
  tasks.forEach(t => { if (t.assignee?._id) usersMap.set(t.assignee._id, t.assignee); });
  const users = Array.from(usersMap.values());

  const activeSprint = sprints.find(s => computeSprintStatus(s) === 'Active') ?? sprints[0];
  const activeId = activeSprint?._id ?? activeSprint?.id ?? '';

  const activeSprintTasks = tasks.filter(t => sprintMatchesTask(activeId, t));
  const activeSprintVelocity = activeSprintTasks.reduce((s, t) => s + (t.storyPoints || 0), 0);
  const activeSprintDone = activeSprintTasks.filter(t => t.status === 'Done').length;

  const teamCapacity = users.map(u => {
    const memberTasks = activeSprintTasks.filter(t => t.assignee?._id === u._id);
    return {
      ...u,
      sprintTasks: memberTasks.length,
      sprintPoints: memberTasks.reduce((s, t) => s + (t.storyPoints || 0), 0),
    };
  });

  const selectedBoard = boards.find(b => b._id === selectedBoardId);

  return (
    <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, display: 'flex', overflow: 'hidden' }}>

      {/* ── Board Sidebar ── */}
      <Box sx={{ pt: 3, pl: 3, pb: 3 }}>
        <BoardSidebar
          boards={boards}
          selectedId={selectedBoardId}
          onSelect={handleSelectBoard}
          onBoardCreated={handleBoardCreated}
          workspaceId={workspaceMongoId}
          loading={loadingBoards}
        />
      </Box>

      {/* ── Main content ── */}
      <Box sx={{ flex: 1, overflowY: 'auto', bgcolor: '#f9fafb', p: 4 }}>

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }} color="text.primary">
              Sprint Planning{selectedBoard ? ` — ${selectedBoard.name}` : ''}
            </Typography>
            <Typography variant="body2" color="text.secondary">Manage and track your team's sprints</Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<PlusIcon />}
            onClick={() => setCreateOpen(true)}
            disabled={!selectedBoardId}
            sx={{
              textTransform: 'none', borderRadius: 2,
              background: 'linear-gradient(135deg, #7C4DFF, #651FFF)',
              '&:hover': { background: 'linear-gradient(135deg, #651FFF, #4527A0)' },
            }}
          >
            New Sprint
          </Button>
        </Box>

        {loading ? (
          <LinearProgress />
        ) : (
          <>
            {/* Stats Row */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {[
                { label: 'Sprint Velocity', value: `${activeSprintVelocity} pts`, icon: TrendingUpIcon, color: 'primary.main', bg: 'primary.light' },
                { label: 'Team Capacity', value: `${teamCapacity.reduce((s, u) => s + u.sprintPoints, 0)} pts`, icon: UsersIcon, color: 'secondary.main', bg: 'secondary.light' },
                {
                  label: 'Days Remaining', value: activeSprint?.endDate
                    ? Math.max(0, Math.ceil((new Date(activeSprint.endDate).getTime() - Date.now()) / 86400000))
                    : 0, icon: CalendarIcon, color: 'warning.main', bg: 'warning.light'
                },
                { label: 'Tasks Complete', value: `${activeSprintDone}/${activeSprintTasks.length}`, icon: TargetIcon, color: 'success.main', bg: 'success.light' },
              ].map(stat => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={stat.label}>
                  <Card variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, opacity: 0.8 }}>
                      <stat.icon sx={{ color: stat.color }} />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>{stat.value}</Typography>
                    <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Team Capacity */}
            {activeSprint && teamCapacity.length > 0 && (
              <Card variant="outlined" sx={{ borderRadius: 2, p: 3, mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Team Capacity — {activeSprint.name}</Typography>
                <Grid container spacing={2}>
                  {teamCapacity.map(member => {
                    const capacityPct = Math.min(100, Math.round((member.sprintPoints / 15) * 100));
                    const isOverloaded = member.sprintPoints > 15;
                    return (
                      <Grid size={{ xs: 6, sm: 4, md: 2 }} key={member._id}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2, borderRadius: 2, bgcolor: 'grey.50', '&:hover': { bgcolor: '#f0f4ff' } }}>
                          <Avatar sx={{ width: 36, height: 36, mb: 1, bgcolor: avatarColor(member.name || '?'), fontSize: '0.8rem' }}>
                            {initials(member.name || '?')}
                          </Avatar>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>{member.name?.split(' ')[0] || 'Unknown'}</Typography>
                          <LinearProgress
                            variant="determinate"
                            value={capacityPct}
                            sx={{
                              width: '100%', height: 6, borderRadius: 3, my: 1, bgcolor: 'grey.200',
                              '& .MuiLinearProgress-bar': { bgcolor: isOverloaded ? 'error.main' : 'primary.main' },
                            }}
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                            {member.sprintPoints}pts · {member.sprintTasks} tasks
                          </Typography>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </Card>
            )}

            {/* Sprint Cards */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {sprints.length === 0 ? (
                <Card variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2, bgcolor: 'grey.50' }}>
                  <Typography color="text.secondary">No sprints found for this board.</Typography>
                  {selectedBoardId && (
                    <Button
                      variant="outlined"
                      startIcon={<PlusIcon />}
                      onClick={() => setCreateOpen(true)}
                      sx={{ mt: 2, textTransform: 'none', borderRadius: 2 }}
                    >
                      Create first sprint
                    </Button>
                  )}
                </Card>
              ) : (
                sprints.map(sprint => (
                  <SprintCard
                    key={sprint._id ?? sprint.id}
                    sprint={sprint}
                    allTasks={tasks}
                    onAddTask={handleAddTask}
                    onEdit={handleEditSprint}
                    onDelete={handleDeleteSprint}
                  />
                ))
              )}
            </Box>
          </>
        )}
      </Box>

      {/* Create Sprint Dialog */}
      {selectedBoardId && (
        <CreateSprintDialog
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          boardId={selectedBoardId}
          onCreated={sprint => setSprints(prev => [...prev, sprint])}
        />
      )}

      {/* Edit Sprint Dialog */}
      <EditSprintDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        sprint={editingSprint}
        onUpdated={handleSprintUpdated}
      />

      {/* Create Issue Dialog — opened from sprint card's "Add task" */}
      <CreateIssueDialog
        open={createIssueOpen}
        boardId={selectedBoardId}
        sprints={sprints as any}
        teamMembers={teamMembers}
        defaultSprintId={createForSprintId}
        onClose={() => setCreateIssueOpen(false)}
        onCreated={handleIssueCreated}
      />
    </Box>
  );
}
