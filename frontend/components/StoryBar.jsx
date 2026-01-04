'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Plus, Loader2 } from 'lucide-react';
import useAuthStore from '@/lib/store';
import StoryViewer from './StoryViewer';

export default function StoryBar() {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPosting, setIsPosting] = useState(false);
    const [selectedUserStories, setSelectedUserStories] = useState(null);
    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    const fetchStories = async () => {
        try {
            const { data } = await api.get('/stories');
            setStories(data);
        } catch (error) {
            console.error("Failed to fetch stories", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStories();
    }, []);

    const handleAddStory = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('media', file);

        setIsPosting(true);
        try {
            await api.post('/stories', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            await fetchStories();
        } catch (error) {
            alert('Failed to post story');
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div className="relative mb-8">
            <div className="flex space-x-5 overflow-x-auto pb-4 scrollbar-hide px-4">
                {/* Add Story Button (Industry Standard) */}
                {isAuthenticated && (
                    <label className="flex-shrink-0 cursor-pointer group">
                        <input type="file" accept="image/*,video/*" className="hidden" onChange={handleAddStory} disabled={isPosting} />
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full border-2 border-dashed border-zinc-800 flex items-center justify-center bg-zinc-900 group-hover:border-[var(--p-primary)] group-hover:bg-zinc-800 transition-all relative">
                                {isPosting ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-zinc-500 border-t-white"></div>
                                ) : (
                                    <Plus size={24} className="text-zinc-500 group-hover:text-white" />
                                )}
                            </div>
                            <span className="text-[10px] font-bold text-zinc-500 mt-2 uppercase tracking-wider group-hover:text-white transition">Me</span>
                        </div>
                    </label>
                )}

                {/* Loading State */}
                {loading && stories.length === 0 && (
                    [1, 2, 3, 4].map(i => (
                        <div key={i} className="flex flex-col items-center flex-shrink-0 animate-pulse">
                            <div className="w-16 h-16 rounded-full bg-zinc-900 border-2 border-zinc-800" />
                            <div className="w-10 h-2 bg-zinc-900 rounded mt-2" />
                        </div>
                    ))
                )}

                {/* Story Circles */}
                {stories.map((item, index) => (
                    <button
                        key={item.user?._id || index}
                        onClick={() => setSelectedUserStories(item)}
                        className="flex-shrink-0 flex flex-col items-center group"
                    >
                        <div className={`p-0.5 rounded-full border-2 transition-all duration-500 ${selectedUserStories?._id === item._id ? 'border-[var(--p-primary)]' : 'border-zinc-800 group-hover:border-zinc-500'}`}>
                            <div className="w-15 h-15 rounded-full border-2 border-black overflow-hidden bg-zinc-900">
                                {item.user?.avatar ? (
                                    <img
                                        src={item.user.avatar.startsWith('http') ? item.user.avatar : `http://localhost:5000${item.user.avatar}`}
                                        className="w-full h-full object-cover"
                                        alt={item.user.name}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-zinc-600">
                                        {item.user?.name?.[0] || 'U'}
                                    </div>
                                )}
                            </div>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-500 mt-2 uppercase tracking-wider group-hover:text-white truncate w-16 text-center">
                            {item.user?.name || 'User'}
                        </span>
                    </button>
                ))}
            </div>

            {selectedUserStories && (
                <StoryViewer
                    userStories={selectedUserStories}
                    onClose={() => setSelectedUserStories(null)}
                />
            )}

            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
