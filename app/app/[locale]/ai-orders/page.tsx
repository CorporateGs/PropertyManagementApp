'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Sparkles,
    Globe,
    MessageSquare,
    Phone,
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    Loader2,
    ArrowRight,
    Package
} from 'lucide-react';
import Link from 'next/link';

interface Order {
    id: string;
    orderNumber: string;
    serviceType: string;
    status: string;
    createdAt: string;
    aiAgent?: {
        name: string;
    };
    deliveries: any[];
}

const serviceIcons: Record<string, any> = {
    WEBSITE: Globe,
    CHATBOT: MessageSquare,
    PHONE_ASSISTANT: Phone,
    TAX_PREP: FileText,
};

const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PROCESSING: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-purple-100 text-purple-800',
    COMPLETED: 'bg-green-100 text-green-800',
    FAILED: 'bg-red-100 text-red-800',
};

const statusIcons: Record<string, any> = {
    PENDING: Clock,
    PROCESSING: Loader2,
    IN_PROGRESS: Loader2,
    COMPLETED: CheckCircle,
    FAILED: XCircle,
};

export default function AIOrdersPage({ params }: { params: { locale: string } }) {
    const { data: session } = useSession();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const locale = params.locale;

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await fetch('/api/orders');
            const data = await response.json();
            if (data.success) {
                setOrders(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getServiceName = (type: string) => {
        const names: Record<string, string> = {
            WEBSITE: 'Website',
            CHATBOT: 'AI Chatbot',
            PHONE_ASSISTANT: 'Phone Assistant',
            TAX_PREP: 'Tax Preparation',
        };
        return names[type] || type;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            <div className="container mx-auto">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Sparkles className="h-8 w-8 text-blue-600" />
                        <h1 className="text-4xl font-bold">AI Agency Orders</h1>
                    </div>
                    <p className="text-gray-600">Your AI agents working 24/7</p>
                </div>

                {/* Service Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <Link href={`/${locale}/ai-orders/new?service=WEBSITE`}>
                        <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-500 h-full">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <Globe className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold">Website</h3>
                                        <p className="text-sm text-gray-500">Professional</p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600">AI builds complete Next.js website</p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href={`/${locale}/ai-orders/new?service=CHATBOT`}>
                        <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-purple-500 h-full">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-3 bg-purple-100 rounded-lg">
                                        <MessageSquare className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold">AI Chatbot</h3>
                                        <p className="text-sm text-gray-500">Intelligent</p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600">Intelligent chatbot trained on your data</p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href={`/${locale}/ai-orders/new?service=PHONE_ASSISTANT`}>
                        <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-green-500 h-full">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-3 bg-green-100 rounded-lg">
                                        <Phone className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold">Phone AI</h3>
                                        <p className="text-sm text-gray-500">24/7 Available</p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600">Voice assistant for handling calls</p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href={`/${locale}/ai-orders/new?service=TAX_PREP`}>
                        <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-orange-500 h-full">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-3 bg-orange-100 rounded-lg">
                                        <FileText className="h-6 w-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold">Tax Prep</h3>
                                        <p className="text-sm text-gray-500">Professional</p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600">Professional tax preparation & filing</p>
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                <h2 className="text-2xl font-bold mb-4">Your Orders</h2>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : orders.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                            <p className="text-gray-600">Click on a service above to place your first AI-powered order</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {orders.map((order) => {
                            const ServiceIcon = serviceIcons[order.serviceType] || Package;
                            const StatusIcon = statusIcons[order.status] || Clock;
                            return (
                                <Card key={order.id} className="hover:shadow-lg transition-all">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-4 flex-1">
                                                <div className="p-3 bg-gray-100 rounded-lg">
                                                    <ServiceIcon className="h-6 w-6 text-gray-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-lg font-semibold">{getServiceName(order.serviceType)}</h3>
                                                        <Badge className={statusColors[order.status]}>
                                                            <StatusIcon className={`h-3 w-3 mr-1 ${order.status.includes('PROGRESS') ? 'animate-spin' : ''}`} />
                                                            {order.status.replace('_', ' ')}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-2">Order #{order.orderNumber}</p>
                                                    {order.aiAgent && (
                                                        <p className="text-sm text-gray-600">
                                                            Assigned to: <span className="font-medium">{order.aiAgent.name}</span>
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        Created {new Date(order.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <Link href={`/${locale}/ai-orders/${order.id}`}>
                                                <Button variant="outline" size="sm">
                                                    View Details
                                                    <ArrowRight className="h-4 w-4 ml-2" />
                                                </Button>
                                            </Link>
                                        </div>
                                        {order.deliveries.length > 0 && (
                                            <div className="mt-4 pt-4 border-t">
                                                <p className="text-sm font-medium mb-2">Deliverables Ready:</p>
                                                <div className="flex gap-2">
                                                    {order.deliveries.map((delivery, idx) => (
                                                        <Badge key={idx} variant="outline" className="bg-green-50">
                                                            <CheckCircle className="h-3 w-3 mr-1" />
                                                            {delivery.title}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
