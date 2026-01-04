'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function PromotionRequestForm({ restaurantId }) {
    const [type, setType] = useState('boost_reel');
    const [reels, setReels] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [selectedTarget, setSelectedTarget] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchData();
    }, [restaurantId]);

    const fetchData = async () => {
        try {
            // Fetch reels for this restaurant
            const { data: reelsData } = await api.get(`/reels?restaurant=${restaurantId}`);
            setReels(reelsData);

            // Fetch menu items for this restaurant
            const { data: restaurantData } = await api.get(`/restaurants/${restaurantId}`);
            setMenuItems(restaurantData.menuItems || []);
        } catch (error) {
            console.error('Failed to fetch data', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const payload = {
                restaurantId,
                type,
                endDate: endDate || undefined
            };

            if (type === 'boost_reel') {
                payload.targetReelId = selectedTarget;
            } else {
                payload.targetMenuItemId = selectedTarget;
            }

            await api.post('/promotions', payload);
            setMessage('Promotion request submitted successfully! Waiting for admin approval.');
            setSelectedTarget('');
            setEndDate('');
        } catch (error) {
            setMessage('Failed to submit promotion: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Request Promotion</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Promotion Type */}
                <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Promotion Type
                    </label>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => { setType('boost_reel'); setSelectedTarget(''); }}
                            className={`flex-1 py-3 px-4 rounded-lg border-2 transition ${type === 'boost_reel'
                                    ? 'border-orange-500 bg-orange-500/10 text-orange-500'
                                    : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600'
                                }`}
                        >
                            <div className="font-bold">Boost Reel</div>
                            <div className="text-xs mt-1">Increase visibility of a reel</div>
                        </button>
                        <button
                            type="button"
                            onClick={() => { setType('highlight_menu_item'); setSelectedTarget(''); }}
                            className={`flex-1 py-3 px-4 rounded-lg border-2 transition ${type === 'highlight_menu_item'
                                    ? 'border-orange-500 bg-orange-500/10 text-orange-500'
                                    : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600'
                                }`}
                        >
                            <div className="font-bold">Highlight Menu Item</div>
                            <div className="text-xs mt-1">Feature a menu item</div>
                        </button>
                    </div>
                </div>

                {/* Target Selection */}
                <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                        {type === 'boost_reel' ? 'Select Reel' : 'Select Menu Item'}
                    </label>
                    <select
                        value={selectedTarget}
                        onChange={(e) => setSelectedTarget(e.target.value)}
                        required
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                    >
                        <option value="">-- Choose {type === 'boost_reel' ? 'a reel' : 'a menu item'} --</option>
                        {type === 'boost_reel' ? (
                            reels.map(reel => (
                                <option key={reel._id} value={reel._id}>
                                    {reel.caption || 'Untitled Reel'} ({reel.views || 0} views)
                                </option>
                            ))
                        ) : (
                            menuItems.map(item => (
                                <option key={item._id} value={item._id}>
                                    {item.name} - ${item.price}
                                </option>
                            ))
                        )}
                    </select>
                </div>

                {/* End Date (Optional) */}
                <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                        End Date (Optional)
                    </label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                    />
                    <p className="text-xs text-zinc-500 mt-1">Leave empty for indefinite promotion</p>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading || !selectedTarget}
                    className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700 transition disabled:bg-zinc-700 disabled:cursor-not-allowed"
                >
                    {loading ? 'Submitting...' : 'Submit Promotion Request'}
                </button>

                {/* Message */}
                {message && (
                    <div className={`p-4 rounded-lg ${message.includes('success')
                            ? 'bg-green-500/10 border border-green-500 text-green-500'
                            : 'bg-red-500/10 border border-red-500 text-red-500'
                        }`}>
                        {message}
                    </div>
                )}
            </form>
        </div>
    );
}
