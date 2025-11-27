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
  Square,
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

interface Unit {
  id: string;
  unitNumber: string;
  buildingId: string;
  building?: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
  };
  floor?: number;
  squareFootage?: number;
  bedrooms: number;
  bathrooms: number;
  rentAmount: number;
  securityDeposit: number;
  status: 'VACANT' | 'OCCUPIED' | 'MAINTENANCE' | 'RENOVATION';
  type?: 'STUDIO' | '1BED' | '2BED' | '3BED' | '4BED' | 'LOFT' | 'PENTHOUSE';
  description?: string;
  amenities?: string[];
  isFurnished?: boolean;
  hasParking?: boolean;
  hasLaundry?: boolean;
  hasPetsAllowed?: boolean;
  tenants?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface UnitsResponse {
  data: Unit[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface Building {
  id: string;
  name: string;
}

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [filteredUnits, setFilteredUnits] = useState<Unit[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('All Buildings');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  const [newUnit, setNewUnit] = useState({
    unitNumber: '',
    buildingId: '',
    floor: 1,
    squareFootage: 0,
    bedrooms: 1,
    bathrooms: 1,
    rentAmount: 0,
    securityDeposit: 0,
    status: 'VACANT' as const,
    type: '1BED' as const,
    description: '',
    amenities: [] as string[],
    isFurnished: false,
    hasParking: false,
    hasLaundry: false,
    hasPetsAllowed: false
  });

  const { toast } = useToast();

  const statusOptions = ['All Status', 'VACANT', 'OCCUPIED', 'MAINTENANCE', 'RENOVATION'];
  const unitTypes = ['STUDIO', '1BED', '2BED', '3BED', '4BED', 'LOFT', 'PENTHOUSE'];

  useEffect(() => {
    fetchUnits();
    fetchBuildings();
  }, []);

  useEffect(() => {
    let filtered = units;

    if (searchTerm) {
      filtered = filtered.filter(unit => 
        unit.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.building?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.tenants?.some(t => 
          `${t.firstName} ${t.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (selectedBuilding !== 'All Buildings') {
      filtered = filtered.filter(unit => unit.buildingId === selectedBuilding);
    }

    if (selectedStatus !== 'All Status') {
      filtered = filtered.filter(unit => unit.status === selectedStatus);
    }

    setFilteredUnits(filtered);
  }, [units, searchTerm, selectedBuilding, selectedStatus]);

  const fetchUnits = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/units?page=1&limit=100');
      if (!response.ok) {
        throw new Error('Failed to fetch units');
      }
      const data: UnitsResponse = await response.json();
      setUnits(data.data);
      setFilteredUnits(data.data);
    } catch (error) {
      console.error('Error fetching units:', error);
      toast({
        title: "Error",
        description: "Failed to load units. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBuildings = async () => {
    try {
      const response = await fetch('/api/buildings?page=1&limit=100');
      if (!response.ok) {
        throw new Error('Failed to fetch buildings');
      }
      const data = await response.json();
      setBuildings(data.data || []);
    } catch (error) {
      console.error('Error fetching buildings:', error);
    }
  };

  const handleAddUnit = async () => {
    try {
      const response = await fetch('/api/units', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUnit),
      });

      if (!response.ok) {
        throw new Error('Failed to create unit');
      }

      const createdUnit = await response.json();
      setUnits([...units, createdUnit.data]);
      
      setNewUnit({
        unitNumber: '',
        buildingId: '',
        floor: 1,
        squareFootage: 0,
        bedrooms: 1,
        bathrooms: 1,
        rentAmount: 0,
        securityDeposit: 0,
        status: 'VACANT',
        type: '1BED',
        description: '',
        amenities: [],
        isFurnished: false,
        hasParking: false,
        hasLaundry: false,
        hasPetsAllowed: false
      });
      
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "Unit created successfully!",
      });
    } catch (error) {
      console.error('Error creating unit:', error);
      toast({
        title: "Error",
        description: "Failed to create unit. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUnit = async (unitId: string) => {
    if (!confirm('Are you sure you want to delete this unit?')) return;
    
    try {
      const response = await fetch(`/api/units/${unitId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete unit');
      }

      setUnits(units.filter(u => u.id !== unitId));
      toast({
        title: "Success",
        description: "Unit deleted successfully!",
      });
    } catch (error) {
      console.error('Error deleting unit:', error);
      toast({
        title: "Error",
        description: "Failed to delete unit. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VACANT': return 'bg-yellow-100 text-yellow-800';
      case 'OCCUPIED': return 'bg-green-100 text-green-800';
      case 'MAINTENANCE': return 'bg-red-100 text-red-800';
      case 'RENOVATION': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTotalRevenue = () => {
    return units.filter(u => u.status === 'OCCUPIED').reduce((sum, u) => sum + u.rentAmount, 0);
  };

  const getOccupancyRate = () => {
    if (units.length === 0) return '0.0';
    const occupiedUnits = units.filter(u => u.status === 'OCCUPIED').length;
    return ((occupiedUnits / units.length) * 100).toFixed(1);
  };

  const getVacantUnits = () => {
    return units.filter(u => u.status === 'VACANT').length;
  };

  const getMaintenanceUnits = () => {
    return units.filter(u => u.status === 'MAINTENANCE').length;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2 text-lg">Loading units...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
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
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
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
                  <Select value={newUnit.buildingId} onValueChange={(value) => setNewUnit({...newUnit, buildingId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select building" />
                    </SelectTrigger>
                    <SelectContent>
                      {buildings.map(building => (
                        <SelectItem key={building.id} value={building.id}>{building.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="type">Unit Type</Label>
                  <Select value={newUnit.type} onValueChange={(value) => setNewUnit({...newUnit, type: value as any})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STUDIO">Studio</SelectItem>
                      <SelectItem value="1BED">1 Bedroom</SelectItem>
                      <SelectItem value="2BED">2 Bedroom</SelectItem>
                      <SelectItem value="3BED">3 Bedroom</SelectItem>
                      <SelectItem value="4BED">4 Bedroom</SelectItem>
                      <SelectItem value="LOFT">Loft</SelectItem>
                      <SelectItem value="PENTHOUSE">Penthouse</SelectItem>
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
                  <Label htmlFor="squareFootage">Square Footage</Label>
                  <Input
                    id="squareFootage"
                    type="number"
                    value={newUnit.squareFootage || ''}
                    onChange={(e) => setNewUnit({...newUnit, squareFootage: Number(e.target.value)})}
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
                  <Label htmlFor="securityDeposit">Security Deposit</Label>
                  <Input
                    id="securityDeposit"
                    type="number"
                    value={newUnit.securityDeposit || ''}
                    onChange={(e) => setNewUnit({...newUnit, securityDeposit: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={newUnit.status} onValueChange={(value) => setNewUnit({...newUnit, status: value as any})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VACANT">Vacant</SelectItem>
                      <SelectItem value="OCCUPIED">Occupied</SelectItem>
                      <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                      <SelectItem value="RENOVATION">Renovation</SelectItem>
                    </SelectContent>
                  </Select>
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
                <SelectItem value="All Buildings">All Buildings</SelectItem>
                {buildings.map(building => (
                  <SelectItem key={building.id} value={building.id}>{building.name}</SelectItem>
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
              {filteredUnits.map((unit) => (
                <div key={unit.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <div className="text-center">
                      <Home className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-blue-800">Unit {unit.unitNumber}</p>
                      <p className="text-sm text-blue-600">{unit.building?.name}</p>
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
                          {unit.squareFootage || 'N/A'} sq ft
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
                      
                      {unit.status === 'OCCUPIED' && unit.tenants && unit.tenants.length > 0 && (
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {unit.tenants[0].firstName} {unit.tenants[0].lastName}
                        </div>
                      )}
                    </div>
                    
                    {unit.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{unit.description}</p>
                    )}
                    
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
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUnits.map((unit) => (
                <div key={unit.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Home className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">Unit {unit.unitNumber}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{unit.building?.name}</span>
                          {unit.floor && <span>Floor {unit.floor}</span>}
                          {unit.squareFootage && <span>{unit.squareFootage} sq ft</span>}
                          <span>{unit.bedrooms} bed / {unit.bathrooms} bath</span>
                        </div>
                        {unit.status === 'OCCUPIED' && unit.tenants && unit.tenants.length > 0 && (
                          <p className="text-sm text-gray-600">Tenant: {unit.tenants[0].firstName} {unit.tenants[0].lastName}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
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
                  
                  {unit.description && (
                    <div className="mt-3 text-sm text-gray-600">
                      <p>{unit.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedUnit && (
        <Dialog open={!!selectedUnit} onOpenChange={() => setSelectedUnit(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Unit {selectedUnit.unitNumber} - {selectedUnit.building?.name}
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
                          <Label>Unit Number</Label>
                          <p className="font-medium">{selectedUnit.unitNumber}</p>
                        </div>
                        <div>
                          <Label>Floor</Label>
                          <p className="font-medium">{selectedUnit.floor || 'N/A'}</p>
                        </div>
                        <div>
                          <Label>Square Footage</Label>
                          <p className="font-medium">{selectedUnit.squareFootage || 'N/A'}</p>
                        </div>
                        <div>
                          <Label>Unit Type</Label>
                          <p className="font-medium">{selectedUnit.type || 'N/A'}</p>
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
                      {selectedUnit.description && (
                        <div>
                          <Label>Description</Label>
                          <p>{selectedUnit.description}</p>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Furnished</Label>
                          <p className="font-medium">{selectedUnit.isFurnished ? 'Yes' : 'No'}</p>
                        </div>
                        <div>
                          <Label>Parking</Label>
                          <p className="font-medium">{selectedUnit.hasParking ? 'Yes' : 'No'}</p>
                        </div>
                        <div>
                          <Label>Laundry</Label>
                          <p className="font-medium">{selectedUnit.hasLaundry ? 'Yes' : 'No'}</p>
                        </div>
                        <div>
                          <Label>Pets Allowed</Label>
                          <p className="font-medium">{selectedUnit.hasPetsAllowed ? 'Yes' : 'No'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="tenant" className="space-y-4">
                {selectedUnit.status === 'OCCUPIED' && selectedUnit.tenants && selectedUnit.tenants.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Current Tenant</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label>Tenant Name</Label>
                        <p className="font-medium">
                          {selectedUnit.tenants[0].firstName} {selectedUnit.tenants[0].lastName}
                        </p>
                      </div>
                      <div>
                        <Label>Email</Label>
                        <p>{selectedUnit.tenants[0].email}</p>
                      </div>
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
                        <Label>Monthly Rent</Label>
                        <p className="text-2xl font-bold text-green-600">${selectedUnit.rentAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <Label>Security Deposit</Label>
                        <p className="text-xl font-medium">${selectedUnit.securityDeposit.toLocaleString()}</p>
                      </div>
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
                    <div className="text-center py-8">
                      <p className="text-gray-600">
                        Maintenance history and requests would be displayed here
                      </p>
                      <Button className="mt-4" variant="outline">
                        Schedule Maintenance
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
