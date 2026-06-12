import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Boards from './pages/Boards';
import Backlog from './pages/Backlog';
import Sprints from './pages/Sprints';
import Team from './pages/Team';
import Settings from './pages/Settings';
import WorkspaceRedirect from './pages/WorkspaceRedirect';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected routes — require auth */}
        <Route element={<ProtectedRoute />}>
          {/* Smart landing: redirects to first workspace or shows "create first" screen */}
          <Route path="/" element={<WorkspaceRedirect />} />
          <Route path="/profile" element={<Profile />} />

          <Route path="/project/:projectId" element={<AppLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="boards" element={<Boards />} />
            <Route path="backlog" element={<Backlog />} />
            <Route path="sprints" element={<Sprints />} />
            <Route path="team" element={<Team />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;