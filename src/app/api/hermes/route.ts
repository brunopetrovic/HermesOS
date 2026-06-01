import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/connection';

async function resolveGateway() {
  const conn = await getConnection();
  if (!conn?.gatewayUrl) return null;
  return { url: conn.gatewayUrl.replace(/\/+$/, ''), apiKey: conn.apiKey };
}

export async function POST(req: NextRequest) {
  const gateway = await resolveGateway();
  if (!gateway) {
    return NextResponse.json({ error: 'No agent connected' }, { status: 409 });
  }

  const body = await req.json();
  const path = req.nextUrl.searchParams.get('path') || '/v1/chat/completions';

  try {
    const response = await fetch(`${gateway.url}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(gateway.apiKey ? { Authorization: `Bearer ${gateway.apiKey}` } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Agent Proxy Error:', error);
    return NextResponse.json(
      { error: 'Failed to communicate with the agent gateway' },
      { status: 502 }
    );
  }
}

export async function GET(req: NextRequest) {
  const gateway = await resolveGateway();
  if (!gateway) {
    return NextResponse.json({ error: 'No agent connected' }, { status: 409 });
  }

  const path = req.nextUrl.searchParams.get('path') || '/v1/models';

  try {
    const response = await fetch(`${gateway.url}${path}`, {
      method: 'GET',
      headers: {
        ...(gateway.apiKey ? { Authorization: `Bearer ${gateway.apiKey}` } : {}),
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Agent Proxy Error:', error);
    return NextResponse.json(
      { error: 'Failed to communicate with the agent gateway' },
      { status: 502 }
    );
  }
}
