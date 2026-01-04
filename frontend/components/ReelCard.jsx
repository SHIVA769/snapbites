'use client';
import { useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { ShoppingCart, Heart, MessageCircle, Bookmark, Share2, UserPlus, UserMinus, Sparkles } from 'lucide-react';
import useAuthStore from '@/lib/store';

export default function ReelCard({ reel }) {
    const [liked, setLiked] = useState(false);
    const [saved, setSaved] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false); // Optimistic state
    const currentUser = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    const handleToggleSave = async () => {
        try {
            const { data } = await api.post(`/reels/${reel._id}/save`);
            setSaved(data.saved);
        } catch (error) {
            console.error('Failed to toggle save', error);
        }
    };

    const handleAddToCart = async () => {
        if (!reel.menuItem) return;
        try {
            await api.post('/cart', {
                restaurantId: reel.restaurant._id,
                menuItemId: reel.menuItem._id,
                quantity: 1,
                price: reel.menuItem.price,
                reelId: reel._id
            });
            alert('Added to cart!');
        } catch (error) {
            alert('Failed to add to cart: ' + (error.response?.data?.message || error.message));
        }
    };

    const toggleComments = async () => {
        if (!showComments) {
            setLoadingComments(true);
            try {
                const { data } = await api.get(`/reels/${reel._id}/comments`);
                setComments(data);
            } catch (error) {
                console.error("Failed to fetch comments", error);
            } finally {
                setLoadingComments(false);
            }
        }
        setShowComments(!showComments);
    };

    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        try {
            const { data } = await api.post(`/reels/${reel._id}/comments`, { text: commentText });
            setComments([data, ...comments]);
            setCommentText('');
        } catch (error) {
            alert('Failed to post comment');
        }
    };

    const handleToggleFollow = async () => {
        if (!isAuthenticated) return alert('Login to follow creators!');
        try {
            const { data } = await api.post(`/users/${reel.creator._id}/follow`);
            setIsFollowing(data.following);
        } catch (error) {
            console.error('Failed to toggle follow', error);
        }
    };

    const handleShare = async () => {
        const shareUrl = `${window.location.origin}/reel/${reel._id}`;
        try {
            await navigator.clipboard.writeText(shareUrl);
            alert('Link copied to clipboard! 🚀');
        } catch (err) {
            console.error('Failed to copy link', err);
        }
    };

    return (
        <div className="mb-12 animate-premium-fade">
            <div className="premium-card max-w-sm mx-auto overflow-hidden relative shadow-lg">
                <div className="transform-style-3d">
                    {/* Video Container */}
                    <div className="relative aspect-[9/16] bg-black">
                        <video
                            src={`http://localhost:5000${reel.videoUrl}`}
                            controls
                            className="w-full h-full object-cover"
                        />
                        {reel.isBoosted && (
                            <div className="absolute top-4 right-4 frosted-glass border-white/10 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xl">
                                <span className="status-indicator"></span>
                                Trending Now
                            </div>
                        )}
                    </div>

                    {/* Content Overlays */}
                    <div className="p-5">
                        <div className="flex justify-between items-center mb-5">
                            <Link href={`/creator/${reel.creator?._id}`} className="flex items-center space-x-3 group">
                                <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden bg-zinc-800">
                                    {reel.creator?.avatar ? (
                                        <img src={reel.creator.avatar} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-zinc-500">
                                            {reel.creator?.name?.[0] || 'U'}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <span className="font-bold text-sm text-white block group-hover:text-[var(--p-primary)] transition">{reel.creator?.name || 'Unknown'}</span>
                                    <span className="text-[9px] text-zinc-500 font-medium uppercase tracking-wider">Creator</span>
                                </div>
                            </Link>

                            {isAuthenticated && currentUser?._id !== reel.creator?._id && (
                                <button
                                    onClick={handleToggleFollow}
                                    className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${isFollowing ? 'bg-zinc-800 text-zinc-500' : 'bg-white text-black hover:bg-zinc-200'}`}
                                >
                                    {isFollowing ? 'Following' : 'Follow'}
                                </button>
                            )}
                        </div>

                        <p className="mb-5 text-sm leading-relaxed text-zinc-400">{reel.caption}</p>

                        {/* Tagged Item (Industry Standard) */}
                        {reel.menuItem && (
                            <div className="bg-zinc-900/40 p-3 rounded-xl flex justify-between items-center mb-6 border border-white/5 relative group/item">
                                <div>
                                    <p className="font-bold text-sm text-white">{reel.menuItem.name}</p>
                                    <p className="text-[10px] text-zinc-500 font-medium">{reel.restaurant?.name}</p>
                                    <p className="text-sm font-bold text-[var(--p-primary)] mt-1">${reel.menuItem.price}</p>
                                </div>
                                <button
                                    onClick={handleAddToCart}
                                    className="p-2.5 rounded-lg bg-zinc-800 text-white hover:bg-[var(--p-primary)] transition-colors shadow-sm"
                                >
                                    <ShoppingCart size={18} />
                                </button>
                            </div>
                        )}

                        <div className="flex space-x-8 text-zinc-500 items-center justify-start border-t border-white/5 pt-5">
                            <button onClick={() => setLiked(!liked)} className="flex items-center space-x-2 hover:text-[var(--p-primary)] transition group/btn">
                                <Heart size={22} fill={liked ? 'var(--p-primary)' : 'none'} color={liked ? 'var(--p-primary)' : 'currentColor'} strokeWidth={2} />
                                <span className="text-[11px] font-bold">{reel.likesCount || 0}</span>
                            </button>
                            <button onClick={toggleComments} className="flex items-center space-x-2 hover:text-white transition group/btn">
                                <MessageCircle size={22} strokeWidth={2} />
                                <span className="text-[11px] font-bold">{comments.length > 0 ? comments.length : (reel.commentsCount || 0)}</span>
                            </button>
                            <button onClick={handleToggleSave} className="flex items-center space-x-2 hover:text-white transition group/btn">
                                <Bookmark size={22} fill={saved ? '#fff' : 'none'} strokeWidth={2} />
                            </button>
                            <button onClick={handleShare} className="flex items-center space-x-2 hover:text-white transition group/btn">
                                <Share2 size={22} strokeWidth={2} />
                            </button>
                        </div>

                        {/* Comments Section */}
                        {showComments && (
                            <div className="mt-4 pt-4 border-t border-zinc-800 animate-in slide-in-from-top-2">
                                <form onSubmit={handlePostComment} className="flex gap-2 mb-4">
                                    <input
                                        type="text"
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder="Add a comment..."
                                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!commentText.trim()}
                                        className="text-orange-500 font-bold text-sm disabled:text-zinc-600"
                                    >
                                        Post
                                    </button>
                                </form>

                                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {loadingComments ? (
                                        <p className="text-center text-zinc-500 text-sm">Loading comments...</p>
                                    ) : comments.length === 0 ? (
                                        <p className="text-center text-zinc-500 text-sm">No comments yet.</p>
                                    ) : (
                                        comments.map((comment, idx) => (
                                            <div key={idx} className="flex gap-3">
                                                <div className="w-8 h-8 bg-zinc-700 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white">
                                                    {comment.user?.name?.[0] || 'U'}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-white">{comment.user?.name || 'User'}</p>
                                                    <p className="text-sm text-zinc-300">{comment.text}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
}
