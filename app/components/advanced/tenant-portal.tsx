
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Home, 
  CreditCard, 
  MessageCircle, 
  Wrench, 
  FileText, 
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Settings,
  Bell,
  Download,
  Upload,
  Star,
  MapPin
} from 'lucide-react';

const mockTenant = {
  firstName: 'Sarah',
  lastName: 'Johnson',
  email: 'sarah.johnson@email.com',
  phone: '(555) 123-4567',
  unit: '205',
  leaseStart: '2023-08-01',
  leaseEnd: '2024-07-31',
  rentAmount: 2750,
  balanceOwed: 0,
  lastPayment: '2024-01-01'
};

const mockPayments = [
  { id: '1', date: '2024-01-01', amount: 2750, status: 'Paid', method: 'ACH Transfer' },
  { id: '2', date: '2023-12-01', amount: 2750, status: 'Paid', method: 'ACH Transfer' },
  { id: '3', date: '2023-11-01', amount: 2750, status: 'Paid', method: 'Check' },
];

const mockMaintenanceRequests = [
  {
    id: '1',
    title: 'Kitchen Faucet Dripping',
    description: 'The kitchen faucet has been dripping for the past week',
    status: 'In Progress',
    priority: 'Medium',
    submitted: '2024-01-15',
    category: 'Plumbing',
    photos: []
  },
  {
    id: '2',
    title: 'AC Unit Making Noise',
    description: 'Unusual noise from AC unit in living room',
    status: 'Completed',
    priority: 'High',
    submitted: '2023-12-20',
    completed: '2023-12-22',
    category: 'HVAC'
  }
];

const mockCommunications = [
  {
    id: '1',
    type: 'Email',
    subject: 'Lease Renewal Discussion',
    content: 'Hi Sarah, we\'d like to discuss your lease renewal options...',
    timestamp: '2024-01-10 09:30 AM',
    from: 'Property Manager',
    status: 'Read'
  },
  {
    id: '2',
    type: 'SMS',
    subject: 'Maintenance Update',
    content: 'Your maintenance request #1 has been assigned to our technician.',
    timestamp: '2024-01-15 02:15 PM',
    from: 'System',
    status: 'Read'
  }
];

export function TenantPortal() {
  const [newMaintenanceRequest, setNewMaintenanceRequest] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    category: 'General',
    allowEntry: false
  });

  const [newMessage, setNewMessage] = useState('');

  const handleSubmitMaintenance = () => {
    // Handle maintenance request submission
    console.log('Submitting maintenance request:', newMaintenanceRequest);
    setNewMaintenanceRequest({
      title: '',
      description: '',
      priority: 'Medium',
      category: 'General',
      allowEntry: false
    });
  };

  const handleSendMessage = () => {
    // Handle message submission
    console.log('Sending message:', newMessage);
    setNewMessage('');
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback>SJ</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {mockTenant.firstName}!</h1>
              <p className="opacity-90">Unit {mockTenant.unit} • Sunset Apartments</p>
              <p className="text-sm opacity-75">
                <MapPin className="inline h-4 w-4 mr-1" />
                123 Main Street, San Francisco, CA
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-75">Lease Expires</p>
            <p className="text-xl font-bold">{new Date(mockTenant.leaseEnd).toLocaleDateString()}</p>
            <p className="text-sm opacity-75">6 months remaining</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Balance Owed</p>
              <p className="text-xl font-bold">${mockTenant.balanceOwed.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Next Payment</p>
              <p className="text-xl font-bold">Feb 1</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Wrench className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Open Requests</p>
              <p className="text-xl font-bold">1</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MessageCircle className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Unread Messages</p>
              <p className="text-xl font-bold">0</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="payments" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="payments">
            <CreditCard className="h-4 w-4 mr-2" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="maintenance">
            <Wrench className="h-4 w-4 mr-2" />
            Maintenance
          </TabsTrigger>
          <TabsTrigger value="communications">
            <MessageCircle className="h-4 w-4 mr-2" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="h-4 w-4 mr-2" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="profile">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Form */}
            <Card>
              <CardHeader>
                <CardTitle>Make a Payment</CardTitle>
                <CardDescription>
                  Pay your rent securely online
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Monthly Rent</span>
                    <span className="text-2xl font-bold text-green-600">
                      ${mockTenant.rentAmount.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Due: 1st of each month</p>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Payment Amount</label>
                    <Input type="number" placeholder="2750.00" />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Payment Method</label>
                    <select className="w-full p-2 border rounded-md">
                      <option>Bank Transfer (ACH) - Free</option>
                      <option>Debit Card - $2.95 fee</option>
                      <option>Credit Card - 2.95% fee</option>
                    </select>
                  </div>
                </div>
                
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => alert('Payment processing would be integrated with payment gateway')}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay Now
                </Button>
                
                <p className="text-xs text-gray-500 text-center">
                  Secure payment processing • PCI Compliant • 256-bit encryption
                </p>
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>
                  Your recent payment activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">${payment.amount.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">{payment.method}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{new Date(payment.date).toLocaleDateString()}</p>
                        <Badge variant="secondary">{payment.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => alert('Payment history download would generate PDF report')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Payment History
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Submit Request */}
            <Card>
              <CardHeader>
                <CardTitle>Submit Maintenance Request</CardTitle>
                <CardDescription>
                  Report an issue or request maintenance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Issue Title</label>
                  <Input
                    placeholder="Brief description of the issue"
                    value={newMaintenanceRequest.title}
                    onChange={(e) => setNewMaintenanceRequest({
                      ...newMaintenanceRequest,
                      title: e.target.value
                    })}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={newMaintenanceRequest.category}
                      onChange={(e) => setNewMaintenanceRequest({
                        ...newMaintenanceRequest,
                        category: e.target.value
                      })}
                    >
                      <option>Plumbing</option>
                      <option>Electrical</option>
                      <option>HVAC</option>
                      <option>Appliances</option>
                      <option>General</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Priority</label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={newMaintenanceRequest.priority}
                      onChange={(e) => setNewMaintenanceRequest({
                        ...newMaintenanceRequest,
                        priority: e.target.value
                      })}
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                      <option>Emergency</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Please provide detailed information about the issue..."
                    rows={4}
                    value={newMaintenanceRequest.description}
                    onChange={(e) => setNewMaintenanceRequest({
                      ...newMaintenanceRequest,
                      description: e.target.value
                    })}
                  />
                </div>
                
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Upload photos (optional)
                  </p>
                  <p className="text-xs text-gray-500">
                    JPG, PNG up to 10MB each
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="allowEntry"
                    checked={newMaintenanceRequest.allowEntry}
                    onChange={(e) => setNewMaintenanceRequest({
                      ...newMaintenanceRequest,
                      allowEntry: e.target.checked
                    })}
                  />
                  <label htmlFor="allowEntry" className="text-sm">
                    Allow entry to unit if I'm not home
                  </label>
                </div>
                
                <Button className="w-full" onClick={handleSubmitMaintenance}>
                  <Wrench className="h-4 w-4 mr-2" />
                  Submit Request
                </Button>
              </CardContent>
            </Card>

            {/* Request History */}
            <Card>
              <CardHeader>
                <CardTitle>My Requests</CardTitle>
                <CardDescription>
                  Track your maintenance requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockMaintenanceRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{request.title}</h4>
                          <p className="text-sm text-gray-600">{request.description}</p>
                        </div>
                        <Badge variant={request.status === 'Completed' ? 'secondary' : 'default'}>
                          {request.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <span className="text-gray-500">
                            Submitted: {new Date(request.submitted).toLocaleDateString()}
                          </span>
                          {request.completed && (
                            <span className="text-green-600">
                              Completed: {new Date(request.completed).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <Badge variant="outline">{request.priority}</Badge>
                      </div>
                      
                      {request.status === 'In Progress' && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>60%</span>
                          </div>
                          <Progress value={60} className="h-2" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="communications" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Send Message */}
            <Card>
              <CardHeader>
                <CardTitle>Send Message</CardTitle>
                <CardDescription>
                  Contact your property management team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Type your message here..."
                  rows={6}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Attach File
                    </Button>
                  </div>
                  
                  <Button onClick={handleSendMessage}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Message History */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Messages</CardTitle>
                <CardDescription>
                  Your communication history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCommunications.map((comm) => (
                    <div key={comm.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{comm.type}</Badge>
                          <span className="text-sm text-gray-500">from {comm.from}</span>
                        </div>
                        <span className="text-xs text-gray-500">{comm.timestamp}</span>
                      </div>
                      
                      <h4 className="font-medium mb-2">{comm.subject}</h4>
                      <p className="text-sm text-gray-600">{comm.content}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Documents</CardTitle>
              <CardDescription>
                Access your lease, invoices, and other important documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Lease Agreement', type: 'PDF', date: '2023-08-01', size: '1.2 MB' },
                  { name: 'Move-in Inspection', type: 'PDF', date: '2023-08-01', size: '2.8 MB' },
                  { name: 'Rent Receipt - Jan 2024', type: 'PDF', date: '2024-01-01', size: '0.3 MB' },
                  { name: 'Property Rules', type: 'PDF', date: '2023-08-01', size: '0.8 MB' },
                  { name: 'Renters Insurance', type: 'PDF', date: '2023-08-01', size: '1.5 MB' },
                  { name: 'Emergency Contacts', type: 'PDF', date: '2023-08-01', size: '0.2 MB' },
                ].map((doc, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <FileText className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{doc.name}</h4>
                          <p className="text-xs text-gray-500">{doc.size}</p>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 mb-3">
                      Created: {new Date(doc.date).toLocaleDateString()}
                    </p>
                    
                    <Button variant="outline" size="sm" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">First Name</label>
                    <Input defaultValue={mockTenant.firstName} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Last Name</label>
                    <Input defaultValue={mockTenant.lastName} />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" defaultValue={mockTenant.email} />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <Input type="tel" defaultValue={mockTenant.phone} />
                </div>
                
                <Button className="w-full">
                  Update Profile
                </Button>
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how you'd like to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Payment Reminders', description: 'Rent due notifications' },
                  { label: 'Maintenance Updates', description: 'Updates on your requests' },
                  { label: 'Property Announcements', description: 'Important building news' },
                  { label: 'Emergency Alerts', description: 'Urgent notifications only' },
                  { label: 'Lease Renewals', description: 'Lease expiration reminders' },
                ].map((pref, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{pref.label}</p>
                      <p className="text-xs text-gray-500">{pref.description}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Badge variant="outline" className="cursor-pointer">Email</Badge>
                      <Badge variant="outline" className="cursor-pointer">SMS</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

