
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Upload,
  FileText,
  Users,
  Home,
  CreditCard,
  Wrench,
  Download,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  Bot,
  Zap,
  FileCheck,
  Database
} from 'lucide-react';

interface UploadJob {
  id: string;
  type: 'TENANTS' | 'UNITS' | 'PAYMENTS' | 'MAINTENANCE';
  fileName: string;
  totalRecords: number;
  processedRecords: number;
  successfulRecords: number;
  failedRecords: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  errors?: string[];
}

interface PreviewData {
  headers: string[];
  rows: string[][];
  totalRows: number;
}

interface ValidationError {
  row: number;
  column: string;
  message: string;
}

const mockUploads: UploadJob[] = [
  {
    id: '1',
    type: 'tenants',
    fileName: 'tenant_data_2024.csv',
    totalRecords: 150,
    processedRecords: 150,
    successfulRecords: 147,
    failedRecords: 3,
    status: 'completed',
    startedAt: new Date(Date.now() - 3600000),
    completedAt: new Date(Date.now() - 3500000),
    errors: ['Row 23: Invalid email format', 'Row 89: Missing required field', 'Row 142: Duplicate email']
  },
  {
    id: '2',
    type: 'units',
    fileName: 'units_building_a.xlsx',
    totalRecords: 45,
    processedRecords: 32,
    successfulRecords: 32,
    failedRecords: 0,
    status: 'processing',
    startedAt: new Date(Date.now() - 900000)
  },
  {
    id: '3',
    type: 'payments',
    fileName: 'payment_history.csv',
    totalRecords: 2890,
    processedRecords: 0,
    successfulRecords: 0,
    failedRecords: 0,
    status: 'pending',
    startedAt: new Date(Date.now() - 300000)
  }
];

export function BulkUpload() {
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadType, setUploadType] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadJobs, setUploadJobs] = useState<UploadJob[]>(mockUploads);
  const [isUploading, setIsUploading] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const validateFile = (file: File): ValidationError[] => {
    const errors: ValidationError[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

    if (file.size > maxSize) {
      errors.push({ row: 0, column: 'file', message: 'File size exceeds 10MB limit' });
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push({ row: 0, column: 'file', message: 'Invalid file type. Only CSV and Excel files are allowed' });
    }

    return errors;
  };

  const previewFile = async (file: File): Promise<PreviewData | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('preview', 'true');

      const response = await fetch('/api/uploads/preview', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) return null;

      const data = await response.json();
      return {
        headers: data.headers || [],
        rows: data.rows || [],
        totalRows: data.totalRows || 0,
      };
    } catch (error) {
      console.error('Preview failed:', error);
      return null;
    }
  };

  const pollJobStatus = async (jobId: string) => {
    try {
      const response = await fetch(`/api/uploads/job/${jobId}`);
      if (!response.ok) return;

      const jobData = await response.json();
      setUploadJobs(prev => prev.map(job =>
        job.id === jobId ? { ...job, ...jobData } : job
      ));

      if (jobData.status === 'completed' || jobData.status === 'failed') {
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
        setCurrentJobId(null);
        setIsUploading(false);
      }
    } catch (error) {
      console.error('Polling failed:', error);
    }
  };

  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setValidationErrors([]);
      setPreviewData(null);

      // Validate file
      const errors = validateFile(file);
      setValidationErrors(errors);

      // Generate preview if no validation errors
      if (errors.length === 0) {
        const preview = await previewFile(file);
        setPreviewData(preview);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadType || validationErrors.length > 0) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('uploadType', uploadType);

      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();
      const jobId = result.jobId || result.id;

      // Start polling for job status
      setCurrentJobId(jobId);
      const interval = setInterval(() => pollJobStatus(jobId), 2000);
      setPollingInterval(interval);

      // Add job to list
      const newJob: UploadJob = {
        id: jobId,
        type: uploadType as 'TENANTS' | 'UNITS' | 'PAYMENTS' | 'MAINTENANCE',
        fileName: selectedFile.name,
        totalRecords: 0,
        processedRecords: 0,
        successfulRecords: 0,
        failedRecords: 0,
        status: 'processing',
        startedAt: new Date()
      };

      setUploadJobs(prev => [newJob, ...prev]);
      setSelectedFile(null);
      setUploadType('');
      setPreviewData(null);
      setValidationErrors([]);
      setActiveTab('history');
    } catch (error) {
      console.error('Upload failed:', error);
      setIsUploading(false);
      // Show error toast or alert
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'processing':
        return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tenants':
        return <Users className="h-4 w-4" />;
      case 'units':
        return <Home className="h-4 w-4" />;
      case 'payments':
        return <CreditCard className="h-4 w-4" />;
      case 'maintenance':
        return <Wrench className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Upload className="h-8 w-8 mr-3 text-blue-600" />
            Bulk Data Management
          </h1>
          <p className="text-gray-600 mt-2">
            AI-powered mass upload and data processing system
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Templates
          </Button>
          <Button variant="outline">
            <Bot className="h-4 w-4 mr-2" />
            AI Data Validation
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Database className="h-6 w-6 text-blue-600" />
              </div>
              <Badge variant="secondary">This Month</Badge>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">12,847</p>
              <p className="text-gray-600 text-sm">Records Processed</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <Badge variant="default" className="bg-green-600">98.7%</Badge>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">12,681</p>
              <p className="text-gray-600 text-sm">Successful Imports</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Zap className="h-6 w-6 text-orange-600" />
              </div>
              <Badge variant="secondary">AI Powered</Badge>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">2.3s</p>
              <p className="text-gray-600 text-sm">Avg Processing Time</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileCheck className="h-6 w-6 text-purple-600" />
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">7</p>
              <p className="text-gray-600 text-sm">Active Uploads</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="upload">New Upload</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="history">Upload History</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="validation">AI Validation</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Form */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Data File</CardTitle>
                <CardDescription>
                  Select data type and upload CSV, Excel, or JSON files
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="upload-type">Data Type</Label>
                  <Select value={uploadType} onValueChange={setUploadType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select data type to upload" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tenants">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          Tenants
                        </div>
                      </SelectItem>
                      <SelectItem value="units">
                        <div className="flex items-center">
                          <Home className="h-4 w-4 mr-2" />
                          Units
                        </div>
                      </SelectItem>
                      <SelectItem value="payments">
                        <div className="flex items-center">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Payments
                        </div>
                      </SelectItem>
                      <SelectItem value="maintenance">
                        <div className="flex items-center">
                          <Wrench className="h-4 w-4 mr-2" />
                          Maintenance Requests
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file-upload">Select File</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".csv,.xlsx,.xls,.json"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="h-12 w-12 text-gray-400 mb-4" />
                      {selectedFile ? (
                        <>
                          <p className="font-medium">{selectedFile.name}</p>
                          <p className="text-sm text-gray-500">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="font-medium">Click to upload file</p>
                          <p className="text-sm text-gray-500">
                            CSV, Excel, or JSON files supported
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="upload-notes">Notes (Optional)</Label>
                  <Textarea
                    id="upload-notes"
                    placeholder="Add any notes about this upload..."
                    rows={3}
                  />
                </div>

                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-medium text-red-800 mb-2">Validation Errors</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index}>
                          {error.column}: {error.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex space-x-3">
                  <Button
                    onClick={handleUpload}
                    disabled={!selectedFile || !uploadType || isUploading || validationErrors.length > 0}
                    className="flex-1"
                  >
                    {isUploading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    {isUploading ? 'Processing...' : 'Start Upload'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('preview')}
                    disabled={!previewData}
                  >
                    <Bot className="h-4 w-4 mr-2" />
                    Preview Data
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Upload Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Guidelines</CardTitle>
                <CardDescription>
                  Best practices for successful data imports
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    {
                      title: 'File Format',
                      description: 'Use CSV, Excel (.xlsx), or JSON format',
                      icon: FileText
                    },
                    {
                      title: 'Data Validation',
                      description: 'AI automatically validates and cleans data',
                      icon: Bot
                    },
                    {
                      title: 'Duplicate Detection',
                      description: 'System prevents duplicate records',
                      icon: CheckCircle
                    },
                    {
                      title: 'Error Handling',
                      description: 'Detailed error reports for failed records',
                      icon: AlertCircle
                    }
                  ].map((guideline, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <guideline.icon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{guideline.title}</p>
                        <p className="text-sm text-gray-600">{guideline.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">AI-Powered Features</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Automatic data type detection</li>
                    <li>• Smart field mapping</li>
                    <li>• Data quality scoring</li>
                    <li>• Predictive error fixing</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Preview</CardTitle>
              <CardDescription>
                Review the first 10 rows of your data before uploading
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {previewData ? (
                <>
                  <div className="text-sm text-gray-600">
                    Total rows: {previewData.totalRows} | Showing first 10 rows
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          {previewData.headers.map((header, index) => (
                            <th key={index} className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.rows.map((row, rowIndex) => (
                          <tr key={rowIndex} className="hover:bg-gray-50">
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex} className="border border-gray-300 px-4 py-2 text-sm">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setActiveTab('upload')}>
                      Back to Upload
                    </Button>
                    <Button onClick={handleUpload} disabled={isUploading}>
                      {isUploading ? 'Processing...' : 'Confirm Upload'}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No preview data available. Please select a file first.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <div className="space-y-4">
            {uploadJobs.map((job) => (
              <Card key={job.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(job.status)}
                      <div>
                        <h3 className="font-medium">{job.fileName}</h3>
                        <p className="text-sm text-gray-500">
                          Started {job.startedAt.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="capitalize">
                        {getTypeIcon(job.type)}
                        <span className="ml-1">{job.type}</span>
                      </Badge>
                      <Badge
                        variant={
                          job.status === 'completed'
                            ? 'default'
                            : job.status === 'failed'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {job.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>
                        {job.processedRecords} / {job.totalRecords} records
                      </span>
                    </div>
                    <Progress
                      value={(job.processedRecords / job.totalRecords) * 100}
                      className="h-2"
                    />
                  </div>

                  {/* Statistics */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {job.successfulRecords}
                      </div>
                      <div className="text-xs text-gray-500">Successful</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {job.failedRecords}
                      </div>
                      <div className="text-xs text-gray-500">Failed</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {job.totalRecords - job.processedRecords}
                      </div>
                      <div className="text-xs text-gray-500">Remaining</div>
                    </div>
                  </div>

                  {/* Errors */}
                  {job.errors && job.errors.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-sm mb-2">Errors ({job.errors.length})</h4>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        {job.errors.slice(0, 3).map((error, index) => (
                          <div key={index} className="text-sm text-red-700 mb-1">
                            {error}
                          </div>
                        ))}
                        {job.errors.length > 3 && (
                          <div className="text-sm text-red-600">
                            ... and {job.errors.length - 3} more errors
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download Report
                    </Button>
                    {job.status === 'completed' && job.failedRecords > 0 && (
                      <Button size="sm" variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry Failed
                      </Button>
                    )}
                    {job.status === 'processing' && (
                      <Button size="sm" variant="outline">
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                name: 'Tenant Data Template',
                type: 'tenants',
                description: 'Import tenant information, lease details, and contact data',
                fields: ['firstName', 'lastName', 'email', 'phone', 'unitNumber', 'leaseStart', 'leaseEnd', 'rentAmount'],
                icon: Users
              },
              {
                name: 'Unit Data Template',
                type: 'units',
                description: 'Import unit details, specifications, and amenities',
                fields: ['buildingName', 'unitNumber', 'bedrooms', 'bathrooms', 'squareFeet', 'rentAmount', 'status'],
                icon: Home
              },
              {
                name: 'Payment Records Template',
                type: 'payments',
                description: 'Import payment history and transaction data',
                fields: ['tenantEmail', 'amount', 'dueDate', 'paidDate', 'paymentType', 'status', 'transactionId'],
                icon: CreditCard
              },
              {
                name: 'Maintenance Requests Template',
                type: 'maintenance',
                description: 'Import maintenance requests and work orders',
                fields: ['unitNumber', 'title', 'description', 'category', 'priority', 'status', 'requestDate'],
                icon: Wrench
              }
            ].map((template, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <template.icon className="h-5 w-5 mr-2 text-blue-600" />
                    {template.name}
                  </CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Required Fields</h4>
                    <div className="flex flex-wrap gap-1">
                      {template.fields.map((field) => (
                        <Badge key={field} variant="secondary" className="text-xs">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button size="sm" className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Download CSV
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download Excel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="validation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bot className="h-5 w-5 mr-2 text-purple-500" />
                AI Data Validation Engine
              </CardTitle>
              <CardDescription>
                Advanced AI validates and cleans your data before import
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { name: 'Email Validation', score: 98.7, status: 'excellent' },
                  { name: 'Phone Formatting', score: 94.2, status: 'good' },
                  { name: 'Date Parsing', score: 96.8, status: 'excellent' },
                  { name: 'Duplicate Detection', score: 99.1, status: 'excellent' }
                ].map((validation, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-sm mb-2">{validation.name}</h4>
                    <div className="text-2xl font-bold mb-1">{validation.score}%</div>
                    <Badge
                      variant={validation.status === 'excellent' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {validation.status}
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">AI Validation Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    'Smart field mapping and type detection',
                    'Automatic data format standardization',
                    'Duplicate record identification',
                    'Invalid data correction suggestions',
                    'Cross-reference validation',
                    'Data quality scoring'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
