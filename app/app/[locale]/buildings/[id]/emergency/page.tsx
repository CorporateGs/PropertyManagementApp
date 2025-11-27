'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { AlertTriangle, Bell, Shield, Users, CheckCircle, Radio } from 'lucide-react';
import { toast } from 'sonner';

export default function EmergencyCommandCenter({ params }: { params: { id: string } }) {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState('alerts');
    const [isSending, setIsSending] = useState(false);

    // Alert Form State
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [selectedChannels, setSelectedChannels] = useState(['SMS', 'EMAIL']);

    const handleBroadcast = async () => {
        if (!alertTitle || !alertMessage) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsSending(true);
        try {
            const res = await fetch(`/api/buildings/${params.id}/emergency-alerts/broadcast`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: alertTitle,
                    message: alertMessage,
                    type: 'EMERGENCY',
                    channels: selectedChannels
                })
            });

            const data = await res.json();
            if (res.ok) {
                toast.success(`Alert Sent! Reached ${data.recipientCount} residents.`);
                setAlertTitle('');
                setAlertMessage('');
            } else {
                toast.error('Failed to send alert');
            }
        } catch (error) {
            toast.error('System Error');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <Shield className="w-8 h-8 text-red-600" />
                        Emergency Command Center
                    </h1>
                    <p className="text-slate-500">Manage safety protocols, registry, and alerts.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setActiveTab('alerts')}
                        className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'alerts' ? 'bg-red-600 text-white' : 'bg-white text-slate-600'}`}
                    >
                        🚨 Broadcast Alert
                    </button>
                    <button 
                        onClick={() => setActiveTab('registry')}
                        className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'registry' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600'}`}
                    >
                        📋 Vulnerable Registry
                    </button>
                </div>
            </div>

            {activeTab === 'alerts' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Broadcast Panel */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Radio className="w-5 h-5 text-red-500" />
                            Broadcast Emergency Alert
                        </h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Alert Title</label>
                                <input 
                                    type="text" 
                                    value={alertTitle}
                                    onChange={(e) => setAlertTitle(e.target.value)}
                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                                    placeholder="e.g., FIRE ALARM - EVACUATE IMMEDIATELY"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                                <textarea 
                                    value={alertMessage}
                                    onChange={(e) => setAlertMessage(e.target.value)}
                                    className="w-full p-2 border border-slate-300 rounded-lg h-32 focus:ring-2 focus:ring-red-500 outline-none"
                                    placeholder="Detailed instructions for residents..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Delivery Channels</label>
                                <div className="flex gap-4">
                                    {['SMS', 'EMAIL', 'VOICE'].map(channel => (
                                        <label key={channel} className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedChannels.includes(channel)}
                                                onChange={(e) => {
                                                    if (e.target.checked) setSelectedChannels([...selectedChannels, channel]);
                                                    else setSelectedChannels(selectedChannels.filter(c => c !== channel));
                                                }}
                                                className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                                            />
                                            <span className="text-slate-700 font-medium">{channel}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button 
                                onClick={handleBroadcast}
                                disabled={isSending}
                                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-lg transition-all flex justify-center items-center gap-2"
                            >
                                {isSending ? 'Broadcasting...' : '📢 SEND ALERT NOW'}
                            </button>
                        </div>
                    </div>

                    {/* Recent Alerts Log */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Recent Alerts</h2>
                        <div className="space-y-4">
                            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-red-800">FIRE DRILL SCHEDULED</h3>
                                    <span className="text-xs text-red-600 font-mono">2 hours ago</span>
                                </div>
                                <p className="text-sm text-red-700 mt-1">Please be advised of a fire drill at 2 PM.</p>
                                <div className="mt-2 flex gap-2 text-xs text-red-600">
                                    <span className="bg-red-100 px-2 py-1 rounded">SMS: 142 Sent</span>
                                    <span className="bg-red-100 px-2 py-1 rounded">Email: 145 Sent</span>
                                </div>
                            </div>
                            {/* Placeholder for more logs */}
                            <div className="text-center text-slate-400 py-8">
                                No other recent alerts.
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'registry' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-500" />
                        Vulnerable Residents Registry
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-200 text-slate-500 text-sm">
                                    <th className="pb-3 font-medium">Unit</th>
                                    <th className="pb-3 font-medium">Name</th>
                                    <th className="pb-3 font-medium">Type</th>
                                    <th className="pb-3 font-medium">Details</th>
                                    <th className="pb-3 font-medium">Emergency Contact</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {/* Placeholder Data - In real app, fetch from API */}
                                <tr className="group hover:bg-slate-50">
                                    <td className="py-3 text-slate-900 font-medium">101</td>
                                    <td className="py-3 text-slate-700">Max</td>
                                    <td className="py-3"><span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">PET (DOG)</span></td>
                                    <td className="py-3 text-slate-600 text-sm">Golden Retriever, Friendly</td>
                                    <td className="py-3 text-slate-600 text-sm">John Doe (555-0123)</td>
                                </tr>
                                <tr className="group hover:bg-slate-50">
                                    <td className="py-3 text-slate-900 font-medium">205</td>
                                    <td className="py-3 text-slate-700">Sarah Smith</td>
                                    <td className="py-3"><span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">ASSISTANCE</span></td>
                                    <td className="py-3 text-slate-600 text-sm">Wheelchair user, needs elevator</td>
                                    <td className="py-3 text-slate-600 text-sm">Jane Smith (555-0987)</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
