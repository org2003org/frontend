import { AppBar, Toolbar, Typography, Button, Box, Avatar } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useParams, useLocation } from 'react-router-dom';
import { useState } from 'react';
import CreateWorkspaceDialog from '../workspace/CreateWorkspaceDialog';

export default function Header() {
  const { projectId } = useParams();
  const location = useLocation();
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  
  // Simple logic to format the URL path into a readable title
  const currentPath = location.pathname.split('/').pop();
  const title = currentPath ? currentPath.charAt(0).toUpperCase() + currentPath.slice(1) : '';

  const handleWorkspaceCreated = () => {
    window.dispatchEvent(new Event('workspaceCreated'));
  };

  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid #E0E0E0', bgcolor: 'white' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'inline' }}>
            Zabatet {`>`} {projectId} {`>`}
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
          <Avatar sx={{ bgcolor: '#7C4DFF' }}>ZK</Avatar>
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