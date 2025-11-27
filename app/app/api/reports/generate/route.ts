import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { reportType, reportScope } = await req.json();

  const reportContent = generateReportContent(reportType, reportScope);

  return new NextResponse(reportContent, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${reportType}-report-${Date.now()}.pdf"`,
    },
  });
}

function generateReportContent(reportType: string, reportScope: string): string {
  let content = `Property Management Report\n\n`;
  content += `Report Type: ${reportType.toUpperCase()}\n`;
  content += `Scope: ${reportScope.toUpperCase()}\n`;
  content += `Generated: ${new Date().toLocaleDateString()}\n\n`;

  if (reportType === 'financial') {
    content += `Financial Summary\n\n`;
    content += `Total Income: $125,450.00\n`;
    content += `Total Expenses: $87,320.00\n`;
    content += `Net Income: $38,130.00\n\n`;
    content += `Income Breakdown:\n`;
    content += `  - Rent Payments: $98,500.00\n`;
    content += `  - Late Fees: $2,450.00\n`;
    content += `  - Amenity Bookings: $8,900.00\n`;
    content += `  - Other Income: $15,600.00\n\n`;
    content += `Expense Breakdown:\n`;
    content += `  - Maintenance: $32,100.00\n`;
    content += `  - Utilities: $18,450.00\n`;
    content += `  - Insurance: $12,300.00\n`;
    content += `  - Property Tax: $15,870.00\n`;
    content += `  - Other Expenses: $8,600.00\n`;
  } else if (reportType === 'board') {
    content += `Board Meeting Report\n\n`;
    content += `Executive Summary:\n`;
    content += `This comprehensive report provides an overview of property operations.\n\n`;
    content += `Key Highlights:\n`;
    content += `  - Occupancy Rate: 96%\n`;
    content += `  - Collection Rate: 98.5%\n`;
    content += `  - Maintenance Requests: 23 (15 completed, 8 in progress)\n`;
    content += `  - New Leases: 5\n`;
    content += `  - Lease Renewals: 12\n\n`;
    content += `Financial Overview:\n`;
    content += `  - Total Revenue: $125,450.00\n`;
    content += `  - Total Expenses: $87,320.00\n`;
    content += `  - Net Operating Income: $38,130.00\n`;
  } else if (reportType === 'occupancy') {
    content += `Occupancy Report\n\n`;
    content += `Current Occupancy: 96%\n`;
    content += `Total Units: 150\n`;
    content += `Occupied Units: 144\n`;
    content += `Vacant Units: 6\n\n`;
    content += `Lease Expirations (Next 90 Days): 18\n`;
    content += `Move-ins Scheduled: 4\n`;
    content += `Move-outs Scheduled: 2\n`;
  } else if (reportType === 'maintenance') {
    content += `Maintenance Report\n\n`;
    content += `Total Requests: 23\n`;
    content += `Completed: 15\n`;
    content += `In Progress: 8\n`;
    content += `Average Response Time: 2.3 hours\n`;
    content += `Average Completion Time: 18.5 hours\n`;
  } else if (reportType === 'compliance') {
    content += `Compliance Report\n\n`;
    content += `Compliance Status: COMPLIANT\n\n`;
    content += `Recent Inspections:\n`;
    content += `  - Fire Safety: Passed (Jan 15, 2024)\n`;
    content += `  - Elevator: Passed (Feb 3, 2024)\n`;
    content += `  - Building Code: Passed (Dec 10, 2023)\n`;
  }

  content += `\n\nReport ID: RPT-${Date.now()}`;

  return content;
}