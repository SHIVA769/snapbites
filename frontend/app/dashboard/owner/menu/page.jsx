'use client';
import { useState, useEffect } from 'react';
import useAuthStore from '@/lib/store';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import MenuManagement from '@/components/MenuManagement';
import { ArrowLeft, Store } from 'lucide-react';
import Link from 'next/link';

export default function OwnerMenuPage() {
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

    if (!restaurant) {
        return (
            <div className="min-h-screen bg-black text-white p-4 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">No Restaurant Found</h2>
                    <p className="text-zinc-500 mb-6">You need to register your restaurant before managing the menu.</p>
                    <Link href="/dashboard/owner" className="bg-orange-600 text-white px-6 py-3 rounded-lg font-bold">
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-4 pb-24">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8">
                    <Link
                        href="/dashboard/owner"
                        className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition mb-6 group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition" />
                        <span>Back to Dashboard</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <div className="bg-orange-500/10 p-3 rounded-xl text-orange-500">
                            <Store size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">{restaurant.name}</h1>
                            <p className="text-zinc-500">Manage your restaurant menu</p>
                        </div>
                    </div>
                </header>

                <MenuManagement restaurantId={restaurant._id} />
            </div>
        </div>
    );
}
