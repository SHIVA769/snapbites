import { create } from 'zustand';
import api from './api';

const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    login: async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        set({ user: data, isAuthenticated: true });
    },
    signup: async (userData) => {
        const { data } = await api.post('/auth/signup', userData);
        set({ user: data, isAuthenticated: true });
    },
    logout: async () => {
        await api.post('/auth/logout');
        set({ user: null, isAuthenticated: false });
    },
    checkAuth: async () => {
        try {
            const { data } = await api.get('/auth/me');
            set({ user: data, isAuthenticated: true });
        } catch (error) {
            set({ user: null, isAuthenticated: false });
        }
    }
}));

export default useAuthStore;
