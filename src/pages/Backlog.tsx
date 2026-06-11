import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  InputAdornment,
  Menu,
  MenuItem,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import type {
  TaskStatus,
  TaskDoc,
  CommentDoc,
} from '../features/backlog/types/backlog.types';

import {
  purple,
  text,
  muted,
  line,
} from '../features/backlog/constants/backlog.constants';

import {
  getApiError,
  uniqueById,
} from '../features/backlog/utils/backlog.utils';

import SprintSection from '../features/backlog/components/SprintSection';
import CreateIssueDialog from '../features/backlog/components/CreateIssueDialog';
import TaskDetailsDialog from '../features/backlog/components/TaskDetailsDialog';

import {
  getTaskComments,
  createTaskComment,
  updateTask,
} from '../features/backlog/api/backlog.api';

import { useBacklogFilters } from '../features/backlog/hooks/useBacklogFilters';
import { useBacklogData } from '../features/backlog/hooks/useBacklogData';

export default function Backlog() {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();

  const {
    selectedBoardId,
    sprints,
    tasks,
    setTasks,
    teamMembers,
    loading,
    error,
    setError,
  } = useBacklogData(projectId);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | TaskStatus>('All');
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [comments, setComments] = useState<CommentDoc[]>([]);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [savingTask, setSavingTask] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const selectedTask = useMemo(() => {
    return tasks.find((task) => task._id === selectedTaskId) ?? null;
  }, [tasks, selectedTaskId]);

  const { issueNumbers, groups } = useBacklogFilters({
    tasks,
    sprints,
    search,
    statusFilter,
  });

  useEffect(() => {
    if (tasks.length === 0) {
      setCommentCounts({});
      return;
    }

    let cancelled = false;

    Promise.all(
      tasks.map(async (task) => [
        task._id,
        (await getTaskComments(task._id)).length,
      ] as const)
    )
      .then((entries) => {
        if (!cancelled) {
          setCommentCounts(Object.fromEntries(entries));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCommentCounts({});
        }
      });

    return () => {
      cancelled = true;
    };
  }, [tasks]);

  useEffect(() => {
    if (!selectedTaskId) {
      setComments([]);
      return;
    }

    setCommentsLoading(true);

    getTaskComments(selectedTaskId)
      .then(setComments)
      .catch(() => setComments([]))
      .finally(() => setCommentsLoading(false));
  }, [selectedTaskId]);

  const handlePatchSelectedTask = async (patch: Partial<TaskDoc>) => {
    if (!selectedTaskId) return;

    setSavingTask(true);
    setError('');

    const previousTasks = tasks;

    setTasks((current) =>
      current.map((task) =>
        task._id === selectedTaskId ? { ...task, ...patch } : task
      )
    );

    try {
      const updated = await updateTask(selectedTaskId, patch);

      setTasks((current) =>
        current.map((task) =>
          task._id === selectedTaskId ? { ...task, ...updated } : task
        )
      );
    } catch (err: any) {
      setTasks(previousTasks);
      setError(getApiError(err, 'Failed to save task'));
    } finally {
      setSavingTask(false);
    }
  };

  const handleAddComment = async (commentText: string) => {
    if (!selectedTaskId) return;

    const created = await createTaskComment(selectedTaskId, commentText);

    const commentWithFallbackUser: CommentDoc = {
      ...created,
      userId:
        typeof created.userId === 'object' && created.userId
          ? created.userId
          : user
            ? {
              _id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
            }
            : created.userId,
      createdAt: created.createdAt ?? new Date().toISOString(),
    };

    setComments((current) => [...current, commentWithFallbackUser]);

    setCommentCounts((current) => ({
      ...current,
      [selectedTaskId]: (current[selectedTaskId] ?? 0) + 1,
    }));
  };

  const handleCreatedIssue = (task: TaskDoc) => {
    setTasks((current) => uniqueById([task, ...current]));
  };

  if (loading) {
    return (
      <Box sx={{ flex: 1, bgcolor: 'white', p: 2.5 }}>
        <Skeleton variant="rounded" height={36} width={330} sx={{ mb: 2 }} />
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <Skeleton key={item} variant="rounded" height={44} sx={{ mb: 1 }} />
        ))}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        bgcolor: 'white',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          height: 74,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          borderBottom: `1px solid ${line}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.3 }}>
          <TextField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search backlog..."
            size="small"
            sx={{
              width: 232,
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                bgcolor: 'white',
                height: 36,
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: muted, fontSize: 19 }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <Button
            variant="outlined"
            startIcon={<FilterListIcon sx={{ fontSize: 18 }} />}
            onClick={(event) => setFilterAnchor(event.currentTarget)}
            sx={{
              height: 36,
              borderRadius: '10px',
              textTransform: 'none',
              color: '#344054',
              borderColor: '#E4E7EC',
            }}
          >
            Filter
          </Button>

          <Menu
            anchorEl={filterAnchor}
            open={Boolean(filterAnchor)}
            onClose={() => setFilterAnchor(null)}
          >
            {(['All', 'Backlog', 'To Do', 'In Progress', 'Review', 'Done'] as Array<'All' | TaskStatus>).map(
              (status) => (
                <MenuItem
                  key={status}
                  selected={statusFilter === status}
                  onClick={() => {
                    setStatusFilter(status);
                    setFilterAnchor(null);
                  }}
                >
                  {status}
                </MenuItem>
              )
            )}
          </Menu>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}
          disabled={!selectedBoardId}
          sx={{
            height: 36,
            px: 2,
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 700,
            bgcolor: purple,
            '&:hover': { bgcolor: '#4C1D95' },
          }}
        >
          Create Issue
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mx: 3, mt: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '76px 102px minmax(360px, 1fr) 190px 72px 120px 96px 52px',
          alignItems: 'center',
          minHeight: 41,
          color: muted,
          fontSize: 13,
          borderBottom: `1px solid ${line}`,
          flexShrink: 0,
        }}
      >
        <Typography sx={{ fontSize: 13, px: 2.5 }}>ID</Typography>
        <Typography sx={{ fontSize: 13 }}>Status</Typography>
        <Typography sx={{ fontSize: 13, pl: 0.2 }}>Title</Typography>
        <Typography sx={{ fontSize: 13, justifySelf: 'end', pr: 7 }}>Labels</Typography>
        <Typography sx={{ fontSize: 13, justifySelf: 'center' }}>Points</Typography>
        <Typography sx={{ fontSize: 13 }}>Assignee</Typography>
        <Typography sx={{ fontSize: 13 }}>Due</Typography>
        <Box />
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {!selectedBoardId ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography sx={{ color: text, fontWeight: 700, mb: 1 }}>
              No board found
            </Typography>
            <Typography sx={{ color: muted }}>
              Create a board first, then return to the backlog.
            </Typography>
          </Box>
        ) : tasks.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography sx={{ color: text, fontWeight: 700, mb: 1 }}>
              No backlog tasks yet
            </Typography>
            <Typography sx={{ color: muted, mb: 2 }}>
              Use Create Issue to add your first task.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateOpen(true)}
              sx={{ textTransform: 'none', bgcolor: purple }}
            >
              Create Issue
            </Button>
          </Box>
        ) : groups.every((group) => group.tasks.length === 0) ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography sx={{ color: text, fontWeight: 700, mb: 1 }}>
              No tasks match this filter
            </Typography>
            <Typography sx={{ color: muted }}>
              Try another search word or status filter.
            </Typography>
          </Box>
        ) : (
          groups.map((group) => (
            <SprintSection
              key={group.id}
              group={group}
              issueNumbers={issueNumbers}
              commentCounts={commentCounts}
              onOpenTask={(task) => setSelectedTaskId(task._id)}
            />
          ))
        )}
      </Box>

      <TaskDetailsDialog
        open={Boolean(selectedTask)}
        task={selectedTask}
        issueKey={selectedTask ? issueNumbers[selectedTask._id] : ''}
        sprints={sprints}
        teamMembers={teamMembers}
        comments={comments}
        commentsLoading={commentsLoading}
        saving={savingTask}
        onClose={() => setSelectedTaskId(null)}
        onPatchTask={handlePatchSelectedTask}
        onAddComment={handleAddComment}
      />

      <CreateIssueDialog
        open={createOpen}
        boardId={selectedBoardId}
        sprints={sprints}
        teamMembers={teamMembers}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreatedIssue}
      />
    </Box>
  );
}