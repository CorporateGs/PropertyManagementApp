'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Send, Users, Building, Bell, MessageSquare, Mail, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function EmergencyAlertsPage() {
  const [alertType, setAlertType] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendAlert = async () => {
    setSending(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSending(false);
    alert('Emergency alert sent successfully!');
  };

  const recentAlerts = [
    { id: 1, type: 'Fire Alarm', severity: 'Critical', sent: '2024-01-20 14:30', recipients: 150, status: 'Delivered' },
    { id: 2, type: 'Water Outage', severity: 'High', sent: '2024-01-18 09:15', recipients: 150, status: 'Delivered' },
    { id: 3, type: 'Elevator Maintenance', severity: 'Medium', sent: '2024-01-15 08:00', recipients: 150, status: 'Delivered' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Emergency Alerts</h1>
        <p className="mt-2 text-gray-600">
          Send urgent notifications to residents via multiple channels
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Send Emergency Alert</CardTitle>
              <CardDescription>Multi-channel emergency communication system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Alert Type</Label>
                <Select value={alertType} onValueChange={setAlertType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select alert type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fire">Fire Emergency</SelectItem>
                    <SelectItem value="water">Water Outage</SelectItem>
                    <SelectItem value="power">Power Outage</SelectItem>
                    <SelectItem value="gas">Gas Leak</SelectItem>
                    <SelectItem value="weather">Severe Weather</SelectItem>
                    <SelectItem value="security">Security Incident</SelectItem>
                    <SelectItem value="maintenance">Emergency Maintenance</SelectItem>
                    <SelectItem value="other">Other Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Alert Title</Label>
                <Input placeholder="Brief, clear title for the alert" />
              </div>

              <div>
                <Label>Message</Label>
                <Textarea
                  placeholder="Detailed information about the emergency..."
                  rows={6}
                />
              </div>

              <div>
                <Label>Recipients</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="all-residents" defaultChecked />
                    <label htmlFor="all-residents" className="text-sm">All Residents</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="specific-building" />
                    <label htmlFor="specific-building" className="text-sm">Specific Building</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="specific-units" />
                    <label htmlFor="specific-units" className="text-sm">Specific Units</label>
                  </div>
                </div>
              </div>

              <div>
                <Label>Delivery Channels</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <input type="checkbox" id="sms" defaultChecked />
                    <Phone className="h-4 w-4 text-blue-600" />
                    <label htmlFor="sms" className="text-sm">SMS</label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <input type="checkbox" id="email" defaultChecked />
                    <Mail className="h-4 w-4 text-blue-600" />
                    <label htmlFor="email" className="text-sm">Email</label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <input type="checkbox" id="push" defaultChecked />
                    <Bell className="h-4 w-4 text-blue-600" />
                    <label htmlFor="push" className="text-sm">Push Notification</label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <input type="checkbox" id="portal" defaultChecked />
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                    <label htmlFor="portal" className="text-sm">Portal Alert</label>
                  </div>
                </div>
              </div>

              <Button
                className="w-full bg-red-600 hover:bg-red-700"
                onClick={handleSendAlert}
                disabled={sending}
              >
                <Send className="h-4 w-4 mr-2" />
                {sending ? 'Sending Alert...' : 'Send Emergency Alert'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
              <CardDescription>History of emergency notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <AlertTriangle className={`h-5 w-5 ${
                        alert.severity === 'Critical' ? 'text-red-600' :
                        alert.severity === 'High' ? 'text-orange-600' :
                        'text-yellow-600'
                      }`} />
                      <div>
                        <h3 className="font-medium">{alert.type}</h3>
                        <p className="text-sm text-gray-500">
                          {alert.sent} • {alert.recipients} recipients
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{alert.severity}</Badge>
                      <Badge variant="outline">{alert.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Total Recipients</span>
                </div>
                <span className="font-bold">150</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Buildings</span>
                </div>
                <span className="font-bold">3</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Alerts This Month</span>
                </div>
                <span className="font-bold">8</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alert Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
                Fire Emergency
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <AlertTriangle className="h-4 w-4 mr-2 text-blue-600" />
                Water Outage
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <AlertTriangle className="h-4 w-4 mr-2 text-yellow-600" />
                Severe Weather
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <AlertTriangle className="h-4 w-4 mr-2 text-orange-600" />
                Power Outage
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}