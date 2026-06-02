import { NextRequest, NextResponse } from 'next/server';
import { InstanceKey } from '@prisma/client';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const instanceKey = req.nextUrl.searchParams.get('instance') as InstanceKey | null;

  try {
    const now = new Date();
    const pastLimit = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const futureLimit = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);

    const events = await prisma.calendarEvent.findMany({
      where: {
        instance: {
          userId: auth.user.id,
          key: instanceKey || undefined,
        },
        startDate: { gte: pastLimit, lte: futureLimit },
      },
      orderBy: { startDate: 'asc' },
      take: 200,
    });
    return NextResponse.json(events);
  } catch (error) {
    console.error('API GET Calendar Error:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  let body: {
    title?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    allDay?: boolean;
    instance?: InstanceKey;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.title || !body.startDate || !body.instance) {
    return NextResponse.json({ error: 'title, startDate, and instance are required' }, { status: 400 });
  }

  try {
    const event = await prisma.calendarEvent.create({
      data: {
        title: body.title,
        description: body.description,
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : new Date(body.startDate),
        allDay: body.allDay || false,
        instance: {
          connect: {
            userId_key: {
              userId: auth.user.id,
              key: body.instance,
            },
          },
        },
      },
    });
    return NextResponse.json(event);
  } catch (error) {
    console.error('API POST Calendar Error:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
