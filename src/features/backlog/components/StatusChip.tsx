import { Chip } from '@mui/material';
import type { TaskStatus } from '../types/backlog.types';
import { statusStyles } from '../constants/backlog.constants';

export default function StatusChip({ status }: { status: TaskStatus }) {
  const cfg = statusStyles[status];

  return (
    <Chip
      label={status}
      size="small"
      sx={{
        height: 22,
        borderRadius: '10px',
        bgcolor: cfg.bg,
        color: cfg.color,
        fontWeight: 500,
        fontSize: 14,
        '& .MuiChip-label': { px: 1 },
      }}
    />
  );
}