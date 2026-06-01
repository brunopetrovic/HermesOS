import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { SessionUser } from '@/types';

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const userId = (session.user as SessionUser).id;

    const tasks = await prisma.task.findMany({
      where: {
        instance: {
          userId,
        },
      },
    });

    const goals = await prisma.goal.findMany({
      where: {
        instance: {
          userId,
        },
      },
    });

    const events = await prisma.calendarEvent.findMany({
      where: {
        instance: {
          userId,
        },
      },
    });

    return NextResponse.json({
      tasks,
      goals,
      events,
      last_sync: new Date(),
    });
  } catch (error: unknown) {
    console.error('Sync Pull Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
