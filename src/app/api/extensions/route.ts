import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const extensions = await prisma.extension.findMany({
    orderBy: { name: 'asc' },
    take: 100,
  });

  const defaults = extensions.length
    ? extensions
    : [
        {
          id: 'builtin-dashboard-widgets',
          name: 'Dashboard Widgets',
          version: '0.1.0',
          description: 'Local-first widget manifests for command-center dashboards.',
          manifest: JSON.stringify({ trust: 'local-only', permissions: ['read-dashboard'] }),
          enabled: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'builtin-agent-harnesses',
          name: 'Agent Harness Presets',
          version: '0.1.0',
          description: 'Connector presets for Hermes, OpenClaw, OpenAI-compatible, webhook, and local process harnesses.',
          manifest: JSON.stringify({ trust: 'approval-required', permissions: ['connect-agent', 'read-models'] }),
          enabled: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

  return NextResponse.json({
    catalogMode: extensions.length ? 'database' : 'builtin-preview',
    trustLevels: ['local-only', 'network-access', 'approval-required', 'command-execution'],
    extensions: defaults,
  });
}
