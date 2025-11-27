'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Globe, Save, Eye, Layout } from 'lucide-react';

export default function WebsiteManagePage() {
    const { data: session } = useSession();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    
    const [formData, setFormData] = useState({
        buildingId: 'demo-building-id', // Placeholder
        title: '',
        description: '',
        homeContent: '',
        status: 'DRAFT'
    });

    useEffect(() => {
        fetchWebsite();
    }, []);

    const fetchWebsite = async () => {
        try {
            // In real app, get buildingId from user context
            const res = await fetch(`/api/websites?buildingId=${formData.buildingId}`);
            const data = await res.json();
            if (data.success && data.data) {
                setFormData({
                    ...formData,
                    title: data.data.title || '',
                    description: data.data.description || '',
                    homeContent: data.data.homeContent || '',
                    status: data.data.status || 'DRAFT'
                });
            }
        } catch (error) {
            console.error('Error fetching website:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/websites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            const data = await res.json();
            if (data.success) {
                toast({ title: 'Website Updated', description: 'Changes saved successfully.' });
            } else {
                toast({ title: 'Error', description: data.error || 'Failed to save changes', variant: 'destructive' });
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
                        <Globe className="h-8 w-8 text-blue-600" />
                        Community Website Builder
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Manage your building's public-facing website and resident portal content.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline">
                        <Eye className="mr-2 h-4 w-4" /> Preview
                    </Button>
                    <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
                        <Save className="mr-2 h-4 w-4" /> Save Changes
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>General Information</CardTitle>
                            <CardDescription>Basic settings for your community site.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Site Title</Label>
                                <Input 
                                    value={formData.title}
                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                    placeholder="e.g. Sunset Towers Community"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Description (SEO)</Label>
                                <Textarea 
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                    placeholder="Brief description of your community..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Homepage Content</CardTitle>
                            <CardDescription>Main content displayed to residents and visitors.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label>Welcome Message / News</Label>
                                <Textarea 
                                    className="min-h-[200px] font-mono"
                                    value={formData.homeContent}
                                    onChange={e => setFormData({...formData, homeContent: e.target.value})}
                                    placeholder="<h1>Welcome to Sunset Towers</h1>..."
                                />
                                <p className="text-xs text-gray-500">Supports HTML/Markdown</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Status & Publishing</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <span className="font-medium">Current Status</span>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                    formData.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {formData.status}
                                </span>
                            </div>
                            <Button 
                                className="w-full" 
                                variant={formData.status === 'PUBLISHED' ? 'outline' : 'default'}
                                onClick={() => setFormData({...formData, status: formData.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'})}
                            >
                                {formData.status === 'PUBLISHED' ? 'Unpublish Site' : 'Publish Live'}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Theme & Layout</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="border-2 border-blue-500 rounded p-2 text-center cursor-pointer bg-blue-50">
                                    <Layout className="h-6 w-6 mx-auto mb-1 text-blue-600" />
                                    <span className="text-xs font-bold">Modern</span>
                                </div>
                                <div className="border rounded p-2 text-center cursor-pointer hover:bg-gray-50">
                                    <Layout className="h-6 w-6 mx-auto mb-1 text-gray-400" />
                                    <span className="text-xs">Classic</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
