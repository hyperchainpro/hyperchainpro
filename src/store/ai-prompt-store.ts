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

  addMessage: (message: Omit<AiMessage, 'id' | 'timestamp'>) => void;
  updateLastAssistantMessage: (content: string, elements?: BoardElement[]) => void;
  removeLastMessage: () => void;
  setGenerating: (v: boolean) => void;
  setModel: (id: string) => void;
  clearMessages: () => void;
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

export const useAiPromptStore = create<AiPromptState>((set) => ({
  messages: [],
  isGenerating: false,
  selectedModel: 'gpt-4',
  availableModels: AVAILABLE_MODELS,

  addMessage: (message) =>
    set((s) => ({
      messages: [
        ...s.messages,
        {
          ...message,
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          timestamp: Date.now(),
        },
      ],
    })),

  updateLastAssistantMessage: (content, elements) =>
    set((s) => {
      const msgs = [...s.messages];
      for (let i = msgs.length - 1; i >= 0; i--) {
        if (msgs[i].role === 'assistant') {
          msgs[i] = { ...msgs[i], content, elements };
          break;
        }
      }
      return { messages: msgs };
    }),

  removeLastMessage: () =>
    set((s) => ({
      messages: s.messages.length > 0 ? s.messages.slice(0, -1) : [],
    })),

  setGenerating: (v) => set({ isGenerating: v }),

  setModel: (id) => set({ selectedModel: id }),

  clearMessages: () => set({ messages: [] }),
}));