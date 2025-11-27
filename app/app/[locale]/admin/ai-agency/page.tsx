'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Activity,
    Users,
    Package,
    TrendingUp,
    Clock,
    CheckCircle,
    XCircle,
    Zap
} from 'lucide-react';

export default function AdminAIAgencyPage() {
    const [stats, setStats] = useState({
        totalOrders: 0,
        activeOrders: 0,
        completedOrders: 0,
        failedOrders: 0,
        totalAgents: 0,
        activeAgents: 0,
        avgCompletionTime: 0,
        successRate: 0
    });
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [agents, setAgents] = useState<any[]>([]);

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 10000); // Refresh every 10s
        return () => clearInterval(interval);
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch orders
            const ordersRes = await fetch('/api/orders');
            const ordersData = await ordersRes.json();

            if (ordersData.success) {
                const orders = ordersData.data;
                setRecentOrders(orders.slice(0, 10));

                setStats({
                    totalOrders: orders.length,
                    activeOrders: orders.filter((o: any) => ['PENDING', 'PROCESSING', 'IN_PROGRESS'].includes(o.status)).length,
                    completedOrders: orders.filter((o: any) => o.status === 'COMPLETED').length,
                    failedOrders: orders.filter((o: any) => o.status === 'FAILED').length,
                    totalAgents: 4, // From seed data
                    activeAgents: 4,
                    avgCompletionTime: 120, // Mock data
                    successRate: orders.length > 0 ? (orders.filter((o: any) => o.status === 'COMPLETED').length / orders.length * 100) : 100
                });
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        AI Agency Admin Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Monitor your autonomous AI workforce
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Total Orders
                            </CardTitle>
                            <Package className="h-4 w-4 text-gray-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.totalOrders}</div>
                            <p className="text-xs text-gray-500 mt-1">
                                {stats.activeOrders} active
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Success Rate
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600">
                                {stats.successRate.toFixed(1)}%
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                {stats.completedOrders} completed
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                AI Agents
                            </CardTitle>
                            <Zap className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-blue-600">
                                {stats.activeAgents}/{stats.totalAgents}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                All systems operational
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Avg Completion
                            </CardTitle>
                            <Clock className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-purple-600">
                                {stats.avgCompletionTime}m
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Per order
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Orders */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                        <CardDescription>Latest AI-powered service orders</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentOrders.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">No orders yet</p>
                            ) : (
                                recentOrders.map((order) => (
                                    <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <h4 className="font-medium">{order.serviceType.replace('_', ' ')}</h4>
                                                <Badge variant="outline" className="text-xs">
                                                    {order.orderNumber}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {order.aiAgent?.name || 'Assigning agent...'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-sm text-gray-500">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </div>
                                            <Badge className={
                                                order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                    order.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                                                        order.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                            }>
                                                {order.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* AI Agents Status */}
                <Card>
                    <CardHeader>
                        <CardTitle>AI Agents Status</CardTitle>
                        <CardDescription>Your autonomous workforce</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { name: 'WebBuilder AI', type: 'WEBSITE_BUILDER', status: 'AVAILABLE', load: 0, maxLoad: 3 },
                                { name: 'ChatBot Creator AI', type: 'CHATBOT_CREATOR', status: 'AVAILABLE', load: 0, maxLoad: 5 },
                                { name: 'VoiceAI Assistant', type: 'PHONE_AI', status: 'AVAILABLE', load: 0, maxLoad: 10 },
                                { name: 'TaxPro AI', type: 'TAX_SPECIALIST', status: 'AVAILABLE', load: 0, maxLoad: 2 },
                            ].map((agent) => (
                                <div key={agent.name} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 rounded-lg border border-blue-200 dark:border-blue-700">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold">{agent.name}</h4>
                                        <Badge className="bg-green-100 text-green-800">
                                            <Activity className="h-3 w-3 mr-1" />
                                            {agent.status}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                        {agent.type.replace('_', ' ')}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all"
                                                style={{ width: `${(agent.load / agent.maxLoad) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            {agent.load}/{agent.maxLoad}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
