import { Avatar, Box, Chip, Typography } from '@mui/material';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';

import type { TaskDoc } from '../types/backlog.types';
import LabelChip from './LabelChip';
import StatusChip from './StatusChip';

import {
    avatarColor,
    formatShortDate,
    getAssigneeName,
    initials,
} from '../utils/backlog.utils';

import {
    line,
    muted,
    statusDot,
    text,
} from '../constants/backlog.constants';

export default function TaskRow({
    task,
    issueKey,
    commentsCount,
    onOpen,
}: {
    task: TaskDoc;
    issueKey: string;
    commentsCount: number;
    onOpen: () => void;
}) {
    const status = task.status ?? 'Backlog';
    const assigneeName = getAssigneeName(task);

    return (
        <Box
            onClick={onOpen}
            sx={{
                display: 'grid',
                gridTemplateColumns: '76px 102px minmax(360px, 1fr) 190px 72px 120px 96px 52px',
                alignItems: 'center',
                minHeight: 50,
                borderBottom: `1px solid ${line}`,
                cursor: 'pointer',
                '&:hover': { bgcolor: '#FAFAFF' },
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.3, color: muted, fontSize: 14, px: 2.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: statusDot[status] }} />
                {issueKey}
            </Box>

            <Box><StatusChip status={status} /></Box>

            <Typography sx={{ color: text, fontSize: 16, fontWeight: 400, pr: 2 }} noWrap>
                {task.title}
            </Typography>

            <Box sx={{ display: 'flex', gap: 0.7, justifyContent: 'flex-end', flexWrap: 'wrap', pr: 1 }}>
                {(task.labels ?? []).slice(0, 3).map((label) => <LabelChip key={label} label={label} />)}
            </Box>

            <Box sx={{ justifySelf: 'center' }}>
                {task.storyPoints != null && (
                    <Chip
                        label={`${task.storyPoints}pt`}
                        size="small"
                        sx={{ height: 22, borderRadius: '6px', bgcolor: '#F8F9FB', color: '#667085', fontSize: 14 }}
                    />
                )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <Avatar sx={{ width: 22, height: 22, fontSize: 10, bgcolor: avatarColor(assigneeName), fontWeight: 700 }}>
                    {assigneeName === 'Unassigned' ? '?' : initials(assigneeName)}
                </Avatar>
                <Typography sx={{ color: '#475467', fontSize: 14 }} noWrap>{assigneeName.split(' ')[0]}</Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, color: muted }}>
                <CalendarTodayOutlinedIcon sx={{ fontSize: 15 }} />
                <Typography sx={{ fontSize: 14 }}>{formatShortDate(task.dueDate)}</Typography>
            </Box>

            <Box sx={{ color: muted, display: 'flex', alignItems: 'center', gap: 0.4 }}>
                {commentsCount > 0 && (
                    <>
                        <Box
                            component="span"
                            sx={{
                                fontSize: 14,
                                lineHeight: 1,
                                color: '#98A2B3',
                            }}
                        >
                            💬
                        </Box>
                        <Typography sx={{ fontSize: 13 }}>{commentsCount}</Typography>
                    </>
                )}
            </Box>
        </Box>
    );
}
