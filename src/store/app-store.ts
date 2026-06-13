import { create } from 'zustand';
import type { ViewMode, RightPanelTab, EditorMode, LeftPanelTab } from '@/lib/types';

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

  reset: () => set(initialState),
}));