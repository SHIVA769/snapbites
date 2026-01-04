'use client';
import { useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Upload, X, MapPin, Store, FileText } from 'lucide-react';

export default function CreateRestaurantForm() {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        address: ''
    });
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setImage(null);
        setImagePreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.description);
            data.append('address', formData.address);
            if (image) {
                data.append('image', image);
            }

            await api.post('/restaurants', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            router.push('/dashboard/owner');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create restaurant');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Store className="text-orange-500" />
                Register Your Restaurant
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Upload */}
                <div
                    className={`relative border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition ${imagePreview ? 'border-orange-500/50 bg-orange-500/5' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-800/50'
                        }`}
                >
                    {imagePreview ? (
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="absolute top-2 right-2 bg-black/60 p-2 rounded-full text-white hover:bg-black/80 transition"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    ) : (
                        <label className="flex flex-col items-center cursor-pointer py-10 w-full">
                            <Upload className="text-zinc-500 mb-2" size={32} />
                            <span className="text-sm font-medium text-zinc-400">Upload Restaurant Image</span>
                            <span className="text-xs text-zinc-600 mt-1">PNG, JPG up to 5MB</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                        </label>
                    )}
                </div>

                {/* Name */}
                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                        <Store size={14} /> Restaurant Name
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter restaurant name"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition placeholder:text-zinc-600"
                    />
                </div>

                {/* Address */}
                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                        <MapPin size={14} /> Address
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Enter restaurant address"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition placeholder:text-zinc-600"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                        <FileText size={14} /> Description
                    </label>
                    <textarea
                        required
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Tell us about your restaurant..."
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition placeholder:text-zinc-600 resize-none"
                    />
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-4 rounded-xl">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 rounded-xl font-bold hover:opacity-90 transition shadow-lg shadow-orange-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Registering...
                        </>
                    ) : (
                        'Submit Registration'
                    )}
                </button>
            </form>
        </div>
    );
}
