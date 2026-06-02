import 'server-only';
import { prisma } from '@/lib/db';
import type { SessionUser } from '@/types';

export const LOCAL_OPERATOR_ID = 'local-operator';
export const LOCAL_OPERATOR_EMAIL = 'local@unox.local';

const LOCAL_OPERATOR_USER: SessionUser = {
  id: LOCAL_OPERATOR_ID,
  email: LOCAL_OPERATOR_EMAIL,
  name: 'Local Operator',
  image: null,
};

const DEFAULT_INSTANCES = [
  {
    key: 'personal' as const,
    data: { label: 'Personal Life', tagline: 'Your home base', seededBy: 'unox-first-run' },
  },
  {
    key: 'brand' as const,
    data: { label: 'Personal Brand', tagline: 'Your magnetic presence', seededBy: 'unox-first-run' },
  },
  {
    key: 'business' as const,
    data: { label: 'Business', tagline: 'Command center', seededBy: 'unox-first-run' },
  },
  {
    key: 'nexus' as const,
    data: { label: 'The Nexus', tagline: 'Where all operations converge', seededBy: 'unox-first-run' },
  },
];

export function localOperatorEnabled() {
  return process.env.UNOX_REQUIRE_AUTH !== 'true' && process.env.UNOX_LOCAL_OPERATOR !== 'false';
}

export function getLocalOperatorUser(): SessionUser {
  return LOCAL_OPERATOR_USER;
}

export async function ensureUserWorkspace(user: SessionUser): Promise<void> {
  const id = user.id || LOCAL_OPERATOR_ID;
  const email = user.email || LOCAL_OPERATOR_EMAIL;

  await prisma.user.upsert({
    where: { id },
    update: {
      email,
      name: user.name || 'Local Operator',
    },
    create: {
      id,
      email,
      name: user.name || 'Local Operator',
      passwordHash: 'local-operator-password-login-disabled',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    },
  });

  await prisma.userSettings.upsert({
    where: { userId: id },
    update: {},
    create: { userId: id },
  });

  await prisma.$transaction(
    DEFAULT_INSTANCES.map((instance) =>
      prisma.instance.upsert({
        where: {
          userId_key: {
            userId: id,
            key: instance.key,
          },
        },
        update: {},
        create: {
          userId: id,
          key: instance.key,
          data: instance.data,
        },
      })
    )
  );
}
