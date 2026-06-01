import { NextRequest, NextResponse } from 'next/server';
import { getConnection, probeGateway } from '@/lib/connection';

/**
 * Tests a gateway connection.
 * - With a JSON body ({ gatewayUrl, apiKey }) it probes the supplied values
 *   (used by the onboarding wizard before saving).
 * - With no body it probes the currently saved connection.
 */
export async function POST(req: NextRequest) {
  let gatewayUrl: string | undefined;
  let apiKey: string | undefined;

  try {
    const body = await req.json();
    gatewayUrl = body?.gatewayUrl;
    apiKey = body?.apiKey;
  } catch {
    // No body — fall back to the saved connection.
  }

  if (!gatewayUrl) {
    const conn = await getConnection();
    if (!conn?.gatewayUrl) {
      return NextResponse.json(
        { ok: false, status: null, detail: 'No connection configured' },
        { status: 400 }
      );
    }
    gatewayUrl = conn.gatewayUrl;
    apiKey = conn.apiKey;
  }

  const result = await probeGateway(gatewayUrl, apiKey);
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
