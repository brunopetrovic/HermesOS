import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getConnection } from '@/lib/connection';

interface GatewayState {
  pid: number;
  kind: string;
  gateway_state: string;
  exit_reason: string | null;
  platforms: Record<string, { state: string; error_code?: string; error_message?: string; updated_at?: string }>;
  updated_at: string;
}

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content.trim()) as T;
  } catch {
    return null;
  }
}

async function checkProcessAlive(pid: number): Promise<boolean> {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function checkGatewayHttp(gatewayUrl: string, apiKey?: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${gatewayUrl.replace(/\/+$/, '')}/health`, {
      signal: controller.signal,
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
    });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

export async function GET() {
  const conn = await getConnection();
  if (!conn?.gatewayUrl) {
    return NextResponse.json({
      status: 'not_connected',
      gateway: { state: 'not_connected', pid: null, processAlive: false, httpHealthy: false, updatedAt: null, exitReason: null },
      platforms: {},
      model: 'Unknown',
      configuredPlatforms: [],
      timestamp: new Date().toISOString(),
    });
  }

  const HERMES_HOME = conn.homePath || path.join(process.env.HOME || '', '.hermes');
  const HERMES_GATEWAY_URL = conn.gatewayUrl;

  try {
    // 1. Read gateway_state.json
    const statePath = path.join(/* turbopackIgnore: true */ HERMES_HOME, 'gateway_state.json');
    const gatewayState = await readJsonFile<GatewayState>(statePath);

    // 2. Read gateway.pid
    const pidPath = path.join(/* turbopackIgnore: true */ HERMES_HOME, 'gateway.pid');
    const pidData = await readJsonFile<{ pid: number; kind: string }>(pidPath);

    // 3. Check if process is alive
    let processAlive = false;
    if (pidData?.pid) {
      processAlive = await checkProcessAlive(pidData.pid);
    }

    // 4. Check HTTP health endpoint
    const httpHealthy = await checkGatewayHttp(HERMES_GATEWAY_URL, conn.apiKey);

    // 5. Read config.yaml for model info
    let activeModel = 'Unknown';
    const configuredPlatforms: string[] = [];
    try {
      const configContent = await fs.readFile(path.join(/* turbopackIgnore: true */ HERMES_HOME, 'config.yaml'), 'utf-8');
      // Simple regex extraction — avoids needing a yaml dependency
      const modelMatch = configContent.match(/^\s*model:\s*["']?([^"'\n]+)/m);
      if (modelMatch) activeModel = modelMatch[1].trim();

      // Extract platform names from platforms section
      const platformMatches = configContent.matchAll(/^\s{2}(\w+):\s*$/gm);
      for (const m of platformMatches) {
        if (m[1] !== 'extra') configuredPlatforms.push(m[1]);
      }
    } catch {
      // Config not readable
    }

    // 6. Compute overall status
    const isRunning = processAlive && (gatewayState?.gateway_state === 'running' || httpHealthy);
    const status = isRunning ? 'online' : processAlive ? 'degraded' : 'offline';

    // 7. Build platform statuses
    const platforms: Record<string, { state: string; updatedAt?: string; error?: string }> = {};
    if (gatewayState?.platforms) {
      for (const [name, info] of Object.entries(gatewayState.platforms)) {
        platforms[name] = {
          state: info.state || 'unknown',
          updatedAt: info.updated_at,
          error: info.error_message,
        };
      }
    }

    return NextResponse.json({
      status,
      gateway: {
        state: gatewayState?.gateway_state || 'unknown',
        pid: pidData?.pid || null,
        processAlive,
        httpHealthy,
        updatedAt: gatewayState?.updated_at || null,
        exitReason: gatewayState?.exit_reason || null,
      },
      platforms,
      model: activeModel,
      configuredPlatforms,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Hermes Status Error:', error);
    return NextResponse.json({
      status: 'error',
      gateway: { state: 'unreachable', pid: null, processAlive: false, httpHealthy: false, updatedAt: null, exitReason: null },
      platforms: {},
      model: 'Unknown',
      configuredPlatforms: [],
      timestamp: new Date().toISOString(),
      error: 'Failed to read Hermes status',
    }, { status: 500 });
  }
}
