'use client';

import { useEffect } from 'react';
import { useCommandStore } from '@/lib/store/command-store';

/**
 * Lightweight global Cmd/Ctrl+K listener. The visible command palette is
 * dynamic-imported (see app-shell) so this file stays free of framer-motion.
 */
export function CommandBarTrigger() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        useCommandStore.getState().toggle();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  return null;
}
