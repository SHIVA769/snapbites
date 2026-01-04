'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Upload, Video, MapPin, Type, Tag, Sparkles, X, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function UploadReelPage() {
    const [file, setFile] = useState(null);
    const [caption, setCaption] = useState('');
    const [restaurants, setRestaurants] = useState([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState('');
    const [menuItems, setMenuItems] = useState([]);
    const [selectedMenuItem, setSelectedMenuItem] = useState('');
    const [loading, setLoading] = useState(false);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState(null);
    const router = useRouter();

    useEffect(() => {
        if (selectedRestaurant) {
            const fetchMenu = async () => {
                try {
                    const { data } = await api.get(`/restaurants/${selectedRestaurant}`);
                    setMenuItems(data.menuItems);
                } catch (error) {
                    console.error(error);
                }
            };
            fetchMenu();
        } else {
            setMenuItems([]);
            setSelectedMenuItem('');
        }
    }, [selectedRestaurant]);

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const { data } = await api.get('/restaurants');
                setRestaurants(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchRestaurants();
    }, []);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return alert('Please select a video');
        setLoading(true);

        const formData = new FormData();
        formData.append('video', file);
        formData.append('caption', caption);
        if (selectedRestaurant) formData.append('restaurantId', selectedRestaurant);
        if (selectedMenuItem) formData.append('menuItemId', selectedMenuItem);

        try {
            await api.post('/reels', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            router.push('/feed');
        } catch (error) {
            alert('Upload failed: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleAiGenerate = async () => {
        const dish = menuItems.find(m => m._id === selectedMenuItem)?.name;
        const restaurant = restaurants.find(r => r._id === selectedRestaurant)?.name;

        setIsAiLoading(true);
        try {
            const { data } = await api.post('/ai/generate', {
                dishName: dish,
                restaurantName: restaurant,
                atmosphere: 'vibrant and appetizing'
            });
            setAiSuggestions(data);
        } catch (error) {
            alert('AI generation failed. Please try again.');
        } finally {
            setIsAiLoading(false);
        }
    };

    const applyAiSuggestion = (text, hashtags = []) => {
        const combined = `${text}\n\n${hashtags.join(' ')}`;
        setCaption(combined);
        setAiSuggestions(null);
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <header className="p-4 border-b border-zinc-800 flex items-center justify-between sticky top-0 bg-black/80 backdrop-blur z-10">
                <Link href="/feed" className="text-zinc-400 hover:text-white">Cancel</Link>
                <h1 className="font-bold text-lg">New Reel</h1>
                <button
                    onClick={handleSubmit}
                    disabled={loading || !file}
                    className="text-orange-500 font-bold hover:text-orange-400 disabled:opacity-50"
                >
                    {loading ? 'Posting...' : 'Share'}
                </button>
            </header>

            <main className="flex-1 max-w-md mx-auto w-full p-4">
                <div className="space-y-6">

                    {/* Video Selector */}
                    <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 flex flex-col items-center justify-center min-h-[200px] text-center">
                        {file ? (
                            <div className="relative w-full">
                                <p className="text-green-500 font-semibold mb-2 flex items-center justify-center gap-2">
                                    <Video size={18} /> {file.name}
                                </p>
                                <p className="text-xs text-zinc-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                <button onClick={() => setFile(null)} className="mt-4 text-sm text-red-500 hover:text-red-400">Change Video</button>
                            </div>
                        ) : (
                            <label className="cursor-pointer flex flex-col items-center w-full h-full">
                                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-3 text-zinc-400">
                                    <Upload size={24} />
                                </div>
                                <span className="font-medium text-zinc-200">Select Video</span>
                                <span className="text-xs text-zinc-500 mt-1">MP4, MOV up to 20MB</span>
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>

                    {/* Caption */}
                    <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 space-y-3">
                        <div className="flex items-start gap-3">
                            <Type className="text-zinc-500 mt-1" size={20} />
                            <textarea
                                placeholder="Write a caption..."
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                className="bg-transparent w-full text-white placeholder:text-zinc-600 focus:outline-none resize-none min-h-[100px]"
                            />
                        </div>
                        <div className="flex justify-end pr-1 border-t border-zinc-800/50 pt-3">
                            <button
                                type="button"
                                onClick={handleAiGenerate}
                                disabled={isAiLoading}
                                className="flex items-center gap-2 text-xs font-bold text-orange-500 hover:text-orange-400 disabled:opacity-50 transition bg-orange-500/10 px-3 py-1.5 rounded-full"
                            >
                                {isAiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                Magic ✨
                            </button>
                        </div>
                    </div>

                    {/* Tagging */}
                    <div className="bg-zinc-900 rounded-xl px-4 py-3 border border-zinc-800 flex items-center gap-3">
                        <MapPin className="text-zinc-500" size={20} />
                        <select
                            value={selectedRestaurant}
                            onChange={(e) => setSelectedRestaurant(e.target.value)}
                            className="bg-transparent w-full text-white focus:outline-none [&>option]:bg-zinc-900"
                        >
                            <option value="">Tag a Restaurant</option>
                            {restaurants.map(r => (
                                <option key={r._id} value={r._id}>{r.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Menu Item Tagging */}
                    {selectedRestaurant && (
                        <div className="bg-zinc-900 rounded-xl px-4 py-3 border border-zinc-800 flex items-center gap-3">
                            <Tag className="text-zinc-500" size={20} />
                            <select
                                value={selectedMenuItem}
                                onChange={(e) => setSelectedMenuItem(e.target.value)}
                                className="bg-transparent w-full text-white focus:outline-none [&>option]:bg-zinc-900"
                            >
                                <option value="">Tag a Menu Item (Optional)</option>
                                {menuItems.map(item => (
                                    <option key={item._id} value={item._id}>{item.name} - ${item.price}</option>
                                ))}
                            </select>
                        </div>
                    )}

                </div>

                <div className="mt-8">
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !file}
                        className="w-full bg-orange-600 text-white p-4 rounded-xl font-bold hover:bg-orange-700 transition shadow-lg shadow-orange-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Posting...' : 'Share Reel'}
                    </button>
                </div>
            </main>

            {/* AI Suggestions Modal */}
            {aiSuggestions && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-300">
                        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                            <h2 className="font-bold flex items-center gap-2">
                                <Sparkles size={18} className="text-orange-500" />
                                AI Suggestions
                            </h2>
                            <button onClick={() => setAiSuggestions(null)} className="p-1 hover:bg-zinc-800 rounded-full transition">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
                            <section>
                                <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-3 px-1">Captions</h3>
                                <div className="space-y-2">
                                    {aiSuggestions.captions.map((cap, i) => (
                                        <button
                                            key={i}
                                            onClick={() => applyAiSuggestion(cap, aiSuggestions.hashtags)}
                                            className="w-full text-left p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 border border-transparent hover:border-orange-500/30 transition text-sm"
                                        >
                                            {cap}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <section>
                                <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-3 px-1">Description</h3>
                                <button
                                    onClick={() => applyAiSuggestion(aiSuggestions.description, aiSuggestions.hashtags)}
                                    className="w-full text-left p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 border border-transparent hover:border-orange-500/30 transition text-sm italic text-zinc-300"
                                >
                                    "{aiSuggestions.description}"
                                </button>
                            </section>

                            <section>
                                <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-3 px-1">Hashtags</h3>
                                <div className="flex flex-wrap gap-2 px-1">
                                    {aiSuggestions.hashtags.map((tag, i) => (
                                        <span key={i} className="text-xs text-orange-500 font-medium">{tag}</span>
                                    ))}
                                </div>
                            </section>
                        </div>
                        <div className="p-4 bg-zinc-950/50 text-[10px] text-zinc-500 text-center italic">
                            Tip: Pick a caption to automatically include the hashtags!
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
