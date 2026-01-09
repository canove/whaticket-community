import api from './api';
import { User } from '@/types/auth';

interface UserListParams {
    pageNumber?: string;
    searchParam?: string;
}

interface UserData {
    name: string;
    email: string;
    password?: string;
    profile: string;
    queueIds?: number[];
}

const list = async (params: UserListParams = {}): Promise<{ users: User[]; count: number; hasMore: boolean }> => {
    const { data } = await api.get('/users', {
        params,
    });
    return data;
};

const create = async (data: UserData): Promise<User> => {
    const { data: result } = await api.post('/users', data);
    return result;
};

const update = async (id: number, data: Partial<UserData>): Promise<User> => {
    const { data: result } = await api.put(`/users/${id}`, data);
    return result;
};

const remove = async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
};

const show = async (id: number): Promise<User> => {
    const { data } = await api.get(`/users/${id}`);
    return data;
};

const userService = {
    list,
    create,
    update,
    remove,
    show
};

export default userService;
