import api from './api';
import { WhatsApp } from '@/types/whatsapp';

const list = async (): Promise<WhatsApp[]> => {
    const { data } = await api.get<WhatsApp[]>('/whatsapp');
    return data;
};

const show = async (id: number): Promise<WhatsApp> => {
    const { data } = await api.get<WhatsApp>(`/whatsapp/${id}`);
    return data;
};

const create = async (data: { name: string; isDefault?: boolean }): Promise<WhatsApp> => {
    const { data: result } = await api.post<WhatsApp>('/whatsapp', data);
    return result;
};

const update = async (id: number, data: { name?: string; isDefault?: boolean }): Promise<WhatsApp> => {
    const { data: result } = await api.put<WhatsApp>(`/whatsapp/${id}`, data);
    return result;
};

const remove = async (id: number): Promise<void> => {
    await api.delete(`/whatsapp/${id}`);
};

const startSession = async (id: number): Promise<void> => {
    await api.post(`/whatsapp/${id}/session`);
};

const disconnect = async (id: number): Promise<void> => {
    await api.delete(`/whatsapp/${id}/session`);
};

const restart = async (id: number): Promise<void> => {
    await api.post(`/whatsapp/${id}/restart`);
};

const getStatus = async (id: number): Promise<{ connected: boolean; status: string }> => {
    const { data } = await api.get(`/whatsapp/${id}/status`);
    return data;
};



const whatsappService = {
    list,
    show,
    create,
    update,
    remove,
    startSession,
    disconnect,
    restart,
    getStatus,
};

export default whatsappService;
