'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, Edit, Eye, Settings, Image, FileText, Layout, Palette } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function WebsiteManagementPage() {
  const [publishing, setPublishing] = useState(false);

  const handlePublish = async () => {
    setPublishing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setPublishing(false);
    alert('Website published successfully!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Website Management</h1>
        <p className="mt-2 text-gray-600">
          Manage your public or private community website
        </p>
      </div>

      <Tabs defaultValue="content" className="space-y-6">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="design">Design</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Homepage Content</CardTitle>
                  <CardDescription>Edit your community website homepage</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Hero Title</Label>
                    <Input defaultValue="Welcome to Our Community" />
                  </div>
                  <div>
                    <Label>Hero Subtitle</Label>
                    <Textarea
                      defaultValue="Experience luxury living in the heart of the city"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label>About Section</Label>
                    <Textarea
                      defaultValue="Our community offers world-class amenities, exceptional service, and a vibrant lifestyle for all residents."
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label>Featured Image</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Image className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                    </div>
                  </div>
                  <Button className="w-full">
                    <Edit className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Announcements</CardTitle>
                  <CardDescription>Public announcements visible on the website</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">Pool Opening - Summer 2024</h3>
                        <Badge>Published</Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Our community pool will open for the season on May 1st...
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">New Fitness Center Equipment</h3>
                        <Badge variant="outline">Draft</Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        We're excited to announce new state-of-the-art equipment...
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    <FileText className="h-4 w-4 mr-2" />
                    Add Announcement
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Website Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status</span>
                    <Badge className="bg-green-100 text-green-800">Live</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Updated</span>
                    <span className="text-sm text-gray-600">2 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Visitors (30d)</span>
                    <span className="text-sm font-bold">1,234</span>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Website
                  </Button>
                  <Button className="w-full" onClick={handlePublish} disabled={publishing}>
                    <Globe className="h-4 w-4 mr-2" />
                    {publishing ? 'Publishing...' : 'Publish Changes'}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Layout className="h-4 w-4 mr-2" />
                    Page Builder
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Palette className="h-4 w-4 mr-2" />
                    Theme Editor
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    SEO Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="design" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme Customization</CardTitle>
              <CardDescription>Customize your website appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Primary Color</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Input type="color" defaultValue="#3B82F6" className="w-20 h-10" />
                    <Input defaultValue="#3B82F6" />
                  </div>
                </div>
                <div>
                  <Label>Secondary Color</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Input type="color" defaultValue="#10B981" className="w-20 h-10" />
                    <Input defaultValue="#10B981" />
                  </div>
                </div>
              </div>

              <div>
                <Label>Font Family</Label>
                <Input defaultValue="Inter, sans-serif" />
              </div>

              <div>
                <Label>Logo</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Image className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Upload your community logo</p>
                </div>
              </div>

              <Button className="w-full">
                <Palette className="h-4 w-4 mr-2" />
                Apply Theme
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Website Pages</CardTitle>
                  <CardDescription>Manage all pages on your website</CardDescription>
                </div>
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  New Page
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['Home', 'About', 'Amenities', 'Contact', 'Gallery', 'News'].map((page) => (
                  <div key={page} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <span className="font-medium">{page}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-100 text-green-800">Published</Badge>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Website Settings</CardTitle>
              <CardDescription>Configure your website settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Website Title</Label>
                <Input defaultValue="Luxury Community Living" />
              </div>
              <div>
                <Label>Domain</Label>
                <Input defaultValue="www.yourcommunity.com" />
              </div>
              <div>
                <Label>Meta Description</Label>
                <Textarea
                  defaultValue="Experience luxury living in our premium community with world-class amenities"
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="public" defaultChecked />
                <label htmlFor="public" className="text-sm">Make website public</label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="seo" defaultChecked />
                <label htmlFor="seo" className="text-sm">Enable SEO optimization</label>
              </div>
              <Button className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}