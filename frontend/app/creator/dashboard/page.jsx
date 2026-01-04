'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
    BarChart3,
    TrendingUp,
    ShoppingBag,
    Users,
    Sparkles,
    ArrowRight,
    Loader2,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import useAuthStore from '@/lib/store';

export default function CreatorDashboardPage() {
    const [stats, setStats] = useState(null);
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isInsightLoading, setIsInsightLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useAuthStore();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const { data } = await api.get('/reels/analytics');
                setStats(data);

                // Fetch AI insights after getting stats
                setIsInsightLoading(true);
                const insightResponse = await api.post('/ai/insights', { stats: data });
                setInsights(insightResponse.data.insights);
            } catch (error) {
                console.error('Dashboard fetch error:', error);
                setError(error.response?.data?.message || error.message);
            } finally {
                setLoading(false);
                setIsInsightLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
            <Loader2 className="animate-spin text-orange-500" size={32} />
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="text-red-500 mb-4" size={48} />
            <h1 className="text-xl font-bold mb-2">Access Denied</h1>
            <p className="text-zinc-500 mb-4">{error}</p>
            <p className="text-xs text-zinc-600 mb-6">Current Role: <span className="text-orange-500 font-mono">{user?.role}</span></p>
            <Link href="/feed" className="bg-zinc-800 px-6 py-2 rounded-full text-sm font-bold">Back to Feed</Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white pb-24">
            <header className="px-6 py-8 border-b border-white/5 bg-black/80 backdrop-blur-2xl sticky top-0 z-20">
                <div className="max-w-4xl mx-auto">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white uppercase italic">
                            Creator Studio
                        </h1>
                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-0.5 opacity-60">Performance & Analytics</p>
                    </div>
                </div>
            </header>

            <main className="p-6 max-w-4xl mx-auto space-y-10">

                {/* Quick Profile Section */}
                <div className="premium-card p-6 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-full border-2 border-zinc-800 p-0.5">
                            <div className="w-full h-full bg-zinc-900 rounded-full overflow-hidden flex items-center justify-center">
                                {user?.avatar ? (
                                    <img src={user.avatar} className="w-full h-full object-cover" alt={user.name} />
                                ) : (
                                    <span className="text-xl font-bold text-zinc-600">{user?.name?.[0] || 'U'}</span>
                                )}
                            </div>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold tracking-tight text-white uppercase italic">{user?.name}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-[9px] font-bold uppercase tracking-widest rounded-md border border-white/5">Verified Creator</span>
                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest truncate max-w-[150px]">{user?.email}</span>
                            </div>
                        </div>
                    </div>
                    <Link href={`/creator/${user?._id}`} className="p-3 bg-zinc-900 border border-white/5 rounded-2xl hover:bg-zinc-800 transition group">
                        <ArrowRight size={20} className="text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </Link>
                </div>

                {/* Stat Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon={<Users size={18} />} label="Views" value={stats.totalViews} color="zinc" />
                    <StatCard icon={<TrendingUp size={18} />} label="Likes" value={stats.totalLikes} color="zinc" />
                    <StatCard icon={<ShoppingBag size={18} />} label="Orders" value={stats.totalOrders} color="zinc" />
                    <StatCard icon={<CheckCircle2 size={18} />} label="Conversion" value={`${stats.conversionRate}%`} color="zinc" />
                </div>

                {/* AI Insights Section */}
                <section className="bg-zinc-900/40 border border-white/5 rounded-[32px] p-8 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-white border border-white/5">
                                <Sparkles size={18} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold italic tracking-tight uppercase">AI Strategy</h2>
                                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-0.5">Performance Insights</p>
                            </div>
                        </div>
                        {isInsightLoading && <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white opacity-20"></div>}
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                        {insights.map((insight, i) => (
                            <div key={i} className="bg-black/20 border border-white/5 p-5 rounded-2xl hover:bg-black/40 transition-all group">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">{insight.type}</span>
                                    <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-widest ${insight.impact === 'High' ? 'bg-[var(--p-primary)]/10 text-[var(--p-primary)]' : 'bg-zinc-800 text-zinc-500'}`}>
                                        {insight.impact}
                                    </span>
                                </div>
                                <p className="text-xs text-zinc-400 leading-relaxed">{insight.text}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Top Performing Reels */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold italic tracking-tight uppercase">Banger Analytics</h2>
                        <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Sort: Impact</span>
                    </div>
                    <div className="space-y-3">
                        {stats.reels.sort((a, b) => b.orders - a.orders).slice(0, 5).map(reel => (
                            <div key={reel.id} className="premium-card p-5 flex items-center justify-between group">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-16 bg-zinc-900 rounded-lg overflow-hidden border border-white/5">
                                        <div className="w-full h-full bg-zinc-800 animate-pulse"></div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold tracking-tight line-clamp-1 text-white uppercase">{reel.caption || 'Untitled Reel'}</h3>
                                        <div className="flex items-center gap-4 mt-2">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-tighter">Views</span>
                                                <span className="text-xs font-bold text-white">{reel.views.toLocaleString()}</span>
                                            </div>
                                            <div className="w-[1px] h-4 bg-white/5"></div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-tighter">Conversion</span>
                                                <span className="text-xs font-bold text-[var(--p-primary)]">{reel.orders} Orders</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-600 group-hover:text-white transition-all">
                                    <ArrowRight size={18} />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}

function StatCard({ icon, label, value, color }) {
    return (
        <div className="premium-card p-5 flex flex-col gap-2 relative overflow-hidden group">
            <div className="flex items-center gap-2">
                <div className="p-1.5 bg-zinc-900 rounded-lg text-zinc-500 group-hover:text-white transition-colors border border-white/5 shadow-inner">
                    {icon}
                </div>
                <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-600">{label}</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">{value}</span>
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--p-primary)] to-transparent opacity-0 group-hover:opacity-20 transition-opacity"></div>
        </div>
    );
}
