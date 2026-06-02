import { NextRequest, NextResponse } from 'next/server';
import {
  getConnection,
  getConnectionDiscovery,
  saveConnection,
  clearConnection,
  type AgentConnection,
} from '@/lib/connection';
import { getHarnessPreset, isAgentType, type AgentType } from '@/lib/agent-harnesses';
import {
  isPlainRecord,
  isSensitiveUrlQueryKey,
  hasCredentialBearingUrl,
  redactSecrets,
  sanitizeDiscoveryForClient,
  sanitizeUrlForClient,
} from '@/lib/public-agent-config';
import { requireUser } from '@/lib/auth';

const MAX_ADAPTER_CONFIG_BYTES = 20_000;

/** Returns the current connection with secrets masked. */
export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const [conn, discovery] = await Promise.all([getConnection(), getConnectionDiscovery()]);
  const safeDiscovery = sanitizeDiscoveryForClient(discovery);
  if (!conn) {
    return NextResponse.json({ connected: false, connection: null, discovery: safeDiscovery });
  }
  return NextResponse.json({
    connected: Boolean(conn.gatewayUrl),
    connection: maskConnection(conn),
    discovery: safeDiscovery,
  });
}

/** Saves (or updates) the connection. */
export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!isPlainRecord(rawBody)) {
    return NextResponse.json({ error: 'Connection body must be an object' }, { status: 400 });
  }

  const body = rawBody as Partial<AgentConnection>;
  const agentTypeResult = parseAgentType(body.agentType);
  if (!agentTypeResult.ok) return agentTypeResult.response;

  const agentType = agentTypeResult.agentType;
  const preset = getHarnessPreset(agentType);
  const stringFields = validateOptionalStringFields(body, ['label', 'gatewayUrl', 'apiKey', 'homePath']);
  if (!stringFields.ok) return stringFields.response;

  const adapterConfigResult = parseAdapterConfig(body.adapterConfig);
  if (!adapterConfigResult.ok) return adapterConfigResult.response;

  const gatewayUrl = body.gatewayUrl || preset.gatewayUrl;
  if (!gatewayUrl || typeof gatewayUrl !== 'string') {
    return NextResponse.json({ error: 'A gateway URL or harness preset is required' }, { status: 400 });
  }

  const gatewayResult = validateGatewayUrl(gatewayUrl, agentType);
  if (!gatewayResult.ok) return gatewayResult.response;

  if (preset.connectionMode === 'command' && gatewayUrl !== 'process://local') {
    return NextResponse.json(
      { error: 'Local process harness must use process://local' },
      { status: 400 }
    );
  }

  if (preset.connectionMode === 'command') {
    const processValidation = validateProcessAdapterConfig(adapterConfigResult.adapterConfig);
    if (!processValidation.ok) return processValidation.response;
  }

  const saved = await saveConnection({
    agentType,
    adapterType: preset.adapterType,
    connectionMode: preset.connectionMode,
    label: body.label,
    gatewayUrl: gatewayUrl.replace(/\/+$/, ''),
    apiKey: body.apiKey,
    homePath: body.homePath,
    adapterConfig: adapterConfigResult.adapterConfig,
  });

  return NextResponse.json({ connected: true, connection: maskConnection(saved) });
}

/** Disconnects the agent. */
export async function DELETE() {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  await clearConnection();
  return NextResponse.json({ connected: false, connection: null });
}

function parseAgentType(value: unknown):
  | { ok: true; agentType: AgentType }
  | { ok: false; response: NextResponse } {
  if (value === undefined) return { ok: true, agentType: 'hermes' };
  if (isAgentType(value)) return { ok: true, agentType: value };
  return { ok: false, response: NextResponse.json({ error: 'Unknown agent type' }, { status: 400 }) };
}

function validateOptionalStringFields(
  body: Partial<AgentConnection>,
  fields: Array<keyof Pick<AgentConnection, 'label' | 'gatewayUrl' | 'apiKey' | 'homePath'>>
): { ok: true } | { ok: false; response: NextResponse } {
  for (const field of fields) {
    const value = body[field];
    if (value !== undefined && typeof value !== 'string') {
      return {
        ok: false,
        response: NextResponse.json({ error: `${String(field)} must be a string` }, { status: 400 }),
      };
    }
  }
  return { ok: true };
}

function parseAdapterConfig(value: unknown):
  | { ok: true; adapterConfig?: Record<string, unknown> }
  | { ok: false; response: NextResponse } {
  if (value === undefined) return { ok: true, adapterConfig: undefined };
  if (!isPlainRecord(value)) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'adapterConfig must be a JSON object' }, { status: 400 }),
    };
  }

  const byteLength = Buffer.byteLength(JSON.stringify(value), 'utf8');
  if (byteLength > MAX_ADAPTER_CONFIG_BYTES) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'adapterConfig is too large' }, { status: 400 }),
    };
  }

  if (hasCredentialBearingUrl(value)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Move credentials out of URLs before saving adapterConfig' },
        { status: 400 }
      ),
    };
  }

  return { ok: true, adapterConfig: value };
}

function validateProcessAdapterConfig(
  adapterConfig: Record<string, unknown> | undefined
): { ok: true } | { ok: false; response: NextResponse } {
  if (!adapterConfig) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Local process harness requires adapterConfig.command' }, { status: 400 }),
    };
  }

  const { command, args, cwd, timeoutSec, env } = adapterConfig;
  if (typeof command !== 'string' || command.trim().length === 0) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Local process harness requires adapterConfig.command' }, { status: 400 }),
    };
  }
  if (args !== undefined && typeof args !== 'string' && !Array.isArray(args)) {
    return { ok: false, response: NextResponse.json({ error: 'adapterConfig.args must be a string or array' }, { status: 400 }) };
  }
  if (Array.isArray(args) && !args.every((entry) => typeof entry === 'string')) {
    return { ok: false, response: NextResponse.json({ error: 'adapterConfig.args array must contain only strings' }, { status: 400 }) };
  }
  if (cwd !== undefined && typeof cwd !== 'string') {
    return { ok: false, response: NextResponse.json({ error: 'adapterConfig.cwd must be a string' }, { status: 400 }) };
  }
  if (
    timeoutSec !== undefined &&
    !(typeof timeoutSec === 'number' && Number.isFinite(timeoutSec) && timeoutSec > 0)
  ) {
    return { ok: false, response: NextResponse.json({ error: 'adapterConfig.timeoutSec must be a positive number' }, { status: 400 }) };
  }
  if (env !== undefined) {
    if (!isPlainRecord(env) || !Object.values(env).every((entry) => typeof entry === 'string')) {
      return { ok: false, response: NextResponse.json({ error: 'adapterConfig.env must be an object of strings' }, { status: 400 }) };
    }
  }
  return { ok: true };
}
function validateGatewayUrl(
  gatewayUrl: string,
  agentType: AgentType
): { ok: true } | { ok: false; response: NextResponse } {
  const preset = getHarnessPreset(agentType);
  if (gatewayUrl === 'process://local') {
    if (preset.connectionMode === 'command') return { ok: true };
    return {
      ok: false,
      response: NextResponse.json({ error: 'process://local is only valid for local process harnesses' }, { status: 400 }),
    };
  }

  try {
    const parsedGatewayUrl = new URL(gatewayUrl);
    if (!['http:', 'https:'].includes(parsedGatewayUrl.protocol)) {
      return {
        ok: false,
        response: NextResponse.json({ error: 'Gateway URL must use http or https' }, { status: 400 }),
      };
    }
    if (parsedGatewayUrl.username || parsedGatewayUrl.password) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: 'Put gateway credentials in the API key field, not in the URL' },
          { status: 400 }
        ),
      };
    }
    const credentialQueryKey = Array.from(parsedGatewayUrl.searchParams.keys()).find(isSensitiveUrlQueryKey);
    if (credentialQueryKey) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: `Move ${credentialQueryKey} out of the URL and into the API key field or adapter config` },
          { status: 400 }
        ),
      };
    }
  } catch {
    return { ok: false, response: NextResponse.json({ error: 'Gateway URL is not a valid URL' }, { status: 400 }) };
  }

  return { ok: true };
}

function maskConnection(conn: AgentConnection) {
  const { apiKey, ...rest } = conn;
  const apiKeyPreview = typeof apiKey === 'string' && apiKey.length > 0 ? `••••${apiKey.slice(-4)}` : null;
  return {
    ...rest,
    gatewayUrl: sanitizeUrlForClient(rest.gatewayUrl),
    adapterConfig: redactSecrets(rest.adapterConfig || {}),
    hasApiKey: Boolean(apiKeyPreview),
    apiKeyPreview,
  };
}
