import { create } from 'zustand';
import {
  type BoardElement,
  type CanvasTool,
  type SelectionBox,
  type ConnectorStyle,
  createDefaultElement,
  type ElementType,
  SNAP_THRESHOLD,
  type StickyColor,
  STICKY_COLORS,
} from '@/lib/types';

interface HistoryEntry {
  elements: BoardElement[];
}

interface CanvasState {
  // Elements
  elements: BoardElement[];
  selectedIds: string[];
  activeTool: CanvasTool;
  snapToGrid: boolean;

  // Viewport
  panX: number;
  panY: number;
  zoom: number;

  // Clipboard
  clipboard: BoardElement[];

  // History
  history: HistoryEntry[];
  historyIndex: number;
  maxHistory: number;

  // UI state
  selectionBox: SelectionBox | null;
  isDrawingSelection: boolean;
  spacePressed: boolean;
  showMinimap: boolean;
  stickyColor: StickyColor;
  connectorStyle: ConnectorStyle;

  // Actions - Elements
  addElement: (type: ElementType, x: number, y: number, overrides?: Partial<BoardElement>) => BoardElement;
  updateElement: (id: string, updates: Partial<BoardElement>) => void;
  updateElementStyles: (id: string, styles: Record<string, unknown>) => void;
  moveElement: (id: string, x: number, y: number) => void;
  resizeElement: (id: string, x: number, y: number, width: number, height: number) => void;
  rotateElement: (id: string, rotation: number) => void;
  deleteElements: (ids?: string[]) => void;
  setElementZIndex: (id: string, zIndex: number) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  toggleLock: (id: string) => void;
  groupElements: (ids: string[]) => void;
  ungroupElements: (groupId: string) => void;

  // Actions - Selection
  selectElement: (id: string, multi?: boolean) => void;
  deselectAll: () => void;
  selectAll: () => void;
  setSelectionBox: (box: SelectionBox | null) => void;
  setIsDrawingSelection: (v: boolean) => void;

  // Actions - Viewport
  setPan: (x: number, y: number) => void;
  setZoom: (zoom: number) => void;
  zoomToFit: () => void;
  zoomIn: () => void;
  zoomOut: () => void;

  // Actions - Tools
  setTool: (tool: CanvasTool) => void;
  setSnapToGrid: (v: boolean) => void;
  setStickyColor: (color: StickyColor) => void;
  setConnectorStyle: (style: ConnectorStyle) => void;
  toggleMinimap: () => void;

  // Actions - Space
  setSpacePressed: (v: boolean) => void;

  // Actions - Clipboard
  copySelected: () => void;
  pasteClipboard: () => void;

  // Actions - History
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;

  // Actions - Bulk
  setElements: (elements: BoardElement[]) => void;
  loadElements: (elements: BoardElement[]) => void;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  elements: [],
  selectedIds: [],
  activeTool: 'SELECT',
  snapToGrid: true,

  panX: 0,
  panY: 0,
  zoom: 1,

  clipboard: [],

  history: [{ elements: [] }],
  historyIndex: 0,
  maxHistory: 100,

  selectionBox: null,
  isDrawingSelection: false,
  spacePressed: false,
  showMinimap: false,
  stickyColor: 'yellow',
  connectorStyle: 'curve',

  // Elements
  addElement: (type, x, y, overrides) => {
    const state = get();
    const snap = state.snapToGrid;
    const sx = snap ? Math.round(x / SNAP_THRESHOLD) * SNAP_THRESHOLD : x;
    const sy = snap ? Math.round(y / SNAP_THRESHOLD) * SNAP_THRESHOLD : y;
    const overridesWithColor =
      type === 'STICKY_NOTE'
        ? { ...overrides, color: STICKY_COLORS[state.stickyColor] }
        : overrides;
    const element = createDefaultElement(type, sx, sy, overridesWithColor);
    set((s) => ({
      elements: [...s.elements, element],
      selectedIds: [element.id],
      activeTool: 'SELECT',
    }));
    get().pushHistory();
    return element;
  },

  updateElement: (id, updates) => {
    set((s) => ({
      elements: s.elements.map((el) => (el.id === id ? { ...el, ...updates } : el)),
    }));
  },

  updateElementStyles: (id, styles) => {
    set((s) => ({
      elements: s.elements.map((el) =>
        el.id === id ? { ...el, styles: { ...el.styles, ...styles } } : el,
      ),
    }));
  },

  moveElement: (id, x, y) => {
    const state = get();
    const snap = state.snapToGrid;
    const sx = snap ? Math.round(x / SNAP_THRESHOLD) * SNAP_THRESHOLD : x;
    const sy = snap ? Math.round(y / SNAP_THRESHOLD) * SNAP_THRESHOLD : y;

    set((s) => {
      const el = s.elements.find((e) => e.id === id);
      if (!el) return s;

      let dx = sx - el.x;
      let dy = sy - el.y;

      const updatedElements = s.elements.map((e) => {
        if (e.id === id) return { ...e, x: sx, y: sy };
        if (el.groupId && e.groupId === el.groupId) {
          return { ...e, x: e.x + dx, y: e.y + dy };
        }
        return e;
      });
      return { elements: updatedElements };
    });
  },

  resizeElement: (id, x, y, width, height) => {
    set((s) => ({
      elements: s.elements.map((el) =>
        el.id === id ? { ...el, x, y, width: Math.max(10, width), height: Math.max(10, height) } : el,
      ),
    }));
  },

  rotateElement: (id, rotation) => {
    set((s) => ({
      elements: s.elements.map((el) => (el.id === id ? { ...el, rotation } : el)),
    }));
  },

  deleteElements: (ids) => {
    const state = get();
    const toDelete = ids ?? state.selectedIds;
    set((s) => ({
      elements: s.elements.filter((el) => !toDelete.includes(el.id)),
      selectedIds: s.selectedIds.filter((id) => !toDelete.includes(id)),
    }));
    get().pushHistory();
  },

  setElementZIndex: (id, zIndex) => {
    set((s) => ({
      elements: s.elements.map((el) => (el.id === id ? { ...el, zIndex } : el)),
    }));
  },

  bringToFront: (id) => {
    set((s) => {
      const maxZ = Math.max(...s.elements.map((e) => e.zIndex), 0);
      return {
        elements: s.elements.map((el) => (el.id === id ? { ...el, zIndex: maxZ + 1 } : el)),
      };
    });
  },

  sendToBack: (id) => {
    set((s) => {
      const minZ = Math.min(...s.elements.map((e) => e.zIndex), 0);
      return {
        elements: s.elements.map((el) => (el.id === id ? { ...el, zIndex: minZ - 1 } : el)),
      };
    });
  },

  toggleLock: (id) => {
    set((s) => ({
      elements: s.elements.map((el) => (el.id === id ? { ...el, locked: !el.locked } : el)),
    }));
  },

  groupElements: (ids) => {
    if (ids.length < 2) return;
    const groupId = `group-${Date.now()}`;
    set((s) => ({
      elements: s.elements.map((el) =>
        ids.includes(el.id) ? { ...el, groupId } : el,
      ),
    }));
    get().pushHistory();
  },

  ungroupElements: (groupId) => {
    set((s) => ({
      elements: s.elements.map((el) =>
        el.groupId === groupId ? { ...el, groupId: null } : el,
      ),
    }));
    get().pushHistory();
  },

  // Selection
  selectElement: (id, multi = false) => {
    const state = get();
    const el = state.elements.find((e) => e.id === id);
    if (!el || el.locked) return;

    if (multi) {
      set((s) => ({
        selectedIds: s.selectedIds.includes(id)
          ? s.selectedIds.filter((i) => i !== id)
          : [...s.selectedIds, id],
      }));
    } else {
      set({ selectedIds: [id] });
    }
  },

  deselectAll: () => set({ selectedIds: [] }),
  selectAll: () => set((s) => ({ selectedIds: s.elements.map((e) => e.id) })),
  setSelectionBox: (box) => set({ selectionBox: box }),
  setIsDrawingSelection: (v) => set({ isDrawingSelection: v }),

  // Viewport
  setPan: (x, y) => set({ panX: x, panY: y }),
  setZoom: (zoom) =>
    set({ zoom: Math.min(5, Math.max(0.1, zoom)) }),
  zoomToFit: () => {
    const state = get();
    if (state.elements.length === 0) {
      set({ panX: 0, panY: 0, zoom: 1 });
      return;
    }
    const minX = Math.min(...state.elements.map((e) => e.x));
    const minY = Math.min(...state.elements.map((e) => e.y));
    const maxX = Math.max(...state.elements.map((e) => e.x + e.width));
    const maxY = Math.max(...state.elements.map((e) => e.y + e.height));
    const contentW = maxX - minX + 100;
    const contentH = maxY - minY + 100;
    const vw = window.innerWidth - 80;
    const vh = window.innerHeight - 80;
    const zoom = Math.min(vw / contentW, vh / contentH, 2);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    set({
      zoom: Math.max(0.1, Math.min(5, zoom)),
      panX: vw / 2 - cx * zoom,
      panY: vh / 2 - cy * zoom,
    });
  },
  zoomIn: () => {
    const state = get();
    const newZoom = Math.min(5, state.zoom + 0.15);
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const ratio = newZoom / state.zoom;
    set({
      zoom: newZoom,
      panX: cx - (cx - state.panX) * ratio,
      panY: cy - (cy - state.panY) * ratio,
    });
  },
  zoomOut: () => {
    const state = get();
    const newZoom = Math.max(0.1, state.zoom - 0.15);
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const ratio = newZoom / state.zoom;
    set({
      zoom: newZoom,
      panX: cx - (cx - state.panX) * ratio,
      panY: cy - (cy - state.panY) * ratio,
    });
  },

  // Tools
  setTool: (tool) => set({ activeTool: tool }),
  setSnapToGrid: (v) => set({ snapToGrid: v }),
  setStickyColor: (color) => set({ stickyColor: color }),
  setConnectorStyle: (style) => set({ connectorStyle: style }),
  toggleMinimap: () => set((s) => ({ showMinimap: !s.showMinimap })),

  // Space
  setSpacePressed: (v) => set({ spacePressed: v }),

  // Clipboard
  copySelected: () => {
    const state = get();
    const copied = state.elements
      .filter((el) => state.selectedIds.includes(el.id))
      .map((el) => ({ ...el }));
    set({ clipboard: copied });
  },

  pasteClipboard: () => {
    const state = get();
    if (state.clipboard.length === 0) return;

    const offset = 20;
    const newIds: string[] = [];
    const newElements: BoardElement[] = state.clipboard.map((el) => {
      const newEl = {
        ...el,
        id: `el-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        x: el.x + offset,
        y: el.y + offset,
        groupId: null,
      };
      newIds.push(newEl.id);
      return newEl;
    });

    set((s) => ({
      elements: [...s.elements, ...newElements],
      selectedIds: newIds,
    }));
    get().pushHistory();
  },

  // History
  undo: () => {
    const state = get();
    if (state.historyIndex <= 0) return;
    const newIndex = state.historyIndex - 1;
    const entry = state.history[newIndex];
    set({
      historyIndex: newIndex,
      elements: entry.elements.map((e) => ({ ...e })),
      selectedIds: [],
    });
  },

  redo: () => {
    const state = get();
    if (state.historyIndex >= state.history.length - 1) return;
    const newIndex = state.historyIndex + 1;
    const entry = state.history[newIndex];
    set({
      historyIndex: newIndex,
      elements: entry.elements.map((e) => ({ ...e })),
      selectedIds: [],
    });
  },

  pushHistory: () => {
    set((s) => {
      const newHistory = s.history.slice(0, s.historyIndex + 1);
      newHistory.push({ elements: s.elements.map((e) => ({ ...e })) });
      if (newHistory.length > s.maxHistory) {
        newHistory.shift();
        return { history: newHistory, historyIndex: newHistory.length - 1 };
      }
      return { history: newHistory, historyIndex: s.historyIndex + 1 };
    });
  },

  // Bulk
  setElements: (elements) => set({ elements }),
  loadElements: (elements) => {
    set({
      elements,
      selectedIds: [],
      history: [{ elements: elements.map((e) => ({ ...e })) }],
      historyIndex: 0,
    });
  },
}));