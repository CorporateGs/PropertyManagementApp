'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { FileText, Plus, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function StatusCertificatesPage() {
    const { data: session } = useSession();
    const { toast } = useToast();
    const [certificates, setCertificates] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    
    const [formData, setFormData] = useState({
        buildingId: '', // Ideally select from available buildings
        unitId: '',
        purpose: '',
        dueDate: ''
    });

    useEffect(() => {
        fetchCertificates();
    }, []);

    const fetchCertificates = async () => {
        try {
            const res = await fetch('/api/documents/status-certificates');
            const data = await res.json();
            if (data.success) {
                setCertificates(data.data);
            }
        } catch (error) {
            console.error('Error fetching certificates:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Demo logic: use a placeholder building ID if not selected
            const demoBuildingId = 'demo-building-id'; 

            const res = await fetch('/api/documents/status-certificates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    buildingId: formData.buildingId || demoBuildingId
                })
            });
            
            const data = await res.json();
            if (data.success) {
                toast({ title: 'Request Submitted', description: 'Status certificate request created.' });
                setShowForm(false);
                fetchCertificates();
                setFormData({ buildingId: '', unitId: '', purpose: '', dueDate: '' });
            } else {
                toast({ title: 'Error', description: data.error || 'Failed to request certificate', variant: 'destructive' });
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' });
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <FileText className="h-8 w-8 text-blue-600" />
                        Status Certificates
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Request and manage status certificates for resale or refinancing.
                    </p>
                </div>
                <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700">
                    {showForm ? 'Cancel' : <><Plus className="mr-2 h-4 w-4" /> New Request</>}
                </Button>
            </div>

            {showForm && (
                <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-900/20">
                    <CardHeader>
                        <CardTitle>Request Status Certificate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Building ID (Demo)</Label>
                                <Input 
                                    placeholder="Enter Building ID" 
                                    value={formData.buildingId}
                                    onChange={e => setFormData({...formData, buildingId: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Unit ID (Optional)</Label>
                                <Input 
                                    placeholder="Enter Unit ID" 
                                    value={formData.unitId}
                                    onChange={e => setFormData({...formData, unitId: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Purpose</Label>
                                <Select onValueChange={(val) => setFormData({...formData, purpose: val})}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Purpose" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Sale">Sale of Unit</SelectItem>
                                        <SelectItem value="Refinance">Refinancing</SelectItem>
                                        <SelectItem value="Legal">Legal/Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Due Date</Label>
                                <Input 
                                    type="date" 
                                    required 
                                    value={formData.dueDate}
                                    onChange={e => setFormData({...formData, dueDate: e.target.value})}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Button type="submit" className="w-full">Submit Request</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-4">
                {certificates.map((cert) => (
                    <Card key={cert.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gray-100 rounded-full">
                                    <FileText className="h-6 w-6 text-gray-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{cert.requestId}</h3>
                                    <p className="text-sm text-gray-500">
                                        {cert.purpose} - Due: {new Date(cert.dueDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    cert.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                                    cert.status === 'REQUESTED' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                    {cert.status}
                                </span>
                                {cert.status === 'COMPLETED' && (
                                    <Button variant="outline" size="sm">Download PDF</Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {certificates.length === 0 && !isLoading && (
                    <div className="text-center py-12">
                        <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Requests Found</h3>
                        <p className="text-gray-500">You haven't requested any status certificates.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
