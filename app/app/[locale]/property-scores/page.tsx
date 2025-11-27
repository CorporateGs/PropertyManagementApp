'use client';

import React, { useState, useEffect } from 'react';
import { PropertyScoreCard } from '@/components/property-scoring/property-score-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';

interface Building {
  id: string;
  name: string;
  address: string;
  totalUnits: number;
}

interface PropertyScoreResult {
  buildingId: string;
  buildingName?: string;
  overallScore: number;
  breakdown: any;
  grade: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'VERY_POOR';
  recommendations: string[];
  lastCalculated: Date;
}

export default function PropertyScoresPage() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('');
  const [allScores, setAllScores] = useState<PropertyScoreResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    try {
      const response = await fetch('/api/buildings');
      const result = await response.json();
      if (result.success) {
        setBuildings(result.data);
        if (result.data.length > 0 && !selectedBuildingId) {
          setSelectedBuildingId(result.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching buildings:', error);
    }
  };

  const fetchAllScores = async (update = false) => {
    if (update) setUpdating(true);
    else setLoading(true);
    
    try {
      const response = await fetch(`/api/property-scores?update=${update}`);
      const result = await response.json();
      
      if (result.success) {
        setAllScores(result.data);
      }
    } catch (error) {
      console.error('Error fetching all property scores:', error);
    } finally {
      setLoading(false);
      setUpdating(false);
    }
  };

  const getGradeColor = (grade: string) => {
    const colors = {
      EXCELLENT: 'bg-green-500',
      GOOD: 'bg-blue-500',
      FAIR: 'bg-yellow-500',
      POOR: 'bg-orange-500',
      VERY_POOR: 'bg-red-500'
    };
    return colors[grade as keyof typeof colors] || 'bg-gray-500';
  };

  const getScoreColor = (score: number) => {
    if (score >= 750) return 'text-green-600';
    if (score >= 650) return 'text-blue-600';
    if (score >= 550) return 'text-yellow-600';
    if (score >= 450) return 'text-orange-600';
    return 'text-red-600';
  };

  const getAverageScore = () => {
    if (allScores.length === 0) return 0;
    const total = allScores.reduce((sum, score) => sum + score.overallScore, 0);
    return Math.round(total / allScores.length);
  };

  const getScoreDistribution = () => {
    const distribution = {
      EXCELLENT: 0,
      GOOD: 0,
      FAIR: 0,
      POOR: 0,
      VERY_POOR: 0
    };

    allScores.forEach(score => {
      distribution[score.grade]++;
    });

    return distribution;
  };

  useEffect(() => {
    fetchAllScores();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Property Scores Dashboard</h1>
          <p className="text-gray-600">Monitor and analyze property performance scores</p>
        </div>
        <Button 
          onClick={() => fetchAllScores(true)} 
          disabled={updating}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${updating ? 'animate-spin' : ''}`} />
          {updating ? 'Updating All Scores...' : 'Update All Scores'}
        </Button>
      </div>

      {/* Summary Cards */}
      {allScores.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Average Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getScoreColor(getAverageScore())}`}>
                {getAverageScore().toLocaleString()}
              </div>
              <p className="text-xs text-gray-600">
                Across {allScores.length} properties
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Excellent Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {getScoreDistribution().EXCELLENT}
              </div>
              <p className="text-xs text-gray-600">
                {((getScoreDistribution().EXCELLENT / allScores.length) * 100).toFixed(1)}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Need Attention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {getScoreDistribution().POOR + getScoreDistribution().VERY_POOR}
              </div>
              <p className="text-xs text-gray-600">
                {(((getScoreDistribution().POOR + getScoreDistribution().VERY_POOR) / allScores.length) * 100).toFixed(1)}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Last Updated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">
                {allScores.length > 0 ? 
                  new Date(Math.max(...allScores.map(s => new Date(s.lastCalculated).getTime()))).toLocaleDateString() :
                  'Never'
                }
              </div>
              <p className="text-xs text-gray-600">
                Most recent calculation
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Property Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Individual Property Analysis
          </CardTitle>
          <CardDescription>
            Select a property to view detailed score breakdown and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Select value={selectedBuildingId} onValueChange={setSelectedBuildingId}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select a property" />
              </SelectTrigger>
              <SelectContent>
                {buildings.map((building) => (
                  <SelectItem key={building.id} value={building.id}>
                    {building.name} ({building.totalUnits} units)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedBuildingId && (
              <Badge variant="outline" className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                Viewing: {buildings.find(b => b.id === selectedBuildingId)?.name}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selected Property Score */}
      {selectedBuildingId && (
        <PropertyScoreCard 
          buildingId={selectedBuildingId}
          onUpdate={(data) => {
            setAllScores(prev => 
              prev.map(score => score.buildingId === data.buildingId ? data : score)
            );
          }}
        />
      )}

      {/* All Properties Overview */}
      {allScores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              All Properties Overview
            </CardTitle>
            <CardDescription>
              Quick view of all property scores and performance indicators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allScores.map((score) => {
                const building = buildings.find(b => b.id === score.buildingId);
                return (
                  <div key={score.buildingId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{score.buildingName || building?.name || 'Unknown Property'}</h3>
                        <Badge className={`${getGradeColor(score.grade)} text-white`}>
                          {score.grade}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {building?.address} • {building?.totalUnits} units
                      </p>
                      <p className="text-xs text-gray-500">
                        Last updated: {new Date(score.lastCalculated).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getScoreColor(score.overallScore)}`}>
                        {score.overallScore.toLocaleString()}
                      </div>
                      {score.recommendations.length > 0 && (
                        <div className="flex items-center gap-1 text-sm text-orange-600">
                          <AlertTriangle className="h-3 w-3" />
                          {score.recommendations.length} recommendation{score.recommendations.length > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && allScores.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin text-gray-400" />
              <p className="text-gray-500">Loading property scores...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && allScores.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <div className="text-center">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-gray-500">No property scores calculated yet</p>
              <Button 
                onClick={() => fetchAllScores(true)} 
                variant="outline" 
                size="sm" 
                className="mt-2"
              >
                Calculate All Scores
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
