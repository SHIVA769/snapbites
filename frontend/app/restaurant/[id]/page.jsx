'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Star, MapPin } from 'lucide-react';
import MapComponent from '@/components/MapComponent';

export default function RestaurantPage() {
    const { id } = useParams();
    const [restaurant, setRestaurant] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                const { data } = await api.get(`/restaurants/${id}`);
                setRestaurant(data.restaurant);
                setMenuItems(data.menuItems);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchRestaurant();
    }, [id]);

    const addToCart = async (item) => {
        try {
            await api.post('/cart', {
                restaurantId: id,
                menuItemId: item._id,
                quantity: 1,
                price: item.price
            });
            alert('Added to cart!');
        } catch (error) {
            alert('Failed to add to cart: ' + (error.response?.data?.message || 'Error'));
        }
    };

    if (loading) return <div className="min-h-screen bg-black text-white flex justify-center items-center">Loading...</div>;
    if (!restaurant) return <div className="min-h-screen bg-black text-white flex justify-center items-center">Restaurant not found</div>;

    return (
        <div className="min-h-screen bg-black text-white pb-10">
            {/* Header Image Stubs could go here, for now just a gradient */}
            <div className="h-32 bg-gradient-to-r from-orange-900 to-black relative">
                <Link href="/feed" className="absolute top-4 left-4 p-2 bg-black/50 backdrop-blur rounded-full text-white">
                    <ChevronLeft size={24} />
                </Link>
            </div>

            <div className="px-4 -mt-10 relative z-10">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-1">{restaurant.name}</h1>
                            <div className="flex items-center text-zinc-400 text-sm gap-1 mb-2">
                                <MapPin size={14} />
                                <span>{restaurant.address}</span>
                            </div>
                        </div>
                        <div className="bg-green-900 text-green-400 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                            <Star size={12} fill="currentColor" /> 4.5
                        </div>
                    </div>
                    <p className="text-zinc-500 text-sm mt-3">{restaurant.description}</p>
                </div>
            </div>

            <div className="container mx-auto px-4 mt-6 max-w-md">
                <h2 className="text-sm font-bold mb-3 text-zinc-400 uppercase tracking-wider">Location</h2>
                <MapComponent
                    center={restaurant.location || { lat: 40.7128, lng: -74.0060 }}
                    markers={[{
                        position: restaurant.location || { lat: 40.7128, lng: -74.0060 },
                        title: restaurant.name
                    }]}
                />
            </div>

            <div className="container mx-auto px-4 mt-8 max-w-md">
                <h2 className="text-lg font-bold mb-4 text-zinc-200">Recommended</h2>
                <div className="space-y-4">
                    {menuItems.map(item => (
                        <div key={item._id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex justify-between items-center transition hover:border-zinc-700">
                            <div>
                                <h3 className="font-bold text-white">{item.name}</h3>
                                <p className="text-xs text-zinc-500 mb-2">{item.description}</p>
                                <p className="text-orange-500 font-bold">${item.price}</p>
                            </div>
                            <button
                                onClick={() => addToCart(item)}
                                className="bg-zinc-800 text-orange-500 border border-zinc-700 px-4 py-2 rounded-full text-sm font-bold hover:bg-orange-600 hover:text-white hover:border-orange-600 transition"
                            >
                                Add
                            </button>
                        </div>
                    ))}
                </div>
                {menuItems.length === 0 && <p className="text-center text-zinc-600 mt-10">No items available.</p>}
            </div>
        </div>
    );
}
