"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Filter, Wrench, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

// Types
interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  category: "PLUMBING" | "ELECTRICAL" | "HVAC" | "APPLIANCE" | "STRUCTURAL" | "PEST_CONTROL" | "LANDSCAPING" | "SECURITY" | "OTHER";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | "EMERGENCY";
  status: "OPEN" | "IN_PROGRESS" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
  estimatedCost?: number;
  actualCost?: number;
  scheduledDate?: string;
  completedDate?: string;
  unit: {
    id: string;
    unitNumber: string;
    building: {
      id: string;
      name: string;
    };
  };
  tenant: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  assignedStaff?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  vendor?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}

export default function MaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");

  // Fetch maintenance requests from API
  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchTerm) {
        params.append("search", searchTerm);
      }
      if (statusFilter !== "ALL") {
        params.append("status", statusFilter);
      }
      if (priorityFilter !== "ALL") {
        params.append("priority", priorityFilter);
      }

      const response = await fetch(`/api/maintenance?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch maintenance requests: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setRequests(data.data);
      } else {
        throw new Error(data.error?.message || "Failed to fetch maintenance requests");
      }
    } catch (error) {
      console.error("Error fetching maintenance requests:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch maintenance requests");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchRequests();
  }, []);

  // Search and filter with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRequests();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, priorityFilter]);

  // Handle status update
  const handleStatusUpdate = async (requestId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/maintenance/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          ...(newStatus === "COMPLETED" && {
            completedDate: new Date().toISOString(),
          }),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update maintenance request: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        toast.success("Maintenance request updated successfully");
        fetchRequests(); // Refresh the list
      } else {
        throw new Error(data.error?.message || "Failed to update maintenance request");
      }
    } catch (error) {
      console.error("Error updating maintenance request:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update maintenance request");
    }
  };

  // Handle AI cost estimation
  const handleAICostEstimation = async (requestId: string) => {
    try {
      const response = await fetch("/api/ai/predictive-maintenance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          equipmentType: "HVAC", // This should be derived from the maintenance request
          unitId: requests.find(r => r.id === requestId)?.unit.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get AI cost estimation: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        toast.success(`AI estimated cost: $${data.data.maintenanceCost}`);
      } else {
        throw new Error(data.error?.message || "Failed to get AI cost estimation");
      }
    } catch (error) {
      console.error("Error getting AI cost estimation:", error);
      toast.error(error instanceof Error ? error.message : "Failed to get AI cost estimation");
    }
  };

  // Format currency
  const formatCurrency = (amount?: number) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "OPEN":
        return "secondary";
      case "IN_PROGRESS":
        return "default";
      case "ON_HOLD":
        return "outline";
      case "COMPLETED":
        return "default";
      case "CANCELLED":
        return "destructive";
      default:
        return "secondary";
    }
  };

  // Get priority badge variant
  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "EMERGENCY":
        return "destructive";
      case "URGENT":
        return "destructive";
      case "HIGH":
        return "outline";
      case "MEDIUM":
        return "secondary";
      case "LOW":
        return "outline";
      default:
        return "secondary";
    }
  };

  // Get priority icon
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "EMERGENCY":
      case "URGENT":
      case "HIGH":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertDescription>
            {error}
            <Button
              variant="outline"
              size="sm"
              className="ml-4"
              onClick={fetchRequests}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Maintenance</h1>
            <p className="text-muted-foreground">
              Track and manage maintenance requests and repairs
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Requests</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {requests.filter(r => r.status === "OPEN").length}
              </div>
              <p className="text-xs text-muted-foreground">
                {requests.filter(r => r.status === "IN_PROGRESS").length} in progress
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Priority</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {requests.filter(r => r.priority === "HIGH" || r.priority === "URGENT" || r.priority === "EMERGENCY").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Require immediate attention
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {requests.filter(r => r.status === "COMPLETED").length}
              </div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Resolution</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.2</div>
              <p className="text-xs text-muted-foreground">
                Days to complete
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search maintenance requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="ON_HOLD">On Hold</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Priorities</SelectItem>
              <SelectItem value="EMERGENCY">Emergency</SelectItem>
              <SelectItem value="URGENT">Urgent</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Maintenance Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Maintenance Requests ({requests.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {request.category.replace("_", " ")}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {request.unit.unitNumber}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {request.unit.building.name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {request.tenant.firstName} {request.tenant.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {request.tenant.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityVariant(request.priority)}>
                        {getPriorityIcon(request.priority)}
                        <span className="ml-1">{request.priority}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(request.status)}>
                        {request.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Est: {formatCurrency(request.estimatedCost)}</div>
                        {request.actualCost && (
                          <div className="text-muted-foreground">
                            Act: {formatCurrency(request.actualCost)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Select
                          value={request.status}
                          onValueChange={(value) => handleStatusUpdate(request.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="OPEN">Open</SelectItem>
                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                            <SelectItem value="ON_HOLD">On Hold</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAICostEstimation(request.id)}
                        >
                          AI Estimate
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {requests.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No maintenance requests found.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
