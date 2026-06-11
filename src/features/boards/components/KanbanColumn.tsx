import { useState } from 'react';
import { Box, Chip, Skeleton, Typography } from '@mui/material';

import type { TaskDoc, TaskStatus } from '../types/boards.types';
import { COLUMN_DOT } from '../constants/boards.constants';
import TaskCard from './TaskCard';

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: TaskDoc[];
  onDragStart: (id: string, from: TaskStatus) => void;
  onDrop: (to: TaskStatus) => void;
  loadingTasks: boolean;
  onCardClick: (task: TaskDoc) => void;
}

export default function KanbanColumn({
  status, tasks, onDragStart, onDrop, loadingTasks, onCardClick,
}: KanbanColumnProps) {
  const [dragOver, setDragOver] = useState(false);
  const totalPoints = tasks.reduce((s, t) => s + (t.storyPoints ?? 0), 0);

  return (
    <Box
      sx={{ width: 260, minWidth: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', height: '100%' }}
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={() => { setDragOver(false); onDrop(status); }}
    >
      {/* Column header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, px: 0.5, flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLUMN_DOT[status] }} />
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#1A1A2E', fontSize: '0.82rem' }}>
            {status}
          </Typography>
          <Chip
            label={tasks.length}
            size="small"
            sx={{ height: 17, fontSize: '0.61rem', bgcolor: '#F0F0F0', color: '#757575', fontWeight: 700 }}
          />
          {totalPoints > 0 && (
            <Typography variant="caption" sx={{ color: '#BDBDBD', fontWeight: 500, fontSize: '0.7rem' }}>
              {totalPoints}pts
            </Typography>
          )}
        </Box>
      </Box>

      {/* Cards — scrollable drop zone */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          borderRadius: '12px',
          transition: 'all 0.2s ease',
          bgcolor: dragOver ? '#EDE7F610' : 'transparent',
          border: dragOver ? '2px dashed #7C4DFF50' : '2px dashed transparent',
          pr: 0.5,
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-thumb': { bgcolor: '#E0E0E0', borderRadius: 4 },
          '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
        }}
      >
        {loadingTasks
          ? [1, 2].map(i => (
              <Skeleton key={i} variant="rounded" height={110} sx={{ mb: 1.5, borderRadius: '12px' }} />
            ))
          : tasks.map(task => (
              <TaskCard
                key={task._id}
                task={task}
                columnId={status}
                onDragStart={onDragStart}
                onClick={() => onCardClick(task)}
              />
            ))}
      </Box>
    </Box>
  );
}
