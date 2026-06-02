import { NextResponse } from 'next/server';
import { AgentRuntime } from '@/lib/agent-runtime';
import { requireUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  try {
    const models = await AgentRuntime.getModels();
    return NextResponse.json(models);
  } catch (error) {
    console.error('API Agent Models Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Models retrieval failure' },
      { status: 500 }
    );
  }
}
