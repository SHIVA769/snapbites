'use client';
import { useState, useEffect } from 'react';
import useAuthStore from '@/lib/store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });
    const signup = useAuthStore((state) => state.signup);
    const router = useRouter();
    const [error, setError] = useState('');

    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 20;
            const y = (e.clientY / window.innerHeight - 0.5) * 20;
            setMousePos({ x, y });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await signup(formData);
            router.push('/feed');
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-black p-4 relative overflow-hidden">
            {/* Immersive Background Image */}
            <div
                className="absolute inset-0 z-0 opacity-40 bg-cover bg-center bg-no-repeat grayscale-[20%] scale-105"
                style={{ backgroundImage: 'url("/auth-bg.png")' }}
            ></div>

            {/* Gradient Overlay for Depth */}
            <div className="absolute inset-0 z-5 bg-gradient-to-tr from-black via-black/40 to-[#ff007f10]"></div>

            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#ff007f]/20 blur-[120px] rounded-full animate-float z-10"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#00f2ff]/20 blur-[120px] rounded-full animate-float z-10" style={{ animationDelay: '-2s' }}></div>

            <div className="w-full max-w-md genz-card p-10 relative z-20 backdrop-blur-3xl border-white/20 bg-black/40">
                <h1 className="text-4xl font-black mb-2 text-center text-white tracking-tighter italic transform -skew-x-6">
                    JOIN <span className="text-[#00f2ff]">SNAPBITE</span>
                </h1>
                <p className="text-zinc-500 text-center mb-10 font-bold uppercase text-[10px] tracking-[0.2em]">Start your food journey today</p>

                {error && <p className="text-red-400 mb-6 text-center text-[11px] font-black uppercase tracking-widest bg-red-400/10 p-3 rounded-xl border border-red-400/20">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-[#ff007f] focus:ring-1 focus:ring-[#ff007f]/50 transition-all placeholder:text-zinc-600 font-bold"
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-[#00f2ff] focus:ring-1 focus:ring-[#00f2ff]/50 transition-all placeholder:text-zinc-600 font-bold"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-[#9d00ff] focus:ring-1 focus:ring-[#9d00ff]/50 transition-all placeholder:text-zinc-600 font-bold"
                        required
                    />
                    <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-[#ccff00] transition-all font-bold [&>option]:bg-zinc-900 cursor-pointer"
                    >
                        <option value="user">🛒 I want to order food</option>
                        <option value="owner">👨‍🍳 I own a restaurant</option>
                        <option value="creator">🤳 I create food content</option>
                    </select>
                    <button type="submit" className="w-full btn-vibrant mt-4 py-4 rounded-2xl text-sm font-black tracking-[0.2em]">
                        SIGN UP NOW
                    </button>
                </form>
                <p className="mt-8 text-center text-zinc-500 text-[11px] font-bold uppercase tracking-widest">
                    Already apart of the squad? <Link href="/auth/login" className="text-[#ff007f] hover:text-[#00f2ff] transition-colors ml-1">Login</Link>
                </p>
            </div>
        </div>
    );
}
