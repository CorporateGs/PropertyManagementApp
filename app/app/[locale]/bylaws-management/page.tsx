'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Upload, Download, Search, Plus, Edit, Trash2, Eye, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function BylawsManagementPage() {
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const bylaws = [
    { id: 1, title: 'Noise Regulations', category: 'Community Rules', lastUpdated: '2024-01-15', status: 'Active' },
    { id: 2, title: 'Pet Policy', category: 'Community Rules', lastUpdated: '2024-01-10', status: 'Active' },
    { id: 3, title: 'Parking Guidelines', category: 'Facilities', lastUpdated: '2023-12-20', status: 'Active' },
    { id: 4, title: 'Amenity Usage Rules', category: 'Facilities', lastUpdated: '2024-01-05', status: 'Active' },
    { id: 5, title: 'Maintenance Responsibilities', category: 'Operations', lastUpdated: '2023-11-30', status: 'Active' },
  ];

  const statutes = [
    { id: 1, title: 'Ontario Condominium Act', jurisdiction: 'Provincial', lastUpdated: '2023-06-01', status: 'Current' },
    { id: 2, title: 'Residential Tenancies Act', jurisdiction: 'Provincial', lastUpdated: '2023-09-15', status: 'Current' },
    { id: 3, title: 'Building Code Act', jurisdiction: 'Provincial', lastUpdated: '2023-08-20', status: 'Current' },
    { id: 4, title: 'Fire Protection Act', jurisdiction: 'Provincial', lastUpdated: '2023-07-10', status: 'Current' },
  ];

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/bylaws/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Bylaw uploaded successfully!');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload bylaw');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bylaws & Statutes Management</h1>
        <p className="mt-2 text-gray-600">
          Upload, manage, and reference property-specific bylaws and local statutes for AI-powered compliance
        </p>
      </div>

      <Tabs defaultValue="bylaws" className="space-y-6">
        <TabsList>
          <TabsTrigger value="bylaws">Property Bylaws</TabsTrigger>
          <TabsTrigger value="statutes">Local Statutes</TabsTrigger>
          <TabsTrigger value="upload">Upload Documents</TabsTrigger>
          <TabsTrigger value="ai-analysis">AI Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="bylaws" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Property Bylaws</CardTitle>
                  <CardDescription>Manage condo-specific rules and regulations</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Bylaw
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search bylaws..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {bylaws.map((bylaw) => (
                  <div key={bylaw.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <h3 className="font-medium">{bylaw.title}</h3>
                        <p className="text-sm text-gray-500">
                          {bylaw.category} • Updated {bylaw.lastUpdated}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{bylaw.status}</Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statutes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Local Statutes & Regulations</CardTitle>
              <CardDescription>Reference local laws and regulations for compliance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {statutes.map((statute) => (
                  <div key={statute.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <Shield className="h-5 w-5 text-green-600" />
                      <div>
                        <h3 className="font-medium">{statute.title}</h3>
                        <p className="text-sm text-gray-500">
                          {statute.jurisdiction} • Updated {statute.lastUpdated}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{statute.status}</Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Documents</CardTitle>
              <CardDescription>Upload bylaws, statutes, and regulatory documents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Upload Documents</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Drag and drop files here, or click to browse
                </p>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleUpload}
                  className="max-w-xs mx-auto"
                  disabled={uploading}
                />
                {uploading && <p className="mt-2 text-sm text-blue-600">Uploading...</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Document Title</Label>
                  <Input placeholder="Enter document title" />
                </div>
                <div>
                  <Label>Category</Label>
                  <Input placeholder="e.g., Community Rules, Operations" />
                </div>
                <div className="md:col-span-2">
                  <Label>Description</Label>
                  <Textarea placeholder="Brief description of the document" rows={3} />
                </div>
              </div>

              <Button className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Upload & Process with AI
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Analysis</CardTitle>
              <CardDescription>Let AI analyze your bylaws and statutes for compliance and conflicts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">AI Analysis Features</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Automatic conflict detection between bylaws and statutes</li>
                  <li>• Compliance checking against local regulations</li>
                  <li>• Smart recommendations for policy updates</li>
                  <li>• Natural language search across all documents</li>
                  <li>• Automated summaries and key points extraction</li>
                </ul>
              </div>

              <div>
                <Label>Ask AI About Your Bylaws</Label>
                <Textarea
                  placeholder="e.g., 'What are the noise regulations after 10 PM?' or 'Are there any conflicts with the new provincial statute?'"
                  rows={4}
                  className="mt-2"
                />
                <Button className="mt-4">
                  <Search className="h-4 w-4 mr-2" />
                  Analyze with AI
                </Button>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-medium mb-4">Recent AI Insights</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm font-medium text-yellow-900">Potential Conflict Detected</p>
                    <p className="text-sm text-yellow-800 mt-1">
                      Your pet policy may conflict with the updated Residential Tenancies Act regarding service animals.
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-900">Compliance Check Passed</p>
                    <p className="text-sm text-green-800 mt-1">
                      All parking guidelines are compliant with current municipal bylaws.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}