'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Plus, Trash2, Edit2, Utensils, DollarSign, Tag, Save, X } from 'lucide-react';

export default function MenuManagement({ restaurantId }) {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (restaurantId) {
            fetchMenuItems();
        }
    }, [restaurantId]);

    const fetchMenuItems = async () => {
        try {
            const { data } = await api.get(`/menu-items/restaurant/${restaurantId}`);
            setMenuItems(data);
        } catch (err) {
            console.error('Failed to fetch menu items', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const payload = {
                ...formData,
                restaurantId,
                price: parseFloat(formData.price)
            };

            await api.post('/menu-items', payload);
            setFormData({ name: '', description: '', price: '', category: '' });
            setShowForm(false);
            fetchMenuItems();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add menu item');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (itemId) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            await api.delete(`/menu-items/${itemId}`);
            fetchMenuItems();
        } catch (err) {
            alert('Failed to delete item: ' + (err.response?.data?.message || err.message));
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Utensils className="text-orange-500" />
                    Menu Management
                </h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition ${showForm
                            ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                            : 'bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-500/20'
                        }`}
                >
                    {showForm ? <><X size={18} /> Cancel</> : <><Plus size={18} /> Add Item</>}
                </button>
            </div>

            {/* Add Item Form */}
            {showForm && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-lg font-bold mb-6">Add New Menu Item</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                                    <Tag size={14} /> Item Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Pepperoni Pizza"
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                                    <DollarSign size={14} /> Price ($)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    placeholder="0.00"
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Category</label>
                            <input
                                type="text"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                placeholder="e.g. Main Course, Appetizer, Dessert"
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Description</label>
                            <textarea
                                rows={3}
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe the ingredients or flavor profile..."
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition resize-none"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-4 rounded-xl">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Adding...' : <><Save size={18} /> Save Menu Item</>}
                        </button>
                    </form>
                </div>
            )}

            {/* Menu Items List */}
            <div className="grid gap-4">
                {menuItems.length === 0 ? (
                    <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-12 text-center">
                        <Utensils size={48} className="text-zinc-700 mx-auto mb-4" />
                        <p className="text-zinc-500">Your menu is empty. Add your first item!</p>
                    </div>
                ) : (
                    menuItems.map((item) => (
                        <div
                            key={item._id}
                            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex justify-between items-center group hover:border-zinc-700 transition"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <h4 className="font-bold text-lg">{item.name}</h4>
                                    <span className="bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded text-xs font-bold">
                                        ${item.price.toFixed(2)}
                                    </span>
                                    {item.category && (
                                        <span className="bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded text-xs">
                                            {item.category}
                                        </span>
                                    )}
                                </div>
                                <p className="text-zinc-500 text-sm line-clamp-1">{item.description}</p>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                                <button
                                    onClick={() => handleDelete(item._id)}
                                    className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition"
                                    title="Delete Item"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
