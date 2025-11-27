'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, User } from 'lucide-react';

interface UserData {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    stats: {
        buildings: number;
        units: number;
        tenants: number;
        orders: number;
    };
    activeSubscriptions: string[];
    monthlyRevenue: number;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/users');
            const result = await response.json();
            if (result.success) {
                setUsers(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">User Management</h1>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search users..."
                        className="pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid gap-4">
                {filteredUsers.map((user) => (
                    <Card key={user.id} className="hover:shadow-md transition-all">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-gray-100 rounded-full">
                                        <User className="h-6 w-6 text-gray-600" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-lg">{user.name}</h3>
                                            <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                                                {user.role}
                                            </Badge>
                                        </div>
                                        <p className="text-gray-500">{user.email}</p>
                                        <div className="flex gap-4 mt-2 text-sm text-gray-600">
                                            <span>Buildings: {user.stats.buildings}</span>
                                            <span>Units: {user.stats.units}</span>
                                            <span>Tenants: {user.stats.tenants}</span>
                                            <span>AI Orders: {user.stats.orders}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Monthly Revenue</p>
                                    <p className="text-xl font-bold text-green-600">
                                        ${user.monthlyRevenue.toFixed(2)}
                                    </p>
                                    <div className="mt-2 flex flex-wrap justify-end gap-1">
                                        {user.activeSubscriptions.map((sub, idx) => (
                                            <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                {sub}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
