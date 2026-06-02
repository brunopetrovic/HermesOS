'use client';

import { useOrbStore, type OrbVariant } from '@/lib/store/orb-store';
import { useInstanceStore } from '@/lib/store/instance-store';
import { useUnaStore } from '@/lib/store/una-store';
import { useShallow } from 'zustand/react/shallow';
import { motion, PanInfo } from 'framer-motion';
import { useEffect, useCallback, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

const ORB_SIZE = 56;
const EDGE_MARGIN = 16;

const orbStyles: Record<OrbVariant, {
  bg: string;
  iconColor: string;
  animClass: string;
  innerGlow: string;
  icon: string;
}> = {
  organic: {
    bg: 'bg-gradient-to-br from-orange-500/90 to-amber-600/90',
    iconColor: 'text-white',
    animClass: 'orb-organic',
    innerGlow: 'rgba(249, 115, 22, 0.4)',
    icon: 'solar:leaf-linear',
  },
  golden: {
    bg: 'bg-gradient-to-br from-amber-400/90 to-yellow-600/90',
    iconColor: 'text-amber-900',
    animClass: 'orb-golden',
    innerGlow: 'rgba(251, 191, 36, 0.4)',
    icon: 'solar:star-shine-linear',
  },
  holographic: {
    bg: 'bg-gradient-to-br from-sky-400/80 to-cyan-600/80',
    iconColor: 'text-white',
    animClass: 'orb-holographic',
    innerGlow: 'rgba(56, 189, 248, 0.4)',
    icon: 'solar:cpu-bolt-linear',
  },
  cosmic: {
    bg: 'bg-[#11141a]',
    iconColor: 'text-orange-500',
    animClass: 'orb-nexus',
    innerGlow: 'rgba(249, 115, 22, 0.4)',
    icon: 'solar:atom-linear',
  },
};

export function UnaOrb() {
  const {
    variant,
    isDragging,
    hasNotification,
    notificationCount,
    x,
    y,
    setDragging,
    setPosition,
    updateVariantForRealm,
    toggleExpanded,
  } = useOrbStore(
    useShallow(s => ({
      variant: s.variant,
      isDragging: s.isDragging,
      hasNotification: s.hasNotification,
      notificationCount: s.notificationCount,
      x: s.x,
      y: s.y,
      setDragging: s.setDragging,
      setPosition: s.setPosition,
      updateVariantForRealm: s.updateVariantForRealm,
      toggleExpanded: s.toggleExpanded,
    }))
  );

  const currentInstance = useInstanceStore(s => s.currentInstance);
  const isThinking = useUnaStore(s => s.isThinking);
  const constraintRef = useRef<HTMLDivElement>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = useOrbStore.persist.getOptions();
    if (stored.skipHydration) {
      useOrbStore.persist.rehydrate();
    }
    Promise.resolve().then(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedX = useOrbStore.getState().x;
    const storedY = useOrbStore.getState().y;
    if (storedX === 0 && storedY === 0) {
      setPosition(window.innerWidth - ORB_SIZE - EDGE_MARGIN, window.innerHeight - 100);
    }
  }, [setPosition]);

  useEffect(() => {
    updateVariantForRealm(currentInstance);
  }, [currentInstance, updateVariantForRealm]);

  const style = orbStyles[variant];

  const handleDragStart = useCallback(() => {
    setDragging(true);
  }, [setDragging]);

  const handleDragEnd = useCallback(
    (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      setDragging(false);
      const windowW = window.innerWidth;
      const windowH = window.innerHeight;
      const currentX = info.point.x;
      const currentY = Math.min(Math.max(info.point.y, 80), windowH - 80);
      const snapX = currentX > windowW / 2 ? windowW - ORB_SIZE - EDGE_MARGIN : EDGE_MARGIN;
      setPosition(snapX, currentY);
    },
    [setDragging, setPosition]
  );

  const handleClick = useCallback(() => {
    if (!isDragging) {
      toggleExpanded();
    }
  }, [isDragging, toggleExpanded]);

  if (!hydrated) return null;

  return (
    <>
      <div ref={constraintRef} className="fixed inset-0 pointer-events-none z-[100]" aria-hidden="true" />

      <motion.button
        drag
        dragConstraints={constraintRef}
        dragElastic={0.1}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={handleClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'fixed z-[101] flex items-center justify-center rounded-full cursor-grab active:cursor-grabbing',
          'backdrop-blur-sm border border-white/20',
          'transition-colors duration-500',
          style.bg,
          style.animClass,
          isDragging && 'shadow-2xl'
        )}
        style={{
          width: ORB_SIZE,
          height: ORB_SIZE,
          left: x || undefined,
          top: y || undefined,
          right: x === 0 ? EDGE_MARGIN : undefined,
          bottom: !y ? 100 : undefined,
        }}
        id="una-orb"
        aria-label="Open Una chat"
      >
        <div
          className="absolute inset-1 rounded-full"
          style={{
            background: `radial-gradient(circle, ${style.innerGlow} 0%, transparent 70%)`,
          }}
        />

        {isThinking && (
          <motion.div
            className="absolute inset-[-3px] rounded-full border-2 border-transparent"
            style={{
              borderTopColor: 'rgba(255,255,255,0.6)',
              borderRightColor: 'rgba(255,255,255,0.2)',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        )}

        <Icon
          icon={isThinking ? 'solar:refresh-linear' : style.icon}
          className={cn(
            'relative z-10 drop-shadow-lg',
            style.iconColor,
            isThinking && 'animate-spin'
          )}
          width={24}
        />

        {hasNotification && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center z-20 border-2 border-black"
          >
            <span className="text-[9px] font-bold text-white">
              {notificationCount > 9 ? '9+' : notificationCount || '!'}
            </span>
          </motion.div>
        )}

        {isDragging && (
          <>
            <motion.div
              className="absolute w-2 h-2 rounded-full"
              style={{ background: style.innerGlow }}
              animate={{
                opacity: [0.6, 0],
                scale: [1, 0],
                x: [0, -20],
                y: [0, 10],
              }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
            <motion.div
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{ background: style.innerGlow }}
              animate={{
                opacity: [0.4, 0],
                scale: [1, 0],
                x: [0, 15],
                y: [0, -15],
              }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
            />
          </>
        )}
      </motion.button>
    </>
  );
}
