export interface User {
    id: number;
    name: string;
    email: string;
    profile: 'admin' | 'user' | 'supervisor';
    tokenVersion?: number;
}

export interface AuthResponse {
    token: string;
    refreshToken: string;
    user: User;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}
