import { create } from 'zustand';
import type { CodeLayerData, CodeLanguage } from '@/lib/code-layer-types';
import { DEFAULT_CODE_LAYER } from '@/lib/code-layer-types';

interface CodeLayerState {
  codeLayers: Record<string, CodeLayerData>;
  activeEditor: string | null;
  editorTab: 'html' | 'css' | 'js';
  templateFilter: string;

  setCodeLayer: (elementId: string, data: CodeLayerData) => void;
  updateCode: (elementId: string, tab: 'html' | 'css' | 'js', code: string) => void;
  setActiveEditor: (id: string | null) => void;
  setEditorTab: (tab: 'html' | 'css' | 'js') => void;
  removeCodeLayer: (elementId: string) => void;
  insertFromTemplate: (elementId: string, template: CodeLayerData) => void;
  setTemplateFilter: (filter: string) => void;
  setTheme: (elementId: string, theme: CodeLayerData['theme']) => void;
}

export const useCodeLayerStore = create<CodeLayerState>((set) => ({
  codeLayers: {},
  activeEditor: null,
  editorTab: 'html',
  templateFilter: 'all',

  setCodeLayer: (elementId, data) =>
    set((state) => ({
      codeLayers: { ...state.codeLayers, [elementId]: data },
    })),

  updateCode: (elementId, tab, code) =>
    set((state) => {
      const existing = state.codeLayers[elementId] || { ...DEFAULT_CODE_LAYER };
      return {
        codeLayers: {
          ...state.codeLayers,
          [elementId]: { ...existing, [tab]: code },
        },
      };
    }),

  setActiveEditor: (id) => set({ activeEditor: id }),
  setEditorTab: (tab) => set({ editorTab: tab }),

  removeCodeLayer: (elementId) =>
    set((state) => {
      const next = { ...state.codeLayers };
      delete next[elementId];
      return { codeLayers: next };
    }),

  insertFromTemplate: (elementId, template) =>
    set((state) => ({
      codeLayers: { ...state.codeLayers, [elementId]: { ...template } },
      activeEditor: elementId,
    })),

  setTemplateFilter: (filter) => set({ templateFilter: filter }),

  setTheme: (elementId, theme) =>
    set((state) => {
      const existing = state.codeLayers[elementId];
      if (!existing) return state;
      return {
        codeLayers: {
          ...state.codeLayers,
          [elementId]: { ...existing, theme },
        },
      };
    }),
}));