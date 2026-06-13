import { create } from 'zustand';
import type { PrototypeInteraction } from '@/lib/types';

interface PrototypeState {
  interactions: PrototypeInteraction[];
  startFrameId: string | null;
  isPlaying: boolean;
  currentPlayFrameId: string | null;
  playHistory: string[];
  selectedInteractionId: string | null;
}

interface PrototypeActions {
  loadInteractions: (interactions: PrototypeInteraction[]) => void;
  addInteraction: (interaction: PrototypeInteraction) => void;
  updateInteraction: (id: string, updates: Partial<PrototypeInteraction>) => void;
  removeInteraction: (id: string) => void;
  setStartFrame: (frameId: string) => void;
  selectInteraction: (id: string | null) => void;
  startPlayback: (startFrameId: string) => void;
  stopPlayback: () => void;
  navigateToFrame: (frameId: string) => void;
  goBack: () => void;
  getInteractionsForFrame: (frameId: string) => PrototypeInteraction[];
  reset: () => void;
}

export const usePrototypeStore = create<PrototypeState & PrototypeActions>((set, get) => ({
  interactions: [],
  startFrameId: null,
  isPlaying: false,
  currentPlayFrameId: null,
  playHistory: [],
  selectedInteractionId: null,

  loadInteractions: (interactions) => set({ interactions }),

  addInteraction: (interaction) => set((s) => ({ interactions: [...s.interactions, interaction] })),

  updateInteraction: (id, updates) =>
    set((s) => ({
      interactions: s.interactions.map((i) => (i.id === id ? { ...i, ...updates } : i)),
    })),

  removeInteraction: (id) =>
    set((s) => ({
      interactions: s.interactions.filter((i) => i.id !== id),
      selectedInteractionId: s.selectedInteractionId === id ? null : s.selectedInteractionId,
    })),

  setStartFrame: (frameId) => set({ startFrameId: frameId }),

  selectInteraction: (id) => set({ selectedInteractionId: id }),

  startPlayback: (startFrameId) =>
    set({ isPlaying: true, currentPlayFrameId: startFrameId, playHistory: [startFrameId] }),

  stopPlayback: () =>
    set({ isPlaying: false, currentPlayFrameId: null, playHistory: [] }),

  navigateToFrame: (frameId) =>
    set((s) => ({
      currentPlayFrameId: frameId,
      playHistory: [...s.playHistory, frameId],
    })),

  goBack: () =>
    set((s) => {
      const history = [...s.playHistory];
      history.pop();
      const prev = history[history.length - 1] || null;
      return { currentPlayFrameId: prev, playHistory: history };
    }),

  getInteractionsForFrame: (frameId) => get().interactions.filter((i) => i.sourceFrameId === frameId),

  reset: () => set({
    interactions: [],
    startFrameId: null,
    isPlaying: false,
    currentPlayFrameId: null,
    playHistory: [],
    selectedInteractionId: null,
  }),
}));