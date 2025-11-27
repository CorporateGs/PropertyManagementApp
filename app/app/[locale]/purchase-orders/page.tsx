'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, FileText, DollarSign, Clock, CheckCircle, AlertTriangle, Search, Filter } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function PurchaseOrdersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const purchaseOrders = [
    {
      id: 'PO-2024-001',
      vendor: 'ABC Plumbing Services',
      description: 'Emergency plumbing repairs - Unit 305',
      amount: 850.00,
      status: 'Approved',
      dateCreated: '2024-01-20',
      dateNeeded: '2024-01-25',
      approvedBy: 'John Smith',
      category: 'Maintenance',
      priority: 'High',
      items: [
        { description: 'Pipe replacement', quantity: 2, unitPrice: 125.00 },
        { description: 'Labor - 4 hours', quantity: 4, unitPrice: 150.00 },
      ],
    },
    {
      id: 'PO-2024-002',
      vendor: 'Elite HVAC Solutions',
      description: 'Annual HVAC maintenance contract',
      amount: 2400.00,
      status: 'Pending Approval',
      dateCreated: '2024-01-18',
      dateNeeded: '2024-02-01',
      approvedBy: null,
      category: 'Contract',
      priority: 'Medium',
      items: [
        { description: 'Annual maintenance contract', quantity: 1, unitPrice: 2400.00 },
      ],
    },
    {
      id: 'PO-2024-003',
      vendor: 'Green Thumb Landscaping',
      description: 'Spring landscaping and garden maintenance',
      amount: 1200.00,
      status: 'Completed',
      dateCreated: '2024-01-15',
      dateNeeded: '2024-01-30',
      approvedBy: 'Sarah Johnson',
      category: 'Landscaping',
      priority: 'Low',
      items: [
        { description: 'Garden maintenance', quantity: 1, unitPrice: 800.00 },
        { description: 'Plant materials', quantity: 1, unitPrice: 400.00 },
      ],
    },
    {
      id: 'PO-2024-004',
      vendor: 'SecureGuard Security',
      description: 'Security camera system upgrade',
      amount: 3500.00,
      status: 'Draft',
      dateCreated: '2024-01-22',
      dateNeeded: '2024-02-15',
      approvedBy: null,
      category: 'Security',
      priority: 'Medium',
      items: [
        { description: 'Security cameras (4x)', quantity: 4, unitPrice: 250.00 },
        { description: 'Installation and setup', quantity: 1, unitPrice: 2500.00 },
      ],
    },
  ];

  const statusCertificates = [
    {
      id: 'SC-2024-001',
      unitNumber: '305',
      requestedBy: 'John & Sarah Smith',
      purpose: 'Mortgage Refinancing',
      status: 'Completed',
      dateRequested: '2024-01-20',
      dateCompleted: '2024-01-22',
      fee: 75.00,
      deliveryMethod: 'Email',
    },
    {
      id: 'SC-2024-002',
      unitNumber: '1204',
      requestedBy: 'Michael Chen',
      purpose: 'Property Sale',
      status: 'In Progress',
      dateRequested: '2024-01-21',
      dateCompleted: null,
      fee: 100.00,
      deliveryMethod: 'Mail',
    },
    {
      id: 'SC-2024-003',
      unitNumber: '708',
      requestedBy: 'Emily Davis',
      purpose: 'Insurance Claim',
      status: 'Pending Review',
      dateRequested: '2024-01-23',
      dateCompleted: null,
      fee: 75.00,
      deliveryMethod: 'Email',
    },
  ];

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Approved':
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Pending Approval':
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Draft':
      case 'Pending Review':
        return 'bg-gray-100 text-gray-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
      case 'Completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Pending Approval':
      case 'In Progress':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'Draft':
      case 'Pending Review':
        return <FileText className="h-4 w-4 text-gray-600" />;
      case 'Rejected':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Purchase Orders & Status Certificates</h1>
        <p className="mt-2 text-gray-600">
          Manage purchase orders and track status certificate requests
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Purchase Orders</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Create PO
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Create Purchase Order</DialogTitle>
                  <DialogDescription>Create a new purchase order for goods or services</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Vendor</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vendor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="abc-plumbing">ABC Plumbing Services</SelectItem>
                          <SelectItem value="elite-hvac">Elite HVAC Solutions</SelectItem>
                          <SelectItem value="green-thumb">Green Thumb Landscaping</SelectItem>
                          <SelectItem value="secureguard">SecureGuard Security</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="landscaping">Landscaping</SelectItem>
                          <SelectItem value="security">Security</SelectItem>
                          <SelectItem value="supplies">Supplies</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input placeholder="Brief description of the purchase order" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date Needed</Label>
                      <Input type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Additional Notes</Label>
                    <Textarea placeholder="Any additional information or requirements" rows={3} />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline">Save as Draft</Button>
                    <Button>Create PO</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search purchase orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-4">
            {purchaseOrders.map((po) => (
              <Card key={po.id} className="hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      {getStatusIcon(po.status)}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{po.id}</h3>
                        <p className="text-sm text-gray-600 mb-1">{po.description}</p>
                        <p className="text-sm text-gray-600">Vendor: {po.vendor}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(po.status)}`}>
                        {po.status}
                      </span>
                      <span className="text-lg font-bold">${po.amount.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-600">Created:</span>
                      <span className="ml-2 font-semibold">{po.dateCreated}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Needed by:</span>
                      <span className="ml-2 font-semibold">{po.dateNeeded}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Category:</span>
                      <span className="ml-2 font-semibold">{po.category}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Priority:</span>
                      <span className={`ml-2 font-semibold ${
                        po.priority === 'High' ? 'text-red-600' : 
                        po.priority === 'Medium' ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {po.priority}
                      </span>
                    </div>
                  </div>

                  {po.approvedBy && (
                    <div className="mb-4 text-sm">
                      <span className="text-gray-600">Approved by:</span>
                      <span className="ml-2 font-semibold">{po.approvedBy}</span>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                    {po.status === 'Draft' && (
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                    )}
                    {po.status === 'Pending Approval' && (
                      <Button size="sm">
                        Approve
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Status Certificates</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <FileText className="mr-2 h-4 w-4" />
                  New Request
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Status Certificate Request</DialogTitle>
                  <DialogDescription>Process a new status certificate request</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Unit Number</Label>
                      <Input placeholder="e.g., 305" />
                    </div>
                    <div className="space-y-2">
                      <Label>Requested By</Label>
                      <Input placeholder="Owner name" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Purpose</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select purpose" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sale">Property Sale</SelectItem>
                        <SelectItem value="refinancing">Mortgage Refinancing</SelectItem>
                        <SelectItem value="insurance">Insurance Claim</SelectItem>
                        <SelectItem value="legal">Legal Proceedings</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Delivery Method</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select delivery" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="mail">Regular Mail</SelectItem>
                          <SelectItem value="pickup">Pickup</SelectItem>
                          <SelectItem value="courier">Courier</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Fee</Label>
                      <Input type="number" placeholder="75.00" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Additional Notes</Label>
                    <Textarea placeholder="Any special requirements or notes" rows={3} />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline">Cancel</Button>
                    <Button>Create Request</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {statusCertificates.map((cert) => (
              <Card key={cert.id} className="hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      {getStatusIcon(cert.status)}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{cert.id}</h3>
                        <p className="text-sm text-gray-600 mb-1">Unit {cert.unitNumber}</p>
                        <p className="text-sm text-gray-600">{cert.requestedBy}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(cert.status)}`}>
                        {cert.status}
                      </span>
                      <span className="text-lg font-bold">${cert.fee.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-600">Purpose:</span>
                      <span className="ml-2 font-semibold">{cert.purpose}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Delivery:</span>
                      <span className="ml-2 font-semibold">{cert.deliveryMethod}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Requested:</span>
                      <span className="ml-2 font-semibold">{cert.dateRequested}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Completed:</span>
                      <span className="ml-2 font-semibold">
                        {cert.dateCompleted || 'Pending'}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                    {cert.status === 'Completed' && (
                      <Button size="sm" variant="outline">
                        Download
                      </Button>
                    )}
                    {cert.status !== 'Completed' && (
                      <Button size="sm">
                        Process
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">PO Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total POs</span>
              <span className="font-semibold">{purchaseOrders.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pending Approval</span>
              <span className="font-semibold">
                {purchaseOrders.filter(po => po.status === 'Pending Approval').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Value</span>
              <span className="font-semibold">
                ${purchaseOrders.reduce((sum, po) => sum + po.amount, 0).toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Certificate Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Requests</span>
              <span className="font-semibold">{statusCertificates.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">In Progress</span>
              <span className="font-semibold">
                {statusCertificates.filter(cert => cert.status === 'In Progress').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Revenue</span>
              <span className="font-semibold">
                ${statusCertificates.reduce((sum, cert) => sum + cert.fee, 0).toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <DollarSign className="mr-2 h-4 w-4" />
              Budget Report
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Export Data
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Filter className="mr-2 h-4 w-4" />
              Advanced Filters
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}