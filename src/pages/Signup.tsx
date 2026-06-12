import { useState, type FormEvent } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export default function Signup() {
  const { signup, loading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    try {
      await signup(name, email, password);
      navigate('/', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  return (
    <Box sx={styles.page}>
      <Box sx={styles.blob1} />
      <Box sx={styles.blob2} />
      <Box sx={styles.blob3} />

      <Box sx={styles.card}>
        {/* Brand */}
        <Box sx={styles.brand}>
          <Box sx={styles.logoIcon}>Z</Box>
          <Typography sx={styles.logoText}>Zabatet</Typography>
        </Box>

        <Typography sx={styles.heading}>Create your account</Typography>
        <Typography sx={styles.subheading}>Join your team and start shipping faster</Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={styles.form}>

          <Box sx={styles.fieldGroup}>
            <Typography sx={styles.label}>Full name</Typography>
            <TextField
              id="signup-name"
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
              size="small"
              sx={styles.input}
            />
          </Box>

          <Box sx={styles.fieldGroup}>
            <Typography sx={styles.label}>Email address</Typography>
            <TextField
              id="signup-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              size="small"
              sx={styles.input}
            />
          </Box>

          <Box sx={styles.row}>
            <Box sx={{ ...styles.fieldGroup, flex: 1 }}>
              <Typography sx={styles.label}>Password</Typography>
              <TextField
                id="signup-password"
                type={showPass ? 'text' : 'password'}
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
                size="small"
                sx={styles.input}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPass((v) => !v)}
                          edge="end"
                          size="small"
                          sx={{ color: '#94a3b8' }}
                        >
                          {showPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>

            <Box sx={{ ...styles.fieldGroup, flex: 1 }}>
              <Typography sx={styles.label}>Confirm password</Typography>
              <TextField
                id="signup-confirm"
                type={showConfirm ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                fullWidth
                size="small"
                sx={{
                  ...styles.input,
                  ...(confirm && password !== confirm && {
                    '& .MuiOutlinedInput-root fieldset': { borderColor: '#f87171 !important' },
                  }),
                }}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirm((v) => !v)}
                          edge="end"
                          size="small"
                          sx={{ color: '#94a3b8' }}
                        >
                          {showConfirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>
          </Box>

          <Button
            id="signup-submit"
            type="submit"
            fullWidth
            disabled={loading}
            sx={styles.submitBtn}
          >
            {loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Create account'}
          </Button>
        </Box>

        <Typography sx={styles.switchText}>
          Already have an account?{' '}
          <Link component={RouterLink} to="/login" sx={styles.switchLink}>
            Sign in
          </Link>
        </Typography>
      </Box>
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
    width: 500,
    height: 500,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
    top: '-200px',
    right: '-100px',
    pointerEvents: 'none',
  },
  blob2: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 70%)',
    bottom: '-100px',
    left: '-80px',
    pointerEvents: 'none',
  },
  blob3: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 70%)',
    top: '40%',
    left: '10%',
    pointerEvents: 'none',
  },
  card: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth: 480,
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 4,
    p: { xs: 3, sm: 4 },
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    mb: 3,
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 2,
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 800,
    fontSize: 20,
    boxShadow: '0 4px 14px rgba(99,102,241,0.5)',
  },
  logoText: {
    color: '#fff',
    fontWeight: 700,
    fontSize: 22,
    letterSpacing: '-0.5px',
  },
  heading: {
    color: '#fff',
    fontWeight: 700,
    fontSize: 24,
    mb: 0.5,
    letterSpacing: '-0.5px',
  },
  subheading: {
    color: '#94a3b8',
    fontSize: 14,
    mb: 3,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2.5,
    mb: 3,
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.75,
  },
  row: {
    display: 'flex',
    gap: 2,
    flexDirection: { xs: 'column', sm: 'row' },
  },
  label: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: 500,
  },
  input: {
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'rgba(255,255,255,0.06)',
      borderRadius: 2,
      color: '#fff',
      fontSize: 14,
      transition: 'all 0.2s',
      '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.25)' },
      '&.Mui-focused fieldset': { borderColor: '#6366f1', borderWidth: 1.5 },
    },
    '& input::placeholder': { color: '#475569', opacity: 1 },
    '& input': { color: '#fff' },
  },
  toggleGroup: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: 2,
    border: '1px solid rgba(255,255,255,0.1)',
    overflow: 'hidden',
    '& .MuiToggleButton-root': {
      border: 'none',
      color: '#64748b',
      fontWeight: 500,
      fontSize: 13,
      py: 1,
      textTransform: 'none',
      transition: 'all 0.2s',
      '&.Mui-selected': {
        background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3))',
        color: '#a5b4fc',
        fontWeight: 600,
      },
      '&:hover': { background: 'rgba(255,255,255,0.07)' },
    },
  },
  toggleBtn: {},
  submitBtn: {
    mt: 0.5,
    py: 1.3,
    borderRadius: 2,
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    fontWeight: 600,
    fontSize: 15,
    textTransform: 'none',
    letterSpacing: 0.2,
    boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
    transition: 'all 0.25s',
    '&:hover': {
      background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
      boxShadow: '0 6px 24px rgba(99,102,241,0.6)',
      transform: 'translateY(-1px)',
    },
    '&:active': { transform: 'translateY(0)' },
    '&.Mui-disabled': { background: 'rgba(99,102,241,0.3)', color: '#fff' },
  },
  switchText: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 13,
  },
  switchLink: {
    color: '#818cf8',
    fontWeight: 600,
    textDecoration: 'none',
    '&:hover': { textDecoration: 'underline' },
  },
} as const;
