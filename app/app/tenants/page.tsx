"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

// Types
interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: "ACTIVE" | "INACTIVE" | "PENDING";
  leaseStartDate: string;
  leaseEndDate: string;
  monthlyRent: number;
  unit: {
    id: string;
    unitNumber: string;
    building: {
      id: string;
      name: string;
    };
  };
  payments: Array<{
    id: string;
    amount: number;
    status: "PENDING" | "PAID" | "LATE" | "PARTIAL" | "FAILED";
    dueDate: string;
  }>;
}

interface TenantFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  unitId: string;
  leaseStartDate: string;
  leaseEndDate: string;
  monthlyRent: number;
  securityDeposit: number;
}

export default function TenantsPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [formData, setFormData] = useState<TenantFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    unitId: "",
    leaseStartDate: "",
    leaseEndDate: "",
    monthlyRent: 0,
    securityDeposit: 0,
  });

  // Fetch tenants from API
  const fetchTenants = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const response = await fetch(`/api/tenants?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch tenants: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setTenants(data.data);
      } else {
        throw new Error(data.error?.message || "Failed to fetch tenants");
      }
    } catch (error) {
      console.error("Error fetching tenants:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch tenants");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchTenants();
  }, []);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTenants();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle create tenant
  const handleCreateTenant = async () => {
    try {
      const response = await fetch("/api/tenants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create tenant: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        toast.success("Tenant created successfully");
        setIsCreateDialogOpen(false);
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          unitId: "",
          leaseStartDate: "",
          leaseEndDate: "",
          monthlyRent: 0,
          securityDeposit: 0,
        });
        fetchTenants(); // Refresh the list
      } else {
        throw new Error(data.error?.message || "Failed to create tenant");
      }
    } catch (error) {
      console.error("Error creating tenant:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create tenant");
    }
  };

  // Handle delete tenant
  const handleDeleteTenant = async () => {
    if (!selectedTenant) return;

    try {
      const response = await fetch(`/api/tenants/${selectedTenant.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete tenant: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        toast.success("Tenant deleted successfully");
        setIsDeleteDialogOpen(false);
        setSelectedTenant(null);
        fetchTenants(); // Refresh the list
      } else {
        throw new Error(data.error?.message || "Failed to delete tenant");
      }
    } catch (error) {
      console.error("Error deleting tenant:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete tenant");
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "default";
      case "INACTIVE":
        return "secondary";
      case "PENDING":
        return "outline";
      default:
        return "secondary";
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
              onClick={fetchTenants}
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
            <h1 className="text-3xl font-bold">Tenants</h1>
            <p className="text-muted-foreground">
              Manage your property tenants and lease information
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Tenant
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Tenant</DialogTitle>
                <DialogDescription>
                  Create a new tenant record. Make sure the unit is available before adding.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-sm font-medium">
                      First Name
                    </label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-sm font-medium">
                      Last Name
                    </label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="john.doe@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    Phone (Optional)
                  </label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="unitId" className="text-sm font-medium">
                    Unit ID
                  </label>
                  <Input
                    id="unitId"
                    value={formData.unitId}
                    onChange={(e) =>
                      setFormData({ ...formData, unitId: e.target.value })
                    }
                    placeholder="unit_123"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="leaseStartDate" className="text-sm font-medium">
                      Lease Start Date
                    </label>
                    <Input
                      id="leaseStartDate"
                      type="date"
                      value={formData.leaseStartDate}
                      onChange={(e) =>
                        setFormData({ ...formData, leaseStartDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="leaseEndDate" className="text-sm font-medium">
                      Lease End Date
                    </label>
                    <Input
                      id="leaseEndDate"
                      type="date"
                      value={formData.leaseEndDate}
                      onChange={(e) =>
                        setFormData({ ...formData, leaseEndDate: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="monthlyRent" className="text-sm font-medium">
                      Monthly Rent
                    </label>
                    <Input
                      id="monthlyRent"
                      type="number"
                      value={formData.monthlyRent}
                      onChange={(e) =>
                        setFormData({ ...formData, monthlyRent: Number(e.target.value) })
                      }
                      placeholder="2500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="securityDeposit" className="text-sm font-medium">
                      Security Deposit
                    </label>
                    <Input
                      id="securityDeposit"
                      type="number"
                      value={formData.securityDeposit}
                      onChange={(e) =>
                        setFormData({ ...formData, securityDeposit: Number(e.target.value) })
                      }
                      placeholder="2500"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="button" onClick={handleCreateTenant}>
                  Create Tenant
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tenants by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Tenants Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Tenants ({tenants.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Lease Period</TableHead>
                  <TableHead>Rent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {tenant.firstName} {tenant.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {tenant.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {tenant.unit.unitNumber}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {tenant.unit.building.name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatDate(tenant.leaseStartDate)}</div>
                        <div className="text-muted-foreground">
                          to {formatDate(tenant.leaseEndDate)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {formatCurrency(tenant.monthlyRent)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(tenant.status)}>
                        {tenant.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/tenants/${tenant.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/tenants/${tenant.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog
                          open={isDeleteDialogOpen && selectedTenant?.id === tenant.id}
                          onOpenChange={(open) => {
                            setIsDeleteDialogOpen(open);
                            if (!open) setSelectedTenant(null);
                          }}
                        >
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedTenant(tenant)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Tenant</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {tenant.firstName} {tenant.lastName}?
                                This action cannot be undone and will remove all associated data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDeleteTenant}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {tenants.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No tenants found. Add your first tenant to get started.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
