'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';

interface MainErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function MainError({ error, reset }: MainErrorProps) {
  useEffect(() => {
    console.error('[UNOX UI error]', error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20">
        <Icon icon="solar:danger-triangle-bold" width={40} />
      </div>
      <div className="space-y-2 max-w-md">
        <h1 className="text-2xl font-black text-slate-100">Something went wrong</h1>
        <p className="text-sm text-slate-400">
          {error.message || 'An unexpected error occurred while loading this view.'}
        </p>
        {error.digest && (
          <p className="text-[10px] text-slate-600 font-mono">Digest: {error.digest}</p>
        )}
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => reset()}
          className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2 text-sm transition"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-5 py-2 text-sm transition"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
