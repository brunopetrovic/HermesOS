'use client';

import { cn } from '@/lib/utils';
import { BOTTOM_NAV_ITEMS } from '@/types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@iconify/react';

const iconMap: Record<string, string> = {
  home: 'solar:home-2-linear',
  'check-square': 'solar:check-square-linear',
  calendar: 'solar:calendar-linear',
  users: 'solar:users-group-rounded-linear',
  user: 'solar:user-linear',
  tasks: 'solar:clipboard-list-linear',
  council: 'solar:crown-star-linear',
  profile: 'solar:user-circle-linear',
  atom: 'solar:atom-linear',
  brain: 'solar:cpu-bolt-linear',
  sparkles: 'solar:chat-round-linear',
  menu: 'solar:widget-linear',
  settings: 'solar:settings-linear',
};

export function BottomNav() {
  const pathname = usePathname();

  const getActiveTab = () => {
    if (pathname?.startsWith('/nexus')) return 'nexus';
    if (pathname?.startsWith('/brain')) return 'brain';
    if (pathname?.startsWith('/una')) return 'una';
    if (pathname?.startsWith('/settings') || pathname?.startsWith('/bunker') || pathname?.startsWith('/intelligence')) return 'settings';
    return 'home';
  };

  const activeTab = getActiveTab();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden h-16 px-2 bg-[#0c0e12]/95 backdrop-blur-lg border-t border-[#333a47]/20 flex items-center justify-around shadow-[0_-2px_10px_rgba(0,0,0,0.5)]">
      {BOTTOM_NAV_ITEMS.map((item) => {
        const iconName = iconMap[item.icon] || 'solar:home-2-linear';
        const isActive = activeTab === item.id;

        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 py-2 px-3 min-w-[56px] rounded-xl text-xs transition-colors',
              isActive
                ? item.id === 'nexus'
                  ? 'text-violet-400'
                  : 'text-orange-500'
                : 'text-slate-600 hover:text-slate-400'
            )}
          >
            <div className="relative">
              <Icon icon={iconName} className="w-5 h-5" />
              {isActive && (
                <span
                  className={cn(
                    'absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full transition-colors',
                    item.id === 'nexus' ? 'bg-violet-400' : 'bg-orange-500'
                  )}
                />
              )}
            </div>
            <span className="font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
