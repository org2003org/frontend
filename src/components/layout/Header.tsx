import { AppBar, Toolbar, Typography, Button, Box, Avatar, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import CreateWorkspaceDialog from '../workspace/CreateWorkspaceDialog';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const { projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [openCreateDialog, setOpenCreateDialog] = useState(false);

  const currentPath = location.pathname.split('/').pop();
  const title = currentPath ? currentPath.charAt(0).toUpperCase() + currentPath.slice(1) : '';

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const handleWorkspaceCreated = () => {
    window.dispatchEvent(new Event('workspaceCreated'));
  };

  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid #E0E0E0', bgcolor: 'white' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>

        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'inline' }}>
            {user?.name ?? 'N/A'} {`>`} {projectId} {`>`}
          </Typography>
          <Typography variant="h6" color="text.primary" sx={{ display: 'inline', ml: 1, fontWeight: 'bold' }}>
            {title}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateDialog(true)}
            sx={{ borderRadius: '20px', textTransform: 'none' }}
          >
            Create
          </Button>
          <IconButton onClick={() => navigate('/profile')} sx={{ p: 0 }}>
            <Avatar sx={{ bgcolor: '#7C4DFF', cursor: 'pointer' }}>{initials}</Avatar>
          </IconButton>
        </Box>

        <CreateWorkspaceDialog
          open={openCreateDialog}
          onClose={() => setOpenCreateDialog(false)}
          onWorkspaceCreated={handleWorkspaceCreated}
        />

      </Toolbar>
    </AppBar>
  );
}