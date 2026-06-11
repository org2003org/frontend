import { useCallback, useEffect, useState } from 'react';

import type {
    SprintDoc,
    TaskDoc,
    UserDoc,
} from '../types/backlog.types';

import { getApiError } from '../utils/backlog.utils';

import {
    getAllUsers,
    getBoardsForWorkspace,
    getSprintsByBoard,
    getTasksByBoard,
    getWorkspaceMembers,
    getWorkspaces,
} from '../api/backlog.api';

export function useBacklogData(projectId?: string) {
    const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
    const [sprints, setSprints] = useState<SprintDoc[]>([]);
    const [tasks, setTasks] = useState<TaskDoc[]>([]);
    const [teamMembers, setTeamMembers] = useState<UserDoc[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadBacklog = useCallback(async () => {
        if (!projectId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const workspaces = await getWorkspaces();

            const workspace =
                workspaces.find((item) =>
                    item.name === projectId ||
                    item.name.toLowerCase().replace(/\s+/g, '-') === projectId.toLowerCase()
                ) ?? workspaces[0];

            if (!workspace) {
                setSelectedBoardId(null);
                setTasks([]);
                setSprints([]);
                setTeamMembers([]);
                return;
            }

            const boards = await getBoardsForWorkspace(workspace._id);
            const firstBoard = boards[0];

            setSelectedBoardId(firstBoard?._id ?? null);

            if (!firstBoard) {
                setTasks([]);
                setSprints([]);
                setTeamMembers([]);
                return;
            }

            const [loadedSprints, loadedTasks] = await Promise.all([
                getSprintsByBoard(firstBoard._id),
                getTasksByBoard(firstBoard._id),
            ]);

            setSprints(loadedSprints);
            setTasks(loadedTasks);

            try {
                const members = await getWorkspaceMembers(workspace._id);
                setTeamMembers(members);
            } catch {
                const users = await getAllUsers();
                setTeamMembers(users);
            }
        } catch (err: any) {
            setError(getApiError(err, 'Failed to load backlog'));
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        loadBacklog();
    }, [loadBacklog]);

    return {
        selectedBoardId,
        sprints,
        tasks,
        setTasks,
        teamMembers,
        loading,
        error,
        setError,
        reloadBacklog: loadBacklog,
    };
}