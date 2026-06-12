import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, CircularProgress, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useState, useEffect } from 'react';
import api from '../../api/api';

interface Workspace {
  _id: string;
  name: string;
  description?: string;
}

interface EditWorkspaceDialogProps {
  open: boolean;
  onClose: () => void;
  workspace: Workspace | null;
  onWorkspaceUpdated: () => void;
}

export default function EditWorkspaceDialog({ open, onClose, workspace, onWorkspaceUpdated }: EditWorkspaceDialogProps) {
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceDescription, setWorkspaceDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (workspace && open) {
      setWorkspaceName(workspace.name);
      // We might not have description in the sidebar workspace object, but we allow editing it anyway.
      setWorkspaceDescription(workspace.description || '');
    }
  }, [workspace, open]);

  const handleUpdateWorkspace = async () => {
    if (!workspace || !workspaceName.trim()) return;
    setSaving(true);
    try {
      await api.put(`/workspaces/${workspace._id}`, {
        name: workspaceName.trim(),
        description: workspaceDescription.trim(),
      });
      onWorkspaceUpdated(); // Notify parent to refetch
      onClose();
    } catch (err: any) {
      console.error('Error updating workspace:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: '16px' } } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1A1A2E' }}>Edit Workspace</Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: '#9E9E9E' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 3, fontSize: '0.9rem', color: '#757575' }}>
          Update the name and description of your workspace.
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Workspace Name"
          type="text"
          fullWidth
          variant="outlined"
          value={workspaceName}
          onChange={(e) => setWorkspaceName(e.target.value)}
          sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
        />
        <TextField
          margin="dense"
          id="description"
          label="Description (Optional)"
          type="text"
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          value={workspaceDescription}
          onChange={(e) => setWorkspaceDescription(e.target.value)}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} sx={{ color: '#757575', textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
        <Button 
          onClick={handleUpdateWorkspace} 
          disabled={!workspaceName.trim() || saving || (workspaceName === workspace?.name && workspaceDescription === (workspace?.description || ''))}
          variant="contained"
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{ 
            bgcolor: '#7C4DFF', borderRadius: '8px', textTransform: 'none', fontWeight: 600,
            '&:hover': { bgcolor: '#651FFF' }
          }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
