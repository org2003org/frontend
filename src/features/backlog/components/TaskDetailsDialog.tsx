import { useEffect, useState, type FormEvent } from 'react';
import {
    Avatar,
    Box,
    Chip,
    CircularProgress,
    Dialog,
    DialogContent,
    Divider,
    FormControl,
    IconButton,
    InputAdornment,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography,
} from '@mui/material';

import type { SelectChangeEvent } from '@mui/material/Select';

import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import SendIcon from '@mui/icons-material/Send';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';

import type {
    CommentDoc,
    Priority,
    SprintDoc,
    TaskDoc,
    UserDoc,
} from '../types/backlog.types';

import DetailsRow from './DetailsRow';
import LabelChip from './LabelChip';
import StatusChip from './StatusChip';

import {
    avatarColor,
    formatFullDate,
    formatInputDate,
    getAssigneeId,
    getAssigneeName,
    getSprintId,
    initials,
    timeAgo,
} from '../utils/backlog.utils';

import {
    line,
    muted,
    priorityDot,
    purple,
    text,
} from '../constants/backlog.constants';

export default function TaskDetailsDialog({
    open,
    task,
    issueKey,
    sprints,
    teamMembers,
    comments,
    commentsLoading,
    saving,
    onClose,
    onPatchTask,
    onAddComment,
}: {
    open: boolean;
    task: TaskDoc | null;
    issueKey: string;
    sprints: SprintDoc[];
    teamMembers: UserDoc[];
    comments: CommentDoc[];
    commentsLoading: boolean;
    saving: boolean;
    onClose: () => void;
    onPatchTask: (patch: Partial<TaskDoc>) => Promise<void>;
    onAddComment: (text: string) => Promise<void>;
}) {
    const [commentText, setCommentText] = useState('');
    const [draftTitle, setDraftTitle] = useState(task?.title ?? '');
    const [draftDescription, setDraftDescription] = useState(task?.description ?? '');

    useEffect(() => {
        setDraftTitle(task?.title ?? '');
        setDraftDescription(task?.description ?? '');
        setCommentText('');
    }, [task?._id]);

    if (!task) return null;

    const status = task.status ?? 'Backlog';
    const priority = task.priority ?? 'Medium';
    const assigneeName = getAssigneeName(task);

    const patchField = async (patch: Partial<TaskDoc>) => {
        await onPatchTask(patch);
    };

    const submitComment = async (event: FormEvent) => {
        event.preventDefault();
        if (!commentText.trim()) return;
        await onAddComment(commentText.trim());
        setCommentText('');
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={false}
            slotProps={{
                backdrop: {
                    sx: {
                        backdropFilter: 'blur(3px)',
                        bgcolor: 'rgba(17, 24, 39, 0.45)',
                    },
                },
                paper: {
                    sx: {
                        width: 996,
                        maxWidth: 'calc(100vw - 48px)',
                        height: 864,
                        maxHeight: 'calc(100vh - 48px)',
                        borderRadius: '16px',
                        boxShadow: '0 24px 80px rgba(15, 23, 42, 0.25)',
                        overflow: 'hidden',
                    },
                },
            }}
        >
            <Box sx={{ height: 70, px: 2.7, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${line}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.3 }}>
                    <Chip label={issueKey} size="small" sx={{ bgcolor: '#F8F9FB', color: muted, fontWeight: 700, borderRadius: '6px' }} />
                    <StatusChip status={status} />
                    {saving && <CircularProgress size={16} sx={{ ml: 1, color: purple }} />}
                </Box>
                <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
            </Box>

            <DialogContent sx={{ p: 0, display: 'grid', gridTemplateColumns: '1fr 268px', overflow: 'hidden' }}>
                <Box sx={{ p: 2.7, overflowY: 'auto' }}>
                    <TextField
                        value={draftTitle}
                        onChange={(e) => setDraftTitle(e.target.value)}
                        onBlur={() => {
                            if (draftTitle.trim() && draftTitle.trim() !== task.title) patchField({ title: draftTitle.trim() });
                        }}
                        fullWidth
                        variant="standard"
                        slotProps={{
                            input: {
                                disableUnderline: true,
                            },
                        }}
                        sx={{
                            mb: 2.2,
                            '& input': { fontSize: 22, fontWeight: 700, color: text, p: 0 },
                        }}
                    />

                    <Typography sx={{ color: '#667085', fontWeight: 700, fontSize: 13, letterSpacing: 1, mb: 1.4 }}>
                        DESCRIPTION
                    </Typography>
                    <TextField
                        value={draftDescription}
                        onChange={(e) => setDraftDescription(e.target.value)}
                        onBlur={() => {
                            if (draftDescription !== (task.description ?? '')) patchField({ description: draftDescription });
                        }}
                        multiline
                        minRows={2}
                        fullWidth
                        placeholder="Add a description..."
                        variant="standard"
                        slotProps={{
                            input: {
                                disableUnderline: true,
                            },
                        }}
                        sx={{ mb: 3.2, '& textarea': { color: '#475467', fontSize: 16, lineHeight: 1.6 } }}
                    />

                    <Box sx={{ borderBottom: `1px solid ${line}`, mt: 3, pb: 1 }}>
                        <Typography sx={{ color: purple, fontWeight: 700, fontSize: 15 }}>
                            Comments ({comments.length})
                        </Typography>
                    </Box>

                    <Box sx={{ py: 2.2 }}>
                        {commentsLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                <CircularProgress size={20} />
                            </Box>
                        ) : comments.length === 0 ? (
                            <Typography sx={{ color: muted, fontSize: 14, mb: 2 }}>
                                No comments yet.
                            </Typography>
                        ) : (
                            comments.map((comment) => {
                                const author =
                                    typeof comment.userId === 'object' && comment.userId
                                        ? comment.userId.name
                                        : 'Team member';

                                return (
                                    <Box
                                        key={comment._id}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: 1.4,
                                            mb: 2.2,
                                        }}
                                    >
                                        <Avatar
                                            sx={{
                                                width: 30,
                                                height: 30,
                                                bgcolor: avatarColor(author),
                                                fontSize: 12,
                                                fontWeight: 700,
                                            }}
                                        >
                                            {initials(author)}
                                        </Avatar>

                                        <Box sx={{ minWidth: 0, flex: 1 }}>
                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 0.6 }}>
                                                <Typography sx={{ color: '#344054', fontWeight: 600, fontSize: 15 }}>
                                                    {author}
                                                </Typography>

                                                <Typography sx={{ color: muted, fontSize: 13 }}>
                                                    {timeAgo(comment.createdAt)}
                                                </Typography>
                                            </Box>

                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    bgcolor: '#F8F9FB',
                                                    borderRadius: '12px',
                                                    px: 2,
                                                    py: 1.4,
                                                }}
                                            >
                                                <Typography sx={{ color: '#475467', fontSize: 15 }}>
                                                    {comment.text}
                                                </Typography>
                                            </Paper>
                                        </Box>
                                    </Box>
                                );
                            })
                        )}

                        <Box
                            component="form"
                            onSubmit={submitComment}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.4,
                                mt: 2.4,
                            }}
                        >
                            <Avatar
                                sx={{
                                    width: 30,
                                    height: 30,
                                    bgcolor: purple,
                                    fontSize: 12,
                                    fontWeight: 700,
                                }}
                            >
                                {initials(assigneeName)}
                            </Avatar>

                            <TextField
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Add a comment..."
                                fullWidth
                                size="small"
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    type="submit"
                                                    disabled={!commentText.trim()}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: purple,
                                                        color: 'white',
                                                        '&:hover': { bgcolor: '#4C1D95' },
                                                        '&.Mui-disabled': { bgcolor: '#EEF2FF' },
                                                    }}
                                                >
                                                    <SendIcon sx={{ fontSize: 15 }} />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                        bgcolor: 'white',
                                    },
                                }}
                            />
                        </Box>
                    </Box>
                </Box>

                <Box sx={{ borderLeft: `1px solid ${line}`, p: 2.7, overflowY: 'auto' }}>
                    <Typography sx={{ color: muted, fontWeight: 800, fontSize: 13, letterSpacing: 1, mb: 2.2 }}>PROPERTIES</Typography>

                    <DetailsRow
                        icon={
                            <Box component="span" sx={{ fontSize: 15, color: muted }}>
                                👤
                            </Box>
                        }
                        label="Assignee"
                    >   <FormControl fullWidth size="small">
                            <Select
                                value={getAssigneeId(task)}
                                displayEmpty
                                onChange={(e: SelectChangeEvent) => patchField({ assignee: e.target.value || null })}
                                sx={{ fontSize: 14, borderRadius: '10px' }}
                            >
                                <MenuItem value="">Unassigned</MenuItem>
                                {teamMembers.map((member) => <MenuItem key={member._id} value={member._id}>{member.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </DetailsRow>

                    <DetailsRow label="Priority">
                        <Select
                            fullWidth
                            size="small"
                            value={priority}
                            onChange={(e: SelectChangeEvent) => patchField({ priority: e.target.value as Priority })}
                            sx={{ borderRadius: '10px', fontSize: 14 }}
                        >
                            {(['Low', 'Medium', 'High'] as Priority[]).map((item) => (
                                <MenuItem key={item} value={item}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: priorityDot[item] }} />
                                        {item}
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </DetailsRow>

                    <DetailsRow icon={<BoltOutlinedIcon sx={{ fontSize: 15, color: muted }} />} label="Sprint">
                        <Select
                            fullWidth
                            size="small"
                            displayEmpty
                            value={getSprintId(task) ?? ''}
                            onChange={(e: SelectChangeEvent) => patchField({ sprintId: e.target.value || null })}
                            sx={{ borderRadius: '10px', fontSize: 14 }}
                        >
                            <MenuItem value="">No Sprint</MenuItem>
                            {sprints.map((sprint) => <MenuItem key={sprint._id} value={sprint._id}>{sprint.name}</MenuItem>)}
                        </Select>
                    </DetailsRow>

                    <DetailsRow label="Story Points">
                        <TextField
                            type="number"
                            size="small"
                            fullWidth
                            value={task.storyPoints ?? 0}
                            onChange={(e) => patchField({ storyPoints: Math.max(0, Number(e.target.value)) })}
                            slotProps={{
                                htmlInput: {
                                    min: 0,
                                },
                            }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                        />
                    </DetailsRow>

                    <DetailsRow icon={<CalendarTodayOutlinedIcon sx={{ fontSize: 15, color: muted }} />} label="Due Date">
                        <TextField
                            type="date"
                            size="small"
                            fullWidth
                            value={formatInputDate(task.dueDate)}
                            onChange={(e) => patchField({ dueDate: e.target.value || undefined })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                        />
                    </DetailsRow>

                    <DetailsRow icon={<LabelOutlinedIcon sx={{ fontSize: 15, color: muted }} />} label="Labels">
                        <TextField
                            size="small"
                            fullWidth
                            value={(task.labels ?? []).join(', ')}
                            placeholder="Backend, Auth"
                            onChange={(e) => patchField({ labels: e.target.value.split(',').map((label) => label.trim()).filter(Boolean) })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                        />
                        <Box sx={{ display: 'flex', gap: 0.7, flexWrap: 'wrap', mt: 1 }}>
                            {(task.labels ?? []).map((label) => <LabelChip key={label} label={label} />)}
                        </Box>
                    </DetailsRow>

                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: 1.2 }}>
                        <Typography sx={{ color: muted, fontSize: 13 }}>Created</Typography>
                        <Typography sx={{ color: '#475467', fontSize: 13 }}>{formatFullDate(task.createdAt)}</Typography>
                        <Typography sx={{ color: muted, fontSize: 13 }}>Updated</Typography>
                        <Typography sx={{ color: '#475467', fontSize: 13 }}>{formatFullDate(task.updatedAt)}</Typography>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
