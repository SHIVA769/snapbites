'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import PromotionRequestForm from '@/components/PromotionRequestForm';
import Link from 'next/link';

export default function PromotionManagement() {
    const [restaurants, setRestaurants] = useState([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchRestaurants();
    }, []);

    useEffect(() => {
        if (selectedRestaurant) {
            fetchPromotions();
        }
    }, [selectedRestaurant]);

    const fetchRestaurants = async () => {
        try {
            const { data } = await api.get('/restaurants');
            // Filter to only show user's restaurants
            const { data: userData } = await api.get('/auth/me');
            const userRestaurants = data.filter(r => r.owner === userData._id);
            setRestaurants(userRestaurants);
            if (userRestaurants.length > 0) {
                setSelectedRestaurant(userRestaurants[0]._id);
            }
        } catch (error) {
            console.error('Failed to fetch restaurants', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPromotions = async () => {
        try {
            const { data } = await api.get('/promotions');
            const filtered = data.filter(p => p.restaurant._id === selectedRestaurant);
            setPromotions(filtered);
        } catch (error) {
            console.error('Failed to fetch promotions', error);
        }
    };

    const handleCancel = async (promotionId) => {
        if (!confirm('Are you sure you want to cancel this promotion?')) return;

        try {
            await api.delete(`/promotions/${promotionId}`);
            alert('Promotion cancelled successfully!');
            fetchPromotions();
        } catch (error) {
            alert('Failed to cancel: ' + (error.response?.data?.message || error.message));
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500',
            approved: 'bg-blue-500/10 text-blue-500 border-blue-500',
            active: 'bg-green-500/10 text-green-500 border-green-500',
            rejected: 'bg-red-500/10 text-red-500 border-red-500',
            expired: 'bg-zinc-500/10 text-zinc-500 border-zinc-500'
        };
        return styles[status] || styles.pending;
    };

    if (loading) {
        return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
    }

    if (restaurants.length === 0) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">No Restaurants Found</h2>
                    <p className="text-zinc-400 mb-6">You need to create a restaurant first to manage promotions.</p>
                    <Link href="/dashboard/owner" className="bg-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-700 transition">
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 pb-24">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Promotion Management</h1>

                {/* Restaurant Selector */}
                {restaurants.length > 1 && (
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Select Restaurant</label>
                        <select
                            value={selectedRestaurant}
                            onChange={(e) => setSelectedRestaurant(e.target.value)}
                            className="w-full max-w-md bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                        >
                            {restaurants.map(r => (
                                <option key={r._id} value={r._id}>{r.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Create Promotion Button */}
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="mb-6 bg-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-700 transition"
                >
                    {showForm ? 'Hide Form' : '+ Create New Promotion'}
                </button>

                {/* Promotion Request Form */}
                {showForm && selectedRestaurant && (
                    <div className="mb-8">
                        <PromotionRequestForm restaurantId={selectedRestaurant} />
                    </div>
                )}

                {/* Promotions List */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-4">Your Promotions</h2>

                    {promotions.length === 0 ? (
                        <p className="text-center text-zinc-500 py-8">No promotions yet. Create one to get started!</p>
                    ) : (
                        <div className="space-y-4">
                            {promotions.map(promo => (
                                <div key={promo._id} className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-bold">
                                                    {promo.type === 'boost_reel' ? '⚡ Boost Reel' : '⭐ Highlight Menu Item'}
                                                </h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(promo.status)}`}>
                                                    {promo.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-zinc-400">
                                                {promo.type === 'boost_reel'
                                                    ? promo.targetReel?.caption || 'Untitled Reel'
                                                    : promo.targetMenuItem?.name || 'Unknown Item'
                                                }
                                            </p>
                                            <p className="text-xs text-zinc-500 mt-1">
                                                Created: {new Date(promo.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>

                                        {['pending', 'active'].includes(promo.status) && (
                                            <button
                                                onClick={() => handleCancel(promo._id)}
                                                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>

                                    {promo.rejectionReason && (
                                        <div className="mt-3 p-3 bg-red-500/10 border border-red-500 rounded-lg">
                                            <p className="text-sm text-red-400">
                                                <strong>Rejection Reason:</strong> {promo.rejectionReason}
                                            </p>
                                        </div>
                                    )}

                                    {promo.endDate && (
                                        <p className="text-xs text-zinc-500 mt-2">
                                            Ends: {new Date(promo.endDate).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
