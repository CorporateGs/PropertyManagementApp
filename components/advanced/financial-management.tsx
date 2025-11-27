
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Calculator,
  Receipt,
  CreditCard,
  Banknote,
  Target,
  AlertCircle,
  CheckCircle,
  Calendar,
  FileText,
  Download,
  Upload,
  Brain,
  Zap
} from 'lucide-react';

interface FinancialMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  period: string;
  icon: any;
  color: string;
}

interface Transaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  tenant?: string;
  unit?: string;
  status: 'completed' | 'pending' | 'failed';
}

const mockMetrics: FinancialMetric[] = [
  {
    id: '1',
    name: 'Monthly Revenue',
    value: 284750,
    change: 12.3,
    period: 'vs last month',
    icon: DollarSign,
    color: 'text-green-600 bg-green-100'
  },
  {
    id: '2',
    name: 'Operating Expenses',
    value: 89240,
    change: -5.7,
    period: 'vs last month',
    icon: Receipt,
    color: 'text-red-600 bg-red-100'
  },
  {
    id: '3',
    name: 'Net Operating Income',
    value: 195510,
    change: 18.9,
    period: 'vs last month',
    icon: TrendingUp,
    color: 'text-blue-600 bg-blue-100'
  },
  {
    id: '4',
    name: 'Cash Flow',
    value: 156780,
    change: 15.2,
    period: 'vs last month',
    icon: Banknote,
    color: 'text-purple-600 bg-purple-100'
  }
];

const mockTransactions: Transaction[] = [
  {
    id: '1',
    date: new Date('2024-02-28'),
    description: 'Rent Payment - February',
    amount: 2750,
    type: 'income',
    category: 'Rent',
    tenant: 'Sarah Johnson',
    unit: 'Unit 205',
    status: 'completed'
  },
  {
    id: '2',
    date: new Date('2024-02-27'),
    description: 'HVAC Maintenance Service',
    amount: 850,
    type: 'expense',
    category: 'Maintenance',
    status: 'completed'
  },
  {
    id: '3',
    date: new Date('2024-02-26'),
    description: 'Water Utility Bill',
    amount: 340,
    type: 'expense',
    category: 'Utilities',
    status: 'pending'
  },
  {
    id: '4',
    date: new Date('2024-02-25'),
    description: 'Security Deposit Return',
    amount: 1500,
    type: 'expense',
    category: 'Deposits',
    tenant: 'Mike Chen',
    unit: 'Unit 301',
    status: 'completed'
  }
];

export function FinancialManagement() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <div className="h-4 w-4" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-orange-600 bg-orange-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Calculator className="h-8 w-8 mr-3 text-green-600" />
            Financial Management
          </h1>
          <p className="text-gray-600 mt-2">
            Automated accounting, forecasting, and financial analytics
          </p>
        </div>
        <div className="flex space-x-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Reports
          </Button>
          <Button className="bg-gradient-to-r from-green-600 to-blue-600">
            <Brain className="h-4 w-4 mr-2" />
            AI Forecast
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockMetrics.map((metric) => (
          <Card key={metric.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${metric.color}`}>
                  <metric.icon className="h-6 w-6" />
                </div>
                <div className="flex items-center space-x-1">
                  {getTrendIcon(metric.change)}
                  <span className={`text-sm font-medium ${
                    metric.change > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {Math.abs(metric.change)}%
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold">${metric.value.toLocaleString()}</p>
                <p className="text-gray-600 text-sm">{metric.name}</p>
                <p className="text-xs text-gray-500 mt-1">{metric.period}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="budgeting">Budgeting</TabsTrigger>
          <TabsTrigger value="forecasting">AI Forecasting</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Breakdown */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2 text-blue-500" />
                  Revenue Breakdown
                </CardTitle>
                <CardDescription>Monthly revenue by category</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { category: 'Base Rent', amount: 245000, percentage: 86, color: 'bg-blue-500' },
                  { category: 'Late Fees', amount: 8750, percentage: 3, color: 'bg-red-500' },
                  { category: 'Parking', amount: 12000, percentage: 4, color: 'bg-green-500' },
                  { category: 'Pet Fees', amount: 6250, percentage: 2, color: 'bg-yellow-500' },
                  { category: 'Utilities', amount: 12750, percentage: 5, color: 'bg-purple-500' }
                ].map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{item.category}</span>
                      <div className="text-right">
                        <div className="font-semibold">${item.amount.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{item.percentage}%</div>
                      </div>
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

            {/* Quick Stats */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2 text-green-500" />
                    Performance Goals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { goal: 'Monthly Revenue', current: 284750, target: 290000, unit: '$' },
                    { goal: 'Collection Rate', current: 97.8, target: 95, unit: '%' },
                    { goal: 'Expense Ratio', current: 31.3, target: 35, unit: '%', inverse: true },
                    { goal: 'ROI', current: 12.4, target: 10, unit: '%' }
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{item.goal}</span>
                        <span className="font-medium">
                          {item.current}{item.unit}
                        </span>
                      </div>
                      <Progress 
                        value={item.inverse 
                          ? Math.max(0, 100 - (item.current / item.target * 100))
                          : Math.min(100, (item.current / item.target * 100))
                        } 
                        className="h-2"
                      />
                      <div className="text-xs text-gray-500">
                        Target: {item.target}{item.unit}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 text-orange-500" />
                    Financial Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { type: 'warning', message: '3 late payments pending collection' },
                    { type: 'info', message: 'Tax documents due next month' },
                    { type: 'success', message: 'Insurance claim processed: +$5,240' }
                  ].map((alert, index) => (
                    <div key={index} className={`p-3 rounded-lg border ${
                      alert.type === 'warning' ? 'border-orange-200 bg-orange-50' :
                      alert.type === 'info' ? 'border-blue-200 bg-blue-50' :
                      'border-green-200 bg-green-50'
                    }`}>
                      <p className="text-sm">{alert.message}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Import Transactions
              </Button>
              <Button size="sm">
                <CreditCard className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
            </div>
            <div className="flex space-x-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expenses</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="rent">Rent</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest financial activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${
                        transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {transaction.type === 'income' ? (
                          <TrendingUp className={`h-5 w-5 ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`} />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-gray-600">{transaction.category}</p>
                        {transaction.tenant && (
                          <p className="text-xs text-gray-500">
                            {transaction.tenant} - {transaction.unit}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-lg font-semibold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transaction.date.toLocaleDateString()}
                      </div>
                      <Badge variant="outline" className={`text-xs ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budgeting" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
                  Monthly Budget vs Actual
                </CardTitle>
                <CardDescription>Compare budgeted vs actual expenses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { category: 'Maintenance', budgeted: 25000, actual: 18500, variance: -26 },
                  { category: 'Utilities', budgeted: 15000, actual: 16200, variance: 8 },
                  { category: 'Insurance', budgeted: 8000, actual: 7800, variance: -2.5 },
                  { category: 'Management', budgeted: 12000, actual: 12000, variance: 0 },
                  { category: 'Marketing', budgeted: 3000, actual: 4500, variance: 50 }
                ].map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{item.category}</span>
                      <div className="text-right">
                        <div className="text-sm">
                          ${item.actual.toLocaleString()} / ${item.budgeted.toLocaleString()}
                        </div>
                        <div className={`text-xs font-medium ${
                          item.variance < 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {item.variance > 0 ? '+' : ''}{item.variance}%
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 bg-blue-500 rounded-full"
                          style={{ width: `${Math.min(100, (item.actual / item.budgeted) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Create Budget</CardTitle>
                <CardDescription>Set budget limits for different categories</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="budget-category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="utilities">Utilities</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget-amount">Monthly Budget</Label>
                  <Input
                    id="budget-amount"
                    type="number"
                    placeholder="0.00"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget-period">Budget Period</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annually">Annually</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full">
                  <Target className="h-4 w-4 mr-2" />
                  Create Budget
                </Button>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">AI Budget Recommendations</h4>
                  <div className="space-y-2">
                    {[
                      'Increase maintenance budget by 15% for upcoming HVAC season',
                      'Reduce marketing spend - occupancy rate is at 94%',
                      'Consider energy efficiency upgrades to reduce utility costs'
                    ].map((recommendation, index) => (
                      <div key={index} className="text-sm p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                        {recommendation}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-purple-500" />
                  AI Revenue Forecast
                </CardTitle>
                <CardDescription>Machine learning predictions for next 12 months</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">$3.42M</div>
                    <div className="text-sm text-gray-600">Next 12 Months</div>
                    <div className="text-xs text-green-600 flex items-center justify-center mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +8.2% growth
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">95.2%</div>
                    <div className="text-sm text-gray-600">Confidence Level</div>
                    <div className="text-xs text-purple-600">High accuracy</div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">Q2 2024</div>
                    <div className="text-sm text-gray-600">Peak Season</div>
                    <div className="text-xs text-orange-600">+15% revenue</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Monthly Projections</h4>
                  {[
                    { month: 'March 2024', revenue: 289000, confidence: 96 },
                    { month: 'April 2024', revenue: 295000, confidence: 94 },
                    { month: 'May 2024', revenue: 301000, confidence: 92 },
                    { month: 'June 2024', revenue: 308000, confidence: 89 }
                  ].map((projection, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{projection.month}</div>
                        <div className="text-sm text-gray-600">
                          Confidence: {projection.confidence}%
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-green-600">
                          ${projection.revenue.toLocaleString()}
                        </div>
                        <Progress value={projection.confidence} className="w-20 h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                  AI Insights
                </CardTitle>
                <CardDescription>Predictive financial insights</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    type: 'opportunity',
                    title: 'Rent Optimization',
                    description: 'AI suggests increasing rent for 6 units by 5-8%',
                    impact: '+$1,890/month',
                    priority: 'high'
                  },
                  {
                    type: 'warning',
                    title: 'Seasonal Expenses',
                    description: 'Heating costs expected to increase 20% in winter',
                    impact: '+$4,200',
                    priority: 'medium'
                  },
                  {
                    type: 'success',
                    title: 'Cash Flow Positive',
                    description: 'Strong cash flow projected through Q3',
                    impact: '$45K surplus',
                    priority: 'low'
                  }
                ].map((insight, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${
                    insight.type === 'opportunity' ? 'border-green-200 bg-green-50' :
                    insight.type === 'warning' ? 'border-orange-200 bg-orange-50' :
                    'border-blue-200 bg-blue-50'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                      <Badge variant={insight.priority === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                        {insight.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{insight.description}</p>
                    <div className="text-sm font-medium text-green-600">{insight.impact}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Profit & Loss Statement',
                description: 'Comprehensive income and expense report',
                period: 'Monthly/Quarterly/Annual',
                icon: FileText,
                features: ['Revenue breakdown', 'Expense categories', 'Net income analysis']
              },
              {
                title: 'Cash Flow Statement',
                description: 'Track cash inflows and outflows',
                period: 'Monthly/Quarterly',
                icon: TrendingUp,
                features: ['Operating cash flow', 'Investment activities', 'Financing activities']
              },
              {
                title: 'Budget vs Actual Report',
                description: 'Compare planned vs actual financial performance',
                period: 'Monthly',
                icon: Target,
                features: ['Budget variance', 'Category analysis', 'Performance metrics']
              },
              {
                title: 'Tenant Payment Report',
                description: 'Analysis of rent collection and payment patterns',
                period: 'Monthly',
                icon: CreditCard,
                features: ['Collection rates', 'Late payments', 'Payment methods']
              },
              {
                title: 'Tax Summary Report',
                description: 'Prepare tax documents and deductions',
                period: 'Annual/Quarterly',
                icon: Receipt,
                features: ['Deductible expenses', 'Depreciation', 'Income summary']
              },
              {
                title: 'ROI Analysis Report',
                description: 'Return on investment for properties',
                period: 'Annual',
                icon: BarChart3,
                features: ['Property ROI', 'Investment performance', 'Market comparison']
              }
            ].map((report, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <report.icon className="h-5 w-5 mr-2 text-blue-600" />
                    {report.title}
                  </CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-gray-600">{report.period}</div>
                  
                  <div className="space-y-1">
                    {report.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span className="text-sm">{feature}</span>
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
      </Tabs>
    </div>
  );
}
