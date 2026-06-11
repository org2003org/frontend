import { useMemo } from 'react';

import type {
    SprintDoc,
    SprintGroup,
    SprintStatus,
    TaskDoc,
    TaskStatus,
} from '../types/backlog.types';

import {
    getAssigneeName,
    getSprintId,
} from '../utils/backlog.utils';

export function useBacklogFilters({
    tasks,
    sprints,
    search,
    statusFilter,
}: {
    tasks: TaskDoc[];
    sprints: SprintDoc[];
    search: string;
    statusFilter: 'All' | TaskStatus;
}) {
    const issueNumbers = useMemo(() => {
        return tasks.reduce<Record<string, string>>((acc, task, index) => {
            acc[task._id] = `ZAB-${index + 1}`;
            return acc;
        }, {});
    }, [tasks]);

    const filteredTasks = useMemo(() => {
        const query = search.trim().toLowerCase();

        return tasks.filter((task) => {
            const statusMatches =
                statusFilter === 'All' || (task.status ?? 'Backlog') === statusFilter;

            const searchMatches =
                !query ||
                task.title.toLowerCase().includes(query) ||
                issueNumbers[task._id]?.toLowerCase().includes(query) ||
                (task.labels ?? []).some((label) =>
                    label.toLowerCase().includes(query)
                ) ||
                getAssigneeName(task).toLowerCase().includes(query);

            return statusMatches && searchMatches;
        });
    }, [tasks, search, statusFilter, issueNumbers]);

    const groups = useMemo(() => {
        const sprintStatusOrder: Record<SprintStatus, number> = {
            Active: 0,
            Planned: 1,
            Completed: 2,
        };

        const sortedSprints = [...sprints].sort(
            (a, b) => sprintStatusOrder[a.status] - sprintStatusOrder[b.status]
        );

        const sprintGroups: SprintGroup[] = sortedSprints.map((sprint) => ({
            id: sprint._id,
            title: sprint.name,
            statusLabel: sprint.status,
            sprint,
            tasks: filteredTasks.filter(
                (task) => getSprintId(task) === sprint._id
            ),
        }));

        const noSprintTasks = filteredTasks.filter((task) => !getSprintId(task));

        return [
            ...sprintGroups,
            {
                id: 'no-sprint',
                title: 'No Sprint',
                statusLabel: '',
                tasks: noSprintTasks,
            },
        ];
    }, [sprints, filteredTasks]);

    return {
        issueNumbers,
        filteredTasks,
        groups,
    };
}