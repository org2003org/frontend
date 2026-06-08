import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';
import { useState } from 'react';

interface CreateWorkspaceDialogProps {
  open: boolean;
  onClose: () => void;
  onWorkspaceCreated: () => void;
}

export default function CreateWorkspaceDialog({ open, onClose, onWorkspaceCreated }: CreateWorkspaceDialogProps) {
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceDescription, setWorkspaceDescription] = useState('');

  const handleCreateWorkspace = () => {
    const ownerId = '6a26e10cfee5156e818c0d25';
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMjZlMTBjZmVlNTE1NmU4MThjMGQyNSIsImVtYWlsIjoiemlhZEBleGFtcGxlLmNvbSIsInJvbGUiOiJBZG1pbiIsImlhdCI6MTc4MDkzMjg3NiwiZXhwIjoxNzgxMDE5Mjc2fQ._GAv5mHcXtWMbAnH9DM4B9n0JAk9yJ7jdovY7_9VkwU';

    fetch('http://localhost:5000/api/workspaces', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`
      },
      body: JSON.stringify({
        name: workspaceName,
        description: workspaceDescription,
        owner: ownerId
      })
    })
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(apiResponse => {
      if (apiResponse.success) {
        console.log('Workspace created:', apiResponse.data);
        onWorkspaceCreated(); // Notify parent to refetch
        handleClose();
      } else {
        throw new Error(apiResponse.message || 'Failed to create workspace');
      }
    })
    .catch(err => {
      console.error('Error creating workspace:', err);
    });
  };

  const handleClose = () => {
    setWorkspaceName('');
    setWorkspaceDescription('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Create New Workspace</DialogTitle>
      <DialogContent>
        <DialogContentText>
          To create a new workspace, please enter a name and an optional description.
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Workspace Name"
          type="text"
          fullWidth
          variant="standard"
          value={workspaceName}
          onChange={(e) => setWorkspaceName(e.target.value)}
        />
        <TextField
          margin="dense"
          id="description"
          label="Description"
          type="text"
          fullWidth
          multiline
          rows={4}
          variant="standard"
          value={workspaceDescription}
          onChange={(e) => setWorkspaceDescription(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleCreateWorkspace} disabled={!workspaceName}>Create</Button>
      </DialogActions>
    </Dialog>
  );
}
