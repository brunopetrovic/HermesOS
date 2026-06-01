'use client';

import { useCommandStore, getDefaultCommands } from '@/lib/store/command-store';
import { useInstanceStore } from '@/lib/store/instance-store';
import { CommandBarAction, CommandCategory } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import { BRAND } from '@/lib/brand';

const CATEGORY_LABELS: Record<CommandCategory, string> = {
  navigation: 'Navigation',
  realm: 'Switch Realm',
  action: 'Actions',
  una: 'Una Commands',
  system: 'System',
};

const CATEGORY_ICONS: Record<CommandCategory, string> = {
  navigation: 'solar:compass-linear',
  realm: 'solar:planet-3-linear',
  action: 'solar:bolt-linear',
  una: 'solar:chat-round-linear',
  system: 'solar:server-square-linear',
};

export function CommandBar() {
  const { isOpen, query, close, setQuery, addRecentCommand } = useCommandStore();
  const { currentInstance, toggleFocusMode, toggleAmbientSound, setCurrentInstance } = useInstanceStore();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands = useMemo(() => {
    return getDefaultCommands(currentInstance, {
      navigate: (href: string) => { router.push(href); close(); },
      toggleFocusMode: () => { toggleFocusMode(); close(); },
      toggleAmbientSound: () => { toggleAmbientSound(); close(); },
      setRealm: (realm) => { setCurrentInstance(realm); },
    });
  }, [currentInstance, router, close, toggleFocusMode, toggleAmbientSound, setCurrentInstance]);

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(q) ||
        cmd.description?.toLowerCase().includes(q) ||
        cmd.category.toLowerCase().includes(q)
    );
  }, [commands, query]);

  // Group by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandBarAction[]> = {};
    filteredCommands.forEach((cmd) => {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  const flatCommands = filteredCommands;

  // Reset selection when results change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedIndex(0);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        useCommandStore.getState().toggle();
      }
      // Focus mode shortcut
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'f') {
        e.preventDefault();
        toggleFocusMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleFocusMode]);

  const executeCommand = useCallback((cmd: CommandBarAction) => {
    addRecentCommand(cmd.id);
    cmd.action();
  }, [addRecentCommand]);

  // Handle keyboard navigation within command bar
  const handleInputKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, flatCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatCommands[selectedIndex]) {
        executeCommand(flatCommands[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      close();
    }
  }, [flatCommands, selectedIndex, executeCommand, close]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={close}
            className="fixed inset-0 z-[200] command-backdrop"
          />

          {/* Command Bar Modal */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 z-[201] w-[90vw] max-w-xl"
          >
            <div className="rounded-2xl overflow-hidden bg-[#11141a] border border-[#333a47]/40 shadow-[0_25px_50px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.05)]">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-5 h-14 border-b border-[#333a47]/30">
                <Icon icon="solar:magnifer-linear" className="text-slate-500 shrink-0" width={18} />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Type a command or search..."
                  className="flex-1 bg-transparent border-none outline-none text-sm text-slate-200 placeholder-slate-600 font-medium"
                  autoComplete="off"
                  spellCheck={false}
                />
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-[#1a1d24] shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)] border border-[#333a47]/40 text-[10px] text-slate-500 font-mono">
                    esc
                  </kbd>
                </div>
              </div>

              {/* Results */}
              <div className="max-h-[50vh] overflow-y-auto p-2">
                {flatCommands.length === 0 ? (
                  <div className="text-center py-8">
                    <Icon icon="solar:ghost-linear" className="text-slate-600 mx-auto mb-2" width={32} />
                    <p className="text-sm text-slate-500">No commands found</p>
                  </div>
                ) : (
                  Object.entries(groupedCommands).map(([category, cmds]) => (
                    <div key={category} className="mb-2 last:mb-0">
                      {/* Category label */}
                      <div className="flex items-center gap-2 px-3 py-1.5">
                        <Icon
                          icon={CATEGORY_ICONS[category as CommandCategory] || 'solar:widget-linear'}
                          className="text-slate-600"
                          width={12}
                        />
                        <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
                          {CATEGORY_LABELS[category as CommandCategory] || category}
                        </span>
                      </div>

                      {/* Commands */}
                      {cmds.map((cmd) => {
                        const globalIndex = flatCommands.indexOf(cmd);
                        const isSelected = globalIndex === selectedIndex;

                        return (
                          <button
                            key={cmd.id}
                            onClick={() => executeCommand(cmd)}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                            className={cn(
                              'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-colors',
                              isSelected
                                ? 'bg-[#1a1d24] border border-[#333a47]/40'
                                : 'border border-transparent hover:bg-[#161920]'
                            )}
                          >
                            <div className={cn(
                              'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                              isSelected
                                ? 'bg-orange-500/15 text-orange-400'
                                : 'bg-[#0c0e12] text-slate-500'
                            )}>
                              <Icon icon={cmd.icon} width={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={cn(
                                'text-sm font-medium truncate',
                                isSelected ? 'text-slate-200' : 'text-slate-400'
                              )}>
                                {cmd.label}
                              </p>
                              {cmd.description && (
                                <p className="text-[10px] text-slate-600 truncate">{cmd.description}</p>
                              )}
                            </div>
                            {cmd.shortcut && (
                              <kbd className="px-1.5 py-0.5 rounded bg-[#0c0e12] text-[10px] text-slate-600 font-mono border border-[#333a47]/30 shrink-0">
                                {cmd.shortcut}
                              </kbd>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-[#333a47]/20 text-[10px] text-slate-600">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded bg-[#0c0e12] border border-[#333a47]/30 font-mono">↑↓</kbd>
                    navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded bg-[#0c0e12] border border-[#333a47]/30 font-mono">↵</kbd>
                    select
                  </span>
                </div>
                <span className="text-slate-700">{BRAND.name}</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
