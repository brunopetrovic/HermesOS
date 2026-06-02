import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  try {
    const [tasks, goals, events] = await Promise.all([
      prisma.task.findMany({
        where: {
          instance: { userId: auth.user.id },
        },
        include: {
          instance: { select: { key: true } },
        },
        orderBy: { updatedAt: 'desc' },
        take: 200,
      }),
      prisma.goal.findMany({
        where: {
          instance: { userId: auth.user.id },
        },
        select: {
          id: true,
          title: true,
          description: true,
          progress: true,
          status: true,
          deadline: true,
          updatedAt: true,
          milestones: {
            select: { id: true, title: true, done: true, dueDate: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: 200,
      }),
      prisma.calendarEvent.findMany({
        where: {
          instance: { userId: auth.user.id },
        },
        orderBy: { startDate: 'asc' },
        take: 200,
      }),
    ]);

    return NextResponse.json({
      tasks,
      goals,
      events,
      last_sync: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Sync Pull Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
