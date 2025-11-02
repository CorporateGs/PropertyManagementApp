"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Home,
  Users,
  DollarSign,
  Wrench,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  Eye,
  Settings,
  Bell,
  Search,
  Filter,
} from "lucide-react";

// Types
interface DashboardStats {
  overview: {
    totalUnits: number;
    occupiedUnits: number;
    vacantUnits: number;
    occupancyRate: number;
    totalTenants: number;
    totalBuildings: number;
  };
  financial: {
    monthlyRevenue: number;
    pendingPayments: number;
    overduePayments: number;
    collectionRate: number;
    averageRent: number;
  };
  maintenance: {
    openRequests: number;
    completedThisMonth: number;
    averageResolutionTime: number;
  };
  trends: {
    occupancyTrend: number[];
    revenueTrend: number[];
    maintenanceTrend: number[];
  };
  recentActivities: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    amount?: number;
    status: string;
    createdAt: string;
    metadata?: Record<string, any>;
  }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard stats from API
  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/dashboard/stats");

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard stats: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      } else {
        throw new Error(data.error?.message || "Failed to fetch dashboard stats");
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchStats();
  }, []);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value}%`;
  };

  // Get trend icon and color
  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (current < previous) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return <div className="h-4 w-4" />;
  };

  // Get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "PAYMENT":
        return <DollarSign className="h-4 w-4" />;
      case "MAINTENANCE":
        return <Wrench className="h-4 w-4" />;
      case "TENANT":
        return <Users className="h-4 w-4" />;
      case "LEASE":
        return <Home className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  // Get activity color
  const getActivityColor = (type: string) => {
    switch (type) {
      case "PAYMENT":
        return "text-green-600";
      case "MAINTENANCE":
        return "text-blue-600";
      case "TENANT":
        return "text-purple-600";
      case "LEASE":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error}
          <Button
            variant="outline"
            size="sm"
            className="ml-4"
            onClick={fetchStats}
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!stats) {
    return (
      <Alert>
        <AlertDescription>
          No data available. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your properties.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Quick Actions
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(stats.overview.occupancyRate)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.overview.occupiedUnits} of {stats.overview.totalUnits} units occupied
            </p>
            <Progress value={stats.overview.occupancyRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.financial.monthlyRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage(stats.financial.collectionRate)} collection rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Maintenance</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.maintenance.openRequests}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.maintenance.completedThisMonth} completed this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.overview.totalTenants}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {stats.overview.totalBuildings} buildings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occupancy Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Occupancy Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.trends.occupancyTrend.map((rate, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">
                    {new Date(Date.now() - (5 - index) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                  <div className="flex items-center gap-2">
                    <Progress value={rate} className="w-24" />
                    <span className="text-sm font-medium w-12 text-right">
                      {formatPercentage(rate)}
                    </span>
                    {getTrendIcon(rate, stats.trends.occupancyTrend[index - 1] || rate)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivities.slice(0, 6).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`p-2 rounded-full bg-muted ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {activity.status}
                      </Badge>
                      {activity.amount && (
                        <span className="text-sm font-medium">
                          {formatCurrency(activity.amount)}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(activity.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => router.push("/tenants")}
            >
              <Users className="h-6 w-6" />
              <span>Manage Tenants</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => router.push("/payments")}
            >
              <DollarSign className="h-6 w-6" />
              <span>Process Payments</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => router.push("/maintenance")}
            >
              <Wrench className="h-6 w-6" />
              <span>Maintenance</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => router.push("/reports")}
            >
              <Settings className="h-6 w-6" />
              <span>Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alerts and Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Payments Alert */}
        {stats.financial.pendingPayments > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>{stats.financial.pendingPayments} payments</strong> are still pending.
              Total amount: {formatCurrency(
                stats.recentActivities
                  .filter(a => a.type === "PAYMENT" && a.status === "PENDING")
                  .reduce((sum, a) => sum + (a.amount || 0), 0)
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Overdue Payments Alert */}
        {stats.financial.overduePayments > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>{stats.financial.overduePayments} payments</strong> are overdue.
              Immediate attention required.
            </AlertDescription>
          </Alert>
        )}

        {/* High Maintenance Load Alert */}
        {stats.maintenance.openRequests > 10 && (
          <Alert>
            <Wrench className="h-4 w-4" />
            <AlertDescription>
              <strong>{stats.maintenance.openRequests} maintenance requests</strong> are currently open.
              Consider scheduling additional staff or contractors.
            </AlertDescription>
          </Alert>
        )}

        {/* High Occupancy Alert */}
        {stats.overview.occupancyRate > 95 && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Excellent! Your properties are <strong>{formatPercentage(stats.overview.occupancyRate)} occupied</strong>.
              Consider rent optimization opportunities.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
