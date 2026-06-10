import api from './api';

export interface Sprint {
  _id?: string;
  id?: string;
  name: string;
  goal?: string;
  startDate: string | Date;
  endDate: string | Date;
  status: "Planned" | "Active" | "Completed" | "active" | "planned" | "completed";
  boardId: string;
}

export const sprintApi = {
  getSprintsByBoard: async (boardId: string) => {
    const response = await api.get(`/sprints/board/${boardId}`);
    return response.data as Sprint[];
  },
  createSprint: async (data: Partial<Sprint>) => {
    const response = await api.post('/sprints', data);
    return response.data.sprint as Sprint;
  },
  updateSprint: async (id: string, data: Partial<Sprint>) => {
    const response = await api.put(`/sprints/${id}`, data);
    return response.data.sprint as Sprint;
  },
  startSprint: async (id: string) => {
    const response = await api.patch(`/sprints/${id}/start`);
    return response.data.sprint as Sprint;
  },
  completeSprint: async (id: string) => {
    const response = await api.patch(`/sprints/${id}/complete`);
    return response.data.sprint as Sprint;
  }
};
