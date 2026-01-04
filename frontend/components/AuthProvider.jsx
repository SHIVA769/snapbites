'use client';
import { useEffect } from 'react';
import useAuthStore from '@/lib/store';

export default function AuthProvider({ children }) {
    const checkAuth = useAuthStore((state) => state.checkAuth);

    useEffect(() => {
        checkAuth();
    }, []);

    return <>{children}</>;
}
