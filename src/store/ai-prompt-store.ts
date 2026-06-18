import { create } from 'zustand';
import type { BoardElement } from '@/lib/types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  elements?: BoardElement[];
}

export interface AiModel {
  id: string;
  name: string;
  provider: string;
  icon: string;
}

// ─── State ────────────────────────────────────────────────────────────────────

interface AiPromptState {
  messages: AiMessage[];
  isGenerating: boolean;
  selectedModel: string;
  availableModels: AiModel[];

  // CRUD operations
  addMessage: (message: Omit<AiMessage, 'id' | 'timestamp'>) => void;
  updateMessage: (id: string, updates: Partial<Pick<AiMessage, 'content' | 'elements'>>) => void;
  updateLastAssistantMessage: (content: string, elements?: BoardElement[]) => void;
  deleteMessage: (id: string) => void;
  removeLastMessage: () => void;
  editMessage: (id: string, newContent: string) => void;

  // State management
  setGenerating: (v: boolean) => void;
  setModel: (id: string) => void;
  clearMessages: () => void;
  loadPersistedMessages: () => void;
}

// ─── Persistence ──────────────────────────────────────────────────────────────

const STORAGE_KEY = 'layerboard-ai-chat';

function persistMessages(messages: AiMessage[]) {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  } catch {
    // Storage full or unavailable
  }
}

function loadPersistedMessages(): AiMessage[] {
  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    }
  } catch {
    // Corrupted data
  }
  return [];
}

// ─── Models ───────────────────────────────────────────────────────────────────

const AVAILABLE_MODELS: AiModel[] = [
  { id: 'gpt-4', name: 'GPT-4o', provider: 'OpenAI', icon: 'openai' },
  { id: 'claude-sonnet', name: 'Claude Sonnet', provider: 'Anthropic', icon: 'anthropic' },
  { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google', icon: 'google' },
  { id: 'local', name: 'Local Model', provider: 'Local', icon: 'cpu' },
  { id: 'custom', name: 'Custom Endpoint', provider: 'Custom', icon: 'settings' },
];

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAiPromptStore = create<AiPromptState>((set, get) => ({
  messages: [],
  isGenerating: false,
  selectedModel: 'gpt-4',
  availableModels: AVAILABLE_MODELS,

  // Load persisted messages from localStorage
  loadPersistedMessages: () => {
    const persisted = loadPersistedMessages();
    if (persisted.length > 0) {
      set({ messages: persisted });
    }
  },

  addMessage: (message) =>
    set((s) => {
      const newMessages = [
        ...s.messages,
        {
          ...message,
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          timestamp: Date.now(),
        },
      ];
      persistMessages(newMessages);
      return { messages: newMessages };
    }),

  // Update any specific message by ID (CRUD Update)
  updateMessage: (id, updates) =>
    set((s) => {
      const newMessages = s.messages.map((m) =>
        m.id === id ? { ...m, ...updates } : m,
      );
      persistMessages(newMessages);
      return { messages: newMessages };
    }),

  updateLastAssistantMessage: (content, elements) =>
    set((s) => {
      const msgs = [...s.messages];
      for (let i = msgs.length - 1; i >= 0; i--) {
        if (msgs[i].role === 'assistant') {
          msgs[i] = { ...msgs[i], content, elements };
          break;
        }
      }
      persistMessages(msgs);
      return { messages: msgs };
    }),

  // Delete any specific message by ID (CRUD Delete)
  deleteMessage: (id) =>
    set((s) => {
      const newMessages = s.messages.filter((m) => m.id !== id);
      persistMessages(newMessages);
      return { messages: newMessages };
    }),

  removeLastMessage: () =>
    set((s) => {
      const newMessages = s.messages.length > 0 ? s.messages.slice(0, -1) : [];
      persistMessages(newMessages);
      return { messages: newMessages };
    }),

  // Edit a user message and remove all subsequent messages (CRUD Update + cascade)
  editMessage: (id, newContent) =>
    set((s) => {
      const idx = s.messages.findIndex((m) => m.id === id);
      if (idx === -1) return s;
      // Truncate conversation from this message onward, then replace content
      const newMessages = [
        ...s.messages.slice(0, idx),
        {
          ...s.messages[idx],
          content: newContent,
          timestamp: Date.now(),
        },
      ];
      persistMessages(newMessages);
      return { messages: newMessages };
    }),

  setGenerating: (v) => set({ isGenerating: v }),

  setModel: (id) => set({ selectedModel: id }),

  clearMessages: () => {
    persistMessages([]);
    set({ messages: [] });
  },
}));