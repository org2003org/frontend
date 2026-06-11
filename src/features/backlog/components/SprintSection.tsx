import { useState } from 'react';
import { Box, Chip, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import type { SprintGroup, TaskDoc } from '../types/backlog.types';
import TaskRow from './TaskRow';
import { muted, text } from '../constants/backlog.constants';

export default function SprintSection({
    group,
    issueNumbers,
    commentCounts,
    onOpenTask,
}: {
    group: SprintGroup;
    issueNumbers: Record<string, string>;
    commentCounts: Record<string, number>;
    onOpenTask: (task: TaskDoc) => void;
}) {
    const [open, setOpen] = useState(true);
    const points = group.tasks.reduce((sum, task) => sum + (task.storyPoints ?? 0), 0);

    return (
        <Box>
            <Box
                onClick={() => setOpen((value) => !value)}
                sx={{
                    height: 44,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2.5,
                    cursor: 'pointer',
                    userSelect: 'none',
                }}
            >
                <ExpandMoreIcon sx={{ fontSize: 18, color: muted, transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }} />
                <Typography sx={{ color: text, fontWeight: 700, fontSize: 16 }}>{group.title}</Typography>
                <Chip
                    label={group.tasks.length}
                    size="small"
                    sx={{ height: 22, width: 22, borderRadius: '50%', bgcolor: '#F2F4F7', color: muted, fontWeight: 700 }}
                />
                <Typography sx={{ color: muted, fontSize: 14, ml: 0.5 }}>{points} points</Typography>
            </Box>

            {open && (
                <>
                    {group.tasks.map((task) => (
                        <TaskRow
                            key={task._id}
                            task={task}
                            issueKey={issueNumbers[task._id]}
                            commentsCount={commentCounts[task._id] ?? 0}
                            onOpen={() => onOpenTask(task)}
                        />
                    ))}
                </>
            )}
        </Box>
    );
}
