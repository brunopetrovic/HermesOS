import { NextRequest, NextResponse } from 'next/server';
import { getConnection, probeGateway } from '@/lib/connection';
import { getHarnessPreset, isAgentType, type AgentType } from '@/lib/agent-harnesses';
import {
  hasCredentialBearingUrl,
  isPlainRecord,
  isSensitiveUrlQueryKey,
} from '@/lib/public-agent-config';
import { requireUser } from '@/lib/auth';

/**
 * Tests a harness connection.
 * - Gateway/webhook/model harnesses probe selected health endpoints.
 * - Local process harnesses validate config shape only; setup never executes commands.
 */
export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  let gatewayUrl: string | undefined;
  let apiKey: string | undefined;
  let agentType: AgentType | undefined;
  let adapterConfig: Record<string, unknown> | undefined;

  const rawText = await req.text();
  if (rawText.trim().length > 0) {
    let body: unknown;
    try {
      body = JSON.parse(rawText);
    } catch {
      return NextResponse.json({ ok: false, status: null, detail: 'Invalid JSON body' }, { status: 400 });
    }

    if (!isPlainRecord(body)) {
      return NextResponse.json({ ok: false, status: null, detail: 'Request body must be an object' }, { status: 400 });
    }
    if ('gatewayUrl' in body && typeof body.gatewayUrl !== 'string') {
      return NextResponse.json({ ok: false, status: null, detail: 'gatewayUrl must be a string' }, { status: 400 });
    }
    if ('apiKey' in body && body.apiKey !== undefined && typeof body.apiKey !== 'string') {
      return NextResponse.json({ ok: false, status: null, detail: 'apiKey must be a string' }, { status: 400 });
    }
    if ('agentType' in body && !isAgentType(body.agentType)) {
      return NextResponse.json({ ok: false, status: null, detail: 'Unknown agent type' }, { status: 400 });
    }
    if ('adapterConfig' in body && body.adapterConfig !== undefined && !isPlainRecord(body.adapterConfig)) {
      return NextResponse.json({ ok: false, status: null, detail: 'adapterConfig must be a JSON object' }, { status: 400 });
    }
    if (hasCredentialBearingUrl(body.adapterConfig)) {
      return NextResponse.json(
        { ok: false, status: null, detail: 'Move credentials out of URLs before testing adapterConfig' },
        { status: 400 }
      );
    }

    gatewayUrl = typeof body.gatewayUrl === 'string' ? body.gatewayUrl : undefined;
    apiKey = typeof body.apiKey === 'string' ? body.apiKey : undefined;
    agentType = isAgentType(body.agentType) ? body.agentType : undefined;
    adapterConfig = isPlainRecord(body.adapterConfig) ? body.adapterConfig : undefined;
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
    agentType = conn.agentType;
    adapterConfig = conn.adapterConfig;
  }

  const preset = getHarnessPreset(agentType || 'custom');
  const gatewayValidation = validateGatewayForTest(gatewayUrl, preset.connectionMode === 'command');
  if (!gatewayValidation.ok) return gatewayValidation.response;

  if (preset.connectionMode === 'command') {
    if (gatewayUrl !== 'process://local') {
      return NextResponse.json(
        { ok: false, status: null, detail: 'Local process harness must use process://local' },
        { status: 400 }
      );
    }
    const processValidation = validateProcessAdapterConfig(adapterConfig);
    if (!processValidation.ok) return processValidation.response;
    return NextResponse.json({
      ok: true,
      status: null,
      checkedEndpoint: 'local-process-config',
      detail: 'Local process harness config is valid. UNOX did not execute the command; runtime execution remains an explicit operator action.',
    });
  }

  const result = await probeGateway(gatewayUrl, apiKey, 5000, preset.healthEndpoints.length ? preset.healthEndpoints : undefined);
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}

function validateGatewayForTest(
  gatewayUrl: string,
  allowProcessSentinel: boolean
): { ok: true } | { ok: false; response: NextResponse } {
  if (gatewayUrl === 'process://local') {
    if (allowProcessSentinel) return { ok: true };
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, status: null, detail: 'process://local is only valid for local process harnesses' },
        { status: 400 }
      ),
    };
  }

  try {
    const parsed = new URL(gatewayUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return {
        ok: false,
        response: NextResponse.json({ ok: false, status: null, detail: 'Gateway URL must use http or https' }, { status: 400 }),
      };
    }
    if (parsed.username || parsed.password) {
      return {
        ok: false,
        response: NextResponse.json({ ok: false, status: null, detail: 'Put gateway credentials in the API key field, not in the URL' }, { status: 400 }),
      };
    }
    const credentialQueryKey = Array.from(parsed.searchParams.keys()).find(isSensitiveUrlQueryKey);
    if (credentialQueryKey) {
      return {
        ok: false,
        response: NextResponse.json({ ok: false, status: null, detail: `Move ${credentialQueryKey} out of the URL before testing` }, { status: 400 }),
      };
    }
  } catch {
    return { ok: false, response: NextResponse.json({ ok: false, status: null, detail: 'Gateway URL is not a valid URL' }, { status: 400 }) };
  }

  return { ok: true };
}

function validateProcessAdapterConfig(
  adapterConfig: Record<string, unknown> | undefined
): { ok: true } | { ok: false; response: NextResponse } {
  if (!adapterConfig) {
    return {
      ok: false,
      response: NextResponse.json({ ok: false, status: null, detail: 'Local process harness requires adapterConfig.command' }, { status: 400 }),
    };
  }

  const { command, args, cwd, timeoutSec, env } = adapterConfig;
  if (typeof command !== 'string' || command.trim().length === 0) {
    return {
      ok: false,
      response: NextResponse.json({ ok: false, status: null, detail: 'Local process harness requires adapterConfig.command' }, { status: 400 }),
    };
  }
  if (args !== undefined && typeof args !== 'string' && !Array.isArray(args)) {
    return { ok: false, response: NextResponse.json({ ok: false, status: null, detail: 'adapterConfig.args must be a string or array' }, { status: 400 }) };
  }
  if (Array.isArray(args) && !args.every((entry) => typeof entry === 'string')) {
    return { ok: false, response: NextResponse.json({ ok: false, status: null, detail: 'adapterConfig.args array must contain only strings' }, { status: 400 }) };
  }
  if (cwd !== undefined && typeof cwd !== 'string') {
    return { ok: false, response: NextResponse.json({ ok: false, status: null, detail: 'adapterConfig.cwd must be a string' }, { status: 400 }) };
  }
  if (
    timeoutSec !== undefined &&
    !(typeof timeoutSec === 'number' && Number.isFinite(timeoutSec) && timeoutSec > 0)
  ) {
    return { ok: false, response: NextResponse.json({ ok: false, status: null, detail: 'adapterConfig.timeoutSec must be a positive number' }, { status: 400 }) };
  }
  if (env !== undefined) {
    if (!isPlainRecord(env) || !Object.values(env).every((entry) => typeof entry === 'string')) {
      return { ok: false, response: NextResponse.json({ ok: false, status: null, detail: 'adapterConfig.env must be an object of strings' }, { status: 400 }) };
    }
  }
  return { ok: true };
}
