import { useState } from 'react';
import { Avatar, Box, Chip, Paper, Tooltip, Typography } from '@mui/material';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';

import type { TaskDoc, TaskStatus } from '../types/boards.types';
import { LABEL_COLORS } from '../constants/boards.constants';
import { avatarColor, formatDate, initials, resolveAssigneeName } from '../utils/boards.utils';
import PriorityBadge from './PriorityBadge';

interface TaskCardProps {
  task: TaskDoc;
  columnId: TaskStatus;
  onDragStart: (id: string, from: TaskStatus) => void;
  onClick: () => void;
}

export default function TaskCard({ task, columnId, onDragStart, onClick }: TaskCardProps) {
  const [hovered, setHovered] = useState(false);
  const assigneeName = resolveAssigneeName(task.assignee);

  return (
    <Paper
      draggable
      onDragStart={() => onDragStart(task._id, columnId)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      elevation={hovered ? 4 : 1}
      sx={{
        p: 1.8,
        mb: 1.5,
        borderRadius: '12px',
        cursor: 'pointer',
        border: '1px solid',
        borderColor: hovered ? '#7C4DFF40' : '#F0F0F0',
        transition: 'all 0.2s ease',
        transform: hovered ? 'translateY(-2px)' : 'none',
        bgcolor: 'white',
        '&:active': { cursor: 'grabbing' },
      }}
    >
      {/* Labels */}
      {task.labels.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
          {task.labels.map((lbl, i) => {
            const cfg = LABEL_COLORS[lbl] ?? { color: '#757575', bg: '#F5F5F5' };
            return (
              <Chip
                key={i}
                label={lbl}
                size="small"
                sx={{
                  bgcolor: cfg.bg,
                  color: cfg.color,
                  fontWeight: 700,
                  fontSize: '0.64rem',
                  height: 18,
                  border: `1px solid ${cfg.color}30`,
                }}
              />
            );
          })}
        </Box>
      )}

      {/* Title */}
      <Typography
        variant="body2"
        sx={{ fontWeight: 600, mb: 1, lineHeight: 1.4, color: '#1A1A2E', fontSize: '0.83rem' }}
      >
        {task.title}
      </Typography>

      {/* Priority + Points */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <PriorityBadge priority={task.priority} />
        {task.storyPoints != null && (
          <Typography variant="caption" sx={{ color: '#9E9E9E', fontWeight: 500 }}>
            {task.storyPoints} pts
          </Typography>
        )}
      </Box>

      {/* Assignee + Dates */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {assigneeName ? (
          <Tooltip title={assigneeName}>
            <Avatar
              sx={{ width: 24, height: 24, bgcolor: avatarColor(assigneeName), fontSize: '0.6rem', fontWeight: 700 }}
            >
              {initials(assigneeName)}
            </Avatar>
          </Tooltip>
        ) : (
          <Avatar sx={{ width: 24, height: 24, bgcolor: '#E0E0E0', fontSize: '0.6rem' }}>?</Avatar>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          {task.dueDate && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
              <CalendarTodayOutlinedIcon sx={{ fontSize: 11, color: '#BDBDBD' }} />
              <Typography variant="caption" sx={{ color: '#BDBDBD', fontSize: '0.67rem' }}>
                {formatDate(task.dueDate)}
              </Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 11, color: '#BDBDBD' }} />
            <Typography variant="caption" sx={{ color: '#BDBDBD', fontSize: '0.67rem' }}>
              {formatDate(task.createdAt)}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}
