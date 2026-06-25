import { create } from 'zustand';
import type { ElementEffect, AdvancedFill, EffectPreset } from '@/lib/effects-types';

interface EffectsState {
  elementEffects: Record<string, ElementEffect[]>;
  elementFills: Record<string, AdvancedFill>;
  activeTab: string;

  addEffect: (elementId: string, effect: ElementEffect) => void;
  removeEffect: (elementId: string, effectId: string) => void;
  updateEffect: (elementId: string, effectId: string, params: Partial<ElementEffect>) => void;
  setFill: (elementId: string, fill: AdvancedFill) => void;
  clearFill: (elementId: string) => void;
  clearEffects: (elementId: string) => void;
  applyPreset: (elementId: string, preset: EffectPreset) => void;
  setActiveTab: (tab: string) => void;
}

export const useEffectsStore = create<EffectsState>((set) => ({
  elementEffects: {},
  elementFills: {},
  activeTab: 'basic',

  addEffect: (elementId, effect) =>
    set((state) => ({
      elementEffects: {
        ...state.elementEffects,
        [elementId]: [...(state.elementEffects[elementId] || []), effect],
      },
    })),

  removeEffect: (elementId, effectId) =>
    set((state) => ({
      elementEffects: {
        ...state.elementEffects,
        [elementId]: (state.elementEffects[elementId] || []).filter(
          (e) => e.id !== effectId
        ),
      },
    })),

  updateEffect: (elementId, effectId, params) =>
    set((state) => ({
      elementEffects: {
        ...state.elementEffects,
        [elementId]: (state.elementEffects[elementId] || []).map((e) =>
          e.id === effectId ? { ...e, ...params } : e
        ),
      },
    })),

  setFill: (elementId, fill) =>
    set((state) => ({
      elementFills: { ...state.elementFills, [elementId]: fill },
    })),

  clearFill: (elementId) =>
    set((state) => {
      const next = { ...state.elementFills };
      delete next[elementId];
      return { elementFills: next };
    }),

  clearEffects: (elementId) =>
    set((state) => ({
      elementEffects: {
        ...state.elementEffects,
        [elementId]: [],
      },
      elementFills: {
        ...state.elementFills,
        [elementId]: state.elementFills[elementId] || undefined,
      },
    })),

  applyPreset: (elementId, preset) =>
    set((state) => ({
      elementEffects: {
        ...state.elementEffects,
        [elementId]: preset.effects.map((e) => ({
          ...e,
          id: `${e.type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        })),
      },
      elementFills: preset.fill
        ? { ...state.elementFills, [elementId]: preset.fill }
        : state.elementFills,
    })),

  setActiveTab: (tab) => set({ activeTab: tab }),
}));