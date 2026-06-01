import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, InstanceKey } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { SessionUser } from '@/types';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const instanceKey = req.nextUrl.searchParams.get('instance') as InstanceKey | null;

  try {
    const goals = await prisma.goal.findMany({
      where: {
        instance: {
          userId: (session.user as SessionUser).id,
          key: instanceKey || undefined,
        },
      },
      include: {
        milestones: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(goals);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  try {
    const goal = await prisma.goal.create({
      data: {
        title: body.title,
        description: body.description,
        deadline: body.deadline ? new Date(body.deadline) : null,
        instance: {
          connect: {
            userId_key: {
              userId: (session.user as SessionUser).id,
              key: body.instance as InstanceKey,
            },
          },
        },
      },
    });
    return NextResponse.json(goal);
  } catch {
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 });
  }
}
