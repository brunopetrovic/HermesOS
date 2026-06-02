import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  try {
    const [runsCount, runAggregates, activeGoalsCount, syncLogsCount] = await Promise.all([
      prisma.agentRun.count(),
      prisma.agentRun.aggregate({
        _sum: {
          tokenCount: true,
          cost: true,
        },
      }),
      prisma.goal.count({
        where: { status: 'active' },
      }),
      prisma.syncLog.count(),
    ]);

    const totalTokens = runAggregates._sum.tokenCount || 0;
    const totalCost = runAggregates._sum.cost || 0;

    return NextResponse.json({
      totalRuns: runsCount,
      totalTokens,
      totalCost,
      activeGoals: activeGoalsCount,
      totalSyncs: syncLogsCount,
      budgetLimit: 5000000, // Default 5M tokens budget limit
      costLimit: 5.00, // Default $5 limit
    });
  } catch (error) {
    console.error('API Dashboard Stats Error:', error);
    return NextResponse.json({
      totalRuns: 0,
      totalTokens: 0,
      totalCost: 0,
      activeGoals: 0,
      totalSyncs: 0,
      budgetLimit: 5000000,
      costLimit: 5.00,
    });
  }
}
