'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, Home, AlertTriangle, Download, Calendar } from 'lucide-react';

export default function AnalyticsDashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('12months');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  const revenueData = [
    { month: 'Jan', revenue: 45000, expenses: 32000, maintenance: 8000 },
    { month: 'Feb', revenue: 47000, expenses: 31000, maintenance: 9500 },
    { month: 'Mar', revenue: 46500, expenses: 33000, maintenance: 7200 },
    { month: 'Apr', revenue: 48000, expenses: 34000, maintenance: 8800 },
    { month: 'May', revenue: 49000, expenses: 32500, maintenance: 9200 },
    { month: 'Jun', revenue: 50000, expenses: 35000, maintenance: 7800 },
    { month: 'Jul', revenue: 51000, expenses: 36000, maintenance: 8500 },
    { month: 'Aug', revenue: 52000, expenses: 34500, maintenance: 9800 },
    { month: 'Sep', revenue: 50500, expenses: 33000, maintenance: 8200 },
    { month: 'Oct', revenue: 53000, expenses: 37000, maintenance: 9100 },
    { month: 'Nov', revenue: 54000, expenses: 35500, maintenance: 8700 },
    { month: 'Dec', revenue: 55000, expenses: 38000, maintenance: 9400 },
  ];

  const occupancyData = [
    { month: 'Jan', occupancy: 92 },
    { month: 'Feb', occupancy: 94 },
    { month: 'Mar', occupancy: 91 },
    { month: 'Apr', occupancy: 96 },
    { month: 'May', occupancy: 98 },
    { month: 'Jun', occupancy: 97 },
    { month: 'Jul', occupancy: 95 },
    { month: 'Aug', occupancy: 93 },
    { month: 'Sep', occupancy: 94 },
    { month: 'Oct', occupancy: 96 },
    { month: 'Nov', occupancy: 98 },
    { month: 'Dec', occupancy: 99 },
  ];

  const maintenanceData = [
    { category: 'Plumbing', requests: 45, avgTime: 2.3, cost: 12500 },
    { category: 'Electrical', requests: 32, avgTime: 1.8, cost: 8900 },
    { category: 'HVAC', requests: 28, avgTime: 3.2, cost: 15600 },
    { category: 'Appliances', requests: 22, avgTime: 1.5, cost: 6700 },
    { category: 'General', requests: 38, avgTime: 1.2, cost: 4200 },
  ];

  const expenseBreakdown = [
    { name: 'Maintenance', value: 35, color: '#8884d8' },
    { name: 'Utilities', value: 25, color: '#82ca9d' },
    { name: 'Insurance', value: 15, color: '#ffc658' },
    { name: 'Management', value: 12, color: '#ff7300' },
    { name: 'Other', value: 13, color: '#00ff00' },
  ];

  const kpiData = [
    {
      title: 'Total Revenue',
      value: '$612,000',
      change: '+8.2%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Occupancy Rate',
      value: '96.2%',
      change: '+2.1%',
      trend: 'up',
      icon: Home,
      color: 'text-blue-600',
    },
    {
      title: 'Active Residents',
      value: '248',
      change: '+5',
      trend: 'up',
      icon: Users,
      color: 'text-purple-600',
    },
    {
      title: 'Open Issues',
      value: '12',
      change: '-3',
      trend: 'down',
      icon: AlertTriangle,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Comprehensive property management insights and metrics
          </p>
        </div>
        <div className="flex space-x-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="12months">Last 12 Months</SelectItem>
              <SelectItem value="2years">Last 2 Years</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiData.map((kpi, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                  <div className="flex items-center mt-2">
                    {kpi.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${
                      kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {kpi.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">vs last period</span>
                  </div>
                </div>
                <div className={`p-3 rounded-full bg-gray-100`}>
                  <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Revenue & Expenses</CardTitle>
            <CardDescription>Monthly financial performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                <Bar dataKey="expenses" fill="#82ca9d" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Occupancy Rate</CardTitle>
            <CardDescription>Monthly occupancy percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={occupancyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[85, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, 'Occupancy']} />
                <Line type="monotone" dataKey="occupancy" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Maintenance Requests Analysis</CardTitle>
            <CardDescription>Breakdown by category and performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {maintenanceData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.category}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span>{item.requests} requests</span>
                      <span>Avg: {item.avgTime} days</span>
                      <span>${item.cost.toLocaleString()} cost</span>
                    </div>
                  </div>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(item.requests / 50) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>Distribution of operating costs</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {expenseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Performing Units</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Unit 1205 - Tower A</span>
                <span className="text-sm font-semibold text-green-600">$2,800</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Unit 0804 - Tower B</span>
                <span className="text-sm font-semibold text-green-600">$2,750</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Unit 1506 - Tower A</span>
                <span className="text-sm font-semibold text-green-600">$2,700</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Unit 0923 - Tower C</span>
                <span className="text-sm font-semibold text-green-600">$2,650</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Maintenance Trends</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg Response Time</span>
              <span className="font-semibold">2.1 days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Completion Rate</span>
              <span className="font-semibold">94.2%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Resident Satisfaction</span>
              <span className="font-semibold">4.6/5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Emergency Requests</span>
              <span className="font-semibold">8</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm font-semibold text-green-800">Revenue Growth</p>
              <p className="text-xs text-green-600">Up 8.2% from last year</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-semibold text-blue-800">High Occupancy</p>
              <p className="text-xs text-blue-600">96.2% occupancy rate</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm font-semibold text-yellow-800">Maintenance Alert</p>
              <p className="text-xs text-yellow-600">HVAC requests increasing</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}