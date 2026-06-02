'use client';

import { useEffect, useRef } from 'react';
import { Howl, Howler } from 'howler';
import { useInstanceStore } from '@/lib/store/instance-store';
import { useShallow } from 'zustand/react/shallow';
import type { InstanceType } from '@/types';

// Placeholder URLs for the ambient soundscapes.
// In a real deployment, these would be high-quality files in public/audio/
const SOUNDSCAPES: Record<InstanceType, string> = {
  personal: '/audio/ambient-personal.mp3',
  brand: '/audio/ambient-brand.mp3',
  business: '/audio/ambient-business.mp3',
  nexus: '/audio/ambient-nexus.mp3',
};

export function SoundscapeController() {
  const { currentInstance, ambientSoundEnabled, ambientSoundVolume } = useInstanceStore(
    useShallow(s => ({
      currentInstance: s.currentInstance,
      ambientSoundEnabled: s.ambientSoundEnabled,
      ambientSoundVolume: s.ambientSoundVolume,
    }))
  );
  
  // Keep track of loaded Howl instances
  const soundsRef = useRef<Partial<Record<InstanceType, Howl>>>({});
  
  // Track which instance is currently playing
  const activeInstanceRef = useRef<InstanceType | null>(null);

  // Initialize Howler global volume
  useEffect(() => {
    Howler.volume(ambientSoundVolume / 100);
  }, [ambientSoundVolume]);

  // Handle crossfading and play/pause
  useEffect(() => {
    if (!ambientSoundEnabled) {
      // Fade out all sounds
      Object.keys(soundsRef.current).forEach((key) => {
        const sound = soundsRef.current[key as InstanceType];
        if (sound && sound.playing()) {
          sound.fade(sound.volume(), 0, 1000);
          setTimeout(() => sound.pause(), 1000);
        }
      });
      activeInstanceRef.current = null;
      return;
    }

    const currentKey = currentInstance;
    let currentSound = soundsRef.current[currentKey];

    // Lazy load the sound snippet if it hasn't been instantiated
    if (!currentSound) {
      currentSound = new Howl({
        src: [SOUNDSCAPES[currentKey]],
        loop: true,
        volume: 0,
        html5: true, // Force HTML5 Audio to avoid loading entire file into memory
        onloaderror: () => console.warn(`Could not load ambient sound for realm: ${currentKey}`),
        onplayerror: () => console.warn(`Could not play ambient sound for realm: ${currentKey}`),
      });
      soundsRef.current[currentKey] = currentSound;
    }

    // If it's a different instance than what's currently marked active
    if (activeInstanceRef.current !== currentKey) {
      // Fade out the old sound
      if (activeInstanceRef.current) {
        const oldSound = soundsRef.current[activeInstanceRef.current];
        if (oldSound && oldSound.playing()) {
          oldSound.fade(oldSound.volume(), 0, 2000);
          setTimeout(() => {
            if (!activeInstanceRef.current || activeInstanceRef.current !== currentKey) {
              oldSound.pause();
            }
          }, 2000);
        }
      }

      // Play and fade in the new sound
      if (!currentSound.playing()) {
        currentSound.play();
      }
      currentSound.fade(0, 1, 2000);
      activeInstanceRef.current = currentKey;
    }

  }, [currentInstance, ambientSoundEnabled]);

  // Cleanup on unmount
  useEffect(() => {
    const sounds = soundsRef.current;
    return () => {
      Object.values(sounds).forEach((sound) => {
        if (sound) sound.unload();
      });
    };
  }, []);

  return null; // This is a headless component
}
