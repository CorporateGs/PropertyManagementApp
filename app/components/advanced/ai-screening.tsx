
'use client';

import { useState } from 'react';
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
  UserCheck,
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Shield,
  DollarSign,
  FileText,
  Clock,
  Star,
  Eye,
  Download,
  Upload,
  Zap,
  Target,
  RefreshCw
} from 'lucide-react';

interface TenantApplication {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  currentAddress: string;
  employerName: string;
  monthlyIncome: number;
  creditScore?: number;
  hasEvictions: boolean;
  hasPets: boolean;
  unitAppliedFor: string;
  moveInDate: Date;
  applicationDate: Date;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  aiRiskScore?: number;
  aiRecommendation?: string;
  documents: string[];
}

const mockApplications: TenantApplication[] = [
  {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@email.com',
    phone: '(555) 123-4567',
    currentAddress: '123 Main St, City, State',
    employerName: 'Tech Solutions Inc.',
    monthlyIncome: 5800,
    creditScore: 742,
    hasEvictions: false,
    hasPets: false,
    unitAppliedFor: 'Unit 205',
    moveInDate: new Date('2024-03-01'),
    applicationDate: new Date('2024-02-15'),
    status: 'under_review',
    aiRiskScore: 15,
    aiRecommendation: 'Low risk tenant with excellent credit and stable employment. Highly recommended for approval.',
    documents: ['credit_report.pdf', 'employment_verification.pdf', 'references.pdf']
  },
  {
    id: '2',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'mike.chen@email.com',
    phone: '(555) 234-5678',
    currentAddress: '456 Oak Ave, City, State',
    employerName: 'Freelance Designer',
    monthlyIncome: 4200,
    creditScore: 618,
    hasEvictions: false,
    hasPets: true,
    unitAppliedFor: 'Unit 301',
    moveInDate: new Date('2024-02-28'),
    applicationDate: new Date('2024-02-10'),
    status: 'pending',
    aiRiskScore: 42,
    aiRecommendation: 'Moderate risk due to irregular freelance income and fair credit score. Consider requiring additional security deposit.',
    documents: ['credit_report.pdf', 'bank_statements.pdf', 'pet_references.pdf']
  },
  {
    id: '3',
    firstName: 'Jessica',
    lastName: 'Martinez',
    email: 'j.martinez@email.com',
    phone: '(555) 345-6789',
    currentAddress: '789 Pine St, City, State',
    employerName: 'City Hospital',
    monthlyIncome: 6500,
    creditScore: 695,
    hasEvictions: true,
    hasPets: false,
    unitAppliedFor: 'Unit 412',
    moveInDate: new Date('2024-03-15'),
    applicationDate: new Date('2024-02-20'),
    status: 'under_review',
    aiRiskScore: 68,
    aiRecommendation: 'Higher risk due to previous eviction. Good income and credit score. Review eviction details before decision.',
    documents: ['credit_report.pdf', 'employment_letter.pdf', 'eviction_explanation.pdf']
  }
];

export function AIScreening() {
  const [selectedApplication, setSelectedApplication] = useState<TenantApplication | null>(null);
  const [activeTab, setActiveTab] = useState('applications');
  const [filterStatus, setFilterStatus] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [simulateError, setSimulateError] = useState(false); // For demo purposes - remove when real API is integrated

  const getRiskColor = (score: number | undefined) => {
    if (score === undefined || score === null) return 'text-gray-500 bg-gray-100';
    if (score < 30) return 'text-green-600 bg-green-100';
    if (score < 60) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getRiskLabel = (score: number | undefined) => {
    if (score === undefined || score === null) return 'Analyzing';
    if (score === 0) return 'Very Low Risk';
    if (score < 30) return 'Low Risk';
    if (score < 60) return 'Moderate Risk';
    return 'High Risk';
  };

  const handleRetry = () => {
    setError(null);
    setSimulateError(false);
    // In real implementation, retry the API call here
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'under_review':
        return <Clock className="h-4 w-4 text-orange-600" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-blue-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredApplications = mockApplications.filter(app => 
    filterStatus === 'all' || app.status === filterStatus
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Brain className="h-8 w-8 mr-3 text-purple-600" />
            AI Tenant Screening
          </h1>
          <p className="text-gray-600 mt-2">
            Advanced AI-powered tenant evaluation and risk assessment
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => setSimulateError(!simulateError)}>
            {simulateError ? 'Clear Error' : 'Simulate Error'}
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Bulk Import
          </Button>
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
            <UserCheck className="h-4 w-4 mr-2" />
            New Application
          </Button>
        </div>
      </div>

      {/* Error Handling */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-800 font-medium">Screening API Error</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleRetry}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
            <p className="text-red-700 mt-2">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
              <Badge variant="secondary">AI Powered</Badge>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">94.8%</p>
              <p className="text-gray-600 text-sm">AI Accuracy Rate</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <Badge variant="default" className="bg-green-600">87%</Badge>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">156</p>
              <p className="text-gray-600 text-sm">Approved This Month</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <Badge variant="secondary">2.3 hrs</Badge>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">18</p>
              <p className="text-gray-600 text-sm">Pending Review</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
              <Badge variant="secondary">97.2%</Badge>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">$2,340</p>
              <p className="text-gray-600 text-sm">Avg Security Deposit</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-6">
          {simulateError && setError('Failed to load tenant applications. Please check your connection and try again.')}
          <div className="flex items-center space-x-4">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Applications</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Applications List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Tenant Applications</CardTitle>
                  <CardDescription>
                    AI-analyzed rental applications with risk scores
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {filteredApplications.map((application) => (
                    <div
                      key={application.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedApplication?.id === application.id ? 'ring-2 ring-purple-500 bg-purple-50' : ''
                      }`}
                      onClick={() => setSelectedApplication(application)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {application.firstName} {application.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">{application.email}</p>
                          <p className="text-sm text-gray-600">{application.unitAppliedFor}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(application.status)}
                          <Badge variant="outline" className="capitalize">
                            {application.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-500">Monthly Income</p>
                          <p className="font-medium">${application.monthlyIncome.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Credit Score</p>
                          <p className="font-medium">{application.creditScore || 'Pending'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Move-in Date</p>
                          <p className="font-medium">{application.moveInDate.toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Applied</p>
                          <p className="font-medium">{application.applicationDate.toLocaleDateString()}</p>
                        </div>
                      </div>

                      {application.aiRiskScore && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">AI Risk Assessment</span>
                            <Badge variant="outline" className={getRiskColor(application.aiRiskScore)}>
                              {getRiskLabel(application.aiRiskScore)}
                            </Badge>
                          </div>
                          <Progress value={100 - application.aiRiskScore} className="h-2" />
                          <p className="text-xs text-gray-600">{application.aiRecommendation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Application Details */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Application Details</CardTitle>
                  <CardDescription>
                    Detailed analysis and actions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedApplication ? (
                    <div className="space-y-6">
                      <div className="text-center">
                        <h3 className="font-semibold text-xl mb-2">
                          {selectedApplication.firstName} {selectedApplication.lastName}
                        </h3>
                        <p className="text-gray-600">{selectedApplication.unitAppliedFor}</p>
                      </div>

                      {selectedApplication.aiRiskScore && (
                        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">AI Risk Score</span>
                            <Badge className={getRiskColor(selectedApplication.aiRiskScore)}>
                              {getRiskLabel(selectedApplication.aiRiskScore)}
                            </Badge>
                          </div>
                          <div className="text-3xl font-bold text-center mb-2">
                            {selectedApplication.aiRiskScore}/100
                          </div>
                          <Progress value={100 - selectedApplication.aiRiskScore} className="mb-3" />
                          <p className="text-sm text-gray-700">{selectedApplication.aiRecommendation}</p>
                        </div>
                      )}

                      <div className="space-y-3">
                        <h4 className="font-medium">Tenant Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Phone:</span>
                            <span>{selectedApplication.phone}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Current Address:</span>
                            <span className="text-right text-xs">{selectedApplication.currentAddress}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Employer:</span>
                            <span className="text-right text-xs">{selectedApplication.employerName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Monthly Income:</span>
                            <span className="font-medium">${selectedApplication.monthlyIncome.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Credit Score:</span>
                            <span className="font-medium">{selectedApplication.creditScore || 'Pending'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Documents ({selectedApplication.documents.length})</h4>
                        {selectedApplication.documents.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">{doc}</span>
                            </div>
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Flags</h4>
                        <div className="space-y-1">
                          {selectedApplication.hasEvictions && (
                            <div className="flex items-center space-x-2 p-2 bg-red-50 rounded">
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                              <span className="text-sm text-red-700">Previous Eviction</span>
                            </div>
                          )}
                          {selectedApplication.hasPets && (
                            <div className="flex items-center space-x-2 p-2 bg-orange-50 rounded">
                              <AlertTriangle className="h-4 w-4 text-orange-600" />
                              <span className="text-sm text-orange-700">Has Pets</span>
                            </div>
                          )}
                          {!selectedApplication.hasEvictions && !selectedApplication.hasPets && (
                            <div className="flex items-center space-x-2 p-2 bg-green-50 rounded">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-green-700">No Red Flags</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3 pt-4 border-t">
                        <Button className="w-full bg-green-600 hover:bg-green-700">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve Application
                        </Button>
                        <Button variant="outline" className="w-full">
                          <Clock className="h-4 w-4 mr-2" />
                          Request More Info
                        </Button>
                        <Button variant="outline" className="w-full text-red-600 hover:text-red-700">
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject Application
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <UserCheck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Select an application to view details</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-purple-500" />
                  Risk Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { risk: 'Low Risk (0-29)', count: 45, percentage: 67, color: 'bg-green-500' },
                  { risk: 'Moderate Risk (30-59)', count: 18, percentage: 27, color: 'bg-orange-500' },
                  { risk: 'High Risk (60+)', count: 4, percentage: 6, color: 'bg-red-500' }
                ].map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{item.risk}</span>
                      <span className="font-medium">{item.count} ({item.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-green-500" />
                  Income Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">$5,240</div>
                  <div className="text-sm text-gray-600">Average Monthly Income</div>
                </div>
                
                <div className="space-y-2">
                  {[
                    { range: '$8K+ (Excellent)', count: 12, percentage: 18 },
                    { range: '$5K-8K (Good)', count: 35, percentage: 52 },
                    { range: '$3K-5K (Fair)', count: 16, percentage: 24 },
                    { range: '<$3K (Concern)', count: 4, percentage: 6 }
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.range}</span>
                      <span>{item.count} ({item.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-blue-500" />
                  Credit Score Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">698</div>
                  <div className="text-sm text-gray-600">Average Credit Score</div>
                </div>
                
                <div className="space-y-2">
                  {[
                    { range: '750+ (Excellent)', count: 23, percentage: 34 },
                    { range: '700-749 (Good)', count: 28, percentage: 42 },
                    { range: '650-699 (Fair)', count: 12, percentage: 18 },
                    { range: '<650 (Poor)', count: 4, percentage: 6 }
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.range}</span>
                      <span>{item.count} ({item.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2 text-purple-500" />
                AI Performance Metrics
              </CardTitle>
              <CardDescription>
                Machine learning model performance and accuracy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { metric: 'Prediction Accuracy', value: 94.8, target: 90, trend: 'up' },
                  { metric: 'False Positive Rate', value: 3.2, target: 5, trend: 'down' },
                  { metric: 'Processing Speed', value: 2.3, target: 3, trend: 'down', unit: 'seconds' },
                  { metric: 'Model Confidence', value: 92.1, target: 85, trend: 'up' }
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold">
                      {item.value}{item.unit || '%'}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">{item.metric}</div>
                    <div className="flex items-center justify-center space-x-1">
                      {item.trend === 'up' ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-green-600" />
                      )}
                      <span className="text-xs text-green-600">
                        Target: {item.target}{item.unit || '%'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: 'Monthly Screening Report',
                description: 'Comprehensive analysis of all applications processed',
                period: 'Last 30 days',
                insights: ['67 applications processed', '87% approval rate', '$5,240 avg income'],
                icon: FileText
              },
              {
                title: 'Risk Assessment Summary',
                description: 'AI risk scoring performance and accuracy metrics',
                period: 'Last quarter',
                insights: ['94.8% prediction accuracy', '15% risk prevention', '$45K losses avoided'],
                icon: Shield
              },
              {
                title: 'Credit Score Analysis',
                description: 'Credit score distributions and trends over time',
                period: 'Year to date',
                insights: ['698 average score', '↑ 12 point improvement', '76% good+ credit'],
                icon: TrendingUp
              },
              {
                title: 'Income Verification Report',
                description: 'Employment and income verification statistics',
                period: 'Last 6 months',
                insights: ['92% verified income', '3.2x rent ratio avg', '5% income concerns'],
                icon: DollarSign
              }
            ].map((report, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <report.icon className="h-5 w-5 mr-2 text-blue-600" />
                    {report.title}
                  </CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-gray-600">{report.period}</div>
                  <div className="space-y-2">
                    {report.insights.map((insight, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span className="text-sm">{insight}</span>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Screening Criteria</CardTitle>
                <CardDescription>
                  Configure AI risk assessment parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Minimum Credit Score</Label>
                  <Input type="number" defaultValue="600" />
                </div>
                
                <div className="space-y-2">
                  <Label>Income Multiplier (Rent Ratio)</Label>
                  <Input type="number" step="0.1" defaultValue="3.0" />
                </div>

                <div className="space-y-2">
                  <Label>Maximum Risk Score for Auto-Approval</Label>
                  <Input type="number" defaultValue="25" />
                </div>

                <div className="space-y-2">
                  <Label>Employment History (Minimum Months)</Label>
                  <Input type="number" defaultValue="12" />
                </div>

                <Button className="w-full">
                  <Zap className="h-4 w-4 mr-2" />
                  Update AI Model
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Automation Settings</CardTitle>
                <CardDescription>
                  Configure automated screening workflows
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Auto-approve low risk applications</span>
                  <Badge variant="default">Enabled</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Auto-reject high risk applications</span>
                  <Badge variant="secondary">Disabled</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Require manual review for evictions</span>
                  <Badge variant="default">Enabled</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Send automatic rejection emails</span>
                  <Badge variant="default">Enabled</Badge>
                </div>

                <Button className="w-full" variant="outline">
                  Configure Workflows
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
