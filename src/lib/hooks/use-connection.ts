'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';

export type ConnectionPreset = {
  agentType: string;
  adapterType: string;
  label: string;
  shortLabel: string;
  gatewayUrl: string;
  description: string;
  icon: string;
  connectionMode: string;
  paperclipPattern: string;
  capabilities: string[];
  healthEndpoints: string[];
  configFields: unknown[];
  safetyNotes: string[];
};

export type ConnectionDetectedHome = {
  agentType: string;
  path: string;
  exists: boolean;
  source: string;
};

export type ConnectionDiscovery = {
  configPath: string;
  defaultGatewayUrl: string;
  presets: ConnectionPreset[];
  detectedHomes: ConnectionDetectedHome[];
};

export type ConnectionSummary = {
  connected: boolean;
  connection: null | {
    agentType: string;
    adapterType?: string;
    connectionMode?: string;
    label: string;
    gatewayUrl: string;
    homePath?: string;
    adapterConfig?: Record<string, unknown>;
    hasApiKey?: boolean;
  };
  discovery: ConnectionDiscovery | null;
};

export const CONNECTION_QUERY_KEY = ['connection'] as const;

async function fetchConnection(): Promise<ConnectionSummary> {
  const res = await fetch('/api/connection', { cache: 'no-store' });
  if (!res.ok) {
    return { connected: false, connection: null, discovery: null };
  }
  const data = await res.json();
  return {
    connected: Boolean(data.connected),
    connection: data.connection || null,
    discovery: data.discovery || null,
  };
}

/**
 * Shared connection query. Centralised so the pill, dashboard, and onboarding
 * never duplicate fetches. Use {@link invalidateConnection} after any mutation
 * that changes the connection (save, delete, etc.).
 */
export function useConnection() {
  return useQuery({
    queryKey: CONNECTION_QUERY_KEY,
    queryFn: fetchConnection,
    staleTime: 30_000,
  });
}

export function useInvalidateConnection() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: CONNECTION_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };
}
