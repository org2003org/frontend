import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Box, Divider } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import RunCircleIcon from '@mui/icons-material/RunCircle';        
import PeopleIcon from '@mui/icons-material/People';              
import SmartToyIcon from '@mui/icons-material/SmartToy';          
import SettingsIcon from '@mui/icons-material/Settings';          
import CircleIcon from '@mui/icons-material/Circle';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

interface SidebarProps {
  drawerWidth: number;
}

export default function Sidebar({ drawerWidth }: SidebarProps) {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const location = useLocation();

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

  const projects = [
    { id: 'zabatet-platform', name: 'Zabatet Platform', color: '#4A148C' },
    { id: 'mobile-app', name: 'Mobile App', color: '#6200EA' },
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

      <Typography variant="overline" sx={{ px: 3, pt: 1, color: 'text.secondary' }}>Projects</Typography>
      
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
    </Drawer>
  );
}