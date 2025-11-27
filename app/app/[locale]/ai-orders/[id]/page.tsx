'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    CheckCircle,
    Clock,
    Loader2,
    XCircle,
    Download,
    ExternalLink,
    MessageSquare,
    User,
    Calendar
} from 'lucide-react';

export default function OrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchOrder();
        // Poll for updates every 5 seconds if order is in progress
        const interval = setInterval(() => {
            if (order?.status === 'IN_PROGRESS' || order?.status === 'PROCESSING') {
                fetchOrder();
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [params.id]);

    const fetchOrder = async () => {
        try {
            const response = await fetch(`/api/orders/${params.id}`);
            const data = await response.json();
            if (data.success) {
                setOrder(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch order:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
                    <Button onClick={() => router.push('/ai-orders')}>
                        Back to Orders
                    </Button>
                </div>
            </div>
        );
    }

    const statusColors: Record<string, string> = {
        PENDING: 'bg-yellow-100 text-yellow-800',
        PROCESSING: 'bg-blue-100 text-blue-800',
        IN_PROGRESS: 'bg-purple-100 text-purple-800',
        COMPLETED: 'bg-green-100 text-green-800',
        FAILED: 'bg-red-100 text-red-800',
    };

    const getTaskIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED': return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'IN_PROGRESS': return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
            case 'FAILED': return <XCircle className="h-5 w-5 text-red-600" />;
            default: return <Clock className="h-5 w-5 text-gray-400" />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                <Button
                    variant="ghost"
                    onClick={() => router.push('/ai-orders')}
                    className="mb-6"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Orders
                </Button>

                {/* Order Header */}
                <Card className="mb-6">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="text-3xl mb-2">
                                    {order.serviceType.replace('_', ' ')}
                                </CardTitle>
                                <CardDescription className="text-lg">
                                    Order #{order.orderNumber}
                                </CardDescription>
                            </div>
                            <Badge className={statusColors[order.status]} style={{ fontSize: '14px', padding: '8px 16px' }}>
                                {order.status.replace('_', ' ')}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                                    <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            {order.aiAgent && (
                                <div className="flex items-center gap-3">
                                    <User className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">AI Agent</p>
                                        <p className="font-medium">{order.aiAgent.name}</p>
                                    </div>
                                </div>
                            )}
                            {order.completedAt && (
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
                                        <p className="font-medium">{new Date(order.completedAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Requirements */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Requirements</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                            <pre className="text-sm whitespace-pre-wrap">
                                {JSON.stringify(JSON.parse(order.requirements), null, 2)}
                            </pre>
                        </div>
                    </CardContent>
                </Card>

                {/* Tasks Progress */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>AI Agent Tasks</CardTitle>
                        <CardDescription>
                            {order.tasks.filter((t: any) => t.status === 'COMPLETED').length} of {order.tasks.length} completed
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {order.tasks.map((task: any, idx: number) => (
                                <div key={task.id} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="mt-1">
                                        {getTaskIcon(task.status)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-medium">{task.description}</h4>
                                            <Badge variant="outline" className="text-xs">
                                                {task.taskType}
                                            </Badge>
                                        </div>
                                        {task.status === 'COMPLETED' && task.output && (
                                            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                                <p className="line-clamp-3">{task.output.substring(0, 200)}...</p>
                                            </div>
                                        )}
                                        {task.status === 'IN_PROGRESS' && (
                                            <p className="text-sm text-blue-600 dark:text-blue-400">Working on this now...</p>
                                        )}
                                        {task.error && (
                                            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{task.error}</p>
                                        )}
                                    </div>
                                    {task.duration && (
                                        <div className="text-sm text-gray-500">
                                            {task.duration}s
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Deliverables */}
                {order.deliveries.length > 0 && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Deliverables</CardTitle>
                            <CardDescription>Your completed work is ready!</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {order.deliveries.map((delivery: any) => {
                                    const content = JSON.parse(delivery.content);
                                    return (
                                        <div key={delivery.id} className="p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900 rounded-lg border-2 border-green-200 dark:border-green-700">
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                                        {delivery.title}
                                                    </h3>
                                                    <p className="text-gray-600 dark:text-gray-300">
                                                        {delivery.description}
                                                    </p>
                                                </div>
                                                <CheckCircle className="h-8 w-8 text-green-600" />
                                            </div>

                                            {delivery.url && (
                                                <div className="mb-4">
                                                    <Button asChild className="w-full sm:w-auto">
                                                        <a href={delivery.url} target="_blank" rel="noopener noreferrer">
                                                            <ExternalLink className="h-4 w-4 mr-2" />
                                                            View Live
                                                        </a>
                                                    </Button>
                                                </div>
                                            )}

                                            {delivery.instructions && (
                                                <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
                                                    <h4 className="font-semibold mb-2">Instructions:</h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {delivery.instructions}
                                                    </p>
                                                </div>
                                            )}

                                            {content.summary && (
                                                <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
                                                    <h4 className="font-semibold mb-2">Summary:</h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {content.summary}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Status History */}
                {order.statusHistory.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Status History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {order.statusHistory.map((history: any) => (
                                    <div key={history.id} className="flex items-center gap-4 text-sm">
                                        <div className="w-32 text-gray-500">
                                            {new Date(history.timestamp).toLocaleString()}
                                        </div>
                                        <div className="flex-1">
                                            <Badge variant="outline">{history.toStatus}</Badge>
                                            {history.reason && (
                                                <span className="ml-2 text-gray-600 dark:text-gray-400">
                                                    - {history.reason}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
