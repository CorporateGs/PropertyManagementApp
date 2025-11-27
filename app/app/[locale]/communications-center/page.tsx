'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, MessageSquare, Bell, Send, Users, Calendar, FileText, Sparkles, Phone } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

export default function CommunicationsCenterPage() {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [recipients, setRecipients] = useState('all');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const templates = [
    {
      id: 'rent-reminder',
      name: 'Rent Payment Reminder',
      category: 'Financial',
      subject: 'Rent Payment Due - {{unit_number}}',
      body: 'Dear {{tenant_name}},\n\nThis is a friendly reminder that your rent payment of ${{amount}} is due on {{due_date}}.\n\nPlease ensure payment is made by the due date to avoid late fees.\n\nThank you,\n{{property_manager}}',
    },
    {
      id: 'maintenance-scheduled',
      name: 'Maintenance Scheduled',
      category: 'Maintenance',
      subject: 'Scheduled Maintenance - {{date}}',
      body: 'Dear {{tenant_name}},\n\nWe will be performing scheduled maintenance in your unit on {{date}} at {{time}}.\n\nMaintenance Type: {{maintenance_type}}\nEstimated Duration: {{duration}}\n\nPlease ensure someone is available to provide access.\n\nThank you,\n{{property_manager}}',
    },
    {
      id: 'lease-renewal',
      name: 'Lease Renewal Notice',
      category: 'Leasing',
      subject: 'Lease Renewal - {{unit_number}}',
      body: 'Dear {{tenant_name}},\n\nYour current lease for Unit {{unit_number}} will expire on {{expiry_date}}.\n\nWe would like to offer you a lease renewal. Please contact us at your earliest convenience to discuss terms.\n\nNew Lease Terms:\n- Duration: {{duration}}\n- Monthly Rent: ${{new_rent}}\n- Start Date: {{start_date}}\n\nBest regards,\n{{property_manager}}',
    },
    {
      id: 'noise-complaint',
      name: 'Noise Complaint Notice',
      category: 'Compliance',
      subject: 'Noise Complaint - Unit {{unit_number}}',
      body: 'Dear {{tenant_name}},\n\nWe have received a noise complaint regarding Unit {{unit_number}} on {{date}}.\n\nAs per building bylaws, quiet hours are from {{quiet_hours}}. We kindly ask that you be mindful of noise levels during these times.\n\nIf you have any questions, please contact us.\n\nThank you for your cooperation,\n{{property_manager}}',
    },
    {
      id: 'emergency-alert',
      name: 'Emergency Alert',
      category: 'Emergency',
      subject: 'URGENT: {{alert_type}}',
      body: 'EMERGENCY ALERT\n\nAlert Type: {{alert_type}}\nDate/Time: {{timestamp}}\n\n{{emergency_details}}\n\nImmediate Actions Required:\n{{actions}}\n\nFor assistance, contact:\nEmergency: 911\nProperty Management: {{manager_phone}}\n\nStay safe,\n{{property_manager}}',
    },
    {
      id: 'welcome-new-tenant',
      name: 'Welcome New Tenant',
      category: 'Leasing',
      subject: 'Welcome to {{building_name}}!',
      body: 'Dear {{tenant_name}},\n\nWelcome to {{building_name}}! We are delighted to have you as our new resident.\n\nYour Move-In Details:\n- Unit: {{unit_number}}\n- Move-In Date: {{move_in_date}}\n- Keys Available: {{key_pickup_location}}\n\nImportant Information:\n- Parking: {{parking_info}}\n- Amenities: {{amenities_info}}\n- Emergency Contact: {{emergency_contact}}\n\nPlease review the attached resident handbook for building rules and regulations.\n\nWelcome home!\n{{property_manager}}',
    },
    {
      id: 'board-meeting-notice',
      name: 'Board Meeting Notice',
      category: 'Board',
      subject: 'Board Meeting - {{meeting_date}}',
      body: 'Dear Board Members and Owners,\n\nYou are invited to attend the upcoming Board Meeting:\n\nDate: {{meeting_date}}\nTime: {{meeting_time}}\nLocation: {{meeting_location}}\nVirtual Link: {{virtual_link}}\n\nAgenda:\n{{agenda_items}}\n\nPlease RSVP by {{rsvp_date}}.\n\nIf you cannot attend, you may assign a proxy by completing the attached form.\n\nBest regards,\n{{property_manager}}',
    },
    {
      id: 'payment-received',
      name: 'Payment Confirmation',
      category: 'Financial',
      subject: 'Payment Received - {{unit_number}}',
      body: 'Dear {{tenant_name}},\n\nThank you! We have received your payment.\n\nPayment Details:\n- Amount: ${{amount}}\n- Date: {{payment_date}}\n- Method: {{payment_method}}\n- Reference: {{reference_number}}\n\nCurrent Balance: ${{current_balance}}\n\nThank you for your prompt payment.\n\nBest regards,\n{{property_manager}}',
    },
  ];

  const handleSendCommunication = async () => {
    setSending(true);
    try {
      const response = await fetch('/api/communications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients,
          subject,
          message,
          channels: ['email', 'sms'],
        }),
      });

      if (response.ok) {
        alert('Communication sent successfully!');
        setSubject('');
        setMessage('');
      }
    } catch (error) {
      console.error('Error sending communication:', error);
      alert('Failed to send communication');
    } finally {
      setSending(false);
    }
  };

  const loadTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSubject(template.subject);
      setMessage(template.body);
      setSelectedTemplate(templateId);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Communications Center</h1>
        <p className="mt-2 text-gray-600">
          Send automated communications with AI-powered templates
        </p>
      </div>

      <Tabs defaultValue="compose" className="space-y-6">
        <TabsList>
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="emergency">Emergency Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>New Communication</CardTitle>
                  <CardDescription>Send emails, SMS, or push notifications to residents</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Recipients</Label>
                    <Select value={recipients} onValueChange={setRecipients}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select recipients" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Residents</SelectItem>
                        <SelectItem value="building">Specific Building</SelectItem>
                        <SelectItem value="unit">Specific Unit</SelectItem>
                        <SelectItem value="board">Board Members</SelectItem>
                        <SelectItem value="owners">Owners Only</SelectItem>
                        <SelectItem value="tenants">Tenants Only</SelectItem>
                        <SelectItem value="custom">Custom List</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Communication Channels</Label>
                    <div className="flex space-x-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="email" defaultChecked />
                        <label htmlFor="email" className="text-sm cursor-pointer flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          Email
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="sms" />
                        <label htmlFor="sms" className="text-sm cursor-pointer flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          SMS
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="push" />
                        <label htmlFor="push" className="text-sm cursor-pointer flex items-center">
                          <Bell className="h-4 w-4 mr-1" />
                          Push Notification
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Enter subject line"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Message</Label>
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message here..."
                      rows={12}
                    />
                    <p className="text-sm text-gray-500">
                      Use variables like {'{tenant_name}'}, {'{unit_number}'}, {'{amount}'} for personalization
                    </p>
                  </div>

                  <div className="flex justify-between">
                    <div className="space-x-2">
                      <Button variant="outline">
                        <Sparkles className="mr-2 h-4 w-4" />
                        AI Enhance
                      </Button>
                      <Button variant="outline">Save as Template</Button>
                    </div>
                    <div className="space-x-2">
                      <Button variant="outline">
                        <Calendar className="mr-2 h-4 w-4" />
                        Schedule
                      </Button>
                      <Button onClick={handleSendCommunication} disabled={sending}>
                        <Send className="mr-2 h-4 w-4" />
                        {sending ? 'Sending...' : 'Send Now'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Templates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {templates.slice(0, 6).map((template) => (
                    <Button
                      key={template.id}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => loadTemplate(template.id)}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      {template.name}
                    </Button>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">AI Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>✓ Personalize with recipient names</li>
                    <li>✓ Include clear call-to-action</li>
                    <li>✓ Keep message concise</li>
                    <li>✓ Add contact information</li>
                    <li>✓ Proofread before sending</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-all cursor-pointer" onClick={() => loadTemplate(template.id)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {template.category}
                    </span>
                  </div>
                  <CardDescription className="line-clamp-2">{template.subject}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-3">{template.body}</p>
                  <Button variant="outline" className="w-full mt-4" onClick={() => loadTemplate(template.id)}>
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scheduled">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Communications</CardTitle>
              <CardDescription>Automatically scheduled messages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { title: 'Monthly Rent Reminder', date: '2024-02-01 09:00 AM', recipients: 'All Tenants', status: 'Scheduled' },
                  { title: 'Board Meeting Notice', date: '2024-01-25 10:00 AM', recipients: 'Board Members', status: 'Scheduled' },
                  { title: 'Maintenance Notice', date: '2024-01-22 08:00 AM', recipients: 'Building A', status: 'Scheduled' },
                ].map((comm, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">{comm.title}</h4>
                      <p className="text-sm text-gray-600">
                        {comm.date} • {comm.recipients}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">Cancel</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Communication History</CardTitle>
              <CardDescription>Previously sent messages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { title: 'Rent Payment Reminder', date: '2024-01-15', recipients: '120 residents', delivered: '118', opened: '95' },
                  { title: 'Maintenance Scheduled', date: '2024-01-12', recipients: '45 residents', delivered: '45', opened: '42' },
                  { title: 'Welcome New Tenant', date: '2024-01-10', recipients: '3 residents', delivered: '3', opened: '3' },
                ].map((comm, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold">{comm.title}</h4>
                      <p className="text-sm text-gray-600">
                        {comm.date} • Sent to {comm.recipients}
                      </p>
                      <div className="flex space-x-4 mt-2 text-xs text-gray-500">
                        <span>Delivered: {comm.delivered}</span>
                        <span>Opened: {comm.opened}</span>
                        <span>Open Rate: {Math.round((parseInt(comm.opened) / parseInt(comm.delivered)) * 100)}%</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">View Details</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emergency">
          <Card className="border-red-200">
            <CardHeader className="bg-red-50">
              <CardTitle className="text-red-900 flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Emergency Alert System
              </CardTitle>
              <CardDescription>Send urgent notifications to all residents via multiple channels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label>Alert Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select alert type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fire">Fire Emergency</SelectItem>
                    <SelectItem value="weather">Severe Weather</SelectItem>
                    <SelectItem value="security">Security Threat</SelectItem>
                    <SelectItem value="utility">Utility Outage</SelectItem>
                    <SelectItem value="evacuation">Evacuation Order</SelectItem>
                    <SelectItem value="other">Other Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Emergency Message</Label>
                <Textarea
                  placeholder="Enter emergency details and instructions..."
                  rows={6}
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-900">
                  <strong>Note:</strong> Emergency alerts will be sent immediately via Email, SMS, and Push Notifications to all residents.
                </p>
              </div>

              <Button className="w-full bg-red-600 hover:bg-red-700">
                <Bell className="mr-2 h-4 w-4" />
                Send Emergency Alert
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
