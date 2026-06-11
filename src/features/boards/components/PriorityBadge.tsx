import { Chip } from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';
import type { Priority } from '../types/boards.types';
import { PRIORITY_CONFIG } from '../constants/boards.constants';

export default function PriorityBadge({ priority }: { priority: Priority }) {
  const cfg = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.Medium;
  return (
    <Chip
      label={priority}
      size="small"
      icon={<FlagIcon style={{ fontSize: 11, color: cfg.color }} />}
      sx={{
        bgcolor: cfg.bg,
        color: cfg.color,
        fontWeight: 700,
        fontSize: '0.66rem',
        height: 21,
        border: `1px solid ${cfg.color}30`,
        '& .MuiChip-icon': { ml: '5px' },
      }}
    />
  );
}
