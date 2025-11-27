
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Thermometer,
  Zap,
  Shield,
  Wifi,
  Camera,
  Lock,
  Car,
  Droplets,
  Wind,
  Battery,
  Activity,
  AlertTriangle,
  CheckCircle,
  Settings,
  Smartphone,
  Lightbulb,
  Eye,
  Gauge,
  MapPin,
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface SmartDevice {
  id: string;
  name: string;
  type: 'thermostat' | 'lock' | 'camera' | 'sensor' | 'meter';
  location: string;
  status: 'online' | 'offline' | 'error';
  battery?: number;
  lastUpdate: Date;
  value?: number;
  unit?: string;
  settings?: any;
}

interface ParkingSpace {
  id: string;
  spaceNumber: string;
  floor: string;
  type: 'standard' | 'compact' | 'handicap' | 'ev' | 'motorcycle';
  isOccupied: boolean;
  tenant?: string;
  vehicle?: string;
  monthlyRate: number;
}

const mockDevices: SmartDevice[] = [
  {
    id: '1',
    name: 'Lobby Thermostat',
    type: 'thermostat',
    location: 'Building A - Lobby',
    status: 'online',
    battery: 89,
    lastUpdate: new Date(Date.now() - 300000),
    value: 72,
    unit: '°F'
  },
  {
    id: '2',
    name: 'Main Entrance Lock',
    type: 'lock',
    location: 'Building A - Main Door',
    status: 'online',
    battery: 94,
    lastUpdate: new Date(Date.now() - 120000)
  },
  {
    id: '3',
    name: 'Parking Garage Camera',
    type: 'camera',
    location: 'Parking Garage - Level 1',
    status: 'online',
    lastUpdate: new Date(Date.now() - 60000)
  },
  {
    id: '4',
    name: 'Water Flow Sensor',
    type: 'sensor',
    location: 'Building A - Mechanical Room',
    status: 'error',
    battery: 23,
    lastUpdate: new Date(Date.now() - 1800000),
    value: 0,
    unit: 'gpm'
  },
  {
    id: '5',
    name: 'Energy Meter',
    type: 'meter',
    location: 'Building A - Electrical Room',
    status: 'online',
    lastUpdate: new Date(Date.now() - 900000),
    value: 847,
    unit: 'kWh'
  }
];

const mockParkingSpaces: ParkingSpace[] = [
  { id: '1', spaceNumber: 'A-001', floor: 'Level 1', type: 'standard', isOccupied: true, tenant: 'Sarah Johnson', vehicle: 'Toyota Camry', monthlyRate: 150 },
  { id: '2', spaceNumber: 'A-002', floor: 'Level 1', type: 'standard', isOccupied: false, monthlyRate: 150 },
  { id: '3', spaceNumber: 'A-003', floor: 'Level 1', type: 'handicap', isOccupied: false, monthlyRate: 100 },
  { id: '4', spaceNumber: 'A-004', floor: 'Level 1', type: 'ev', isOccupied: true, tenant: 'Mike Chen', vehicle: 'Tesla Model 3', monthlyRate: 200 },
  { id: '5', spaceNumber: 'B-101', floor: 'Level 2', type: 'compact', isOccupied: true, tenant: 'Emma Wilson', vehicle: 'Honda Civic', monthlyRate: 125 },
  { id: '6', spaceNumber: 'B-102', floor: 'Level 2', type: 'standard', isOccupied: false, monthlyRate: 150 },
];

export function SmartBuilding() {
  const [selectedBuilding, setSelectedBuilding] = useState('building-a');
  const [activeTab, setActiveTab] = useState('devices');
  const [devices, setDevices] = useState(mockDevices);

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'thermostat': return Thermometer;
      case 'lock': return Lock;
      case 'camera': return Camera;
      case 'sensor': return Activity;
      case 'meter': return Gauge;
      default: return Settings;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100';
      case 'offline': return 'text-gray-600 bg-gray-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getParkingTypeColor = (type: string) => {
    switch (type) {
      case 'ev': return 'bg-green-100 text-green-700';
      case 'handicap': return 'bg-blue-100 text-blue-700';
      case 'compact': return 'bg-orange-100 text-orange-700';
      case 'motorcycle': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getDeviceValue = (device: SmartDevice) => {
    if (device.value !== undefined) {
      return `${device.value}${device.unit || ''}`;
    }
    return device.status === 'online' ? 'Active' : 'Inactive';
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Smartphone className="h-8 w-8 mr-3 text-blue-600" />
            Smart Building Control
          </h1>
          <p className="text-gray-600 mt-2">
            IoT devices, parking management, and intelligent automation
          </p>
        </div>
        <div className="flex space-x-3">
          <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="building-a">Building A - Main</SelectItem>
              <SelectItem value="building-b">Building B - East Wing</SelectItem>
              <SelectItem value="building-c">Building C - West Tower</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Dashboard Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-100 rounded-lg">
                <Wifi className="h-6 w-6 text-green-600" />
              </div>
              <Badge variant="default" className="bg-green-600">Online</Badge>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">127</p>
              <p className="text-gray-600 text-sm">Connected Devices</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <Badge variant="secondary">-12%</Badge>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">2,847</p>
              <p className="text-gray-600 text-sm">kWh This Month</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Car className="h-6 w-6 text-orange-600" />
              </div>
              <Badge variant="secondary">85%</Badge>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">68/80</p>
              <p className="text-gray-600 text-sm">Parking Occupancy</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <Badge variant="default">Secure</Badge>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">98.9%</p>
              <p className="text-gray-600 text-sm">Security Score</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="devices">IoT Devices</TabsTrigger>
          <TabsTrigger value="parking">Parking</TabsTrigger>
          <TabsTrigger value="energy">Energy</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Device List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Smart Devices</CardTitle>
                  <CardDescription>
                    Monitor and control all connected IoT devices
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {devices.map((device) => {
                    const DeviceIcon = getDeviceIcon(device.type);
                    return (
                      <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${getStatusColor(device.status)}`}>
                            <DeviceIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{device.name}</p>
                            <p className="text-sm text-gray-500">{device.location}</p>
                            <p className="text-xs text-gray-400">
                              Last update: {device.lastUpdate.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant={device.status === 'online' ? 'default' : device.status === 'error' ? 'destructive' : 'secondary'}>
                              {device.status}
                            </Badge>
                          </div>
                          <p className="text-lg font-semibold">{getDeviceValue(device)}</p>
                          {device.battery && (
                            <div className="flex items-center space-x-1 mt-1">
                              <Battery className="h-3 w-3 text-gray-500" />
                              <span className="text-xs text-gray-500">{device.battery}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Device Controls */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Lobby Temperature</span>
                      <span className="font-medium">72°F</span>
                    </div>
                    <Slider
                      value={[72]}
                      max={85}
                      min={60}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Common Area Lights</span>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Security Mode</span>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Energy Saving Mode</span>
                    <Switch />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: 'HVAC System', status: 'operational', icon: Wind },
                    { name: 'Fire Safety', status: 'operational', icon: Shield },
                    { name: 'Water System', status: 'warning', icon: Droplets },
                    { name: 'Electrical', status: 'operational', icon: Zap }
                  ].map((system, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <system.icon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{system.name}</span>
                      </div>
                      <Badge variant={system.status === 'operational' ? 'default' : 'secondary'}>
                        {system.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="parking" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Parking Grid */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Parking Spaces Overview</CardTitle>
                  <CardDescription>
                    Real-time parking availability and management
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {mockParkingSpaces.map((space) => (
                      <div
                        key={space.id}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                          space.isOccupied
                            ? 'border-red-200 bg-red-50'
                            : 'border-green-200 bg-green-50 hover:border-green-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{space.spaceNumber}</span>
                          <div className={`w-3 h-3 rounded-full ${
                            space.isOccupied ? 'bg-red-500' : 'bg-green-500'
                          }`}></div>
                        </div>
                        <div className="space-y-1">
                          <Badge variant="outline" className={`text-xs ${getParkingTypeColor(space.type)}`}>
                            {space.type}
                          </Badge>
                          <p className="text-xs text-gray-600">{space.floor}</p>
                          {space.isOccupied && space.tenant && (
                            <>
                              <p className="text-xs font-medium">{space.tenant}</p>
                              <p className="text-xs text-gray-500">{space.vehicle}</p>
                            </>
                          )}
                          <p className="text-xs font-medium text-green-600">${space.monthlyRate}/month</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Parking Analytics */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Occupancy Analytics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Current Occupancy</span>
                      <span className="font-medium">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 bg-green-50 rounded">
                      <div className="text-lg font-bold text-green-600">12</div>
                      <div className="text-xs text-gray-600">Available</div>
                    </div>
                    <div className="p-2 bg-red-50 rounded">
                      <div className="text-lg font-bold text-red-600">68</div>
                      <div className="text-xs text-gray-600">Occupied</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {[
                      { type: 'Standard', count: 45, available: 8 },
                      { type: 'Compact', count: 20, available: 3 },
                      { type: 'EV Charging', count: 10, available: 1 },
                      { type: 'Handicap', count: 5, available: 0 }
                    ].map((type, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span>{type.type}</span>
                        <span className="text-gray-500">
                          {type.available}/{type.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">$10,250</div>
                    <div className="text-sm text-gray-600">Monthly Revenue</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Collection Rate</span>
                      <span className="font-medium text-green-600">97.2%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Avg. Monthly Rate</span>
                      <span className="font-medium">$151</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Waitlist</span>
                      <span className="font-medium">23 tenants</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="energy" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                  Electricity Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold">2,847 kWh</div>
                  <div className="text-sm text-gray-600">This Month</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>vs. Last Month</span>
                    <span className="text-green-600 flex items-center">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      -12%
                    </span>
                  </div>
                  <Progress value={88} className="h-2" />
                  <div className="text-xs text-gray-500">12% below target</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Droplets className="h-5 w-5 mr-2 text-blue-500" />
                  Water Consumption
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold">18,450 gal</div>
                  <div className="text-sm text-gray-600">This Month</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>vs. Last Month</span>
                    <span className="text-red-600 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +8%
                    </span>
                  </div>
                  <Progress value={108} className="h-2" />
                  <div className="text-xs text-gray-500">8% above target</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wind className="h-5 w-5 mr-2 text-green-500" />
                  HVAC Efficiency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold">94.2%</div>
                  <div className="text-sm text-gray-600">Efficiency Score</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Energy Savings</span>
                    <span className="text-green-600">$1,240/mo</span>
                  </div>
                  <Progress value={94} className="h-2" />
                  <div className="text-xs text-gray-500">Excellent performance</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Energy Optimization Recommendations</CardTitle>
              <CardDescription>AI-powered suggestions to reduce energy costs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    title: 'Install Smart Thermostats in Units',
                    description: 'Upgrade 15 remaining units with smart thermostats',
                    impact: 'Save $890/month',
                    priority: 'high'
                  },
                  {
                    title: 'LED Lighting in Common Areas',
                    description: 'Replace fluorescent lights in hallways and garage',
                    impact: 'Save $420/month',
                    priority: 'medium'
                  },
                  {
                    title: 'Window Film Installation',
                    description: 'Energy-efficient film on south-facing windows',
                    impact: 'Save $210/month',
                    priority: 'low'
                  }
                ].map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                    <Lightbulb className="h-5 w-5 text-yellow-500 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium">{recommendation.title}</h4>
                        <Badge variant={recommendation.priority === 'high' ? 'destructive' : recommendation.priority === 'medium' ? 'secondary' : 'outline'}>
                          {recommendation.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{recommendation.description}</p>
                      <p className="text-sm font-medium text-green-600">{recommendation.impact}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="h-5 w-5 mr-2 text-blue-500" />
                  Security Cameras
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: 'Main Entrance', status: 'online', alerts: 0 },
                  { name: 'Parking Garage', status: 'online', alerts: 2 },
                  { name: 'Lobby', status: 'online', alerts: 0 },
                  { name: 'Back Exit', status: 'offline', alerts: 1 },
                  { name: 'Rooftop', status: 'online', alerts: 0 }
                ].map((camera, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${camera.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="font-medium">{camera.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {camera.alerts > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {camera.alerts} alerts
                        </Badge>
                      )}
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="h-5 w-5 mr-2 text-purple-500" />
                  Access Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">847</div>
                    <div className="text-sm text-gray-600">Entries Today</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">156</div>
                    <div className="text-sm text-gray-600">Active Key Cards</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Recent Activity</h4>
                  {[
                    { user: 'Sarah Johnson', action: 'Main Entrance', time: '2 min ago', status: 'granted' },
                    { user: 'Mike Chen', action: 'Parking Garage', time: '5 min ago', status: 'granted' },
                    { user: 'Unknown Card', action: 'Back Exit', time: '12 min ago', status: 'denied' },
                    { user: 'Emma Wilson', action: 'Main Entrance', time: '18 min ago', status: 'granted' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium">{activity.user}</p>
                        <p className="text-gray-500">{activity.action}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={activity.status === 'granted' ? 'default' : 'destructive'} className="text-xs mb-1">
                          {activity.status}
                        </Badge>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Automations</CardTitle>
                <CardDescription>
                  Intelligent rules and schedules
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    name: 'Energy Saving Mode',
                    description: 'Automatically adjust lighting and temperature during off-hours',
                    status: 'active',
                    schedule: 'Daily 10 PM - 6 AM'
                  },
                  {
                    name: 'Security Lock Down',
                    description: 'Lock all entrances and activate security cameras',
                    status: 'active',
                    schedule: 'Daily 11 PM - 5 AM'
                  },
                  {
                    name: 'HVAC Optimization',
                    description: 'Adjust temperature based on occupancy and weather',
                    status: 'active',
                    schedule: 'Continuous'
                  },
                  {
                    name: 'Parking Enforcement',
                    description: 'Monitor parking violations and send notifications',
                    status: 'paused',
                    schedule: 'Business Hours'
                  }
                ].map((automation, index) => (
                  <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${automation.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <h4 className="font-medium">{automation.name}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{automation.description}</p>
                      <p className="text-xs text-gray-500">{automation.schedule}</p>
                    </div>
                    <Switch checked={automation.status === 'active'} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Create New Automation</CardTitle>
                <CardDescription>
                  Set up custom rules and triggers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: 'Temperature Control', icon: Thermometer },
                    { name: 'Lighting Schedule', icon: Lightbulb },
                    { name: 'Security Rules', icon: Shield },
                    { name: 'Energy Saving', icon: Battery }
                  ].map((template, index) => (
                    <Button key={index} variant="outline" className="h-20 flex flex-col">
                      <template.icon className="h-6 w-6 mb-2" />
                      <span className="text-sm">{template.name}</span>
                    </Button>
                  ))}
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    <Button size="sm" className="w-full justify-start">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Emergency Lockdown
                    </Button>
                    <Button size="sm" variant="outline" className="w-full justify-start">
                      <Clock className="h-4 w-4 mr-2" />
                      Schedule Maintenance Mode
                    </Button>
                    <Button size="sm" variant="outline" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      System Diagnostics
                    </Button>
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
