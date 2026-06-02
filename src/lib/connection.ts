/**
 * Agent connection configuration (server-side only).
 *
 * This is the single source of truth for how the command center reaches a
 * user's local agent (Hermes, OpenClaw, or any OpenAI-compatible gateway).
 *
 * Resolution order for each field:
 *   1. Values saved through the onboarding flow (a JSON file on disk)
 *   2. Environment variables (great for Docker / headless installs)
 *   3. Sensible defaults shown by discovery/onboarding
 *
 * The config file lives in `UNOX_CONFIG_DIR` (defaults to `~/.unox`) so it
 * persists across restarts without requiring a database. When the app is later
 * upgraded to multi-user mode, this module is the only place that needs to swap
 * file storage for per-user database rows.
 */
import 'server-only';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import {
  HARNESS_PRESETS,
  defaultLabel,
  getHarnessPreset,
  isAgentType,
  type AgentType,
  type HarnessCapability,
  type HarnessConnectionMode,
  type HarnessConfigField,
} from '@/lib/agent-harnesses';
import { decryptSecret, encryptSecret } from '@/lib/secret-crypto';

export type { AgentType } from '@/lib/agent-harnesses';

export interface AgentConnection {
  /** Which kind of agent is connected. */
  agentType: AgentType;
  /** Paperclip-style adapter type, e.g. hermes_local or openclaw_gateway. */
  adapterType: string;
  /** How this harness is reached or invoked. */
  connectionMode: HarnessConnectionMode;
  /** Display name for the connected agent (shown in the UI). */
  label: string;
  /** Base URL of the agent gateway, e.g. http://localhost:8642; process adapters use process://local. */
  gatewayUrl: string;
  /** Optional bearer token for the gateway. */
  apiKey?: string;
  /** Optional adapter-specific config copied from the onboarding form. */
  adapterConfig?: Record<string, unknown>;
  /** Capabilities declared by the selected harness preset. */
  capabilities?: HarnessCapability[];
  /**
   * Optional local filesystem path to the agent's home directory
   * (e.g. ~/.hermes). Used to read goals, memory, skills, and crons when the
   * command center runs on the same machine as the agent.
   */
  homePath?: string;
  /** ISO timestamp of when the connection was saved. */
  connectedAt?: string;
}

export interface ConnectionDiscovery {
  configPath: string;
  defaultGatewayUrl: string;
  presets: {
    agentType: AgentType;
    adapterType: string;
    label: string;
    shortLabel: string;
    gatewayUrl: string;
    description: string;
    icon: string;
    connectionMode: HarnessConnectionMode;
    paperclipPattern: string;
    capabilities: HarnessCapability[];
    healthEndpoints: string[];
    configFields: HarnessConfigField[];
    safetyNotes: string[];
  }[];
  detectedHomes: {
    agentType: AgentType;
    path: string;
    exists: boolean;
    source: string;
  }[];
}

export interface GatewayProbeResult {
  ok: boolean;
  status: number | null;
  detail: string;
  checkedEndpoint?: string;
}

const CONFIG_DIR =
  process.env.UNOX_CONFIG_DIR || path.join(/* turbopackIgnore: true */ os.homedir() || '/tmp', '.unox');
const CONFIG_PATH = path.join(/* turbopackIgnore: true */ CONFIG_DIR, 'connection.json');

const DEFAULT_GATEWAY_URL = 'http://localhost:8642';

const PRESETS: ConnectionDiscovery['presets'] = HARNESS_PRESETS.map((preset) => ({
  ...preset,
  gatewayUrl: normalizeGatewayUrl(preset.gatewayUrl),
}));

function homeDir(): string {
  return /* turbopackIgnore: true */ os.homedir() || process.env.HOME || '/tmp';
}

function envHomePath(): string | undefined {
  if (process.env.HERMES_HOME) return process.env.HERMES_HOME;
  if (process.env.OPENCLAW_WORKSPACE) return process.env.OPENCLAW_WORKSPACE;
  if (process.env.AGENT_HOME) return process.env.AGENT_HOME;
  return undefined;
}

function envConnection(): Partial<AgentConnection> {
  const gatewayUrl =
    process.env.HERMES_GATEWAY_URL ||
    process.env.OPENCLAW_GATEWAY_URL ||
    process.env.CLAWDBOT_URL ||
    process.env.AGENT_GATEWAY_URL ||
    undefined;
  const apiKey =
    process.env.HERMES_API_KEY ||
    process.env.OPENCLAW_API_KEY ||
    process.env.CLAWDBOT_TOKEN ||
    process.env.AGENT_API_KEY ||
    undefined;
  const homePath = envHomePath();
  const agentType = parseAgentType(process.env.AGENT_TYPE);

  const env: Partial<AgentConnection> = {};
  if (gatewayUrl) env.gatewayUrl = normalizeGatewayUrl(gatewayUrl);
  if (apiKey) env.apiKey = apiKey;
  if (homePath) env.homePath = expandHome(homePath);
  if (agentType) env.agentType = agentType;
  return env;
}

function parseAgentType(value?: string): AgentType | undefined {
  return isAgentType(value) ? value : undefined;
}

function expandHome(value: string): string {
  if (value === '~') return homeDir();
  if (value.startsWith('~/')) return path.join(/* turbopackIgnore: true */ homeDir(), value.slice(2));
  return value;
}

function normalizeGatewayUrl(value: string): string {
  return value.trim().replace(/\/+$/, '');
}

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(expandHome(filePath));
    return true;
  } catch {
    return false;
  }
}

async function readFileConfig(): Promise<Partial<AgentConnection> | null> {
  try {
    const cached = await getCachedFileConfig();
    if (cached) {
      return cached;
    }
    const raw = await fs.readFile(/* turbopackIgnore: true */ CONFIG_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<AgentConnection> & { apiKey?: string };
    if (parsed.apiKey) parsed.apiKey = decryptSecret(parsed.apiKey);
    setCachedFileConfig(parsed);
    return parsed;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// In-memory cache for ~/.unox/connection.json
// ---------------------------------------------------------------------------
// The connection file is read on every API request and is the main latency
// contributor for /api/connection*, /api/agent/stream, and the dashboard.
// We cache the parsed + decrypted value keyed on the file's mtime, so writes
// through {@link saveConnection} or {@link clearConnection} are picked up
// on the next read automatically. The cache is per-process; in serverless
// environments that means a cold start still hits disk once.

let cachedConfig: { mtimeMs: number; data: Partial<AgentConnection> } | null = null;

async function getCachedFileConfig(): Promise<Partial<AgentConnection> | null> {
  if (!cachedConfig) return null;
  try {
    const stat = await fs.stat(/* turbopackIgnore: true */ CONFIG_PATH);
    if (stat.mtimeMs === cachedConfig.mtimeMs) {
      return cachedConfig.data;
    }
    cachedConfig = null;
    return null;
  } catch {
    cachedConfig = null;
    return null;
  }
}

function setCachedFileConfig(data: Partial<AgentConnection>): void {
  // The mtime will be re-checked on the next call; we optimistically assume
  // the read just succeeded so a stat immediately after read should be cheap.
  cachedConfig = { mtimeMs: Date.now(), data };
}

/**
 * Returns the resolved connection, merging saved file config over env vars.
 * Returns `null` only when nothing at all has been configured.
 */
export async function getConnection(): Promise<AgentConnection | null> {
  const fileConfig = await readFileConfig();
  const env = envConnection();

  const merged: Partial<AgentConnection> = { ...env, ...(fileConfig || {}) };

  // Nothing configured anywhere.
  if (!fileConfig && Object.keys(env).length === 0) {
    return null;
  }

  const agentType = merged.agentType || 'hermes';
  const preset = getHarnessPreset(agentType);
  const gatewayUrl = normalizeGatewayUrl(merged.gatewayUrl || preset.gatewayUrl || DEFAULT_GATEWAY_URL);

  return {
    agentType,
    adapterType: merged.adapterType || preset.adapterType,
    connectionMode: merged.connectionMode || preset.connectionMode,
    label: merged.label || defaultLabel(agentType),
    gatewayUrl,
    apiKey: merged.apiKey,
    adapterConfig: merged.adapterConfig,
    capabilities: preset.capabilities,
    homePath: merged.homePath ? expandHome(merged.homePath) : undefined,
    connectedAt: merged.connectedAt,
  };
}

export async function getConnectionDiscovery(): Promise<ConnectionDiscovery> {
  const homes = homeDir();
  const candidates: ConnectionDiscovery['detectedHomes'] = [
    {
      agentType: 'hermes',
      path: expandHome(process.env.HERMES_HOME || '~/.hermes'),
      exists: false,
      source: process.env.HERMES_HOME ? 'HERMES_HOME' : 'default',
    },
    {
      agentType: 'openclaw',
      path: expandHome(process.env.OPENCLAW_WORKSPACE || '~/.openclaw-workspace'),
      exists: false,
      source: process.env.OPENCLAW_WORKSPACE ? 'OPENCLAW_WORKSPACE' : 'default',
    },
    { agentType: 'openclaw', path: path.join(/* turbopackIgnore: true */ homes, 'openclaw-workspace'), exists: false, source: 'common' },
    { agentType: 'openclaw', path: path.join(/* turbopackIgnore: true */ homes, 'clawd'), exists: false, source: 'common' },
    { agentType: 'openclaw', path: path.join(/* turbopackIgnore: true */ homes, 'molty'), exists: false, source: 'common' },
    {
      agentType: 'custom',
      path: expandHome(process.env.AGENT_HOME || '~/.agent'),
      exists: false,
      source: process.env.AGENT_HOME ? 'AGENT_HOME' : 'default',
    },
  ];

  const detectedHomes = await Promise.all(
    candidates.map(async candidate => ({
      ...candidate,
      exists: await pathExists(candidate.path),
    }))
  );

  return {
    configPath: CONFIG_PATH,
    defaultGatewayUrl: DEFAULT_GATEWAY_URL,
    presets: PRESETS,
    detectedHomes,
  };
}

/** Whether a usable connection exists (at minimum a gateway URL). */
export async function isConfigured(): Promise<boolean> {
  const conn = await getConnection();
  return Boolean(conn?.gatewayUrl);
}

/** Persists the connection to disk, merging over any existing saved config. */
export async function saveConnection(
  input: Partial<AgentConnection>
): Promise<AgentConnection> {
  const existing = (await readFileConfig()) || {};
  const agentType = input.agentType || existing.agentType || 'hermes';
  const preset = getHarnessPreset(agentType);
  const gatewayUrl = normalizeGatewayUrl(input.gatewayUrl || existing.gatewayUrl || preset.gatewayUrl || DEFAULT_GATEWAY_URL);
  const adapterType = input.adapterType || (input.agentType ? preset.adapterType : existing.adapterType) || preset.adapterType;
  const connectionMode = input.connectionMode || (input.agentType ? preset.connectionMode : existing.connectionMode) || preset.connectionMode;
  const adapterChanged =
    existing.agentType !== undefined &&
    (existing.agentType !== agentType || existing.adapterType !== adapterType || existing.connectionMode !== connectionMode);
  const adapterConfig =
    typeof input.adapterConfig === 'object' && input.adapterConfig
      ? input.adapterConfig
      : adapterChanged
        ? {}
        : typeof existing.adapterConfig === 'object' && existing.adapterConfig
          ? existing.adapterConfig
          : {};
  const next: AgentConnection = {
    agentType,
    adapterType,
    connectionMode,
    label: input.label || existing.label || defaultLabel(agentType),
    gatewayUrl,
    apiKey: input.apiKey ?? existing.apiKey,
    adapterConfig,
    capabilities: preset.capabilities,
    homePath: input.homePath ? expandHome(input.homePath) : existing.homePath,
    connectedAt: new Date().toISOString(),
  };

  const persisted: AgentConnection = {
    ...next,
    apiKey: next.apiKey ? encryptSecret(next.apiKey) : next.apiKey,
  };

  await fs.mkdir(CONFIG_DIR, { recursive: true });
  await fs.writeFile(CONFIG_PATH, JSON.stringify(persisted, null, 2), 'utf-8');
  setCachedFileConfig(next);
  return next;
}

/** Removes the saved connection file. Env-var config (if any) still applies. */
export async function clearConnection(): Promise<void> {
  try {
    await fs.unlink(CONFIG_PATH);
  } catch {
    // Already gone.
  }
  cachedConfig = null;
}

/**
 * Probes a gateway to verify reachability. Checks common local-agent and
 * OpenAI-compatible endpoints in parallel, bounded by a single overall
 * {@link timeoutMs} budget. Returns the first successful response.
 */
export async function probeGateway(
  gatewayUrl: string,
  apiKey?: string,
  timeoutMs = 5000,
  endpoints = ['/health', '/v1/models', '/api/health', '/api/status', '/']
): Promise<GatewayProbeResult> {
  const base = normalizeGatewayUrl(gatewayUrl);
  const headers: Record<string, string> = {};
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

  const controller = new AbortController();
  const budget = setTimeout(() => controller.abort(), timeoutMs);

  const tasks = endpoints.map(async (endpoint) => {
    const res = await fetch(`${base}${endpoint}`, { headers, signal: controller.signal });
    return { endpoint, res };
  });

  try {
    const results = await Promise.race([
      Promise.allSettled(tasks),
      new Promise<{ kind: 'timeout' }>((resolve) =>
        controller.signal.addEventListener('abort', () => resolve({ kind: 'timeout' }), { once: true })
      ),
    ]);

    if ('kind' in results && results.kind === 'timeout') {
      return { ok: false, status: null, detail: 'Connection timed out' };
    }

    const settled = results as PromiseSettledResult<{ endpoint: string; res: Response }>[];
    let lastStatus: number | null = null;
    let checkedEndpoint: string | null = null;
    let anyResponded = false;

    for (const r of settled) {
      if (r.status !== 'fulfilled') {
        continue;
      }
      const { endpoint, res } = r.value;
      anyResponded = true;
      lastStatus = res.status;
      if (res.ok) {
        checkedEndpoint = endpoint;
        return {
          ok: true,
          status: res.status,
          checkedEndpoint,
          detail: endpoint === '/' ? 'Gateway root reachable' : 'Gateway healthy',
        };
      }
    }

    return {
      ok: false,
      status: lastStatus,
      detail: anyResponded
        ? `Gateway responded but no health endpoint succeeded (${lastStatus})`
        : 'Could not reach gateway',
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { ok: false, status: null, detail: 'Connection timed out' };
    }
    return { ok: false, status: null, detail: 'Could not reach gateway' };
  } finally {
    clearTimeout(budget);
  }
}
