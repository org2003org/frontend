import React, { useState } from 'react';
import {
    Box, Typography, Avatar, Chip, Skeleton, Paper, IconButton,
    Button, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, CircularProgress, Alert, Tooltip
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import { useDashboardData, avatarColor, getInitials } from '../api/DashboardAPI';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function Team() {
    const { user } = useAuth();
    const { loading, error, memberStats, workspaceId, ownerId, refresh } = useDashboardData();
    
    const [inviteOpen, setInviteOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteLoading, setInviteLoading] = useState(false);
    const [inviteError, setInviteError] = useState('');
    
    const [removeLoading, setRemoveLoading] = useState<string | null>(null);
    const [actionError, setActionError] = useState('');

    const getRoleChip = (role?: string) => {
        if (!role) return null;
        let icon = <PersonIcon sx={{ fontSize: '0.75rem !important' }} />;
        let label = role;
        let bg = '#F5F5F5';
        let color = '#9E9E9E';

        if (role === 'Owner') {
            icon = <WorkspacePremiumIcon sx={{ fontSize: '0.75rem !important' }} />;
            bg = '#FFF3E0';
            color = '#E65100';
        } else if (role === 'Admin') {
            icon = <AdminPanelSettingsIcon sx={{ fontSize: '0.75rem !important' }} />;
            bg = '#EDE7F6';
            color = '#7C4DFF';
        }

        return (
            <Chip
                icon={icon}
                label={label}
                size="small"
                sx={{
                    height: 18,
                    fontSize: '0.6rem',
                    fontWeight: 600,
                    bgcolor: bg,
                    color: color,
                    '& .MuiChip-icon': { color: `${color} !important` }
                }}
            />
        );
    };

    const handleInvite = async () => {
        if (!inviteEmail) return;
        setInviteLoading(true);
        setInviteError('');
        try {
            await api.post(`/workspaces/${workspaceId}/members`, { email: inviteEmail });
            setInviteOpen(false);
            setInviteEmail('');
            refresh();
        } catch (err: any) {
            setInviteError(err.response?.data?.message || 'Failed to invite member');
        } finally {
            setInviteLoading(false);
        }
    };

    const handleRemove = async (memberId: string) => {
        if (!window.confirm("Are you sure you want to remove this member?")) return;
        setRemoveLoading(memberId);
        setActionError('');
        try {
            await api.delete(`/workspaces/${workspaceId}/members/${memberId}`);
            refresh();
        } catch (err: any) {
            setActionError(err.response?.data?.message || 'Failed to remove member');
        } finally {
            setRemoveLoading(null);
        }
    };

    if (loading) {
        return (
            <Box sx={{ p: { xs: 2, sm: 3 }, flex: 1, bgcolor: '#F8F9FA' }}>
                <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
                <Skeleton variant="rounded" height={120} sx={{ borderRadius: '16px' }} />
            </Box>
        );
    }

    return (
        <Box sx={{
            flex: 1, overflowY: 'auto', p: { xs: 2, sm: 3 }, bgcolor: '#F8F9FA',
            '&::-webkit-scrollbar': { width: 6 },
            '&::-webkit-scrollbar-thumb': { bgcolor: '#D0C8F0', borderRadius: 3 },
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#1A1A2E', letterSpacing: '-0.5px' }}>
                        Team Management
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9E9E9E', mt: 0.5 }}>
                        Manage your workspace members and view their performance
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<PersonAddIcon />}
                    onClick={() => setInviteOpen(true)}
                    sx={{
                        bgcolor: '#7C4DFF', borderRadius: '10px', textTransform: 'none', fontWeight: 600,
                        '&:hover': { bgcolor: '#651FFF' }, boxShadow: '0 4px 14px rgba(124, 77, 255, 0.3)'
                    }}
                >
                    Add Member
                </Button>
            </Box>

            {(error || actionError) && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>
                    {error || actionError}
                </Alert>
            )}

            <Paper elevation={2} sx={{ p: 2.5, borderRadius: '16px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#1A1A2E', fontSize: '0.88rem' }}>
                        Workspace Members
                    </Typography>
                    <Chip label={`${memberStats.length} members`} size="small" sx={{ height: 20, fontSize: '0.66rem', fontWeight: 600, bgcolor: '#EDE7F6', color: '#7C4DFF' }} />
                </Box>
                
                {memberStats.length === 0 ? (
                    <Typography variant="body2" sx={{ color: '#BDBDBD', textAlign: 'center', py: 4 }}>No members found</Typography>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {memberStats.map(m => (
                            <Box key={m._id} sx={{
                                display: 'flex', alignItems: 'center', gap: 2, p: 2,
                                borderRadius: '12px', bgcolor: '#FAFAFA', border: '1px solid #F0F0F0',
                                transition: 'all 0.15s', '&:hover': { bgcolor: '#F3F0FF', borderColor: '#D0C8F0' },
                            }}>
                                <Avatar sx={{ width: 40, height: 40, bgcolor: avatarColor(m.name), fontSize: '0.85rem', fontWeight: 700 }}>
                                    {getInitials(m.name)}
                                </Avatar>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1A1A2E', fontSize: '0.9rem' }} noWrap>{m.name}</Typography>
                                        {getRoleChip(m.role)}
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <EmailIcon sx={{ fontSize: 13, color: '#9E9E9E' }} />
                                        <Typography variant="caption" sx={{ color: '#757575', fontSize: '0.75rem' }} noWrap>{m.email}</Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 2, flexShrink: 0, px: 2, borderRight: '1px solid #E0E0E0' }}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1A1A2E', fontSize: '0.85rem' }}>{m.taskCount}</Typography>
                                        <Typography variant="caption" sx={{ color: '#9E9E9E', fontSize: '0.6rem' }}>tasks</Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#7C4DFF', fontSize: '0.85rem' }}>{m.points}</Typography>
                                        <Typography variant="caption" sx={{ color: '#9E9E9E', fontSize: '0.6rem' }}>pts</Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#4CAF50', fontSize: '0.85rem' }}>{m.doneCount}</Typography>
                                        <Typography variant="caption" sx={{ color: '#9E9E9E', fontSize: '0.6rem' }}>done</Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ ml: 1 }}>
                                    {user?._id === ownerId && m._id !== ownerId && (
                                        <Tooltip title="Remove Member">
                                            <IconButton 
                                                onClick={() => handleRemove(m._id)}
                                                disabled={removeLoading === m._id}
                                                sx={{ color: '#FF5252', '&:hover': { bgcolor: '#FFEBEE' } }}
                                            >
                                                {removeLoading === m._id ? <CircularProgress size={20} color="error" /> : <DeleteIcon fontSize="small" />}
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </Box>
                            </Box>
                        ))}
                    </Box>
                )}
            </Paper>

            {/* Invite Dialog */}
            <Dialog open={inviteOpen} onClose={() => setInviteOpen(false)} PaperProps={{ sx: { borderRadius: '14px', width: '100%', maxWidth: 400 } }}>
                <DialogTitle sx={{ fontWeight: 700, color: '#1A1A2E' }}>Invite Member</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ color: '#757575', mb: 3 }}>
                        Enter the email address of the user you want to invite to this workspace. They must already have an account.
                    </Typography>
                    {inviteError && (
                        <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{inviteError}</Alert>
                    )}
                    <TextField
                        autoFocus
                        fullWidth
                        label="Email Address"
                        type="email"
                        variant="outlined"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        disabled={inviteLoading}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, pt: 0 }}>
                    <Button onClick={() => setInviteOpen(false)} disabled={inviteLoading} sx={{ color: '#757575', fontWeight: 600, textTransform: 'none' }}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleInvite} 
                        variant="contained" 
                        disabled={!inviteEmail || inviteLoading}
                        sx={{ bgcolor: '#7C4DFF', borderRadius: '8px', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#651FFF' } }}
                    >
                        {inviteLoading ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Invite'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
