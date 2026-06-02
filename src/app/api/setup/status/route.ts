import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getConnection, probeGateway } from '@/lib/connection';
import { requireUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const [instances, conn] = await Promise.all([
    prisma.instance.findMany({
      where: { userId: auth.user.id },
      select: { key: true },
      orderBy: { key: 'asc' },
    }),
    getConnection(),
  ]);

  const requiredInstances = ['personal', 'brand', 'business', 'nexus'];
  const instanceKeys = new Set(instances.map((item) => item.key));
  const missingInstances = requiredInstances.filter((key) => !instanceKeys.has(key as never));

  let gateway: { ok: boolean; detail: string; status: number | null } = {
    ok: false,
    detail: conn ? 'Gateway not tested yet' : 'No agent connection configured',
    status: null,
  };

  if (conn?.gatewayUrl) {
    const probe = await probeGateway(conn.gatewayUrl, conn.apiKey, 2500);
    gateway = { ok: probe.ok, detail: probe.detail, status: probe.status };
  }

  const steps = [
    {
      id: 'operator',
      label: 'Local operator ready',
      complete: Boolean(auth.user.id),
      detail: auth.user.email || 'Local operator fallback is active',
    },
    {
      id: 'instances',
      label: 'Default realms seeded',
      complete: missingInstances.length === 0,
      detail: missingInstances.length ? `Missing: ${missingInstances.join(', ')}` : 'Personal, Brand, Business, and Nexus are ready',
    },
    {
      id: 'connection',
      label: 'Agent connection saved',
      complete: Boolean(conn?.gatewayUrl),
      detail: conn?.gatewayUrl || 'Run the connection wizard',
    },
    {
      id: 'gateway',
      label: 'Gateway reachable',
      complete: gateway.ok,
      detail: gateway.detail,
    },
  ];

  return NextResponse.json({
    ready: steps.every((step) => step.complete),
    user: auth.user,
    connection: conn
      ? { agentType: conn.agentType, label: conn.label, gatewayUrl: conn.gatewayUrl, connectedAt: conn.connectedAt }
      : null,
    gateway,
    steps,
  });
}
