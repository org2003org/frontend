import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
} from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import AddIcon from '@mui/icons-material/Add';
import api from '../api/api';
import CreateWorkspaceDialog from '../components/workspace/CreateWorkspaceDialog';

interface Workspace {
  _id: string;
  name: string;
}

export default function WorkspaceRedirect() {
  const [loading, setLoading] = useState(true);
  const [firstWorkspace, setFirstWorkspace] = useState<Workspace | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [created, setCreated] = useState(false);

  const fetchWorkspaces = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/workspaces');
      const list: Workspace[] = data.data ?? data;
      if (Array.isArray(list) && list.length > 0) {
        setFirstWorkspace(list[0]);
      } else {
        setFirstWorkspace(null);
      }
    } catch {
      setFirstWorkspace(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [created]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          height: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f0c29 0%, #1a1a3e 50%, #24243e 100%)',
        }}
      >
        <CircularProgress sx={{ color: '#6366f1' }} />
      </Box>
    );
  }

  if (firstWorkspace) {
    return <Navigate to={`/project/${firstWorkspace.name}/dashboard`} replace />;
  }

  // No workspaces — show a premium "Get Started" screen
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f0c29 0%, #1a1a3e 50%, #24243e 100%)',
        position: 'relative',
        overflow: 'hidden',
        p: 2,
      }}
    >
      {/* Decorative blobs */}
      <Box
        sx={{
          position: 'absolute',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
          top: '-200px',
          left: '-200px',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 70%)',
          bottom: '-150px',
          right: '-150px',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,211,238,0.1) 0%, transparent 70%)',
          top: '40%',
          right: '20%',
          pointerEvents: 'none',
        }}
      />

      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          maxWidth: 520,
        }}
      >
        {/* Animated icon */}
        <Box
          sx={{
            width: 100,
            height: 100,
            borderRadius: '28px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 4,
            boxShadow: '0 20px 50px rgba(99,102,241,0.5)',
            animation: 'float 3s ease-in-out infinite',
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-12px)' },
            },
          }}
        >
          <RocketLaunchIcon sx={{ fontSize: 50, color: '#fff' }} />
        </Box>

        {/* Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 3 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 800,
              fontSize: 18,
              boxShadow: '0 4px 14px rgba(99,102,241,0.5)',
            }}
          >
            Z
          </Box>
          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 22, letterSpacing: '-0.5px' }}>
            Zabatet
          </Typography>
        </Box>

        <Typography
          variant="h4"
          sx={{
            color: '#fff',
            fontWeight: 800,
            letterSpacing: '-1px',
            mb: 1.5,
            lineHeight: 1.2,
          }}
        >
          Welcome aboard! 👋
        </Typography>
        <Typography
          sx={{
            color: '#94a3b8',
            fontSize: 16,
            lineHeight: 1.7,
            mb: 4,
          }}
        >
          You don't have any projects yet. Create your first workspace to start
          managing tasks, boards, and sprints with your team.
        </Typography>

        {/* Feature pills */}
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            justifyContent: 'center',
            flexWrap: 'wrap',
            mb: 5,
          }}
        >
          {['Kanban Boards', 'Sprint Planning', 'Backlog', 'Team Management'].map((f) => (
            <Box
              key={f}
              sx={{
                px: 2,
                py: 0.6,
                borderRadius: '999px',
                border: '1px solid rgba(99,102,241,0.35)',
                background: 'rgba(99,102,241,0.1)',
                color: '#a5b4fc',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {f}
            </Box>
          ))}
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}
          sx={{
            py: 1.6,
            px: 5,
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff',
            fontWeight: 700,
            fontSize: 16,
            textTransform: 'none',
            letterSpacing: 0.3,
            boxShadow: '0 8px 30px rgba(99,102,241,0.5)',
            transition: 'all 0.25s',
            '&:hover': {
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              boxShadow: '0 12px 40px rgba(99,102,241,0.7)',
              transform: 'translateY(-2px)',
            },
            '&:active': { transform: 'translateY(0)' },
          }}
        >
          Create Your First Project
        </Button>

        <Typography sx={{ color: '#475569', fontSize: 13, mt: 2.5 }}>
          Takes less than 30 seconds to set up
        </Typography>
      </Box>

      <CreateWorkspaceDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onWorkspaceCreated={() => {
          setCreateOpen(false);
          setCreated((v) => !v); // trigger refetch
        }}
      />
    </Box>
  );
}
