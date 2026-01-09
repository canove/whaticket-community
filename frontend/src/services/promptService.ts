import api from './api';
import { Prompt } from '@/types/prompt';

const list = async (): Promise<Prompt[]> => {
    const { data } = await api.get<Prompt[]>('/prompts');
    return data;
};

const show = async (id: number): Promise<Prompt> => {
    const { data } = await api.get<Prompt>(`/prompts/${id}`);
    return data;
};

const create = async (data: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt' | 'promptTokens' | 'completionTokens' | 'totalTokens'>): Promise<Prompt> => {
    const { data: result } = await api.post<Prompt>('/prompts', data);
    return result;
};

const update = async (id: number, data: Partial<Prompt>): Promise<Prompt> => {
    const { data: result } = await api.put<Prompt>(`/prompts/${id}`, data);
    return result;
};

const remove = async (id: number): Promise<void> => {
    await api.delete(`/prompts/${id}`);
};

const promptService = {
    list,
    show,
    create,
    update,
    remove,
};

export default promptService;
