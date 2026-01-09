import api from './api';
import { Queue } from '@/types/queue';

const list = async (): Promise<Queue[]> => {
    const { data } = await api.get('/queues');
    return data;
};

const create = async (data: Partial<Queue>): Promise<Queue> => {
    const { data: result } = await api.post('/queues', data);
    return result;
};

const update = async (id: number, data: Partial<Queue>): Promise<Queue> => {
    const { data: result } = await api.put(`/queues/${id}`, data);
    return result;
};

const remove = async (id: number): Promise<void> => {
    await api.delete(`/queues/${id}`);
};

const queueService = {
    list,
    create,
    update,
    remove,
};

export default queueService;
