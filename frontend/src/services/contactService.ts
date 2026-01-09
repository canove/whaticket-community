import api from './api';
import { Contact, ContactListResponse, ContactParams } from '@/types/contact';

const list = async (params: ContactParams = {}): Promise<ContactListResponse> => {
    const { data } = await api.get<ContactListResponse>('/contacts', {
        params,
    });
    return data;
};

const show = async (id: number): Promise<Contact> => {
    const { data } = await api.get<Contact>(`/contacts/${id}`);
    return data;
};

const create = async (data: Partial<Contact>): Promise<Contact> => {
    const { data: result } = await api.post<Contact>('/contacts', data);
    return result;
};

const update = async (id: number, data: Partial<Contact>): Promise<Contact> => {
    const { data: result } = await api.put<Contact>(`/contacts/${id}`, data);
    return result;
};

const remove = async (id: number): Promise<void> => {
    await api.delete(`/contacts/${id}`);
};

const contactService = {
    list,
    show,
    create,
    update,
    remove,
};

export default contactService;
