import { NextRequest } from 'next/server';
import { getConnection } from '@/lib/connection';
import { requireUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const conn = await getConnection();

  // If no agent, return a text stream of simulated response
  if (!conn || !conn.gatewayUrl) {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const text = "I am running in offline demonstration mode. Please connect a local agent gateway in the settings or onboarding wizard to receive real live stream tokens.";
        const words = text.split(" ");
        for (const word of words) {
          const delta = {
            choices: [{
              delta: { content: word + " " }
            }]
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(delta)}\n\n`));
          await new Promise(r => setTimeout(r, 60));
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      }
    });
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      }
    });
  }

  // Real gateway streaming proxy
  try {
    const body = await req.json();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
    };
    if (conn.apiKey) headers.Authorization = `Bearer ${conn.apiKey}`;

    const res = await fetch(`${conn.gatewayUrl}/v1/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...body,
        stream: true,
      }),
    });

    if (!res.ok || !res.body) {
      throw new Error(`Gateway returned HTTP ${res.status}`);
    }

    return new Response(res.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      }
    });
  } catch (error) {
    console.error('API Agent Stream Error:', error);
    const encoder = new TextEncoder();
    const errorStream = new ReadableStream({
      start(controller) {
        const errObj = { error: 'Failed to stream from agent gateway' };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(errObj)}\n\n`));
        controller.close();
      }
    });
    return new Response(errorStream, {
      headers: { 'Content-Type': 'text/event-stream' },
      status: 502,
    });
  }
}
