'use client';

import { cn } from '@/lib/utils';
import { BRAND } from '@/lib/brand';
import { useInstanceStore } from '@/lib/store/instance-store';
import { SIDEBAR_SECTIONS } from '@/types';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, setSidebarOpen } = useInstanceStore();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/' || pathname === '/personal';
    return pathname?.startsWith(href);
  };

  return (
    <aside
      className={cn(
        'focus-hideable fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out',
        'w-64 h-full flex flex-col',
        'bg-gradient-to-r from-[#11141a] to-[#0c0e12]',
        'border-r border-black z-50',
        'shadow-[5px_0_15px_rgba(0,0,0,0.8)]',
        'lg:relative lg:translate-x-0',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      {/* Header / Logo */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-[#333a47]/20 shadow-[0_1px_0_rgba(0,0,0,0.8)] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2a303c] to-[#15181e] shadow-[0_2px_4px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.15)] flex items-center justify-center border border-[#475266]/30">
            <Icon icon="solar:atom-linear" className="text-orange-500 glow-orange" width={20} />
          </div>
          <div>
            <h1 className="text-lg font-medium tracking-tight text-slate-200 drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">
              {BRAND.name}
            </h1>
            <p className="text-[10px] text-slate-600 -mt-0.5">{BRAND.tagline}</p>
          </div>
        </div>
        {/* Mobile Close Button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden text-slate-500 hover:text-white transition-colors p-2 -mr-2"
        >
          <Icon icon="solar:close-circle-linear" width={24} />
        </button>
      </div>

      {/* Nav Links — Dynamic sections */}
      <nav className="flex-1 overflow-y-auto py-4 px-4 flex flex-col gap-0.5">
        {SIDEBAR_SECTIONS.map((section, sectionIdx) => (
          <div key={section.id}>
            {sectionIdx > 0 && (
              <div className="my-2 divider mx-2 shrink-0" />
            )}
            <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider px-3 mb-1.5">
              {section.label}
            </p>
            {section.items.map((item) => {
              const active = isActive(item.href);
              const isNexusItem = item.href.startsWith('/nexus');

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => { if (window.innerWidth < 1024) setSidebarOpen(false); }}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-xl transition-colors',
                    active
                      ? 'neu-active group'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-[#161920]'
                  )}
                >
                  <Icon
                    icon={item.icon}
                    width={18}
                    className={cn(
                      active
                        ? 'text-orange-500 drop-shadow-[0_0_5px_rgba(249,115,22,0.6)]'
                        : ''
                    )}
                  />
                  <span className={cn(
                    'text-sm font-medium',
                    active ? 'text-slate-200' : ''
                  )}>
                    {item.label}
                  </span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-auto text-[10px] font-bold bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom User */}
      <div className="p-6 border-t border-[#333a47]/20 shadow-[0_-1px_0_rgba(0,0,0,0.8)] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#0c0e12] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.8),inset_-1px_-1px_2px_rgba(255,255,255,0.02)] border border-black flex items-center justify-center">
            <Icon icon="solar:user-linear" className="text-slate-400" width={16} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-300">Operator</p>
            <p className="text-[10px] text-slate-600">Local session</p>
          </div>
        </div>
        <div className="w-2 h-2 rounded-full bg-green-500 glow-green animate-pulse" />
      </div>
    </aside>
  );
}
