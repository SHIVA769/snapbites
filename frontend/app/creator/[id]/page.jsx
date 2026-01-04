'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeft, Eye, Heart, ShoppingBag, Video } from 'lucide-react';

export default function CreatorProfile() {
    const { id } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            console.log("Fetching profile for ID:", id);
            try {
                const { data } = await api.get(`/users/${id}/profile`);
                console.log("Profile Data:", data);
                setProfile(data);
            } catch (error) {
                console.error("Profile Fetch Error:", error);

                // Temporary: Set mock data if API fails to test UI
                // if (error.response?.status === 404) alert("User not found in Backend");
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchProfile();
        else console.error("ID is undefined in params");
    }, [id]);

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
    );

    if (!profile) return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
            <p>Creator not found.</p>
        </div>
    );

    const { user, stats, topReels } = profile;

    return (
        <div className="min-h-screen bg-black text-white pb-20">
            {/* Header */}
            <div className="bg-gradient-to-b from-zinc-800 to-black p-4 pt-8 pb-8 text-center">
                <div className="w-24 h-24 bg-zinc-700 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold border-4 border-black">
                    {user.name?.[0]}
                </div>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-orange-500 font-medium capitalize">{user.role}</p>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mt-8 max-w-md mx-auto">
                    <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
                        <Eye className="mx-auto mb-1 text-blue-500" size={20} />
                        <p className="font-bold text-lg">{stats.totalViews}</p>
                        <p className="text-xs text-zinc-500">Views</p>
                    </div>
                    <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
                        <Heart className="mx-auto mb-1 text-red-500" size={20} />
                        <p className="font-bold text-lg">{stats.totalLikes}</p>
                        <p className="text-xs text-zinc-500">Likes</p>
                    </div>
                    <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
                        <ShoppingBag className="mx-auto mb-1 text-green-500" size={20} />
                        <p className="font-bold text-lg">{stats.reelsCount}</p>
                        <p className="text-xs text-zinc-500">Reels</p>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 mt-6 max-w-md">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Video size={20} className="text-orange-500" /> Top Performing Reels
                </h2>

                {topReels.length === 0 ? (
                    <p className="text-zinc-500 text-sm">No reels yet.</p>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {topReels.map((reel) => (
                            <Link href="/feed" key={reel._id} className="block relative aspect-[9/16] bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800">
                                <video src={`http://localhost:5000${reel.videoUrl}`} className="w-full h-full object-cover opacity-80" />
                                <div className="absolute bottom-2 left-2 text-xs font-bold text-white flex gap-2">
                                    <span className="flex items-center gap-1"><Heart size={10} /> {reel.likesCount}</span>
                                    <span className="flex items-center gap-1"><Eye size={10} /> {reel.views}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>

            <header className="fixed top-0 left-0 p-4 z-50">
                <Link href="/feed" className="p-2 bg-black/50 backdrop-blur rounded-full hover:bg-black/80 text-white">
                    <ChevronLeft size={24} />
                </Link>
            </header>
        </div>
    );
}
