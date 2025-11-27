'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Upload, Download, Trash2, Eye, Search, Filter, FolderOpen, Scale, FileCheck, Shield } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function DocumentManagementPage() {
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);

  const documentCategories = [
    { value: 'bylaws', label: 'Bylaws & Regulations', icon: Scale, color: 'text-purple-600' },
    { value: 'policies', label: 'Policies & Procedures', icon: FileCheck, color: 'text-blue-600' },
    { value: 'legal', label: 'Legal Documents', icon: Shield, color: 'text-red-600' },
    { value: 'financial', label: 'Financial Records', icon: FileText, color: 'text-green-600' },
    { value: 'insurance', label: 'Insurance Documents', icon: Shield, color: 'text-orange-600' },
    { value: 'contracts', label: 'Contracts & Agreements', icon: FileCheck, color: 'text-indigo-600' },
  ];

  const documents = [
    { id: 1, name: 'Building Bylaws 2024', category: 'bylaws', building: 'Maple Heights', uploadDate: '2024-01-15', size: '2.4 MB', aiProcessed: true },
    { id: 2, name: 'Noise Complaint Policy', category: 'policies', building: 'Maple Heights', uploadDate: '2024-01-10', size: '890 KB', aiProcessed: true },
    { id: 3, name: 'Pet Policy', category: 'policies', building: 'Riverside Apartments', uploadDate: '2024-01-08', size: '1.2 MB', aiProcessed: true },
    { id: 4, name: 'Insurance Certificate 2024', category: 'insurance', building: 'Downtown Towers', uploadDate: '2024-01-05', size: '3.1 MB', aiProcessed: false },
    { id: 5, name: 'Maintenance Contract - HVAC', category: 'contracts', building: 'Maple Heights', uploadDate: '2024-01-03', size: '1.8 MB', aiProcessed: true },
  ];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, category: string) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    
    formData.append('category', category);
    formData.append('buildingId', selectedBuilding);

    try {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Documents uploaded successfully! AI is processing the content...');
      }
    } catch (error) {
      console.error('Error uploading documents:', error);
      alert('Failed to upload documents');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Document Management</h1>
        <p className="mt-2 text-gray-600">
          Manage bylaws, policies, legal documents, and more with AI-powered organization
        </p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Filter by building" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Buildings</SelectItem>
            <SelectItem value="building1">Maple Heights Condos</SelectItem>
            <SelectItem value="building2">Riverside Apartments</SelectItem>
            <SelectItem value="building3">Downtown Towers</SelectItem>
          </SelectContent>
        </Select>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload Documents
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload Documents</DialogTitle>
              <DialogDescription>
                Upload bylaws, policies, or other documents. AI will automatically process and index them.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label>Select Building</Label>
                <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose building" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="building1">Maple Heights Condos</SelectItem>
                    <SelectItem value="building2">Riverside Apartments</SelectItem>
                    <SelectItem value="building3">Downtown Towers</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {documentCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <div key={category.value} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Icon className={`h-5 w-5 ${category.color}`} />
                          <span className="font-semibold">{category.label}</span>
                        </div>
                        <label htmlFor={`upload-${category.value}`}>
                          <Button variant="outline" size="sm" asChild disabled={uploading}>
                            <span>
                              <Upload className="mr-2 h-4 w-4" />
                              Choose Files
                            </span>
                          </Button>
                          <input
                            id={`upload-${category.value}`}
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.txt"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, category.value)}
                          />
                        </label>
                      </div>
                      <p className="text-sm text-gray-600">
                        {category.value === 'bylaws' && 'Upload building bylaws and local statutes. AI will extract key rules and regulations.'}
                        {category.value === 'policies' && 'Upload property policies and procedures for AI-powered quick reference.'}
                        {category.value === 'legal' && 'Upload legal documents, agreements, and notices.'}
                        {category.value === 'financial' && 'Upload financial statements, budgets, and reports.'}
                        {category.value === 'insurance' && 'Upload insurance policies and certificates.'}
                        {category.value === 'contracts' && 'Upload vendor contracts and service agreements.'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Documents</TabsTrigger>
          <TabsTrigger value="bylaws">Bylaws</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="legal">Legal</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="insurance">Insurance</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {documents.map((doc) => {
              const category = documentCategories.find(c => c.value === doc.category);
              const Icon = category?.icon || FileText;
              return (
                <Card key={doc.id} className="hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className={`p-3 rounded-lg bg-gray-100`}>
                          <Icon className={`h-6 w-6 ${category?.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-lg">{doc.name}</h3>
                            {doc.aiProcessed && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                AI Processed
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                            <span>{doc.building}</span>
                            <span>•</span>
                            <span>{doc.uploadDate}</span>
                            <span>•</span>
                            <span>{doc.size}</span>
                            <span>•</span>
                            <span className="capitalize">{doc.category}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {documentCategories.map((category) => (
          <TabsContent key={category.value} value={category.value} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <category.icon className={`h-5 w-5 ${category.color}`} />
                  <span>{category.label}</span>
                </CardTitle>
                <CardDescription>
                  {category.value === 'bylaws' && 'Building bylaws and local regulations with AI-powered search and analysis'}
                  {category.value === 'policies' && 'Property policies and procedures for quick reference'}
                  {category.value === 'legal' && 'Legal documents and agreements'}
                  {category.value === 'financial' && 'Financial statements and reports'}
                  {category.value === 'insurance' && 'Insurance policies and certificates'}
                  {category.value === 'contracts' && 'Vendor contracts and service agreements'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {documents
                    .filter(doc => doc.category === category.value)
                    .map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <FileText className="h-8 w-8 text-gray-400" />
                          <div>
                            <h4 className="font-semibold">{doc.name}</h4>
                            <p className="text-sm text-gray-600">
                              {doc.building} • {doc.uploadDate} • {doc.size}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">View</Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>AI Document Intelligence</CardTitle>
          <CardDescription>
            Our AI automatically processes uploaded documents to provide intelligent search and insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Smart Search</h4>
              <p className="text-sm text-gray-600">
                Ask questions in natural language and get instant answers from your documents
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Compliance Monitoring</h4>
              <p className="text-sm text-gray-600">
                AI monitors bylaws and regulations to ensure compliance across all properties
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Auto-Categorization</h4>
              <p className="text-sm text-gray-600">
                Documents are automatically categorized and tagged for easy retrieval
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
