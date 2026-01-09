import api from './api';
import { Tag, TagTicket, TagContact } from '@/types/tag';

const list = async (): Promise<Tag[]> => {
    const { data } = await api.get('/tags');
    return data;
};

const get = async (id: number): Promise<Tag> => {
    const { data } = await api.get(`/tags/${id}`);
    return data;
};

const create = async (data: Partial<Tag>): Promise<Tag> => {
    const { data: result } = await api.post('/tags', data);
    return result;
};

const update = async (id: number, data: Partial<Tag>): Promise<Tag> => {
    const { data: result } = await api.put(`/tags/${id}`, data);
    return result;
};

const remove = async (id: number): Promise<void> => {
    await api.delete(`/tags/${id}`);
};

// Ticket relations
const attachToTicket = async (tagId: number, ticketId: number): Promise<TagTicket> => {
    const { data } = await api.post(`/tags/${tagId}/tickets/${ticketId}`);
    return data;
};

const detachFromTicket = async (tagId: number, ticketId: number): Promise<void> => {
    await api.delete(`/tags/${tagId}/tickets/${ticketId}`);
};

const getTicketTags = async (ticketId: number): Promise<TagTicket[]> => {
    const { data } = await api.get(`/tags/tickets/${ticketId}`);
    return data;
};

// Contact relations
const attachToContact = async (tagId: number, contactId: number): Promise<TagContact> => {
    const { data } = await api.post(`/tags/${tagId}/contacts/${contactId}`);
    return data;
};

const detachFromContact = async (tagId: number, contactId: number): Promise<void> => {
    await api.delete(`/tags/${tagId}/contacts/${contactId}`);
};

const getContactTags = async (contactId: number): Promise<TagContact[]> => {
    const { data } = await api.get(`/tags/contacts/${contactId}`);
    return data;
};

const tagService = {
    list,
    get,
    create,
    update,
    remove,
    attachToTicket,
    detachFromTicket,
    getTicketTags,
    attachToContact,
    detachFromContact,
    getContactTags,
};

export default tagService;
