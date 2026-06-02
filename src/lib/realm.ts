import type { InstanceType } from '@/types';

export type RealmSegment = 'dashboard' | 'personal' | 'brand' | 'business' | 'nexus' | 'other';

const REALM_PREFIXES: Array<{ prefix: string; realm: InstanceType }> = [
  { prefix: '/nexus', realm: 'nexus' },
  { prefix: '/brand', realm: 'brand' },
  { prefix: '/business', realm: 'business' },
  { prefix: '/personal', realm: 'personal' },
];

export function getRealmFromPathname(pathname: string | null | undefined): InstanceType {
  if (!pathname) return 'personal';
  for (const { prefix, realm } of REALM_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return realm;
  }
  return 'personal';
}

export function getSegmentFromPathname(pathname: string | null | undefined): RealmSegment {
  if (!pathname) return 'other';
  if (pathname === '/' || pathname === '/dashboard' || pathname.startsWith('/dashboard/')) return 'dashboard';
  for (const { prefix } of REALM_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return prefix.slice(1) as RealmSegment;
    }
  }
  return 'other';
}

export const REALM_THEME: Record<InstanceType, {
  label: string;
  icon: string;
  accent: string;
  glow: string;
  ringGradient: string;
  realmFlash: string;
}> = {
  personal: {
    label: 'Personal',
    icon: '🏠',
    accent: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    glow: 'shadow-[0_0_8px_rgba(249,115,22,0.4)]',
    ringGradient: 'from-orange-500/40 to-amber-500/30',
    realmFlash: 'rgba(249, 115, 22, 0.15)',
  },
  brand: {
    label: 'Brand',
    icon: '✦',
    accent: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
    glow: 'shadow-[0_0_8px_rgba(240,147,251,0.4)]',
    ringGradient: 'from-pink-500/40 to-fuchsia-500/30',
    realmFlash: 'rgba(240, 147, 251, 0.15)',
  },
  business: {
    label: 'Business',
    icon: '⚡',
    accent: 'text-red-400 bg-red-500/10 border-red-500/20',
    glow: 'shadow-[0_0_8px_rgba(220,38,38,0.4)]',
    ringGradient: 'from-red-500/40 to-rose-500/30',
    realmFlash: 'rgba(220, 38, 38, 0.1)',
  },
  nexus: {
    label: 'Nexus',
    icon: '◈',
    accent: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    glow: 'shadow-[0_0_8px_rgba(249,115,22,0.4)]',
    ringGradient: 'from-orange-500/40 to-violet-500/30',
    realmFlash: 'rgba(249, 115, 22, 0.15)',
  },
};

export const REALM_CALENDAR_COLOR: Record<InstanceType, string> = {
  personal: '#c9a84c',
  brand: '#f093fb',
  business: '#dc2626',
  nexus: '#f97316',
};
