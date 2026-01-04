'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlusCircle, ShoppingCart, User, Search, LayoutDashboard, Shield } from 'lucide-react';
import useAuthStore from '@/lib/store';

export default function BottomNav() {
    const pathname = usePathname();
    const { user, isAuthenticated } = useAuthStore();

    // Hide navbar on auth pages or upload page
    if (pathname.startsWith('/auth') || pathname === '/reels/upload') {
        return null;
    }

    if (!isAuthenticated) return null;

    let centerButton = { name: 'Add', href: '/reels/upload', icon: PlusCircle, highlight: true };

    if (user?.role === 'owner') {
        centerButton = { name: 'Dashboard', href: '/dashboard/owner', icon: LayoutDashboard, highlight: true };
    } else if (user?.role === 'admin') {
        centerButton = { name: 'Admin', href: '/dashboard/admin', icon: Shield, highlight: true };
    } else if (user?.role === 'creator') {
        centerButton = { name: 'Studio', href: '/creator/dashboard', icon: LayoutDashboard, highlight: true };
    }

    const navItems = [
        { name: 'Feed', href: '/feed', icon: Home },
        { name: 'Discover', href: '/restaurants', icon: Search },
        centerButton,
        { name: 'Cart', href: '/cart', icon: ShoppingCart },
        { name: 'Orders', href: '/orders', icon: User },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-2xl border-t border-white/5 pb-safe z-50">
            <div className="flex justify-around items-center h-16 max-w-md mx-auto px-4">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    if (item.highlight) {
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="flex items-center justify-center -mt-8"
                            >
                                <div className="w-14 h-14 rounded-full bg-[var(--p-primary)] flex items-center justify-center shadow-lg shadow-[var(--p-primary)]/20 text-white border-4 border-black group transition-transform hover:scale-105 active:scale-95">
                                    <Icon size={24} strokeWidth={2.5} />
                                </div>
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? 'text-[var(--p-primary)]' : 'text-zinc-600 hover:text-zinc-400'
                                }`}
                        >
                            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[9px] font-bold uppercase tracking-widest">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
