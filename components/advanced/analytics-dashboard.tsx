
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Home, 
  Users, 
  Wrench,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  LineChart,
  PieChart
} from 'lucide-react';

// Mock analytics data - in real app, this would come from API
const mockAnalytics = {
  kpis: [
    {
      title: 'Total Revenue',
      value: '$284,750',
      change: '+12.3%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Occupancy Rate',
      value: '94.5%',
      change: '+2.1%',
      trend: 'up',
      icon: Home,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Average Rent',
      value: '$2,623',
      change: '+5.8%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Maintenance Costs',
      value: '$18,240',
      change: '-8.2%',
      trend: 'down',
      icon: Wrench,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
  ],
  
  predictions: [
    {
      metric: 'Revenue Forecast',
      current: 284750,
      predicted: 312450,
      confidence: 92,
      timeframe: 'Next Quarter',
      trend: 'positive',
      factors: ['Market growth', 'Rent increases', 'Lower vacancy']
    },
    {
      metric: 'Occupancy Prediction',
      current: 94.5,
      predicted: 96.2,
      confidence: 88,
      timeframe: 'Next Month',
      trend: 'positive',
      factors: ['Strong rental market', 'Improved amenities']
    },
    {
      metric: 'Maintenance Cost',
      current: 18240,
      predicted: 15800,
      confidence: 85,
      timeframe: 'Next Quarter',
      trend: 'positive',
      factors: ['Preventive maintenance', 'Equipment upgrades']
    }
  ],
  
  insights: [
    {
      type: 'opportunity',
      title: 'Rent Optimization Opportunity',
      description: '15% of units are priced below market rate. Potential additional revenue of $8,750/month.',
      impact: 'High',
      effort: 'Low',
      roi: '400%'
    },
    {
      type: 'risk',
      title: 'Maintenance Cost Spike',
      description: 'HVAC maintenance costs increased 23% last quarter. Consider preventive maintenance program.',
      impact: 'Medium',
      effort: 'Medium',
      roi: '180%'
    },
    {
      type: 'success',
      title: 'Tenant Retention Excellence',
      description: '92% tenant retention rate - 18% above market average. Current strategy is working well.',
      impact: 'High',
      effort: 'Low',
      roi: '250%'
    }
  ],
  
  marketComparison: {
    rentPrices: {
      property: 2623,
      market: 2580,
      variance: '+1.7%'
    },
    occupancyRate: {
      property: 94.5,
      market: 91.2,
      variance: '+3.3%'
    },
    maintenanceCosts: {
      property: 18240,
      market: 22100,
      variance: '-17.5%'
    }
  }
};

export function AnalyticsDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('3months');
  
  return (
    <div className="space-y-6">
      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockAnalytics.kpis.map((kpi, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
                <Badge variant={kpi.trend === 'up' ? 'default' : 'secondary'}>
                  {kpi.change}
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-sm text-gray-600">{kpi.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="predictions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="predictions">
            <Target className="h-4 w-4 mr-2" />
            AI Predictions
          </TabsTrigger>
          <TabsTrigger value="insights">
            <Zap className="h-4 w-4 mr-2" />
            Smart Insights
          </TabsTrigger>
          <TabsTrigger value="performance">
            <BarChart3 className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="market">
            <LineChart className="h-4 w-4 mr-2" />
            Market Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-600" />
                AI-Powered Predictions
              </CardTitle>
              <CardDescription>
                Machine learning forecasts based on historical data and market trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {mockAnalytics.predictions.map((prediction, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{prediction.metric}</h4>
                      <Badge variant="outline">
                        {prediction.confidence}% confidence
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Current</span>
                        <span className="font-medium">
                          {typeof prediction.current === 'number' && prediction.current > 1000 
                            ? `$${prediction.current.toLocaleString()}`
                            : typeof prediction.current === 'number' && prediction.current < 100
                            ? `${prediction.current}%`
                            : prediction.current
                          }
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Predicted ({prediction.timeframe})</span>
                        <span className={`font-medium ${
                          prediction.trend === 'positive' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {typeof prediction.predicted === 'number' && prediction.predicted > 1000 
                            ? `$${prediction.predicted.toLocaleString()}`
                            : typeof prediction.predicted === 'number' && prediction.predicted < 100
                            ? `${prediction.predicted}%`
                            : prediction.predicted
                          }
                        </span>
                      </div>
                      
                      <Progress 
                        value={prediction.confidence} 
                        className="h-2"
                      />
                      
                      <div className="mt-3">
                        <p className="text-xs text-gray-600 mb-2">Key Factors:</p>
                        <div className="flex flex-wrap gap-1">
                          {prediction.factors.map((factor, factorIndex) => (
                            <Badge key={factorIndex} variant="secondary" className="text-xs">
                              {factor}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2 text-yellow-600" />
                Smart Business Insights
              </CardTitle>
              <CardDescription>
                AI-generated recommendations to optimize your property performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAnalytics.insights.map((insight, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 ${
                      insight.type === 'opportunity' 
                        ? 'border-green-200 bg-green-50'
                        : insight.type === 'risk'
                        ? 'border-orange-200 bg-orange-50'
                        : 'border-blue-200 bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {insight.type === 'opportunity' && (
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        )}
                        {insight.type === 'risk' && (
                          <AlertTriangle className="h-5 w-5 text-orange-600" />
                        )}
                        {insight.type === 'success' && (
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                        )}
                        <h4 className="font-medium">{insight.title}</h4>
                      </div>
                      <Badge 
                        variant={
                          insight.type === 'opportunity' ? 'default' :
                          insight.type === 'risk' ? 'destructive' : 'secondary'
                        }
                      >
                        {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-4">{insight.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-4 text-sm">
                        <div>
                          <span className="text-gray-600">Impact: </span>
                          <Badge variant="outline" className="text-xs">{insight.impact}</Badge>
                        </div>
                        <div>
                          <span className="text-gray-600">Effort: </span>
                          <Badge variant="outline" className="text-xs">{insight.effort}</Badge>
                        </div>
                        <div>
                          <span className="text-gray-600">ROI: </span>
                          <span className="font-medium text-green-600">{insight.roi}</span>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant={insight.type === 'opportunity' ? 'default' : 'outline'}
                        onClick={() => alert(`Taking action on: ${insight.title}`)}
                      >
                        Take Action
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Performance</CardTitle>
                <CardDescription>Monthly revenue trends and analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { month: 'Jan 2024', revenue: 278500, growth: 8.2 },
                    { month: 'Dec 2023', revenue: 275200, growth: 5.1 },
                    { month: 'Nov 2023', revenue: 271800, growth: 3.8 },
                    { month: 'Oct 2023', revenue: 268900, growth: 2.4 },
                  ].map((data, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{data.month}</p>
                        <p className="text-sm text-gray-600">${data.revenue.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={data.growth > 5 ? 'default' : 'secondary'}>
                          +{data.growth}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Operational Efficiency */}
            <Card>
              <CardHeader>
                <CardTitle>Operational Efficiency</CardTitle>
                <CardDescription>Key operational metrics and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { metric: 'Average Resolution Time', value: '2.3 days', target: '3 days', status: 'good' },
                    { metric: 'Tenant Satisfaction', value: '4.7/5', target: '4.5/5', status: 'excellent' },
                    { metric: 'Maintenance Response', value: '4.2 hours', target: '6 hours', status: 'good' },
                    { metric: 'Collection Rate', value: '97.8%', target: '95%', status: 'excellent' },
                  ].map((metric, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{metric.metric}</span>
                        <Badge variant={metric.status === 'excellent' ? 'default' : 'secondary'}>
                          {metric.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>{metric.value}</span>
                        <span className="text-gray-500">Target: {metric.target}</span>
                      </div>
                      <Progress 
                        value={metric.status === 'excellent' ? 95 : 75} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="market" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <LineChart className="h-5 w-5 mr-2 text-purple-600" />
                Market Comparison Analysis
              </CardTitle>
              <CardDescription>
                How your property performs compared to local market averages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-medium mb-2">Average Rent</h3>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">${mockAnalytics.marketComparison.rentPrices.property.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">vs ${mockAnalytics.marketComparison.rentPrices.market.toLocaleString()} market</p>
                    <Badge variant="default" className="text-xs">
                      {mockAnalytics.marketComparison.rentPrices.variance} vs market
                    </Badge>
                  </div>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Home className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-medium mb-2">Occupancy Rate</h3>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">{mockAnalytics.marketComparison.occupancyRate.property}%</p>
                    <p className="text-sm text-gray-600">vs {mockAnalytics.marketComparison.occupancyRate.market}% market</p>
                    <Badge variant="default" className="text-xs">
                      {mockAnalytics.marketComparison.occupancyRate.variance} vs market
                    </Badge>
                  </div>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Wrench className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="font-medium mb-2">Maintenance Costs</h3>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">${mockAnalytics.marketComparison.maintenanceCosts.property.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">vs ${mockAnalytics.marketComparison.maintenanceCosts.market.toLocaleString()} market</p>
                    <Badge variant="default" className="text-xs">
                      {mockAnalytics.marketComparison.maintenanceCosts.variance} vs market
                    </Badge>
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

