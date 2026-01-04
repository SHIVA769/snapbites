'use client';
import { useEffect, useState } from 'react';
import useAuthStore from '@/lib/store';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { BarChart, Users, DollarSign, ListOrdered, Zap, PlusCircle, Store } from 'lucide-react';

export default function OwnerDashboard() {
    const { user, isAuthenticated } = useAuthStore();
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated && user?.role !== 'owner') {
            router.push('/feed');
            return;
        }

        const fetchRestaurant = async () => {
            try {
                const { data } = await api.get('/restaurants');
                const userRestaurant = data.find(r => r.owner === user?._id);
                setRestaurant(userRestaurant);
            } catch (err) {
                console.error('Failed to fetch restaurant', err);
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) fetchRestaurant();
    }, [isAuthenticated, user, router]);

    if (!isAuthenticated || user?.role !== 'owner') return null;

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-4 pb-20">
            <header className="mb-8">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                    Owner Dashboard
                </h1>
                <p className="text-zinc-500">Welcome back, {user?.name}</p>
            </header>

            {!restaurant ? (
                <div className="bg-zinc-900 border border-orange-500/20 rounded-2xl p-8 text-center shadow-2xl">
                    <div className="bg-orange-500/10 w-20 h-20 rounded-full flex items-center justify-center text-orange-500 mx-auto mb-6">
                        <Store size={40} />
                    </div>
                    <h2 className="text-xl font-bold mb-2">No Restaurant Registered</h2>
                    <p className="text-zinc-500 mb-8 max-w-sm mx-auto">
                        To start selling and promoting your food, you first need to register your restaurant details.
                    </p>
                    <button
                        onClick={() => router.push('/dashboard/owner/create-restaurant')}
                        className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-4 rounded-xl font-bold hover:opacity-90 transition flex items-center gap-2 mx-auto shadow-lg shadow-orange-500/20"
                    >
                        <PlusCircle size={20} />
                        Register My Restaurant
                    </button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
                            <div className="bg-orange-500/20 w-10 h-10 rounded-full flex items-center justify-center text-orange-500 mb-2">
                                <DollarSign size={20} />
                            </div>
                            <p className="text-2xl font-bold">--</p>
                            <p className="text-xs text-zinc-500">Total Sales</p>
                        </div>
                        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
                            <div className="bg-blue-500/20 w-10 h-10 rounded-full flex items-center justify-center text-blue-500 mb-2">
                                <ListOrdered size={20} />
                            </div>
                            <p className="text-2xl font-bold">--</p>
                            <p className="text-xs text-zinc-500">Active Orders</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="font-bold text-lg">Quick Actions</h2>
                        <button
                            onClick={() => router.push('/promotions')}
                            className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between hover:bg-zinc-800 transition text-orange-500 border-orange-500/20"
                        >
                            <div className="flex items-center gap-3">
                                <Zap size={18} fill="currentColor" />
                                <span className="font-semibold">Manage Promotions</span>
                            </div>
                            <span className="text-zinc-500">→</span>
                        </button>
                        <button
                            onClick={() => router.push('/dashboard/owner/menu')}
                            className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between hover:bg-zinc-800 transition text-zinc-100"
                        >
                            <span className="font-semibold">Manage Menu</span>
                            <span className="text-zinc-500">→</span>
                        </button>
                        <button className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between hover:bg-zinc-800 transition text-zinc-100">
                            <span className="font-semibold">Update Restaurant Details</span>
                            <span className="text-zinc-500">→</span>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
