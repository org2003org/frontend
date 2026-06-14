import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Box, Divider, IconButton, Menu, MenuItem } from '@mui/material';
import { useEffect, useState } from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import RunCircleIcon from '@mui/icons-material/RunCircle';
import PeopleIcon from '@mui/icons-material/People';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SettingsIcon from '@mui/icons-material/Settings';
import CircleIcon from '@mui/icons-material/Circle';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import CreateWorkspaceDialog from '../workspace/CreateWorkspaceDialog';
import EditWorkspaceDialog from '../workspace/EditWorkspaceDialog';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  drawerWidth: number;
}
interface Project {
  _id: string;
  id: string;
  name: string;
  description?: string;
  color: string;
}

interface Workspace {
  _id: string;
  name: string;
  description?: string;
}

export default function Sidebar({ drawerWidth }: SidebarProps) {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [shouldRefetch, setShouldRefetch] = useState(false);

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Project | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, workspace: Project) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedWorkspace(workspace);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleEditClick = () => {
    handleMenuClose();
    setOpenEditDialog(true);
  };

  const handleDeleteClick = async () => {
    handleMenuClose();
    if (!selectedWorkspace) return;
    if (window.confirm(`Are you sure you want to delete workspace "${selectedWorkspace.name}"?`)) {
      try {
        const { default: api } = await import('../../api/api');
        await api.delete(`/workspaces/${selectedWorkspace._id}`);
        handleWorkspaceCreated(); // Refetch workspaces
        if (projectId === selectedWorkspace.id) {
          navigate('/');
        }
      } catch (err) {
        console.error('Error deleting workspace', err);
      }
    }
  };

  const handleWorkspaceCreated = () => {
    setShouldRefetch(prev => !prev);
  };

  useEffect(() => {
    const onWorkspaceCreated = () => {
      setShouldRefetch(prev => !prev);
    };
    window.addEventListener('workspaceCreated', onWorkspaceCreated);
    return () => {
      window.removeEventListener('workspaceCreated', onWorkspaceCreated);
    };
  }, []);

  useEffect(() => {
    import('../../api/api').then(({ default: api }) => {
      api.get('/workspaces')
        .then(res => {
          const data = res.data?.data || res.data;
          if (Array.isArray(data)) {
            const colors = ['#4A148C', '#6200EA', '#3F51B5', '#2196F3', '#009688', '#4CAF50'];
            const fetchedProjects = data.map((workspace: Workspace, index: number) => ({
              _id: workspace._id,
              id: workspace.name,
              name: workspace.name,
              description: workspace.description,
              color: colors[index % colors.length]
            }));
            setProjects(fetchedProjects);
          }
        })
        .catch(err => {
          console.error('Error fetching workspaces:', err);
        });
    });
  }, [shouldRefetch]);

  // Core project management links
  const primaryMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: 'dashboard' },
    { text: 'Boards', icon: <ViewKanbanIcon />, path: 'boards' },
    { text: 'Backlog', icon: <FormatListBulletedIcon />, path: 'backlog' },
    { text: 'Sprints', icon: <RunCircleIcon />, path: 'sprints' },
  ];

  // Collaboration and utility links
  const secondaryMenuItems = [
    { text: 'Team', icon: <PeopleIcon />, path: 'team' },
  ];

  // Helper component to avoid repetitive rendering logic
  const renderNavList = (items: typeof primaryMenuItems) => (
    <List>
      {items.map((item) => {
        const targetPath = `/project/${projectId}/${item.path}`;
        const isActive = location.pathname === targetPath;

        return (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={isActive}
              onClick={() => navigate(targetPath)}
              sx={{
                borderRadius: '0 20px 20px 0',
                mr: 2,
                mb: 0.5,
                '&.Mui-selected': { bgcolor: '#EDE7F6', color: '#6200EA' }
              }}
            >
              <ListItemIcon sx={{ color: isActive ? '#6200EA' : 'inherit', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} sx={{ '& .MuiTypography-root': { fontWeight: isActive ? 'bold' : 'normal' } }} />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', borderRight: '1px solid #E0E0E0' },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{user?.name ?? 'N/A'}</Typography>
        <Typography variant="caption" color="text.secondary">{user?.email ?? 'N/A'}</Typography>
      </Box>

      {/* Render Workspace Management links */}
      {renderNavList(primaryMenuItems)}

      <Divider sx={{ my: 1 }} />

      {/* Render Collaboration/AI/Settings links */}
      {renderNavList(secondaryMenuItems)}

      <Divider sx={{ my: 1 }} />

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, pt: 1 }}>
        <Typography variant="overline" sx={{ color: 'text.secondary' }}>Projects</Typography>
        <IconButton size="small" onClick={() => setOpenCreateDialog(true)}>
          <AddIcon fontSize="small" />
        </IconButton>
      </Box>

      <List>
        {projects.map((proj) => (
          <ListItem
            key={proj.id}
            disablePadding
            secondaryAction={
              <IconButton edge="end" size="small" onClick={(e) => handleMenuClick(e, proj)} sx={{ mr: 0.5, color: '#9E9E9E' }}>
                <MoreVertIcon fontSize="small" />
              </IconButton>
            }
          >
            <ListItemButton onClick={() => navigate(`/project/${proj.id}/dashboard`)} sx={{ pr: 5 }}>
              <ListItemIcon sx={{ minWidth: 30 }}>
                <CircleIcon sx={{ fontSize: 12, color: proj.color }} />
              </ListItemIcon>
              <ListItemText
                primary={proj.name}
                sx={{
                  '& .MuiTypography-root': {
                    fontSize: '0.9rem',
                    fontWeight: projectId === proj.id ? 'bold' : 'normal',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        slotProps={{ paper: { sx: { borderRadius: '10px', minWidth: 140, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' } } }}
      >
        <MenuItem onClick={handleEditClick} sx={{ fontSize: '0.85rem' }}>
          <ListItemIcon sx={{ minWidth: 28 }}><EditIcon fontSize="small" /></ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ fontSize: '0.85rem', color: '#D32F2F' }}>
          <ListItemIcon sx={{ minWidth: 28 }}><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          Delete
        </MenuItem>
      </Menu>

      <CreateWorkspaceDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        onWorkspaceCreated={handleWorkspaceCreated}
      />

      <EditWorkspaceDialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        workspace={selectedWorkspace as any}
        onWorkspaceUpdated={handleWorkspaceCreated}
      />
    </Drawer>
  );
}