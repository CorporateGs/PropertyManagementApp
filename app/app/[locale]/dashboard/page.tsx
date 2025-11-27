"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Users,
  Building,
  CreditCard,
  TrendingUp,
  Activity,
  BarChart3,
  PieChart,
  Settings,
  DollarSign,
  Calendar,
  FileText,
  Home,
  Bot,
  Wrench
} from "lucide-react";

export default function Dashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    totalBuildings: 0,
    totalUnits: 0,
    totalTenants: 0,
    occupiedUnits: 0,
    totalRevenue: 0,
    pendingMaintenance: 0,
    upcomingPayments: 0,
    averageRent: 0,
    occupancyRate: 0,
    newTenantsThisMonth: 0,
    totalProperties: 0,
    recentActivity: [
      { type: "New Tenant", description: "John Doe signed lease for Unit 2A", timestamp: "2 hours ago" },
      { type: "Payment", description: "Jane Smith paid rent for Unit 3B", timestamp: "4 hours ago" },
      { type: "Maintenance", description: "AC repair completed for Unit 1C", timestamp: "6 hours ago" }
    ],
    chartData: {
      revenue: [],
      maintenance: [],
      occupancy: []
    }
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats");
      const data = await response.json();
      const defaultStats = {
        totalBuildings: 5,
        totalUnits: 42,
        totalTenants: 38,
        occupiedUnits: 35,
        totalRevenue: 85000,
        pendingMaintenance: 3,
        upcomingPayments: 12,
        averageRent: 2250,
        occupancyRate: 83,
        newTenantsThisMonth: 4,
        totalProperties: 85,
        recentActivity: [
          { type: "New Tenant", description: "John Doe signed lease for Unit 2A", timestamp: "2 hours ago" },
          { type: "Payment", description: "Jane Smith paid rent for Unit 3B", timestamp: "4 hours ago" },
          { type: "Maintenance", description: "AC repair completed for Unit 1C", timestamp: "6 hours ago" }
        ],
        chartData: {
          revenue: [],
          maintenance: [],
          occupancy: []
        }
      };
      setStats(data.data ? {
        ...defaultStats,
        ...data.data,
        recentActivity: data.data.recentActivity || defaultStats.recentActivity,
        chartData: data.data.chartData || defaultStats.chartData
      } : defaultStats);
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            Dashboard
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Welcome back, <span className="font-semibold text-blue-600 dark:text-blue-400">{session?.user?.name || 'User'}</span>! Here's your property portfolio at a glance.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md p-2 rounded-full shadow-sm border border-white/20 dark:border-gray-700">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-emerald-100/80 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 backdrop-blur-sm">
            <Activity className="w-4 h-4 mr-2 animate-pulse" />
            System Online
          </span>
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-blue-100/80 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 backdrop-blur-sm">
            <Bot className="w-4 h-4 mr-2" />
            AI Agents Active
          </span>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/ai-orders/new" className="group relative overflow-hidden p-6 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02]">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
            <Bot className="w-32 h-32 text-white transform rotate-12 translate-x-4 -translate-y-4" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between text-white mb-4">
              <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md shadow-inner">
                <Bot className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold bg-white/20 px-2 py-1 rounded-full backdrop-blur-md tracking-wider">NEW</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Order AI Service</h3>
            <p className="text-indigo-100 text-sm font-medium opacity-90">Deploy chatbots & agents instantly.</p>
          </div>
        </Link>

        <Link href="/buildings/sample-building/emergency" className="group relative overflow-hidden p-6 bg-gradient-to-br from-rose-500 to-orange-600 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02]">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
            <TrendingUp className="w-32 h-32 text-white transform rotate-12 translate-x-4 -translate-y-4" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between text-white mb-4">
              <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md shadow-inner">
                <TrendingUp className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold bg-white/20 px-2 py-1 rounded-full backdrop-blur-md tracking-wider">URGENT</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Emergency Center</h3>
            <p className="text-rose-100 text-sm font-medium opacity-90">Broadcast alerts & check registry.</p>
          </div>
        </Link>

        <Link href="/buildings/sample-building/automation" className="group relative overflow-hidden p-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02]">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
            <Activity className="w-32 h-32 text-white transform rotate-12 translate-x-4 -translate-y-4" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between text-white mb-4">
              <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md shadow-inner">
                <Activity className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold bg-white/20 px-2 py-1 rounded-full backdrop-blur-md tracking-wider">LIVE</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Building Automation</h3>
            <p className="text-cyan-100 text-sm font-medium opacity-90">Control HVAC, Security & Energy.</p>
          </div>
        </Link>

        <Link href="/admin/vendors" className="group relative overflow-hidden p-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02]">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
            <Users className="w-32 h-32 text-white transform rotate-12 translate-x-4 -translate-y-4" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between text-white mb-4">
              <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md shadow-inner">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold bg-white/20 px-2 py-1 rounded-full backdrop-blur-md tracking-wider">AUTO</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Vendor Compliance</h3>
            <p className="text-emerald-100 text-sm font-medium opacity-90">Track insurance & WSIB status.</p>
          </div>
        </Link>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Stats Cards */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="glass-card p-6 rounded-2xl hover:shadow-2xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">+2 this month</span>
              </div>
              <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{stats.totalBuildings}</h3>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Buildings</p>
            </div>
            
            <div className="glass-card p-6 rounded-2xl hover:shadow-2xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Home className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-xs font-bold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">Capacity</span>
              </div>
              <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{stats.totalUnits}</h3>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Units</p>
            </div>
            
            <div className="glass-card p-6 rounded-2xl hover:shadow-2xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">+{stats.newTenantsThisMonth} new</span>
              </div>
              <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{stats.totalTenants}</h3>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Tenants</p>
            </div>
            
            <div className="glass-card p-6 rounded-2xl hover:shadow-2xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${stats.occupancyRate >= 90 ? 'text-green-600 bg-green-50 border-green-100' : 'text-yellow-600 bg-yellow-50 border-yellow-100'}`}>
                  {stats.occupancyRate >= 90 ? 'Excellent' : 'Good'}
                </span>
              </div>
              <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{stats.occupancyRate}%</h3>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Occupancy Rate</p>
            </div>
            
            <div className="glass-card p-6 rounded-2xl hover:shadow-2xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-100">{stats.pendingMaintenance} pending</span>
              </div>
              <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">${new Intl.NumberFormat().format(stats.totalRevenue)}</h3>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="lg:col-span-2 glass-card p-8 rounded-2xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Revenue Overview</h2>
                <p className="text-sm text-gray-500 mt-1">Monthly revenue performance</p>
              </div>
              <select aria-label="Revenue period" className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm p-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-shadow">
                <option>This Year</option>
                <option>Last Year</option>
              </select>
            </div>
            <div className="h-80 bg-gradient-to-b from-gray-50/50 to-white/50 dark:from-gray-800/50 dark:to-gray-900/50 rounded-2xl p-6 flex items-end justify-between gap-3 border border-gray-100 dark:border-gray-800">
              {/* Mock Chart Bars - In real app use Recharts or Chart.js */}
              {[35, 45, 40, 50, 60, 55, 65, 70, 60, 75, 80, 85].map((h, i) => (
                <div key={i} className="w-full bg-blue-100/50 dark:bg-blue-900/20 rounded-t-lg relative group h-full flex items-end overflow-hidden">
                  <div 
                    className="w-full bg-gradient-to-t from-blue-600 to-indigo-500 dark:from-blue-600 dark:to-indigo-500 rounded-t-lg transition-all duration-500 hover:opacity-90 relative"
                    style={{ height: `${h}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-xl transition-all duration-300 whitespace-nowrap z-20 pointer-events-none">
                    ${h}k
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-6 text-xs font-semibold text-gray-400 dark:text-gray-500 px-2 uppercase tracking-wider">
              <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
              <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="glass-card p-8 rounded-2xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
                <p className="text-sm text-gray-500 mt-1">Latest system updates</p>
              </div>
              <Link href="/activity" className="text-sm text-blue-600 hover:text-blue-700 font-bold hover:underline decoration-2 underline-offset-4">View All</Link>
            </div>
            <div className="space-y-8">
              {(stats.recentActivity || []).slice(0, 5).map((activity, index) => (
                <div key={index} className="flex gap-5 group relative">
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center border border-gray-100 dark:border-gray-700 shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-300 group-hover:border-blue-200 dark:group-hover:border-blue-800">
                      {activity.type === 'Payment' && <DollarSign className="w-6 h-6 text-green-600" />}
                      {activity.type === 'New Tenant' && <Users className="w-6 h-6 text-blue-600" />}
                      {activity.type === 'Maintenance' && <Wrench className="w-6 h-6 text-orange-600" />}
                    </div>
                    {index !== (stats.recentActivity || []).length - 1 && (
                      <div className="absolute top-12 left-1/2 w-0.5 h-full bg-gray-100 dark:bg-gray-800 -ml-px -z-10" />
                    )}
                  </div>
                  <div className="flex-1 pb-2 pt-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{activity.type}</h4>
                      <span className="text-xs font-medium text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-full">{activity.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{activity.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
      </div>
    </div>
  );
}
