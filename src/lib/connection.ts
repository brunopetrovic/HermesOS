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
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';

export type AgentType = 'hermes' | 'openclaw' | 'custom';

export interface AgentConnection {
  /** Which kind of agent is connected. */
  agentType: AgentType;
  /** Display name for the connected agent (shown in the UI). */
  label: string;
  /** Base URL of the agent gateway, e.g. http://localhost:8642 */
  gatewayUrl: string;
  /** Optional bearer token for the gateway. */
  apiKey?: string;
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
    label: string;
    gatewayUrl: string;
    description: string;
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
  process.env.UNOX_CONFIG_DIR || path.join(os.homedir() || '/tmp', '.unox');
const CONFIG_PATH = path.join(CONFIG_DIR, 'connection.json');

const DEFAULT_GATEWAY_URL = 'http://localhost:8642';

const PRESETS: ConnectionDiscovery['presets'] = [
  {
    agentType: 'hermes',
    label: 'Hermes Agent',
    gatewayUrl: process.env.HERMES_GATEWAY_URL || DEFAULT_GATEWAY_URL,
    description: 'Hermes Agent local gateway, usually bound to localhost:8642.',
  },
  {
    agentType: 'openclaw',
    label: 'OpenClaw Agent',
    gatewayUrl: process.env.OPENCLAW_GATEWAY_URL || process.env.CLAWDBOT_URL || 'http://localhost:3333',
    description: 'OpenClaw-compatible local dashboard or gateway endpoint.',
  },
  {
    agentType: 'custom',
    label: 'Custom Agent Gateway',
    gatewayUrl: process.env.AGENT_GATEWAY_URL || 'http://localhost:11434',
    description: 'Any local OpenAI-compatible or agent-control HTTP gateway.',
  },
];

function homeDir(): string {
  return os.homedir() || process.env.HOME || '/tmp';
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
  if (value === 'hermes' || value === 'openclaw' || value === 'custom') return value;
  return undefined;
}

function expandHome(value: string): string {
  if (value === '~') return homeDir();
  if (value.startsWith('~/')) return path.join(homeDir(), value.slice(2));
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
    const raw = await fs.readFile(CONFIG_PATH, 'utf-8');
    return JSON.parse(raw) as Partial<AgentConnection>;
  } catch {
    return null;
  }
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

  return {
    agentType: merged.agentType || 'hermes',
    label: merged.label || defaultLabel(merged.agentType || 'hermes'),
    gatewayUrl: normalizeGatewayUrl(merged.gatewayUrl || DEFAULT_GATEWAY_URL),
    apiKey: merged.apiKey,
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
    { agentType: 'openclaw', path: path.join(homes, 'openclaw-workspace'), exists: false, source: 'common' },
    { agentType: 'openclaw', path: path.join(homes, 'clawd'), exists: false, source: 'common' },
    { agentType: 'openclaw', path: path.join(homes, 'molty'), exists: false, source: 'common' },
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
  const next: AgentConnection = {
    agentType: input.agentType || existing.agentType || 'hermes',
    label:
      input.label ||
      existing.label ||
      defaultLabel(input.agentType || existing.agentType || 'hermes'),
    gatewayUrl: normalizeGatewayUrl(input.gatewayUrl || existing.gatewayUrl || DEFAULT_GATEWAY_URL),
    apiKey: input.apiKey ?? existing.apiKey,
    homePath: input.homePath ? expandHome(input.homePath) : existing.homePath,
    connectedAt: new Date().toISOString(),
  };

  await fs.mkdir(CONFIG_DIR, { recursive: true });
  await fs.writeFile(CONFIG_PATH, JSON.stringify(next, null, 2), 'utf-8');
  return next;
}

/** Removes the saved connection file. Env-var config (if any) still applies. */
export async function clearConnection(): Promise<void> {
  try {
    await fs.unlink(CONFIG_PATH);
  } catch {
    // Already gone.
  }
}

function defaultLabel(type: AgentType): string {
  switch (type) {
    case 'hermes':
      return 'Hermes Agent';
    case 'openclaw':
      return 'OpenClaw Agent';
    default:
      return 'Custom Agent';
  }
}

/**
 * Probes a gateway to verify reachability. Checks common local-agent and
 * OpenAI-compatible endpoints before accepting root as a degraded success.
 */
export async function probeGateway(
  gatewayUrl: string,
  apiKey?: string,
  timeoutMs = 5000
): Promise<GatewayProbeResult> {
  const base = normalizeGatewayUrl(gatewayUrl);
  const headers: Record<string, string> = {};
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

  const endpoints = ['/health', '/v1/models', '/api/health', '/api/status', '/'];
  let lastStatus: number | null = null;

  for (const endpoint of endpoints) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(`${base}${endpoint}`, {
        headers,
        signal: controller.signal,
      });
      lastStatus = res.status;
      if (res.ok) {
        return {
          ok: true,
          status: res.status,
          checkedEndpoint: endpoint,
          detail: endpoint === '/' ? 'Gateway root reachable' : 'Gateway healthy',
        };
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return { ok: false, status: null, detail: 'Connection timed out', checkedEndpoint: endpoint };
      }
      // Keep trying the remaining common endpoints.
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    ok: false,
    status: lastStatus,
    detail: lastStatus ? `Gateway responded but no health endpoint succeeded (${lastStatus})` : 'Could not reach gateway',
  };
}
