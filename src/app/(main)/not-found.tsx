import Link from 'next/link';
import { Icon } from '@iconify/react';

export default function MainNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
        <Icon icon="solar:compass-big-bold" width={40} />
      </div>
      <div className="space-y-2 max-w-md">
        <h1 className="text-2xl font-black text-slate-100">Lost in the void</h1>
        <p className="text-sm text-slate-400">
          We couldn&apos;t locate that page in any realm. Maybe it hasn&apos;t been forged yet — or it was archived.
        </p>
      </div>
      <Link
        href="/dashboard"
        className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2 text-sm transition"
      >
        Return to mission control
      </Link>
    </div>
  );
}
