import { useState } from 'react';
import { Box, Button, Chip, MenuItem, Select, Skeleton } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import RunCircleIcon from '@mui/icons-material/RunCircle';

import type { SprintDoc } from '../types/boards.types';
import { SPRINT_STATUS_COLOR } from '../constants/boards.constants';

interface SprintFilterProps {
  sprints: SprintDoc[];
  selectedSprintId: string;
  onChange: (id: string) => void;
  loading: boolean;
}

export default function SprintFilter({ sprints, selectedSprintId, onChange, loading }: SprintFilterProps) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const selected = sprints.find(s => s._id === selectedSprintId);

  if (loading) return <Skeleton variant="rounded" width={110} height={30} sx={{ borderRadius: '8px' }} />;
  if (sprints.length === 0) return null;

  return (
    <>
      <Button
        size="small"
        startIcon={<RunCircleIcon sx={{ fontSize: 15 }} />}
        endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 15 }} />}
        onClick={e => setAnchor(e.currentTarget)}
        sx={{
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.78rem',
          color: selected ? SPRINT_STATUS_COLOR[selected.status].color : '#757575',
          bgcolor: selected ? SPRINT_STATUS_COLOR[selected.status].bg : '#F5F5F5',
          border: `1px solid ${selected ? SPRINT_STATUS_COLOR[selected.status].color + '40' : '#E0E0E0'}`,
          borderRadius: '8px',
          px: 1.2,
          py: 0.4,
          '&:hover': { opacity: 0.85 },
        }}
      >
        {selected ? selected.name : 'All Sprints'}
      </Button>

      {/* Hidden Select used only to render the dropdown anchored to the button */}
      <Select
        open={Boolean(anchor)}
        onOpen={() => {}}
        onClose={() => setAnchor(null)}
        value={selectedSprintId}
        onChange={e => { onChange(e.target.value as string); setAnchor(null); }}
        sx={{ display: 'none' }}
        MenuProps={{ anchorEl: anchor, open: Boolean(anchor), onClose: () => setAnchor(null) }}
      >
        <MenuItem value="">All Sprints</MenuItem>
        {sprints.map(s => (
          <MenuItem key={s._id} value={s._id}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <RunCircleIcon sx={{ fontSize: 14, color: SPRINT_STATUS_COLOR[s.status].color }} />
              {s.name}
              <Chip
                label={s.status}
                size="small"
                sx={{
                  height: 17,
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  color: SPRINT_STATUS_COLOR[s.status].color,
                  bgcolor: SPRINT_STATUS_COLOR[s.status].bg,
                }}
              />
            </Box>
          </MenuItem>
        ))}
      </Select>
    </>
  );
}
