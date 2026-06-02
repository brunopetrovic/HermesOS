import 'server-only';
import { getServerSession, type NextAuthOptions } from 'next-auth';
import { NextResponse } from 'next/server';
import type { SessionUser } from '@/types';
import { ensureUserWorkspace, getLocalOperatorUser, localOperatorEnabled } from '@/lib/bootstrap';

export type AuthSuccess = { ok: true; user: SessionUser };
export type AuthFailure = { ok: false; response: NextResponse };
export type AuthResult = AuthSuccess | AuthFailure;

export const authOptions: NextAuthOptions = {
  providers: [],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  callbacks: {
    async jwt({ token, user }) {
      if (user && (user as { id?: string }).id) {
        token.id = (user as { id: string }).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token && typeof token.id === 'string') {
        (session.user as SessionUser).id = token.id;
      }
      return session;
    },
  },
};

export async function requireUser(): Promise<AuthResult> {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    const user = session.user as SessionUser;
    if (user.id) {
      await ensureUserWorkspace(user);
      return { ok: true, user };
    }
  }

  if (localOperatorEnabled()) {
    const user = getLocalOperatorUser();
    await ensureUserWorkspace(user);
    return { ok: true, user };
  }

  return {
    ok: false,
    response: NextResponse.json(
      {
        error: 'Unauthorized',
        recovery: 'Sign in or enable local operator mode with UNOX_LOCAL_OPERATOR=true for a local-first install.',
      },
      { status: 401 }
    ),
  };
}

export async function withAuth<T extends unknown[]>(
  handler: (user: SessionUser, ...args: T) => Promise<NextResponse> | NextResponse
) {
  return async (...args: T): Promise<NextResponse> => {
    const result = await requireUser();
    if (!result.ok) return result.response;
    return handler(result.user, ...args);
  };
}
