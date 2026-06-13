
import {
    Box, Typography, Avatar, Chip, Tooltip, Skeleton, Paper, IconButton,
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import BoltIcon from '@mui/icons-material/Bolt';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RefreshIcon from '@mui/icons-material/Refresh';

import { useAuth } from '../context/AuthContext';
import {
    useDashboardData, type Priority,
    STATUS_COLORS, PRIORITY_COLORS, STATUS_ORDER, PRIORITY_ORDER,
    avatarColor, getInitials,
} from '../api/DashboardAPI';

function DonutChart({ items, total, title, loading }: {
    items: { label: string; count: number; color: string; bg?: string }[];
    total: number; title: string; loading: boolean;
}) {
    if (loading)
        return <Skeleton variant="rounded" height={280} sx={{ borderRadius: '16px' }} />;

    let percent = 0;
    const stops = items.filter(i => i.count > 0).flatMap(i => {
        const start = percent;
        percent += (i.count / total) * 100;
        return [`${i.color} ${start}%`, `${i.color} ${percent}%`];
    });
    const bg = stops.length ? `conic-gradient(${stops.join(', ')})` : '#F0F0F0';

    return (
        <Paper elevation={2} sx={{ p: 2.5, borderRadius: '16px', border: 'none', height: '100%' }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1A1A2E', mb: 2, fontSize: '0.88rem' }}>{title}</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                {total === 0 ? (
                    <Typography variant="body2" sx={{ color: '#BDBDBD', py: 4 }}>No tasks</Typography>
                ) : (
                    <Box sx={{
                        width: 130, height: 130, borderRadius: '50%', background: bg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Box sx={{
                            width: 94, height: 94, borderRadius: '50%', bgcolor: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
                        }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1A1A2E', lineHeight: 1 }}>{total}</Typography>
                            <Typography variant="caption" sx={{ color: '#9E9E9E', fontSize: '0.65rem' }}>tasks</Typography>
                        </Box>
                    </Box>
                )}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, width: '100%' }}>
                    {items.map(it => (
                        <Box key={it.label} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: it.color }} />
                                <Typography variant="caption" sx={{ color: '#424242', fontWeight: 500, fontSize: '0.75rem' }}>{it.label}</Typography>
                            </Box>
                            <Chip label={it.count} size="small" sx={{
                                height: 20, fontSize: '0.68rem', fontWeight: 700,
                                bgcolor: it.bg ?? `${it.color}18`, color: it.color,
                                border: `1px solid ${it.color}30`,
                            }} />
                        </Box>
                    ))}
                </Box>
            </Box>
        </Paper>
    );
}

const KPI_CONFIG = [
    { key: 'totalTasks', label: 'Total Tasks', icon: AssignmentIcon, accent: '#7C4DFF' },
    { key: 'totalBoards', label: 'Boards', icon: ViewKanbanIcon, accent: '#009688' },
    { key: 'activeSprints', label: 'Active Sprints', icon: BoltIcon, accent: '#FF9800' },
    { key: 'totalStoryPoints', label: 'Story Points', icon: StarIcon, accent: '#E91E63' },
    { key: 'completedTasks', label: 'Completed', icon: CheckCircleIcon, accent: '#4CAF50' },
] as const;

function KPICardGrid({ kpis, loading }: { kpis: Record<string, number>; loading: boolean }) {
    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(3,1fr)', md: 'repeat(5,1fr)' }, gap: 2 }}>
            {KPI_CONFIG.map(({ key, label, icon: Icon, accent }) => (
                <Paper key={key} elevation={2} sx={{
                    p: 2, borderRadius: '16px',
                    transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' },
                }}>
                    {loading ? (
                        <><Skeleton variant="circular" width={36} height={36} sx={{ mb: 1 }} /><Skeleton width="60%" height={28} /><Skeleton width="80%" height={16} /></>
                    ) : (
                        <>
                            <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: `${accent}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5 }}>
                                <Icon sx={{ fontSize: 18, color: accent }} />
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1A1A2E', lineHeight: 1.2 }}>{kpis[key] ?? 0}</Typography>
                            <Typography variant="caption" sx={{ color: '#9E9E9E', fontWeight: 500, fontSize: '0.72rem' }}>{label}</Typography>
                        </>
                    )}
                </Paper>
            ))}
        </Box>
    );
}

function ActiveSprintsList({ sprints, loading }: {
    sprints: Array<{ _id: string; name: string; goal?: string; totalTasks: number; doneTasks: number; totalPts: number; donePts: number }>;
    loading: boolean;
}) {
    if (loading) return <Skeleton variant="rounded" height={180} sx={{ borderRadius: '16px' }} />;
    return (
        <Paper elevation={2} sx={{ p: 2.5, borderRadius: '16px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <BoltIcon sx={{ fontSize: 18, color: '#7C4DFF' }} />
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#1A1A2E', fontSize: '0.88rem' }}>Active Sprints</Typography>
                <Chip label={sprints.length} size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700, bgcolor: '#EDE7F6', color: '#7C4DFF' }} />
            </Box>
            {sprints.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                    <BoltIcon sx={{ fontSize: 36, color: '#E0E0E0' }} />
                    <Typography variant="body2" sx={{ color: '#BDBDBD', mt: 0.5 }}>No active sprints</Typography>
                </Box>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {sprints.map(s => (
                        <Paper key={s._id} elevation={0} sx={{ p: 2, borderRadius: '12px', bgcolor: '#FAFAFA', transition: 'all 0.15s', '&:hover': { bgcolor: '#F3F0FF' } }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1A1A2E', fontSize: '0.84rem', mb: 0.3 }}>{s.name}</Typography>
                            {s.goal && (
                                <Typography variant="caption" sx={{
                                    color: '#757575', fontSize: '0.72rem', display: '-webkit-box',
                                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', mb: 1,
                                }}>{s.goal}</Typography>
                            )}
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                <Typography variant="caption" sx={{ color: '#424242', fontSize: '0.72rem' }}>
                                    <Box component="span" sx={{ fontWeight: 700, color: '#4CAF50' }}>{s.doneTasks}</Box>/{s.totalTasks} tasks done
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#424242', fontSize: '0.72rem' }}>
                                    <Box component="span" sx={{ fontWeight: 700, color: '#7C4DFF' }}>{s.donePts}</Box>/{s.totalPts} pts achieved
                                </Typography>
                            </Box>
                        </Paper>
                    ))}
                </Box>
            )}
        </Paper>
    );
}

function BoardsOverview({ boardStats, loading }: {
    boardStats: Array<{ _id: string; name: string; taskCount: number; doneCount: number; pct: number }>;
    loading: boolean;
}) {
    if (loading) return <Skeleton variant="rounded" height={180} sx={{ borderRadius: '16px' }} />;
    return (
        <Paper elevation={2} sx={{ p: 2.5, borderRadius: '16px' }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1A1A2E', mb: 2, fontSize: '0.88rem' }}>Boards Overview</Typography>
            {boardStats.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                    <ViewKanbanIcon sx={{ fontSize: 32, color: '#E0E0E0' }} />
                    <Typography variant="caption" sx={{ color: '#BDBDBD', display: 'block', mt: 0.5 }}>No boards yet</Typography>
                </Box>
            ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: `repeat(${Math.min(boardStats.length, 3)},1fr)` }, gap: 1.5 }}>
                    {boardStats.map(b => (
                        <Paper key={b._id} elevation={0} sx={{ p: 2, borderRadius: '12px', bgcolor: '#FAFAFA', transition: 'all 0.15s', '&:hover': { bgcolor: '#F3F0FF' } }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1A1A2E', mb: 0.5, fontSize: '0.82rem' }} noWrap>{b.name}</Typography>
                            <Typography variant="caption" sx={{ color: '#9E9E9E', fontSize: '0.7rem' }}>{b.taskCount} tasks · <Box component="span" sx={{ color: '#4CAF50', fontWeight: 600 }}>{b.pct}% done</Box></Typography>
                        </Paper>
                    ))}
                </Box>
            )}
        </Paper>
    );
}

function UpcomingDeadlines({ deadlines, loading }: {
    deadlines: Array<{ _id: string; title: string; priority: Priority; dueDate?: string; diffDays: number; boardName: string; assignee?: { _id: string; name: string } }>;
    loading: boolean;
}) {
    if (loading) return <Skeleton variant="rounded" height={180} sx={{ borderRadius: '16px' }} />;
    return (
        <Paper elevation={2} sx={{ p: 2.5, borderRadius: '16px' }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1A1A2E', mb: 2, fontSize: '0.88rem' }}>Upcoming Deadlines</Typography>
            {deadlines.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                    <CalendarTodayIcon sx={{ fontSize: 32, color: '#E0E0E0' }} />
                    <Typography variant="caption" sx={{ color: '#BDBDBD', display: 'block', mt: 0.5 }}>No upcoming deadlines</Typography>
                </Box>
            ) : (
                <Box sx={{
                    display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1,
                    '&::-webkit-scrollbar': { height: 4 },
                    '&::-webkit-scrollbar-thumb': { bgcolor: '#D0C8F0', borderRadius: 4 },
                }}>
                    {deadlines.map(t => {
                        const uc = t.diffDays < 0 ? '#F44336' : t.diffDays === 0 ? '#FF9800' : t.diffDays <= 2 ? '#FFC107' : '#9E9E9E';
                        const ul = t.diffDays < 0 ? 'Overdue' : t.diffDays === 0 ? 'Today' : t.diffDays === 1 ? 'Tomorrow' : `${t.diffDays}d`;
                        return (
                            <Paper key={t._id} elevation={0} sx={{
                                minWidth: 200, maxWidth: 220, p: 2, borderRadius: '12px', bgcolor: '#FAFAFA', flexShrink: 0,
                                transition: 'all 0.15s', '&:hover': { bgcolor: '#F3F0FF', transform: 'translateY(-2px)' },
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                    <Chip label={t.priority} size="small" sx={{
                                        height: 18, fontSize: '0.6rem', fontWeight: 700,
                                        bgcolor: PRIORITY_COLORS[t.priority]?.bg ?? '#F5F5F5',
                                        color: PRIORITY_COLORS[t.priority]?.color ?? '#9E9E9E',
                                        border: `1px solid ${PRIORITY_COLORS[t.priority]?.color}30`,
                                    }} />
                                    <Chip label={ul} size="small" sx={{
                                        height: 18, fontSize: '0.6rem', fontWeight: 700,
                                        bgcolor: `${uc}18`, color: uc, border: `1px solid ${uc}30`,
                                    }} />
                                </Box>
                                <Typography variant="body2" sx={{
                                    fontWeight: 600, color: '#1A1A2E', fontSize: '0.8rem', mb: 0.5,
                                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                }}>{t.title}</Typography>
                                {t.boardName && <Typography variant="caption" sx={{ color: '#9E9E9E', fontSize: '0.66rem' }}>{t.boardName}</Typography>}
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                                    <Typography variant="caption" sx={{ color: '#BDBDBD', fontSize: '0.64rem' }}>
                                        {t.dueDate ? new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                                    </Typography>
                                    {t.assignee ? (
                                        <Tooltip title={t.assignee.name}>
                                            <Avatar sx={{ width: 20, height: 20, fontSize: '0.5rem', fontWeight: 700, bgcolor: avatarColor(t.assignee.name) }}>
                                                {getInitials(t.assignee.name)}
                                            </Avatar>
                                        </Tooltip>
                                    ) : <Avatar sx={{ width: 20, height: 20, fontSize: '0.5rem', bgcolor: '#E0E0E0' }}>?</Avatar>}
                                </Box>
                            </Paper>
                        );
                    })}
                </Box>
            )}
        </Paper>
    );
}



export default function Dashboard() {
    const { user } = useAuth();
    const {
        loading, error, workspaceName, kpis,
        statusCounts, priorityCounts, activeSprintsList,
        boardStats, upcomingDeadlines, refresh,
    } = useDashboardData();

    const greeting = (() => {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 17) return 'Good afternoon';
        return 'Good evening';
    })();

    const statusItems = STATUS_ORDER.map(s => ({ label: s, count: statusCounts[s], color: STATUS_COLORS[s] }));
    const priorityItems = PRIORITY_ORDER.map(p => ({ label: p, count: priorityCounts[p], color: PRIORITY_COLORS[p].color, bg: PRIORITY_COLORS[p].bg }));

    return (
        <Box sx={{
            flex: 1, overflowY: 'auto', p: { xs: 2, sm: 3 }, bgcolor: '#F8F9FA',
            '&::-webkit-scrollbar': { width: 6 },
            '&::-webkit-scrollbar-thumb': { bgcolor: '#D0C8F0', borderRadius: 3 },
        }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#1A1A2E', letterSpacing: '-0.5px' }}>
                        {loading ? <Skeleton width={260} /> : `${greeting}, ${user?.name?.split(' ')[0] ?? 'there'}`}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        {loading ? <Skeleton width={180} /> : (
                            <>
                                <Typography variant="body2" sx={{ color: '#9E9E9E', fontSize: '0.82rem' }}>Workspace:</Typography>
                                <Chip label={workspaceName} size="small" sx={{ height: 22, fontSize: '0.72rem', fontWeight: 600, bgcolor: '#EDE7F6', color: '#7C4DFF', border: '1px solid #7C4DFF30' }} />
                            </>
                        )}
                    </Box>
                </Box>
                <Tooltip title="Refresh">
                    <IconButton onClick={refresh} size="small" sx={{ bgcolor: 'white', border: '1px solid #F0F0F0', '&:hover': { bgcolor: '#EDE7F6' } }}>
                        <RefreshIcon sx={{ fontSize: 18, color: '#7C4DFF' }} />
                    </IconButton>
                </Tooltip>
            </Box>

            {error && (
                <Box sx={{ mb: 2, p: 2, borderRadius: '10px', bgcolor: '#FFEBEE', border: '1px solid #FFCDD2' }}>
                    <Typography variant="body2" sx={{ color: '#D32F2F' }}>{error}</Typography>
                </Box>
            )}

            <Box sx={{ mb: 3 }}><KPICardGrid kpis={kpis} loading={loading} /></Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 3 }}>
                <DonutChart items={statusItems} total={kpis.totalTasks} title="Tasks by Status" loading={loading} />
                <DonutChart items={priorityItems} total={kpis.totalTasks} title="Tasks by Priority" loading={loading} />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 3 }}>
                <BoardsOverview boardStats={boardStats} loading={loading} />
                <ActiveSprintsList sprints={activeSprintsList} loading={loading} />
            </Box>

            <Box sx={{ mb: 3 }}>
                <UpcomingDeadlines deadlines={upcomingDeadlines} loading={loading} />
            </Box>


        </Box>
    );
}
