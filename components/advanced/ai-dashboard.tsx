
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Bot,
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Target,
  Zap,
  DollarSign,
  Users,
  Home,
  Wrench,
  Battery,
  Wifi,
  Shield,
  Thermometer,
  Activity,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';

interface AIInsight {
  id: string;
  type: 'opportunity' | 'alert' | 'prediction' | 'optimization';
  title: string;
  description: string;
  impact: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  category: string;
  actionItems: string[];
  estimatedValue?: string;
}

interface SmartBuildingMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  change: number;
  icon: any;
}

interface PredictiveAnalytic {
  id: string;
  title: string;
  prediction: string;
  probability: number;
  timeframe: string;
  impact: string;
  type: 'revenue' | 'maintenance' | 'occupancy' | 'risk';
}

const mockAIInsights: AIInsight[] = [
  {
    id: '1',
    type: 'opportunity',
    title: 'Rent Optimization Opportunity',
    description: '8 units are priced 15-20% below market rate based on local comps and amenities',
    impact: 'Potential additional revenue of $3,240/month',
    confidence: 92,
    priority: 'high',
    category: 'Revenue',
    actionItems: [
      'Review units 205, 301, 307, 412, 510, 605, 708, 802',
      'Schedule market analysis for comparable properties',
      'Plan phased rent increases for lease renewals'
    ],
    estimatedValue: '+$38,880/year'
  },
  {
    id: '2',
    type: 'prediction',
    title: 'Maintenance Prediction Alert',
    description: 'HVAC systems in Building A showing early failure indicators',
    impact: 'Preventive maintenance could save $15,000-25,000',
    confidence: 85,
    priority: 'high',
    category: 'Maintenance',
    actionItems: [
      'Schedule HVAC inspection within 2 weeks',
      'Order replacement filters and belts',
      'Plan for potential system upgrades'
    ],
    estimatedValue: 'Save $20,000'
  },
  {
    id: '3',
    type: 'alert',
    title: 'Tenant Retention Risk',
    description: '5 tenants showing behavioral patterns associated with non-renewal',
    impact: 'Risk of $12,500 in turnover costs and lost revenue',
    confidence: 78,
    priority: 'medium',
    category: 'Occupancy',
    actionItems: [
      'Reach out to at-risk tenants for satisfaction survey',
      'Offer lease renewal incentives',
      'Schedule property improvement discussions'
    ],
    estimatedValue: 'Prevent $12,500 loss'
  },
  {
    id: '4',
    type: 'optimization',
    title: 'Energy Efficiency Opportunity',
    description: 'Smart thermostat data suggests 23% energy savings potential',
    impact: 'Estimated $1,890/month reduction in utility costs',
    confidence: 94,
    priority: 'medium',
    category: 'Operations',
    actionItems: [
      'Implement automated scheduling for common areas',
      'Upgrade to smart water heaters',
      'Install motion-sensor lighting in hallways'
    ],
    estimatedValue: 'Save $22,680/year'
  }
];

const mockSmartMetrics: SmartBuildingMetric[] = [
  {
    id: '1',
    name: 'Average Temperature',
    value: 72.4,
    unit: '°F',
    status: 'good',
    trend: 'stable',
    change: 0.2,
    icon: Thermometer
  },
  {
    id: '2',
    name: 'Energy Consumption',
    value: 87.2,
    unit: 'kWh',
    status: 'good',
    trend: 'down',
    change: -5.3,
    icon: Zap
  },
  {
    id: '3',
    name: 'Security Status',
    value: 98.7,
    unit: '%',
    status: 'good',
    trend: 'stable',
    change: 0.1,
    icon: Shield
  },
  {
    id: '4',
    name: 'Device Connectivity',
    value: 94.1,
    unit: '%',
    status: 'warning',
    trend: 'down',
    change: -2.3,
    icon: Wifi
  },
  {
    id: '5',
    name: 'Water Usage',
    value: 156.8,
    unit: 'gal/unit',
    status: 'warning',
    trend: 'up',
    change: 12.1,
    icon: Activity
  },
  {
    id: '6',
    name: 'Air Quality Index',
    value: 42,
    unit: 'AQI',
    status: 'good',
    trend: 'stable',
    change: -1.2,
    icon: Battery
  }
];

const mockPredictions: PredictiveAnalytic[] = [
  {
    id: '1',
    title: 'Revenue Forecast',
    prediction: 'Monthly revenue will increase by 8.2% next quarter',
    probability: 87,
    timeframe: 'Next 3 months',
    impact: '+$23,450/month',
    type: 'revenue'
  },
  {
    id: '2',
    title: 'Maintenance Costs',
    prediction: 'Maintenance costs will spike in February due to HVAC',
    probability: 92,
    timeframe: 'February 2024',
    impact: '+$8,900 one-time',
    type: 'maintenance'
  },
  {
    id: '3',
    title: 'Occupancy Rate',
    prediction: 'Occupancy will reach 97% by spring season',
    probability: 79,
    timeframe: 'March-May 2024',
    impact: '5 additional units',
    type: 'occupancy'
  },
  {
    id: '4',
    title: 'Payment Risk',
    prediction: '3 tenants at risk of late payments next month',
    probability: 71,
    timeframe: 'Next 30 days',
    impact: '$8,250 at risk',
    type: 'risk'
  }
];

export function AIDashboard() {
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null);
  const [activeTab, setActiveTab] = useState('insights');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'alert': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'prediction': return <Brain className="h-5 w-5 text-purple-600" />;
      case 'optimization': return <Lightbulb className="h-5 w-5 text-blue-600" />;
      default: return <Bot className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Brain className="h-8 w-8 mr-3 text-purple-600" />
            AI Super Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Advanced AI-powered insights and smart building management
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
            <Bot className="h-4 w-4 mr-2" />
            AI Chat Assistant
          </Button>
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* AI Performance Summary */}
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
              <p className="text-3xl font-bold">94.2%</p>
              <p className="text-gray-600 text-sm">AI Accuracy Score</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <Badge variant="default" className="bg-green-600">+$62K</Badge>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">$186K</p>
              <p className="text-gray-600 text-sm">AI-Identified Savings</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <Badge variant="secondary">Real-time</Badge>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">47</p>
              <p className="text-gray-600 text-sm">Active Predictions</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Zap className="h-6 w-6 text-orange-600" />
              </div>
              <Badge variant="destructive">3 Urgent</Badge>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">12</p>
              <p className="text-gray-600 text-sm">AI Recommendations</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="smart">Smart Building</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Insights List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                  AI-Generated Insights
                </CardTitle>
                <CardDescription>
                  Actionable recommendations powered by machine learning
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockAIInsights.map((insight) => (
                  <div
                    key={insight.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                      selectedInsight?.id === insight.id ? 'ring-2 ring-blue-500 bg-blue-50' : getPriorityColor(insight.priority)
                    }`}
                    onClick={() => setSelectedInsight(insight)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        {getTypeIcon(insight.type)}
                        <h4 className="font-medium text-sm ml-2">{insight.title}</h4>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={insight.priority === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                          {insight.priority}
                        </Badge>
                        <div className="text-xs text-gray-500">{insight.confidence}%</div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{insight.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-green-600">{insight.estimatedValue}</span>
                      <Badge variant="outline" className="text-xs">{insight.category}</Badge>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Confidence</span>
                        <span>{insight.confidence}%</span>
                      </div>
                      <Progress value={insight.confidence} className="h-1" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Selected Insight Details */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-blue-500" />
                  Insight Details & Actions
                </CardTitle>
                <CardDescription>
                  Detailed analysis and recommended actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedInsight ? (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-lg">{selectedInsight.title}</h3>
                        <Badge variant={selectedInsight.priority === 'high' ? 'destructive' : 'secondary'}>
                          {selectedInsight.priority} priority
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-4">{selectedInsight.description}</p>
                      
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-green-800 mb-2">Expected Impact</h4>
                        <p className="text-green-700 text-sm">{selectedInsight.impact}</p>
                        {selectedInsight.estimatedValue && (
                          <div className="mt-2 text-2xl font-bold text-green-800">
                            {selectedInsight.estimatedValue}
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">Recommended Actions</h4>
                        <div className="space-y-2">
                          {selectedInsight.actionItems.map((action, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                              <p className="text-sm text-gray-700">{action}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <div className="flex space-x-3">
                          <Button size="sm" className="flex-1">
                            <Target className="h-4 w-4 mr-2" />
                            Take Action
                          </Button>
                          <Button size="sm" variant="outline">
                            <Bot className="h-4 w-4 mr-2" />
                            Ask AI
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Select an insight to view detailed analysis</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="smart" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockSmartMetrics.map((metric) => (
              <Card key={metric.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg ${getStatusColor(metric.status)}`}>
                      <metric.icon className="h-6 w-6" />
                    </div>
                    <Badge variant={metric.status === 'good' ? 'default' : metric.status === 'warning' ? 'secondary' : 'destructive'}>
                      {metric.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm">{metric.name}</h3>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-bold">{metric.value}</span>
                      <span className="text-gray-500 text-sm">{metric.unit}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {metric.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : metric.trend === 'down' ? (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      ) : (
                        <div className="h-4 w-4" />
                      )}
                      <span className={`text-sm ${
                        metric.trend === 'up' ? 'text-green-600' : 
                        metric.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {Math.abs(metric.change)}% vs last week
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Real-time Device Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wifi className="h-5 w-5 mr-2 text-blue-500" />
                Smart Device Network Status
              </CardTitle>
              <CardDescription>
                Real-time monitoring of all connected IoT devices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { name: 'Smart Thermostats', total: 15, online: 14, type: 'thermostat' },
                  { name: 'Access Control', total: 8, online: 8, type: 'lock' },
                  { name: 'Security Cameras', total: 24, online: 22, type: 'camera' },
                  { name: 'Sensors', total: 45, online: 43, type: 'sensor' }
                ].map((device, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-sm mb-2">{device.name}</h4>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold">{device.online}</span>
                      <span className="text-gray-500 text-sm">of {device.total}</span>
                    </div>
                    <Progress value={(device.online / device.total) * 100} className="h-2" />
                    <div className="mt-2 text-xs text-gray-600">
                      {device.online === device.total ? 'All devices online' : `${device.total - device.online} offline`}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockPredictions.map((prediction) => (
              <Card key={prediction.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{prediction.title}</CardTitle>
                    <Badge variant="outline">{prediction.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">{prediction.prediction}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Confidence Level</span>
                      <span className="font-medium">{prediction.probability}%</span>
                    </div>
                    <Progress value={prediction.probability} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div>
                      <p className="text-xs text-gray-500">Timeframe</p>
                      <p className="font-medium text-sm">{prediction.timeframe}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Impact</p>
                      <p className="font-medium text-sm text-green-600">{prediction.impact}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bot className="h-5 w-5 mr-2 text-purple-500" />
                  Active AI Automations
                </CardTitle>
                <CardDescription>
                  Automated processes running 24/7
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: 'Rent Collection Reminders', status: 'active', processed: 156 },
                  { name: 'Maintenance Scheduling', status: 'active', processed: 89 },
                  { name: 'Tenant Screening', status: 'active', processed: 23 },
                  { name: 'Energy Optimization', status: 'active', processed: 1247 },
                  { name: 'Lease Renewal Predictions', status: 'active', processed: 67 },
                  { name: 'Market Rent Analysis', status: 'paused', processed: 0 }
                ].map((automation, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        automation.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                      <span className="font-medium text-sm">{automation.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{automation.processed}</div>
                      <div className="text-xs text-gray-500">processed today</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                  AI Performance Metrics
                </CardTitle>
                <CardDescription>
                  Real-time AI system performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { metric: 'Prediction Accuracy', value: 94.2, target: 90 },
                  { metric: 'Processing Speed', value: 98.7, target: 95 },
                  { metric: 'Data Quality Score', value: 96.1, target: 95 },
                  { metric: 'Model Confidence', value: 87.9, target: 85 }
                ].map((metric, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{metric.metric}</span>
                      <span className="font-medium">{metric.value}%</span>
                    </div>
                    <Progress value={metric.value} className="h-2" />
                    <div className="text-xs text-gray-500">Target: {metric.target}%</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
