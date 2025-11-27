import { NextRequest } from "next/server";
import { requireAuth, requireRole } from "@/lib/middleware/auth";
import { validateBody } from "@/lib/middleware/validation";
import { reportGenerationSchema } from "@/lib/validation/schemas";
import { ok, created, badRequest, serverError } from "@/lib/api-response";
import { logger } from "@/lib/logger";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { storage, generateFilename } from "@/lib/storage";
import PDFDocument from 'pdfkit';
import { createWriteStream } from 'fs';
import { join } from 'path';
import ExcelJS from 'exceljs';

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

    // Query database for actual financial data
    const whereClause: any = {
      date: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (body.buildingIds && body.buildingIds.length > 0) {
      whereClause.buildingId = { in: body.buildingIds };
    }

    if (body.unitIds && body.unitIds.length > 0) {
      whereClause.unitId = { in: body.unitIds };
    }

    // Get payments (income)
    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        lease: {
          include: {
            unit: {
              include: {
                building: true,
              },
            },
          },
        },
      },
    });

    // Get expenses
    const expenses = await prisma.expense.findMany({
      where: whereClause,
      include: {
        building: true,
        unit: true,
      },
    });

    // Calculate totals
    const totalIncome = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netIncome = totalIncome - totalExpenses;

    // Group income by category
    const incomeByCategory = payments.reduce((acc, p) => {
      const category = p.type || 'other';
      acc[category] = (acc[category] || 0) + p.amount;
      return acc;
    }, {} as Record<string, number>);

    // Group expenses by category
    const expensesByCategory = expenses.reduce((acc, e) => {
      const category = e.category || 'other';
      acc[category] = (acc[category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

    // Calculate occupancy rate
    const totalUnits = await prisma.unit.count({
      where: body.buildingIds ? { buildingId: { in: body.buildingIds } } : {},
    });
    const occupiedUnits = await prisma.lease.count({
      where: {
        startDate: { lte: endDate },
        endDate: { gte: startDate },
        ...(body.buildingIds && { unit: { buildingId: { in: body.buildingIds } } }),
        ...(body.unitIds && { unitId: { in: body.unitIds } }),
      },
    });
    const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

    // Group by building
    const buildingsData = await prisma.building.findMany({
      where: body.buildingIds ? { id: { in: body.buildingIds } } : {},
      include: {
        units: {
          include: {
            leases: {
              where: {
                startDate: { lte: endDate },
                endDate: { gte: startDate },
              },
            },
          },
        },
      },
    });

    const buildings = buildingsData.map(building => {
      const buildingPayments = payments.filter(p => p.lease?.unit?.buildingId === building.id);
      const buildingExpenses = expenses.filter(e => e.buildingId === building.id);
      const income = buildingPayments.reduce((sum, p) => sum + p.amount, 0);
      const expense = buildingExpenses.reduce((sum, e) => sum + e.amount, 0);
      const units = building.units.length;
      const occupied = building.units.filter(u => u.leases.length > 0).length;
      const occupancy = units > 0 ? (occupied / units) * 100 : 0;

      return {
        buildingId: building.id,
        buildingName: building.name,
        units,
        occupancyRate: occupancy,
        income,
        expenses: expense,
        netIncome: income - expense,
      };
    });

    // Calculate month-over-month and year-over-year comparisons
    const previousMonthStart = new Date(startDate);
    previousMonthStart.setMonth(previousMonthStart.getMonth() - 1);
    const previousMonthEnd = new Date(endDate);
    previousMonthEnd.setMonth(previousMonthEnd.getMonth() - 1);

    const previousMonthIncome = await prisma.payment.aggregate({
      where: {
        date: { gte: previousMonthStart, lte: previousMonthEnd },
        ...whereClause,
      },
      _sum: { amount: true },
    });

    const previousYearStart = new Date(startDate);
    previousYearStart.setFullYear(previousYearStart.getFullYear() - 1);
    const previousYearEnd = new Date(endDate);
    previousYearEnd.setFullYear(previousYearEnd.getFullYear() - 1);

    const previousYearIncome = await prisma.payment.aggregate({
      where: {
        date: { gte: previousYearStart, lte: previousYearEnd },
        ...whereClause,
      },
      _sum: { amount: true },
    });

    const reportData = {
      reportType: "PROFIT_LOSS",
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      summary: {
        totalIncome,
        totalExpenses,
        netIncome,
        occupancyRate,
        monthOverMonthChange: previousMonthIncome._sum.amount ? ((totalIncome - previousMonthIncome._sum.amount) / previousMonthIncome._sum.amount) * 100 : 0,
        yearOverYearChange: previousYearIncome._sum.amount ? ((totalIncome - previousYearIncome._sum.amount) / previousYearIncome._sum.amount) * 100 : 0,
      },
      income: incomeByCategory,
      expenses: expensesByCategory,
      buildings,
      generatedAt: new Date().toISOString(),
      generatedBy: user.id,
    };

    let downloadUrl: string | undefined;

    // Generate PDF or Excel if requested
    if (body.format === "PDF") {
      downloadUrl = await generatePDF(reportData);
    } else if (body.format === "EXCEL") {
      downloadUrl = await generateExcel(reportData);
    }

    if (downloadUrl) {
      reportData.downloadUrl = downloadUrl;
    }

    logger.info("P&L report generated", {
      userId: user.id,
      reportType: body.reportType,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      buildingCount: body.buildingIds?.length || 0,
    });

    return created(reportData, "P&L report generated successfully");
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

    // Query database for balance sheet data
    const whereClause: any = {
      createdAt: { lte: asOfDate },
    };

    if (body.buildingIds && body.buildingIds.length > 0) {
      whereClause.buildingId = { in: body.buildingIds };
    }

    if (body.unitIds && body.unitIds.length > 0) {
      whereClause.unitId = { in: body.unitIds };
    }

    // Calculate assets
    const cashBalance = await prisma.payment.aggregate({
      where: {
        date: { lte: asOfDate },
        status: "COMPLETED",
        ...whereClause,
      },
      _sum: { amount: true },
    });

    const accountsReceivable = await prisma.payment.aggregate({
      where: {
        date: { lte: asOfDate },
        status: "PENDING",
        ...whereClause,
      },
      _sum: { amount: true },
    });

    const buildings = await prisma.building.findMany({
      where: body.buildingIds ? { id: { in: body.buildingIds } } : {},
    });

    const propertyValue = buildings.reduce((sum, b) => sum + (b.purchasePrice || 0), 0);

    const currentAssets = (cashBalance._sum.amount || 0) + (accountsReceivable._sum.amount || 0);
    const fixedAssets = propertyValue;
    const totalAssets = currentAssets + fixedAssets;

    // Calculate liabilities
    const accountsPayable = await prisma.expense.aggregate({
      where: {
        date: { lte: asOfDate },
        status: "PENDING",
        ...whereClause,
      },
      _sum: { amount: true },
    });

    const securityDeposits = await prisma.lease.aggregate({
      where: {
        startDate: { lte: asOfDate },
        ...whereClause,
      },
      _sum: { securityDeposit: true },
    });

    const currentLiabilities = (accountsPayable._sum.amount || 0) + (securityDeposits._sum.securityDeposit || 0);
    const longTermLiabilities = buildings.reduce((sum, b) => sum + (b.mortgageAmount || 0), 0);
    const totalLiabilities = currentLiabilities + longTermLiabilities;

    // Calculate equity
    const ownerEquity = totalAssets - totalLiabilities;
    const retainedEarnings = netIncome; // Assuming netIncome is calculated similarly

    const reportData = {
      reportType: "BALANCE_SHEET",
      asOfDate: asOfDate.toISOString(),
      assets: {
        currentAssets: {
          cashAndEquivalents: cashBalance._sum.amount || 0,
          accountsReceivable: accountsReceivable._sum.amount || 0,
          prepaidExpenses: 0, // Placeholder
          totalCurrentAssets: currentAssets,
        },
        fixedAssets: {
          land: 0, // Placeholder
          buildings: propertyValue,
          equipment: 0, // Placeholder
          accumulatedDepreciation: 0, // Placeholder
          totalFixedAssets: fixedAssets,
        },
        totalAssets,
      },
      liabilities: {
        currentLiabilities: {
          accountsPayable: accountsPayable._sum.amount || 0,
          accruedExpenses: 0, // Placeholder
          shortTermLoans: 0, // Placeholder
          totalCurrentLiabilities: currentLiabilities,
        },
        longTermLiabilities: {
          mortgages: longTermLiabilities,
          longTermLoans: 0, // Placeholder
          totalLongTermLiabilities: longTermLiabilities,
        },
        totalLiabilities,
      },
      equity: {
        ownerEquity,
        retainedEarnings,
        totalEquity: ownerEquity + retainedEarnings,
      },
      totalLiabilitiesAndEquity: totalLiabilities + ownerEquity + retainedEarnings,
      generatedAt: new Date().toISOString(),
      generatedBy: user.id,
    };

    let downloadUrl: string | undefined;

    // Generate PDF or Excel if requested
    if (body.format === "PDF") {
      downloadUrl = await generateBalanceSheetPDF(reportData);
    } else if (body.format === "EXCEL") {
      downloadUrl = await generateBalanceSheetExcel(reportData);
    }

    if (downloadUrl) {
      reportData.downloadUrl = downloadUrl;
    }

    logger.info("Balance sheet generated", {
      userId: user.id,
      reportType: body.reportType,
      asOfDate: asOfDate.toISOString(),
    });

    return created(reportData, "Balance sheet generated successfully");
  } catch (error) {
    logger.error("Failed to generate balance sheet", { error });
    return serverError(error);
  }
}

// Helper function to generate PDF for P&L
async function generatePDF(reportData: any): Promise<string> {
  const doc = new PDFDocument();
  const filename = generateFilename('profit_loss_report.pdf');
  const filePath = join(process.cwd(), 'uploads', filename);
  const stream = createWriteStream(filePath);
  doc.pipe(stream);

  // Company header
  doc.fontSize(20).text('Property Management System', { align: 'center' });
  doc.moveDown();
  doc.fontSize(16).text('Profit & Loss Statement', { align: 'center' });
  doc.moveDown();

  // Date range
  doc.fontSize(12).text(`Period: ${reportData.period.startDate} to ${reportData.period.endDate}`);
  doc.moveDown();

  // Summary
  doc.fontSize(14).text('Summary');
  doc.fontSize(10).text(`Total Income: $${reportData.summary.totalIncome}`);
  doc.text(`Total Expenses: $${reportData.summary.totalExpenses}`);
  doc.text(`Net Income: $${reportData.summary.netIncome}`);
  doc.text(`Occupancy Rate: ${reportData.summary.occupancyRate}%`);
  doc.moveDown();

  // Income breakdown
  doc.fontSize(14).text('Income Breakdown');
  Object.entries(reportData.income).forEach(([category, amount]) => {
    doc.fontSize(10).text(`${category}: $${amount}`);
  });
  doc.moveDown();

  // Expenses breakdown
  doc.fontSize(14).text('Expenses Breakdown');
  Object.entries(reportData.expenses).forEach(([category, amount]) => {
    doc.fontSize(10).text(`${category}: $${amount}`);
  });
  doc.moveDown();

  // Buildings
  doc.fontSize(14).text('By Building');
  reportData.buildings.forEach((building: any) => {
    doc.fontSize(10).text(`${building.buildingName}: Income $${building.income}, Expenses $${building.expenses}, Net $${building.netIncome}`);
  });

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', async () => {
      const fileUrl = await storage.upload(new File([await import('fs').then(fs => fs.readFileSync(filePath))], filename), `reports/${filename}`);
      resolve(fileUrl);
    });
    stream.on('error', reject);
  });
}

// Helper function to generate Excel for P&L
async function generateExcel(reportData: any): Promise<string> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Profit & Loss');

  worksheet.columns = [
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Amount', key: 'amount', width: 15 },
  ];

  // Summary
  worksheet.addRow(['Summary']);
  worksheet.addRow(['Total Income', reportData.summary.totalIncome]);
  worksheet.addRow(['Total Expenses', reportData.summary.totalExpenses]);
  worksheet.addRow(['Net Income', reportData.summary.netIncome]);

  // Income
  worksheet.addRow([]);
  worksheet.addRow(['Income Breakdown']);
  Object.entries(reportData.income).forEach(([category, amount]) => {
    worksheet.addRow([category, amount]);
  });

  // Expenses
  worksheet.addRow([]);
  worksheet.addRow(['Expenses Breakdown']);
  Object.entries(reportData.expenses).forEach(([category, amount]) => {
    worksheet.addRow([category, amount]);
  });

  const filename = generateFilename('profit_loss_report.xlsx');
  const filePath = join(process.cwd(), 'uploads', filename);
  await workbook.xlsx.writeFile(filePath);

  const fileUrl = await storage.upload(new File([await import('fs').then(fs => fs.readFileSync(filePath))], filename), `reports/${filename}`);
  return fileUrl;
}

// Helper function to generate PDF for Balance Sheet
async function generateBalanceSheetPDF(reportData: any): Promise<string> {
  const doc = new PDFDocument();
  const filename = generateFilename('balance_sheet_report.pdf');
  const filePath = join(process.cwd(), 'uploads', filename);
  const stream = createWriteStream(filePath);
  doc.pipe(stream);

  // Company header
  doc.fontSize(20).text('Property Management System', { align: 'center' });
  doc.moveDown();
  doc.fontSize(16).text('Balance Sheet', { align: 'center' });
  doc.moveDown();

  // As of date
  doc.fontSize(12).text(`As of: ${reportData.asOfDate}`);
  doc.moveDown();

  // Assets
  doc.fontSize(14).text('Assets');
  doc.fontSize(12).text('Current Assets');
  doc.fontSize(10).text(`Cash and Equivalents: $${reportData.assets.currentAssets.cashAndEquivalents}`);
  doc.text(`Accounts Receivable: $${reportData.assets.currentAssets.accountsReceivable}`);
  doc.text(`Total Current Assets: $${reportData.assets.currentAssets.totalCurrentAssets}`);
  doc.moveDown();
  doc.fontSize(12).text('Fixed Assets');
  doc.fontSize(10).text(`Buildings: $${reportData.assets.fixedAssets.buildings}`);
  doc.text(`Total Fixed Assets: $${reportData.assets.fixedAssets.totalFixedAssets}`);
  doc.text(`Total Assets: $${reportData.assets.totalAssets}`);
  doc.moveDown();

  // Liabilities
  doc.fontSize(14).text('Liabilities');
  doc.fontSize(12).text('Current Liabilities');
  doc.fontSize(10).text(`Accounts Payable: $${reportData.liabilities.currentLiabilities.accountsPayable}`);
  doc.text(`Total Current Liabilities: $${reportData.liabilities.currentLiabilities.totalCurrentLiabilities}`);
  doc.moveDown();
  doc.fontSize(12).text('Long Term Liabilities');
  doc.fontSize(10).text(`Mortgages: $${reportData.liabilities.longTermLiabilities.mortgages}`);
  doc.text(`Total Long Term Liabilities: $${reportData.liabilities.longTermLiabilities.totalLongTermLiabilities}`);
  doc.text(`Total Liabilities: $${reportData.liabilities.totalLiabilities}`);
  doc.moveDown();

  // Equity
  doc.fontSize(14).text('Equity');
  doc.fontSize(10).text(`Owner Equity: $${reportData.equity.ownerEquity}`);
  doc.text(`Retained Earnings: $${reportData.equity.retainedEarnings}`);
  doc.text(`Total Equity: $${reportData.equity.totalEquity}`);
  doc.text(`Total Liabilities and Equity: $${reportData.totalLiabilitiesAndEquity}`);

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', async () => {
      const fileUrl = await storage.upload(new File([await import('fs').then(fs => fs.readFileSync(filePath))], filename), `reports/${filename}`);
      resolve(fileUrl);
    });
    stream.on('error', reject);
  });
}

// Helper function to generate Excel for Balance Sheet
async function generateBalanceSheetExcel(reportData: any): Promise<string> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Balance Sheet');

  worksheet.columns = [
    { header: 'Category', key: 'category', width: 30 },
    { header: 'Amount', key: 'amount', width: 15 },
  ];

  // Assets
  worksheet.addRow(['Assets']);
  worksheet.addRow(['Current Assets']);
  worksheet.addRow(['Cash and Equivalents', reportData.assets.currentAssets.cashAndEquivalents]);
  worksheet.addRow(['Accounts Receivable', reportData.assets.currentAssets.accountsReceivable]);
  worksheet.addRow(['Total Current Assets', reportData.assets.currentAssets.totalCurrentAssets]);
  worksheet.addRow([]);
  worksheet.addRow(['Fixed Assets']);
  worksheet.addRow(['Buildings', reportData.assets.fixedAssets.buildings]);
  worksheet.addRow(['Total Fixed Assets', reportData.assets.fixedAssets.totalFixedAssets]);
  worksheet.addRow(['Total Assets', reportData.assets.totalAssets]);

  // Liabilities
  worksheet.addRow([]);
  worksheet.addRow(['Liabilities']);
  worksheet.addRow(['Current Liabilities']);
  worksheet.addRow(['Accounts Payable', reportData.liabilities.currentLiabilities.accountsPayable]);
  worksheet.addRow(['Total Current Liabilities', reportData.liabilities.currentLiabilities.totalCurrentLiabilities]);
  worksheet.addRow([]);
  worksheet.addRow(['Long Term Liabilities']);
  worksheet.addRow(['Mortgages', reportData.liabilities.longTermLiabilities.mortgages]);
  worksheet.addRow(['Total Long Term Liabilities', reportData.liabilities.longTermLiabilities.totalLongTermLiabilities]);
  worksheet.addRow(['Total Liabilities', reportData.liabilities.totalLiabilities]);

  // Equity
  worksheet.addRow([]);
  worksheet.addRow(['Equity']);
  worksheet.addRow(['Owner Equity', reportData.equity.ownerEquity]);
  worksheet.addRow(['Retained Earnings', reportData.equity.retainedEarnings]);
  worksheet.addRow(['Total Equity', reportData.equity.totalEquity]);
  worksheet.addRow(['Total Liabilities and Equity', reportData.totalLiabilitiesAndEquity]);

  const filename = generateFilename('balance_sheet_report.xlsx');
  const filePath = join(process.cwd(), 'uploads', filename);
  await workbook.xlsx.writeFile(filePath);

  const fileUrl = await storage.upload(new File([await import('fs').then(fs => fs.readFileSync(filePath))], filename), `reports/${filename}`);
  return fileUrl;
}