"use client";

import React, { useState } from 'react';
import { Thermometer, Fan, Power, Plus, Minus, Snowflake, Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface HVACPanelProps {
    devices: any[];
}

export default function HVACPanel({ devices }: HVACPanelProps) {
    const thermostats = devices.filter(d => d.deviceType === 'THERMOSTAT');

    const handleCommand = async (deviceId: string, command: string, parameters: any) => {
        try {
            const res = await fetch(`/api/devices/${deviceId}/command`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command, parameters })
            });

            if (!res.ok) throw new Error('Failed to send command');

            toast.success('Command sent successfully');
        } catch (error) {
            toast.error('Failed to control device');
            console.error(error);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {thermostats.map((device) => {
                const state = device.currentState ? JSON.parse(device.currentState) : {};
                const temp = state.temp || 72;
                const mode = state.mode || 'off';
                const fan = state.fan || 'auto';

                return (
                    <Card key={device.id} className="bg-slate-900 border-slate-800 relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-1 h-full ${mode === 'cool' ? 'bg-blue-500' : mode === 'heat' ? 'bg-orange-500' : 'bg-slate-700'}`} />
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-medium">{device.name}</CardTitle>
                            <Badge variant="outline" className="bg-slate-950">
                                {device.location}
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center justify-center py-6 space-y-6">
                                {/* Temperature Display */}
                                <div className="relative">
                                    <div className="text-6xl font-bold tracking-tighter">
                                        {temp}°
                                    </div>
                                    <div className="absolute -top-4 -right-6">
                                        {mode === 'cool' && <Snowflake className="h-6 w-6 text-blue-500 animate-pulse" />}
                                        {mode === 'heat' && <Flame className="h-6 w-6 text-orange-500 animate-pulse" />}
                                    </div>
                                </div>

                                {/* Controls */}
                                <div className="flex items-center gap-4">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-12 w-12 rounded-full border-slate-700 hover:bg-slate-800"
                                        onClick={() => handleCommand(device.id, 'SET_TEMPERATURE', { temp: temp - 1 })}
                                    >
                                        <Minus className="h-6 w-6" />
                                    </Button>
                                    <div className="text-sm font-medium text-slate-400">SET TEMP</div>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-12 w-12 rounded-full border-slate-700 hover:bg-slate-800"
                                        onClick={() => handleCommand(device.id, 'SET_TEMPERATURE', { temp: temp + 1 })}
                                    >
                                        <Plus className="h-6 w-6" />
                                    </Button>
                                </div>

                                {/* Mode Selectors */}
                                <div className="grid grid-cols-3 gap-2 w-full mt-4">
                                    <Button
                                        variant={mode === 'cool' ? 'default' : 'outline'}
                                        className={mode === 'cool' ? 'bg-blue-600 hover:bg-blue-700' : 'border-slate-700'}
                                        onClick={() => handleCommand(device.id, 'SET_MODE', { mode: 'cool' })}
                                    >
                                        <Snowflake className="h-4 w-4 mr-2" /> Cool
                                    </Button>
                                    <Button
                                        variant={mode === 'heat' ? 'default' : 'outline'}
                                        className={mode === 'heat' ? 'bg-orange-600 hover:bg-orange-700' : 'border-slate-700'}
                                        onClick={() => handleCommand(device.id, 'SET_MODE', { mode: 'heat' })}
                                    >
                                        <Flame className="h-4 w-4 mr-2" /> Heat
                                    </Button>
                                    <Button
                                        variant={mode === 'off' ? 'default' : 'outline'}
                                        className={mode === 'off' ? 'bg-slate-600 hover:bg-slate-700' : 'border-slate-700'}
                                        onClick={() => handleCommand(device.id, 'SET_MODE', { mode: 'off' })}
                                    >
                                        <Power className="h-4 w-4 mr-2" /> Off
                                    </Button>
                                </div>

                                {/* Fan Control */}
                                <div className="flex items-center justify-between w-full pt-4 border-t border-slate-800">
                                    <div className="flex items-center text-slate-400">
                                        <Fan className={`h-4 w-4 mr-2 ${fan === 'on' ? 'animate-spin' : ''}`} />
                                        <span className="text-sm">Fan Mode</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant={fan === 'auto' ? 'secondary' : 'ghost'}
                                            onClick={() => handleCommand(device.id, 'SET_FAN', { fan: 'auto' })}
                                        >
                                            Auto
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant={fan === 'on' ? 'secondary' : 'ghost'}
                                            onClick={() => handleCommand(device.id, 'SET_FAN', { fan: 'on' })}
                                        >
                                            On
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
