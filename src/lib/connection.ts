/**
 * Agent connection configuration (server-side only).
 *
 * This is the single source of truth for how the command center reaches a
 * user's local agent (Hermes, OpenClaw, or any OpenAI-compatible gateway).
 *
 * Resolution order for each field:
 *   1. Values saved through the onboarding flow (a JSON file on disk)
 *   2. Environment variables (great for Docker / headless installs)
 *   3. Sensible defaults
 *
 * The config file lives in `UNOX_CONFIG_DIR` (defaults to `~/.unox`) so it
 * persists across restarts without requiring a database. When the app is
 * later upgraded to multi-user mode, this module is the only place that needs
 * to swap file storage for per-user database rows.
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

const CONFIG_DIR =
  process.env.UNOX_CONFIG_DIR || path.join(os.homedir() || '/tmp', '.unox');
const CONFIG_PATH = path.join(CONFIG_DIR, 'connection.json');

const DEFAULT_GATEWAY_URL = 'http://localhost:8642';

function envHomePath(): string | undefined {
  if (process.env.HERMES_HOME) return process.env.HERMES_HOME;
  if (process.env.AGENT_HOME) return process.env.AGENT_HOME;
  return undefined;
}

function envConnection(): Partial<AgentConnection> {
  const gatewayUrl =
    process.env.HERMES_GATEWAY_URL || process.env.AGENT_GATEWAY_URL || undefined;
  const apiKey =
    process.env.HERMES_API_KEY || process.env.AGENT_API_KEY || undefined;
  const homePath = envHomePath();
  const agentType = (process.env.AGENT_TYPE as AgentType) || undefined;

  const env: Partial<AgentConnection> = {};
  if (gatewayUrl) env.gatewayUrl = gatewayUrl;
  if (apiKey) env.apiKey = apiKey;
  if (homePath) env.homePath = homePath;
  if (agentType) env.agentType = agentType;
  return env;
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
    gatewayUrl: merged.gatewayUrl || DEFAULT_GATEWAY_URL,
    apiKey: merged.apiKey,
    homePath: merged.homePath,
    connectedAt: merged.connectedAt,
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
    gatewayUrl: input.gatewayUrl || existing.gatewayUrl || DEFAULT_GATEWAY_URL,
    apiKey: input.apiKey ?? existing.apiKey,
    homePath: input.homePath ?? existing.homePath,
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
 * Probes a gateway to verify reachability. Tries `/health` first, then falls
 * back to `/v1/models` (OpenAI-compatible). Returns a normalized result.
 */
export async function probeGateway(
  gatewayUrl: string,
  apiKey?: string,
  timeoutMs = 5000
): Promise<{ ok: boolean; status: number | null; detail: string }> {
  const base = gatewayUrl.replace(/\/+$/, '');
  const headers: Record<string, string> = {};
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

  const attempt = async (suffix: string) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(`${base}${suffix}`, {
        headers,
        signal: controller.signal,
      });
      return res;
    } finally {
      clearTimeout(timer);
    }
  };

  try {
    const health = await attempt('/health');
    if (health.ok) return { ok: true, status: health.status, detail: 'Gateway healthy' };
  } catch {
    // Try the models endpoint instead.
  }

  try {
    const models = await attempt('/v1/models');
    if (models.ok) return { ok: true, status: models.status, detail: 'Gateway reachable' };
    return {
      ok: false,
      status: models.status,
      detail: `Gateway responded with ${models.status}`,
    };
  } catch (error) {
    return {
      ok: false,
      status: null,
      detail:
        error instanceof Error && error.name === 'AbortError'
          ? 'Connection timed out'
          : 'Could not reach gateway',
    };
  }
}
