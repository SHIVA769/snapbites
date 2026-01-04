'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { Star, MapPin, Clock } from 'lucide-react';

export default function RecommendationsList() {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState(null);

    useEffect(() => {
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
        const fetchRecommendations = async () => {
            try {
                let query = '';
                if (location) {
                    query = `?lat=${location.lat}&lng=${location.lng}`;
                }
                const { data } = await api.get(`/recommendations${query}`);
                setRecommendations(data);
            } catch (error) {
                console.error('Failed to fetch recommendations:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchRecommendations();
    }, [location]);

    if (loading) return (
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {[1, 2, 3].map(i => (
                <div key={i} className="min-w-[200px] h-32 bg-zinc-900 animate-pulse rounded-xl"></div>
            ))}
        </div>
    );

    if (recommendations.length === 0) return null;

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                    Recommended for You 🍽️
                </h2>
                <div className="text-[10px] bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    AI Powered
                </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
                {recommendations.map((item) => (
                    <Link
                        href={`/restaurant/${item.restaurant?._id}`}
                        key={item._id}
                        className="min-w-[220px] bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden active:scale-95 transition group"
                    >
                        <div className="h-28 bg-zinc-800 relative">
                            {/* Small badge for time relevance */}
                            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 z-10">
                                <Clock size={10} className="text-orange-500" />
                                {item.category}
                            </div>
                            {item.image ? (
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-zinc-700">
                                    No Image
                                </div>
                            )}
                        </div>
                        <div className="p-3">
                            <h3 className="font-bold text-sm text-white line-clamp-1">{item.name}</h3>
                            <p className="text-[10px] text-zinc-500 line-clamp-1 mb-2">{item.restaurant?.name}</p>

                            <div className="flex items-center justify-between">
                                <span className="text-orange-500 font-bold text-sm">${item.price}</span>
                                <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                                    <Star size={10} fill="currentColor" className="text-yellow-500" />
                                    4.8
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
