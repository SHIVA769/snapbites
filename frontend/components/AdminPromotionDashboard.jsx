'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

export default function AdminPromotionDashboard() {
    const [promotions, setPromotions] = useState([]);
    const [filter, setFilter] = useState('pending');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchPromotions();
    }, [filter]);

    const fetchPromotions = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/promotions?status=${filter}`);
            setPromotions(data);
        } catch (error) {
            console.error('Failed to fetch promotions', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (promotionId) => {
        setActionLoading(promotionId);
        try {
            await api.patch(`/promotions/${promotionId}/approve`);
            alert('Promotion approved successfully!');
            fetchPromotions();
        } catch (error) {
            alert('Failed to approve: ' + (error.response?.data?.message || error.message));
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (promotionId) => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;

        setActionLoading(promotionId);
        try {
            await api.patch(`/promotions/${promotionId}/reject`, { reason });
            alert('Promotion rejected successfully!');
            fetchPromotions();
        } catch (error) {
            alert('Failed to reject: ' + (error.response?.data?.message || error.message));
        } finally {
            setActionLoading(null);
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

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Promotion Approvals</h1>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto">
                    {['pending', 'active', 'approved', 'rejected', 'expired'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${filter === status
                                    ? 'bg-orange-600 text-white'
                                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Promotions List */}
                {loading ? (
                    <div className="text-center py-12 text-zinc-500">Loading promotions...</div>
                ) : promotions.length === 0 ? (
                    <div className="text-center py-12 text-zinc-500">No {filter} promotions found.</div>
                ) : (
                    <div className="space-y-4">
                        {promotions.map(promo => (
                            <div key={promo._id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold">{promo.restaurant?.name}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(promo.status)}`}>
                                                {promo.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-zinc-400">
                                            Requested by: {promo.requestedBy?.name} ({promo.requestedBy?.email})
                                        </p>
                                        <p className="text-xs text-zinc-500">
                                            {new Date(promo.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <p className="text-sm text-zinc-400 mb-1">Type</p>
                                        <p className="font-medium">
                                            {promo.type === 'boost_reel' ? '⚡ Boost Reel' : '⭐ Highlight Menu Item'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-zinc-400 mb-1">Target</p>
                                        <p className="font-medium">
                                            {promo.type === 'boost_reel'
                                                ? promo.targetReel?.caption || 'Untitled Reel'
                                                : promo.targetMenuItem?.name || 'Unknown Item'
                                            }
                                        </p>
                                    </div>
                                    {promo.endDate && (
                                        <div>
                                            <p className="text-sm text-zinc-400 mb-1">End Date</p>
                                            <p className="font-medium">{new Date(promo.endDate).toLocaleDateString()}</p>
                                        </div>
                                    )}
                                    {promo.rejectionReason && (
                                        <div className="md:col-span-2">
                                            <p className="text-sm text-zinc-400 mb-1">Rejection Reason</p>
                                            <p className="text-red-400">{promo.rejectionReason}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                {promo.status === 'pending' && (
                                    <div className="flex gap-3 pt-4 border-t border-zinc-800">
                                        <button
                                            onClick={() => handleApprove(promo._id)}
                                            disabled={actionLoading === promo._id}
                                            className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition disabled:bg-zinc-700"
                                        >
                                            {actionLoading === promo._id ? 'Processing...' : 'Approve'}
                                        </button>
                                        <button
                                            onClick={() => handleReject(promo._id)}
                                            disabled={actionLoading === promo._id}
                                            className="flex-1 bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700 transition disabled:bg-zinc-700"
                                        >
                                            {actionLoading === promo._id ? 'Processing...' : 'Reject'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
