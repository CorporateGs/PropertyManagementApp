'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Home, FileText, MessageSquare, Wrench, Calendar, Package, CreditCard, Bell, Download, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function ResidentPortalPage() {
  const [selectedRequest, setSelectedRequest] = useState('');

  const residentInfo = {
    name: 'John & Sarah Smith',
    unit: '305',
    building: 'Tower A',
    moveInDate: '2022-03-15',
    email: 'smith.family@email.com',
    phone: '555-0123',
    emergencyContact: 'Mike Smith - 555-0124',
  };

  const maintenanceRequests = [
    {
      id: 1,
      title: 'Kitchen Faucet Leak',
      category: 'Plumbing',
      priority: 'Medium',
      status: 'In Progress',
      dateSubmitted: '2024-01-20',
      description: 'Kitchen faucet has been dripping for 3 days',
      assignedTo: 'ABC Plumbing',
      estimatedCompletion: '2024-01-25',
    },
    {
      id: 2,
      title: 'AC Not Cooling',
      category: 'HVAC',
      priority: 'High',
      status: 'Scheduled',
      dateSubmitted: '2024-01-18',
      description: 'Air conditioning unit not cooling properly',
      assignedTo: 'Elite HVAC',
      estimatedCompletion: '2024-01-22',
    },
    {
      id: 3,
      title: 'Balcony Door Lock',
      category: 'Security',
      priority: 'Low',
      status: 'Completed',
      dateSubmitted: '2024-01-10',
      description: 'Balcony door lock is sticking',
      assignedTo: 'Building Maintenance',
      completedDate: '2024-01-15',
    },
  ];

  const documents = [
    { id: 1, name: 'Building Bylaws', type: 'PDF', size: '2.3 MB', lastUpdated: '2024-01-15' },
    { id: 2, name: 'House Rules', type: 'PDF', size: '1.8 MB', lastUpdated: '2024-01-10' },
    { id: 3, name: 'Emergency Procedures', type: 'PDF', size: '1.2 MB', lastUpdated: '2023-12-20' },
    { id: 4, name: 'Amenity Guidelines', type: 'PDF', size: '950 KB', lastUpdated: '2023-12-15' },
  ];

  const announcements = [
    {
      id: 1,
      title: 'Pool Maintenance Schedule',
      date: '2024-01-22',
      priority: 'Medium',
      content: 'The pool will be closed for maintenance from Jan 25-27. We apologize for any inconvenience.',
    },
    {
      id: 2,
      title: 'New Parking Regulations',
      date: '2024-01-20',
      priority: 'High',
      content: 'New visitor parking rules are now in effect. Please review the updated guidelines.',
    },
    {
      id: 3,
      title: 'Community Event - Movie Night',
      date: '2024-01-18',
      priority: 'Low',
      content: 'Join us for movie night in the community room this Friday at 7 PM.',
    },
  ];

  const payments = [
    { id: 1, description: 'Monthly Maintenance Fee', amount: 450, dueDate: '2024-02-01', status: 'Pending' },
    { id: 2, description: 'Special Assessment - Roof Repair', amount: 1200, dueDate: '2024-01-31', status: 'Paid' },
    { id: 3, description: 'Monthly Maintenance Fee', amount: 450, dueDate: '2024-01-01', status: 'Paid' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Resident Portal</h1>
        <p className="mt-2 text-gray-600">
          Welcome back, {residentInfo.name} - Unit {residentInfo.unit}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Maintenance Requests</CardTitle>
                  <CardDescription>Track your service requests</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Wrench className="mr-2 h-4 w-4" />
                      New Request
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Submit Maintenance Request</DialogTitle>
                      <DialogDescription>Describe the issue you're experiencing</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Request Title</Label>
                        <Input placeholder="Brief description of the issue" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="plumbing">Plumbing</SelectItem>
                              <SelectItem value="electrical">Electrical</SelectItem>
                              <SelectItem value="hvac">HVAC</SelectItem>
                              <SelectItem value="appliance">Appliance</SelectItem>
                              <SelectItem value="security">Security</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
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
                              <SelectItem value="emergency">Emergency</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea placeholder="Detailed description of the issue" rows={4} />
                      </div>
                      <div className="space-y-2">
                        <Label>Photos (Optional)</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="mt-2 text-sm text-gray-600">Click to upload photos</p>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline">Cancel</Button>
                        <Button>Submit Request</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {maintenanceRequests.map((request) => (
                  <Card key={request.id} className="hover:shadow-md transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{request.title}</h4>
                          <p className="text-sm text-gray-600">{request.category}</p>
                        </div>
                        <div className="flex space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            request.priority === 'High' ? 'bg-red-100 text-red-800' :
                            request.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {request.priority}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            request.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            request.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {request.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{request.description}</p>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Assigned to: {request.assignedTo}</span>
                        <span>
                          {request.status === 'Completed' 
                            ? `Completed: ${request.completedDate}`
                            : `Est. completion: ${request.estimatedCompletion}`
                          }
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Building Announcements</CardTitle>
              <CardDescription>Important updates and notices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold">{announcement.title}</h4>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          announcement.priority === 'High' ? 'bg-red-100 text-red-800' :
                          announcement.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {announcement.priority}
                        </span>
                        <span className="text-sm text-gray-500">{announcement.date}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{announcement.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Building Documents</CardTitle>
              <CardDescription>Access important building documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="font-semibold">{doc.name}</p>
                        <p className="text-sm text-gray-600">{doc.size} • Updated {doc.lastUpdated}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Unit Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                <Home className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-semibold">Unit {residentInfo.unit}</p>
                  <p className="text-sm text-gray-600">{residentInfo.building}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Move-in Date:</span>
                  <span>{residentInfo.moveInDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="truncate">{residentInfo.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span>{residentInfo.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Emergency Contact:</span>
                  <span className="text-xs">{residentInfo.emergencyContact}</span>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4">
                Update Information
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div key={payment.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">{payment.description}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        payment.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold">${payment.amount}</span>
                      <span className="text-gray-600">Due: {payment.dueDate}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4">
                <CreditCard className="mr-2 h-4 w-4" />
                Make Payment
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Book Amenity
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Package className="mr-2 h-4 w-4" />
                Package Tracking
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="mr-2 h-4 w-4" />
                Contact Management
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Bell className="mr-2 h-4 w-4" />
                Notification Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}