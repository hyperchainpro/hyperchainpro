import { create } from 'zustand';
import type { ViewMode, RightPanelTab, EditorMode, LeftPanelTab } from '@/lib/types';
import { DESIGN_PLUGINS } from '@/lib/plugins-data';

// ─── Persistent helpers ──────────────────────────────────────────────────────

function loadInstalledIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('branchboard:installedPlugins');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Filter out any non-string entries from corrupted data
        return parsed.filter((id): id is string => typeof id === 'string' && id.length > 0);
      }
    }
  } catch { /* ignore corrupt data */ }
  // Default: plugins that have isInstalled: true in the data
  try {
    return DESIGN_PLUGINS.filter((p) => p && typeof p.id === 'string').map((p) => p.id);
  } catch {
    return [];
  }
}

function saveInstalledIds(ids: string[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('branchboard:installedPlugins', JSON.stringify(ids));
  } catch { /* ignore */ }
}

// ─── State ───────────────────────────────────────────────────────────────────

interface AppState {
  viewMode: ViewMode;
  currentBoardId: string | null;
  rightPanelOpen: boolean;
  rightPanelTab: RightPanelTab;
  sidebarOpen: boolean;
  searchQuery: string;
  leftPanelOpen: boolean;
  leftPanelTab: LeftPanelTab;
  editorMode: EditorMode;
  pendingAIDesign: boolean;
  aiDesignDialogOpen: boolean;
  importDialogOpen: boolean;
  pluginDialogOpen: boolean;
  exportDialogOpen: boolean;
  autoInstallPluginIds: string[] | null;
  installedPluginIds: string[];
}

// ─── Actions ─────────────────────────────────────────────────────────────────

interface AppActions {
  setViewMode: (mode: ViewMode) => void;
  openBoard: (boardId: string) => void;
  closeBoard: () => void;
  toggleRightPanel: () => void;
  setRightPanelOpen: (open: boolean) => void;
  setRightPanelTab: (tab: RightPanelTab) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  toggleLeftPanel: () => void;
  setLeftPanelOpen: (open: boolean) => void;
  setLeftPanelTab: (tab: LeftPanelTab) => void;
  setEditorMode: (mode: EditorMode) => void;
  setPendingAIDesign: (v: boolean) => void;
  setAIDesignDialogOpen: (v: boolean) => void;
  setImportDialogOpen: (v: boolean) => void;
  setPluginDialogOpen: (v: boolean) => void;
  setExportDialogOpen: (v: boolean) => void;
  setAutoInstallPluginIds: (ids: string[] | null) => void;
  togglePluginInstalled: (id: string) => void;
  isPluginInstalled: (id: string) => boolean;
  getInstalledPluginIds: () => string[];
  reset: () => void;
}

// ─── Initial State ───────────────────────────────────────────────────────────

const initialState: AppState = {
  viewMode: 'dashboard',
  currentBoardId: null,
  rightPanelOpen: false,
  rightPanelTab: 'history',
  sidebarOpen: true,
  searchQuery: '',
  leftPanelOpen: false,
  leftPanelTab: 'layers',
  editorMode: 'design',
  pendingAIDesign: false,
  aiDesignDialogOpen: false,
  importDialogOpen: false,
  pluginDialogOpen: false,
  exportDialogOpen: false,
  autoInstallPluginIds: null,
  installedPluginIds: [],
};

// ─── Store ───────────────────────────────────────────────────────────────────

export type AppStore = AppState & AppActions;

// Load persisted plugin IDs on client
let _initialInstalledIds: string[] = [];
if (typeof window !== 'undefined') {
  _initialInstalledIds = loadInstalledIds();
}

export const useAppStore = create<AppStore>((set, get) => ({
  ...initialState,
  installedPluginIds: _initialInstalledIds,

  setViewMode: (mode) => set({ viewMode: mode }),

  openBoard: (boardId) =>
    set({
      currentBoardId: boardId,
      viewMode: 'editor',
      rightPanelOpen: true,
    }),

  closeBoard: () =>
    set({
      currentBoardId: null,
      viewMode: 'dashboard',
      rightPanelOpen: false,
    }),

  toggleRightPanel: () =>
    set((state) => ({ rightPanelOpen: !state.rightPanelOpen })),

  setRightPanelOpen: (open) => set({ rightPanelOpen: open }),

  setRightPanelTab: (tab) =>
    set({ rightPanelTab: tab, rightPanelOpen: true }),

  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  toggleLeftPanel: () =>
    set((state) => ({ leftPanelOpen: !state.leftPanelOpen })),

  setLeftPanelOpen: (open) => set({ leftPanelOpen: open }),

  setLeftPanelTab: (tab) => set({ leftPanelTab: tab, leftPanelOpen: true }),

  setEditorMode: (mode) => set({ editorMode: mode }),

  setPendingAIDesign: (v) => set({ pendingAIDesign: v }),

  setAIDesignDialogOpen: (v) => set({ aiDesignDialogOpen: v }),

  setImportDialogOpen: (v) => set({ importDialogOpen: v }),

  setPluginDialogOpen: (v) => set({ pluginDialogOpen: v }),

  setExportDialogOpen: (v) => set({ exportDialogOpen: v }),

  setAutoInstallPluginIds: (ids) => set({ autoInstallPluginIds: ids }),

  togglePluginInstalled: (id) => {
    const current = get().installedPluginIds;
    let next: string[];
    if (current.includes(id)) {
      next = current.filter((i) => i !== id);
    } else {
      next = [...current, id];
    }
    set({ installedPluginIds: next });
    saveInstalledIds(next);
  },

  isPluginInstalled: (id) => get().installedPluginIds.includes(id),

  getInstalledPluginIds: () => get().installedPluginIds,

  reset: () => set(initialState),
}));