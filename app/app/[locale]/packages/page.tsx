'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Package, Truck, CheckCircle, Search, Box } from 'lucide-react';

export default function PackagesPage() {
    const { data: session } = useSession();
    const { toast } = useToast();
    const [packages, setPackages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        unitId: '', // Ideally a dropdown of units
        carrier: '',
        trackingNumber: '',
        recipientName: '',
        notes: ''
    });

    const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'STAFF';

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            const res = await fetch('/api/packages');
            const data = await res.json();
            if (data.success) {
                setPackages(data.data);
            }
        } catch (error) {
            console.error('Error fetching packages:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // For demo, we need a valid unitId. 
            // In a real app, this would be a select dropdown of all units in the building.
            // We'll use a placeholder or assume the user inputs a valid ID for now.
            // Or better, let's just make it a text input for "Unit Number" and resolve it on backend?
            // The API expects unitId. Let's assume for the demo the user knows the ID or we hardcode one.
            const demoUnitId = 'demo-unit-id'; // Replace with real logic

            const res = await fetch('/api/packages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    unitId: formData.unitId || demoUnitId
                })
            });
            
            const data = await res.json();
            if (data.success) {
                toast({ title: 'Package Logged', description: 'Resident has been notified.' });
                setShowForm(false);
                fetchPackages();
                setFormData({ unitId: '', carrier: '', trackingNumber: '', recipientName: '', notes: '' });
            } else {
                toast({ title: 'Error', description: data.error || 'Failed to log package', variant: 'destructive' });
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' });
        }
    };

    const handlePickup = async (id: string) => {
        try {
            const res = await fetch('/api/packages', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id,
                    status: 'PICKED_UP',
                    pickedUpBy: 'Resident' // In real app, capture signature or name
                })
            });
            
            if (res.ok) {
                toast({ title: 'Package Picked Up', description: 'Status updated successfully.' });
                fetchPackages();
            }
        } catch (error) {
            console.error('Error updating package:', error);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Package className="h-8 w-8 text-purple-600" />
                        Package Tracking
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {isAdmin ? 'Log incoming deliveries and manage pickups.' : 'View your incoming packages and history.'}
                    </p>
                </div>
                {isAdmin && (
                    <Button onClick={() => setShowForm(!showForm)} className="bg-purple-600 hover:bg-purple-700">
                        {showForm ? 'Cancel' : 'Log Package'}
                    </Button>
                )}
            </div>

            {showForm && isAdmin && (
                <Card className="border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-900/20">
                    <CardHeader>
                        <CardTitle>Log Incoming Package</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Unit ID (Demo)</Label>
                                <Input 
                                    placeholder="Enter Unit ID" 
                                    value={formData.unitId}
                                    onChange={e => setFormData({...formData, unitId: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Carrier</Label>
                                <Select onValueChange={(val) => setFormData({...formData, carrier: val})}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Carrier" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Amazon">Amazon</SelectItem>
                                        <SelectItem value="UPS">UPS</SelectItem>
                                        <SelectItem value="FedEx">FedEx</SelectItem>
                                        <SelectItem value="USPS">USPS</SelectItem>
                                        <SelectItem value="DHL">DHL</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Tracking Number</Label>
                                <Input 
                                    placeholder="Optional" 
                                    value={formData.trackingNumber}
                                    onChange={e => setFormData({...formData, trackingNumber: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Recipient Name</Label>
                                <Input 
                                    placeholder="Name on package" 
                                    value={formData.recipientName}
                                    onChange={e => setFormData({...formData, recipientName: e.target.value})}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Button type="submit" className="w-full">Log Package</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-4">
                {packages.map((pkg) => (
                    <div key={pkg.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${pkg.status === 'PICKED_UP' ? 'bg-gray-100 text-gray-500' : 'bg-purple-100 text-purple-600'}`}>
                                <Box className="h-6 w-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-gray-900 dark:text-white">{pkg.carrier}</h3>
                                    {pkg.trackingNumber && <span className="text-xs text-gray-500 font-mono">{pkg.trackingNumber}</span>}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    For: {pkg.recipientName || 'Resident'} (Unit {pkg.unit?.unitNumber})
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Received: {new Date(pkg.receivedAt).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                pkg.status === 'RECEIVED' ? 'bg-green-100 text-green-800' : 
                                pkg.status === 'PICKED_UP' ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-800'
                            }`}>
                                {pkg.status.replace('_', ' ')}
                            </span>
                            
                            {isAdmin && pkg.status === 'RECEIVED' && (
                                <Button size="sm" variant="outline" onClick={() => handlePickup(pkg.id)}>
                                    Mark Picked Up
                                </Button>
                            )}
                        </div>
                    </div>
                ))}

                {packages.length === 0 && !isLoading && (
                    <div className="text-center py-12">
                        <Truck className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Packages Found</h3>
                        <p className="text-gray-500">There are no packages to display.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
