'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { Search, MapPin, Star, Map as MapIcon, List } from 'lucide-react';
import MapComponent from '@/components/MapComponent';
import RecommendationsList from '@/components/RecommendationsList';

export default function DiscoverPage() {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const { data } = await api.get('/restaurants');
                setRestaurants(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchRestaurants();
    }, []);

    return (
        <div className="min-h-screen bg-black text-white pb-20">
            <header className="fixed top-0 w-full bg-black/90 backdrop-blur border-b border-zinc-800 p-4 z-50">
                <h1 className="text-xl font-bold mb-4">Discover</h1>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center gap-2 text-zinc-400">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search for food or restaurants..."
                        className="bg-transparent w-full focus:outline-none text-white placeholder:text-zinc-600"
                    />
                </div>
                <div className="flex gap-2 mt-4">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'}`}
                    >
                        <List size={18} /> List
                    </button>
                    <button
                        onClick={() => setViewMode('map')}
                        className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition ${viewMode === 'map' ? 'bg-orange-500 text-white' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'}`}
                    >
                        <MapIcon size={18} /> Map
                    </button>
                </div>
            </header>

            <main className="container mx-auto px-4 pt-36 max-w-md">
                <RecommendationsList />

                {loading ? (
                    <div className="flex justify-center mt-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    </div>
                ) : restaurants.length === 0 ? (
                    <div className="text-center mt-20 text-zinc-500">
                        <p>No restaurants found.</p>
                    </div>
                ) : viewMode === 'map' ? (
                    <div className="mt-4">
                        <MapComponent
                            center={restaurants[0]?.location || { lat: 40.7128, lng: -74.0060 }}
                            zoom={12}
                            className="!h-[60vh]"
                            markers={restaurants.map(r => ({
                                position: r.location || { lat: 0, lng: 0 },
                                title: r.name
                            }))}
                        />
                        <div className="mt-6 space-y-4">
                            {restaurants.map(restaurant => (
                                <Link href={`/restaurant/${restaurant._id}`} key={restaurant._id} className="flex gap-4 bg-zinc-900 p-3 rounded-xl border border-zinc-800">
                                    <div className="w-20 h-20 bg-zinc-800 rounded-lg flex-shrink-0"></div>
                                    <div>
                                        <h3 className="font-bold">{restaurant.name}</h3>
                                        <p className="text-xs text-zinc-500 line-clamp-1">{restaurant.address}</p>
                                        <div className="flex items-center gap-1 text-orange-500 text-xs mt-1">
                                            <Star size={10} fill="currentColor" /> 4.5
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {restaurants.map((restaurant) => (
                            <Link href={`/restaurant/${restaurant._id}`} key={restaurant._id} className="block group">
                                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden transition group-hover:border-zinc-700">
                                    <div className="h-40 bg-zinc-800 relative">
                                        {/* Placeholder for Restaurant Image - In real app, use next/image */}
                                        <div className="w-full h-full bg-gradient-to-t from-black/60 to-transparent absolute bottom-0 left-0"></div>
                                        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                                            <h2 className="text-xl font-bold text-white shadow-sm">{restaurant.name}</h2>
                                            <div className="bg-white/90 text-black px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                                                <Star size={12} fill="currentColor" /> 4.5
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <p className="text-zinc-400 text-sm mb-2 line-clamp-2">{restaurant.description}</p>
                                        <div className="flex items-center text-zinc-500 text-xs gap-1">
                                            <MapPin size={14} />
                                            <span>{restaurant.address}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
