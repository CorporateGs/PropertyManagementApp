'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Plus, Edit, Trash2, Copy, Send, Mail, MessageSquare, Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CommunicationTemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const templates = [
    {
      id: 1,
      name: 'Welcome New Tenant',
      category: 'Onboarding',
      channel: 'Email',
      subject: 'Welcome to Your New Home!',
      content: 'Dear [Tenant Name],\n\nWelcome to [Property Name]! We are thrilled to have you as part of our community...',
      variables: ['Tenant Name', 'Property Name', 'Unit Number', 'Move-in Date'],
    },
    {
      id: 2,
      name: 'Rent Reminder',
      category: 'Payments',
      channel: 'Email + SMS',
      subject: 'Rent Payment Reminder',
      content: 'Hi [Tenant Name],\n\nThis is a friendly reminder that your rent payment of $[Amount] is due on [Due Date]...',
      variables: ['Tenant Name', 'Amount', 'Due Date'],
    },
    {
      id: 3,
      name: 'Maintenance Scheduled',
      category: 'Maintenance',
      channel: 'Email',
      subject: 'Maintenance Scheduled for Your Unit',
      content: 'Dear [Tenant Name],\n\nWe have scheduled maintenance for your unit on [Date] at [Time]...',
      variables: ['Tenant Name', 'Date', 'Time', 'Maintenance Type'],
    },
    {
      id: 4,
      name: 'Lease Renewal Notice',
      category: 'Leasing',
      channel: 'Email',
      subject: 'Your Lease Renewal Options',
      content: 'Dear [Tenant Name],\n\nYour current lease will expire on [Expiry Date]. We would love to have you continue...',
      variables: ['Tenant Name', 'Expiry Date', 'New Rate'],
    },
    {
      id: 5,
      name: 'Community Event Invitation',
      category: 'Events',
      channel: 'Email + Portal',
      subject: 'You\'re Invited: [Event Name]',
      content: 'Dear Residents,\n\nJoin us for [Event Name] on [Date] at [Location]...',
      variables: ['Event Name', 'Date', 'Time', 'Location'],
    },
    {
      id: 6,
      name: 'Late Payment Notice',
      category: 'Payments',
      channel: 'Email + SMS',
      subject: 'Late Payment Notice',
      content: 'Dear [Tenant Name],\n\nWe have not received your rent payment for [Month]. Please remit payment immediately...',
      variables: ['Tenant Name', 'Month', 'Amount', 'Late Fee'],
    },
  ];

  const categories = ['All', 'Onboarding', 'Payments', 'Maintenance', 'Leasing', 'Events', 'Compliance'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Communication Templates</h1>
        <p className="mt-2 text-gray-600">
          Create and manage reusable templates for emails, SMS, and notifications
        </p>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="templates">All Templates</TabsTrigger>
          <TabsTrigger value="create">Create Template</TabsTrigger>
          <TabsTrigger value="variables">Variables</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Template Library</CardTitle>
                      <CardDescription>Browse and manage your communication templates</CardDescription>
                    </div>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Template
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex items-center space-x-2">
                    <Input placeholder="Search templates..." className="flex-1" />
                    <Select defaultValue="All">
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                          selectedTemplate?.id === template.id ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-medium">{template.name}</h3>
                              <Badge variant="outline">{template.category}</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{template.subject}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className="flex items-center">
                                {template.channel.includes('Email') && <Mail className="h-3 w-3 mr-1" />}
                                {template.channel.includes('SMS') && <MessageSquare className="h-3 w-3 mr-1" />}
                                {template.channel}
                              </span>
                              <span>{template.variables.length} variables</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button variant="ghost" size="sm">
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {selectedTemplate ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Template Preview</CardTitle>
                    <CardDescription>{selectedTemplate.name}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-xs text-gray-500">Subject</Label>
                      <p className="font-medium">{selectedTemplate.subject}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Content</Label>
                      <div className="p-3 bg-gray-50 rounded-lg text-sm whitespace-pre-wrap">
                        {selectedTemplate.content}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Variables</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedTemplate.variables.map((variable: string) => (
                          <Badge key={variable} variant="secondary">{variable}</Badge>
                        ))}
                      </div>
                    </div>
                    <Button className="w-full">
                      <Send className="h-4 w-4 mr-2" />
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>Select a template to preview</p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Templates</span>
                    <span className="font-bold">{templates.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Most Used</span>
                    <span className="text-sm text-gray-600">Rent Reminder</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Created</span>
                    <span className="text-sm text-gray-600">2 days ago</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Template</CardTitle>
              <CardDescription>Design a reusable communication template</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Template Name</Label>
                  <Input placeholder="e.g., Welcome New Tenant" />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(c => c !== 'All').map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Communication Channel</Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <input type="checkbox" id="email" defaultChecked />
                    <Mail className="h-4 w-4 text-blue-600" />
                    <label htmlFor="email" className="text-sm">Email</label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <input type="checkbox" id="sms" />
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                    <label htmlFor="sms" className="text-sm">SMS</label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <input type="checkbox" id="portal" />
                    <Bell className="h-4 w-4 text-blue-600" />
                    <label htmlFor="portal" className="text-sm">Portal</label>
                  </div>
                </div>
              </div>

              <div>
                <Label>Subject Line</Label>
                <Input placeholder="Email subject or SMS preview" />
              </div>

              <div>
                <Label>Message Content</Label>
                <Textarea
                  placeholder="Use [Variable Name] for dynamic content..."
                  rows={10}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tip: Use square brackets for variables, e.g., [Tenant Name], [Amount], [Date]
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="ai-enhance" />
                <label htmlFor="ai-enhance" className="text-sm">
                  Use AI to enhance and optimize this template
                </label>
              </div>

              <div className="flex space-x-2">
                <Button className="flex-1">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
                <Button variant="outline">
                  Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variables" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Variables</CardTitle>
              <CardDescription>Use these variables in your templates for dynamic content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { category: 'Tenant Info', vars: ['Tenant Name', 'Email', 'Phone', 'Unit Number'] },
                  { category: 'Property Info', vars: ['Property Name', 'Address', 'Manager Name', 'Manager Phone'] },
                  { category: 'Financial', vars: ['Amount', 'Due Date', 'Late Fee', 'Balance'] },
                  { category: 'Dates', vars: ['Current Date', 'Move-in Date', 'Lease Expiry', 'Payment Date'] },
                  { category: 'Maintenance', vars: ['Request ID', 'Issue Type', 'Scheduled Date', 'Technician'] },
                  { category: 'Events', vars: ['Event Name', 'Event Date', 'Location', 'RSVP Link'] },
                ].map((group) => (
                  <Card key={group.category}>
                    <CardHeader>
                      <CardTitle className="text-sm">{group.category}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {group.vars.map((variable) => (
                          <div key={variable} className="flex items-center justify-between text-sm">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">[{variable}]</code>
                            <Button variant="ghost" size="sm">
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}