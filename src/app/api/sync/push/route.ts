import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { syncGoalSchema, syncPushSchema, syncTaskSchema } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  let body: { type?: string; data?: unknown[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = syncPushSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid sync payload', details: parsed.error.flatten() }, { status: 400 });
  }

  const { type, data } = parsed.data;

  try {
    if (type === 'tasks') {
      const tasksResult = syncTaskSchema.array().safeParse(data);
      if (!tasksResult.success) {
        return NextResponse.json({ error: 'Invalid task sync data', details: tasksResult.error.flatten() }, { status: 400 });
      }
      const tasks = tasksResult.data;
      const now = new Date();
      await prisma.$transaction([
        ...tasks.map((task) =>
          prisma.task.upsert({
            where: { id: task.id },
            update: {
              title: task.title,
              description: task.description,
              status: task.status as never,
              priority: task.priority as never,
              column: task.column || task.status,
              dueDate: task.dueDate ? new Date(task.dueDate) : null,
              updatedAt: now,
            },
            create: {
              id: task.id,
              title: task.title,
              description: task.description,
              status: task.status as never,
              priority: task.priority as never,
              column: task.column || task.status,
              dueDate: task.dueDate ? new Date(task.dueDate) : null,
              instance: {
                connect: {
                  userId_key: {
                    userId: auth.user.id,
                    key: task.instance as never,
                  },
                },
              },
            },
          })
        ),
        prisma.syncLog.create({
          data: {
            direction: 'from_local',
            entityType: type,
            entityId: 'batch',
            payload: body as never,
            status: 'success',
          },
        }),
      ]);
      return NextResponse.json({ synced: tasks.length, errors: [] });
    }

    if (type === 'goals') {
      const goalsResult = syncGoalSchema.array().safeParse(data);
      if (!goalsResult.success) {
        return NextResponse.json({ error: 'Invalid goal sync data', details: goalsResult.error.flatten() }, { status: 400 });
      }
      const goals = goalsResult.data;
      const now = new Date();
      await prisma.$transaction([
        ...goals.map((goal) =>
          prisma.goal.upsert({
            where: { id: goal.id },
            update: {
              title: goal.title,
              description: goal.description,
              progress: goal.progress || 0,
              status: (goal.status || 'active') as never,
              deadline: goal.deadline ? new Date(goal.deadline) : null,
              updatedAt: now,
            },
            create: {
              id: goal.id,
              title: goal.title,
              description: goal.description,
              progress: goal.progress || 0,
              status: (goal.status || 'active') as never,
              deadline: goal.deadline ? new Date(goal.deadline) : null,
              instance: {
                connect: {
                  userId_key: {
                    userId: auth.user.id,
                    key: goal.instance as never,
                  },
                },
              },
            },
          })
        ),
        prisma.syncLog.create({
          data: {
            direction: 'from_local',
            entityType: type,
            entityId: 'batch',
            payload: body as never,
            status: 'success',
          },
        }),
      ]);
      return NextResponse.json({ synced: goals.length, errors: [] });
    }

    return NextResponse.json({ error: `Unsupported sync type: ${type}` }, { status: 400 });
  } catch (error: unknown) {
    console.error('Sync Push Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    try {
      await prisma.syncLog.create({
        data: {
          direction: 'from_local',
          entityType: type,
          entityId: 'batch',
          payload: body as never,
          status: 'failed',
          error: message,
        },
      });
    } catch {
      // best-effort log; ignore secondary failure
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
