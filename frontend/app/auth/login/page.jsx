'use client';
import { useState, useEffect } from 'react';
import useAuthStore from '@/lib/store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const login = useAuthStore((state) => state.login);
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
            await login(email, password);
            router.push('/feed');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
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
            <div className="absolute inset-0 z-5 bg-gradient-to-tr from-black via-black/40 to-[#9d00ff10]"></div>

            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#9d00ff]/20 blur-[120px] rounded-full animate-float z-10" style={{ animationDelay: '-1s' }}></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#ff007f]/20 blur-[120px] rounded-full animate-float z-10" style={{ animationDelay: '-3s' }}></div>

            <div className="w-full max-w-md genz-card p-10 relative z-20 backdrop-blur-3xl border-white/20 bg-black/40">
                <h1 className="text-4xl font-black mb-2 text-center text-white tracking-tighter italic transform -skew-x-6">
                    WELCOME <span className="text-[#ff007f]">BACK</span>
                </h1>
                <p className="text-zinc-500 text-center mb-10 font-bold uppercase text-[10px] tracking-[0.2em]">Snap into your food vibe</p>

                {error && <p className="text-red-400 mb-8 text-center text-[11px] font-black uppercase tracking-widest bg-red-400/10 p-3 rounded-xl border border-red-400/20">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-[#00f2ff] focus:ring-1 focus:ring-[#00f2ff]/50 transition-all placeholder:text-zinc-600 font-bold"
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-[#9d00ff] focus:ring-1 focus:ring-[#9d00ff]/50 transition-all placeholder:text-zinc-600 font-bold"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full btn-vibrant mt-2 py-4 rounded-2xl text-sm font-black tracking-[0.2em]">
                        ENTER SNAPBITE
                    </button>
                </form>

                <p className="mt-10 text-center text-zinc-500 text-[11px] font-bold uppercase tracking-widest">
                    No account? <Link href="/auth/signup" className="text-[#00f2ff] hover:text-[#ff007f] transition-colors ml-1">Join the hype</Link>
                </p>
            </div>
        </div>
    );
}
