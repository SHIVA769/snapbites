'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import useAuthStore from '@/lib/store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Trash2 } from 'lucide-react';

export default function CartPage() {
    const [cart, setCart] = useState(null);
    const router = useRouter();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    useEffect(() => {
        if (!isAuthenticated) return;
        const fetchCart = async () => {
            try {
                const { data } = await api.get('/cart');
                setCart(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchCart();
    }, [isAuthenticated]);

    const handleCheckout = async () => {
        try {
            await api.post('/orders');
            alert('Order placed successfully!');
            setCart(null);
            router.push('/feed');
        } catch (error) {
            alert('Checkout failed');
        }
    };

    if (!isAuthenticated) return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
            <p>Please login to view cart.</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white p-4">
            <header className="mb-6 flex items-center gap-4">
                <Link href="/feed" className="p-2 bg-zinc-900 rounded-full hover:bg-zinc-800">
                    <ChevronLeft size={24} />
                </Link>
                <h1 className="text-xl font-bold">My Cart</h1>
            </header>

            {!cart || !cart.items || cart.items.length === 0 ? (
                <div className="text-center mt-20 text-zinc-500">
                    <p>Your cart is empty.</p>
                </div>
            ) : (
                <div className="max-w-md mx-auto space-y-6">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                        <h2 className="text-zinc-400 text-sm mb-4 border-b border-zinc-800 pb-2">Order Summary</h2>
                        {cart.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between py-3 border-b border-zinc-800/50 last:border-0">
                                <div>
                                    <p className="font-semibold text-white">{item.menuItem?.name || 'Unknown Item'}</p>
                                    <p className="text-sm text-zinc-500">Qty: {item.quantity}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-white">${item.price * item.quantity}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                        <div className="flex justify-between items-center text-lg font-bold">
                            <span>Total</span>
                            <span className="text-orange-500">${cart.items.reduce((acc, item) => acc + (item.quantity * item.price), 0)}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleCheckout}
                        className="w-full bg-orange-600 text-white p-4 rounded-xl font-bold hover:bg-orange-700 transition shadow-lg shadow-orange-900/20"
                    >
                        Place Order (COD)
                    </button>
                </div>
            )}
        </div>
    );
}
