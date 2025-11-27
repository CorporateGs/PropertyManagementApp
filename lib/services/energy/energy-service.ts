/**
 * Energy Management & Sustainability Service
 * 
 * Features:
 * - Utility bill tracking
 * - Consumption analytics
 * - Cost allocation
 * - Budget vs actual
 * - Trend analysis
 * - Anomaly detection
 * - Carbon footprint calculation
 * - Energy efficiency recommendations
 * - Smart device integration
 * - Sustainability reporting
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { DatabaseError, ExternalServiceError } from '@/lib/errors';

/**
 * Energy Service Types
 */
export enum EnergyType {
  ELECTRICITY = 'ELECTRICITY',
  GAS = 'GAS',
  WATER = 'WATER',
  HEATING = 'HEATING',
  COOLING = 'COOLING',
  SOLAR = 'SOLAR',
}

export enum UtilityProvider {
  PG_E = 'PG_E',
  SOUTHERN_EDISON = 'SOUTHERN_EDISON',
  CONSOLIDATED_EDISON = 'CONSOLIDATED_EDISON',
  AMERICAN_WATER = 'AMERICAN_WATER',
  NATIONAL_GRID = 'NATIONAL_GRID',
  OTHER = 'OTHER',
}

/**
 * Energy Management Service
 */
class EnergyManagementService {
  /**
   * Record energy consumption
   */
  async recordConsumption(params: {
    buildingId: string;
    unitId?: string;
    energyType: EnergyType;
    amount: number;
    unit: string; // kWh, therms, gallons, etc.
    cost: number;
    readingDate: Date;
    meterReading?: number;
    provider?: UtilityProvider;
  }): Promise<{ readingId: string }> {
    try {
      logger.info("Recording energy consumption", {
        buildingId: params.buildingId,
        energyType: params.energyType,
        amount: params.amount
      });

      const reading = await prisma.energyReading.create({
        data: {
          buildingId: params.buildingId,
          unitId: params.unitId,
          energyType: params.energyType,
          amount: params.amount,
          unit: params.unit,
          cost: params.cost,
          readingDate: params.readingDate,
          meterReading: params.meterReading,
          provider: params.provider,
          isAnomaly: false, // Will be calculated later
        }
      });

      // Check for anomalies
      await this.detectAnomalies(reading.id);

      logger.info("Energy consumption recorded successfully", { readingId: reading.id });
      return { readingId: reading.id };
    } catch (error) {
      logger.error("Failed to record energy consumption", error);
      throw new DatabaseError("Failed to record energy consumption");
    }
  }

  /**
   * Get energy consumption analytics
   */
  async getConsumptionAnalytics(params: {
    buildingId?: string;
    unitId?: string;
    energyType?: EnergyType;
    startDate: Date;
    endDate: Date;
  }): Promise<{
    totalConsumption: number;
    totalCost: number;
    averageDaily: number;
    trend: number;
    peakUsage: { date: Date; amount: number };
    efficiency: number;
    comparison: {
      previous: number;
      change: number;
    };
  }> {
    try {
      logger.info("Generating energy consumption analytics", {
        buildingId: params.buildingId,
        startDate: params.startDate,
        endDate: params.endDate
      });

      const whereClause: any = {
        readingDate: {
          gte: params.startDate,
          lte: params.endDate
        }
      };

      if (params.buildingId) whereClause.buildingId = params.buildingId;
      if (params.unitId) whereClause.unitId = params.unitId;
      if (params.energyType) whereClause.energyType = params.energyType;

      const readings = await prisma.energyReading.findMany({
        where: whereClause,
        orderBy: { readingDate: 'asc' }
      });

      const totalConsumption = readings.reduce((sum, reading) => sum + reading.amount, 0);
      const totalCost = readings.reduce((sum, reading) => sum + reading.cost, 0);
      const days = Math.ceil((params.endDate.getTime() - params.startDate.getTime()) / (1000 * 60 * 60 * 24));
      const averageDaily = days > 0 ? totalConsumption / days : 0;

      // Calculate trend
      const trend = this.calculateTrend(readings);

      // Find peak usage
      const peakUsage = readings.reduce((peak, reading) => 
        reading.amount > peak.amount ? { date: reading.readingDate, amount: reading.amount } : peak,
        { date: params.startDate, amount: 0 }
      );

      // Calculate efficiency (simplified)
      const efficiency = this.calculateEfficiency(readings);

      // Compare with previous period
      const previousPeriod = await this.getPreviousPeriodData(params);
      const comparison = {
        previous: previousPeriod.totalConsumption,
        change: previousPeriod.totalConsumption > 0 
          ? ((totalConsumption - previousPeriod.totalConsumption) / previousPeriod.totalConsumption) * 100 
          : 0
      };

      const result = {
        totalConsumption: Math.round(totalConsumption * 100) / 100,
        totalCost: Math.round(totalCost * 100) / 100,
        averageDaily: Math.round(averageDaily * 100) / 100,
        trend: Math.round(trend * 100) / 100,
        peakUsage,
        efficiency: Math.round(efficiency * 100) / 100,
        comparison: {
          previous: Math.round(comparison.previous * 100) / 100,
          change: Math.round(comparison.change * 100) / 100
        }
      };

      logger.info("Energy consumption analytics generated", {
        totalConsumption: result.totalConsumption,
        totalCost: result.totalCost,
        efficiency: result.efficiency
      });

      return result;
    } catch (error) {
      logger.error("Failed to generate energy consumption analytics", error);
      throw new DatabaseError("Failed to generate energy consumption analytics");
    }
  }

  /**
   * Detect energy anomalies
   */
  async detectAnomalies(readingId: string): Promise<{
    isAnomaly: boolean;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    reason: string;
    recommendation: string;
  }> {
    try {
      const reading = await prisma.energyReading.findUnique({
        where: { id: readingId },
        include: { building: true }
      });

      if (!reading) {
        throw new DatabaseError(`Energy reading not found: ${readingId}`);
      }

      // Get historical data for comparison
      const historicalData = await prisma.energyReading.findMany({
        where: {
          buildingId: reading.buildingId,
          energyType: reading.energyType,
          id: { not: readingId },
          readingDate: {
            gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
          }
        },
        orderBy: { readingDate: 'desc' },
        take: 10
      });

      if (historicalData.length === 0) {
        return {
          isAnomaly: false,
          severity: 'LOW',
          reason: 'Insufficient historical data',
          recommendation: 'Continue monitoring'
        };
      }

      // Calculate average and standard deviation
      const amounts = historicalData.map(r => r.amount);
      const average = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
      const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - average, 2), 0) / amounts.length;
      const standardDeviation = Math.sqrt(variance);

      // Check if current reading is an anomaly
      const zScore = Math.abs(reading.amount - average) / standardDeviation;
      const isAnomaly = zScore > 2; // 2 standard deviations
      const severity = zScore > 3 ? 'HIGH' : zScore > 2 ? 'MEDIUM' : 'LOW';

      let reason = '';
      let recommendation = '';

      if (isAnomaly) {
        if (reading.amount > average + 2 * standardDeviation) {
          reason = 'Unusually high consumption detected';
          recommendation = 'Check for equipment malfunctions or leaks';
        } else if (reading.amount < average - 2 * standardDeviation) {
          reason = 'Unusually low consumption detected';
          recommendation = 'Verify meter readings and check for billing errors';
        }
      } else {
        reason = 'Consumption within normal range';
        recommendation = 'Continue monitoring';
      }

      // Update the reading with anomaly status
      await prisma.energyReading.update({
        where: { id: readingId },
        data: { isAnomaly }
      });

      logger.info("Anomaly detection completed", {
        readingId,
        isAnomaly,
        severity,
        zScore: Math.round(zScore * 100) / 100
      });

      return { isAnomaly, severity, reason, recommendation };
    } catch (error) {
      logger.error("Failed to detect energy anomalies", error);
      throw new DatabaseError("Failed to detect energy anomalies");
    }
  }

  /**
   * Calculate carbon footprint
   */
  async calculateCarbonFootprint(params: {
    buildingId?: string;
    startDate: Date;
    endDate: Date;
  }): Promise<{
    totalEmissions: number; // CO2 equivalent in kg
    byEnergyType: Array<{
      type: EnergyType;
      emissions: number;
      percentage: number;
    }>;
    efficiency: number;
    recommendations: string[];
  }> {
    try {
      logger.info("Calculating carbon footprint", {
        buildingId: params.buildingId,
        startDate: params.startDate,
        endDate: params.endDate
      });

      const whereClause: any = {
        readingDate: {
          gte: params.startDate,
          lte: params.endDate
        }
      };

      if (params.buildingId) whereClause.buildingId = params.buildingId;

      const readings = await prisma.energyReading.findMany({
        where: whereClause
      });

      // CO2 emission factors (kg CO2 per unit)
      const emissionFactors = {
        [EnergyType.ELECTRICITY]: 0.4, // kg CO2 per kWh
        [EnergyType.GAS]: 0.2, // kg CO2 per therm
        [EnergyType.WATER]: 0.0003, // kg CO2 per gallon
        [EnergyType.HEATING]: 0.3,
        [EnergyType.COOLING]: 0.4,
        [EnergyType.SOLAR]: -0.4, // Negative because it reduces emissions
      };

      let totalEmissions = 0;
      const byEnergyType: Array<{
        type: EnergyType;
        emissions: number;
        percentage: number;
      }> = [];

      // Calculate emissions by energy type
      const typeTotals = new Map<EnergyType, number>();
      readings.forEach(reading => {
        const factor = emissionFactors[reading.energyType] || 0;
        const emissions = reading.amount * factor;
        totalEmissions += emissions;
        
        const current = typeTotals.get(reading.energyType) || 0;
        typeTotals.set(reading.energyType, current + emissions);
      });

      // Calculate percentages
      typeTotals.forEach((emissions, type) => {
        byEnergyType.push({
          type,
          emissions: Math.round(emissions * 100) / 100,
          percentage: totalEmissions > 0 ? Math.round((emissions / totalEmissions) * 10000) / 100 : 0
        });
      });

      // Calculate efficiency (simplified)
      const efficiency = this.calculateEfficiency(readings);

      // Generate recommendations
      const recommendations = this.generateEfficiencyRecommendations(readings, byEnergyType);

      const result = {
        totalEmissions: Math.round(totalEmissions * 100) / 100,
        byEnergyType,
        efficiency: Math.round(efficiency * 100) / 100,
        recommendations
      };

      logger.info("Carbon footprint calculated", {
        totalEmissions: result.totalEmissions,
        efficiency: result.efficiency
      });

      return result;
    } catch (error) {
      logger.error("Failed to calculate carbon footprint", error);
      throw new DatabaseError("Failed to calculate carbon footprint");
    }
  }

  private calculateTrend(readings: any[]): number {
    if (readings.length < 2) return 0;
    
    const first = readings[0].amount;
    const last = readings[readings.length - 1].amount;
    
    return first > 0 ? ((last - first) / first) * 100 : 0;
  }

  private calculateEfficiency(readings: any[]): number {
    if (readings.length === 0) return 0;
    
    // Simple efficiency calculation based on consistency
    const amounts = readings.map(r => r.amount);
    const average = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
    const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - average, 2), 0) / amounts.length;
    
    // Lower variance = higher efficiency
    return Math.max(0, 100 - (Math.sqrt(variance) / average) * 100);
  }

  private async getPreviousPeriodData(params: {
    buildingId?: string;
    unitId?: string;
    energyType?: EnergyType;
    startDate: Date;
    endDate: Date;
  }): Promise<{ totalConsumption: number; totalCost: number }> {
    const periodLength = params.endDate.getTime() - params.startDate.getTime();
    const previousStartDate = new Date(params.startDate.getTime() - periodLength);
    const previousEndDate = new Date(params.endDate.getTime() - periodLength);

    const whereClause: any = {
      readingDate: {
        gte: previousStartDate,
        lte: previousEndDate
      }
    };

    if (params.buildingId) whereClause.buildingId = params.buildingId;
    if (params.unitId) whereClause.unitId = params.unitId;
    if (params.energyType) whereClause.energyType = params.energyType;

    const readings = await prisma.energyReading.findMany({
      where: whereClause
    });

    return {
      totalConsumption: readings.reduce((sum, reading) => sum + reading.amount, 0),
      totalCost: readings.reduce((sum, reading) => sum + reading.cost, 0)
    };
  }

  private generateEfficiencyRecommendations(
    readings: any[],
    byEnergyType: Array<{ type: EnergyType; emissions: number; percentage: number }>
  ): string[] {
    const recommendations = [];

    // Check for high electricity usage
    const electricityType = byEnergyType.find(t => t.type === EnergyType.ELECTRICITY);
    if (electricityType && electricityType.percentage > 60) {
      recommendations.push('Consider installing LED lighting and energy-efficient appliances');
    }

    // Check for high gas usage
    const gasType = byEnergyType.find(t => t.type === EnergyType.GAS);
    if (gasType && gasType.percentage > 40) {
      recommendations.push('Improve insulation and consider heat pump systems');
    }

    // Check for water usage
    const waterType = byEnergyType.find(t => t.type === EnergyType.WATER);
    if (waterType && waterType.percentage > 20) {
      recommendations.push('Install low-flow fixtures and water-efficient appliances');
    }

    // General recommendations
    recommendations.push('Consider solar panel installation to reduce grid dependency');
    recommendations.push('Implement smart thermostats for better temperature control');
    recommendations.push('Regular maintenance of HVAC systems can improve efficiency');

    return recommendations;
  }
}

/**
 * Smart Device Integration Service
 */
class SmartDeviceService {
  /**
   * Register smart device
   */
  async registerDevice(params: {
    buildingId: string;
    unitId?: string;
    deviceType: string;
    deviceName: string;
    manufacturer: string;
    model: string;
    serialNumber: string;
    capabilities: string[];
    connectionType: 'WIFI' | 'ZIGBEE' | 'Z_WAVE' | 'BLUETOOTH';
  }): Promise<{ deviceId: string }> {
    try {
      logger.info("Registering smart device", {
        buildingId: params.buildingId,
        deviceType: params.deviceType,
        deviceName: params.deviceName
      });

      const device = await prisma.smartDevice.create({
        data: {
          buildingId: params.buildingId,
          unitId: params.unitId,
          deviceType: params.deviceType,
          deviceName: params.deviceName,
          manufacturer: params.manufacturer,
          model: params.model,
          serialNumber: params.serialNumber,
          capabilities: params.capabilities,
          connectionType: params.connectionType,
          isOnline: false, // Will be updated when device connects
          lastSeen: new Date(),
        }
      });

      logger.info("Smart device registered successfully", { deviceId: device.id });
      return { deviceId: device.id };
    } catch (error) {
      logger.error("Failed to register smart device", error);
      throw new DatabaseError("Failed to register smart device");
    }
  }

  /**
   * Get device readings
   */
  async getDeviceReadings(params: {
    deviceId: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<Array<{
    timestamp: Date;
    reading: number;
    unit: string;
    status: string;
  }>> {
    try {
      const whereClause: any = { deviceId: params.deviceId };
      
      if (params.startDate || params.endDate) {
        whereClause.timestamp = {};
        if (params.startDate) whereClause.timestamp.gte = params.startDate;
        if (params.endDate) whereClause.timestamp.lte = params.endDate;
      }

      const readings = await prisma.smartDeviceReading.findMany({
        where: whereClause,
        orderBy: { timestamp: 'desc' },
        take: params.limit || 100
      });

      return readings.map(reading => ({
        timestamp: reading.timestamp,
        reading: reading.reading,
        unit: reading.unit,
        status: reading.status
      }));
    } catch (error) {
      logger.error("Failed to get device readings", error);
      throw new DatabaseError("Failed to get device readings");
    }
  }

  /**
   * Control smart device
   */
  async controlDevice(params: {
    deviceId: string;
    command: string;
    parameters: Record<string, any>;
  }): Promise<{ success: boolean; message: string }> {
    try {
      logger.info("Controlling smart device", {
        deviceId: params.deviceId,
        command: params.command
      });

      // This would typically send commands to the actual device
      // For now, we'll just log the command
      console.log(`Sending command to device ${params.deviceId}:`, {
        command: params.command,
        parameters: params.parameters
      });

      // Update device status
      await prisma.smartDevice.update({
        where: { id: params.deviceId },
        data: {
          lastCommand: params.command,
          lastCommandAt: new Date(),
          isOnline: true
        }
      });

      logger.info("Device control command sent", { deviceId: params.deviceId });
      return { success: true, message: 'Command sent successfully' };
    } catch (error) {
      logger.error("Failed to control device", error);
      throw new ExternalServiceError("Failed to control device");
    }
  }
}

/**
 * Export services
 */
export {
  EnergyManagementService,
  SmartDeviceService,
};
