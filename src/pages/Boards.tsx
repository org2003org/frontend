import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  LinearProgress,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';

import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { useReportJob } from '../context/ReportJobContext';

// ── Board feature components & hook ──────────────────────────────────────────
import BoardSidebar from '../features/boards/components/BoardSidebar';
import KanbanColumn from '../features/boards/components/KanbanColumn';
import SprintFilter from '../features/boards/components/SprintFilter';
import { useBoardData } from '../features/boards/hooks/useBoardData';
import { COLUMN_ORDER } from '../features/boards/constants/boards.constants';
import type { TaskStatus } from '../features/boards/types/boards.types';

// ── Shared backlog dialogs ───────────────────────────────────────────────────
import CreateIssueDialog from '../features/backlog/components/CreateIssueDialog';
import TaskDetailsDialog from '../features/backlog/components/TaskDetailsDialog';

export default function Boards() {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();

  const {
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

    setSelectedTaskId,
    comments,
    commentsLoading,
    savingTask,
    handlePatchSelectedTask,
    handleAddComment,
    handleCreatedIssue,
    handleDragStart,
    handleDrop,
  } = useBoardData(projectId);

  // Local UI state (not related to data)
  const [filterMode, setFilterMode] = useState<'all' | 'mine' | 'unassigned'>('all');
  const [createOpen, setCreateOpen] = useState(false);

  // AI pdf Summary — actual job tracking lives in the global ReportJobContext
  const { job: reportJob, startJob } = useReportJob();
  const summaryLoading = reportJob?.status === 'pending';

  const handleDownloadSummary = async () => {
    if (!selectedBoardId) return;
    try {
      // Just kick off the job — backend responds immediately with { jobId, boardName }
      const { data } = await api.post<{ jobId: string; boardName: string }>(
        `/ai/boards/${selectedBoardId}/simplify-pdf`
      );
      startJob(data.jobId, data.boardName);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ?? 'Failed to start AI report. Please try again.';
      alert(msg);
    }
  };

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filteredTasks = tasks.filter(task => {
    const matchesAssignee =
      filterMode === 'all'
        ? true
        : filterMode === 'mine'
          ? (task.assignee as any)?.email === user?.email
          : !task.assignee;

    const matchesSprint =
      !selectedSprintId
        ? true
        : task.sprintId === selectedSprintId || (task.sprintId as any)?._id === selectedSprintId;

    return matchesAssignee && matchesSprint;
  });

  const tasksByStatus = (status: TaskStatus) => filteredTasks.filter(t => t.status === status);

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'Done').length;
  const progress = totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0;
  const selectedBoard = boards.find(b => b._id === selectedBoardId);

  return (
    <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, display: 'flex', overflow: 'hidden', p: 3, pt: 2.5, gap: 2 }}>

      {/* ── Board Sidebar (reusable) ── */}
      <BoardSidebar
        boards={boards}
        selectedId={selectedBoardId}
        onSelect={selectBoard}
        onBoardCreated={handleBoardCreated}
        workspaceId={workspaceMongoId}
        loading={loadingBoards}
      />

      {/* ── Main Kanban Area ── */}
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {(boardsError || workspaceError) && (
          <Alert severity="error" sx={{ mb: 1.5 }}>{boardsError || workspaceError}</Alert>
        )}

        {/* ── Toolbar ── */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 1.5,
            flexWrap: 'wrap',
            gap: 1,
            flexShrink: 0,
          }}
        >
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

            <SprintFilter
              sprints={sprints}
              selectedSprintId={selectedSprintId}
              onChange={setSelectedSprintId}
              loading={loadingSprints}
            />

            <Divider orientation="vertical" flexItem sx={{ height: 16, my: 'auto' }} />

            {/* Assignee filter */}
            <ToggleButtonGroup
              value={filterMode}
              exclusive
              onChange={(_, v) => { if (v) setFilterMode(v); }}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  textTransform: 'none',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  px: 1.1,
                  py: 0.25,
                  border: 'none',
                  borderRadius: '6px !important',
                  color: '#9E9E9E',
                  '&.Mui-selected': { color: '#7C4DFF', bgcolor: '#EDE7F6' },
                },
              }}
            >
              <ToggleButton value="all">All</ToggleButton>
              <ToggleButton value="mine">Mine</ToggleButton>
              <ToggleButton value="unassigned">Unassigned</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/*download button */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Download AI-generated board summary as PDF" arrow>
              <span>
                <Button
                  variant="outlined"
                  startIcon={
                    summaryLoading
                      ? <CircularProgress size={16} sx={{ color: '#7C4DFF' }} />
                      : <DownloadIcon />
                  }
                  onClick={handleDownloadSummary}
                  disabled={!selectedBoardId || summaryLoading}
                  id="download-summary-btn"
                  sx={{
                    height: 36,
                    px: 2,
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 700,
                    borderColor: '#7C4DFF',
                    color: '#7C4DFF',
                    background: 'linear-gradient(135deg, #EDE7F620, #E8EAF620)',
                    '&:hover': {
                      borderColor: '#651FFF',
                      background: 'linear-gradient(135deg, #EDE7F680, #E8EAF680)',
                    },
                  }}
                >
                  {summaryLoading ? 'Downloading…' : 'Download Summary'}
                </Button>
              </span>
            </Tooltip>

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
                background: 'linear-gradient(135deg, #7C4DFF, #651FFF)',
                '&:hover': { background: 'linear-gradient(135deg, #651FFF, #4527A0)' },
              }}
            >
              Create Issue
            </Button>
          </Box>
        </Box>

        {/* ── Progress bar ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5, flexShrink: 0 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              flex: 1,
              height: 5,
              borderRadius: 3,
              bgcolor: '#F0F0F0',
              '& .MuiLinearProgress-bar': { borderRadius: 3, background: 'linear-gradient(90deg, #7C4DFF, #651FFF)' },
            }}
          />
          <Typography variant="caption" sx={{ color: '#9E9E9E', whiteSpace: 'nowrap', fontWeight: 600, fontSize: '0.72rem' }}>
            {doneTasks}/{totalTasks} done
          </Typography>
          {selectedSprintId && (
            <Chip
              label={`Sprint: ${sprints.find(s => s._id === selectedSprintId)?.name ?? ''}`}
              size="small"
              onDelete={() => setSelectedSprintId('')}
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
            <Typography variant="body2" sx={{ color: '#BDBDBD' }}>
              Use the sidebar to select or create a board.
            </Typography>
          </Box>
        )}

        {/* ── Kanban columns ── */}
        {selectedBoardId && (
          <Box sx={{ display: 'flex', gap: 2, flex: 1, minHeight: 0, minWidth: 0, overflow: 'hidden' }}>
            <Box
              sx={{
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
              }}
            >
              {COLUMN_ORDER.map(status => (
                <KanbanColumn
                  key={status}
                  status={status}
                  tasks={tasksByStatus(status)}
                  onDragStart={handleDragStart}
                  onDrop={handleDrop}
                  loadingTasks={loadingTasks}
                  onCardClick={task => setSelectedTaskId(task._id)}
                />
              ))}
            </Box>
          </Box>
        )}
      </Box>

      {/* ── Dialogs ── */}
      <TaskDetailsDialog
        open={Boolean(selectedTask)}
        task={selectedTask as any}
        issueKey={selectedTask ? issueNumbers[selectedTask._id] : ''}
        sprints={sprints as any}
        teamMembers={teamMembers}
        comments={comments}
        commentsLoading={commentsLoading}
        saving={savingTask}
        onClose={() => setSelectedTaskId(null)}
        onPatchTask={handlePatchSelectedTask as any}
        onAddComment={handleAddComment}
      />

      <CreateIssueDialog
        open={createOpen}
        boardId={selectedBoardId}
        sprints={sprints as any}
        teamMembers={teamMembers}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreatedIssue}
      />


    </Box>
  );
}
