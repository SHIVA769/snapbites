'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import useAuthStore from '@/lib/store';
import Link from 'next/link';
import { ChevronLeft, Package, Clock, Bookmark, Heart, Eye, MessageSquare, ShoppingBag, History } from 'lucide-react';
import ReelCard from '@/components/ReelCard';

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [savedReels, setSavedReels] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'saved'
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (activeTab === 'orders') {
                    const { data } = await api.get('/orders');
                    setOrders(data);
                } else if (activeTab === 'saved') {
                    const { data } = await api.get('/reels/saved');
                    setSavedReels(data);
                } else {
                    const { data } = await api.get('/users/activities');
                    setActivities(data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchData();
        }
    }, [isAuthenticated, activeTab]);

    if (!isAuthenticated) return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
            <p>Please login to view orders.</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white pb-24 overflow-x-hidden">
            <header className="fixed top-0 w-full bg-black/80 backdrop-blur-2xl border-b border-white/5 p-6 z-50">
                <div className="max-w-md mx-auto">
                    <div className="flex items-center gap-5 mb-8">
                        <Link href="/feed" className="p-2 bg-zinc-900/50 border border-white/5 rounded-xl hover:bg-zinc-800 transition group">
                            <ChevronLeft size={20} className="text-zinc-500 group-hover:text-white" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-white uppercase italic">
                                Activity
                            </h1>
                            <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest mt-0.5 opacity-60">History & Interactions</p>
                        </div>
                    </div>

                    {/* Tabs (Industry Standard) */}
                    <div className="flex gap-2 p-1 bg-zinc-900 border border-white/5 rounded-xl">
                        {['orders', 'saved', 'activity'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition ${activeTab === tab ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 pt-36 max-w-md">
                {loading ? (
                    <div className="flex justify-center mt-32">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[var(--p-primary)] shadow-sm"></div>
                    </div>
                ) : activeTab === 'orders' ? (
                    // Orders List
                    orders.length === 0 ? (
                        <div className="text-center mt-32 bg-zinc-900/40 rounded-[32px] p-20 border border-white/5">
                            <Package size={48} className="mx-auto mb-6 opacity-10 text-white" />
                            <p className="text-lg font-bold text-white uppercase italic">Empty Plate</p>
                            <p className="text-[10px] font-bold text-zinc-600 mt-2 uppercase tracking-widest">Your palate is waiting</p>
                            <Link href="/feed" className="btn-premium mt-8 inline-block px-8">Discover Food</Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <div key={order._id} className="premium-card p-6 group">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <p className="font-bold text-lg text-white tracking-tight uppercase italic">Order #{order._id.slice(-6)}</p>
                                            <div className="flex items-center gap-2 mt-1.5 opacity-50">
                                                <Clock size={12} className="text-zinc-500" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest shadow-sm ${order.status === 'placed' ? 'bg-zinc-800 text-zinc-400' :
                                            order.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                                                'bg-zinc-800 text-zinc-600'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center group/item">
                                                <span className="text-sm text-zinc-400">
                                                    <span className="text-white font-bold mr-2">{item.quantity}x</span> {item.name}
                                                </span>
                                                <span className="text-sm font-bold text-white">${item.price}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-between items-center pt-6 border-t border-white/5">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Bill</span>
                                        <span className="text-xl font-bold text-[var(--p-primary)]">${order.totalAmount}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : activeTab === 'saved' ? (
                    // Saved Reels List
                    savedReels.length === 0 ? (
                        <div className="text-center mt-32 bg-zinc-900/40 rounded-[32px] p-20 border border-white/5">
                            <Bookmark size={48} className="mx-auto mb-6 opacity-10 text-white" />
                            <p className="text-lg font-bold text-white uppercase italic">Empty Pantry</p>
                            <p className="text-[10px] font-bold text-zinc-600 mt-2 uppercase tracking-widest">Bookmark some fire content</p>
                        </div>
                    ) : (
                        <div className="space-y-10">
                            {savedReels.map((reel) => (
                                <ReelCard key={reel._id} reel={reel} />
                            ))}
                        </div>
                    )
                ) : (
                    // Activity List
                    activities.length === 0 ? (
                        <div className="text-center mt-32 bg-zinc-900/40 rounded-[32px] p-20 border border-white/5">
                            <History size={48} className="mx-auto mb-6 opacity-10 text-white" />
                            <p className="text-lg font-bold text-white uppercase italic">No Noise</p>
                            <p className="text-[10px] font-bold text-zinc-600 mt-2 uppercase tracking-widest">Start interacting to see updates</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {activities.map((activity) => (
                                <div key={activity._id} className="premium-card p-4 flex items-center gap-5 transition-all group">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border border-white/5 shadow-inner transition-transform group-hover:scale-105 ${activity.action === 'like' ? 'bg-red-500/10 text-red-500' :
                                        activity.action === 'view' ? 'bg-zinc-800 text-zinc-400' :
                                            activity.action === 'comment' ? 'bg-zinc-800 text-white' :
                                                'bg-[var(--p-primary)]/10 text-[var(--p-primary)]'
                                        }`}>
                                        {activity.action === 'like' && <Heart size={20} fill={activity.action === 'like' ? 'currentColor' : 'none'} />}
                                        {activity.action === 'view' && <Eye size={20} />}
                                        {activity.action === 'comment' && <MessageSquare size={20} />}
                                        {activity.action === 'order' && <ShoppingBag size={20} />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-zinc-300">
                                            {activity.action === 'like' && <span>Liked content by <span className="text-white font-bold">{activity.reelId?.creator?.name || 'Creator'}</span></span>}
                                            {activity.action === 'view' && <span>Viewed content by <span className="text-white font-bold">{activity.reelId?.creator?.name || 'Creator'}</span></span>}
                                            {activity.action === 'comment' && <span>Commented on content by <span className="text-white font-bold">{activity.reelId?.creator?.name || 'Creator'}</span></span>}
                                            {activity.action === 'order' && <span>Order placed {activity.orderId && <span className="text-white font-bold">#{activity.orderId._id.slice(-6)}</span>}</span>}
                                        </p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mt-1">{new Date(activity.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</p>
                                    </div>

                                    {activity.reelId?.videoUrl && (
                                        <div className="w-12 h-16 bg-zinc-900 rounded-lg overflow-hidden border border-white/5">
                                            <video src={`http://localhost:5000${activity.reelId.videoUrl}`} className="w-full h-full object-cover" muted />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )
                )}
            </main>
        </div>
    );
}
