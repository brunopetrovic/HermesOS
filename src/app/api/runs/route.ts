import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { AgentRuntime } from '@/lib/agent-runtime';
import { requireUser } from '@/lib/auth';
import { runCreateSchema, runStatusSchema } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const agentType = searchParams.get('agentType') || undefined;
    const rawStatus = searchParams.get('status') || undefined;
    const status = rawStatus && runStatusSchema.safeParse(rawStatus).success ? rawStatus : undefined;

    const runs = await prisma.agentRun.findMany({
      where: {
        userId: auth.user.id,
        agentType,
        status,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
      select: {
        id: true,
        agentType: true,
        status: true,
        duration: true,
        tokenCount: true,
        cost: true,
        config: true,
        createdAt: true,
        updatedAt: true,
        events: {
          orderBy: { createdAt: 'asc' },
          take: 5,
        },
      },
    });

    return NextResponse.json(runs);
  } catch (error) {
    console.error('API GET Runs Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to query runs' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const parsed = runCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid run payload', details: parsed.error.flatten() }, { status: 400 });
    }
    const { agentType, config } = parsed.data;

    const run = await AgentRuntime.executeRun(agentType, config, auth.user.id);
    return NextResponse.json(run);
  } catch (error) {
    console.error('API POST Runs Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to trigger run' },
      { status: 500 }
    );
  }
}
