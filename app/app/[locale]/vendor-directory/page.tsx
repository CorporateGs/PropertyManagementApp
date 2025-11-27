'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wrench, Star, Phone, Mail, MapPin, DollarSign, Calendar, CheckCircle, Clock, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function VendorDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const vendors = [
    {
      id: 1,
      name: 'ABC Plumbing Services',
      category: 'Plumbing',
      rating: 4.8,
      reviews: 45,
      phone: '555-0201',
      email: 'contact@abcplumbing.com',
      address: '123 Main St, City',
      services: ['Emergency Repairs', 'Installations', 'Maintenance'],
      hourlyRate: 85,
      availability: 'Available',
      lastUsed: '2024-01-15',
      totalJobs: 12,
      verified: true,
    },
    {
      id: 2,
      name: 'Elite HVAC Solutions',
      category: 'HVAC',
      rating: 4.9,
      reviews: 67,
      phone: '555-0202',
      email: 'info@elitehvac.com',
      address: '456 Oak Ave, City',
      services: ['AC Repair', 'Heating', 'Duct Cleaning', 'Installation'],
      hourlyRate: 95,
      availability: 'Available',
      lastUsed: '2024-01-10',
      totalJobs: 18,
      verified: true,
    },
    {
      id: 3,
      name: 'Bright Spark Electrical',
      category: 'Electrical',
      rating: 4.7,
      reviews: 38,
      phone: '555-0203',
      email: 'service@brightspark.com',
      address: '789 Elm St, City',
      services: ['Wiring', 'Panel Upgrades', 'Lighting', 'Emergency Service'],
      hourlyRate: 90,
      availability: 'Busy',
      lastUsed: '2024-01-08',
      totalJobs: 15,
      verified: true,
    },
    {
      id: 4,
      name: 'Green Thumb Landscaping',
      category: 'Landscaping',
      rating: 4.6,
      reviews: 52,
      phone: '555-0204',
      email: 'hello@greenthumb.com',
      address: '321 Pine Rd, City',
      services: ['Lawn Care', 'Snow Removal', 'Garden Design', 'Tree Service'],
      hourlyRate: 65,
      availability: 'Available',
      lastUsed: '2024-01-05',
      totalJobs: 24,
      verified: true,
    },
    {
      id: 5,
      name: 'Clean Pro Janitorial',
      category: 'Cleaning',
      rating: 4.5,
      reviews: 89,
      phone: '555-0205',
      email: 'info@cleanpro.com',
      address: '654 Maple Dr, City',
      services: ['Common Area Cleaning', 'Window Washing', 'Carpet Cleaning', 'Deep Cleaning'],
      hourlyRate: 45,
      availability: 'Available',
      lastUsed: '2024-01-20',
      totalJobs: 36,
      verified: true,
    },
    {
      id: 6,
      name: 'SecureGuard Security',
      category: 'Security',
      rating: 4.8,
      reviews: 31,
      phone: '555-0206',
      email: 'contact@secureguard.com',
      address: '987 Cedar Ln, City',
      services: ['Security Systems', 'Camera Installation', 'Access Control', 'Monitoring'],
      hourlyRate: 75,
      availability: 'Available',
      lastUsed: '2023-12-28',
      totalJobs: 8,
      verified: true,
    },
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'hvac', label: 'HVAC' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'landscaping', label: 'Landscaping' },
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'security', label: 'Security' },
    { value: 'painting', label: 'Painting' },
    { value: 'roofing', label: 'Roofing' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendor Directory</h1>
          <p className="mt-2 text-gray-600">
            Manage and find trusted service providers
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Wrench className="mr-2 h-4 w-4" />
              Add Vendor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Vendor</DialogTitle>
              <DialogDescription>Register a new service provider</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input placeholder="Enter company name" />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(c => c.value !== 'all').map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input placeholder="555-0000" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="contact@vendor.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input placeholder="Street address" />
              </div>
              <div className="space-y-2">
                <Label>Services Offered</Label>
                <Input placeholder="Comma-separated list of services" />
              </div>
              <div className="space-y-2">
                <Label>Hourly Rate ($)</Label>
                <Input type="number" placeholder="0.00" />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline">Cancel</Button>
                <Button>Add Vendor</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search vendors by name or service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map((vendor) => (
          <Card key={vendor.id} className="hover:shadow-lg transition-all">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <span>{vendor.name}</span>
                    {vendor.verified && (
                      <CheckCircle className="h-4 w-4 text-blue-600" title="Verified Vendor" />
                    )}
                  </CardTitle>
                  <CardDescription>{vendor.category}</CardDescription>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{vendor.rating}</span>
                  <span className="text-sm text-gray-500">({vendor.reviews})</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{vendor.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{vendor.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{vendor.address}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  <span>${vendor.hourlyRate}/hour</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold mb-2">Services:</p>
                <div className="flex flex-wrap gap-1">
                  {vendor.services.map((service, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className={`px-2 py-1 rounded-full ${
                  vendor.availability === 'Available'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {vendor.availability}
                </span>
                <span className="text-gray-600">{vendor.totalJobs} jobs completed</span>
              </div>

              <div className="flex space-x-2">
                <Button className="flex-1" size="sm">
                  <Phone className="mr-2 h-4 w-4" />
                  Contact
                </Button>
                <Button variant="outline" className="flex-1" size="sm">
                  View Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Rated Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {vendors
                .sort((a, b) => b.rating - a.rating)
                .slice(0, 3)
                .map((vendor) => (
                  <div key={vendor.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{vendor.name}</p>
                      <p className="text-xs text-gray-600">{vendor.category}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold">{vendor.rating}</span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Most Used Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {vendors
                .sort((a, b) => b.totalJobs - a.totalJobs)
                .slice(0, 3)
                .map((vendor) => (
                  <div key={vendor.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{vendor.name}</p>
                      <p className="text-xs text-gray-600">{vendor.category}</p>
                    </div>
                    <span className="text-sm font-semibold">{vendor.totalJobs} jobs</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Vendors</span>
              <span className="font-semibold">{vendors.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Verified Vendors</span>
              <span className="font-semibold">{vendors.filter(v => v.verified).length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Available Now</span>
              <span className="font-semibold">
                {vendors.filter(v => v.availability === 'Available').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg Rating</span>
              <span className="font-semibold">
                {(vendors.reduce((acc, v) => acc + v.rating, 0) / vendors.length).toFixed(1)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
