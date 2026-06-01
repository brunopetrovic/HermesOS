const REDACTED_VALUE = '[REDACTED]';

function normalizedKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

export function isSensitiveConfigKey(key: string): boolean {
  const normalized = normalizedKey(key);
  return (
    key.trim().toLowerCase() === 'headers' ||
    key.trim().toLowerCase() === 'env' ||
    normalized.includes('authorization') ||
    normalized.includes('bearer') ||
    normalized.includes('token') ||
    normalized.includes('secret') ||
    normalized.includes('password') ||
    normalized.includes('passwd') ||
    normalized.includes('apikey') ||
    normalized.includes('privatekey') ||
    normalized.includes('credential') ||
    normalized.includes('cookie') ||
    normalized.includes('session')
  );
}

export function isSensitiveUrlQueryKey(key: string): boolean {
  const normalized = normalizedKey(key);
  return (
    normalized === 'key' ||
    normalized.includes('authorization') ||
    normalized.includes('auth') ||
    normalized.includes('bearer') ||
    normalized.includes('token') ||
    normalized.includes('secret') ||
    normalized.includes('password') ||
    normalized.includes('passwd') ||
    normalized.includes('apikey') ||
    normalized.includes('credential') ||
    normalized.includes('cookie') ||
    normalized.includes('session')
  );
}

export function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function sanitizeUrlForClient(rawUrl: string): string {
  if (rawUrl === 'process://local') return rawUrl;

  try {
    const url = new URL(rawUrl);
    if (url.username) url.username = REDACTED_VALUE;
    if (url.password) url.password = REDACTED_VALUE;
    for (const key of Array.from(url.searchParams.keys())) {
      if (isSensitiveUrlQueryKey(key)) url.searchParams.set(key, REDACTED_VALUE);
    }
    return url.toString().replace(/\/$/, '');
  } catch {
    return rawUrl;
  }
}

export function hasCredentialBearingUrl(value: unknown, depth = 0): boolean {
  if (depth > 8) return false;
  if (typeof value === 'string') return isCredentialBearingUrl(value);
  if (Array.isArray(value)) return value.some((entry) => hasCredentialBearingUrl(entry, depth + 1));
  if (!isPlainRecord(value)) return false;
  return Object.values(value).some((entry) => hasCredentialBearingUrl(entry, depth + 1));
}

export function isCredentialBearingUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return Boolean(
      url.username ||
        url.password ||
        Array.from(url.searchParams.keys()).some(isSensitiveUrlQueryKey)
    );
  } catch {
    return false;
  }
}

export function redactSecrets(value: unknown, depth = 0): unknown {
  if (depth > 8) return REDACTED_VALUE;
  if (typeof value === 'string') return sanitizeUrlForClient(value);
  if (Array.isArray(value)) return value.map((entry) => redactSecrets(entry, depth + 1));
  if (!isPlainRecord(value)) return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      isSensitiveConfigKey(key) ? REDACTED_VALUE : redactSecrets(entry, depth + 1),
    ])
  );
}

export function sanitizeHarnessForClient<T extends { gatewayUrl?: string }>(harness: T): T {
  return {
    ...harness,
    gatewayUrl: harness.gatewayUrl ? sanitizeUrlForClient(harness.gatewayUrl) : harness.gatewayUrl,
  };
}

export function sanitizeDiscoveryForClient<Discovery extends { presets?: Array<{ gatewayUrl?: string }> }>(
  discovery: Discovery
): Discovery {
  return {
    ...discovery,
    presets: discovery.presets?.map(sanitizeHarnessForClient),
  };
}
