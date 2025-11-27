'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Plus, Users, MapPin, Clock, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

export default function CommunityCalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEventDialog, setShowEventDialog] = useState(false);

  const events = [
    {
      id: 1,
      title: 'Board Meeting',
      type: 'Meeting',
      date: '2024-01-25',
      time: '7:00 PM',
      location: 'Community Room',
      attendees: 15,
      maxAttendees: 20,
      rsvpRequired: true,
      fee: 0,
      description: 'Monthly board meeting to discuss building matters',
    },
    {
      id: 2,
      title: 'Yoga Class',
      type: 'Social',
      date: '2024-01-22',
      time: '6:00 PM',
      location: 'Fitness Center',
      attendees: 12,
      maxAttendees: 15,
      rsvpRequired: true,
      fee: 10,
      description: 'Weekly yoga session for residents',
    },
    {
      id: 3,
      title: 'Pool Maintenance',
      type: 'Maintenance',
      date: '2024-01-23',
      time: '9:00 AM',
      location: 'Pool Area',
      attendees: 0,
      maxAttendees: null,
      rsvpRequired: false,
      fee: 0,
      description: 'Scheduled pool cleaning and maintenance',
    },
    {
      id: 4,
      title: 'Movie Night',
      type: 'Social',
      date: '2024-01-27',
      time: '8:00 PM',
      location: 'Theater Room',
      attendees: 25,
      maxAttendees: 30,
      rsvpRequired: true,
      fee: 5,
      description: 'Community movie night with popcorn',
    },
  ];

  const eventTypes = [
    { value: 'social', label: 'Social Event', color: 'bg-blue-100 text-blue-800' },
    { value: 'meeting', label: 'Meeting', color: 'bg-purple-100 text-purple-800' },
    { value: 'maintenance', label: 'Maintenance', color: 'bg-orange-100 text-orange-800' },
    { value: 'holiday', label: 'Holiday', color: 'bg-green-100 text-green-800' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Community Calendar</h1>
          <p className="mt-2 text-gray-600">
            View and manage community events, meetings, and activities
          </p>
        </div>
        <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
              <DialogDescription>Schedule a community event or meeting</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Event Title</Label>
                  <Input placeholder="Enter event name" />
                </div>
                <div className="space-y-2">
                  <Label>Event Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input type="time" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Input placeholder="Event location" />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Event details..." rows={4} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max Attendees</Label>
                  <Input type="number" placeholder="Leave empty for unlimited" />
                </div>
                <div className="space-y-2">
                  <Label>Fee (if applicable)</Label>
                  <Input type="number" placeholder="0.00" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="rsvp" />
                  <label htmlFor="rsvp" className="text-sm cursor-pointer">
                    Require RSVP
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="payment" />
                  <label htmlFor="payment" className="text-sm cursor-pointer">
                    Require Payment
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="recurring" />
                  <label htmlFor="recurring" className="text-sm cursor-pointer">
                    Recurring Event
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowEventDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowEventDialog(false)}>Create Event</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Events scheduled for this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.map((event) => {
                  const eventType = eventTypes.find(t => t.label === event.type);
                  return (
                    <Card key={event.id} className="hover:shadow-lg transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold">{event.title}</h3>
                              <span className={`px-2 py-1 text-xs rounded-full ${eventType?.color}`}>
                                {event.type}
                              </span>
                            </div>
                            <div className="space-y-2 text-sm text-gray-600">
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4" />
                                <span>{event.date} at {event.time}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4" />
                                <span>{event.location}</span>
                              </div>
                              {event.maxAttendees && (
                                <div className="flex items-center space-x-2">
                                  <Users className="h-4 w-4" />
                                  <span>{event.attendees} / {event.maxAttendees} attendees</span>
                                </div>
                              )}
                              {event.fee > 0 && (
                                <div className="flex items-center space-x-2">
                                  <DollarSign className="h-4 w-4" />
                                  <span>${event.fee} per person</span>
                                </div>
                              )}
                            </div>
                            <p className="mt-3 text-sm text-gray-700">{event.description}</p>
                          </div>
                          <div className="flex flex-col space-y-2 ml-4">
                            {event.rsvpRequired && (
                              <Button size="sm">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                RSVP
                              </Button>
                            )}
                            <Button variant="outline" size="sm">View Details</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Calendar View</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-7 gap-1 text-center text-sm font-semibold">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="p-2">{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 35 }, (_, i) => {
                    const day = i - 2;
                    const hasEvent = [22, 23, 25, 27].includes(day);
                    return (
                      <div
                        key={i}
                        className={`aspect-square p-2 text-center text-sm border rounded cursor-pointer hover:bg-gray-50 ${
                          day < 1 || day > 31 ? 'text-gray-300' : ''
                        } ${hasEvent ? 'bg-blue-50 border-blue-300 font-semibold' : ''}`}
                      >
                        {day > 0 && day <= 31 ? day : ''}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Event Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Events This Month</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Your RSVPs</span>
                  <span className="font-semibold">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Upcoming This Week</span>
                  <span className="font-semibold">4</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Attendance</span>
                  <span className="font-semibold">85%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                View My RSVPs
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Manage Attendees
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Clock className="mr-2 h-4 w-4" />
                Event History
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
