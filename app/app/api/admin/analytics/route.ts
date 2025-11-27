import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    // Check auth
    const user = await requireAuth(req as any);
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Parallel data fetching
    const [
      totalUsers,
      activeSubscriptions,
      revenueResult,
      openTickets,
      recentUsers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED' }
      }),
      prisma.maintenanceRequest.count({
        where: { status: { in: ['OPEN', 'IN_PROGRESS'] } }
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, role: true, createdAt: true }
      })
    ]);

    const monthlyRevenue = revenueResult._sum.amount || 0;

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeSubscriptions,
          monthlyRevenue,
          growth: '+12%' // Mocked for now
        },
        // Mock chart data for now as we don't have historical aggregates easily available
        revenue_chart: [3.5, 3.8, 4.2, 4.5, 4.8, 5.2],
        ticket_volume: [45, 30, 25, 40, 35, openTickets],
        topServices: [
          { name: 'Concierge', count: 120 },
          { name: 'Cleaning', count: 85 },
          { name: 'Maintenance', count: 64 }
        ],
        recentActivity: recentUsers.map(u => ({
          id: u.id,
          action: 'New User Registration',
          targetType: u.role,
          timestamp: u.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
