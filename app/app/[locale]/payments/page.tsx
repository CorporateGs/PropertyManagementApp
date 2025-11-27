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
import { Plus, Search, Filter, Download, CreditCard, AlertCircle } from "lucide-react";
import { toast } from "sonner";

// Types
interface Payment {
  id: string;
  amount: number;
  paymentType: "RENT" | "SECURITY_DEPOSIT" | "LATE_FEE" | "UTILITY" | "MAINTENANCE" | "PET_FEE" | "PARKING" | "OTHER";
  status: "PENDING" | "PAID" | "LATE" | "PARTIAL" | "FAILED";
  dueDate: string;
  paymentDate?: string;
  method?: "CASH" | "CHECK" | "BANK_TRANSFER" | "CREDIT_CARD" | "ONLINE";
  description?: string;
  tenant: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  unit: {
    id: string;
    unitNumber: string;
    building: {
      id: string;
      name: string;
    };
  };
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  // Fetch payments from API
  const fetchPayments = async () => {
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
      if (typeFilter !== "ALL") {
        params.append("paymentType", typeFilter);
      }

      const response = await fetch(`/api/payments?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch payments: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setPayments(data.data);
      } else {
        throw new Error(data.error?.message || "Failed to fetch payments");
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchPayments();
  }, []);

  // Search and filter with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPayments();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, typeFilter]);

  // Handle mark as paid
  const handleMarkAsPaid = async (paymentId: string) => {
    try {
      const response = await fetch(`/api/payments/${paymentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "PAID",
          paymentDate: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update payment: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        toast.success("Payment marked as paid");
        fetchPayments(); // Refresh the list
      } else {
        throw new Error(data.error?.message || "Failed to update payment");
      }
    } catch (error) {
      console.error("Error updating payment:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update payment");
    }
  };

  // Handle send payment reminder
  const handleSendReminder = async (paymentId: string, tenantEmail: string) => {
    try {
      const response = await fetch("/api/communications/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientId: tenantEmail, // This should be tenant ID, not email
          recipientType: "TENANT",
          type: "EMAIL",
          subject: "Payment Reminder",
          message: "This is a reminder that your payment is due. Please make your payment as soon as possible.",
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send reminder: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        toast.success("Payment reminder sent");
      } else {
        throw new Error(data.error?.message || "Failed to send reminder");
      }
    } catch (error) {
      console.error("Error sending reminder:", error);
      toast.error(error instanceof Error ? error.message : "Failed to send reminder");
    }
  };

  // Handle export payments
  const handleExportPayments = async () => {
    try {
      const response = await fetch("/api/reports/financial/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportType: "PAYMENT_HISTORY",
          format: "CSV",
          dateRange: {
            startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // Last 90 days
            endDate: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to export payments: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        toast.success("Payment report exported successfully");
        // TODO: Trigger download of the exported file
      } else {
        throw new Error(data.error?.message || "Failed to export payments");
      }
    } catch (error) {
      console.error("Error exporting payments:", error);
      toast.error(error instanceof Error ? error.message : "Failed to export payments");
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
      case "PAID":
        return "default";
      case "PENDING":
        return "secondary";
      case "LATE":
        return "destructive";
      case "PARTIAL":
        return "outline";
      case "FAILED":
        return "destructive";
      default:
        return "secondary";
    }
  };

  // Get payment type badge color
  const getPaymentTypeVariant = (type: string) => {
    switch (type) {
      case "RENT":
        return "default";
      case "SECURITY_DEPOSIT":
        return "secondary";
      case "LATE_FEE":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-48" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
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
              onClick={fetchPayments}
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
            <h1 className="text-3xl font-bold">Payments</h1>
            <p className="text-muted-foreground">
              Track and manage tenant payments and payment history
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportPayments}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Record Payment
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(payments
                  .filter(p => p.status === "PAID")
                  .reduce((sum, p) => sum + p.amount, 0)
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {payments.filter(p => p.status === "PENDING").length}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(payments
                  .filter(p => p.status === "PENDING")
                  .reduce((sum, p) => sum + p.amount, 0)
                )} total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {payments.filter(p => p.status === "LATE").length}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(payments
                  .filter(p => p.status === "LATE")
                  .reduce((sum, p) => sum + p.amount, 0)
                )} total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
              <CreditCard className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94.2%</div>
              <p className="text-xs text-muted-foreground">
                +2.1% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search payments by tenant or unit..."
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
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="LATE">Late</SelectItem>
              <SelectItem value="PARTIAL">Partial</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="RENT">Rent</SelectItem>
              <SelectItem value="SECURITY_DEPOSIT">Security Deposit</SelectItem>
              <SelectItem value="LATE_FEE">Late Fee</SelectItem>
              <SelectItem value="UTILITY">Utility</SelectItem>
              <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
              <SelectItem value="PET_FEE">Pet Fee</SelectItem>
              <SelectItem value="PARKING">Parking</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Payments ({payments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {payment.tenant.firstName} {payment.tenant.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {payment.tenant.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {payment.unit.unitNumber}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {payment.unit.building.name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPaymentTypeVariant(payment.paymentType)}>
                        {payment.paymentType.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {formatCurrency(payment.amount)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(payment.dueDate)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(payment.status)}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {payment.status === "PENDING" && (
                          <Button
                            size="sm"
                            onClick={() => handleMarkAsPaid(payment.id)}
                          >
                            Mark Paid
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendReminder(payment.id, payment.tenant.email)}
                        >
                          Remind
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {payments.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No payments found.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
