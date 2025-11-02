import { NextRequest } from "next/server";
import { requireAuth, requireRole } from "@/lib/middleware/auth";
import { validateBody } from "@/lib/middleware/validation";
import { reportGenerationSchema } from "@/lib/validation/schemas";
import { ok, created, badRequest, serverError } from "@/lib/api-response";
import { logger } from "@/lib/logger";
import { z } from "zod";

// POST /api/reports/financial/profit-loss - Generate P&L statement
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await requireRole(["ADMIN", "STAFF", "OWNER"])(request);

    // Validate request body
    const body = await validateBody(
      reportGenerationSchema.extend({
        reportType: z.literal("PROFIT_LOSS"),
      }),
      request
    ) as {
      reportType: "PROFIT_LOSS";
      dateRange: {
        startDate?: string;
        endDate?: string;
      };
      buildingIds?: string[];
      unitIds?: string[];
      includeCharts?: boolean;
      format?: "PDF" | "EXCEL" | "CSV";
    };

    // Set default date range if not provided
    const startDate = body.dateRange.startDate
      ? new Date(body.dateRange.startDate)
      : new Date(new Date().getFullYear(), 0, 1); // Start of current year

    const endDate = body.dateRange.endDate
      ? new Date(body.dateRange.endDate)
      : new Date(); // Today

    // TODO: Import and call ProfitLossService.generateProfitLoss from financial service
    // const reportData = await ProfitLossService.generateProfitLoss({
    //   startDate,
    //   endDate,
    //   buildingIds: body.buildingIds,
    //   unitIds: body.unitIds,
    //   userId: user.id,
    // });

    // For now, return mock P&L data
    const mockReportData = {
      reportType: "PROFIT_LOSS",
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      summary: {
        totalIncome: 125000,
        totalExpenses: 85000,
        netIncome: 40000,
        occupancyRate: 94.5,
      },
      income: {
        rentalIncome: 120000,
        lateFees: 3000,
        petFees: 1500,
        parkingFees: 500,
        otherIncome: 0,
      },
      expenses: {
        maintenance: 25000,
        utilities: 15000,
        insurance: 8000,
        propertyTax: 12000,
        managementFees: 6000,
        advertising: 2000,
        legalFees: 1500,
        supplies: 800,
        otherExpenses: 3700,
      },
      buildings: [
        {
          buildingId: "building_1",
          buildingName: "Sunset Apartments",
          units: 20,
          occupancyRate: 95,
          income: 60000,
          expenses: 40000,
          netIncome: 20000,
        },
        {
          buildingId: "building_2",
          buildingName: "Riverside Complex",
          units: 15,
          occupancyRate: 93,
          income: 45000,
          expenses: 32000,
          netIncome: 13000,
        },
      ],
      generatedAt: new Date().toISOString(),
      generatedBy: user.id,
    };

    // TODO: If format is PDF/Excel, generate and upload file
    // if (body.format && body.format !== "CSV") {
    //   const fileUrl = await ReportExportService.exportToPDF(mockReportData, body.format);
    //   mockReportData.downloadUrl = fileUrl;
    // }

    logger.info("P&L report generated", {
      userId: user.id,
      reportType: body.reportType,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      buildingCount: body.buildingIds?.length || 0,
    });

    return created(mockReportData, "P&L report generated successfully");
  } catch (error) {
    logger.error("Failed to generate P&L report", { error });
    return serverError(error);
  }
}

// POST /api/reports/financial/balance-sheet - Generate balance sheet
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await requireRole(["ADMIN", "STAFF", "OWNER"])(request);

    // Validate request body
    const body = await validateBody(
      reportGenerationSchema.extend({
        reportType: z.literal("BALANCE_SHEET"),
        asOfDate: z.string().datetime(),
      }),
      request
    ) as {
      reportType: "BALANCE_SHEET";
      asOfDate: string;
      buildingIds?: string[];
      unitIds?: string[];
      includeCharts?: boolean;
      format?: "PDF" | "EXCEL" | "CSV";
    };

    const asOfDate = new Date(body.asOfDate);

    // TODO: Import and call BalanceSheetService.generateBalanceSheet from financial service
    // const reportData = await BalanceSheetService.generateBalanceSheet({
    //   asOfDate,
    //   buildingIds: body.buildingIds,
    //   unitIds: body.unitIds,
    //   userId: user.id,
    // });

    // For now, return mock balance sheet data
    const mockReportData = {
      reportType: "BALANCE_SHEET",
      asOfDate: asOfDate.toISOString(),
      assets: {
        currentAssets: {
          cashAndEquivalents: 45000,
          accountsReceivable: 8500,
          prepaidExpenses: 3200,
          totalCurrentAssets: 56700,
        },
        fixedAssets: {
          land: 500000,
          buildings: 1200000,
          equipment: 25000,
          accumulatedDepreciation: -150000,
          totalFixedAssets: 1325000,
        },
        totalAssets: 1381700,
      },
      liabilities: {
        currentLiabilities: {
          accountsPayable: 12500,
          accruedExpenses: 6800,
          shortTermLoans: 0,
          totalCurrentLiabilities: 19300,
        },
        longTermLiabilities: {
          mortgages: 850000,
          longTermLoans: 150000,
          totalLongTermLiabilities: 1000000,
        },
        totalLiabilities: 1019300,
      },
      equity: {
        ownerEquity: 250000,
        retainedEarnings: 112400,
        totalEquity: 362400,
      },
      totalLiabilitiesAndEquity: 1381700,
      generatedAt: new Date().toISOString(),
      generatedBy: user.id,
    };

    logger.info("Balance sheet generated", {
      userId: user.id,
      reportType: body.reportType,
      asOfDate: asOfDate.toISOString(),
    });

    return created(mockReportData, "Balance sheet generated successfully");
  } catch (error) {
    logger.error("Failed to generate balance sheet", { error });
    return serverError(error);
  }
}