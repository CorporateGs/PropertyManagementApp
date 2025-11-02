
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Home, 
  Plus, 
  Search, 
  Filter, 
  DollarSign,
  Edit,
  Trash2,
  Eye,
  Building2,
  Users,
  TrendingUp,
  Calendar,
  Bed,
  Bath,
  Square
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

interface Unit {
  id: string;
  unitNumber: string;
  buildingId: string;
  buildingName: string;
  floor: number;
  squareFeet: number;
  bedrooms: number;
  bathrooms: number;
  rentAmount: number;
  status: 'Vacant' | 'Occupied' | 'Maintenance' | 'Unavailable' | 'Notice Given';
  amenities: string;
  description: string;
  tenantName?: string;
  leaseEndDate?: string;
  lastRenovated?: string;
  marketValue?: number;
  photos?: string[];
}

const mockUnits: Unit[] = [
  {
    id: '1',
    unitNumber: '205',
    buildingId: 'building-1',
    buildingName: 'Sunset Apartments',
    floor: 2,
    squareFeet: 1200,
    bedrooms: 2,
    bathrooms: 2,
    rentAmount: 2750,
    status: 'Occupied',
    amenities: 'Air Conditioning, In-unit Laundry, Balcony',
    description: 'Beautiful 2 bedroom apartment with city views',
    tenantName: 'Sarah Johnson',
    leaseEndDate: '2024-07-31',
    lastRenovated: '2022-03-15',
    marketValue: 2800
  },
  {
    id: '2',
    unitNumber: '301',
    buildingId: 'building-1',
    buildingName: 'Sunset Apartments',
    floor: 3,
    squareFeet: 1100,
    bedrooms: 2,
    bathrooms: 1,
    rentAmount: 2650,
    status: 'Occupied',
    amenities: 'Air Conditioning, In-unit Laundry',
    description: 'Cozy 2 bedroom apartment',
    tenantName: 'Marcus Thompson',
    leaseEndDate: '2024-05-31',
    lastRenovated: '2021-08-20',
    marketValue: 2700
  },
  {
    id: '3',
    unitNumber: '102',
    buildingId: 'building-2',
    buildingName: 'Garden View Complex',
    floor: 1,
    squareFeet: 1400,
    bedrooms: 3,
    bathrooms: 2,
    rentAmount: 2900,
    status: 'Occupied',
    amenities: 'Air Conditioning, In-unit Laundry, Garden View, Parking',
    description: 'Spacious 3 bedroom ground floor unit',
    tenantName: 'Emma Rodriguez',
    leaseEndDate: '2024-12-31',
    lastRenovated: '2023-01-10',
    marketValue: 2950
  },
  {
    id: '4',
    unitNumber: '204',
    buildingId: 'building-1',
    buildingName: 'Sunset Apartments',
    floor: 2,
    squareFeet: 950,
    bedrooms: 1,
    bathrooms: 1,
    rentAmount: 2200,
    status: 'Vacant',
    amenities: 'Air Conditioning, In-unit Laundry',
    description: 'Modern 1 bedroom apartment',
    lastRenovated: '2023-11-05',
    marketValue: 2300
  },
  {
    id: '5',
    unitNumber: '105',
    buildingId: 'building-2',
    buildingName: 'Garden View Complex',
    floor: 1,
    squareFeet: 1300,
    bedrooms: 2,
    bathrooms: 2,
    rentAmount: 2800,
    status: 'Maintenance',
    amenities: 'Air Conditioning, In-unit Laundry, Garden View',
    description: '2 bedroom with garden access',
    lastRenovated: '2022-06-15',
    marketValue: 2850
  }
];

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>(mockUnits);
  const [filteredUnits, setFilteredUnits] = useState<Unit[]>(mockUnits);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('All Buildings');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  const [newUnit, setNewUnit] = useState<Partial<Unit>>({
    unitNumber: '',
    buildingName: 'Sunset Apartments',
    floor: 1,
    squareFeet: 0,
    bedrooms: 1,
    bathrooms: 1,
    rentAmount: 0,
    status: 'Vacant',
    amenities: '',
    description: '',
    marketValue: 0
  });

  const buildings = ['All Buildings', 'Sunset Apartments', 'Garden View Complex', 'Downtown Plaza'];
  const statusOptions = ['All Status', 'Vacant', 'Occupied', 'Maintenance', 'Unavailable', 'Notice Given'];

  useEffect(() => {
    let filtered = units;

    if (searchTerm) {
      filtered = filtered.filter(unit => 
        unit.unitNumber.includes(searchTerm) ||
        unit.buildingName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.tenantName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedBuilding !== 'All Buildings') {
      filtered = filtered.filter(unit => unit.buildingName === selectedBuilding);
    }

    if (selectedStatus !== 'All Status') {
      filtered = filtered.filter(unit => unit.status === selectedStatus);
    }

    setFilteredUnits(filtered);
  }, [units, searchTerm, selectedBuilding, selectedStatus]);

  const handleAddUnit = () => {
    const unit: Unit = {
      ...newUnit as Unit,
      id: Date.now().toString(),
      buildingId: `building-${Date.now()}`
    };
    setUnits([...units, unit]);
    setNewUnit({
      unitNumber: '',
      buildingName: 'Sunset Apartments',
      floor: 1,
      squareFeet: 0,
      bedrooms: 1,
      bathrooms: 1,
      rentAmount: 0,
      status: 'Vacant',
      amenities: '',
      description: '',
      marketValue: 0
    });
    setIsAddDialogOpen(false);
  };

  const handleDeleteUnit = (unitId: string) => {
    setUnits(units.filter(u => u.id !== unitId));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Vacant': return 'bg-yellow-100 text-yellow-800';
      case 'Occupied': return 'bg-green-100 text-green-800';
      case 'Maintenance': return 'bg-red-100 text-red-800';
      case 'Unavailable': return 'bg-gray-100 text-gray-800';
      case 'Notice Given': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRevenueOptimization = (unit: Unit) => {
    if (!unit.marketValue) return null;
    const difference = unit.marketValue - unit.rentAmount;
    const percentage = (difference / unit.rentAmount) * 100;
    
    if (percentage > 5) {
      return {
        type: 'increase',
        amount: difference,
        percentage: percentage.toFixed(1)
      };
    } else if (percentage < -5) {
      return {
        type: 'decrease',
        amount: Math.abs(difference),
        percentage: Math.abs(percentage).toFixed(1)
      };
    }
    return null;
  };

  const getTotalRevenue = () => {
    return units.filter(u => u.status === 'Occupied').reduce((sum, u) => sum + u.rentAmount, 0);
  };

  const getOccupancyRate = () => {
    const occupiedUnits = units.filter(u => u.status === 'Occupied').length;
    return ((occupiedUnits / units.length) * 100).toFixed(1);
  };

  const getVacantUnits = () => {
    return units.filter(u => u.status === 'Vacant').length;
  };

  const getMaintenanceUnits = () => {
    return units.filter(u => u.status === 'Maintenance').length;
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Unit Management</h1>
          <p className="text-gray-600 mt-1">
            Manage all units across your properties
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
                Add Unit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Unit</DialogTitle>
                <DialogDescription>
                  Enter unit details and specifications
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="unitNumber">Unit Number</Label>
                  <Input
                    id="unitNumber"
                    value={newUnit.unitNumber}
                    onChange={(e) => setNewUnit({...newUnit, unitNumber: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="building">Building</Label>
                  <Select value={newUnit.buildingName} onValueChange={(value) => setNewUnit({...newUnit, buildingName: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select building" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sunset Apartments">Sunset Apartments</SelectItem>
                      <SelectItem value="Garden View Complex">Garden View Complex</SelectItem>
                      <SelectItem value="Downtown Plaza">Downtown Plaza</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="floor">Floor</Label>
                  <Input
                    id="floor"
                    type="number"
                    value={newUnit.floor || ''}
                    onChange={(e) => setNewUnit({...newUnit, floor: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="squareFeet">Square Feet</Label>
                  <Input
                    id="squareFeet"
                    type="number"
                    value={newUnit.squareFeet || ''}
                    onChange={(e) => setNewUnit({...newUnit, squareFeet: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    value={newUnit.bedrooms || ''}
                    onChange={(e) => setNewUnit({...newUnit, bedrooms: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    step="0.5"
                    value={newUnit.bathrooms || ''}
                    onChange={(e) => setNewUnit({...newUnit, bathrooms: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="rent">Monthly Rent</Label>
                  <Input
                    id="rent"
                    type="number"
                    value={newUnit.rentAmount || ''}
                    onChange={(e) => setNewUnit({...newUnit, rentAmount: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="marketValue">Market Value</Label>
                  <Input
                    id="marketValue"
                    type="number"
                    value={newUnit.marketValue || ''}
                    onChange={(e) => setNewUnit({...newUnit, marketValue: Number(e.target.value)})}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="amenities">Amenities</Label>
                  <Input
                    id="amenities"
                    value={newUnit.amenities}
                    onChange={(e) => setNewUnit({...newUnit, amenities: e.target.value})}
                    placeholder="Air Conditioning, In-unit Laundry, Balcony"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newUnit.description}
                    onChange={(e) => setNewUnit({...newUnit, description: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddUnit}>
                  Add Unit
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Home className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Units</p>
              <p className="text-xl font-bold">{units.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Occupancy Rate</p>
              <p className="text-xl font-bold">{getOccupancyRate()}%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Vacant Units</p>
              <p className="text-xl font-bold">{getVacantUnits()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Monthly Revenue</p>
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
                placeholder="Search units..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
              <SelectTrigger>
                <Building2 className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Select building" />
              </SelectTrigger>
              <SelectContent>
                {buildings.map(building => (
                  <SelectItem key={building} value={building}>{building}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setSelectedBuilding('All Buildings');
              setSelectedStatus('All Status');
            }}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Units Display */}
      <Card>
        <CardHeader>
          <CardTitle>Units ({filteredUnits.length})</CardTitle>
          <CardDescription>
            Manage unit information and availability
          </CardDescription>
        </CardHeader>
        <CardContent>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUnits.map((unit) => {
                const optimization = getRevenueOptimization(unit);
                return (
                  <div key={unit.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                      <div className="text-center">
                        <Home className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-blue-800">Unit {unit.unitNumber}</p>
                        <p className="text-sm text-blue-600">{unit.buildingName}</p>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge className={getStatusColor(unit.status)}>
                          {unit.status}
                        </Badge>
                        <span className="text-lg font-bold text-green-600">
                          ${unit.rentAmount.toLocaleString()}/mo
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Square className="h-4 w-4 mr-1" />
                            {unit.squareFeet} sq ft
                          </div>
                          <div className="flex items-center">
                            <Bed className="h-4 w-4 mr-1" />
                            {unit.bedrooms} bed
                          </div>
                          <div className="flex items-center">
                            <Bath className="h-4 w-4 mr-1" />
                            {unit.bathrooms} bath
                          </div>
                        </div>
                        
                        {unit.status === 'Occupied' && unit.tenantName && (
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {unit.tenantName}
                          </div>
                        )}
                      </div>
                      
                      {optimization && (
                        <div className={`p-2 rounded-lg mb-3 ${optimization.type === 'increase' ? 'bg-green-50' : 'bg-red-50'}`}>
                          <p className={`text-xs font-medium ${optimization.type === 'increase' ? 'text-green-700' : 'text-red-700'}`}>
                            {optimization.type === 'increase' ? 'Revenue Opportunity' : 'Above Market'}
                          </p>
                          <p className={`text-sm ${optimization.type === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                            {optimization.type === 'increase' ? '+' : '-'}${optimization.amount} ({optimization.percentage}%)
                          </p>
                        </div>
                      )}
                      
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{unit.description}</p>
                      
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => setSelectedUnit(unit)} className="flex-1">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteUnit(unit.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUnits.map((unit) => {
                const optimization = getRevenueOptimization(unit);
                return (
                  <div key={unit.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Home className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-lg">Unit {unit.unitNumber}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>{unit.buildingName}</span>
                            <span>Floor {unit.floor}</span>
                            <span>{unit.squareFeet} sq ft</span>
                            <span>{unit.bedrooms} bed / {unit.bathrooms} bath</span>
                          </div>
                          {unit.status === 'Occupied' && unit.tenantName && (
                            <p className="text-sm text-gray-600">Tenant: {unit.tenantName}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {optimization && (
                          <div className={`text-right ${optimization.type === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                            <p className="text-sm font-medium">
                              {optimization.type === 'increase' ? 'Revenue Opportunity' : 'Above Market'}
                            </p>
                            <p className="text-lg font-bold">
                              {optimization.type === 'increase' ? '+' : '-'}${optimization.amount}
                            </p>
                          </div>
                        )}
                        
                        <div className="text-right">
                          <Badge className={getStatusColor(unit.status)}>
                            {unit.status}
                          </Badge>
                          <p className="text-lg font-bold text-green-600 mt-1">
                            ${unit.rentAmount.toLocaleString()}/mo
                          </p>
                        </div>
                        
                        <div className="flex space-x-1">
                          <Button size="sm" variant="outline" onClick={() => setSelectedUnit(unit)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteUnit(unit.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-sm text-gray-600">
                      <p>{unit.description}</p>
                      <p className="mt-1"><strong>Amenities:</strong> {unit.amenities}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unit Detail Modal */}
      {selectedUnit && (
        <Dialog open={!!selectedUnit} onOpenChange={() => setSelectedUnit(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Unit {selectedUnit.unitNumber} - {selectedUnit.buildingName}
              </DialogTitle>
              <DialogDescription>
                Complete unit information and management options
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="tenant">Tenant</TabsTrigger>
                <TabsTrigger value="financial">Financial</TabsTrigger>
                <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Unit Specifications</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Square Feet</Label>
                          <p className="font-medium">{selectedUnit.squareFeet}</p>
                        </div>
                        <div>
                          <Label>Floor</Label>
                          <p className="font-medium">{selectedUnit.floor}</p>
                        </div>
                        <div>
                          <Label>Bedrooms</Label>
                          <p className="font-medium">{selectedUnit.bedrooms}</p>
                        </div>
                        <div>
                          <Label>Bathrooms</Label>
                          <p className="font-medium">{selectedUnit.bathrooms}</p>
                        </div>
                      </div>
                      <div>
                        <Label>Status</Label>
                        <div className="mt-1">
                          <Badge className={getStatusColor(selectedUnit.status)}>
                            {selectedUnit.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Features & Amenities</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label>Description</Label>
                        <p>{selectedUnit.description}</p>
                      </div>
                      <div>
                        <Label>Amenities</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedUnit.amenities.split(', ').map((amenity, index) => (
                            <Badge key={index} variant="outline">{amenity}</Badge>
                          ))}
                        </div>
                      </div>
                      {selectedUnit.lastRenovated && (
                        <div>
                          <Label>Last Renovated</Label>
                          <p>{new Date(selectedUnit.lastRenovated).toLocaleDateString()}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="tenant" className="space-y-4">
                {selectedUnit.status === 'Occupied' && selectedUnit.tenantName ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Current Tenant</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label>Tenant Name</Label>
                        <p className="font-medium">{selectedUnit.tenantName}</p>
                      </div>
                      {selectedUnit.leaseEndDate && (
                        <div>
                          <Label>Lease End Date</Label>
                          <p>{new Date(selectedUnit.leaseEndDate).toLocaleDateString()}</p>
                        </div>
                      )}
                      <div className="flex space-x-2 mt-4">
                        <Button size="sm" variant="outline">
                          View Tenant Profile
                        </Button>
                        <Button size="sm" variant="outline">
                          Send Message
                        </Button>
                        <Button size="sm" variant="outline">
                          Schedule Inspection
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Unit Available</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p>This unit is currently {selectedUnit.status.toLowerCase()}.</p>
                      <div className="flex space-x-2">
                        <Button size="sm">
                          Market Unit
                        </Button>
                        <Button size="sm" variant="outline">
                          Schedule Showing
                        </Button>
                        <Button size="sm" variant="outline">
                          Update Listing
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="financial" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Rent Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label>Current Rent</Label>
                        <p className="text-2xl font-bold text-green-600">${selectedUnit.rentAmount.toLocaleString()}</p>
                      </div>
                      {selectedUnit.marketValue && (
                        <div>
                          <Label>Market Value</Label>
                          <p className="text-xl font-medium">${selectedUnit.marketValue.toLocaleString()}</p>
                        </div>
                      )}
                      {(() => {
                        const optimization = getRevenueOptimization(selectedUnit);
                        if (optimization) {
                          return (
                            <div className={`p-3 rounded-lg ${optimization.type === 'increase' ? 'bg-green-50' : 'bg-red-50'}`}>
                              <Label className={optimization.type === 'increase' ? 'text-green-700' : 'text-red-700'}>
                                {optimization.type === 'increase' ? 'Revenue Opportunity' : 'Above Market Rate'}
                              </Label>
                              <p className={`text-lg font-bold ${optimization.type === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                                {optimization.type === 'increase' ? '+' : '-'}${optimization.amount} ({optimization.percentage}%)
                              </p>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Financial Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button className="w-full" variant="outline">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Adjust Rent
                      </Button>
                      <Button className="w-full" variant="outline">
                        <DollarSign className="h-4 w-4 mr-2" />
                        View Payment History
                      </Button>
                      <Button className="w-full" variant="outline">
                        <Calendar className="h-4 w-4 mr-2" />
                        Generate Report
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="maintenance">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Maintenance History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { date: '2024-01-15', type: 'Plumbing', description: 'Fixed kitchen faucet leak', status: 'Completed', cost: 150 },
                        { date: '2023-12-20', type: 'HVAC', description: 'Annual maintenance check', status: 'Completed', cost: 200 },
                        { date: '2023-11-05', type: 'Electrical', description: 'Replaced bathroom outlet', status: 'Completed', cost: 75 },
                      ].map((maintenance, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{maintenance.description}</p>
                            <p className="text-sm text-gray-600">{maintenance.type} • {new Date(maintenance.date).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${maintenance.cost}</p>
                            <Badge variant="secondary">{maintenance.status}</Badge>
                          </div>
                        </div>
                      ))}
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

