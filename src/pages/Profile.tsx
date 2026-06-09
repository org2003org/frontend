import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Alert,
  CircularProgress,
  Divider,
  Paper,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name ?? '');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await updateUser({ name: name.trim() });
      setSuccess('Name updated successfully');
      setEditing(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <Box sx={styles.page}>
      <Box sx={styles.blob1} />
      <Box sx={styles.blob2} />

      <Paper sx={styles.card} elevation={0}>
        <Box sx={styles.avatarSection}>
          <Avatar sx={styles.avatar}>{initials}</Avatar>
          <Typography sx={styles.userName}>{user?.name}</Typography>
          <Typography sx={styles.userEmail}>{user?.email}</Typography>
          <Box sx={styles.roleBadge}>
            <Typography sx={styles.roleText}>{user?.role}</Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', my: 3 }} />

        {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

        <Box>
          <Typography sx={styles.sectionLabel}>Full name</Typography>
          <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
            <TextField
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!editing}
              fullWidth
              size="small"
              sx={styles.input}
            />
            {!editing ? (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => { setEditing(true); setSuccess(''); }}
                sx={styles.editBtn}
              >
                Edit
              </Button>
            ) : (
              <Button
                variant="contained"
                startIcon={saving ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <SaveIcon />}
                disabled={saving || !name.trim()}
                onClick={handleSave}
                sx={styles.saveBtn}
              >
                Save
              </Button>
            )}
          </Box>

          <Typography sx={styles.sectionLabel}>Email address</Typography>
          <TextField
            value={user?.email ?? ''}
            disabled
            fullWidth
            size="small"
            sx={{ ...styles.input, mb: 3 }}
          />
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 3 }} />

        <Button
          fullWidth
          variant="outlined"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={styles.logoutBtn}
        >
          Sign out
        </Button>
      </Paper>
    </Box>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f0c29 0%, #1a1a3e 50%, #24243e 100%)',
    position: 'relative',
    overflow: 'hidden',
    p: 2,
  },
  blob1: {
    position: 'absolute',
    width: 450,
    height: 450,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)',
    top: '-120px',
    left: '-120px',
    pointerEvents: 'none',
  },
  blob2: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 70%)',
    bottom: '-80px',
    right: '-80px',
    pointerEvents: 'none',
  },
  card: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth: 440,
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 4,
    p: { xs: 3, sm: 4 },
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
  },
  avatarSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1,
  },
  avatar: {
    width: 80,
    height: 80,
    fontSize: 32,
    fontWeight: 700,
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    boxShadow: '0 8px 24px rgba(99,102,241,0.5)',
    mb: 1,
  },
  userName: {
    color: '#fff',
    fontWeight: 700,
    fontSize: 22,
    letterSpacing: '-0.3px',
  },
  userEmail: {
    color: '#94a3b8',
    fontSize: 14,
  },
  roleBadge: {
    mt: 0.5,
    px: 1.5,
    py: 0.25,
    borderRadius: 10,
    background: 'rgba(99,102,241,0.2)',
    border: '1px solid rgba(99,102,241,0.35)',
  },
  roleText: {
    color: '#a5b4fc',
    fontSize: 12,
    fontWeight: 600,
    textTransform: 'capitalize',
  },
  sectionLabel: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: 500,
    mb: 0.75,
  },
  input: {
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'rgba(255,255,255,0.06)',
      borderRadius: 2,
      color: '#fff',
      fontSize: 14,
      '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.25)' },
      '&.Mui-focused fieldset': { borderColor: '#6366f1', borderWidth: 1.5 },
      '&.Mui-disabled': {
        backgroundColor: 'rgba(255,255,255,0.03)',
        '& input': { color: '#64748b', WebkitTextFillColor: '#64748b' },
        '& fieldset': { borderColor: 'rgba(255,255,255,0.06)' },
      },
    },
    '& input': { color: '#fff' },
  },
  editBtn: {
    whiteSpace: 'nowrap',
    borderColor: 'rgba(255,255,255,0.15)',
    color: '#94a3b8',
    textTransform: 'none',
    borderRadius: 2,
    '&:hover': { borderColor: 'rgba(255,255,255,0.3)', bgcolor: 'rgba(255,255,255,0.05)' },
  },
  saveBtn: {
    whiteSpace: 'nowrap',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    textTransform: 'none',
    borderRadius: 2,
    boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
    '&:hover': { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' },
    '&.Mui-disabled': { background: 'rgba(99,102,241,0.3)', color: '#fff' },
  },
  logoutBtn: {
    borderColor: 'rgba(239,68,68,0.4)',
    color: '#f87171',
    textTransform: 'none',
    borderRadius: 2,
    fontWeight: 600,
    py: 1.2,
    '&:hover': { borderColor: '#f87171', bgcolor: 'rgba(239,68,68,0.08)' },
  },
} as const;
