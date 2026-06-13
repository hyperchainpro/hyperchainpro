import { create } from 'zustand';
import type { ComponentDefinition, ComponentVariant } from '@/lib/types';

interface ComponentState {
  components: ComponentDefinition[];
  selectedComponentId: string | null;
}

interface ComponentActions {
  registerComponent: (def: ComponentDefinition) => void;
  updateComponent: (id: string, updates: Partial<ComponentDefinition>) => void;
  deleteComponent: (id: string) => void;
  selectComponent: (id: string | null) => void;
  getComponentByMasterId: (masterElementId: string) => ComponentDefinition | undefined;
  addVariant: (componentId: string, variant: ComponentVariant) => void;
  removeVariant: (componentId: string, variantId: string) => void;
  reset: () => void;
}

export const useComponentStore = create<ComponentState & ComponentActions>((set, get) => ({
  components: [],
  selectedComponentId: null,

  registerComponent: (def) => set((s) => ({ components: [...s.components, def] })),

  updateComponent: (id, updates) =>
    set((s) => ({
      components: s.components.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c)),
    })),

  deleteComponent: (id) =>
    set((s) => ({
      components: s.components.filter((c) => c.id !== id),
      selectedComponentId: s.selectedComponentId === id ? null : s.selectedComponentId,
    })),

  selectComponent: (id) => set({ selectedComponentId: id }),

  getComponentByMasterId: (masterElementId) => get().components.find((c) => c.masterElementId === masterElementId),

  addVariant: (componentId, variant) =>
    set((s) => ({
      components: s.components.map((c) =>
        c.id === componentId
          ? { ...c, variants: [...(c.variants || []), variant], updatedAt: new Date().toISOString() }
          : c,
      ),
    })),

  removeVariant: (componentId, variantId) =>
    set((s) => ({
      components: s.components.map((c) =>
        c.id === componentId
          ? { ...c, variants: (c.variants || []).filter((v) => v.id !== variantId), updatedAt: new Date().toISOString() }
          : c,
      ),
    })),

  reset: () => set({ components: [], selectedComponentId: null }),
}));