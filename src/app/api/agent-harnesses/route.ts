import { NextResponse } from 'next/server';
import { HARNESS_PRESETS } from '@/lib/agent-harnesses';
import { sanitizeHarnessForClient } from '@/lib/public-agent-config';

/**
 * Paperclip-inspired harness catalog.
 *
 * UNOX keeps runtime-specific details as adapter-shaped data instead of
 * hardcoding every agent into the UI. This endpoint is intentionally read-only:
 * installing/executing external code must be a separate, explicit operator action.
 */
export async function GET() {
  return NextResponse.json({
    harnesses: HARNESS_PRESETS.map(sanitizeHarnessForClient),
    principles: [
      'control-plane, not execution-plane',
      'adapter config defines the runtime boundary',
      'gateway reachability is separate from command execution',
      'local-first defaults with explicit auth for exposed endpoints',
    ],
  });
}
