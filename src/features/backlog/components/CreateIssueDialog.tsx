import { useEffect, useState, type FormEvent } from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    IconButton,
    MenuItem,
    Select,
    TextField,
    Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

import api from '../../../api/api';
import type {
    Priority,
    SprintDoc,
    TaskDoc,
    UserDoc,
} from '../types/backlog.types';
import { getApiError, unwrap } from '../utils/backlog.utils';
import { line, purple, text } from '../constants/backlog.constants';

export default function CreateIssueDialog({
    open,
    boardId,
    sprints,
    teamMembers,
    onClose,
    onCreated,
}: {
    open: boolean;
    boardId: string | null;
    sprints: SprintDoc[];
    teamMembers: UserDoc[];
    onClose: () => void;
    onCreated: (task: TaskDoc) => void;
}) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<Priority>('Medium');
    const [sprintId, setSprintId] = useState('');
    const [assignee, setAssignee] = useState('');
    const [storyPoints, setStoryPoints] = useState(0);
    const [dueDate, setDueDate] = useState('');
    const [labels, setLabels] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!open) return;
        setTitle('');
        setDescription('');
        setPriority('Medium');
        setSprintId('');
        setAssignee('');
        setStoryPoints(0);
        setDueDate('');
        setLabels('');
        setError('');
    }, [open]);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!boardId || !title.trim()) return;

        setSaving(true);
        setError('');
        try {
            const payload = {
                title: title.trim(),
                description: description.trim(),
                priority,
                status: sprintId ? 'To Do' : 'Backlog',
                boardId,
                sprintId: sprintId || null,
                assignee: assignee || null,
                storyPoints,
                dueDate: dueDate || undefined,
                labels: labels.split(',').map((label) => label.trim()).filter(Boolean),
            };
            const { data } = await api.post('/tasks', payload);
            onCreated(unwrap<TaskDoc>(data, data));
            onClose();
        } catch (err: any) {
            setError(getApiError(err, 'Failed to create issue'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            sx={{
                '& .MuiDialog-paper': {
                    borderRadius: '16px',
                },
            }}
        >
            <Box sx={{ px: 3, py: 2.2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${line}` }}>
                <Typography sx={{ fontSize: 18, fontWeight: 700, color: text }}>Create Issue</Typography>
                <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
            </Box>
            <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required fullWidth size="small" sx={{ mb: 2 }} />
                <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth multiline minRows={3} size="small" sx={{ mb: 2 }} />
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                    <Select size="small" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
                        <MenuItem value="Low">Low</MenuItem>
                        <MenuItem value="Medium">Medium</MenuItem>
                        <MenuItem value="High">High</MenuItem>
                    </Select>
                    <Select size="small" displayEmpty value={sprintId} onChange={(e) => setSprintId(e.target.value as string)}>
                        <MenuItem value="">No Sprint</MenuItem>
                        {sprints.map((sprint) => <MenuItem key={sprint._id} value={sprint._id}>{sprint.name}</MenuItem>)}
                    </Select>
                    <Select size="small" displayEmpty value={assignee} onChange={(e) => setAssignee(e.target.value as string)}>
                        <MenuItem value="">Unassigned</MenuItem>
                        {teamMembers.map((member) => <MenuItem key={member._id} value={member._id}>{member.name}</MenuItem>)}
                    </Select>
                    <TextField type="number" size="small" label="Story points" value={storyPoints} onChange={(e) => setStoryPoints(Math.max(0, Number(e.target.value)))} slotProps={{
                        htmlInput: {
                            min: 0,
                        },
                    }} />
                    <TextField type="date" size="small" label="Due date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} slotProps={{
                        inputLabel: {
                            shrink: true,
                        },
                    }} />
                    <TextField size="small" label="Labels" placeholder="Backend, Auth" value={labels} onChange={(e) => setLabels(e.target.value)} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button onClick={onClose} sx={{ textTransform: 'none', color: '#667085' }}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={!title.trim() || saving} startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <AddIcon />} sx={{ textTransform: 'none', borderRadius: '8px', bgcolor: purple }}>
                        {saving ? 'Creating…' : 'Create Issue'}
                    </Button>
                </Box>
            </Box>
        </Dialog>
    );
}
