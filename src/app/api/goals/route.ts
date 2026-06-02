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
    const goals = await prisma.goal.findMany({
      where: {
        instance: {
          userId: auth.user.id,
          key: instanceKey || undefined,
        },
      },
      include: {
        milestones: {
          select: {
            id: true,
            title: true,
            done: true,
            dueDate: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return NextResponse.json(goals);
  } catch (error) {
    console.error('API GET Goals Error:', error);
    return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  let body: { title?: string; description?: string; deadline?: string; instance?: InstanceKey };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.title || !body.instance) {
    return NextResponse.json({ error: 'title and instance are required' }, { status: 400 });
  }

  try {
    const goal = await prisma.goal.create({
      data: {
        title: body.title,
        description: body.description,
        deadline: body.deadline ? new Date(body.deadline) : null,
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
    return NextResponse.json(goal);
  } catch (error) {
    console.error('API POST Goals Error:', error);
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 });
  }
}
