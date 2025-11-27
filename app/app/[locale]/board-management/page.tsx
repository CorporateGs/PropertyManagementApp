'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Calendar, FileText, Vote, CheckCircle, Clock, Download, Upload, UserCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

export default function BoardManagementPage() {
  const [selectedMeeting, setSelectedMeeting] = useState('');

  const boardMembers = [
    { id: 1, name: 'John Smith', position: 'President', term: '2023-2025', email: 'john.smith@email.com', phone: '555-0101' },
    { id: 2, name: 'Sarah Johnson', position: 'Vice President', term: '2023-2025', email: 'sarah.j@email.com', phone: '555-0102' },
    { id: 3, name: 'Michael Chen', position: 'Treasurer', term: '2024-2026', email: 'mchen@email.com', phone: '555-0103' },
    { id: 4, name: 'Emily Davis', position: 'Secretary', term: '2024-2026', email: 'emily.d@email.com', phone: '555-0104' },
    { id: 5, name: 'Robert Wilson', position: 'Member at Large', term: '2023-2025', email: 'rwilson@email.com', phone: '555-0105' },
  ];

  const meetings = [
    {
      id: 1,
      title: 'Annual General Meeting',
      date: '2024-02-15',
      time: '7:00 PM',
      location: 'Community Room',
      type: 'AGM',
      status: 'Scheduled',
      attendees: 45,
      proxies: 12,
      agenda: ['Financial Review', 'Budget Approval', 'Board Elections', 'Bylaw Amendments'],
    },
    {
      id: 2,
      title: 'Monthly Board Meeting',
      date: '2024-01-25',
      time: '6:30 PM',
      location: 'Virtual Meeting',
      type: 'Regular',
      status: 'Scheduled',
      attendees: 8,
      proxies: 2,
      agenda: ['Maintenance Updates', 'Financial Report', 'New Business'],
    },
    {
      id: 3,
      title: 'Special Meeting - Roof Repairs',
      date: '2024-01-10',
      time: '7:00 PM',
      location: 'Community Room',
      type: 'Special',
      status: 'Completed',
      attendees: 32,
      proxies: 8,
      agenda: ['Roof Inspection Report', 'Contractor Proposals', 'Funding Discussion'],
      minutes: 'Available',
    },
  ];

  const motions = [
    {
      id: 1,
      title: 'Approve 2024 Budget',
      meeting: 'Monthly Board Meeting - Jan 2024',
      proposedBy: 'Michael Chen',
      status: 'Passed',
      votesFor: 6,
      votesAgainst: 1,
      abstentions: 1,
      date: '2024-01-25',
    },
    {
      id: 2,
      title: 'Hire New Property Manager',
      meeting: 'Special Meeting - Dec 2023',
      proposedBy: 'John Smith',
      status: 'Passed',
      votesFor: 7,
      votesAgainst: 0,
      abstentions: 1,
      date: '2023-12-15',
    },
  ];

  const proxies = [
    { id: 1, owner: 'David Brown - Unit 305', proxy: 'John Smith', meeting: 'AGM 2024', status: 'Approved', submittedDate: '2024-01-15' },
    { id: 2, owner: 'Lisa Anderson - Unit 412', proxy: 'Sarah Johnson', meeting: 'AGM 2024', status: 'Pending', submittedDate: '2024-01-18' },
    { id: 3, owner: 'Tom Wilson - Unit 208', proxy: 'Michael Chen', meeting: 'AGM 2024', status: 'Approved', submittedDate: '2024-01-12' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Board Management</h1>
        <p className="mt-2 text-gray-600">
          Manage board meetings, members, voting, and proxies
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Board Members</CardTitle>
                  <CardDescription>Current board composition</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Members
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {boardMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-lg font-semibold text-blue-600">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold">{member.name}</h4>
                        <p className="text-sm text-gray-600">{member.position}</p>
                        <p className="text-xs text-gray-500">Term: {member.term}</p>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      <p>{member.email}</p>
                      <p>{member.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Meetings</CardTitle>
                  <CardDescription>Upcoming and past board meetings</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule Meeting
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Schedule Board Meeting</DialogTitle>
                      <DialogDescription>Create a new board meeting</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Meeting Title</Label>
                        <Input placeholder="e.g., Monthly Board Meeting" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Meeting Type</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="regular">Regular Meeting</SelectItem>
                              <SelectItem value="special">Special Meeting</SelectItem>
                              <SelectItem value="agm">Annual General Meeting</SelectItem>
                              <SelectItem value="emergency">Emergency Meeting</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Date</Label>
                          <Input type="date" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Time</Label>
                          <Input type="time" />
                        </div>
                        <div className="space-y-2">
                          <Label>Location</Label>
                          <Input placeholder="Community Room or Virtual" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Agenda Items</Label>
                        <Textarea placeholder="Enter agenda items (one per line)" rows={6} />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="proxies" defaultChecked />
                        <label htmlFor="proxies" className="text-sm cursor-pointer">
                          Allow proxy voting
                        </label>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline">Cancel</Button>
                        <Button>Schedule Meeting</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {meetings.map((meeting) => (
                  <Card key={meeting.id} className="hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold">{meeting.title}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              meeting.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {meeting.status}
                            </span>
                            <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                              {meeting.type}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 mb-3 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {meeting.date} at {meeting.time}
                            </span>
                            <span>{meeting.location}</span>
                          </div>
                          <div className="mb-3">
                            <p className="text-sm font-semibold mb-1">Agenda:</p>
                            <ul className="text-sm text-gray-600 list-disc list-inside">
                              {meeting.agenda.map((item, index) => (
                                <li key={index}>{item}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>
                              <Users className="h-4 w-4 inline mr-1" />
                              {meeting.attendees} Attendees
                            </span>
                            <span>
                              <UserCheck className="h-4 w-4 inline mr-1" />
                              {meeting.proxies} Proxies
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2 ml-4">
                          {meeting.minutes && (
                            <Button size="sm" variant="outline">
                              <Download className="mr-2 h-4 w-4" />
                              Minutes
                            </Button>
                          )}
                          <Button size="sm">View Details</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Motions & Voting</CardTitle>
              <CardDescription>Board decisions and voting history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {motions.map((motion) => (
                  <div key={motion.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{motion.title}</h4>
                        <p className="text-sm text-gray-600">{motion.meeting}</p>
                        <p className="text-xs text-gray-500">Proposed by {motion.proposedBy}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs rounded-full ${
                        motion.status === 'Passed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {motion.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-6 text-sm">
                      <span className="text-green-600">
                        <CheckCircle className="h-4 w-4 inline mr-1" />
                        For: {motion.votesFor}
                      </span>
                      <span className="text-red-600">
                        Against: {motion.votesAgainst}
                      </span>
                      <span className="text-gray-600">
                        Abstentions: {motion.abstentions}
                      </span>
                      <span className="text-gray-500 ml-auto">{motion.date}</span>
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
              <CardTitle className="text-lg">Proxy Management</CardTitle>
              <CardDescription>Manage proxy voting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full">
                <Upload className="mr-2 h-4 w-4" />
                Submit Proxy Form
              </Button>
              <div className="space-y-3">
                {proxies.map((proxy) => (
                  <div key={proxy.id} className="p-3 border rounded-lg text-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{proxy.owner}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        proxy.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {proxy.status}
                      </span>
                    </div>
                    <p className="text-gray-600">Proxy: {proxy.proxy}</p>
                    <p className="text-gray-500 text-xs">{proxy.meeting}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Meeting Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Meetings This Year</span>
                <span className="font-semibold">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Attendance</span>
                <span className="font-semibold">78%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Motions Passed</span>
                <span className="font-semibold">24</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Proxies</span>
                <span className="font-semibold">12</span>
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
                View Bylaws
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="mr-2 h-4 w-4" />
                Download Minutes
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Vote className="mr-2 h-4 w-4" />
                Start New Vote
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Meeting Calendar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
