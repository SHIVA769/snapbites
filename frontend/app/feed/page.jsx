'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import ReelCard from '@/components/ReelCard';
import useAuthStore from '@/lib/store';
import Link from 'next/link';
import { LogIn, Search, User } from 'lucide-react';
import StoryBar from '@/components/StoryBar';

export default function FeedPage() {
    const [reels, setReels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('smart'); // 'smart', 'latest', 'trending', or 'following'
    const [location, setLocation] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    useEffect(() => {
        // Get user location for smart ranking
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            });
        }
    }, []);

    useEffect(() => {
        const fetchReels = async () => {
            setLoading(true);
            try {
                let query = `?filter=${filter}`;
                if (filter === 'smart' && location) {
                    query += `&lat=${location.lat}&lng=${location.lng}`;
                }
                if (searchQuery) {
                    query += `&search=${encodeURIComponent(searchQuery)}`;
                }
                const { data } = await api.get(`/reels${query}`);
                setReels(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchReels();
    }, [filter, location, searchQuery]);

    return (
        <div className="min-h-screen bg-black text-white pb-24 overflow-x-hidden">
            {/* Header (Premium Industry) */}
            <header className="fixed top-0 w-full bg-black/80 backdrop-blur-2xl border-b border-white/5 p-4 z-50">
                <div className="max-w-md mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex flex-col">
                            <h1 className="text-2xl font-bold tracking-tight text-white italic">
                                SnapBite
                            </h1>
                            <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-500">Premium Discovery</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="bg-zinc-900/50 flex p-1 rounded-xl border border-white/5">
                                {['smart', 'following'].map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setFilter(t)}
                                        className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${filter === t ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                                    >
                                        {t === 'smart' ? 'For You' : t}
                                    </button>
                                ))}
                            </div>

                            {isAuthenticated ? (
                                <Link href={user?.role === 'creator' ? '/creator/dashboard' : '/orders'} className="w-8 h-8 rounded-full border border-white/10 p-0.5 hover:border-[var(--p-primary)] transition">
                                    <div className="w-full h-full bg-zinc-900 rounded-full flex items-center justify-center overflow-hidden">
                                        {user?.avatar ? (
                                            <img src={user.avatar} className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={14} className="text-zinc-500" />
                                        )}
                                    </div>
                                </Link>
                            ) : (
                                <Link href="/auth/login" className="text-[10px] font-bold uppercase tracking-wider bg-white text-black px-4 py-2 rounded-lg hover:bg-zinc-200 transition">
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Search className="text-zinc-600 group-focus-within:text-[var(--p-primary)] transition-colors" size={16} />
                        </div>
                        <input
                            type="text"
                            placeholder="Find your next meal..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter'}
                            className="w-full bg-zinc-900 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[var(--p-primary)]/50 transition-all"
                        />
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-0 pt-48 max-w-md">
                <StoryBar />

                <div className="px-4 pb-20">
                    {loading ? (
                        <div className="flex justify-center mt-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[var(--p-primary)] shadow-[0_0_15px_rgba(255,69,0,0.2)]"></div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reels.map((reel) => (
                                <ReelCard key={reel._id} reel={reel} />
                            ))}
                        </div>
                    )}
                    {reels.length === 0 && !loading && (
                        <div className="text-center mt-32 bg-zinc-900/30 rounded-3xl p-16 border border-white/5 frosted-glass">
                            <p className="font-bold text-white text-lg">Empty Kitchen</p>
                            <p className="text-sm text-zinc-500 mt-2">No reels matching your vibe yet.</p>
                            <Link href="/reels/upload" className="btn-premium mt-8">Create First Reel</Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
