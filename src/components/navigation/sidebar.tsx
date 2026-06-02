'use client';

import { cn } from '@/lib/utils';
import { BRAND } from '@/lib/brand';
import { useInstanceStore } from '@/lib/store/instance-store';
import { useShallow } from 'zustand/react/shallow';
import { SIDEBAR_SECTIONS } from '@/types';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, setSidebarOpen, sidebarCollapsed, toggleSidebar } = useInstanceStore(
    useShallow(s => ({
      isSidebarOpen: s.isSidebarOpen,
      setSidebarOpen: s.setSidebarOpen,
      sidebarCollapsed: s.sidebarCollapsed,
      toggleSidebar: s.toggleSidebar,
    }))
  );
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const linksRef = useRef<HTMLAnchorElement[]>([]);

  // Collect all flat sidebar links for keyboard navigation
  const allLinks = SIDEBAR_SECTIONS.flatMap(section => section.items);

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/' || pathname === '/personal';
    return pathname?.startsWith(href);
  };

  // Keyboard navigation handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex(prev => (prev + 1) % allLinks.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex(prev => (prev - 1 + allLinks.length) % allLinks.length);
      } else if (e.key === 'Escape') {
        setFocusedIndex(-1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [allLinks.length]);

  // Focus the link element when index changes
  useEffect(() => {
    if (focusedIndex >= 0 && linksRef.current[focusedIndex]) {
      linksRef.current[focusedIndex].focus();
    }
  }, [focusedIndex]);

  return (
    <aside
      className={cn(
        'focus-hideable fixed inset-y-0 left-0 transform transition-all duration-300 ease-in-out',
        'h-full flex flex-col',
        'bg-gradient-to-r from-[#11141a] to-[#0c0e12]',
        'border-r border-[#1a202c] z-50',
        'shadow-[5px_0_15px_rgba(0,0,0,0.8)]',
        'lg:relative lg:translate-x-0',
        sidebarCollapsed ? 'w-20' : 'w-64',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}
    >
      {/* Header / Logo */}
      <div className={cn(
        'h-20 flex items-center border-b border-[#333a47]/20 shadow-[0_1px_0_rgba(0,0,0,0.8)] shrink-0 px-6',
        sidebarCollapsed ? 'justify-center px-0' : 'justify-between'
      )}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2a303c] to-[#15181e] shadow-[0_2px_4px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.15)] flex items-center justify-center border border-[#475266]/30">
            <Icon icon="solar:atom-linear" className="text-orange-500 glow-orange" width={20} />
          </div>
          {!sidebarCollapsed && (
            <div className="animate-in fade-in duration-300">
              <h1 className="text-sm font-black tracking-widest text-slate-100 uppercase">
                {BRAND.name}
              </h1>
              <p className="text-[9px] font-bold text-slate-500 tracking-wider -mt-0.5">{BRAND.tagline}</p>
            </div>
          )}
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
      <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-0.5 custom-scrollbar">
        {SIDEBAR_SECTIONS.map((section, sectionIdx) => {
          let flatIndexOffset = 0;
          for (let i = 0; i < sectionIdx; i++) {
            flatIndexOffset += SIDEBAR_SECTIONS[i].items.length;
          }

          return (
            <div key={section.id} className="space-y-1">
              {sectionIdx > 0 && (
                <div className="my-2 divider mx-2 shrink-0" />
              )}
              {!sidebarCollapsed ? (
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-3 mb-1.5 animate-in fade-in duration-300">
                  {section.label}
                </p>
              ) : null}
              {section.items.map((item, itemIdx) => {
                const active = isActive(item.href);
                const flatIdx = flatIndexOffset + itemIdx;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    ref={(el) => {
                      if (el) linksRef.current[flatIdx] = el;
                    }}
                    onFocus={() => setFocusedIndex(flatIdx)}
                    onClick={() => {
                      if (window.innerWidth < 1024) setSidebarOpen(false);
                    }}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative',
                      active
                        ? 'neu-active text-white'
                        : 'text-slate-500 hover:text-slate-200 hover:bg-[#161920]'
                    )}
                  >
                    <div className={cn(
                      "flex items-center justify-center shrink-0",
                      sidebarCollapsed ? "w-full" : ""
                    )}>
                      <Icon
                        icon={item.icon}
                        width={20}
                        className={cn(
                          active
                            ? 'text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]'
                            : 'text-slate-400 group-hover:text-slate-200 transition-colors'
                        )}
                      />
                    </div>
                    {!sidebarCollapsed ? (
                      <span className={cn(
                        'text-xs font-semibold tracking-wide animate-in fade-in duration-300',
                        active ? 'text-slate-100' : 'text-slate-400 group-hover:text-slate-200'
                      )}>
                        {item.label}
                      </span>
                    ) : (
                      /* Float Tooltip in Collapsed state */
                      <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-[#0c0e12] border border-[#232a36] text-slate-200 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 duration-200 whitespace-nowrap">
                        {item.label}
                      </div>
                    )}
                    {item.badge !== undefined && item.badge > 0 && !sidebarCollapsed && (
                      <span className="ml-auto text-[9px] font-black bg-orange-500/15 border border-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Collapse/Expand Toggle (Desktop only) */}
      <div className="hidden lg:block px-4 py-2 border-t border-[#333a47]/10">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center py-2.5 rounded-xl border border-[#2b3341]/40 bg-[#0d1015] text-slate-500 hover:text-white hover:border-[#2b3341]/80 transition cursor-pointer"
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Icon
            icon={sidebarCollapsed ? "solar:round-arrow-right-linear" : "solar:round-arrow-left-linear"}
            width={18}
          />
        </button>
      </div>

      {/* Bottom User Area */}
      <div className={cn(
        'p-4 border-t border-[#333a47]/20 shadow-[0_-1px_0_rgba(0,0,0,0.8)] flex items-center shrink-0 gap-3',
        sidebarCollapsed ? 'justify-center' : 'justify-between'
      )}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#0c0e12] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.8),inset_-1px_-1px_2px_rgba(255,255,255,0.02)] border border-black flex items-center justify-center shrink-0">
            <Icon icon="solar:user-linear" className="text-slate-400" width={16} />
          </div>
          {!sidebarCollapsed && (
            <div className="animate-in fade-in duration-300">
              <p className="text-xs font-semibold text-slate-300">Operator</p>
              <p className="text-[10px] text-slate-500">Local session</p>
            </div>
          )}
        </div>
        {!sidebarCollapsed && (
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
        )}
      </div>
    </aside>
  );
}
