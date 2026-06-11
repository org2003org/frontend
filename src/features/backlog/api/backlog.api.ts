import api from '../../../api/api';

import type {
    BoardDoc,
    CommentDoc,
    SprintDoc,
    TaskDoc,
    UserDoc,
    WorkspaceDoc,
} from '../types/backlog.types';

import { unwrap, uniqueById } from '../utils/backlog.utils';

export async function getWorkspaces() {
    const { data } = await api.get('/workspaces');
    return unwrap<WorkspaceDoc[]>(data, []);
}

export async function getBoardsForWorkspace(workspaceId: string) {
    const { data } = await api.get(`/boards/workspace/${workspaceId}`);
    const allBoards = uniqueById(unwrap<BoardDoc[]>(data, []));

    return allBoards.filter((board) => {
        const boardWorkspaceId =
            typeof board.workspaceId === 'string'
                ? board.workspaceId
                : board.workspaceId?._id;

        return boardWorkspaceId === workspaceId;
    });
}

export async function getSprintsByBoard(boardId: string) {
    const { data } = await api.get(`/sprints/board/${boardId}`);
    return uniqueById(unwrap<SprintDoc[]>(data, []));
}

export async function getTasksByBoard(boardId: string) {
    const { data } = await api.get(`/tasks/board/${boardId}`);
    return uniqueById(unwrap<TaskDoc[]>(data, []));
}

export async function getWorkspaceMembers(workspaceId: string) {
    const { data } = await api.get(`/workspaces/${workspaceId}/members`);
    const membersData = unwrap<any>(data, {});

    const raw: UserDoc[] = Array.isArray(membersData)
        ? membersData
        : [membersData.owner, ...(membersData.members ?? [])].filter(Boolean);

    // Deduplicate by _id (owner is often included in the members array too)
    const seen = new Set<string>();
    return raw.filter(m => m?._id && !seen.has(m._id) && seen.add(m._id) as unknown as boolean);
}

export async function getAllUsers() {
    const { data } = await api.get('/users');
    return unwrap<UserDoc[]>(data, []);
}

export async function getTaskComments(taskId: string) {
    const { data } = await api.get(`/comments/tasks/${taskId}`);
    return unwrap<CommentDoc[]>(data, []);
}

export async function createTaskComment(taskId: string, text: string) {
    const { data } = await api.post(`/comments/tasks/${taskId}`, { text });
    return unwrap<CommentDoc>(data, data);
}

export async function updateTask(taskId: string, patch: Partial<TaskDoc>) {
    try {
        const { data } = await api.put(`/tasks/${taskId}`, patch);
        return unwrap<TaskDoc>(data, data);
    } catch {
        const { data } = await api.patch(`/tasks/${taskId}`, patch);
        return unwrap<TaskDoc>(data, data);
    }
}