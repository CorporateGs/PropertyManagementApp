'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, AlertTriangle, CheckCircle, Clock, FileText, Search, Filter } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

export default function ComplianceTrackingPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const complianceItems = [
    {
      id: 1,
      title: 'Fire Safety Inspection',
      category: 'Safety',
      status: 'Compliant',
      lastChecked: '2024-01-15',
      nextDue: '2024-07-15',
      responsible: 'Building Management',
      priority: 'High',
      description: 'Annual fire safety system inspection and certification',
      documents: ['Fire Safety Certificate', 'Inspection Report'],
    },
    {
      id: 2,
      title: 'Elevator Maintenance',
      category: 'Safety',
      status: 'Due Soon',
      lastChecked: '2023-12-20',
      nextDue: '2024-01-30',
      responsible: 'Elevator Company',
      priority: 'High',
      description: 'Monthly elevator safety inspection and maintenance',
      documents: ['Maintenance Log', 'Safety Certificate'],
    },
    {
      id: 3,
      title: 'Pool Chemical Testing',
      category: 'Health',
      status: 'Overdue',
      lastChecked: '2024-01-10',
      nextDue: '2024-01-20',
      responsible: 'Pool Service',
      priority: 'Medium',
      description: 'Weekly pool water chemical balance testing',
      documents: ['Chemical Test Results'],
    },
    {
      id: 4,
      title: 'Insurance Policy Review',
      category: 'Legal',
      status: 'Compliant',
      lastChecked: '2024-01-01',
      nextDue: '2025-01-01',
      responsible: 'Insurance Broker',
      priority: 'High',
      description: 'Annual insurance policy review and renewal',
      documents: ['Insurance Policy', 'Coverage Summary'],
    },
    {
      id: 5,
      title: 'Noise Complaint Resolution',
      category: 'Community',
      status: 'In Progress',
      lastChecked: '2024-01-18',
      nextDue: '2024-01-25',
      responsible: 'Property Manager',
      priority: 'Medium',
      description: 'Follow up on noise complaint from Unit 402',
      documents: ['Complaint Form', 'Resolution Plan'],
    },
    {
      id: 6,
      title: 'Financial Audit',
      category: 'Financial',
      status: 'Scheduled',
      lastChecked: '2023-12-31',
      nextDue: '2024-03-31',
      responsible: 'External Auditor',
      priority: 'High',
      description: 'Annual financial audit and reporting',
      documents: ['Audit Schedule', 'Financial Statements'],
    },
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'safety', label: 'Safety' },
    { value: 'health', label: 'Health' },
    { value: 'legal', label: 'Legal' },
    { value: 'financial', label: 'Financial' },
    { value: 'community', label: 'Community Rules' },
    { value: 'environmental', label: 'Environmental' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Compliant':
        return 'bg-green-100 text-green-800';
      case 'Due Soon':
        return 'bg-yellow-100 text-yellow-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Scheduled':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Compliant':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Due Soon':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'Overdue':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'In Progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'Scheduled':
        return <Clock className="h-4 w-4 text-purple-600" />;
      default:
        return <Shield className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compliance Tracking</h1>
          <p className="mt-2 text-gray-600">
            Monitor regulatory compliance and community rules
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Shield className="mr-2 h-4 w-4" />
              Add Compliance Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Compliance Item</DialogTitle>
              <DialogDescription>Create a new compliance tracking item</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input placeholder="e.g., Fire Safety Inspection" />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Next Due Date</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Responsible Party</Label>
                  <Input placeholder="Who is responsible" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input placeholder="Brief description of compliance requirement" />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="recurring" />
                <label htmlFor="recurring" className="text-sm cursor-pointer">
                  Recurring compliance item
                </label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline">Cancel</Button>
                <Button>Add Item</Button>
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
              placeholder="Search compliance items..."
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {complianceItems.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      {getStatusIcon(item.status)}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{item.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Category: {item.category}</span>
                          <span>Responsible: {item.responsible}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        item.priority === 'High' || item.priority === 'Critical' 
                          ? 'bg-red-100 text-red-800' 
                          : item.priority === 'Medium' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {item.priority} Priority
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-600">Last Checked:</span>
                      <span className="ml-2 font-semibold">{item.lastChecked}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Next Due:</span>
                      <span className="ml-2 font-semibold">{item.nextDue}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-semibold mb-2">Related Documents:</p>
                    <div className="flex flex-wrap gap-2">
                      {item.documents.map((doc, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center"
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                    <Button size="sm" variant="outline">
                      Update Status
                    </Button>
                    <Button size="sm">
                      Mark Complete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Compliance Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Compliant</span>
                </div>
                <span className="font-semibold">
                  {complianceItems.filter(item => item.status === 'Compliant').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">Due Soon</span>
                </div>
                <span className="font-semibold">
                  {complianceItems.filter(item => item.status === 'Due Soon').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm">Overdue</span>
                </div>
                <span className="font-semibold">
                  {complianceItems.filter(item => item.status === 'Overdue').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">In Progress</span>
                </div>
                <span className="font-semibold">
                  {complianceItems.filter(item => item.status === 'In Progress').length}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {complianceItems
                  .filter(item => item.status === 'Due Soon' || item.status === 'Overdue')
                  .sort((a, b) => new Date(a.nextDue) - new Date(b.nextDue))
                  .map((item) => (
                    <div key={item.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm">{item.title}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">Due: {item.nextDue}</p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <AlertTriangle className="mr-2 h-4 w-4" />
                View Violations
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="mr-2 h-4 w-4" />
                Compliance Calendar
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Filter className="mr-2 h-4 w-4" />
                Advanced Filters
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}