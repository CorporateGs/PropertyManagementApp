'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Subscription {
    id: string;
    status: string;
    amount: number;
    nextBillingDate: string;
    service: {
        name: string;
        price: number;
    };
}

export function SubscriptionManager() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        try {
            const response = await fetch('/api/subscriptions');
            const data = await response.json();
            if (data.success) {
                setSubscriptions(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch subscriptions:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (subscriptions.length === 0) {
        return null;
    }

    return (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle>Active Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {subscriptions.map((sub) => (
                        <div key={sub.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                            <div>
                                <h3 className="font-semibold text-lg">{sub.service.name}</h3>
                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        Next billing: {new Date(sub.nextBillingDate).toLocaleDateString()}
                                    </span>
                                    <span className="font-medium text-gray-900">
                                        ${sub.amount}/month
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Badge className="bg-green-100 text-green-800">
                                    {sub.status}
                                </Badge>
                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
