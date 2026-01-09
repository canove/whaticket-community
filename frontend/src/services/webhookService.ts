import api from './api';
import { Webhook } from '@/types/webhook';

const list = async (): Promise<Webhook[]> => {
    const { data } = await api.get<Webhook[]>('/webhooks');
    return data;
};

const show = async (id: number): Promise<Webhook> => {
    const { data } = await api.get<Webhook>(`/webhooks/${id}`);
    return data;
};

const create = async (data: Omit<Webhook, 'id' | 'createdAt' | 'updatedAt'>): Promise<Webhook> => {
    const { data: result } = await api.post<Webhook>('/webhooks', data);
    return result;
};

const update = async (id: number, data: Partial<Webhook>): Promise<Webhook> => {
    const { data: result } = await api.put<Webhook>(`/webhooks/${id}`, data);
    return result;
};

const remove = async (id: number): Promise<void> => {
    await api.delete(`/webhooks/${id}`);
};

const webhookService = {
    list,
    show,
    create,
    update,
    remove,
};

export default webhookService;
