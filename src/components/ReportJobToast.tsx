import { Box, CircularProgress, IconButton, Slide, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useReportJob } from '../context/ReportJobContext';

export default function ReportJobToast() {
  const { job, clearJob } = useReportJob();

  const visible = Boolean(job);

  const isPending = job?.status === 'pending';
  const isDone = job?.status === 'done';
  const isError = job?.status === 'error';

  const bgColor = isError
    ? 'linear-gradient(135deg, #FF1744 0%, #D50000 100%)'
    : isDone
    ? 'linear-gradient(135deg, #00C853 0%, #1B5E20 100%)'
    : 'linear-gradient(135deg, #7C4DFF 0%, #651FFF 100%)';

  const icon = isError ? (
    <ErrorIcon sx={{ fontSize: 20, color: '#fff' }} />
  ) : isDone ? (
    <CheckCircleIcon sx={{ fontSize: 20, color: '#fff' }} />
  ) : (
    <AutoAwesomeIcon sx={{ fontSize: 18, color: '#fff', animation: 'pulse 1.5s ease-in-out infinite' }} />
  );

  const title = isError
    ? 'Report failed'
    : isDone
    ? 'Report ready!'
    : 'Generating AI Report…';

  const subtitle = isError
    ? (job?.error ?? 'Something went wrong.')
    : isDone
    ? `Downloading "${job?.boardName}" summary…`
    : `Processing "${job?.boardName}" — you can navigate freely`;

  return (
    <>
      {/* Keyframes for the pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.15); }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      <Slide direction="up" in={visible} mountOnEnter unmountOnExit>
        <Box
          role="status"
          aria-live="polite"
          sx={{
            position: 'fixed',
            bottom: 28,
            right: 28,
            zIndex: 9999,
            minWidth: 320,
            maxWidth: 400,
            borderRadius: '16px',
            background: bgColor,
            boxShadow: '0 8px 32px rgba(0,0,0,0.28)',
            p: '14px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.5,
            animation: 'slideUp 0.3s ease',
          }}
        >
          {/* Icon / Spinner */}
          <Box sx={{ mt: 0.25, flexShrink: 0 }}>
            {isPending ? (
              <CircularProgress size={20} thickness={5} sx={{ color: '#fff' }} />
            ) : (
              icon
            )}
          </Box>

          {/* Text */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem', lineHeight: 1.3 }}
            >
              {title}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255,255,255,0.82)',
                fontSize: '0.76rem',
                display: 'block',
                mt: 0.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {subtitle}
            </Typography>
          </Box>

          {/* Close — always visible so users can dismiss */}
          <IconButton
            size="small"
            onClick={clearJob}
            aria-label="Dismiss report notification"
            sx={{ color: 'rgba(255,255,255,0.7)', p: 0.25, '&:hover': { color: '#fff' } }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Slide>
    </>
  );
}
