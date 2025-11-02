
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  User,
  Home,
  CreditCard,
  Wrench,
  MessageCircle,
  Bell,
  Calendar,
  FileText,
  Camera,
  Zap,
  Thermometer,
  Shield,
  Car,
  Users,
  Bot,
  Star,
  Eye,
  Download,
  Upload,
  QrCode,
  Smartphone,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

interface TenantInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  unit: string;
  building: string;
  leaseStart: Date;
  leaseEnd: Date;
  rent: number;
  deposit: number;
}

interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  status: 'pending' | 'in_progress' | 'completed';
  submittedDate: Date;
  scheduledDate?: Date;
  photos?: string[];
}

interface Payment {
  id: string;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: 'pending' | 'paid' | 'late' | 'partial';
  type: string;
  description: string;
}

const mockTenantInfo: TenantInfo = {
  firstName: 'Sarah',
  lastName: 'Johnson',
  email: 'sarah.johnson@email.com',
  phone: '(555) 123-4567',
  unit: '205',
  building: 'Building A',
  leaseStart: new Date('2023-03-01'),
  leaseEnd: new Date('2024-02-29'),
  rent: 2750,
  deposit: 2750
};

const mockMaintenanceRequests: MaintenanceRequest[] = [
  {
    id: '1',
    title: 'Kitchen Faucet Dripping',
    description: 'The kitchen faucet has been dripping constantly for the past few days',
    category: 'Plumbing',
    priority: 'medium',
    status: 'in_progress',
    submittedDate: new Date('2024-02-20'),
    scheduledDate: new Date('2024-02-25'),
    photos: ['faucet1.jpg', 'faucet2.jpg']
  },
  {
    id: '2',
    title: 'Air Conditioning Not Working',
    description: 'AC unit stopped working yesterday. No cool air coming out.',
    category: 'HVAC',
    priority: 'high',
    status: 'pending',
    submittedDate: new Date('2024-02-22')
  }
];

const mockPayments: Payment[] = [
  {
    id: '1',
    amount: 2750,
    dueDate: new Date('2024-03-01'),
    status: 'pending',
    type: 'Rent',
    description: 'March 2024 Rent'
  },
  {
    id: '2',
    amount: 2750,
    dueDate: new Date('2024-02-01'),
    paidDate: new Date('2024-01-28'),
    status: 'paid',
    type: 'Rent',
    description: 'February 2024 Rent'
  }
];

export function EnhancedTenantPortal() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState(true);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <User className="h-8 w-8 mr-3 text-blue-600" />
            Tenant Portal
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {mockTenantInfo.firstName}! Unit {mockTenantInfo.unit}
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Bot className="h-4 w-4 mr-2" />
            AI Assistant
          </Button>
          <Button variant="outline">
            <QrCode className="h-4 w-4 mr-2" />
            Digital Key
          </Button>
          <Button>
            <Bell className="h-4 w-4 mr-2" />
            Notifications
            {notifications && <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1">3</span>}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Home className="h-6 w-6 text-blue-600" />
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">{mockTenantInfo.unit}</p>
              <p className="text-gray-600 text-sm">{mockTenantInfo.building}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
              <Badge variant="default" className="bg-green-600">On Time</Badge>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">${mockTenantInfo.rent}</p>
              <p className="text-gray-600 text-sm">Monthly Rent</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Wrench className="h-6 w-6 text-orange-600" />
              </div>
              <Badge variant="secondary">2 Open</Badge>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">2</p>
              <p className="text-gray-600 text-sm">Maintenance Requests</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <Badge variant="outline">
                {Math.ceil((mockTenantInfo.leaseEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">{mockTenantInfo.leaseEnd.getFullYear()}</p>
              <p className="text-gray-600 text-sm">Lease Expires</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="smart-home">Smart Home</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-blue-500" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your latest interactions and updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    type: 'payment',
                    title: 'Payment Processed',
                    description: 'February rent payment of $2,750 was processed',
                    time: '2 days ago',
                    icon: CreditCard,
                    color: 'text-green-600'
                  },
                  {
                    type: 'maintenance',
                    title: 'Maintenance Update',
                    description: 'Kitchen faucet repair has been scheduled for Feb 25',
                    time: '3 days ago',
                    icon: Wrench,
                    color: 'text-orange-600'
                  },
                  {
                    type: 'message',
                    title: 'New Message',
                    description: 'Property manager sent you a message about lease renewal',
                    time: '5 days ago',
                    icon: MessageCircle,
                    color: 'text-blue-600'
                  }
                ].map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-lg bg-gray-100`}>
                      <activity.icon className={`h-4 w-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{activity.title}</p>
                      <p className="text-xs text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { title: 'Pay Rent', icon: CreditCard, color: 'bg-green-500', urgent: true },
                  { title: 'Submit Maintenance', icon: Wrench, color: 'bg-orange-500', urgent: false },
                  { title: 'Contact Manager', icon: MessageCircle, color: 'bg-blue-500', urgent: false },
                  { title: 'Download Lease', icon: FileText, color: 'bg-purple-500', urgent: false },
                  { title: 'Virtual Tour', icon: Camera, color: 'bg-pink-500', urgent: false },
                  { title: 'Renew Lease', icon: Calendar, color: 'bg-indigo-500', urgent: false }
                ].map((action, index) => (
                  <Button key={index} variant="outline" className="w-full justify-start relative">
                    <div className={`p-2 rounded-lg mr-3 ${action.color}`}>
                      <action.icon className="h-4 w-4 text-white" />
                    </div>
                    {action.title}
                    {action.urgent && (
                      <Badge variant="destructive" className="ml-auto text-xs">
                        Due
                      </Badge>
                    )}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Announcements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2 text-yellow-500" />
                Building Announcements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  title: 'Pool Maintenance Scheduled',
                  message: 'The pool will be closed for maintenance on March 5-7. Thank you for your understanding.',
                  date: '2 days ago',
                  type: 'info'
                },
                {
                  title: 'New Package Room Hours',
                  message: 'Package room is now open 24/7 with key card access. Digital lockers available.',
                  date: '1 week ago',
                  type: 'update'
                },
                {
                  title: 'Rent Increase Notice',
                  message: 'Annual rent adjustment will take effect starting April 1, 2024. Details in your email.',
                  date: '2 weeks ago',
                  type: 'important'
                }
              ].map((announcement, index) => (
                <div key={index} className={`p-4 rounded-lg border ${
                  announcement.type === 'important' ? 'border-red-200 bg-red-50' :
                  announcement.type === 'update' ? 'border-blue-200 bg-blue-50' :
                  'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{announcement.title}</h4>
                    <Badge variant={announcement.type === 'important' ? 'destructive' : 'secondary'} className="text-xs">
                      {announcement.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{announcement.message}</p>
                  <p className="text-xs text-gray-500">{announcement.date}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Your rent and fee payment records</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        payment.status === 'paid' ? 'bg-green-100' : 
                        payment.status === 'late' ? 'bg-red-100' : 'bg-orange-100'
                      }`}>
                        <CreditCard className={`h-5 w-5 ${
                          payment.status === 'paid' ? 'text-green-600' : 
                          payment.status === 'late' ? 'text-red-600' : 'text-orange-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">{payment.description}</p>
                        <p className="text-sm text-gray-600">Due: {payment.dueDate.toLocaleDateString()}</p>
                        {payment.paidDate && (
                          <p className="text-sm text-green-600">Paid: {payment.paidDate.toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-semibold">${payment.amount.toLocaleString()}</div>
                      <Badge variant={
                        payment.status === 'paid' ? 'default' : 
                        payment.status === 'late' ? 'destructive' : 'secondary'
                      }>
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Options</CardTitle>
                <CardDescription>Choose your payment method</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay with Card
                  </Button>
                  <Button variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Pay with ACH
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Smartphone className="h-4 w-4 mr-2" />
                    Pay with App
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Auto-Pay</span>
                    <Switch defaultChecked />
                  </div>
                  <p className="text-xs text-gray-600">
                    Automatically pay rent on the 1st of each month
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Payment Methods</h4>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">**** 1234 (Primary)</span>
                      <Button size="sm" variant="outline">Edit</Button>
                    </div>
                    <Button size="sm" variant="outline" className="w-full">
                      + Add Payment Method
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Maintenance Requests</CardTitle>
                <CardDescription>Track your maintenance and repair requests</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockMaintenanceRequests.map((request) => (
                  <div key={request.id} className={`p-4 border rounded-lg ${getPriorityColor(request.priority)}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(request.status)}
                        <h3 className="font-semibold">{request.title}</h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="capitalize">
                          {request.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant={request.priority === 'emergency' || request.priority === 'high' ? 'destructive' : 'secondary'}>
                          {request.priority}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-3">{request.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Category: {request.category}</span>
                      <span>Submitted: {request.submittedDate.toLocaleDateString()}</span>
                    </div>
                    
                    {request.scheduledDate && (
                      <div className="mt-2 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                        <p className="text-sm text-blue-700">
                          Scheduled for: {request.scheduledDate.toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    {request.photos && (
                      <div className="mt-3 flex space-x-2">
                        {request.photos.map((photo, index) => (
                          <div key={index} className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                            <Camera className="h-6 w-6 text-gray-500" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Submit New Request</CardTitle>
                <CardDescription>Report a maintenance issue</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="issue-type">Issue Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select issue type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="plumbing">Plumbing</SelectItem>
                      <SelectItem value="electrical">Electrical</SelectItem>
                      <SelectItem value="hvac">HVAC</SelectItem>
                      <SelectItem value="appliance">Appliance</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the issue in detail..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Photos (Optional)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Click to upload photos</p>
                  </div>
                </div>

                <Button className="w-full">
                  <Wrench className="h-4 w-4 mr-2" />
                  Submit Request
                </Button>

                <div className="pt-4 border-t">
                  <h4 className="font-medium text-sm mb-2">Emergency Contact</h4>
                  <p className="text-sm text-gray-600">For emergencies, call:</p>
                  <p className="text-sm font-medium text-red-600">(555) 911-HELP</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="smart-home" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Thermometer className="h-5 w-5 mr-2 text-blue-500" />
                  Climate Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">72°F</div>
                  <div className="text-sm text-gray-600">Current Temperature</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Target Temperature</span>
                    <span className="font-medium">74°F</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="85"
                    defaultValue="74"
                    className="w-full"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Auto Mode</span>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-green-500" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Shield className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="font-medium text-green-600">All Secure</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Front Door</span>
                    <Badge variant="default" className="bg-green-600">Locked</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Windows</span>
                    <Badge variant="default" className="bg-green-600">Closed</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Alarm System</span>
                    <Badge variant="secondary">Disarmed</Badge>
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  <QrCode className="h-4 w-4 mr-2" />
                  Digital Key Access
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                  Energy Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">847 kWh</div>
                  <div className="text-sm text-gray-600">This Month</div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>vs. Last Month</span>
                    <span className="text-green-600">-12%</span>
                  </div>
                  <Progress value={88} className="h-2" />
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Heating/Cooling:</span>
                    <span>45%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Appliances:</span>
                    <span>30%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lighting:</span>
                    <span>25%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Car className="h-5 w-5 mr-2 text-purple-500" />
                  Parking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-2">A-205</div>
                  <div className="text-sm text-gray-600">Your Assigned Space</div>
                  <Badge variant="default" className="mt-2 bg-green-600">Available</Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Monthly Rate:</span>
                    <span className="font-medium">$150</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Guest Passes:</span>
                    <span className="font-medium">3 remaining</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  <QrCode className="h-4 w-4 mr-2" />
                  Generate Guest Pass
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="community" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-500" />
                  Community Board
                </CardTitle>
                <CardDescription>Connect with your neighbors</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    author: 'Mike Chen - Unit 301',
                    message: 'Anyone interested in organizing a building barbecue this weekend?',
                    time: '2 hours ago',
                    likes: 8,
                    replies: 3
                  },
                  {
                    author: 'Emma Wilson - Unit 412',
                    message: 'Lost cat found in the parking garage. Black and white, very friendly!',
                    time: '1 day ago',
                    likes: 12,
                    replies: 7
                  },
                  {
                    author: 'Property Management',
                    message: 'Reminder: Package room will be cleaned this Thursday 2-4 PM',
                    time: '2 days ago',
                    likes: 5,
                    replies: 1
                  }
                ].map((post, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm">{post.author}</p>
                        <p className="text-xs text-gray-500">{post.time}</p>
                      </div>
                    </div>
                    <p className="text-sm mb-3">{post.message}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <button className="flex items-center space-x-1 hover:text-blue-600">
                        <Star className="h-3 w-3" />
                        <span>{post.likes}</span>
                      </button>
                      <button className="flex items-center space-x-1 hover:text-blue-600">
                        <MessageCircle className="h-3 w-3" />
                        <span>{post.replies} replies</span>
                      </button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Amenity Booking</CardTitle>
                <CardDescription>Reserve shared spaces and amenities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: 'Rooftop Deck', availability: 'Available', price: 'Free', icon: Eye },
                  { name: 'Conference Room', availability: 'Booked until 6 PM', price: '$25/hr', icon: Users },
                  { name: 'Gym', availability: 'Available', price: 'Free', icon: Zap },
                  { name: 'Pool Area', availability: 'Closed for maintenance', price: 'Free', icon: Car }
                ].map((amenity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <amenity.icon className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-sm">{amenity.name}</p>
                        <p className="text-xs text-gray-600">{amenity.price}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={amenity.availability === 'Available' ? 'default' : 'secondary'} className="text-xs">
                        {amenity.availability === 'Available' ? 'Book Now' : amenity.availability}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue={mockTenantInfo.firstName} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue={mockTenantInfo.lastName} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={mockTenantInfo.email} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" defaultValue={mockTenantInfo.phone} />
                </div>

                <Button className="w-full">
                  Update Profile
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Rent reminders', description: 'Get notified before rent is due', defaultChecked: true },
                  { label: 'Maintenance updates', description: 'Updates on your maintenance requests', defaultChecked: true },
                  { label: 'Building announcements', description: 'Important building news and updates', defaultChecked: true },
                  { label: 'Community messages', description: 'Messages from neighbors and events', defaultChecked: false },
                  { label: 'Payment confirmations', description: 'Confirm when payments are processed', defaultChecked: true }
                ].map((setting, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{setting.label}</p>
                      <p className="text-xs text-gray-600">{setting.description}</p>
                    </div>
                    <Switch defaultChecked={setting.defaultChecked} />
                  </div>
                ))}

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Delivery Method</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="radio" id="email-notifications" name="delivery" defaultChecked />
                      <Label htmlFor="email-notifications" className="text-sm">Email</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="radio" id="sms-notifications" name="delivery" />
                      <Label htmlFor="sms-notifications" className="text-sm">SMS</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="radio" id="both-notifications" name="delivery" />
                      <Label htmlFor="both-notifications" className="text-sm">Both</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
