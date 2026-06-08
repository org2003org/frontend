import { Box, CssBaseline } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const drawerWidth = 260;

export default function AppLayout() {
  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#F8F9FA' }}>
      <CssBaseline />
      
      <Sidebar drawerWidth={drawerWidth} />

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        
        {/* The Outlet renders whatever page component matches the current URL */}
        <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: 'auto' }}>
          <Outlet /> 
        </Box>
      </Box>
    </Box>
  );
}