import { create } from 'zustand';
import type { ViewMode, RightPanelTab } from '@/lib/types';

// ─── State ───────────────────────────────────────────────────────────────────

interface AppState {
  viewMode: ViewMode;
  currentBoardId: string | null;
  rightPanelOpen: boolean;
  rightPanelTab: RightPanelTab;
  sidebarOpen: boolean;
  searchQuery: string;
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
};

// ─── Store ───────────────────────────────────────────────────────────────────

export type AppStore = AppState & AppActions;

export const useAppStore = create<AppStore>((set) => ({
  ...initialState,

  setViewMode: (mode) => set({ viewMode: mode }),

  openBoard: (boardId) =>
    set({
      currentBoardId: boardId,
      viewMode: 'editor',
      rightPanelOpen: false,
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

  reset: () => set(initialState),
}));