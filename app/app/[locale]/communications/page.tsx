"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  MessageCircle,
  Plus,
  Search,
  Filter,
  Mail,
  Phone,
  MessageSquare,
  Send,
  Eye,
  Calendar,
  User,
  Building2,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  FileText,
  Paperclip,
  Star
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TemplateManager } from '@/components/email/template-manager';
import { AIWriter } from '@/components/email/ai-writer';

interface Communication {
  id: string;
  tenantId?: string;
  tenantName?: string;
  unitNumber?: string;
  buildingName?: string;
  createdByUserId: string;
  createdByName: string;
  type: 'Email' | 'Phone' | 'SMS' | 'In-Person' | 'Letter' | 'Note' | 'WhatsApp';
  direction: 'Inbound' | 'Outbound';
  subject: string;
  content: string;
  timestamp: string;
  status: 'Pending' | 'Sent' | 'Delivered' | 'Read' | 'Replied' | 'Failed' | 'Completed';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  isImportant: boolean;
  category: 'General' | 'Maintenance' | 'Payment' | 'Lease' | 'Complaint' | 'Inquiry' | 'Emergency' | 'Marketing';
  attachments?: string[];
  followUpDate?: string;
  followUpRequired: boolean;
  relatedTo?: string; // ID of related maintenance request, payment, etc.
  notes?: string;
}

const mockCommunications: Communication[] = [
  {
    id: '1',
    tenantId: 'tenant-1',
    tenantName: 'Sarah Johnson',
    unitNumber: '205',
    buildingName: 'Sunset Apartments',
    createdByUserId: 'admin-1',
    createdByName: 'Admin User',
    type: 'Email',
    direction: 'Outbound',
    subject: 'Lease Renewal Discussion',
    content: 'Hi Sarah, I hope this email finds you well. As your lease is approaching its expiration date in July, I wanted to reach out to discuss renewal options and any updates to the terms.',
    timestamp: '2024-01-20T10:30:00Z',
    status: 'Delivered',
    priority: 'Medium',
    isImportant: false,
    category: 'Lease',
    followUpRequired: true,
    followUpDate: '2024-01-27'
  },
  {
    id: '2',
    tenantId: 'tenant-2',
    tenantName: 'Marcus Thompson',
    unitNumber: '301',
    buildingName: 'Sunset Apartments',
    createdByUserId: 'tenant-2',
    createdByName: 'Marcus Thompson',
    type: 'Phone',
    direction: 'Inbound',
    subject: 'Kitchen Faucet Maintenance Request',
    content: 'Tenant called to report dripping kitchen faucet. Explained the issue and requested repair. Scheduled maintenance visit for next week.',
    timestamp: '2024-01-18T14:15:00Z',
    status: 'Completed',
    priority: 'Medium',
    isImportant: false,
    category: 'Maintenance',
    followUpRequired: false,
    relatedTo: 'maintenance-1'
  },
  {
    id: '3',
    tenantId: 'tenant-3',
    tenantName: 'Emma Rodriguez',
    unitNumber: '102',
    buildingName: 'Garden View Complex',
    createdByUserId: 'admin-1',
    createdByName: 'Admin User',
    type: 'SMS',
    direction: 'Outbound',
    subject: 'Payment Reminder',
    content: 'Hi Emma, this is a friendly reminder that your rent payment of $2,900 is due tomorrow (Feb 1st). You can pay online via the tenant portal or call us if you need assistance.',
    timestamp: '2024-01-31T09:00:00Z',
    status: 'Delivered',
    priority: 'High',
    isImportant: true,
    category: 'Payment',
    followUpRequired: true,
    followUpDate: '2024-02-03'
  },
  {
    id: '4',
    tenantId: 'tenant-1',
    tenantName: 'Sarah Johnson',
    unitNumber: '205',
    buildingName: 'Sunset Apartments',
    createdByUserId: 'tenant-1',
    createdByName: 'Sarah Johnson',
    type: 'Email',
    direction: 'Inbound',
    subject: 'Re: Lease Renewal Discussion',
    content: 'Thank you for reaching out about the lease renewal. I am definitely interested in renewing. Could we schedule a meeting to discuss the new terms? I\'m available most evenings this week.',
    timestamp: '2024-01-21T18:45:00Z',
    status: 'Read',
    priority: 'Medium',
    isImportant: false,
    category: 'Lease',
    followUpRequired: true,
    followUpDate: '2024-01-24'
  },
  {
    id: '5',
    tenantId: 'tenant-4',
    tenantName: 'David Chen',
    unitNumber: '404',
    buildingName: 'Downtown Plaza',
    createdByUserId: 'admin-1',
    createdByName: 'Admin User',
    type: 'Letter',
    direction: 'Outbound',
    subject: 'Lease Violation Notice',
    content: 'This letter serves as formal notice regarding noise complaints from your neighbors. Please ensure compliance with building quiet hours (10 PM - 8 AM) as outlined in your lease agreement.',
    timestamp: '2024-01-19T16:00:00Z',
    status: 'Sent',
    priority: 'High',
    isImportant: true,
    category: 'Complaint',
    followUpRequired: true,
    followUpDate: '2024-01-26'
  },
  {
    id: '6',
    createdByUserId: 'admin-1',
    createdByName: 'Admin User',
    type: 'Note',
    direction: 'Outbound',
    subject: 'Building Maintenance Schedule',
    content: 'Scheduled quarterly HVAC maintenance for all units in Sunset Apartments. Contractors will be on-site February 5-7. Sent notice to all tenants.',
    timestamp: '2024-01-22T11:00:00Z',
    status: 'Completed',
    priority: 'Low',
    isImportant: false,
    category: 'General',
    followUpRequired: false,
    buildingName: 'Sunset Apartments'
  }
];

export default function CommunicationsPage() {
  const [communications, setCommunications] = useState<Communication[]>(mockCommunications);
  const [filteredCommunications, setFilteredCommunications] = useState<Communication[]>(mockCommunications);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('All Buildings');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedCommunication, setSelectedCommunication] = useState<Communication | null>(null);
  const [isComposeDialogOpen, setIsComposeDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const [newCommunication, setNewCommunication] = useState<Partial<Communication>>({
    tenantName: '',
    buildingName: 'Sunset Apartments',
    unitNumber: '',
    type: 'Email',
    direction: 'Outbound',
    subject: '',
    content: '',
    priority: 'Medium',
    category: 'General',
    isImportant: false,
    followUpRequired: false
  });

  const buildings = ['All Buildings', 'Sunset Apartments', 'Garden View Complex', 'Downtown Plaza'];
  const communicationTypes = ['All Types', 'Email', 'Phone', 'SMS', 'In-Person', 'Letter', 'Note', 'WhatsApp'];
  const statusOptions = ['All Status', 'Pending', 'Sent', 'Delivered', 'Read', 'Replied', 'Failed', 'Completed'];
  const categoryOptions = ['All Categories', 'General', 'Maintenance', 'Payment', 'Lease', 'Complaint', 'Inquiry', 'Emergency', 'Marketing'];

  useEffect(() => {
    let filtered = communications;

    // Filter by tab
    if (activeTab === 'pending') {
      filtered = filtered.filter(comm => comm.followUpRequired || comm.status === 'Pending');
    } else if (activeTab === 'important') {
      filtered = filtered.filter(comm => comm.isImportant);
    } else if (activeTab === 'sent') {
      filtered = filtered.filter(comm => comm.direction === 'Outbound');
    } else if (activeTab === 'received') {
      filtered = filtered.filter(comm => comm.direction === 'Inbound');
    }

    if (searchTerm) {
      filtered = filtered.filter(comm =>
        comm.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comm.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comm.tenantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comm.unitNumber?.includes(searchTerm)
      );
    }

    if (selectedBuilding !== 'All Buildings') {
      filtered = filtered.filter(comm => comm.buildingName === selectedBuilding);
    }

    if (selectedType !== 'All Types') {
      filtered = filtered.filter(comm => comm.type === selectedType);
    }

    if (selectedStatus !== 'All Status') {
      filtered = filtered.filter(comm => comm.status === selectedStatus);
    }

    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(comm => comm.category === selectedCategory);
    }

    setFilteredCommunications(filtered);
  }, [communications, searchTerm, selectedBuilding, selectedType, selectedStatus, selectedCategory, activeTab]);

  const handleCompose = () => {
    const communication: Communication = {
      ...newCommunication as Communication,
      id: Date.now().toString(),
      createdByUserId: 'admin-1',
      createdByName: 'Admin User',
      timestamp: new Date().toISOString(),
      status: 'Sent',
      followUpRequired: newCommunication.followUpRequired || false
    };
    setCommunications([communication, ...communications]);
    setNewCommunication({
      tenantName: '',
      buildingName: 'Sunset Apartments',
      unitNumber: '',
      type: 'Email',
      direction: 'Outbound',
      subject: '',
      content: '',
      priority: 'Medium',
      category: 'General',
      isImportant: false,
      followUpRequired: false
    });
    setIsComposeDialogOpen(false);
  };

  const markAsImportant = (commId: string) => {
    setCommunications(communications.map(c =>
      c.id === commId ? { ...c, isImportant: !c.isImportant } : c
    ));
  };

  const updateFollowUp = (commId: string, followUpRequired: boolean, followUpDate?: string) => {
    setCommunications(communications.map(c =>
      c.id === commId ? { ...c, followUpRequired, followUpDate } : c
    ));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Email': return Mail;
      case 'Phone': return Phone;
      case 'SMS': return MessageSquare;
      case 'WhatsApp': return MessageCircle;
      case 'In-Person': return Users;
      case 'Letter': return FileText;
      case 'Note': return FileText;
      default: return MessageCircle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Sent': return 'bg-green-100 text-green-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Read': return 'bg-blue-100 text-blue-800';
      case 'Replied': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      case 'Completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Emergency': return 'bg-red-100 text-red-800';
      case 'Payment': return 'bg-green-100 text-green-800';
      case 'Maintenance': return 'bg-blue-100 text-blue-800';
      case 'Lease': return 'bg-purple-100 text-purple-800';
      case 'Complaint': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTotalCommunications = () => communications.length;
  const getPendingFollowUps = () => communications.filter(c => c.followUpRequired).length;
  const getImportantMessages = () => communications.filter(c => c.isImportant).length;
  const getTodaysCommunications = () => {
    const today = new Date().toISOString().split('T')[0];
    return communications.filter(c => c.timestamp.split('T')[0] === today).length;
  };

  const handleTemplateSelect = (template: any) => {
    setNewCommunication({
      ...newCommunication,
      subject: template.subject,
      content: template.content,
      category: template.category,
      type: 'Email' // Default to Email for templates
    });
    setIsComposeDialogOpen(true);
  };

  const handleAIGenerate = (content: string) => {
    setNewCommunication({
      ...newCommunication,
      content: content
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Communications</h1>
          <p className="text-gray-600 mt-1">
            Manage all tenant and property communications
          </p>
        </div>
        <div className="flex space-x-3">
          <TemplateManager onSelectTemplate={handleTemplateSelect} />

          <Dialog open={isComposeDialogOpen} onOpenChange={setIsComposeDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Compose
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Compose Message</DialogTitle>
                <DialogDescription>
                  Send a message to tenants or create a communication record
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Communication Type</Label>
                  <Select value={newCommunication.type} onValueChange={(value) => setNewCommunication({ ...newCommunication, type: value as Communication['type'] })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Email">Email</SelectItem>
                      <SelectItem value="SMS">SMS</SelectItem>
                      <SelectItem value="Phone">Phone Call</SelectItem>
                      <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                      <SelectItem value="Letter">Letter</SelectItem>
                      <SelectItem value="Note">Internal Note</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={newCommunication.category} onValueChange={(value) => setNewCommunication({ ...newCommunication, category: value as Communication['category'] })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Payment">Payment</SelectItem>
                      <SelectItem value="Lease">Lease</SelectItem>
                      <SelectItem value="Complaint">Complaint</SelectItem>
                      <SelectItem value="Inquiry">Inquiry</SelectItem>
                      <SelectItem value="Emergency">Emergency</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tenantName">Tenant Name</Label>
                  <Input
                    id="tenantName"
                    value={newCommunication.tenantName}
                    onChange={(e) => setNewCommunication({ ...newCommunication, tenantName: e.target.value })}
                    placeholder="Enter tenant name (optional for general notes)"
                  />
                </div>
                <div>
                  <Label htmlFor="unitNumber">Unit Number</Label>
                  <Input
                    id="unitNumber"
                    value={newCommunication.unitNumber}
                    onChange={(e) => setNewCommunication({ ...newCommunication, unitNumber: e.target.value })}
                    placeholder="Unit number (if applicable)"
                  />
                </div>
                <div>
                  <Label htmlFor="building">Building</Label>
                  <Select value={newCommunication.buildingName} onValueChange={(value) => setNewCommunication({ ...newCommunication, buildingName: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select building" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sunset Apartments">Sunset Apartments</SelectItem>
                      <SelectItem value="Garden View Complex">Garden View Complex</SelectItem>
                      <SelectItem value="Downtown Plaza">Downtown Plaza</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newCommunication.priority} onValueChange={(value) => setNewCommunication({ ...newCommunication, priority: value as Communication['priority'] })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={newCommunication.subject}
                    onChange={(e) => setNewCommunication({ ...newCommunication, subject: e.target.value })}
                    placeholder="Enter subject or title"
                  />
                </div>
                <div className="md:col-span-2">
                  <div className="flex justify-between items-center mb-2">
                    <Label htmlFor="content">Message Content</Label>
                    <AIWriter onGenerate={handleAIGenerate} />
                  </div>
                  <Textarea
                    id="content"
                    value={newCommunication.content}
                    onChange={(e) => setNewCommunication({ ...newCommunication, content: e.target.value })}
                    rows={6}
                    placeholder="Enter your message content..."
                  />
                </div>
                <div className="md:col-span-2 flex items-center space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newCommunication.isImportant}
                      onChange={(e) => setNewCommunication({ ...newCommunication, isImportant: e.target.checked })}
                    />
                    <span className="text-sm">Mark as important</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newCommunication.followUpRequired}
                      onChange={(e) => setNewCommunication({ ...newCommunication, followUpRequired: e.target.checked })}
                    />
                    <span className="text-sm">Requires follow-up</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setIsComposeDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="outline">
                  <Paperclip className="h-4 w-4 mr-2" />
                  Add Attachment
                </Button>
                <Button onClick={handleCompose}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>


      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Messages</p>
              <p className="text-xl font-bold">{getTotalCommunications()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Follow-ups</p>
              <p className="text-xl font-bold">{getPendingFollowUps()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Star className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Important</p>
              <p className="text-xl font-bold">{getImportantMessages()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Today</p>
              <p className="text-xl font-bold">{getTodaysCommunications()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search communications..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
              <SelectTrigger>
                <Building2 className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Building" />
              </SelectTrigger>
              <SelectContent>
                {buildings.map(building => (
                  <SelectItem key={building} value={building}>{building}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <MessageCircle className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {communicationTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setSelectedBuilding('All Buildings');
              setSelectedType('All Types');
              setSelectedStatus('All Status');
              setSelectedCategory('All Categories');
            }}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Communications List with Tabs */}
      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All Messages</TabsTrigger>
              <TabsTrigger value="pending">Pending Follow-ups</TabsTrigger>
              <TabsTrigger value="important">Important</TabsTrigger>
              <TabsTrigger value="sent">Sent</TabsTrigger>
              <TabsTrigger value="received">Received</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredCommunications.map((communication) => {
              const TypeIcon = getTypeIcon(communication.type);
              return (
                <div key={communication.id} className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${communication.isImportant ? 'border-red-200 bg-red-50' : ''
                  } ${communication.direction === 'Inbound' ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-green-500'
                  }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`p-2 rounded-lg ${communication.direction === 'Inbound' ? 'bg-blue-100' : 'bg-green-100'
                        }`}>
                        <TypeIcon className={`h-5 w-5 ${communication.direction === 'Inbound' ? 'text-blue-600' : 'text-green-600'
                          }`} />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium">{communication.subject}</h3>
                          {communication.isImportant && (
                            <Star className="h-4 w-4 text-red-500 fill-current" />
                          )}
                          <Badge className={getStatusColor(communication.status)}>
                            {communication.status}
                          </Badge>
                          <Badge className={getPriorityColor(communication.priority)} variant="outline">
                            {communication.priority}
                          </Badge>
                          <Badge className={getCategoryColor(communication.category)} variant="outline">
                            {communication.category}
                          </Badge>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {communication.direction === 'Inbound' ? `From: ${communication.tenantName || communication.createdByName}` : `To: ${communication.tenantName || 'General'}`}
                          </div>
                          {communication.buildingName && communication.unitNumber && (
                            <div className="flex items-center">
                              <Building2 className="h-4 w-4 mr-1" />
                              {communication.buildingName} - Unit {communication.unitNumber}
                            </div>
                          )}
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {new Date(communication.timestamp).toLocaleDateString()} {new Date(communication.timestamp).toLocaleTimeString()}
                          </div>
                        </div>

                        <p className="text-sm text-gray-700 line-clamp-2 mb-2">{communication.content}</p>

                        {communication.followUpRequired && communication.followUpDate && (
                          <div className="text-sm text-orange-600 bg-orange-50 px-2 py-1 rounded inline-block">
                            <AlertCircle className="h-4 w-4 inline mr-1" />
                            Follow-up due: {new Date(communication.followUpDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" onClick={() => markAsImportant(communication.id)}>
                        <Star className={`h-4 w-4 ${communication.isImportant ? 'text-red-500 fill-current' : ''}`} />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setSelectedCommunication(communication)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Communication Detail Modal */}
      {selectedCommunication && (
        <Dialog open={!!selectedCommunication} onOpenChange={() => setSelectedCommunication(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <span>{selectedCommunication.subject}</span>
                {selectedCommunication.isImportant && (
                  <Star className="h-5 w-5 text-red-500 fill-current" />
                )}
              </DialogTitle>
              <DialogDescription>
                {selectedCommunication.direction === 'Inbound' ? 'Received' : 'Sent'} communication details and thread
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {(() => {
                          const TypeIcon = getTypeIcon(selectedCommunication.type);
                          return <TypeIcon className="h-5 w-5" />;
                        })()}
                        <div>
                          <h4 className="font-medium">{selectedCommunication.subject}</h4>
                          <p className="text-sm text-gray-600">
                            {selectedCommunication.direction === 'Inbound' ? 'From' : 'To'}: {selectedCommunication.tenantName || selectedCommunication.createdByName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-600">
                        <p>{new Date(selectedCommunication.timestamp).toLocaleDateString()}</p>
                        <p>{new Date(selectedCommunication.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <p className="whitespace-pre-wrap">{selectedCommunication.content}</p>
                    </div>

                    {selectedCommunication.attachments && selectedCommunication.attachments.length > 0 && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium mb-2">Attachments:</p>
                        <div className="space-y-1">
                          {selectedCommunication.attachments.map((attachment, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm">
                              <Paperclip className="h-4 w-4" />
                              <span>{attachment}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Reply Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Reply</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Type your reply..."
                      rows={4}
                    />
                    <div className="flex justify-between items-center">
                      <Button variant="outline" size="sm">
                        <Paperclip className="h-4 w-4 mr-2" />
                        Attach Files
                      </Button>
                      <div className="flex space-x-2">
                        <Button variant="outline">
                          Save Draft
                        </Button>
                        <Button>
                          <Send className="h-4 w-4 mr-2" />
                          Send Reply
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label>Type</Label>
                      <p>{selectedCommunication.type}</p>
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Badge className={getCategoryColor(selectedCommunication.category)} variant="outline">
                        {selectedCommunication.category}
                      </Badge>
                    </div>
                    <div>
                      <Label>Priority</Label>
                      <Badge className={getPriorityColor(selectedCommunication.priority)}>
                        {selectedCommunication.priority}
                      </Badge>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Badge className={getStatusColor(selectedCommunication.status)}>
                        {selectedCommunication.status}
                      </Badge>
                    </div>
                    {selectedCommunication.buildingName && (
                      <div>
                        <Label>Property</Label>
                        <p>{selectedCommunication.buildingName}</p>
                        {selectedCommunication.unitNumber && (
                          <p className="text-sm text-gray-600">Unit {selectedCommunication.unitNumber}</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => markAsImportant(selectedCommunication.id)}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      {selectedCommunication.isImportant ? 'Remove from Important' : 'Mark as Important'}
                    </Button>

                    <Button className="w-full" variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Follow-up
                    </Button>

                    <Button className="w-full" variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Print/Export
                    </Button>

                    <Button className="w-full" variant="outline">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Forward
                    </Button>
                  </CardContent>
                </Card>

                {selectedCommunication.followUpRequired && (
                  <Card className="border-orange-200">
                    <CardHeader>
                      <CardTitle className="text-lg text-orange-700">Follow-up Required</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedCommunication.followUpDate && (
                        <p className="text-sm mb-3">
                          Due: {new Date(selectedCommunication.followUpDate).toLocaleDateString()}
                        </p>
                      )}
                      <div className="space-y-2">
                        <Button
                          className="w-full"
                          size="sm"
                          onClick={() => updateFollowUp(selectedCommunication.id, false)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Completed
                        </Button>
                        <Button className="w-full" size="sm" variant="outline">
                          <Calendar className="h-4 w-4 mr-2" />
                          Reschedule
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
