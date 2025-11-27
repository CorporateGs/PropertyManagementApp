"use client";

import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { Zap, TrendingDown, TrendingUp, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EnergyMonitorProps {
    devices: any[];
}

// Simulated historical data (since we don't have a real time-series DB yet)
const generateData = () => {
    const data = [];
    const now = new Date();
    for (let i = 24; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        data.push({
            time: time.getHours() + ':00',
            usage: Math.floor(Math.random() * (60 - 30) + 30), // Random usage between 30-60 kW
            cost: Math.floor(Math.random() * (15 - 8) + 8) // Random cost
        });
    }
    return data;
};

const data = generateData();

export default function EnergyMonitor({ devices }: EnergyMonitorProps) {
    const powerMeters = devices.filter(d => d.deviceType === 'SENSOR' && d.name.includes('Power'));

    // Calculate total current usage
    const currentUsage = powerMeters.reduce((acc, meter) => {
        const state = meter.currentState ? JSON.parse(meter.currentState) : {};
        return acc + (state.power || 0);
    }, 0);

    return (
        <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Real-Time Load</CardTitle>
                        <Zap className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{currentUsage.toFixed(1)} kW</div>
                        <div className="flex items-center text-xs text-emerald-500 mt-1">
                            <TrendingDown className="h-3 w-3 mr-1" />
                            4% below peak
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Daily Cost</CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$142.50</div>
                        <div className="flex items-center text-xs text-slate-500 mt-1">
                            Projected: $185.00
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Efficiency Score</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">94/100</div>
                        <div className="flex items-center text-xs text-emerald-500 mt-1">
                            Top 5% of buildings
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Chart */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle>24-Hour Power Consumption</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="time" stroke="#64748b" />
                                <YAxis stroke="#64748b" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}
                                    itemStyle={{ color: '#eab308' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="usage"
                                    stroke="#eab308"
                                    fillOpacity={1}
                                    fill="url(#colorUsage)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
