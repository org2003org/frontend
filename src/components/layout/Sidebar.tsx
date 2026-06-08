import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Box, Divider, IconButton } from '@mui/material';
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
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import CreateWorkspaceDialog from '../workspace/CreateWorkspaceDialog';

interface SidebarProps {
  drawerWidth: number;
}
interface Project {
  id: string;
  name: string;
  color: string;
}

interface Workspace {
  _id: string;
  name: string;
}

export default function Sidebar({ drawerWidth }: SidebarProps) {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const location = useLocation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [shouldRefetch, setShouldRefetch] = useState(false);

  const handleWorkspaceCreated = () => {
    setShouldRefetch(prev => !prev);
  };

  useEffect(() => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMjZlMTBjZmVlNTE1NmU4MThjMGQyNSIsImVtYWlsIjoiemlhZEBleGFtcGxlLmNvbSIsInJvbGUiOiJBZG1pbiIsImlhdCI6MTc4MDkzMjg3NiwiZXhwIjoxNzgxMDE5Mjc2fQ._GAv5mHcXtWMbAnH9DM4B9n0JAk9yJ7jdovY7_9VkwU'; // Note: Hardcoding tokens is not secure for production.
    fetch('http://localhost:5000/api/workspaces', {

      method: 'GET',
      headers: {
        'Authorization': `${token}`
      },
      credentials: 'include' // Include cookies if your backend uses them for auth
    })
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(apiResponse => {
      if (apiResponse.success && Array.isArray(apiResponse.data)) {
        const colors = ['#4A148C', '#6200EA', '#3F51B5', '#2196F3', '#009688', '#4CAF50'];
        const fetchedProjects = apiResponse.data.map((workspace: Workspace, index: number) => ({
          id: workspace.name,
          name: workspace.name,
          color: colors[index % colors.length] // Assign a color from the predefined list
        }));
        setProjects(fetchedProjects);
      }
    })
    .catch(err => {
      console.error('Error fetching workspaces:', err);
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
    { text: 'AI Assistant', icon: <SmartToyIcon />, path: 'ai-assistant' },
    { text: 'Settings', icon: <SettingsIcon />, path: 'settings' },
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
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Zabatet</Typography>
        <Typography variant="caption" color="text.secondary">Startup Workspace</Typography>
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
           <ListItem key={proj.id} disablePadding>
             <ListItemButton onClick={() => navigate(`/project/${proj.id}/dashboard`)}>
               <ListItemIcon sx={{ minWidth: 30 }}>
                 <CircleIcon sx={{ fontSize: 12, color: proj.color }} />
               </ListItemIcon>
               <ListItemText 
                  primary={proj.name} 
                  sx={{ 
                    '& .MuiTypography-root': { 
                      fontSize: '0.9rem', 
                      fontWeight: projectId === proj.id ? 'bold' : 'normal' 
                    } 
                  }} 
                />
             </ListItemButton>
           </ListItem>
        ))}
      </List>

      <CreateWorkspaceDialog 
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        onWorkspaceCreated={handleWorkspaceCreated}
      />
    </Drawer>
  );
}