import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Grid, Card, LinearProgress,
  Avatar, Chip, IconButton, Divider, Stack
} from '@mui/material';
import {
  Bolt as ZapIcon,
  CalendarToday as CalendarIcon,
  TrackChanges as TargetIcon,
  TrendingUp as TrendingUpIcon,
  People as UsersIcon,
  Add as PlusIcon,
  MoreHoriz as MoreHorizontalIcon
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { sprintApi } from '../api/sprintApi';
import api from '../api/api';

// Status colors and labels
const statusColors: Record<string, { bg: string, text: string }> = {
  Backlog: { bg: '#f3f4f6', text: '#4b5563' },
  'To Do': { bg: '#e0e7ff', text: '#4338ca' },
  "In Progress": { bg: '#fef3c7', text: '#b45309' },
  Review: { bg: '#f3e8ff', text: '#7e22ce' },
  Done: { bg: '#d1fae5', text: '#047857' },
};

const statusLabels: Record<string, string> = {
  Backlog: "Backlog",
  'To Do': "To Do",
  "In Progress": "In Progress",
  Review: "Review",
  Done: "Done",
};

const priorityDot: Record<string, string> = {
  High: "#f59e0b",   // amber-500
  Medium: "#3b82f6", // blue-500
  Low: "#9ca3af",    // gray-400
};

// Types
export interface UserDoc {
  _id: string;
  name: string;
  email: string;
}

export interface TaskDoc {
  _id: string;
  title: string;
  status: string;
  priority: string;
  assignee?: UserDoc;
  sprintId?: { _id: string; name: string } | string;
  storyPoints?: number;
}

// Helpers
function initials(name: string): string {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function avatarColor(name: string): string {
  if (!name) return '#E0E0E0';
  const palette = ['#7C4DFF', '#E91E63', '#009688', '#FF5722', '#3F51B5', '#0288D1', '#F57C00'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return palette[Math.abs(h) % palette.length];
}

const SprintCard = ({ sprint, allTasks, isActive }: { sprint: Sprint, allTasks: TaskDoc[], isActive: boolean }) => {
  // Filter tasks belonging to this sprint
  const sprintTasks = allTasks.filter(t => t.sprintId && (typeof t.sprintId === 'object' ? t.sprintId._id === sprint._id : t.sprintId === sprint._id));
  
  const completedPts = sprintTasks.filter(t => t.status === "Done").reduce((s, t) => s + (t.storyPoints || 0), 0);
  const totalPts = sprintTasks.reduce((s, t) => s + (t.storyPoints || 0), 0);
  const pct = totalPts > 0 ? Math.round((completedPts / totalPts) * 100) : 0;

  const daysLeft = isActive
    ? Math.max(0, Math.ceil((new Date(sprint.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const getSprintStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'success';
      case 'planned': return 'info';
      default: return 'default';
    }
  };

  return (
    <Card variant="outlined" sx={{ mb: 2, borderRadius: 2, borderColor: isActive ? 'primary.light' : 'grey.200', boxShadow: isActive ? 3 : 1 }}>
      <Box sx={{ px: 3, py: 2, bgcolor: isActive ? '#f0f4ff' : 'grey.50' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <ZapIcon fontSize="small" color={isActive ? "primary" : "disabled"} />
              <Typography variant="h6" color={isActive ? "primary.dark" : "text.primary"}>{sprint.name}</Typography>
              <Chip label={sprint.status} size="small" color={getSprintStatusColor(sprint.status) as "success" | "info" | "default"} sx={{ fontWeight: 500, height: 20 }} />
            </Box>
            <Typography variant="body2" color="text.secondary">{sprint.goal}</Typography>
          </Box>
          <IconButton size="small"><MoreHorizontalIcon fontSize="small" /></IconButton>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CalendarIcon fontSize="small" color="action" sx={{ fontSize: 16 }} />
            <Typography variant="caption" color="text.secondary">
              {new Date(sprint.startDate).toLocaleDateString()} &rarr; {new Date(sprint.endDate).toLocaleDateString()}
            </Typography>
          </Box>
          {isActive && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TargetIcon fontSize="small" color="primary" sx={{ fontSize: 16 }} />
              <Typography variant="caption" color="primary.main" fontWeight={500}>{daysLeft} days left</Typography>
            </Box>
          )}
        </Box>
      </Box>

      <Divider />

      <Box sx={{ px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">Sprint Progress</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">{completedPts} / {totalPts} pts</Typography>
            <Typography variant="body2" fontWeight={600}>{pct}%</Typography>
          </Box>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={pct} 
          sx={{ 
            height: 8, 
            borderRadius: 4,
            bgcolor: 'grey.100',
            '& .MuiLinearProgress-bar': {
              bgcolor: isActive ? 'primary.main' : pct === 100 ? 'success.main' : 'grey.400'
            }
          }} 
        />
        
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          {[
            { label: "To Do", count: sprintTasks.filter(t => t.status === "To Do").length, color: "#818cf8" },
            { label: "In Progress", count: sprintTasks.filter(t => t.status === "In Progress").length, color: "#fbbf24" },
            { label: "Review", count: sprintTasks.filter(t => t.status === "Review").length, color: "#c084fc" },
            { label: "Done", count: sprintTasks.filter(t => t.status === "Done").length, color: "#34d399" },
          ].map(s => s.count > 0 && (
            <Box key={s.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: s.color }} />
              <Typography variant="caption" color="text.secondary">{s.count} {s.label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Divider />

      <Stack divider={<Divider />} sx={{ bgcolor: 'white' }}>
        {sprintTasks.map(task => {
           const statusConfig = statusColors[task.status] || { bg: '#f3f4f6', text: '#4b5563' };
           const priorityColor = priorityDot[task.priority] || "#9ca3af";
           
           return (
            <Box key={task._id} sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 3, py: 1.5, '&:hover': { bgcolor: 'grey.50', cursor: 'pointer' } }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: priorityColor }} />
              <Chip 
                label={statusLabels[task.status] || task.status} 
                size="small" 
                sx={{ 
                  bgcolor: statusConfig.bg, 
                  color: statusConfig.text,
                  fontWeight: 500,
                  height: 20,
                  fontSize: '0.7rem'
                }} 
              />
              <Typography variant="body2" sx={{ flex: 1, '&:hover': { color: 'primary.main' } }}>{task.title}</Typography>
              <Chip label={`${task.storyPoints || 0}pt`} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem', bgcolor: 'grey.50' }} />
              <Avatar sx={{ width: 24, height: 24, fontSize: '0.6rem', bgcolor: avatarColor(task.assignee?.name) }}>
                {initials(task.assignee?.name)}
              </Avatar>
            </Box>
          );
        })}
        {sprint.status.toLowerCase() !== 'completed' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 3, py: 1.5, '&:hover': { bgcolor: 'grey.50', cursor: 'pointer' } }}>
            <PlusIcon fontSize="small" color="disabled" />
            <Typography variant="body2" color="text.disabled">Add task</Typography>
          </Box>
        )}
      </Stack>
    </Card>
  );
};

export default function Sprints() {
  const { projectId } = useParams<{ projectId: string }>();
  const [boardId, setBoardId] = useState<string | null>(null);

  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [tasks, setTasks] = useState<TaskDoc[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Resolve workspace and board
  useEffect(() => {
    if (!projectId) return;
    const fetchInit = async () => {
      try {
        const { data } = await api.get('/workspaces');
        const list = data.data ?? data;
        const ws = list.find((w: { _id: string, name: string }) =>
          w.name === projectId ||
          w.name.toLowerCase().replace(/\s+/g, '-') === projectId.toLowerCase()
        );
        const wsId = ws ? ws._id : list[0]?._id;
        
        if (wsId) {
          const boardRes = await api.get(`/boards/workspace/${wsId}`);
          const boards = boardRes.data.data ?? boardRes.data;
          if (boards.length > 0) {
            setBoardId(boards[0]._id);
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } catch (e) {
        console.error("Failed to load workspace/board info", e);
        setLoading(false);
      }
    };
    fetchInit();
  }, [projectId]);

  // 2. Fetch Sprints and Tasks for the board
  useEffect(() => {
    if (!boardId) return;
    const fetchSprintsAndTasks = async () => {
      try {
        setLoading(true);
        // Try fetching from backend
        const fetchedSprints = await sprintApi.getSprintsByBoard(boardId);
        setSprints(fetchedSprints || []);

        const taskRes = await api.get(`/tasks/board/${boardId}`);
        const fetchedTasks = Array.isArray(taskRes.data) ? taskRes.data : taskRes.data.data ?? [];
        setTasks(fetchedTasks || []);
      } catch (error) {
        console.error("Failed to fetch sprints or tasks:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSprintsAndTasks();
  }, [boardId]);

  // Extract unique users from tasks to calculate team capacity
  const usersMap = new Map();
  tasks.forEach(t => {
    if (t.assignee && t.assignee._id) {
      usersMap.set(t.assignee._id, t.assignee);
    }
  });
  const users = Array.from(usersMap.values());

  const activeSprint = sprints.find(s => s.status.toLowerCase() === "active") || sprints[0];

  const teamCapacity = users.map(u => {
    if (!activeSprint) return { ...u, sprintTasks: 0, sprintPoints: 0 };
    const sprintTasks = tasks.filter(t => t.sprintId && (typeof t.sprintId === 'object' ? t.sprintId._id === activeSprint._id : t.sprintId === activeSprint._id) && t.assignee?._id === u._id);
    return {
      ...u,
      sprintTasks: sprintTasks.length,
      sprintPoints: sprintTasks.reduce((s, t) => s + (t.storyPoints || 0), 0),
    };
  });

  const activeSprintVelocity = activeSprint ? tasks.filter(t => t.sprintId && (typeof t.sprintId === 'object' ? t.sprintId._id === activeSprint._id : t.sprintId === activeSprint._id)).reduce((s, t) => s + (t.storyPoints || 0), 0) : 0;
  const activeSprintDoneTasks = activeSprint ? tasks.filter(t => t.sprintId && (typeof t.sprintId === 'object' ? t.sprintId._id === activeSprint._id : t.sprintId === activeSprint._id) && t.status === "Done").length : 0;
  const totalTasksCount = activeSprint ? tasks.filter(t => t.sprintId && (typeof t.sprintId === 'object' ? t.sprintId._id === activeSprint._id : t.sprintId === activeSprint._id)).length : 0;

  return (
    <Box sx={{ flex: 1, overflowY: 'auto', bgcolor: '#f9fafb', p: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h5" fontWeight={600} color="text.primary">Sprint Planning</Typography>
          <Typography variant="body2" color="text.secondary">Manage and track your team's sprints</Typography>
        </Box>
        <Button variant="contained" startIcon={<PlusIcon />} sx={{ textTransform: 'none', borderRadius: 2 }}>
          New Sprint
        </Button>
      </Box>

      {loading ? (
         <LinearProgress />
      ) : (
        <>
          {/* Stats Row */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[
              { label: "Sprint Velocity", value: `${activeSprintVelocity} pts`, icon: TrendingUpIcon, color: "primary.main", bg: "primary.light" },
              { label: "Team Capacity", value: `${teamCapacity.reduce((s, u) => s + u.sprintPoints, 0)} pts`, icon: UsersIcon, color: "secondary.main", bg: "secondary.light" },
              { label: "Days Remaining", value: activeSprint ? Math.max(0, Math.ceil((new Date(activeSprint.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0, icon: CalendarIcon, color: "warning.main", bg: "warning.light" },
              { label: "Tasks Complete", value: `${activeSprintDoneTasks}/${totalTasksCount}`, icon: TargetIcon, color: "success.main", bg: "success.light" },
            ].map((stat) => (
              <Grid item xs={12} sm={6} md={3} key={stat.label}>
                <Card variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, opacity: 0.8 }}>
                    <stat.icon sx={{ color: stat.color }} />
                  </Box>
                  <Typography variant="h5" fontWeight={700}>{stat.value}</Typography>
                  <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Team Capacity */}
          {activeSprint && teamCapacity.length > 0 && (
            <Card variant="outlined" sx={{ borderRadius: 2, p: 3, mb: 4 }}>
              <Typography variant="h6" fontWeight={600} mb={3}>Team Capacity &mdash; {activeSprint.name}</Typography>
              <Grid container spacing={2}>
                {teamCapacity.map((member) => {
                  const capacityPct = Math.min(100, Math.round((member.sprintPoints / 15) * 100)); // Assuming 15 pts is max capacity for now
                  const isOverloaded = member.sprintPoints > 15;
                  return (
                    <Grid item xs={6} sm={4} md={2} key={member._id}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2, borderRadius: 2, bgcolor: 'grey.50', '&:hover': { bgcolor: '#f0f4ff' } }}>
                        <Avatar sx={{ width: 36, height: 36, mb: 1, bgcolor: avatarColor(member.name), fontSize: '0.8rem' }}>{initials(member.name)}</Avatar>
                        <Typography variant="caption" fontWeight={600}>{member.name.split(" ")[0]}</Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={capacityPct} 
                          sx={{ 
                            width: '100%', 
                            height: 6, 
                            borderRadius: 3, 
                            my: 1,
                            bgcolor: 'grey.200',
                            '& .MuiLinearProgress-bar': { bgcolor: isOverloaded ? 'error.main' : 'primary.main' }
                          }} 
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                          {member.sprintPoints}pts &middot; {member.sprintTasks} tasks
                        </Typography>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Card>
          )}

          {/* Sprint Cards */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {sprints.length === 0 ? (
              <Card variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2, bgcolor: 'grey.50' }}>
                <Typography color="text.secondary">No sprints found for this board.</Typography>
              </Card>
            ) : (
              sprints.map((sprint) => (
                <SprintCard key={sprint._id} sprint={sprint} allTasks={tasks} isActive={sprint.status.toLowerCase() === "active"} />
              ))
            )}
          </Box>
        </>
      )}
    </Box>
  );
}
