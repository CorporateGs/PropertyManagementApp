
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/dashboard/stats-card';
import { RecentActivities } from '@/components/dashboard/recent-activities';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Home,
  Users,
  Building,
  DollarSign,
  AlertCircle,
  Wrench,
  TrendingUp,
} from 'lucide-react';

interface DashboardStats {
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  totalTenants: number;
  pendingPayments: number;
  pendingMaintenance: number;
  totalRevenue: number;
  occupancyRate: number;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
  user?: string;
  priority?: 'low' | 'medium' | 'high' | 'emergency';
}

export function DashboardClient() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, activitiesRes] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/dashboard/activities'),
        ]);

        if (!statsRes.ok || !activitiesRes.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const statsData = await statsRes.json();
        const activitiesData = await activitiesRes.json();

        setStats(statsData);
        setActivities(activitiesData.activities?.map((activity: any) => ({
          ...activity,
          timestamp: new Date(activity.timestamp),
        })) || []);
      } catch (err) {
        console.error('Dashboard error:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        <div className="grid gap-6 mb-8 lg:grid-cols-4 md:grid-cols-2">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Property Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Overview of your property management operations
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 mb-8 lg:grid-cols-4 md:grid-cols-2">
        <StatsCard
          title="Total Units"
          value={stats?.totalUnits || 0}
          icon={Building}
          description="All units in the property"
        />
        <StatsCard
          title="Occupied Units"
          value={stats?.occupiedUnits || 0}
          icon={Home}
          description={`${stats?.occupancyRate || 0}% occupancy rate`}
        />
        <StatsCard
          title="Total Tenants"
          value={stats?.totalTenants || 0}
          icon={Users}
          description="Active tenant accounts"
        />
        <StatsCard
          title="Total Revenue"
          value={`$${(stats?.totalRevenue || 0).toLocaleString()}`}
          icon={DollarSign}
          description="Collected payments"
        />
        <StatsCard
          title="Vacant Units"
          value={stats?.vacantUnits || 0}
          icon={Building}
          description="Available for rent"
          className={stats?.vacantUnits ? 'border-yellow-200' : ''}
        />
        <StatsCard
          title="Pending Payments"
          value={stats?.pendingPayments || 0}
          icon={AlertCircle}
          description="Awaiting payment"
          className={stats?.pendingPayments ? 'border-red-200' : ''}
        />
        <StatsCard
          title="Maintenance Requests"
          value={stats?.pendingMaintenance || 0}
          icon={Wrench}
          description="Open requests"
          className={stats?.pendingMaintenance ? 'border-orange-200' : ''}
        />
        <StatsCard
          title="Occupancy Rate"
          value={`${stats?.occupancyRate || 0}%`}
          icon={TrendingUp}
          description="Current occupancy"
        />
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentActivities activities={activities} />
        </div>

        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <button 
                onClick={() => router.push('/tenants')}
                className="flex items-center p-3 text-left hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
              >
                <Users className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <div className="font-medium">Add New Tenant</div>
                  <div className="text-sm text-gray-500">Register a new tenant</div>
                </div>
              </button>
              <button 
                onClick={() => router.push('/maintenance')}
                className="flex items-center p-3 text-left hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
              >
                <Wrench className="h-5 w-5 text-orange-600 mr-3" />
                <div>
                  <div className="font-medium">Create Maintenance Request</div>
                  <div className="text-sm text-gray-500">Report an issue</div>
                </div>
              </button>
              <button 
                onClick={() => router.push('/payments')}
                className="flex items-center p-3 text-left hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
              >
                <DollarSign className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <div className="font-medium">Record Payment</div>
                  <div className="text-sm text-gray-500">Log tenant payment</div>
                </div>
              </button>
            </CardContent>
          </Card>

          {/* Alerts */}
          {((stats?.pendingPayments ?? 0) > 0 || (stats?.pendingMaintenance ?? 0) > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-amber-700">Attention Required</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(stats?.pendingPayments ?? 0) > 0 && (
                  <div className="flex items-center p-2 bg-red-50 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                    <span className="text-sm text-red-700">
                      {stats?.pendingPayments ?? 0} pending payment{(stats?.pendingPayments ?? 0) !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
                {(stats?.pendingMaintenance ?? 0) > 0 && (
                  <div className="flex items-center p-2 bg-orange-50 rounded-lg">
                    <Wrench className="h-4 w-4 text-orange-600 mr-2" />
                    <span className="text-sm text-orange-700">
                      {stats?.pendingMaintenance ?? 0} pending maintenance request{(stats?.pendingMaintenance ?? 0) !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
