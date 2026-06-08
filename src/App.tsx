import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/dashboard';
import Boards from './pages/Boards';
import Backlog from './pages/backlog';
import Sprints from './pages/sprints';
import Team from './pages/team';
import Settings from './pages/settings';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to a default project dashboard */}
        <Route path="/" element={<Navigate to="/project/zabatet-platform/dashboard" replace />} />
        
        {/* The Layout acts as a wrapper for all child routes */}
        <Route path="/project/:projectId" element={<AppLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="boards" element={<Boards />} />
          <Route path="backlog" element={<Backlog />} />
          <Route path="sprints" element={<Sprints />} />
          <Route path="team" element={<Team />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;