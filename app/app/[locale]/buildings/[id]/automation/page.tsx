"use client";

import React, { useState } from 'react';
import useSWR from 'swr';
import { useParams } from 'next/navigation';
import {
    LayoutDashboard,
    Thermometer,
    Shield,
    Zap,
    Activity,
    AlertTriangle,
    RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import HVACPanel from '@/components/iot/hvac-panel';
import SecurityFeed from '@/components/iot/security-feed';
import EnergyMonitor from '@/components/iot/energy-monitor';

// Fetcher function
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AutomationDashboard() {
    const params = useParams();
    const buildingId = params.id as string;
    const [activeTab, setActiveTab] = useState('overview');

    // Poll every 2 seconds for "real-time" updates
    const { data, error, isLoading, mutate } = useSWR(
        `/api/buildings/${buildingId}/iot`,
        fetcher,
        { refreshInterval: 2000 }
    );

    if (isLoading && !data) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-950 text-white">
                <div className="text-center">
                    <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-500" />
                    <h2 className="text-xl font-semibold">Connecting to Building Systems...</h2>
                    <p className="text-slate-400">Establishing secure link to IoT gateway</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 bg-slate-950 min-h-screen text-white">
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Connection Error</AlertTitle>
                    <AlertDescription>
                        Failed to connect to building automation systems. Please check your network connection.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const { systems = [], emergencyAlerts = [] } = data || {};

    // Calculate system statuses
    const totalSystems = systems.length;
    const onlineSystems = systems.filter((s: any) => s.status === 'ONLINE').length;
    const activeAlerts = systems.reduce((acc: number, s: any) => acc + s.alerts.length, 0);

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                        Building Automation Command Center
                    </h1>
                    <p className="text-slate-400 mt-1">
                        Real-time monitoring and control for Tech Plaza One
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-full border border-slate-800">
                        <div className={`h-2 w-2 rounded-full ${onlineSystems === totalSystems ? 'bg-emerald-500 animate-pulse' : 'bg-yellow-500'}`} />
                        <span className="text-sm font-medium">
                            {onlineSystems}/{totalSystems} Systems Online
                        </span>
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => mutate()}
                        className="bg-slate-900 border-slate-800 hover:bg-slate-800"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Emergency Alerts Banner */}
            {emergencyAlerts.length > 0 && (
                <div className="space-y-2">
                    {emergencyAlerts.map((alert: any) => (
                        <Alert key={alert.id} variant="destructive" className="bg-red-950/50 border-red-900 text-red-200">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle className="font-bold">{alert.title}</AlertTitle>
                            <AlertDescription>{alert.message}</AlertDescription>
                        </Alert>
                    ))}
                </div>
            )}

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-slate-900 border border-slate-800 p-1">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="hvac" className="data-[state=active]:bg-blue-600">
                        <Thermometer className="h-4 w-4 mr-2" />
                        HVAC
                    </TabsTrigger>
                    <TabsTrigger value="security" className="data-[state=active]:bg-blue-600">
                        <Shield className="h-4 w-4 mr-2" />
                        Security
                    </TabsTrigger>
                    <TabsTrigger value="energy" className="data-[state=active]:bg-blue-600">
                        <Zap className="h-4 w-4 mr-2" />
                        Energy
                    </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* System Status Cards */}
                        <Card className="bg-slate-900 border-slate-800">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-400">Active Alerts</CardTitle>
                                <AlertTriangle className={`h-4 w-4 ${activeAlerts > 0 ? 'text-red-500' : 'text-slate-500'}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{activeAlerts}</div>
                                <p className="text-xs text-slate-500">Critical system warnings</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-900 border-slate-800">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-400">Energy Usage</CardTitle>
                                <Zap className="h-4 w-4 text-yellow-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">45.2 kW</div>
                                <p className="text-xs text-emerald-500">-12% vs last week</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-900 border-slate-800">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-400">Avg Temperature</CardTitle>
                                <Thermometer className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">71.5°F</div>
                                <p className="text-xs text-slate-500">Optimal range</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Systems Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {systems.map((system: any) => (
                            <Card key={system.id} className="bg-slate-900 border-slate-800 hover:border-blue-500/50 transition-colors cursor-pointer" onClick={() => setActiveTab(system.systemType.toLowerCase())}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg">{system.name}</CardTitle>
                                        <Badge variant={system.status === 'ONLINE' ? 'default' : 'destructive'} className={system.status === 'ONLINE' ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : ''}>
                                            {system.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Type</span>
                                            <span>{system.systemType}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Devices</span>
                                            <span>{system.devices.length}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Manufacturer</span>
                                            <span>{system.manufacturer}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* HVAC Tab */}
                <TabsContent value="hvac">
                    <HVACPanel devices={systems.find((s: any) => s.systemType === 'HVAC')?.devices || []} />
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security">
                    <SecurityFeed devices={systems.find((s: any) => s.systemType === 'SECURITY')?.devices || []} />
                </TabsContent>

                {/* Energy Tab */}
                <TabsContent value="energy">
                    <EnergyMonitor devices={systems.find((s: any) => s.systemType === 'ENERGY')?.devices || []} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
