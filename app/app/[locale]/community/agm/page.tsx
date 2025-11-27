'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Video, Calendar, Users, Mic, Vote } from 'lucide-react';

export default function VirtualAGMPage() {
    const { data: session } = useSession();
    const { toast } = useToast();
    const [meetings, setMeetings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    
    const [formData, setFormData] = useState({
        buildingId: '',
        title: 'Annual General Meeting 2024',
        date: '',
        startTime: '19:00',
        webinarUrl: ''
    });

    const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'STAFF';

    useEffect(() => {
        fetchMeetings();
    }, []);

    const fetchMeetings = async () => {
        try {
            const res = await fetch('/api/community/agm');
            const data = await res.json();
            if (data.success) {
                setMeetings(data.data);
            }
        } catch (error) {
            console.error('Error fetching meetings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const demoBuildingId = 'demo-building-id'; 

            const res = await fetch('/api/community/agm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    buildingId: formData.buildingId || demoBuildingId
                })
            });
            
            const data = await res.json();
            if (data.success) {
                toast({ title: 'AGM Scheduled', description: 'Virtual meeting created successfully.' });
                setShowForm(false);
                fetchMeetings();
            } else {
                toast({ title: 'Error', description: data.error || 'Failed to schedule meeting', variant: 'destructive' });
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
                        <Video className="h-8 w-8 text-blue-600" />
                        Virtual AGM & Voting
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Participate in annual meetings and vote from anywhere.
                    </p>
                </div>
                {isAdmin && (
                    <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700">
                        {showForm ? 'Cancel' : 'Schedule AGM'}
                    </Button>
                )}
            </div>

            {showForm && isAdmin && (
                <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-900/20">
                    <CardHeader>
                        <CardTitle>Schedule Virtual AGM</CardTitle>
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
                                <Label>Meeting Title</Label>
                                <Input 
                                    value={formData.title}
                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <Input 
                                    type="date" 
                                    required 
                                    value={formData.date}
                                    onChange={e => setFormData({...formData, date: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Start Time</Label>
                                <Input 
                                    type="time" 
                                    required 
                                    value={formData.startTime}
                                    onChange={e => setFormData({...formData, startTime: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Webinar URL (Zoom/Teams)</Label>
                                <Input 
                                    placeholder="https://..." 
                                    value={formData.webinarUrl}
                                    onChange={e => setFormData({...formData, webinarUrl: e.target.value})}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Button type="submit" className="w-full">Schedule Meeting</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {meetings.map((meeting) => (
                    <Card key={meeting.id} className="hover:shadow-lg transition-shadow border-t-4 border-t-blue-500">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-xl">{meeting.title}</h3>
                                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                        <Calendar className="h-4 w-4" />
                                        {new Date(meeting.scheduledDate).toLocaleDateString()} at {new Date(meeting.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </p>
                                </div>
                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">
                                    {meeting.status}
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
                                    <Users className="h-5 w-5 mx-auto text-gray-400 mb-1" />
                                    <span className="text-sm font-medium">Quorum Check</span>
                                    <p className="text-xs text-green-600">Passed</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
                                    <Vote className="h-5 w-5 mx-auto text-gray-400 mb-1" />
                                    <span className="text-sm font-medium">Voting Open</span>
                                    <p className="text-xs text-blue-600">3 Motions</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button className="flex-1" variant="default">
                                    <Video className="mr-2 h-4 w-4" /> Join Meeting
                                </Button>
                                <Button className="flex-1" variant="outline">
                                    <Vote className="mr-2 h-4 w-4" /> Proxy / Vote
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {meetings.length === 0 && !isLoading && (
                    <div className="col-span-full text-center py-12">
                        <Video className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Upcoming AGMs</h3>
                        <p className="text-gray-500">There are no annual general meetings scheduled at this time.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
