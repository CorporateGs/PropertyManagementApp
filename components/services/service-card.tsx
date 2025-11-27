'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, Shield, FileText, Scale, Calculator, Wrench, UserCheck, Megaphone, ClipboardCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Service {
    id: string;
    name: string;
    description: string;
    price: number;
    features: string; // JSON string
    category: string;
    isProfessional: boolean;
    icon: string;
}

interface ServiceCardProps {
    service: Service;
    isSubscribed?: boolean;
    isAdmin?: boolean;
}

const iconMap: Record<string, any> = {
    Shield,
    FileText,
    Scale,
    Calculator,
    Wrench,
    UserCheck,
    Megaphone,
    ClipboardCheck
};

export function ServiceCard({ service, isSubscribed = false, isAdmin = false }: ServiceCardProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const features = JSON.parse(service.features || '[]');
    const Icon = iconMap[service.icon] || Shield;

    const handleSubscribe = async () => {
        if (!session) {
            router.push('/auth/signin');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/api/services/${service.id}/subscribe`, {
                method: 'POST',
            });

            if (response.ok) {
                router.refresh();
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to subscribe');
            }
        } catch (error) {
            console.error('Subscription error:', error);
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className={`h-full flex flex-col hover:shadow-lg transition-all ${isSubscribed ? 'border-green-500 border-2' : ''}`}>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div className="p-3 bg-blue-50 rounded-lg">
                        <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    {service.isProfessional && (
                        <Badge variant="secondary">Professional</Badge>
                    )}
                </div>
                <CardTitle className="mt-4 text-xl">{service.name}</CardTitle>
                <p className="text-sm text-gray-500 mt-2">{service.description}</p>
            </CardHeader>
            <CardContent className="flex-1">
                <div className="mb-6">
                    <span className="text-3xl font-bold">${service.price}</span>
                    <span className="text-gray-500">/month</span>
                </div>
                <ul className="space-y-3">
                    {features.map((feature: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                            <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                            {feature}
                        </li>
                    ))}
                </ul>
            </CardContent>
            <CardFooter>
                {isAdmin ? (
                    <Button className="w-full bg-gray-100 text-gray-900 hover:bg-gray-200" disabled>
                        Included with Admin
                    </Button>
                ) : isSubscribed ? (
                    <Button className="w-full bg-green-100 text-green-800 hover:bg-green-200" disabled>
                        <Check className="h-4 w-4 mr-2" />
                        Active Subscription
                    </Button>
                ) : (
                    <Button
                        className="w-full"
                        onClick={handleSubscribe}
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            'Subscribe Now'
                        )}
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
