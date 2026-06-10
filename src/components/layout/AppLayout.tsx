import { Box, CssBaseline } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const drawerWidth = 260;

export default function AppLayout() {
  return (
    // Root: full viewport, flex row, NO overflow so nothing leaks past 100vh/100vw
    <Box sx={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', bgcolor: '#F8F9FA' }}>
      <CssBaseline />

      <Sidebar drawerWidth={drawerWidth} />

      <Box sx={{ flexGrow: 1, minWidth: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Header />

        <Box
          component="main"
          sx={{ flexGrow: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}