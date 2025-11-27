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
  BarChart3,
  Settings,
  Loader2
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
import { useToast } from '@/hooks/use-toast';

interface Building {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  totalUnits: number;
  description: string;
  yearBuilt?: number;
  amenities?: string[];
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  statistics?: {
    totalUnits: number;
    occupiedUnits: number;
    vacantUnits: number;
    occupancyRate: number;
    totalMonthlyRent: number;
  };
  units?: any[];
}

interface BuildingsResponse {
  data: Building[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function BuildingsPage() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [filteredBuildings, setFilteredBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All Countries');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  
  const [newBuilding, setNewBuilding] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    totalUnits: 0,
    yearBuilt: new Date().getFullYear(),
    description: '',
    amenities: []
  });

  const { toast } = useToast();

  const countries = ['All Countries', 'USA', 'Canada', 'UK', 'Australia'];
  const propertyTypes = ['All Types', 'Apartment', 'Condo', 'Townhouse', 'Single Family', 'Commercial'];

  useEffect(() => {
    fetchBuildings();
  }, []);

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

    setFilteredBuildings(filtered);
  }, [buildings, searchTerm, selectedCountry]);

  const fetchBuildings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/buildings?page=1&limit=100');
      if (!response.ok) {
        throw new Error('Failed to fetch buildings');
      }
      const data: BuildingsResponse = await response.json();
      setBuildings(data.data);
      setFilteredBuildings(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching buildings:', error);
      toast({
        title: "Error",
        description: "Failed to load buildings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddBuilding = async () => {
    try {
      const response = await fetch('/api/buildings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBuilding),
      });

      if (!response.ok) {
        throw new Error('Failed to create building');
      }

      const createdBuilding = await response.json();
      setBuildings([...buildings, createdBuilding.data]);
      
      // Reset form
      setNewBuilding({
        name: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA',
        totalUnits: 0,
        yearBuilt: new Date().getFullYear(),
        description: '',
        amenities: []
      });
      
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "Building created successfully!",
      });
    } catch (error) {
      console.error('Error creating building:', error);
      toast({
        title: "Error",
        description: "Failed to create building. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getOccupancyRate = (building: Building) => {
    if (!building.statistics) return 0;
    return building.statistics.occupancyRate || 0;
  };

  const getStatusColor = (occupancyRate: number) => {
    if (occupancyRate >= 95) return 'text-green-600';
    if (occupancyRate >= 85) return 'text-blue-600';
    if (occupancyRate >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTotalUnits = () => buildings.reduce((sum, b) => sum + (b.statistics?.totalUnits || b.totalUnits || 0), 0);
  const getTotalOccupied = () => buildings.reduce((sum, b) => sum + (b.statistics?.occupiedUnits || 0), 0);
  const getTotalRevenue = () => buildings.reduce((sum, b) => sum + (b.statistics?.totalMonthlyRent || 0), 0);
  const getAverageOccupancy = () => {
    const totalUnits = getTotalUnits();
    const totalOccupied = getTotalOccupied();
    return totalUnits > 0 ? Math.round((totalOccupied / totalUnits) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2 text-lg">Loading buildings...</span>
        </div>
      </div>
    );
  }

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
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
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
                  <Label htmlFor="totalUnits">Total Units</Label>
                  <Input
                    id="totalUnits"
                    type="number"
                    value={newBuilding.totalUnits || ''}
                    onChange={(e) => setNewBuilding({...newBuilding, totalUnits: Number(e.target.value)})}
                  />
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
                  <Label htmlFor="yearBuilt">Year Built</Label>
                  <Input
                    id="yearBuilt"
                    type="number"
                    value={newBuilding.yearBuilt || ''}
                    onChange={(e) => setNewBuilding({...newBuilding, yearBuilt: Number(e.target.value)})}
                  />
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

            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setSelectedCountry('All Countries');
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
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary">{building.country}</Badge>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-lg">{building.name}</h3>
                        <Badge className="bg-blue-100 text-blue-800">
                          ${(building.statistics?.totalMonthlyRent || 0) / 1000}k/mo
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>{building.address}, {building.city}, {building.state}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          <span>{building.statistics?.occupiedUnits || 0}/{building.totalUnits} units occupied</span>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2" />
                          <span>Total units: {building.totalUnits}</span>
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
                            <Badge variant="secondary">{building.country}</Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Location:</span>
                              <p>{building.city}, {building.state}</p>
                            </div>
                            <div>
                              <span className="font-medium">Units:</span>
                              <p>{building.statistics?.occupiedUnits || 0}/{building.totalUnits} ({occupancyRate}%)</p>
                            </div>
                            <div>
                              <span className="font-medium">Revenue:</span>
                              <p>${(building.statistics?.totalMonthlyRent || 0).toLocaleString()}/mo</p>
                            </div>
                            <div>
                              <span className="font-medium">Occupancy:</span>
                              <p>{occupancyRate}%</p>
                            </div>
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
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-3">
                <Building2 className="h-6 w-6" />
                <span>{selectedBuilding.name}</span>
              </DialogTitle>
              <DialogDescription>
                Building information and management dashboard
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="units">Units</TabsTrigger>
                <TabsTrigger value="financials">Financials</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Property Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Name</Label>
                        <p className="font-medium">{selectedBuilding.name}</p>
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
                        <Label>Total Units</Label>
                        <p className="font-medium">{selectedBuilding.totalUnits}</p>
                      </div>
                      {selectedBuilding.yearBuilt && (
                        <div>
                          <Label>Year Built</Label>
                          <p className="font-medium">{selectedBuilding.yearBuilt}</p>
                        </div>
                      )}
                      {selectedBuilding.description && (
                        <div>
                          <Label>Description</Label>
                          <p>{selectedBuilding.description}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedBuilding.statistics ? (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <DollarSign className="h-8 w-8 mx-auto text-green-600 mb-2" />
                            <p className="text-2xl font-bold text-green-600">
                              ${selectedBuilding.statistics.totalMonthlyRent.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600">Monthly Revenue</p>
                          </div>
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <TrendingUp className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                            <p className="text-2xl font-bold text-blue-600">
                              {selectedBuilding.statistics.occupancyRate}%
                            </p>
                            <p className="text-sm text-gray-600">Occupancy Rate</p>
                          </div>
                          <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <Home className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                            <p className="text-2xl font-bold text-purple-600">
                              {selectedBuilding.statistics.occupiedUnits}
                            </p>
                            <p className="text-sm text-gray-600">Occupied Units</p>
                          </div>
                          <div className="text-center p-4 bg-orange-50 rounded-lg">
                            <Home className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                            <p className="text-2xl font-bold text-orange-600">
                              {selectedBuilding.statistics.vacantUnits}
                            </p>
                            <p className="text-sm text-gray-600">Vacant Units</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-600">No statistics available</p>
                      )}
                    </CardContent>
                  </Card>
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
                        Unit management interface<br />
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
                      Revenue and financial performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedBuilding.statistics ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <DollarSign className="h-8 w-8 mx-auto text-green-600 mb-2" />
                            <p className="text-2xl font-bold text-green-600">
                              ${selectedBuilding.statistics.totalMonthlyRent.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600">Monthly Revenue</p>
                          </div>
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <TrendingUp className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                            <p className="text-2xl font-bold text-blue-600">
                              {selectedBuilding.statistics.occupancyRate}%
                            </p>
                            <p className="text-sm text-gray-600">Occupancy Rate</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-600">No financial data available</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Building Settings</CardTitle>
                    <CardDescription>
                      Configure building-specific settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Settings className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">
                        Building settings interface would be available here
                      </p>
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
