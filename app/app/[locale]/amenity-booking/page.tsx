'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dumbbell, Waves, Users, Car, Calendar, Clock, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function AmenityBookingPage() {
  const [selectedAmenity, setSelectedAmenity] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const amenities = [
    {
      id: 'gym',
      name: 'Fitness Center',
      icon: Dumbbell,
      description: 'Fully equipped gym with cardio and weight training equipment',
      capacity: 15,
      hourlyRate: 0,
      requiresPayment: false,
      availableHours: '6:00 AM - 10:00 PM',
      bookingDuration: 2,
    },
    {
      id: 'pool',
      name: 'Swimming Pool',
      icon: Waves,
      description: 'Heated indoor pool with lap lanes',
      capacity: 20,
      hourlyRate: 0,
      requiresPayment: false,
      availableHours: '7:00 AM - 9:00 PM',
      bookingDuration: 2,
    },
    {
      id: 'party-room',
      name: 'Party Room',
      icon: Users,
      description: 'Large event space with kitchen facilities',
      capacity: 50,
      hourlyRate: 75,
      requiresPayment: true,
      availableHours: '9:00 AM - 11:00 PM',
      bookingDuration: 4,
    },
    {
      id: 'guest-parking',
      name: 'Guest Parking',
      icon: Car,
      description: 'Reserved parking spots for visitors',
      capacity: 10,
      hourlyRate: 5,
      requiresPayment: true,
      availableHours: '24/7',
      bookingDuration: 24,
    },
  ];

  const myBookings = [
    {
      id: 1,
      amenity: 'Party Room',
      date: '2024-02-15',
      time: '6:00 PM - 10:00 PM',
      status: 'Confirmed',
      cost: 300,
      paid: true,
    },
    {
      id: 2,
      amenity: 'Fitness Center',
      date: '2024-01-22',
      time: '7:00 AM - 9:00 AM',
      status: 'Confirmed',
      cost: 0,
      paid: true,
    },
    {
      id: 3,
      amenity: 'Guest Parking',
      date: '2024-01-25',
      time: '2:00 PM - 8:00 PM',
      status: 'Pending Payment',
      cost: 30,
      paid: false,
    },
  ];

  const timeSlots = [
    '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
    '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Amenity Booking</h1>
        <p className="mt-2 text-gray-600">
          Reserve building amenities and facilities
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {amenities.map((amenity) => {
              const Icon = amenity.icon;
              return (
                <Card key={amenity.id} className="hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{amenity.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {amenity.requiresPayment ? `$${amenity.hourlyRate}/hour` : 'Free'}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">{amenity.description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Capacity:</span>
                        <span className="font-semibold">{amenity.capacity} people</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Available:</span>
                        <span className="font-semibold">{amenity.availableHours}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Min. Duration:</span>
                        <span className="font-semibold">{amenity.bookingDuration} hours</span>
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full" onClick={() => setSelectedAmenity(amenity.id)}>
                          <Calendar className="mr-2 h-4 w-4" />
                          Book Now
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Book {amenity.name}</DialogTitle>
                          <DialogDescription>{amenity.description}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Select Date</Label>
                              <Input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Select Time</Label>
                              <Select value={selectedTime} onValueChange={setSelectedTime}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose time" />
                                </SelectTrigger>
                                <SelectContent>
                                  {timeSlots.map((time) => (
                                    <SelectItem key={time} value={time}>
                                      {time}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Duration (hours)</Label>
                            <Select defaultValue={amenity.bookingDuration.toString()}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[1, 2, 3, 4, 5, 6, 8, 12, 24].map((hours) => (
                                  <SelectItem key={hours} value={hours.toString()}>
                                    {hours} {hours === 1 ? 'hour' : 'hours'}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Number of Guests</Label>
                            <Input type="number" placeholder="Enter number of guests" max={amenity.capacity} />
                          </div>

                          <div className="space-y-2">
                            <Label>Special Requests (Optional)</Label>
                            <Input placeholder="Any special requirements?" />
                          </div>

                          {amenity.requiresPayment && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold">Total Cost:</span>
                                <span className="text-2xl font-bold text-blue-600">
                                  ${amenity.hourlyRate * amenity.bookingDuration}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-2">
                                Payment will be processed upon confirmation
                              </p>
                            </div>
                          )}

                          <div className="flex justify-end space-x-2">
                            <Button variant="outline">Cancel</Button>
                            <Button>Confirm Booking</Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>My Bookings</CardTitle>
              <CardDescription>Your upcoming and past reservations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold">{booking.amenity}</h4>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {booking.date}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {booking.time}
                        </span>
                        {booking.cost > 0 && (
                          <span className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            ${booking.cost}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          booking.status === 'Confirmed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {booking.status}
                      </span>
                      {!booking.paid && (
                        <Button size="sm">Pay Now</Button>
                      )}
                      <Button variant="outline" size="sm">
                        <XCircle className="h-4 w-4" />
                      </Button>
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
              <CardTitle className="text-lg">Booking Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Book up to 30 days in advance</li>
                <li>✓ Cancel up to 24 hours before</li>
                <li>✓ Maximum 2 active bookings per resident</li>
                <li>✓ Payment required for premium amenities</li>
                <li>✓ Refunds issued for cancellations</li>
                <li>✓ Late cancellations may incur fees</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Availability Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select amenity" />
                  </SelectTrigger>
                  <SelectContent>
                    {amenities.map((amenity) => (
                      <SelectItem key={amenity.id} value={amenity.id}>
                        {amenity.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={i} className="p-2 font-semibold">{day}</div>
                  ))}
                  {Array.from({ length: 35 }, (_, i) => {
                    const day = i - 2;
                    const isBooked = [5, 12, 19, 26].includes(day);
                    return (
                      <div
                        key={i}
                        className={`aspect-square p-1 text-center border rounded text-xs cursor-pointer hover:bg-gray-50 ${
                          day < 1 || day > 31 ? 'text-gray-300' : ''
                        } ${isBooked ? 'bg-red-100 border-red-300' : 'bg-green-50'}`}
                      >
                        {day > 0 && day <= 31 ? day : ''}
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-green-50 border rounded"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-red-100 border-red-300 border rounded"></div>
                    <span>Booked</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Bookings</span>
                  <span className="font-semibold">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Spent</span>
                  <span className="font-semibold">$450</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Bookings This Month</span>
                  <span className="font-semibold">5</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
