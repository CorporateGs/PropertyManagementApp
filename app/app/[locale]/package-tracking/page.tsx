'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, CheckCircle, Clock, AlertCircle, Truck, Bell, QrCode, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function PackageTrackingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('all');

  const packages = [
    {
      id: 'PKG-2024-001',
      recipient: 'John Smith',
      unit: '305',
      building: 'Maple Heights',
      carrier: 'UPS',
      trackingNumber: '1Z999AA10123456784',
      status: 'Ready for Pickup',
      arrivedDate: '2024-01-20 10:30 AM',
      notified: true,
      pickedUp: false,
      size: 'Medium',
      requiresSignature: false,
    },
    {
      id: 'PKG-2024-002',
      recipient: 'Sarah Johnson',
      unit: '412',
      building: 'Maple Heights',
      carrier: 'FedEx',
      trackingNumber: '771234567890',
      status: 'Picked Up',
      arrivedDate: '2024-01-19 2:15 PM',
      notified: true,
      pickedUp: true,
      pickedUpDate: '2024-01-19 6:45 PM',
      size: 'Small',
      requiresSignature: true,
    },
    {
      id: 'PKG-2024-003',
      recipient: 'Michael Chen',
      unit: '208',
      building: 'Riverside Apartments',
      carrier: 'Amazon',
      trackingNumber: 'TBA123456789',
      status: 'Ready for Pickup',
      arrivedDate: '2024-01-20 3:45 PM',
      notified: true,
      pickedUp: false,
      size: 'Large',
      requiresSignature: false,
    },
    {
      id: 'PKG-2024-004',
      recipient: 'Emily Davis',
      unit: '501',
      building: 'Downtown Towers',
      carrier: 'USPS',
      trackingNumber: '9400111899562123456789',
      status: 'Pending Notification',
      arrivedDate: '2024-01-20 4:20 PM',
      notified: false,
      pickedUp: false,
      size: 'Small',
      requiresSignature: false,
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Ready for Pickup':
        return <Package className="h-5 w-5 text-green-600" />;
      case 'Picked Up':
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case 'Pending Notification':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ready for Pickup':
        return 'bg-green-100 text-green-800';
      case 'Picked Up':
        return 'bg-blue-100 text-blue-800';
      case 'Pending Notification':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Package & Delivery Tracking</h1>
        <p className="mt-2 text-gray-600">
          Manage incoming packages and notify residents
        </p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by unit, recipient, or tracking number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Filter by building" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Buildings</SelectItem>
            <SelectItem value="building1">Maple Heights</SelectItem>
            <SelectItem value="building2">Riverside Apartments</SelectItem>
            <SelectItem value="building3">Downtown Towers</SelectItem>
          </SelectContent>
        </Select>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Package className="mr-2 h-4 w-4" />
              Log New Package
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Log New Package</DialogTitle>
              <DialogDescription>Record a new package arrival</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Building</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select building" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="building1">Maple Heights</SelectItem>
                      <SelectItem value="building2">Riverside Apartments</SelectItem>
                      <SelectItem value="building3">Downtown Towers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Unit Number</Label>
                  <Input placeholder="e.g., 305" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Recipient Name</Label>
                <Input placeholder="Enter recipient name" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Carrier</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select carrier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ups">UPS</SelectItem>
                      <SelectItem value="fedex">FedEx</SelectItem>
                      <SelectItem value="usps">USPS</SelectItem>
                      <SelectItem value="amazon">Amazon</SelectItem>
                      <SelectItem value="dhl">DHL</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Package Size</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                      <SelectItem value="oversized">Oversized</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tracking Number (Optional)</Label>
                <Input placeholder="Enter tracking number" />
              </div>

              <div className="space-y-2">
                <Label>Special Instructions</Label>
                <Input placeholder="e.g., Requires signature, Fragile" />
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="notify" className="rounded" />
                <label htmlFor="notify" className="text-sm cursor-pointer">
                  Send notification to resident immediately
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline">Cancel</Button>
                <Button>Log Package</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Awaiting Pickup</p>
                <p className="text-3xl font-bold text-green-600">
                  {packages.filter(p => p.status === 'Ready for Pickup').length}
                </p>
              </div>
              <Package className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Picked Up Today</p>
                <p className="text-3xl font-bold text-blue-600">
                  {packages.filter(p => p.status === 'Picked Up').length}
                </p>
              </div>
              <CheckCircle className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Notification</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {packages.filter(p => !p.notified).length}
                </p>
              </div>
              <Clock className="h-10 w-10 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total This Week</p>
                <p className="text-3xl font-bold text-gray-900">{packages.length}</p>
              </div>
              <Truck className="h-10 w-10 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Package Log</CardTitle>
          <CardDescription>All incoming packages and deliveries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {packages.map((pkg) => (
              <Card key={pkg.id} className="hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="p-3 bg-gray-100 rounded-lg">
                        {getStatusIcon(pkg.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">{pkg.recipient}</h3>
                          <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(pkg.status)}`}>
                            {pkg.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-semibold">Unit:</span> {pkg.unit}
                          </div>
                          <div>
                            <span className="font-semibold">Building:</span> {pkg.building}
                          </div>
                          <div>
                            <span className="font-semibold">Carrier:</span> {pkg.carrier}
                          </div>
                          <div>
                            <span className="font-semibold">Size:</span> {pkg.size}
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          <div>
                            <span className="font-semibold">Tracking:</span> {pkg.trackingNumber}
                          </div>
                          <div>
                            <span className="font-semibold">Arrived:</span> {pkg.arrivedDate}
                          </div>
                          {pkg.pickedUp && pkg.pickedUpDate && (
                            <div>
                              <span className="font-semibold">Picked Up:</span> {pkg.pickedUpDate}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2 ml-4">
                      {!pkg.notified && (
                        <Button size="sm" variant="outline">
                          <Bell className="mr-2 h-4 w-4" />
                          Notify
                        </Button>
                      )}
                      {!pkg.pickedUp && pkg.notified && (
                        <Button size="sm">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark Picked Up
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <QrCode className="mr-2 h-4 w-4" />
                        QR Code
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Configure automatic notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Auto-notify on arrival</p>
                <p className="text-sm text-gray-600">Send notification when package is logged</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Daily pickup reminders</p>
                <p className="text-sm text-gray-600">Remind residents of pending packages</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">SMS notifications</p>
                <p className="text-sm text-gray-600">Send text messages for urgent packages</p>
              </div>
              <input type="checkbox" className="rounded" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Package Statistics</CardTitle>
            <CardDescription>Delivery insights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average Pickup Time</span>
              <span className="font-semibold">4.2 hours</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Most Active Carrier</span>
              <span className="font-semibold">Amazon</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Packages This Month</span>
              <span className="font-semibold">247</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pickup Rate</span>
              <span className="font-semibold">98.5%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
