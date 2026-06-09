import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected routes — require auth */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/project/zabatet-platform/dashboard" replace />} />
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