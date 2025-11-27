'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, Calendar, Building, Users, DollarSign, TrendingUp, BarChart3, FileSpreadsheet, PieChart } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('financial');
  const [reportScope, setReportScope] = useState('building');
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({ from: new Date(), to: new Date() });
  const [generating, setGenerating] = useState(false);

  const reportTypes = [
    { value: 'financial', label: 'Financial Report', icon: DollarSign, description: 'Income, expenses, and financial statements' },
    { value: 'occupancy', label: 'Occupancy Report', icon: Users, description: 'Vacancy rates and tenant information' },
    { value: 'maintenance', label: 'Maintenance Report', icon: Building, description: 'Work orders and maintenance history' },
    { value: 'board', label: 'Board Report', icon: FileText, description: 'Comprehensive report for board meetings' },
    { value: 'compliance', label: 'Compliance Report', icon: FileSpreadsheet, description: 'Regulatory compliance and certifications' },
    { value: 'analytics', label: 'Analytics Dashboard', icon: TrendingUp, description: 'Performance metrics and trends' },
    { value: 'custom', label: 'Custom Report', icon: BarChart3, description: 'Build your own custom report' },
  ];

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType,
          reportScope,
          buildingId: selectedBuilding,
          unitId: selectedUnit,
          dateRange,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}-report-${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setGenerating(false);
    }
  };

  const formatDate = (d: Date) => {
    return d.toISOString().slice(0, 10);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="mt-2 text-gray-600">
          Generate comprehensive reports for board meetings, individual units, or entire buildings
        </p>
      </div>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList>
          <TabsTrigger value="generate">Generate Report</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
          <TabsTrigger value="history">Report History</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Card
                  key={type.value}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    reportType === type.value ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setReportType(type.value)}
                >
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Icon className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-lg">{type.label}</CardTitle>
                    </div>
                    <CardDescription>{type.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Report Configuration</CardTitle>
              <CardDescription>Configure your report parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Report Scope</Label>
                  <Select value={reportScope} onValueChange={setReportScope}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select scope" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portfolio">Entire Portfolio</SelectItem>
                      <SelectItem value="building">Single Building</SelectItem>
                      <SelectItem value="unit">Individual Unit</SelectItem>
                      <SelectItem value="board">Board Report (Full Building)</SelectItem>
                      <SelectItem value="owner">Owner Report (Specific Unit)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(reportScope === 'building' || reportScope === 'unit' || reportScope === 'board' || reportScope === 'owner') && (
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
                )}

                {(reportScope === 'unit' || reportScope === 'owner') && selectedBuilding && (
                  <div className="space-y-2">
                    <Label>Select Unit</Label>
                    <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unit101">Unit 101</SelectItem>
                        <SelectItem value="unit102">Unit 102</SelectItem>
                        <SelectItem value="unit201">Unit 201</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <div className="flex space-x-2">
                    <input
                      type="date"
                      className="border rounded p-2"
                      value={formatDate(dateRange.from)}
                      onChange={(e) => setDateRange((prev) => ({ ...prev, from: new Date(e.target.value) }))}
                    />
                    <input
                      type="date"
                      className="border rounded p-2"
                      value={formatDate(dateRange.to)}
                      onChange={(e) => setDateRange((prev) => ({ ...prev, to: new Date(e.target.value) }))}
                    />
                  </div>
                </div>
              </div>

              {reportType === 'custom' && (
                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-semibold">Custom Report Sections</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      'Financial Summary',
                      'Occupancy Details',
                      'Maintenance History',
                      'Compliance Status',
                      'Tenant Information',
                      'Vendor Payments',
                      'Reserve Fund Status',
                      'Insurance Details',
                      'Legal Matters',
                      'Capital Projects',
                    ].map((section) => (
                      <div key={section} className="flex items-center space-x-2">
                        <Checkbox id={section} />
                        <label htmlFor={section} className="text-sm cursor-pointer">
                          {section}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4 pt-4">
                <Button variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Report
                </Button>
                <Button onClick={handleGenerateReport} disabled={generating}>
                  {generating ? (
                    <>Generating...</>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>Automatically generated reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Monthly Financial Report', frequency: 'Monthly', nextRun: '2024-02-01', recipients: 'Board Members' },
                  { name: 'Quarterly Compliance Report', frequency: 'Quarterly', nextRun: '2024-03-31', recipients: 'Management' },
                  { name: 'Weekly Maintenance Summary', frequency: 'Weekly', nextRun: '2024-01-22', recipients: 'Maintenance Team' },
                ].map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">{report.name}</h4>
                      <p className="text-sm text-gray-600">
                        {report.frequency} • Next: {report.nextRun} • To: {report.recipients}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">Pause</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Report History</CardTitle>
              <CardDescription>Previously generated reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Board Report - January 2024', type: 'Board', date: '2024-01-15', size: '2.4 MB' },
                  { name: 'Financial Report Q4 2023', type: 'Financial', date: '2024-01-10', size: '1.8 MB' },
                  { name: 'Maintenance Report - December', type: 'Maintenance', date: '2024-01-05', size: '890 KB' },
                ].map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div>
                        <h4 className="font-semibold">{report.name}</h4>
                        <p className="text-sm text-gray-600">
                          {report.type} • {report.date} • {report.size}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">View</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Report Templates</CardTitle>
              <CardDescription>Pre-configured report templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'AGM Board Package', description: 'Complete package for Annual General Meeting' },
                  { name: 'Owner Statement', description: 'Individual owner financial statement' },
                  { name: 'Budget vs Actual', description: 'Financial performance comparison' },
                  { name: 'Reserve Fund Study', description: 'Reserve fund analysis and projections' },
                ].map((template, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-lg transition-all">
                    <CardHeader>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full">Use Template</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
