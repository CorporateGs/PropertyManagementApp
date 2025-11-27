'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, AlertTriangle, Camera, FileText, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function SecurityIncidentsPage() {
  const [selectedSeverity, setSelectedSeverity] = useState('all');

  const incidents = [
    {
      id: 'INC-2024-001',
      type: 'Security Breach',
      severity: 'High',
      location: 'Main Entrance',
      building: 'Maple Heights',
      reportedBy: 'Security Guard',
      reportedDate: '2024-01-20 11:30 PM',
      status: 'Under Investigation',
      description: 'Unauthorized access attempt detected at main entrance',
      hasEvidence: true,
      assignedTo: 'Security Team',
    },
    {
      id: 'INC-2024-002',
      type: 'Noise Complaint',
      severity: 'Low',
      location: 'Unit 405',
      building: 'Maple Heights',
      reportedBy: 'Resident - Unit 404',
      reportedDate: '2024-01-20 10:15 PM',
      status: 'Resolved',
      description: 'Loud music reported from neighboring unit',
      hasEvidence: false,
      assignedTo: 'Property Manager',
      resolvedDate: '2024-01-21 9:00 AM',
    },
    {
      id: 'INC-2024-003',
      type: 'Vandalism',
      severity: 'Medium',
      location: 'Parking Garage Level 2',
      building: 'Downtown Towers',
      reportedBy: 'Resident - Unit 302',
      reportedDate: '2024-01-19 8:45 AM',
      status: 'In Progress',
      description: 'Graffiti found on parking garage wall',
      hasEvidence: true,
      assignedTo: 'Maintenance Team',
    },
    {
      id: 'INC-2024-004',
      type: 'Suspicious Activity',
      severity: 'Medium',
      location: 'Lobby',
      building: 'Riverside Apartments',
      reportedBy: 'Concierge',
      reportedDate: '2024-01-18 3:20 PM',
      status: 'Resolved',
      description: 'Unknown individual loitering in lobby area',
      hasEvidence: true,
      assignedTo: 'Security Team',
      resolvedDate: '2024-01-18 4:00 PM',
    },
  ];

  const incidentTypes = [
    'Security Breach',
    'Theft',
    'Vandalism',
    'Noise Complaint',
    'Suspicious Activity',
    'Fire Alarm',
    'Medical Emergency',
    'Property Damage',
    'Harassment',
    'Other',
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      case 'Under Investigation':
        return 'bg-blue-100 text-blue-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Security & Incident Reporting</h1>
          <p className="mt-2 text-gray-600">
            Track and manage security incidents and reports
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <AlertTriangle className="mr-2 h-4 w-4" />
              Report Incident
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Report Security Incident</DialogTitle>
              <DialogDescription>Provide details about the incident</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Incident Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {incidentTypes.map((type) => (
                        <SelectItem key={type} value={type.toLowerCase().replace(' ', '-')}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Severity Level</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
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
                  <Label>Location</Label>
                  <Input placeholder="e.g., Lobby, Unit 305, Parking" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date & Time</Label>
                  <Input type="datetime-local" />
                </div>
                <div className="space-y-2">
                  <Label>Your Name (Optional)</Label>
                  <Input placeholder="Anonymous reporting available" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Incident Description</Label>
                <Textarea
                  placeholder="Provide detailed description of the incident..."
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label>Upload Evidence (Photos/Videos)</Label>
                <Input type="file" multiple accept="image/*,video/*" />
                <p className="text-sm text-gray-500">
                  Upload any photos, videos, or documents related to the incident
                </p>
              </div>

              <div className="space-y-2">
                <Label>Witnesses (Optional)</Label>
                <Input placeholder="Names or unit numbers of witnesses" />
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="anonymous" className="rounded" />
                <label htmlFor="anonymous" className="text-sm cursor-pointer">
                  Submit anonymously
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline">Cancel</Button>
                <Button>Submit Report</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Open Incidents</p>
                <p className="text-3xl font-bold text-red-600">
                  {incidents.filter(i => i.status !== 'Resolved').length}
                </p>
              </div>
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Under Investigation</p>
                <p className="text-3xl font-bold text-blue-600">
                  {incidents.filter(i => i.status === 'Under Investigation').length}
                </p>
              </div>
              <Shield className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved This Week</p>
                <p className="text-3xl font-bold text-green-600">
                  {incidents.filter(i => i.status === 'Resolved').length}
                </p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total This Month</p>
                <p className="text-3xl font-bold text-gray-900">{incidents.length}</p>
              </div>
              <FileText className="h-10 w-10 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 flex gap-4">
        <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Filter by severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Incident Reports</CardTitle>
          <CardDescription>All security incidents and reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {incidents.map((incident) => (
              <Card key={incident.id} className="hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold">{incident.type}</h3>
                        <span className={`px-3 py-1 text-xs rounded-full border ${getSeverityColor(incident.severity)}`}>
                          {incident.severity} Priority
                        </span>
                        <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(incident.status)}`}>
                          {incident.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm text-gray-600">
                        <div>
                          <span className="font-semibold">ID:</span> {incident.id}
                        </div>
                        <div>
                          <span className="font-semibold">Location:</span> {incident.location}
                        </div>
                        <div>
                          <span className="font-semibold">Building:</span> {incident.building}
                        </div>
                        <div>
                          <span className="font-semibold">Reported By:</span> {incident.reportedBy}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{incident.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {incident.reportedDate}
                        </span>
                        {incident.hasEvidence && (
                          <span className="flex items-center text-blue-600">
                            <Camera className="h-4 w-4 mr-1" />
                            Evidence Attached
                          </span>
                        )}
                        <span>
                          <span className="font-semibold">Assigned:</span> {incident.assignedTo}
                        </span>
                      </div>
                      {incident.resolvedDate && (
                        <div className="mt-2 text-sm text-green-600">
                          <CheckCircle className="h-4 w-4 inline mr-1" />
                          Resolved on {incident.resolvedDate}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col space-y-2 ml-4">
                      <Button size="sm" variant="outline">
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                      {incident.status !== 'Resolved' && (
                        <Button size="sm">Update Status</Button>
                      )}
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
            <CardTitle>Incident Statistics</CardTitle>
            <CardDescription>Monthly overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Most Common Type</span>
              <span className="font-semibold">Noise Complaints</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average Resolution Time</span>
              <span className="font-semibold">2.3 days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Resolution Rate</span>
              <span className="font-semibold">94%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">High Priority Incidents</span>
              <span className="font-semibold text-red-600">1</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common security tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <Camera className="mr-2 h-4 w-4" />
              View Security Cameras
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Generate Security Report
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Shield className="mr-2 h-4 w-4" />
              Access Control Logs
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Emergency Contacts
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
