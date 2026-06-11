import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Skeleton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';

import api from '../../../api/api';
import type { BoardDoc } from '../types/boards.types';

// ─── Create Board Dialog ───────────────────────────────────────────────────────

interface CreateBoardDialogProps {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
  onCreated: (board: BoardDoc) => void;
}

function CreateBoardDialog({ open, onClose, workspaceId, onCreated }: CreateBoardDialogProps) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError('');
    try {
      const { data } = await api.post('/boards', { name: name.trim(), workspaceId });
      onCreated(data.data ?? data);
      setName('');
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to create board');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: '16px' } } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>New Board</Typography>
        <IconButton onClick={onClose} size="small"><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>

      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 1.5 }}>{error}</Alert>}
        <TextField
          fullWidth
          autoFocus
          label="Board name"
          size="small"
          sx={{ mt: 1 }}
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', color: '#757575' }}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!name.trim() || saving}
          startIcon={saving ? <CircularProgress size={14} color="inherit" /> : null}
          sx={{
            textTransform: 'none',
            borderRadius: '8px',
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

// ─── Board Sidebar (reusable) ──────────────────────────────────────────────────

export interface BoardSidebarProps {
  /** List of boards to display */
  boards: BoardDoc[];
  /** Currently selected board _id (or null) */
  selectedId: string | null;
  /** Called when the user clicks a board row */
  onSelect: (id: string) => void;
  /** Called after a new board is successfully created */
  onBoardCreated: (board: BoardDoc) => void;
  /** Mongo workspace _id — required to create new boards */
  workspaceId: string | null;
  loading: boolean;
}

/**
 * Reusable board-selector sidebar.
 * Drop it into any page (Boards, Sprints, …) to get a consistent left-rail
 * board list with an integrated "New Board" dialog.
 */
export default function BoardSidebar({
  boards,
  selectedId,
  onSelect,
  onBoardCreated,
  workspaceId,
  loading,
}: BoardSidebarProps) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <>
      <Box
        sx={{
          width: 200,
          flexShrink: 0,
          borderRight: '1px solid #F0F0F0',
          pr: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, color: '#9E9E9E', letterSpacing: 0.8, fontSize: '0.68rem' }}
          >
            BOARDS
          </Typography>
          <Tooltip title="New board">
            <span>
              <IconButton
                size="small"
                onClick={() => setCreateOpen(true)}
                disabled={!workspaceId}
                sx={{ color: '#7C4DFF' }}
              >
                <AddIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        {/* Board list */}
        {loading ? (
          [1, 2, 3].map(i => (
            <Skeleton key={i} variant="rounded" height={34} sx={{ borderRadius: '8px' }} />
          ))
        ) : boards.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <DashboardCustomizeIcon sx={{ color: '#E0E0E0', fontSize: 32 }} />
            <Typography variant="caption" sx={{ color: '#BDBDBD', display: 'block', mt: 0.5 }}>
              No boards yet
            </Typography>
          </Box>
        ) : (
          boards.map(board => (
            <Box
              key={board._id}
              onClick={() => onSelect(board._id)}
              sx={{
                px: 1.5,
                py: 0.9,
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: selectedId === board._id ? '#EDE7F6' : 'transparent',
                border: `1px solid ${selectedId === board._id ? '#7C4DFF40' : 'transparent'}`,
                transition: 'all 0.15s ease',
                '&:hover': { bgcolor: selectedId === board._id ? '#EDE7F6' : '#F5F5F5' },
              }}
            >
              <ViewKanbanIcon
                sx={{
                  fontSize: 15,
                  color: selectedId === board._id ? '#7C4DFF' : '#BDBDBD',
                  flexShrink: 0,
                }}
              />
              <Typography
                variant="body2"
                noWrap
                sx={{
                  fontWeight: selectedId === board._id ? 700 : 500,
                  color: selectedId === board._id ? '#7C4DFF' : '#424242',
                  fontSize: '0.81rem',
                }}
              >
                {board.name}
              </Typography>
            </Box>
          ))
        )}
      </Box>

      {/* Create board dialog — self-contained inside the sidebar */}
      {workspaceId && (
        <CreateBoardDialog
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          workspaceId={workspaceId}
          onCreated={board => {
            onBoardCreated(board);
            setCreateOpen(false);
          }}
        />
      )}
    </>
  );
}
