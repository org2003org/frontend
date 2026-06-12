import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, CircularProgress, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';
import api from '../../api/api';

interface CreateWorkspaceDialogProps {
  open: boolean;
  onClose: () => void;
  onWorkspaceCreated: () => void;
}

export default function CreateWorkspaceDialog({ open, onClose, onWorkspaceCreated }: CreateWorkspaceDialogProps) {
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceDescription, setWorkspaceDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCreateWorkspace = async () => {
    if (!workspaceName.trim()) return;
    setSaving(true);
    try {
      const { data } = await api.post('/workspaces', {
        name: workspaceName.trim(),
        description: workspaceDescription.trim(),
      });
      console.log('Workspace created:', data);
      onWorkspaceCreated(); // Notify parent to refetch
      handleClose();
    } catch (err: any) {
      console.error('Error creating workspace:', err);
      // Optional: add a toast or error state here
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setWorkspaceName('');
    setWorkspaceDescription('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: '16px' } } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1A1A2E' }}>Create Workspace</Typography>
        <IconButton onClick={handleClose} size="small" sx={{ color: '#9E9E9E' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 3, fontSize: '0.9rem', color: '#757575' }}>
          Workspaces are shared environments where your team can collaborate on projects and boards.
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
        <Button onClick={handleClose} sx={{ color: '#757575', textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
        <Button 
          onClick={handleCreateWorkspace} 
          disabled={!workspaceName.trim() || saving}
          variant="contained"
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{ 
            bgcolor: '#7C4DFF', borderRadius: '8px', textTransform: 'none', fontWeight: 600,
            '&:hover': { bgcolor: '#651FFF' }
          }}
        >
          {saving ? 'Creating...' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
