'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ServiceCard } from '@/components/services/service-card';
import { SubscriptionManager } from '@/components/services/subscription-manager';
import { Loader2, Sparkles } from 'lucide-react';

interface Service {
    id: string;
    name: string;
    description: string;
    price: number;
    features: string;
    category: string;
    isProfessional: boolean;
    icon: string;
}

export default function MyServicesPage() {
    const { data: session } = useSession();
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeSubscriptions, setActiveSubscriptions] = useState<string[]>([]);

    useEffect(() => {
        fetchData();
    }, [session]);

    const fetchData = async () => {
        try {
            const [servicesRes, subsRes] = await Promise.all([
                fetch('/api/services'),
                session ? fetch('/api/subscriptions') : Promise.resolve(null)
            ]);

            const servicesData = await servicesRes.json();
            if (servicesData.success) {
                setServices(servicesData.data);
            }

            if (subsRes) {
                const subsData = await subsRes.json();
                if (subsData.success) {
                    setActiveSubscriptions(subsData.data.map((sub: any) => sub.serviceId));
                }
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    const isAdmin = session?.user?.role === 'ADMIN';

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Services Marketplace</h1>
                    <p className="text-gray-600 mt-2">Enhance your property management with professional services</p>
                </div>

                {session && <SubscriptionManager />}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {services.map((service) => (
                        <ServiceCard
                            key={service.id}
                            service={service}
                            isSubscribed={activeSubscriptions.includes(service.id)}
                            isAdmin={isAdmin}
                        />
                    ))}
                </div>

                {!session && (
                    <div className="mt-12 text-center p-8 bg-blue-50 rounded-2xl">
                        <Sparkles className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to upgrade?</h2>
                        <p className="text-gray-600 mb-6">Sign in to subscribe to these professional services</p>
                        <a href="/auth/signin" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                            Sign In Now
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
