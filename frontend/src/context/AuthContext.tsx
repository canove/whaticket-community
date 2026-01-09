import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/auth';
import api from '@/services/api';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, refreshToken: string, user: User) => void;
    logout: () => void;
    updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: true,

            login: (token, refreshToken, user) => {
                localStorage.setItem('token', token);
                localStorage.setItem('refreshToken', refreshToken);
                api.defaults.headers.common.Authorization = `Bearer ${token}`;
                set({ user, token, isAuthenticated: true, isLoading: false });
            },

            logout: () => {
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                delete api.defaults.headers.common.Authorization;
                set({ user: null, token: null, isAuthenticated: false, isLoading: false });
            },

            updateUser: (userData) => {
                set((state) => ({
                    user: state.user ? { ...state.user, ...userData } : null,
                }));
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
        }
    )
);
