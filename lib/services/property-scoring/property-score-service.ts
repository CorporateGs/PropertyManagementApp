import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export interface PropertyScoreBreakdown {
  budget: {
    score: number;
    factors: {
      variance: number; // Budget variance percentage
      onTimePayments: number; // Percentage of on-time payments
      costControl: number; // Cost control efficiency
    };
  };
  compliance: {
    score: number;
    factors: {
      picusCompliance: number; // PICUS compliance rate
      nocisCompliance: number; // NOCIS compliance rate
      inspectionsPassed: number; // Inspection pass rate
      pendingViolations: number; // Number of pending violations
    };
  };
  taxFiling: {
    score: number;
    factors: {
      caoReturnsFiled: number; // CAO returns filing rate
      onTimeFiling: number; // On-time filing percentage
      filingAccuracy: number; // Accuracy of filed returns
    };
  };
  maintenance: {
    score: number;
    factors: {
      resolutionTime: number; // Average resolution time (days)
      openIssues: number; // Number of open issues
      tenantSatisfaction: number; // Tenant satisfaction score
      preventiveMaintenance: number; // Preventive maintenance completion rate
    };
  };
  legal: {
    score: number;
    factors: {
      activeLawsuits: number; // Number of active lawsuits
      legalIncidents: number; // Number of legal incidents
      complianceViolations: number; // Compliance violations
      insuranceClaims: number; // Insurance claims count
    };
  };
}

export interface PropertyScoreResult {
  buildingId: string;
  buildingName?: string;
  overallScore: number; // 0-850 (like credit score)
  breakdown: PropertyScoreBreakdown;
  grade: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'VERY_POOR';
  recommendations: string[];
  lastCalculated: Date;
}

export class PropertyScoreService {
  private static readonly SCORE_RANGES = {
    EXCELLENT: { min: 750, max: 850, color: '#10B981', description: 'Exceptional property management' },
    GOOD: { min: 650, max: 749, color: '#3B82F6', description: 'Above average performance' },
    FAIR: { min: 550, max: 649, color: '#F59E0B', description: 'Average performance' },
    POOR: { min: 450, max: 549, color: '#EF4444', description: 'Below average performance' },
    VERY_POOR: { min: 0, max: 449, color: '#991B1B', description: 'Critical improvement needed' }
  };

  /**
   * Calculate comprehensive property score
   */
  static async calculatePropertyScore(buildingId: string): Promise<PropertyScoreResult> {
    try {
      logger.info(`Calculating property score for building: ${buildingId}`);

      const breakdown = await this.calculateScoreBreakdown(buildingId);
      const overallScore = this.calculateOverallScore(breakdown);
      const grade = this.getScoreGrade(overallScore);
      const recommendations = this.generateRecommendations(breakdown, grade);

      return {
        buildingId,
        overallScore,
        breakdown,
        grade,
        recommendations,
        lastCalculated: new Date()
      };
    } catch (error) {
      logger.error('Error calculating property score:', error as Error);
      throw error;
    }
  }

  /**
   * Calculate individual score components
   */
  private static async calculateScoreBreakdown(buildingId: string): Promise<PropertyScoreBreakdown> {
    const [budgetScore, complianceScore, taxScore, maintenanceScore, legalScore] = await Promise.all([
      this.calculateBudgetScore(buildingId),
      this.calculateComplianceScore(buildingId),
      this.calculateTaxFilingScore(buildingId),
      this.calculateMaintenanceScore(buildingId),
      this.calculateLegalScore(buildingId)
    ]);

    return {
      budget: budgetScore,
      compliance: complianceScore,
      taxFiling: taxScore,
      maintenance: maintenanceScore,
      legal: legalScore
    };
  }

  /**
   * Calculate budget adherence score (0-100)
   */
  private static async calculateBudgetScore(buildingId: string): Promise<PropertyScoreBreakdown['budget']> {
    // Get financial data for the property
    const building = await prisma.building.findUnique({
      where: { id: buildingId },
      include: {
        units: {
          include: {
            tenants: {
              include: {
                payments: true
              }
            }
          }
        }
      }
    });

    if (!building) {
      throw new Error(`Building not found: ${buildingId}`);
    }

    // Calculate budget variance (lower is better)
    const totalBudget = building.totalUnits * 1000; // Assuming $1000 per unit as budget
    const actualExpenses = await this.calculateActualExpenses(buildingId);
    const variance = Math.abs((actualExpenses - totalBudget) / totalBudget) * 100;
    const varianceScore = Math.max(0, 100 - variance * 2);

    // Calculate on-time payments
    const allPayments = building.units.flatMap(unit => 
      unit.tenants.flatMap(tenant => tenant.payments)
    );
    const onTimePayments = allPayments.filter(p => 
      p.paidDate && new Date(p.paidDate) <= new Date(p.dueDate)
    ).length;
    const onTimePaymentRate = allPayments.length > 0 ? (onTimePayments / allPayments.length) * 100 : 100;
    const onTimePaymentScore = Math.min(100, onTimePaymentRate);

    // Calculate cost control (based on variance)
    const costControlScore = varianceScore;

    // Overall budget score
    const score = (varianceScore + onTimePaymentScore + costControlScore) / 3;

    return {
      score: Math.round(score),
      factors: {
        variance: Math.round(variance * 100) / 100,
        onTimePayments: Math.round(onTimePaymentRate),
        costControl: Math.round(costControlScore)
      }
    };
  }

  /**
   * Calculate compliance score (PICUS/NOCIS) (0-100)
   */
  private static async calculateComplianceScore(buildingId: string): Promise<PropertyScoreBreakdown['compliance']> {
    const complianceChecks = await prisma.complianceCheck.findMany({
      where: { buildingId },
      include: { program: true }
    });

    // Calculate PICUS compliance (safety and operational compliance)
    const picusChecks = complianceChecks.filter(c => 
      c.program?.category === 'Safety' || c.program?.category === 'Environmental'
    );
    const picusPassed = picusChecks.filter(c => c.status === 'COMPLETED').length;
    const picusComplianceRate = picusChecks.length > 0 ? (picusPassed / picusChecks.length) * 100 : 100;

    // Calculate NOCIS compliance (financial and operational compliance)
    const nocisChecks = complianceChecks.filter(c => 
      c.program?.category === 'Financial' || c.program?.category === 'Fair Housing'
    );
    const nocisPassed = nocisChecks.filter(c => c.status === 'COMPLETED').length;
    const nocisComplianceRate = nocisChecks.length > 0 ? (nocisPassed / nocisChecks.length) * 100 : 100;

    // Calculate inspection pass rate
    const totalInspections = complianceChecks.length;
    const passedInspections = complianceChecks.filter(c => c.status === 'COMPLETED').length;
    const inspectionPassRate = totalInspections > 0 ? (passedInspections / totalInspections) * 100 : 100;

    // Calculate pending violations
    const pendingViolations = complianceChecks.filter(c => 
      c.status === 'PENDING' && new Date(c.dueDate) < new Date()
    ).length;
    const violationScore = Math.max(0, 100 - (pendingViolations * 10));

    // Overall compliance score
    const score = (picusComplianceRate + nocisComplianceRate + inspectionPassRate + violationScore) / 4;

    return {
      score: Math.round(score),
      factors: {
        picusCompliance: Math.round(picusComplianceRate),
        nocisCompliance: Math.round(nocisComplianceRate),
        inspectionsPassed: Math.round(inspectionPassRate),
        pendingViolations
      }
    };
  }

  /**
   * Calculate tax filing score (CAO returns) (0-100)
   */
  private static async calculateTaxFilingScore(buildingId: string): Promise<PropertyScoreBreakdown['taxFiling']> {
    // Get tax-related documents
    const allDocuments = await prisma.document.findMany({
      where: { buildingId }
    });
    const taxDocuments = allDocuments.filter(doc => 
      doc.type.toLowerCase().includes('tax')
    );

    // Calculate CAO returns filing rate
    const currentYear = new Date().getFullYear();
    const expectedReturns = 4; // Quarterly returns
    const filedReturns = taxDocuments.filter(doc => 
      new Date(doc.createdAt).getFullYear() === currentYear
    ).length;
    const filingRate = Math.min(100, (filedReturns / expectedReturns) * 100);

    // Calculate on-time filing (assuming due dates are March 31, June 30, Sep 30, Dec 31)
    const onTimeReturns = taxDocuments.filter(doc => {
      const createdAt = new Date(doc.createdAt);
      const quarter = Math.floor((createdAt.getMonth() + 3) / 3);
      const dueDates = [
        new Date(currentYear, 2, 31), // March 31
        new Date(currentYear, 5, 30), // June 30
        new Date(currentYear, 8, 30), // Sep 30
        new Date(currentYear, 11, 31) // Dec 31
      ];
      return createdAt <= dueDates[quarter - 1];
    }).length;
    const onTimeFilingRate = filedReturns > 0 ? (onTimeReturns / filedReturns) * 100 : 100;

    // Calculate filing accuracy (based on document completeness)
    const filingAccuracy = Math.min(100, (taxDocuments.length * 25)); // 25 points per complete filing

    // Overall tax filing score
    const score = (filingRate + onTimeFilingRate + filingAccuracy) / 3;

    return {
      score: Math.round(score),
      factors: {
        caoReturnsFiled: Math.round(filingRate),
        onTimeFiling: Math.round(onTimeFilingRate),
        filingAccuracy: Math.round(filingAccuracy)
      }
    };
  }

  /**
   * Calculate maintenance score (service issues) (0-100)
   */
  private static async calculateMaintenanceScore(buildingId: string): Promise<PropertyScoreBreakdown['maintenance']> {
    const maintenanceRequests = await prisma.maintenanceRequest.findMany({
      where: { buildingId }
    });

    // Calculate resolution time
    const completedRequests = maintenanceRequests.filter(r => r.completedAt);
    const totalResolutionTime = completedRequests.reduce((sum, request) => {
      if (request.completedAt) {
        const days = Math.ceil(
          (new Date(request.completedAt).getTime() - new Date(request.createdAt).getTime()) / 
          (1000 * 60 * 60 * 24)
        );
        return sum + days;
      }
      return sum;
    }, 0);
    const averageResolutionTime = completedRequests.length > 0 ? 
      totalResolutionTime / completedRequests.length : 0;
    const resolutionTimeScore = Math.max(0, 100 - (averageResolutionTime * 5));

    // Calculate open issues
    const openIssues = maintenanceRequests.filter(r => r.status === 'OPEN').length;
    const openIssuesScore = Math.max(0, 100 - (openIssues * 10));

    // Calculate tenant satisfaction (mock data - would come from surveys)
    const tenantSatisfaction = 75; // Default satisfaction rate
    const satisfactionScore = tenantSatisfaction;

    // Calculate preventive maintenance (mock data)
    const preventiveMaintenance = 80; // Default completion rate
    const preventiveScore = preventiveMaintenance;

    // Overall maintenance score
    const score = (resolutionTimeScore + openIssuesScore + satisfactionScore + preventiveScore) / 4;

    return {
      score: Math.round(score),
      factors: {
        resolutionTime: Math.round(averageResolutionTime * 10) / 10,
        openIssues,
        tenantSatisfaction,
        preventiveMaintenance
      }
    };
  }

  /**
   * Calculate legal score (lawsuits/incidents) (0-100)
   */
  private static async calculateLegalScore(buildingId: string): Promise<PropertyScoreBreakdown['legal']> {
    // Get all documents and filter for legal-related ones
    const allDocuments = await prisma.document.findMany({
      where: { buildingId }
    });
    
    const legalDocuments = allDocuments.filter(doc => 
      doc.type.toLowerCase().includes('lawsuit') ||
      doc.type.toLowerCase().includes('legal') ||
      doc.type.toLowerCase().includes('incident')
    );

    // Calculate active lawsuits
    const activeLawsuits = legalDocuments.filter(doc => 
      doc.type.toLowerCase().includes('lawsuit') && !doc.name.includes('CLOSED')
    ).length;
    const lawsuitsScore = Math.max(0, 100 - (activeLawsuits * 25));

    // Calculate legal incidents
    const legalIncidents = legalDocuments.filter(doc => 
      doc.type.toLowerCase().includes('incident')
    ).length;
    const incidentsScore = Math.max(0, 100 - (legalIncidents * 15));

    // Calculate compliance violations
    const complianceViolations = await prisma.complianceCheck.count({
      where: {
        buildingId,
        status: 'FAILED'
      }
    });
    const violationsScore = Math.max(0, 100 - (complianceViolations * 10));

    // Calculate insurance claims
    const insuranceClaims = legalDocuments.filter(doc => 
      doc.type.toLowerCase().includes('insurance') && doc.type.toLowerCase().includes('claim')
    ).length;
    const claimsScore = Math.max(0, 100 - (insuranceClaims * 20));

    // Overall legal score
    const score = (lawsuitsScore + incidentsScore + violationsScore + claimsScore) / 4;

    return {
      score: Math.round(score),
      factors: {
        activeLawsuits,
        legalIncidents,
        complianceViolations,
        insuranceClaims
      }
    };
  }

  /**
   * Calculate overall property score (0-850)
   */
  private static calculateOverallScore(breakdown: PropertyScoreBreakdown): number {
    // Weight each component (similar to credit score weighting)
    const weights = {
      budget: 0.25,      // 25% weight
      compliance: 0.25,   // 25% weight
      taxFiling: 0.20,    // 20% weight
      maintenance: 0.20,   // 20% weight
      legal: 0.10         // 10% weight
    };

    const weightedScore = 
      (breakdown.budget.score * weights.budget * 8.5) +      // Max 212.5 points
      (breakdown.compliance.score * weights.compliance * 8.5) + // Max 212.5 points
      (breakdown.taxFiling.score * weights.taxFiling * 8.5) +   // Max 170 points
      (breakdown.maintenance.score * weights.maintenance * 8.5) + // Max 170 points
      (breakdown.legal.score * weights.legal * 8.5);             // Max 85 points

    return Math.round(weightedScore);
  }

  /**
   * Get score grade based on overall score
   */
  private static getScoreGrade(score: number): PropertyScoreResult['grade'] {
    for (const [grade, range] of Object.entries(this.SCORE_RANGES)) {
      if (score >= range.min && score <= range.max) {
        return grade as PropertyScoreResult['grade'];
      }
    }
    return 'VERY_POOR';
  }

  /**
   * Generate recommendations based on score breakdown
   */
  private static generateRecommendations(
    breakdown: PropertyScoreBreakdown, 
    grade: PropertyScoreResult['grade']
  ): string[] {
    const recommendations: string[] = [];

    if (breakdown.budget.score < 70) {
      recommendations.push('Improve budget adherence by implementing stricter expense tracking and variance analysis');
      if (breakdown.budget.factors.onTimePayments < 80) {
        recommendations.push('Implement automated payment reminders and late fee policies to improve on-time payment rate');
      }
    }

    if (breakdown.compliance.score < 70) {
      recommendations.push('Address compliance gaps by creating a comprehensive compliance calendar');
      if (breakdown.compliance.factors.pendingViolations > 0) {
        recommendations.push(`Resolve ${breakdown.compliance.factors.pendingViolations} pending compliance violations immediately`);
      }
    }

    if (breakdown.taxFiling.score < 70) {
      recommendations.push('Establish a tax filing schedule with quarterly reminders for CAO returns');
      if (breakdown.taxFiling.factors.onTimeFiling < 80) {
        recommendations.push('Engage a tax professional to ensure timely and accurate CAO return filings');
      }
    }

    if (breakdown.maintenance.score < 70) {
      recommendations.push('Implement a preventive maintenance program to reduce reactive repairs');
      if (breakdown.maintenance.factors.resolutionTime > 5) {
        recommendations.push('Streamline maintenance response process to reduce resolution time');
      }
    }

    if (breakdown.legal.score < 70) {
      recommendations.push('Conduct regular legal compliance audits to identify and mitigate risks');
      if (breakdown.legal.factors.activeLawsuits > 0) {
        recommendations.push('Review and resolve active legal disputes through alternative dispute resolution');
      }
    }

    if (grade === 'VERY_POOR' || grade === 'POOR') {
      recommendations.push('Consider hiring a professional property management company to improve operational efficiency');
    }

    return recommendations;
  }

  /**
   * Calculate actual expenses for a building
   */
  private static async calculateActualExpenses(buildingId: string): Promise<number> {
    // This would integrate with financial data
    // For now, return a mock value
    return 800000; // Mock annual expenses
  }

  /**
   * Update property score in database (simplified version without new fields)
   */
  static async updatePropertyScore(buildingId: string): Promise<PropertyScoreResult> {
    const scoreResult = await this.calculatePropertyScore(buildingId);
    
    // Log the score calculation for now
    // In future, this would update the database with new score fields
    logger.info(`Property score calculated for building ${buildingId}: ${scoreResult.overallScore} (${scoreResult.grade})`);
    
    return scoreResult;
  }

  /**
   * Get score range information
   */
  static getScoreRangeInfo(grade: PropertyScoreResult['grade']) {
    return this.SCORE_RANGES[grade];
  }

  /**
   * Calculate scores for all buildings
   */
  static async updateAllPropertyScores(): Promise<PropertyScoreResult[]> {
    const buildings = await prisma.building.findMany({
      select: { id: true, name: true }
    });

    const results = await Promise.allSettled(
      buildings.map(async (building) => {
        const scoreResult = await this.calculatePropertyScore(building.id);
        return {
          ...scoreResult,
          buildingName: building.name
        };
      })
    );

    const successfulResults = results
      .filter((result): result is PromiseFulfilledResult<PropertyScoreResult> => 
        result.status === 'fulfilled')
      .map(result => result.value);

    const failedResults = results
      .filter((result): result is PromiseRejectedResult => result.status === 'rejected');

    if (failedResults.length > 0) {
      logger.warn(`Failed to update scores for ${failedResults.length} buildings`);
    }

    logger.info(`Successfully calculated scores for ${successfulResults.length} buildings`);
    return successfulResults;
  }
}
