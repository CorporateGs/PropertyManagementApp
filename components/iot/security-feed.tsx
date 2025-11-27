"use client";

import React from 'react';
import { Lock, Unlock, Video, AlertCircle, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface SecurityFeedProps {
    devices: any[];
}

export default function SecurityFeed({ devices }: SecurityFeedProps) {
    const cameras = devices.filter(d => d.deviceType === 'CAMERA');
    const locks = devices.filter(d => d.deviceType === 'DOOR_LOCK');

    const handleCommand = async (deviceId: string, command: string) => {
        try {
            const res = await fetch(`/api/devices/${deviceId}/command`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command })
            });

            if (!res.ok) throw new Error('Failed to send command');

            toast.success(`Command ${command} sent successfully`);
        } catch (error) {
            toast.error('Failed to control device');
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Cameras Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {cameras.map((camera) => {
                    const state = camera.currentState ? JSON.parse(camera.currentState) : {};
                    const isRecording = state.recording;

                    return (
                        <Card key={camera.id} className="bg-slate-900 border-slate-800 overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-slate-950/50">
                                <div className="flex items-center gap-2">
                                    <Video className="h-4 w-4 text-slate-400" />
                                    <CardTitle className="text-base">{camera.name}</CardTitle>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isRecording && (
                                        <Badge variant="destructive" className="animate-pulse">REC</Badge>
                                    )}
                                    <Badge variant="outline" className="bg-slate-950 text-emerald-500 border-emerald-900">
                                        LIVE
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 relative aspect-video bg-black group">
                                {/* Simulated Feed Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/20 group-hover:bg-transparent transition-colors">
                                    {/* Placeholder for actual video stream */}
                                    <div className="text-slate-600 text-sm flex flex-col items-center">
                                        <ShieldCheck className="h-12 w-12 mb-2 opacity-20" />
                                        <span>Secure Feed: {camera.location}</span>
                                    </div>
                                </div>

                                {/* Timestamp Overlay */}
                                <div className="absolute bottom-2 right-2 text-xs font-mono text-white/70 bg-black/50 px-2 py-1 rounded">
                                    {new Date().toLocaleTimeString()}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Access Control */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {locks.map((lock) => {
                    const state = lock.currentState ? JSON.parse(lock.currentState) : {};
                    const isLocked = state.locked;

                    return (
                        <Card key={lock.id} className="bg-slate-900 border-slate-800">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg font-medium">{lock.name}</CardTitle>
                                <Badge variant={isLocked ? 'default' : 'destructive'} className={isLocked ? 'bg-emerald-600' : 'bg-red-600'}>
                                    {isLocked ? 'SECURE' : 'UNLOCKED'}
                                </Badge>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col items-center py-4 space-y-4">
                                    <div className={`p-4 rounded-full ${isLocked ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {isLocked ? <Lock className="h-8 w-8" /> : <Unlock className="h-8 w-8" />}
                                    </div>
                                    <div className="text-sm text-slate-400">
                                        {lock.location} Access Point
                                    </div>
                                    <Button
                                        variant={isLocked ? 'destructive' : 'default'}
                                        className="w-full"
                                        onClick={() => handleCommand(lock.id, isLocked ? 'UNLOCK' : 'LOCK')}
                                    >
                                        {isLocked ? 'Unlock Door' : 'Lock Door'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
