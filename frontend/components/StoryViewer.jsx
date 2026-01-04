'use client';
import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Volume2, VolumeX, MoreHorizontal, Send } from 'lucide-react';

export default function StoryViewer({ userStories, onClose }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isMuted, setIsMuted] = useState(true);
    const [isPaused, setIsPaused] = useState(false);
    const videoRef = useRef(null);
    const story = userStories.stories[currentIndex];

    // Auto-advance logic
    useEffect(() => {
        if (isPaused) return;

        const duration = story.mediaType === 'video' ? 10000 : 5000;
        const interval = 50;
        const step = (interval / duration) * 100;

        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) return 100;
                return prev + step;
            });
        }, interval);

        return () => clearInterval(timer);
    }, [currentIndex, story, isPaused]);

    // Handle progress completion
    useEffect(() => {
        if (progress >= 100) {
            handleNext();
        }
    }, [progress]);

    const handleNext = () => {
        if (currentIndex < userStories.stories.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setProgress(0);
        } else {
            onClose();
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setProgress(0);
        }
    };

    const togglePause = () => {
        setIsPaused(!isPaused);
        if (videoRef.current) {
            if (!isPaused) videoRef.current.pause();
            else videoRef.current.play();
        }
    };

    return (
        <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center animate-in fade-in duration-300">
            {/* Background Blur (for non-full aspect ratios) */}
            <div
                className="absolute inset-0 opacity-40 blur-3xl scale-110 pointer-events-none"
                style={{
                    backgroundImage: `url(http://localhost:5000${story.mediaUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            />

            <div className="relative w-full max-w-lg h-full md:h-[90vh] md:rounded-2xl overflow-hidden bg-black shadow-2xl flex flex-col">

                {/* Progress Bars */}
                <div className="absolute top-4 left-4 right-4 flex gap-1.5 z-40">
                    {userStories.stories.map((_, i) => (
                        <div key={i} className="h-1 bg-white/10 flex-1 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-[#ff007f] to-[#00f2ff] shadow-[0_0_10px_rgba(255,0,127,0.8)] transition-all duration-75 ease-linear"
                                style={{
                                    width: i < currentIndex ? '100%' : i === currentIndex ? `${progress}%` : '0%'
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Header */}
                <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-40">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-[#ff007f] via-[#9d00ff] to-[#00f2ff]">
                            <div className="w-full h-full rounded-full bg-black border border-black overflow-hidden">
                                {userStories.user.avatar ? (
                                    <img
                                        src={userStories.user.avatar.startsWith('http') ? userStories.user.avatar : `http://localhost:5000${userStories.user.avatar}`}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs font-black text-[#00f2ff] bg-zinc-900">
                                        {userStories.user.name[0]}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-sm text-white drop-shadow-lg tracking-tight uppercase italic">{userStories.user.name}</span>
                            <span className="text-[10px] text-[#ccff00] font-black uppercase tracking-tighter opacity-90">Live Now</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button className="p-2 text-white/80 hover:text-white"><MoreHorizontal size={20} /></button>
                        <button onClick={onClose} className="p-2 text-white/80 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Media Content */}
                <div
                    className="flex-1 relative flex items-center justify-center bg-zinc-950"
                    onMouseDown={togglePause}
                    onMouseUp={togglePause}
                    onTouchStart={togglePause}
                    onTouchEnd={togglePause}
                >
                    {story.mediaType === 'video' ? (
                        <video
                            ref={videoRef}
                            src={`http://localhost:5000${story.mediaUrl}`}
                            autoPlay
                            muted={isMuted}
                            playsInline
                            className="w-full h-full object-contain z-10"
                        />
                    ) : (
                        <img
                            src={`http://localhost:5000${story.mediaUrl}`}
                            className="w-full h-full object-contain z-10"
                        />
                    )}

                    {/* Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70 z-20 pointer-events-none" />

                    {/* Navigation Arrows (Desktop) */}
                    <button
                        onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity z-30"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleNext(); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity z-30"
                    >
                        <ChevronRight size={24} />
                    </button>

                    {/* Mobile Tap Areas */}
                    <div className="absolute inset-0 flex z-[25] md:hidden">
                        <div className="w-1/3 h-full" onClick={handlePrev} />
                        <div className="w-1/3 h-full" />
                        <div className="w-1/3 h-full" onClick={handleNext} />
                    </div>
                </div>

                {/* Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-6 pt-10 z-40 bg-gradient-to-t from-black via-black/40 to-transparent">
                    {story.caption && (
                        <p className="text-white text-sm mb-4 leading-relaxed font-medium drop-shadow-md">
                            {story.caption}
                        </p>
                    )}

                    <div className="flex items-center gap-3">
                        <div className="flex-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-4 py-2.5 flex items-center">
                            <input
                                type="text"
                                placeholder="Reply to story..."
                                className="bg-transparent border-none focus:ring-0 text-sm text-white placeholder-white/50 w-full"
                            />
                            <Send size={18} className="text-white/70" />
                        </div>

                        {story.mediaType === 'video' && (
                            <button
                                onClick={() => setIsMuted(!isMuted)}
                                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white"
                            >
                                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes progress {
                    from { width: 0%; }
                    to { width: 100%; }
                }
            `}</style>
        </div>
    );
}
