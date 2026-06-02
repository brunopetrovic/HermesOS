import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const params = await props.params;
  try {
    const run = await prisma.agentRun.findFirst({
      where: { id: params.id, userId: auth.user.id },
      include: { events: { orderBy: { createdAt: 'asc' } } },
    });

    if (!run) {
      return NextResponse.json({ error: 'Run not found' }, { status: 404 });
    }

    return NextResponse.json(run);
  } catch (error) {
    console.error('API GET Single Run Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve run details' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const params = await props.params;
  try {
    const result = await prisma.agentRun.updateMany({
      where: { id: params.id, userId: auth.user.id },
      data: { status: 'cancelled' },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: 'Run not found' }, { status: 404 });
    }

    const run = await prisma.agentRun.findFirst({
      where: { id: params.id, userId: auth.user.id },
      include: { events: { orderBy: { createdAt: 'asc' } } },
    });

    await prisma.agentRunEvent.create({
      data: {
        runId: params.id,
        type: 'cancelled',
        label: 'Run cancelled by operator',
        detail: 'The operator requested cancellation from the run detail page.',
        severity: 'warning',
      },
    });

    return NextResponse.json(run);
  } catch (error) {
    console.error('API DELETE Single Run Error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel run' },
      { status: 500 }
    );
  }
}
