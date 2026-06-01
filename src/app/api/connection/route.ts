import { NextRequest, NextResponse } from 'next/server';
import {
  getConnection,
  getConnectionDiscovery,
  saveConnection,
  clearConnection,
  type AgentConnection,
  type AgentType,
} from '@/lib/connection';

const AGENT_TYPES: AgentType[] = ['hermes', 'openclaw', 'custom'];

/** Returns the current connection with the API key masked. */
export async function GET() {
  const [conn, discovery] = await Promise.all([getConnection(), getConnectionDiscovery()]);
  if (!conn) {
    return NextResponse.json({ connected: false, connection: null, discovery });
  }
  return NextResponse.json({
    connected: Boolean(conn.gatewayUrl),
    connection: maskConnection(conn),
    discovery,
  });
}

/** Saves (or updates) the connection. */
export async function POST(req: NextRequest) {
  let body: Partial<AgentConnection>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.gatewayUrl || typeof body.gatewayUrl !== 'string') {
    return NextResponse.json({ error: 'A gateway URL is required' }, { status: 400 });
  }

  try {
    const parsedGatewayUrl = new URL(body.gatewayUrl);
    if (!['http:', 'https:'].includes(parsedGatewayUrl.protocol)) {
      return NextResponse.json({ error: 'Gateway URL must use http or https' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: 'Gateway URL is not a valid URL' }, { status: 400 });
  }

  if (body.agentType && !AGENT_TYPES.includes(body.agentType)) {
    return NextResponse.json({ error: 'Unknown agent type' }, { status: 400 });
  }

  const saved = await saveConnection({
    agentType: body.agentType,
    label: body.label,
    gatewayUrl: body.gatewayUrl.replace(/\/+$/, ''),
    apiKey: body.apiKey,
    homePath: body.homePath,
  });

  return NextResponse.json({ connected: true, connection: maskConnection(saved) });
}

/** Disconnects the agent. */
export async function DELETE() {
  await clearConnection();
  return NextResponse.json({ connected: false, connection: null });
}

function maskConnection(conn: AgentConnection) {
  const { apiKey, ...rest } = conn;
  return {
    ...rest,
    hasApiKey: Boolean(apiKey),
    apiKeyPreview: apiKey ? `••••${apiKey.slice(-4)}` : null,
  };
}
