
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  MapPin,
  Users,
  Home,
  DollarSign,
  TrendingUp,
  Calendar,
  Wrench,
  Star,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  Settings,
  Camera,
  FileText
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

interface Building {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  totalUnits: number;
  occupiedUnits: number;
  description: string;
  yearBuilt: number;
  propertyType: 'Apartment' | 'Condo' | 'Townhouse' | 'Single Family' | 'Commercial';
  managementStartDate: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  amenities: string[];
  monthlyRevenue: number;
  averageRent: number;
  maintenanceIssues: number;
  leaseExpirations: number;
  photos?: string[];
  documents?: string[];
  notes?: string;
  rating?: number;
  lastInspection?: string;
  nextInspection?: string;
  insuranceExpiry?: string;
  propertyManager: string;
  emergencyContact: string;
  timezone: string;
  currency: string;
  legalRequirements?: string[];
}

const mockBuildings: Building[] = [
  {
    id: 'building-1',
    name: 'Sunset Apartments',
    address: '123 Main Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
    country: 'USA',
    totalUnits: 20,
    occupiedUnits: 18,
    description: 'Modern apartment building in downtown San Francisco with city views',
    yearBuilt: 2018,
    propertyType: 'Apartment',
    managementStartDate: '2023-01-01',
    ownerName: 'Golden Gate Properties LLC',
    ownerEmail: 'owner@goldengate.com',
    ownerPhone: '(555) 100-0001',
    amenities: ['Gym', 'Rooftop Deck', 'Concierge', 'Parking Garage', 'Laundry'],
    monthlyRevenue: 54500,
    averageRent: 2725,
    maintenanceIssues: 3,
    leaseExpirations: 2,
    rating: 4.5,
    lastInspection: '2023-12-15',
    nextInspection: '2024-03-15',
    insuranceExpiry: '2024-12-31',
    propertyManager: 'Admin User',
    emergencyContact: '(555) 911-HELP',
    timezone: 'PST',
    currency: 'USD',
    legalRequirements: ['Rent Control', 'ADA Compliance', 'Fire Safety']
  },
  {
    id: 'building-2',
    name: 'Garden View Complex',
    address: '456 Oak Avenue',
    city: 'San Jose',
    state: 'CA',
    zipCode: '95123',
    country: 'USA',
    totalUnits: 35,
    occupiedUnits: 32,
    description: 'Family-friendly complex with garden views and playground',
    yearBuilt: 2015,
    propertyType: 'Apartment',
    managementStartDate: '2023-06-01',
    ownerName: 'Valley Residential Group',
    ownerEmail: 'info@valleyresidential.com',
    ownerPhone: '(408) 200-0002',
    amenities: ['Pool', 'Playground', 'BBQ Area', 'Pet Park', 'Club House'],
    monthlyRevenue: 89600,
    averageRent: 2800,
    maintenanceIssues: 5,
    leaseExpirations: 4,
    rating: 4.2,
    lastInspection: '2024-01-10',
    nextInspection: '2024-04-10',
    insuranceExpiry: '2024-11-30',
    propertyManager: 'John Doe',
    emergencyContact: '(408) 911-HELP',
    timezone: 'PST',
    currency: 'USD',
    legalRequirements: ['Fair Housing Act', 'State Building Codes']
  },
  {
    id: 'building-3',
    name: 'Downtown Plaza',
    address: '789 Business Boulevard',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90210',
    country: 'USA',
    totalUnits: 50,
    occupiedUnits: 47,
    description: 'Luxury high-rise in the heart of downtown LA',
    yearBuilt: 2020,
    propertyType: 'Condo',
    managementStartDate: '2023-03-01',
    ownerName: 'Metro Luxury Holdings',
    ownerEmail: 'management@metroluxury.com',
    ownerPhone: '(213) 300-0003',
    amenities: ['Concierge', 'Valet', 'Spa', 'Business Center', 'Sky Lounge', 'Gym'],
    monthlyRevenue: 160000,
    averageRent: 3400,
    maintenanceIssues: 2,
    leaseExpirations: 6,
    rating: 4.8,
    lastInspection: '2024-01-05',
    nextInspection: '2024-04-05',
    insuranceExpiry: '2025-01-15',
    propertyManager: 'Jane Smith',
    emergencyContact: '(213) 911-HELP',
    timezone: 'PST',
    currency: 'USD',
    legalRequirements: ['Luxury Tax Compliance', 'HOA Regulations', 'Seismic Safety']
  },
  {
    id: 'building-4',
    name: 'Maple Heights',
    address: '321 Maple Street',
    city: 'Toronto',
    state: 'ON',
    zipCode: 'M5V 3A8',
    country: 'Canada',
    totalUnits: 25,
    occupiedUnits: 24,
    description: 'Mid-rise apartment building in downtown Toronto',
    yearBuilt: 2017,
    propertyType: 'Apartment',
    managementStartDate: '2023-09-01',
    ownerName: 'Canadian Property Management Inc.',
    ownerEmail: 'info@cpm.ca',
    ownerPhone: '+1 (416) 400-0004',
    amenities: ['Gym', 'Rooftop Patio', 'Storage', 'Bike Storage'],
    monthlyRevenue: 67500,
    averageRent: 2812,
    maintenanceIssues: 1,
    leaseExpirations: 3,
    rating: 4.3,
    lastInspection: '2024-01-20',
    nextInspection: '2024-04-20',
    insuranceExpiry: '2024-10-31',
    propertyManager: 'Sarah Wilson',
    emergencyContact: '+1 (416) 911-HELP',
    timezone: 'EST',
    currency: 'CAD',
    legalRequirements: ['Residential Tenancies Act', 'Building Code of Ontario']
  }
];

export default function BuildingsPage() {
  const [buildings, setBuildings] = useState<Building[]>(mockBuildings);
  const [filteredBuildings, setFilteredBuildings] = useState<Building[]>(mockBuildings);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All Countries');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [newBuilding, setNewBuilding] = useState<Partial<Building>>({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    totalUnits: 0,
    propertyType: 'Apartment',
    yearBuilt: new Date().getFullYear(),
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    description: '',
    amenities: [],
    timezone: 'PST',
    currency: 'USD',
    propertyManager: 'Admin User'
  });

  const countries = ['All Countries', 'USA', 'Canada', 'UK', 'Australia'];
  const propertyTypes = ['All Types', 'Apartment', 'Condo', 'Townhouse', 'Single Family', 'Commercial'];

  useEffect(() => {
    let filtered = buildings;

    if (searchTerm) {
      filtered = filtered.filter(building => 
        building.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        building.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        building.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCountry !== 'All Countries') {
      filtered = filtered.filter(building => building.country === selectedCountry);
    }

    if (selectedType !== 'All Types') {
      filtered = filtered.filter(building => building.propertyType === selectedType);
    }

    setFilteredBuildings(filtered);
  }, [buildings, searchTerm, selectedCountry, selectedType]);

  const handleAddBuilding = () => {
    const building: Building = {
      ...newBuilding as Building,
      id: `building-${Date.now()}`,
      occupiedUnits: 0,
      monthlyRevenue: 0,
      averageRent: 0,
      maintenanceIssues: 0,
      leaseExpirations: 0,
      managementStartDate: new Date().toISOString().split('T')[0],
      emergencyContact: '(555) 911-HELP',
      amenities: newBuilding.amenities || []
    };
    setBuildings([...buildings, building]);
    setNewBuilding({
      name: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
      totalUnits: 0,
      propertyType: 'Apartment',
      yearBuilt: new Date().getFullYear(),
      ownerName: '',
      ownerEmail: '',
      ownerPhone: '',
      description: '',
      amenities: [],
      timezone: 'PST',
      currency: 'USD',
      propertyManager: 'Admin User'
    });
    setIsAddDialogOpen(false);
  };

  const getOccupancyRate = (building: Building) => {
    if (building.totalUnits === 0) return 0;
    return Math.round((building.occupiedUnits / building.totalUnits) * 100);
  };

  const getStatusColor = (occupancyRate: number) => {
    if (occupancyRate >= 95) return 'text-green-600';
    if (occupancyRate >= 85) return 'text-blue-600';
    if (occupancyRate >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTotalUnits = () => buildings.reduce((sum, b) => sum + b.totalUnits, 0);
  const getTotalOccupied = () => buildings.reduce((sum, b) => sum + b.occupiedUnits, 0);
  const getTotalRevenue = () => buildings.reduce((sum, b) => sum + b.monthlyRevenue, 0);
  const getAverageOccupancy = () => {
    const totalUnits = getTotalUnits();
    const totalOccupied = getTotalOccupied();
    return totalUnits > 0 ? Math.round((totalOccupied / totalUnits) * 100) : 0;
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Building Management</h1>
          <p className="text-gray-600 mt-1">
            Manage your property portfolio across multiple locations
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
            {viewMode === 'grid' ? 'List View' : 'Grid View'}
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Building
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Building</DialogTitle>
                <DialogDescription>
                  Enter building information and property details
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Building Name</Label>
                  <Input
                    id="name"
                    value={newBuilding.name}
                    onChange={(e) => setNewBuilding({...newBuilding, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="propertyType">Property Type</Label>
                  <Select value={newBuilding.propertyType} onValueChange={(value) => setNewBuilding({...newBuilding, propertyType: value as Building['propertyType']})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Apartment">Apartment</SelectItem>
                      <SelectItem value="Condo">Condo</SelectItem>
                      <SelectItem value="Townhouse">Townhouse</SelectItem>
                      <SelectItem value="Single Family">Single Family</SelectItem>
                      <SelectItem value="Commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={newBuilding.address}
                    onChange={(e) => setNewBuilding({...newBuilding, address: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={newBuilding.city}
                    onChange={(e) => setNewBuilding({...newBuilding, city: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    value={newBuilding.state}
                    onChange={(e) => setNewBuilding({...newBuilding, state: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">Zip/Postal Code</Label>
                  <Input
                    id="zipCode"
                    value={newBuilding.zipCode}
                    onChange={(e) => setNewBuilding({...newBuilding, zipCode: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select value={newBuilding.country} onValueChange={(value) => setNewBuilding({...newBuilding, country: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USA">United States</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                      <SelectItem value="UK">United Kingdom</SelectItem>
                      <SelectItem value="Australia">Australia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="totalUnits">Total Units</Label>
                  <Input
                    id="totalUnits"
                    type="number"
                    value={newBuilding.totalUnits || ''}
                    onChange={(e) => setNewBuilding({...newBuilding, totalUnits: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="yearBuilt">Year Built</Label>
                  <Input
                    id="yearBuilt"
                    type="number"
                    value={newBuilding.yearBuilt || ''}
                    onChange={(e) => setNewBuilding({...newBuilding, yearBuilt: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="ownerName">Owner Name</Label>
                  <Input
                    id="ownerName"
                    value={newBuilding.ownerName}
                    onChange={(e) => setNewBuilding({...newBuilding, ownerName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="ownerEmail">Owner Email</Label>
                  <Input
                    id="ownerEmail"
                    type="email"
                    value={newBuilding.ownerEmail}
                    onChange={(e) => setNewBuilding({...newBuilding, ownerEmail: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="ownerPhone">Owner Phone</Label>
                  <Input
                    id="ownerPhone"
                    value={newBuilding.ownerPhone}
                    onChange={(e) => setNewBuilding({...newBuilding, ownerPhone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={newBuilding.timezone} onValueChange={(value) => setNewBuilding({...newBuilding, timezone: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PST">Pacific (PST)</SelectItem>
                      <SelectItem value="MST">Mountain (MST)</SelectItem>
                      <SelectItem value="CST">Central (CST)</SelectItem>
                      <SelectItem value="EST">Eastern (EST)</SelectItem>
                      <SelectItem value="GMT">Greenwich Mean Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={newBuilding.currency} onValueChange={(value) => setNewBuilding({...newBuilding, currency: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="CAD">CAD ($)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="AUD">AUD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newBuilding.description}
                    onChange={(e) => setNewBuilding({...newBuilding, description: e.target.value})}
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddBuilding}>
                  Add Building
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Buildings</p>
              <p className="text-xl font-bold">{buildings.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Home className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Units</p>
              <p className="text-xl font-bold">{getTotalUnits()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Portfolio Occupancy</p>
              <p className="text-xl font-bold">{getAverageOccupancy()}%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-xl font-bold">${getTotalRevenue().toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search buildings..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger>
                <MapPin className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map(country => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <Building2 className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Property type" />
              </SelectTrigger>
              <SelectContent>
                {propertyTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setSelectedCountry('All Countries');
              setSelectedType('All Types');
            }}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Buildings Display */}
      <Card>
        <CardHeader>
          <CardTitle>Buildings ({filteredBuildings.length})</CardTitle>
          <CardDescription>
            Manage your global property portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBuildings.map((building) => {
                const occupancyRate = getOccupancyRate(building);
                return (
                  <div key={building.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Building Image Placeholder */}
                    <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center relative">
                      <div className="text-center">
                        <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                        <p className="text-lg font-bold text-blue-800">{building.name}</p>
                      </div>
                      {building.rating && (
                        <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium ml-1">{building.rating}</span>
                          </div>
                        </div>
                      )}
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary">{building.propertyType}</Badge>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-lg">{building.name}</h3>
                        <Badge className="bg-blue-100 text-blue-800">
                          {building.currency} {(building.monthlyRevenue / 1000).toFixed(0)}k/mo
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>{building.address}, {building.city}, {building.state}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          <span>{building.occupiedUnits}/{building.totalUnits} units occupied</span>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2" />
                          <span>Avg rent: {building.currency} {building.averageRent.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      {/* Occupancy Rate */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Occupancy Rate</span>
                          <span className={`font-medium ${getStatusColor(occupancyRate)}`}>
                            {occupancyRate}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              occupancyRate >= 95 ? 'bg-green-500' :
                              occupancyRate >= 85 ? 'bg-blue-500' :
                              occupancyRate >= 70 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${occupancyRate}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Alerts */}
                      {(building.maintenanceIssues > 0 || building.leaseExpirations > 0) && (
                        <div className="mb-4 space-y-1">
                          {building.maintenanceIssues > 0 && (
                            <div className="flex items-center text-xs text-orange-600">
                              <Wrench className="h-3 w-3 mr-1" />
                              {building.maintenanceIssues} maintenance issues
                            </div>
                          )}
                          {building.leaseExpirations > 0 && (
                            <div className="flex items-center text-xs text-blue-600">
                              <Calendar className="h-3 w-3 mr-1" />
                              {building.leaseExpirations} leases expiring soon
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Amenities */}
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-2">Amenities:</p>
                        <div className="flex flex-wrap gap-1">
                          {building.amenities.slice(0, 3).map((amenity, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                          {building.amenities.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{building.amenities.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => setSelectedBuilding(building)} className="flex-1">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBuildings.map((building) => {
                const occupancyRate = getOccupancyRate(building);
                return (
                  <div key={building.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Building2 className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <h3 className="font-bold text-lg">{building.name}</h3>
                            <Badge variant="secondary">{building.propertyType}</Badge>
                            {building.rating && (
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                <span className="text-sm font-medium ml-1">{building.rating}</span>
                              </div>
                            )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Location:</span>
                              <p>{building.city}, {building.state}, {building.country}</p>
                            </div>
                            <div>
                              <span className="font-medium">Units:</span>
                              <p>{building.occupiedUnits}/{building.totalUnits} ({occupancyRate}%)</p>
                            </div>
                            <div>
                              <span className="font-medium">Revenue:</span>
                              <p>{building.currency} {building.monthlyRevenue.toLocaleString()}/mo</p>
                            </div>
                            <div>
                              <span className="font-medium">Avg Rent:</span>
                              <p>{building.currency} {building.averageRent.toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 mt-2 text-sm">
                            {building.maintenanceIssues > 0 && (
                              <span className="text-orange-600">
                                <Wrench className="h-4 w-4 inline mr-1" />
                                {building.maintenanceIssues} issues
                              </span>
                            )}
                            {building.leaseExpirations > 0 && (
                              <span className="text-blue-600">
                                <Calendar className="h-4 w-4 inline mr-1" />
                                {building.leaseExpirations} expiring
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="text-right mr-4">
                          <div className="flex items-center justify-end mb-1">
                            <span className={`text-lg font-bold ${getStatusColor(occupancyRate)}`}>
                              {occupancyRate}%
                            </span>
                          </div>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                occupancyRate >= 95 ? 'bg-green-500' :
                                occupancyRate >= 85 ? 'bg-blue-500' :
                                occupancyRate >= 70 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${occupancyRate}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-1">
                          <Button size="sm" variant="outline" onClick={() => setSelectedBuilding(building)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Building Detail Modal */}
      {selectedBuilding && (
        <Dialog open={!!selectedBuilding} onOpenChange={() => setSelectedBuilding(null)}>
          <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-3">
                <Building2 className="h-6 w-6" />
                <span>{selectedBuilding.name}</span>
                {selectedBuilding.rating && (
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    <span className="font-medium ml-1">{selectedBuilding.rating}</span>
                  </div>
                )}
              </DialogTitle>
              <DialogDescription>
                Complete building information and management dashboard
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="units">Units</TabsTrigger>
                <TabsTrigger value="financials">Financials</TabsTrigger>
                <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Property Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Property Type</Label>
                            <p className="font-medium">{selectedBuilding.propertyType}</p>
                          </div>
                          <div>
                            <Label>Year Built</Label>
                            <p className="font-medium">{selectedBuilding.yearBuilt}</p>
                          </div>
                          <div>
                            <Label>Total Units</Label>
                            <p className="font-medium">{selectedBuilding.totalUnits}</p>
                          </div>
                          <div>
                            <Label>Occupied Units</Label>
                            <p className="font-medium">{selectedBuilding.occupiedUnits}</p>
                          </div>
                        </div>
                        
                        <div>
                          <Label>Address</Label>
                          <p className="font-medium">
                            {selectedBuilding.address}<br />
                            {selectedBuilding.city}, {selectedBuilding.state} {selectedBuilding.zipCode}<br />
                            {selectedBuilding.country}
                          </p>
                        </div>
                        
                        <div>
                          <Label>Description</Label>
                          <p>{selectedBuilding.description}</p>
                        </div>
                        
                        <div>
                          <Label>Amenities</Label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {selectedBuilding.amenities.map((amenity, index) => (
                              <Badge key={index} variant="outline">{amenity}</Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Performance Metrics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <DollarSign className="h-8 w-8 mx-auto text-green-600 mb-2" />
                            <p className="text-2xl font-bold text-green-600">
                              {selectedBuilding.currency} {selectedBuilding.monthlyRevenue.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600">Monthly Revenue</p>
                          </div>
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <TrendingUp className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                            <p className="text-2xl font-bold text-blue-600">
                              {getOccupancyRate(selectedBuilding)}%
                            </p>
                            <p className="text-sm text-gray-600">Occupancy Rate</p>
                          </div>
                          <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <Home className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                            <p className="text-2xl font-bold text-purple-600">
                              {selectedBuilding.currency} {selectedBuilding.averageRent.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600">Average Rent</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Owner Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label>Owner</Label>
                          <p className="font-medium">{selectedBuilding.ownerName}</p>
                        </div>
                        <div>
                          <Label>Email</Label>
                          <p>{selectedBuilding.ownerEmail}</p>
                        </div>
                        <div>
                          <Label>Phone</Label>
                          <p>{selectedBuilding.ownerPhone}</p>
                        </div>
                        <div>
                          <Label>Property Manager</Label>
                          <p>{selectedBuilding.propertyManager}</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Important Dates</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label>Management Start</Label>
                          <p>{new Date(selectedBuilding.managementStartDate).toLocaleDateString()}</p>
                        </div>
                        {selectedBuilding.lastInspection && (
                          <div>
                            <Label>Last Inspection</Label>
                            <p>{new Date(selectedBuilding.lastInspection).toLocaleDateString()}</p>
                          </div>
                        )}
                        {selectedBuilding.nextInspection && (
                          <div>
                            <Label>Next Inspection</Label>
                            <p>{new Date(selectedBuilding.nextInspection).toLocaleDateString()}</p>
                          </div>
                        )}
                        {selectedBuilding.insuranceExpiry && (
                          <div>
                            <Label>Insurance Expiry</Label>
                            <p>{new Date(selectedBuilding.insuranceExpiry).toLocaleDateString()}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    {selectedBuilding.legalRequirements && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Legal Compliance</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {selectedBuilding.legalRequirements.map((requirement, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm">{requirement}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="units">
                <Card>
                  <CardHeader>
                    <CardTitle>Unit Management</CardTitle>
                    <CardDescription>
                      Manage individual units within {selectedBuilding.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Home className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">
                        Unit management interface would be integrated here,<br />
                        showing all {selectedBuilding.totalUnits} units in this building.
                      </p>
                      <Button className="mt-4" onClick={() => window.location.href = '/units'}>
                        View All Units
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="financials">
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Overview</CardTitle>
                    <CardDescription>
                      Revenue, expenses, and financial performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-medium">Revenue Breakdown</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Monthly Rent Revenue:</span>
                            <span className="font-medium">{selectedBuilding.currency} {selectedBuilding.monthlyRevenue.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Occupancy Rate:</span>
                            <span className="font-medium">{getOccupancyRate(selectedBuilding)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Average Rent per Unit:</span>
                            <span className="font-medium">{selectedBuilding.currency} {selectedBuilding.averageRent.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="font-medium">Key Metrics</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Currency:</span>
                            <span className="font-medium">{selectedBuilding.currency}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Timezone:</span>
                            <span className="font-medium">{selectedBuilding.timezone}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Revenue per Sq Ft:</span>
                            <span className="font-medium">
                              {selectedBuilding.currency} {(selectedBuilding.monthlyRevenue / (selectedBuilding.totalUnits * 1000)).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="maintenance">
                <Card>
                  <CardHeader>
                    <CardTitle>Maintenance Overview</CardTitle>
                    <CardDescription>
                      Current issues and maintenance schedule
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Current Issues</h4>
                        {selectedBuilding.maintenanceIssues > 0 ? (
                          <div className="bg-orange-50 p-4 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <Wrench className="h-5 w-5 text-orange-600" />
                              <span className="font-medium text-orange-800">
                                {selectedBuilding.maintenanceIssues} Active Issues
                              </span>
                            </div>
                            <Button size="sm" onClick={() => window.location.href = '/maintenance'}>
                              View All Issues
                            </Button>
                          </div>
                        ) : (
                          <div className="bg-green-50 p-4 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <span className="text-green-800">✓ No active maintenance issues</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-3">Upcoming Inspections</h4>
                        {selectedBuilding.nextInspection ? (
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <Calendar className="h-5 w-5 text-blue-600" />
                              <span className="font-medium text-blue-800">
                                Next: {new Date(selectedBuilding.nextInspection).toLocaleDateString()}
                              </span>
                            </div>
                            <Button size="sm" variant="outline">
                              Schedule Inspection
                            </Button>
                          </div>
                        ) : (
                          <div className="bg-yellow-50 p-4 rounded-lg">
                            <span className="text-yellow-800">No inspections scheduled</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="documents">
                <Card>
                  <CardHeader>
                    <CardTitle>Documents & Files</CardTitle>
                    <CardDescription>
                      Building documents, certificates, and media
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Upload Documents</h4>
                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                          <FileText className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600 mb-2">Upload building documents</p>
                          <Button size="sm" variant="outline">Choose Files</Button>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-3">Upload Photos</h4>
                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                          <Camera className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600 mb-2">Upload building photos</p>
                          <Button size="sm" variant="outline">Choose Photos</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Building Settings</CardTitle>
                    <CardDescription>
                      Configure building-specific settings and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-medium">Regional Settings</h4>
                        <div>
                          <Label>Timezone</Label>
                          <Select value={selectedBuilding.timezone}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PST">Pacific (PST)</SelectItem>
                              <SelectItem value="MST">Mountain (MST)</SelectItem>
                              <SelectItem value="CST">Central (CST)</SelectItem>
                              <SelectItem value="EST">Eastern (EST)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Currency</Label>
                          <Select value={selectedBuilding.currency}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USD">USD ($)</SelectItem>
                              <SelectItem value="CAD">CAD ($)</SelectItem>
                              <SelectItem value="GBP">GBP (£)</SelectItem>
                              <SelectItem value="EUR">EUR (€)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="font-medium">Emergency Contacts</h4>
                        <div>
                          <Label>Emergency Contact</Label>
                          <Input value={selectedBuilding.emergencyContact} />
                        </div>
                        <div>
                          <Label>Property Manager</Label>
                          <Input value={selectedBuilding.propertyManager} />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-6 border-t">
                      <Button variant="outline">
                        Reset Settings
                      </Button>
                      <Button>
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

