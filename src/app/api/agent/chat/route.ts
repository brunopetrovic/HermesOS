import { NextRequest, NextResponse } from 'next/server';
import { AgentRuntime } from '@/lib/agent-runtime';
import { requireUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json({ error: 'messages array is required' }, { status: 400 });
    }

    const reply = await AgentRuntime.sendMessage(body.messages, { model: body.model });
    return NextResponse.json(reply);
  } catch (error) {
    console.error('API Agent Chat Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Chat proxy failure' },
      { status: 500 }
    );
  }
}
