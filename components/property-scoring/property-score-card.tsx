'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, TrendingUp, TrendingDown, Info } from 'lucide-react';

interface PropertyScoreBreakdown {
  budget: {
    score: number;
    factors: {
      variance: number;
      onTimePayments: number;
      costControl: number;
    };
  };
  compliance: {
    score: number;
    factors: {
      picusCompliance: number;
      nocisCompliance: number;
      inspectionsPassed: number;
      pendingViolations: number;
    };
  };
  taxFiling: {
    score: number;
    factors: {
      caoReturnsFiled: number;
      onTimeFiling: number;
      filingAccuracy: number;
    };
  };
  maintenance: {
    score: number;
    factors: {
      resolutionTime: number;
      openIssues: number;
      tenantSatisfaction: number;
      preventiveMaintenance: number;
    };
  };
  legal: {
    score: number;
    factors: {
      activeLawsuits: number;
      legalIncidents: number;
      complianceViolations: number;
      insuranceClaims: number;
    };
  };
}

interface PropertyScoreResult {
  buildingId: string;
  buildingName?: string;
  overallScore: number;
  breakdown: PropertyScoreBreakdown;
  grade: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'VERY_POOR';
  recommendations: string[];
  lastCalculated: Date;
}

interface PropertyScoreCardProps {
  buildingId?: string;
  initialData?: PropertyScoreResult;
  onUpdate?: (data: PropertyScoreResult) => void;
}

const SCORE_RANGES = {
  EXCELLENT: { min: 750, max: 850, color: 'bg-green-500', description: 'Exceptional property management' },
  GOOD: { min: 650, max: 749, color: 'bg-blue-500', description: 'Above average performance' },
  FAIR: { min: 550, max: 649, color: 'bg-yellow-500', description: 'Average performance' },
  POOR: { min: 450, max: 549, color: 'bg-orange-500', description: 'Below average performance' },
  VERY_POOR: { min: 0, max: 449, color: 'bg-red-500', description: 'Critical improvement needed' }
};

export function PropertyScoreCard({ buildingId, initialData, onUpdate }: PropertyScoreCardProps) {
  const [scoreData, setScoreData] = useState<PropertyScoreResult | null>(initialData || null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchPropertyScore = async (update = false) => {
    if (!buildingId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/property-scores?buildingId=${buildingId}&update=${update}`);
      const result = await response.json();
      
      if (result.success) {
        setScoreData(result.data);
        onUpdate?.(result.data);
      }
    } catch (error) {
      console.error('Error fetching property score:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (buildingId && !initialData) {
      fetchPropertyScore();
    }
  }, [buildingId]);

  const getGradeColor = (grade: string) => {
    return SCORE_RANGES[grade as keyof typeof SCORE_RANGES]?.color || 'bg-gray-500';
  };

  const getScoreColor = (score: number) => {
    if (score >= 750) return 'text-green-600';
    if (score >= 650) return 'text-blue-600';
    if (score >= 550) return 'text-yellow-600';
    if (score >= 450) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatScore = (score: number) => score.toLocaleString();

  const renderFactorBar = (value: number, label: string, invert = false) => (
    <div className="flex justify-between items-center mb-2">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-sm ${getScoreColor(value)}`}>{value}%</span>
        <Progress 
          value={invert ? 100 - value : value} 
          className="w-20 h-2"
        />
      </div>
    </div>
  );

  if (!scoreData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center">
            <Info className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-500">No property score data available</p>
            {buildingId && (
              <Button 
                onClick={() => fetchPropertyScore()} 
                variant="outline" 
                size="sm" 
                className="mt-2"
              >
                Calculate Score
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold">
                Property Score: {formatScore(scoreData.overallScore)}
              </CardTitle>
              <CardDescription>
                {scoreData.buildingName && `Building: ${scoreData.buildingName}`}
                <br />
                Last calculated: {new Date(scoreData.lastCalculated).toLocaleDateString()}
              </CardDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className={`${getGradeColor(scoreData.grade)} text-white`}>
                {scoreData.grade}
              </Badge>
              <Button
                onClick={() => fetchPropertyScore(true)}
                disabled={loading}
                size="sm"
                variant="outline"
              >
                {loading ? 'Updating...' : 'Update Score'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-4">
            <div className={`text-4xl font-bold ${getScoreColor(scoreData.overallScore)}`}>
              {formatScore(scoreData.overallScore)}
            </div>
            <p className="text-sm text-gray-600">
              {SCORE_RANGES[scoreData.grade]?.description}
            </p>
          </div>
          
          {/* Score Range Visual */}
          <div className="relative h-4 bg-gradient-to-r from-green-500 via-yellow-500 via-orange-500 to-red-500 rounded-full mb-2">
            <div 
              className="absolute h-6 w-6 bg-white border-2 border-gray-800 rounded-full -top-1 transform -translate-x-1/2"
              style={{ 
                left: `${(scoreData.overallScore / 850) * 100}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-600 mb-4">
            <span>0</span>
            <span>425</span>
            <span>550</span>
            <span>650</span>
            <span>750</span>
            <span>850</span>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="legal">Legal</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  Budget
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {scoreData.breakdown.budget.score}%
                </div>
                {renderFactorBar(scoreData.breakdown.budget.factors.onTimePayments, 'On-time Payments')}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {scoreData.breakdown.compliance.score}%
                </div>
                {renderFactorBar(scoreData.breakdown.compliance.factors.inspectionsPassed, 'Inspections Passed')}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full" />
                  Tax Filing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {scoreData.breakdown.taxFiling.score}%
                </div>
                {renderFactorBar(scoreData.breakdown.taxFiling.factors.onTimeFiling, 'On-time Filing')}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full" />
                  Maintenance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600 mb-2">
                  {scoreData.breakdown.maintenance.score}%
                </div>
                {renderFactorBar(scoreData.breakdown.maintenance.factors.tenantSatisfaction, 'Tenant Satisfaction')}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  Legal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600 mb-2">
                  {scoreData.breakdown.legal.score}%
                </div>
                {renderFactorBar(scoreData.breakdown.legal.score, 'Legal Score', true)}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="budget">
          <Card>
            <CardHeader>
              <CardTitle>Budget Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-blue-600 text-center mb-4">
                {scoreData.breakdown.budget.score}%
              </div>
              {renderFactorBar(scoreData.breakdown.budget.factors.onTimePayments, 'On-time Payments')}
              {renderFactorBar(scoreData.breakdown.budget.factors.costControl, 'Cost Control')}
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold mb-2">Budget Variance</h4>
                <p className="text-2xl font-bold text-blue-600">
                  {scoreData.breakdown.budget.factors.variance}%
                </p>
                <p className="text-sm text-gray-600">
                  {Math.abs(scoreData.breakdown.budget.factors.variance) < 5 ? 'Excellent budget adherence' : 
                   Math.abs(scoreData.breakdown.budget.factors.variance) < 10 ? 'Good budget control' : 
                   'Needs budget improvement'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-green-600 text-center mb-4">
                {scoreData.breakdown.compliance.score}%
              </div>
              {renderFactorBar(scoreData.breakdown.compliance.factors.picusCompliance, 'PICUS Compliance')}
              {renderFactorBar(scoreData.breakdown.compliance.factors.nocisCompliance, 'NOCIS Compliance')}
              {renderFactorBar(scoreData.breakdown.compliance.factors.inspectionsPassed, 'Inspections Passed')}
              
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold mb-2">Pending Violations</h4>
                <div className="flex items-center gap-2">
                  {scoreData.breakdown.compliance.factors.pendingViolations === 0 ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className="text-2xl font-bold">
                    {scoreData.breakdown.compliance.factors.pendingViolations}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {scoreData.breakdown.compliance.factors.pendingViolations === 0 ? 
                    'No pending violations - Excellent!' : 
                    `${scoreData.breakdown.compliance.factors.pendingViolations} violations need attention`}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-orange-600 text-center mb-4">
                {scoreData.breakdown.maintenance.score}%
              </div>
              {renderFactorBar(scoreData.breakdown.maintenance.factors.tenantSatisfaction, 'Tenant Satisfaction')}
              {renderFactorBar(scoreData.breakdown.maintenance.factors.preventiveMaintenance, 'Preventive Maintenance')}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Avg Resolution Time</h4>
                  <p className="text-2xl font-bold text-orange-600">
                    {scoreData.breakdown.maintenance.factors.resolutionTime} days
                  </p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Open Issues</h4>
                  <div className="flex items-center gap-2">
                    {scoreData.breakdown.maintenance.factors.openIssues === 0 ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className="text-2xl font-bold">
                      {scoreData.breakdown.maintenance.factors.openIssues}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="legal">
          <Card>
            <CardHeader>
              <CardTitle>Legal & Risk Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-red-600 text-center mb-4">
                {scoreData.breakdown.legal.score}%
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-red-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Active Lawsuits</h4>
                  <div className="flex items-center gap-2">
                    {scoreData.breakdown.legal.factors.activeLawsuits === 0 ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className="text-2xl font-bold">
                      {scoreData.breakdown.legal.factors.activeLawsuits}
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Legal Incidents</h4>
                  <p className="text-2xl font-bold text-red-600">
                    {scoreData.breakdown.legal.factors.legalIncidents}
                  </p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Compliance Violations</h4>
                  <p className="text-2xl font-bold text-red-600">
                    {scoreData.breakdown.legal.factors.complianceViolations}
                  </p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Insurance Claims</h4>
                  <p className="text-2xl font-bold text-red-600">
                    {scoreData.breakdown.legal.factors.insuranceClaims}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recommendations */}
      {scoreData.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Recommendations for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {scoreData.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
