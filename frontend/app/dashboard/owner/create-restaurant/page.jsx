'use client';
import CreateRestaurantForm from '@/components/CreateRestaurantForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateRestaurantPage() {
    return (
        <div className="min-h-screen bg-black text-white p-4 pb-24">
            <div className="max-w-2xl mx-auto">
                <Link
                    href="/dashboard/owner"
                    className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition mb-8 group"
                >
                    <div className="bg-zinc-900 p-2 rounded-full border border-zinc-800 group-hover:border-zinc-700">
                        <ArrowLeft size={20} />
                    </div>
                    <span>Back to Dashboard</span>
                </Link>

                <CreateRestaurantForm />
            </div>
        </div>
    );
}
