'use client';
import { useEffect } from 'react';
import useAuthStore from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Shield, Users, AlertTriangle } from 'lucide-react';

export default function AdminDashboard() {
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated && user?.role !== 'admin') {
            router.push('/feed');
        }
    }, [isAuthenticated, user, router]);

    if (!isAuthenticated || user?.role !== 'admin') return null;

    return (
        <div className="min-h-screen bg-black text-white p-4 pb-20">
            <header className="mb-8">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-purple-500 bg-clip-text text-transparent flex items-center gap-2">
                    <Shield size={24} className="text-red-500" /> Admin Panel
                </h1>
                <p className="text-zinc-500">System Overview</p>
            </header>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
                    <div className="bg-purple-500/20 w-10 h-10 rounded-full flex items-center justify-center text-purple-500 mb-2">
                        <Users size={20} />
                    </div>
                    <p className="text-2xl font-bold">--</p>
                    <p className="text-xs text-zinc-500">Total Users</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
                    <div className="bg-red-500/20 w-10 h-10 rounded-full flex items-center justify-center text-red-500 mb-2">
                        <AlertTriangle size={20} />
                    </div>
                    <p className="text-2xl font-bold">--</p>
                    <p className="text-xs text-zinc-500">Reports</p>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="font-bold text-lg">Management</h2>
                <button className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between hover:bg-zinc-800 transition">
                    <span className="font-semibold">Manage Users</span>
                    <span className="text-zinc-500">→</span>
                </button>
                <button className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between hover:bg-zinc-800 transition">
                    <span className="font-semibold">Content Moderation</span>
                    <span className="text-zinc-500">→</span>
                </button>
            </div>
        </div>
    );
}
