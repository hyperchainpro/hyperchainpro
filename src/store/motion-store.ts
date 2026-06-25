import { create } from 'zustand';
import type {
  ElementAnimation,
  AnimationPreset,
  AnimationPlayState,
  EasingType,
  AnimationDirection,
} from '@/lib/motion-types';

interface MotionState {
  animations: Record<string, ElementAnimation>;
  isPlaying: boolean;
  selectedPreset: string | null;
  activeTab: string;

  // Actions
  addAnimation: (elementId: string, preset: AnimationPreset) => void;
  removeAnimation: (elementId: string) => void;
  updateAnimation: (elementId: string, updates: Partial<ElementAnimation>) => void;
  setDuration: (elementId: string, duration: number) => void;
  setDelay: (elementId: string, delay: number) => void;
  setEasing: (elementId: string, easing: EasingType) => void;
  setLoop: (elementId: string, loop: boolean) => void;
  setDirection: (elementId: string, direction: AnimationDirection) => void;
  playAll: () => void;
  pauseAll: () => void;
  resetAll: () => void;
  setSelectedPreset: (name: string | null) => void;
  setActiveTab: (tab: string) => void;
  clearAll: () => void;
}

export const useMotionStore = create<MotionState>((set) => ({
  animations: {},
  isPlaying: false,
  selectedPreset: null,
  activeTab: 'entrance',

  addAnimation: (elementId, preset) =>
    set((state) => {
      const id = `motion-${elementId}-${Date.now()}`;
      const animation: ElementAnimation = {
        id,
        elementId,
        keyframes: [...preset.keyframes],
        duration: preset.duration,
        easing: preset.easing,
        loop: preset.loop,
        delay: preset.delay,
        direction: preset.direction,
        playState: 'idle' as AnimationPlayState,
        presetName: preset.name,
      };
      return {
        animations: { ...state.animations, [elementId]: animation },
      };
    }),

  removeAnimation: (elementId) =>
    set((state) => {
      const next = { ...state.animations };
      delete next[elementId];
      return { animations: next };
    }),

  updateAnimation: (elementId, updates) =>
    set((state) => {
      const existing = state.animations[elementId];
      if (!existing) return state;
      return {
        animations: {
          ...state.animations,
          [elementId]: { ...existing, ...updates },
        },
      };
    }),

  setDuration: (elementId, duration) =>
    set((state) => {
      const existing = state.animations[elementId];
      if (!existing) return state;
      return {
        animations: {
          ...state.animations,
          [elementId]: { ...existing, duration },
        },
      };
    }),

  setDelay: (elementId, delay) =>
    set((state) => {
      const existing = state.animations[elementId];
      if (!existing) return state;
      return {
        animations: {
          ...state.animations,
          [elementId]: { ...existing, delay },
        },
      };
    }),

  setEasing: (elementId, easing) =>
    set((state) => {
      const existing = state.animations[elementId];
      if (!existing) return state;
      return {
        animations: {
          ...state.animations,
          [elementId]: { ...existing, easing },
        },
      };
    }),

  setLoop: (elementId, loop) =>
    set((state) => {
      const existing = state.animations[elementId];
      if (!existing) return state;
      return {
        animations: {
          ...state.animations,
          [elementId]: { ...existing, loop },
        },
      };
    }),

  setDirection: (elementId, direction) =>
    set((state) => {
      const existing = state.animations[elementId];
      if (!existing) return state;
      return {
        animations: {
          ...state.animations,
          [elementId]: { ...existing, direction },
        },
      };
    }),

  playAll: () =>
    set((state) => ({
      isPlaying: true,
      animations: Object.fromEntries(
        Object.entries(state.animations).map(([k, v]) => [k, { ...v, playState: 'playing' as AnimationPlayState }])
      ),
    })),

  pauseAll: () =>
    set((state) => ({
      isPlaying: false,
      animations: Object.fromEntries(
        Object.entries(state.animations).map(([k, v]) => [k, { ...v, playState: 'paused' as AnimationPlayState }])
      ),
    })),

  resetAll: () =>
    set((state) => ({
      isPlaying: false,
      animations: Object.fromEntries(
        Object.entries(state.animations).map(([k, v]) => [k, { ...v, playState: 'idle' as AnimationPlayState }])
      ),
    })),

  setSelectedPreset: (name) => set({ selectedPreset: name }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  clearAll: () => set({ animations: {}, isPlaying: false }),
}));