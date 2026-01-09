import api from './api';
import { Ticket, TicketListParams } from '@/types/ticket';

const list = async (params: TicketListParams = {}): Promise<{ tickets: Ticket[]; count: number; hasMore: boolean }> => {
    const { data } = await api.get('/tickets', {
        params,
    });
    return data;
};

const show = async (id: number): Promise<Ticket> => {
    const { data } = await api.get<Ticket>(`/tickets/${id}`);
    return data;
};

const create = async (data: { contactId: number; whatsappId: number; queueId?: number; userId?: number; status?: string }): Promise<Ticket> => {
    const { data: result } = await api.post<Ticket>('/tickets', data);
    return result;
};

const update = async (id: number, data: Partial<Ticket>): Promise<Ticket> => {
    const { data: result } = await api.put<Ticket>(`/tickets/${id}`, data);
    return result;
};

const transfer = async (id: number, queueId: number, userId?: number): Promise<Ticket> => {
    const { data: result } = await api.post<Ticket>(`/tickets/${id}/transfer`, { queueId, userId });
    return result;
};

const close = async (id: number): Promise<Ticket> => {
    const { data: result } = await api.post<Ticket>(`/tickets/${id}/close`);
    return result;
};

const reopen = async (id: number): Promise<Ticket> => {
    const { data: result } = await api.post<Ticket>(`/tickets/${id}/reopen`);
    return result;
};

const markAsRead = async (id: number): Promise<void> => {
    await api.post(`/tickets/${id}/read`);
};

const remove = async (id: number): Promise<void> => {
    await api.delete(`/tickets/${id}`);
};

const ticketService = {
    list,
    show,
    create,
    update,
    transfer,
    close,
    reopen,
    markAsRead,
    remove
};

export default ticketService;
