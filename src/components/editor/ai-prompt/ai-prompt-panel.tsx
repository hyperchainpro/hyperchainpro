'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Wand2,
  Send,
  ChevronDown,
  Trash2,
  RefreshCw,
  Layers,
  LayoutGrid,
  Sparkles,
  Type,
  MousePointerClick,
  Cpu,
  Globe,
  Settings,
  Bot,
  CircleDot,
  Pencil,
  Check,
  X,
  ArrowDownToLine,
  Copy,
  Square,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/auth-store';
import { useAiPromptStore, type AiMessage } from '@/store/ai-prompt-store';
import { useCanvasStore } from '@/store/canvas-store';
import { useComponentStore } from '@/store/component-store';
import { t, type Locale } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { BoardElement } from '@/lib/types';

// ─── Suggestion cards ────────────────────────────────────────────────────────

const SUGGESTION_CARDS = [
  { icon: '🔐', label: 'Create a login form', prompt: 'Create a login form with email and password fields, a login button, and a "Forgot password" link. Use a clean, modern style.' },
  { icon: '💳', label: 'Design pricing cards', prompt: 'Design 3 pricing tier cards (Basic, Pro, Enterprise) side by side with feature lists, prices, and CTA buttons. Highlight the Pro tier.' },
  { icon: '🧭', label: 'Generate a navbar', prompt: 'Generate a horizontal navigation bar with a logo on the left, navigation links in the center, and a CTA button on the right.' },
  { icon: '📊', label: 'Dashboard layout', prompt: 'Create a dashboard layout with a sidebar, header, and 4 chart placeholder cards arranged in a 2x2 grid. Use professional colors.' },
  { icon: '📱', label: 'Mobile onboarding', prompt: 'Design a mobile onboarding screen (375×812) with a welcome illustration area, title, subtitle, and a "Get Started" button at the bottom.' },
  { icon: '📝', label: 'Contact form', prompt: 'Design a contact form section with name, email, subject, and message fields, plus a submit button. Use proper spacing and labels.' },
];

// ─── Quick action chips ──────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { key: 'generateUI', icon: LayoutGrid, prompt: 'Generate a UI component. What would you like me to create?' },
  { key: 'generateIcon', icon: Sparkles, prompt: 'Generate an icon design. Please describe the icon you need.' },
  { key: 'suggestLayout', icon: MousePointerClick, prompt: 'Analyze the current canvas and suggest a better layout arrangement.' },
  { key: 'refineSelection', icon: CircleDot, prompt: 'Refine the currently selected elements. Suggest improvements for spacing, colors, and typography.' },
  { key: 'addText', icon: Type, prompt: 'Generate text content for the design. What kind of text do you need?' },
] as const;

// ─── Model icons ──────────────────────────────────────────────────────────────

function ModelIcon({ icon, className }: { icon: string; className?: string }) {
  switch (icon) {
    case 'openai':
      return <Globe className={cn('size-3', className)} />;
    case 'anthropic':
      return <Bot className={cn('size-3', className)} />;
    case 'google':
      return <Sparkles className={cn('size-3', className)} />;
    case 'cpu':
      return <Cpu className={cn('size-3', className)} />;
    case 'settings':
      return <Settings className={cn('size-3', className)} />;
    default:
      return <Bot className={cn('size-3', className)} />;
  }
}

// ─── Typing Indicator ────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="flex items-start gap-1.5 max-w-[85%]"
    >
      <div className="neu-flat bg-background text-foreground rounded-2xl rounded-bl-sm border border-border/30 px-4 py-3 flex items-center gap-1">
        <motion.span
          className="size-1.5 rounded-full bg-muted-foreground/50"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut', delay: 0 }}
        />
        <motion.span
          className="size-1.5 rounded-full bg-muted-foreground/50"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
        />
        <motion.span
          className="size-1.5 rounded-full bg-muted-foreground/50"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        />
      </div>
    </motion.div>
  );
}

// ─── Message Action Button ───────────────────────────────────────────────────

function ActionBtn({
  onClick,
  title,
  children,
  danger,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        'h-6 w-6 flex items-center justify-center rounded-md transition-all duration-200',
        'text-muted-foreground hover:text-foreground',
        danger
          ? 'hover:bg-destructive/10 hover:text-destructive'
          : 'hover:bg-foreground/[0.06]',
      )}
    >
      {children}
    </button>
  );
}

// ─── Message Bubble ──────────────────────────────────────────────────────────

function MessageBubble({
  message,
  locale,
  onApply,
  onSaveComponent,
  onRegenerate,
  onEdit,
  onDelete,
  onCopy,
}: {
  message: AiMessage;
  locale: Locale;
  onApply: () => void;
  onSaveComponent: () => void;
  onRegenerate: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCopy: () => void;
}) {
  const isUser = message.role === 'user';
  const hasElements = (message.elements?.length ?? 0) > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn('group/msg flex flex-col gap-1', isUser ? 'items-end' : 'items-start')}
    >
      {/* Role indicator */}
      <div className="flex items-center gap-1.5 px-1 w-full">
        {isUser ? (
          <>
            <span className="text-[10px] text-muted-foreground font-medium">You</span>
            <div className="size-1.5 rounded-full bg-primary" />
          </>
        ) : (
          <>
            <div className="flex items-center justify-center size-4 rounded-md bg-primary/10">
              <Wand2 className="size-2.5 text-primary" />
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">AI Assist</span>
          </>
        )}
        <div className="flex-1" />
        {/* Hover-revealed actions */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover/msg:opacity-100 transition-opacity duration-200">
          {isUser ? (
            <ActionBtn onClick={onEdit} title={t('common.edit', locale)}>
              <Pencil className="size-3" />
            </ActionBtn>
          ) : (
            <>
              <ActionBtn onClick={onCopy} title={t('common.copy', locale)}>
                <Copy className="size-3" />
              </ActionBtn>
              <ActionBtn onClick={onRegenerate} title={t('aiPrompt.regenerate', locale)}>
                <RefreshCw className="size-3" />
              </ActionBtn>
              {hasElements && (
                <>
                  <ActionBtn onClick={onApply} title={t('aiPrompt.applyToCanvas', locale)}>
                    <ArrowDownToLine className="size-3" />
                  </ActionBtn>
                  <ActionBtn onClick={onSaveComponent} title={t('aiPrompt.applyAsComponent', locale)}>
                    <Layers className="size-3" />
                  </ActionBtn>
                </>
              )}
            </>
          )}
          <ActionBtn onClick={onDelete} title={t('common.delete', locale)} danger>
            <Trash2 className="size-3" />
          </ActionBtn>
        </div>
      </div>

      {/* Content bubble */}
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed break-words whitespace-pre-wrap select-text',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-sm shadow-sm'
            : 'neu-flat bg-background text-foreground rounded-bl-sm border border-border/30',
        )}
      >
        {message.content}
      </div>

      {/* Elements preview badge */}
      {hasElements && (
        <div className="flex items-center gap-1 px-1.5">
          <Layers className="size-3 text-primary/60" />
          <span className="text-[10px] text-muted-foreground">
            {message.elements!.length} element{message.elements!.length > 1 ? 's' : ''} generated
          </span>
        </div>
      )}
    </motion.div>
  );
}

// ─── Edit message inline ────────────────────────────────────────────────────

function EditMessageInline({
  initialContent,
  onSave,
  onCancel,
  locale,
}: {
  initialContent: string;
  onSave: (newContent: string) => void;
  onCancel: () => void;
  locale: Locale;
}) {
  const valueState = useState(initialContent);
  const value = valueState[0];
  const setValue = valueState[1];
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
    textareaRef.current?.select();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.15 }}
      className="flex flex-col gap-2 p-2.5 rounded-xl border border-primary/30 bg-primary/[0.03] shadow-sm"
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={3}
        className="w-full resize-none bg-transparent text-xs outline-none placeholder:text-muted-foreground min-h-[60px]"
      />
      <div className="flex items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2.5 text-[10px] gap-1"
          onClick={onCancel}
        >
          <X className="size-3" />
          {t('common.cancel', locale)}
        </Button>
        <Button
          size="sm"
          className="h-6 px-2.5 text-[10px] gap-1"
          onClick={() => {
            if (value.trim()) onSave(value.trim());
          }}
          disabled={!value.trim()}
        >
          <Check className="size-3" />
          {t('common.save', locale)}
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Suggestion Card (polished) ─────────────────────────────────────────────

function SuggestionCard({
  icon,
  label,
  onClick,
  index,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  index: number;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: 'easeOut' }}
      onClick={onClick}
      className={cn(
        'relative overflow-hidden neu-flat bg-background rounded-xl p-3 text-left',
        'border border-border/30 cursor-pointer group/card',
        'transition-all duration-300 ease-out',
        'hover:-translate-y-0.5 hover:border-primary/30',
        'hover:shadow-[4px_4px_10px_rgba(0,0,0,0.06),-3px_-3px_8px_rgba(255,255,255,0.5)]',
        'dark:hover:shadow-[4px_4px_10px_rgba(0,0,0,0.4),-3px_-3px_8px_rgba(40,40,40,0.1)]',
      )}
    >
      {/* Shimmer overlay on hover */}
      <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
        <div
          className={cn(
            'absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500',
            'bg-gradient-to-r from-transparent via-white/30 to-transparent',
          )}
          style={{
            transform: 'translateX(-100%)',
            backgroundSize: '200% 100%',
            animation: 'none',
          }}
        />
      </div>
      {/* Glow ring on hover */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 pointer-events-none ring-1 ring-primary/10" />
      <div className="flex items-start gap-2.5 relative z-10">
        <span className="text-lg leading-none shrink-0 mt-0.5 group-hover/card:scale-110 transition-transform duration-300">
          {icon}
        </span>
        <span className="text-[12px] text-foreground/70 group-hover/card:text-foreground leading-snug transition-colors duration-200">
          {label}
        </span>
      </div>
    </motion.button>
  );
}

// ─── Welcome Empty State ────────────────────────────────────────────────────

function WelcomeEmptyState({
  locale,
  onSuggestionClick,
}: {
  locale: Locale;
  onSuggestionClick: (prompt: string) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-5 p-4 pt-8 h-full">
      {/* Large icon + greeting */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex flex-col items-center gap-3 text-center"
      >
        <div className="relative">
          <div className="flex items-center justify-center size-14 rounded-2xl bg-primary/10 neu-convex">
            <Wand2 className="size-7 text-primary" />
          </div>
          <motion.div
            className="absolute -top-0.5 -right-0.5 size-4 rounded-full bg-primary flex items-center justify-center"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sparkles className="size-2.5 text-primary-foreground" />
          </motion.div>
        </div>
        <div className="flex flex-col gap-1.5">
          <h3 className="text-sm font-semibold text-foreground">
            {t('aiPrompt.title', locale)}
          </h3>
          <p className="text-[11px] text-muted-foreground leading-relaxed max-w-[200px]">
            {t('aiPrompt.welcome', locale)}
          </p>
        </div>
      </motion.div>

      {/* Suggestion cards */}
      <div className="w-full flex flex-col gap-2">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1">
          {t('aiPrompt.suggestions', locale)}
        </p>
        <div className="flex flex-col gap-1.5">
          {SUGGESTION_CARDS.map((card, idx) => (
            <SuggestionCard
              key={idx}
              icon={card.icon}
              label={card.label}
              onClick={() => onSuggestionClick(card.prompt)}
              index={idx}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Scroll-to-bottom FAB ───────────────────────────────────────────────────

function ScrollToBottomFab({
  onClick,
  locale,
}: {
  onClick: () => void;
  locale: Locale;
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.15 }}
        className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10"
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onClick}
              className={cn(
                'neu-flat flex items-center justify-center',
                'size-7 rounded-full border border-border/30',
                'text-muted-foreground hover:text-foreground',
                'transition-colors duration-200',
                'shadow-sm',
              )}
            >
              <ChevronDown className="size-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">{t('aiPrompt.scrollToBottom', locale)}</TooltipContent>
        </Tooltip>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function AiPromptPanel() {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';

  // Proper individual selectors
  const messages = useAiPromptStore((s) => s.messages);
  const isGenerating = useAiPromptStore((s) => s.isGenerating);
  const selectedModel = useAiPromptStore((s) => s.selectedModel);
  const availableModels = useAiPromptStore((s) => s.availableModels);
  const addMessage = useAiPromptStore((s) => s.addMessage);
  const updateLastAssistantMessage = useAiPromptStore((s) => s.updateLastAssistantMessage);
  const editMessage = useAiPromptStore((s) => s.editMessage);
  const deleteMessage = useAiPromptStore((s) => s.deleteMessage);
  const removeLastMessage = useAiPromptStore((s) => s.removeLastMessage);
  const setGenerating = useAiPromptStore((s) => s.setGenerating);
  const setModel = useAiPromptStore((s) => s.setModel);
  const clearMessages = useAiPromptStore((s) => s.clearMessages);
  const loadPersistedMessages = useAiPromptStore((s) => s.loadPersistedMessages);

  const canvasElements = useCanvasStore((s) => s.elements);
  const selectedIds = useCanvasStore((s) => s.selectedIds);
  const setElements = useCanvasStore((s) => s.setElements);
  const pushHistory = useCanvasStore((s) => s.pushHistory);

  const inputValueState = useState('');
  const inputValue = inputValueState[0];
  const setInputValue = inputValueState[1];
  const collapsedState = useState(false);
  const collapsed = collapsedState[0];
  const setCollapsed = collapsedState[1];
  const editingMessageIdState = useState<string | null>(null);
  const editingMessageId = editingMessageIdState[0];
  const setEditingMessageId = editingMessageIdState[1];

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Scroll tracking
  const isAtBottomState = useState(true);
  const isAtBottom = isAtBottomState[0];
  const setIsAtBottom = isAtBottomState[1];

  // Toast feedback state
  const copiedIdState = useState<string | null>(null);
  const copiedId = copiedIdState[0];
  const setCopiedId = copiedIdState[1];

  // Load persisted messages on mount
  useEffect(() => {
    loadPersistedMessages();
  }, [loadPersistedMessages]);

  // Auto-scroll to bottom when new messages arrive or generating changes
  useEffect(() => {
    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isGenerating, isAtBottom]);

  // Auto-resize textarea
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 80)}px`;
  }, [inputValue]);

  // ── Scroll tracking ────────────────────────────────────────────────────

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
    setIsAtBottom(atBottom);
  }, [setIsAtBottom]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setIsAtBottom(true);
  }, [setIsAtBottom]);

  // ── Copy message content ───────────────────────────────────────────────

  const handleCopy = useCallback(
    (msgId: string, content: string) => {
      navigator.clipboard.writeText(content).catch(() => {});
      setCopiedId(msgId);
      setTimeout(() => setCopiedId(null), 1500);
    },
    [setCopiedId],
  );

  // ── Send prompt with conversation history ──────────────────────────────

  const sendPrompt = useCallback(
    async (prompt: string) => {
      const trimmed = prompt.trim();
      if (!trimmed || isGenerating) return;

      // Add user message
      addMessage({ role: 'user', content: trimmed });
      setInputValue('');
      setGenerating(true);
      setIsAtBottom(true);

      // Create abort controller
      const controller = new AbortController();
      abortControllerRef.current = controller;

      // Add a placeholder assistant message
      addMessage({ role: 'assistant', content: '...' });

      try {
        // Build context
        const selectedEls = canvasElements.filter((el) => selectedIds.includes(el.id));
        const context = {
          selectedElements: selectedEls.map((el) => ({ id: el.id, type: el.type, name: el.name })),
          canvasWidth: 1920,
          canvasHeight: 1080,
        };

        // Send conversation history for multi-turn support
        const history = useAiPromptStore.getState().messages
          .filter((m) => m.content !== '...' && m.role === 'user')
          .map((m) => ({ role: m.role, content: m.content }));

        const res = await fetch('/api/ai/prompt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: trimmed, model: selectedModel, context, history }),
          signal: controller.signal,
        });

        const data = await res.json();

        if (!res.ok) {
          updateLastAssistantMessage(data.message ?? 'An error occurred. Please try again.');
          return;
        }

        // Parse elements if present
        let parsedElements: BoardElement[] | undefined;
        if (data.elements && Array.isArray(data.elements)) {
          parsedElements = data.elements.map(
            (el: Record<string, unknown>, idx: number) => ({
              id: `ai-${Date.now()}-${idx}`,
              type: (el.type as BoardElement['type']) ?? 'RECTANGLE',
              x: (el.x as number) ?? 100,
              y: (el.y as number) ?? 100,
              width: (el.width as number) ?? 200,
              height: (el.height as number) ?? 120,
              rotation: (el.rotation as number) ?? 0,
              content: (el.content as string) ?? '',
              color: (el.color as string) ?? '#FFFFFF',
              zIndex: idx,
              locked: false,
              visible: true,
              name: (el.name as string) ?? `AI Element ${idx + 1}`,
              styles: el.styles as BoardElement['styles'],
            }),
          );
        }

        updateLastAssistantMessage(data.message, parsedElements);
      } catch (err) {
        // Handle abort gracefully
        if (err instanceof DOMException && err.name === 'AbortError') {
          removeLastMessage();
          return;
        }
        updateLastAssistantMessage('Network error. Please check your connection and try again.');
      } finally {
        setGenerating(false);
        abortControllerRef.current = null;
      }
    },
    [isGenerating, addMessage, setGenerating, setIsAtBottom, updateLastAssistantMessage, selectedModel, canvasElements, selectedIds, removeLastMessage],
  );

  // ── Stop generating ───────────────────────────────────────────────────

  const stopGenerating = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  // ── Apply elements to canvas ──────────────────────────────────────────

  const applyToCanvas = useCallback(
    (msg: AiMessage) => {
      if (!msg.elements || msg.elements.length === 0) return;
      const offset = canvasElements.length > 0 ? Math.max(...canvasElements.map((e) => e.x + e.width)) + 40 : 100;
      const adjusted = msg.elements.map((el, i) => ({
        ...el,
        id: `ai-${Date.now()}-${i}`,
        x: offset,
        y: 100 + i * 10,
        zIndex: canvasElements.length + i,
      }));
      setElements([...canvasElements, ...adjusted]);
      pushHistory();
    },
    [canvasElements, setElements, pushHistory],
  );

  // ── Save as component ──────────────────────────────────────────────────

  const saveAsComponent = useCallback(
    (msg: AiMessage) => {
      if (!msg.elements || msg.elements.length === 0) return;

      const offset = canvasElements.length > 0 ? Math.max(...canvasElements.map((e) => e.x + e.width)) + 40 : 100;
      const adjusted = msg.elements.map((el, i) => ({
        ...el,
        id: `ai-${Date.now()}-${i}`,
        x: offset,
        y: 100 + i * 10,
        zIndex: canvasElements.length + i,
      }));

      const masterEl = adjusted[0];
      const now = new Date().toISOString();
      const componentDef = {
        id: `comp-${Date.now()}`,
        name: msg.content.slice(0, 40) || 'AI Component',
        description: 'AI-generated component',
        masterElementId: masterEl.id,
        childElementIds: adjusted.map((el) => el.id),
        createdAt: now,
        updatedAt: now,
      };

      useComponentStore.getState().registerComponent(componentDef);
      setElements([...canvasElements, ...adjusted]);
      pushHistory();
    },
    [canvasElements, setElements, pushHistory],
  );

  // ── Regenerate last response ──────────────────────────────────────────

  const regenerate = useCallback(() => {
    const lastUserIdx = [...messages].reverse().findIndex((m) => m.role === 'user');
    if (lastUserIdx === -1) return;
    const lastUserMsg = messages[messages.length - 1 - lastUserIdx];
    removeLastMessage();
    sendPrompt(lastUserMsg.content);
  }, [messages, removeLastMessage, sendPrompt]);

  // ── Edit message and resend ───────────────────────────────────────────

  const handleEditAndResend = useCallback(
    (msgId: string, newContent: string) => {
      editMessage(msgId, newContent);
      setEditingMessageId(null);
      sendPrompt(newContent);
    },
    [editMessage, sendPrompt, setEditingMessageId],
  );

  // ── Handle key down ──────────────────────────────────────────────────

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendPrompt(inputValue);
    }
  };

  const handleQuickAction = (prompt: string) => {
    sendPrompt(prompt);
  };

  const handleSuggestionClick = (prompt: string) => {
    sendPrompt(prompt);
  };

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/40 gap-1.5 shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <Wand2 className="size-3.5 text-primary shrink-0" />
          <span className="text-xs font-semibold truncate">{t('aiPrompt.title', locale)}</span>
        </div>
        <div className="flex items-center gap-1">
          {/* Compact model selector */}
          <Select value={selectedModel} onValueChange={setModel}>
            <SelectTrigger className="h-6 w-auto min-w-0 max-w-[90px] text-[10px] px-1.5 border-0 shadow-none bg-transparent gap-1 focus:ring-0 focus:ring-offset-0">
              <ModelIcon
                icon={availableModels.find((m) => m.id === selectedModel)?.icon ?? 'cpu'}
                className="text-primary"
              />
              <SelectValue />
              <ChevronDown className="size-2.5 text-muted-foreground shrink-0" />
            </SelectTrigger>
            <SelectContent className="min-w-[140px]">
              {availableModels.map((model) => (
                <SelectItem key={model.id} value={model.id} className="text-xs">
                  <div className="flex items-center gap-2">
                    <ModelIcon icon={model.icon} />
                    <div className="flex flex-col">
                      <span className="flex items-center gap-1.5">
                        {model.name}
                        {model.id === selectedModel && (
                          <span className="size-1.5 rounded-full bg-primary shrink-0" />
                        )}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{model.provider}</span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setCollapsed(!collapsed)}
              >
                <ChevronDown className={cn('size-3 transition-transform duration-200', collapsed && '-rotate-90')} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">{collapsed ? 'Expand' : 'Collapse'}</TooltipContent>
          </Tooltip>
          {messages.length > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                  onClick={clearMessages}
                >
                  <Trash2 className="size-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">{t('aiPrompt.clearChat', locale)}</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {/* ── Collapsed state ── */}
      {collapsed ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-[10px] text-muted-foreground text-center">{t('aiPrompt.title', locale)}</p>
        </div>
      ) : (
        <>
          {/* ── Messages area ── */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="relative flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted"
            style={{ maxHeight: 'calc(100vh - 280px)' }}
          >
            {messages.length === 0 && !isGenerating ? (
              <WelcomeEmptyState locale={locale} onSuggestionClick={handleSuggestionClick} />
            ) : (
              <div className="flex flex-col gap-3 p-3 pb-1">
                {/* Show welcome + suggestions if first message and not many messages */}
                {messages.length === 0 && isGenerating && (
                  <div className="flex flex-col items-center gap-3 pt-6 pb-2">
                    <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10">
                      <Wand2 className="size-5 text-primary" />
                    </div>
                    <p className="text-[11px] text-muted-foreground text-center">
                      {t('aiPrompt.welcome', locale)}
                    </p>
                  </div>
                )}

                {messages.map((msg) =>
                  editingMessageId === msg.id ? (
                    <EditMessageInline
                      key={msg.id}
                      initialContent={msg.content}
                      locale={locale}
                      onSave={(newContent) => handleEditAndResend(msg.id, newContent)}
                      onCancel={() => setEditingMessageId(null)}
                    />
                  ) : (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      locale={locale}
                      onApply={() => applyToCanvas(msg)}
                      onSaveComponent={() => saveAsComponent(msg)}
                      onRegenerate={regenerate}
                      onEdit={() => setEditingMessageId(msg.id)}
                      onDelete={() => deleteMessage(msg.id)}
                      onCopy={() => handleCopy(msg.id, msg.content)}
                    />
                  ),
                )}

                {/* Typing indicator with animation */}
                <AnimatePresence>
                  {isGenerating && (
                    <TypingIndicator />
                  )}
                </AnimatePresence>

                <div ref={messagesEndRef} className="h-1" />
              </div>
            )}

            {/* Scroll-to-bottom FAB */}
            {!isAtBottom && messages.length > 0 && (
              <ScrollToBottomFab onClick={scrollToBottom} locale={locale} />
            )}
          </div>

          {/* ── Quick actions ── */}
          <div className="px-2 py-1.5 border-t border-border/30 shrink-0">
            <div className="flex flex-wrap gap-1">
              {QUICK_ACTIONS.map((action) => (
                <Badge
                  key={action.key}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors text-[10px] gap-1 py-0 px-1.5 border-border/40"
                  onClick={() => handleQuickAction(action.prompt)}
                >
                  <action.icon className="size-2.5" />
                  {t(`aiPrompt.${action.key}`, locale)}
                </Badge>
              ))}
            </div>
          </div>

          {/* ── Input area ── */}
          <div className="p-2 pt-1 border-t border-border/40 shrink-0">
            <div
              className={cn(
                'neu-flat bg-background rounded-2xl flex items-end gap-1.5 p-1.5 border border-border/30',
                'transition-shadow duration-300',
                'focus-within:shadow-[0_0_0_2px_hsl(var(--primary)/0.12),3px_3px_6px_rgba(0,0,0,0.04),-2px_-2px_5px_rgba(255,255,255,0.6)]',
                'dark:focus-within:shadow-[0_0_0_2px_hsl(var(--primary)/0.15),3px_3px_6px_rgba(0,0,0,0.3),-2px_-2px_5px_rgba(30,30,30,0.05)]',
              )}
            >
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('aiPrompt.placeholder', locale)}
                rows={1}
                className="flex-1 resize-none bg-transparent text-[13px] outline-none placeholder:text-muted-foreground/60 min-h-[28px] max-h-[80px] py-1.5 px-2 leading-relaxed"
                disabled={isGenerating}
              />
              {isGenerating ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className={cn(
                        'h-8 w-8 p-0 shrink-0 rounded-xl border-border/30',
                        'text-muted-foreground hover:text-foreground hover:border-destructive/40 hover:bg-destructive/5',
                        'transition-all duration-200',
                      )}
                      onClick={stopGenerating}
                    >
                      <Square className="size-3 fill-current" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">{t('aiPrompt.stopGenerating', locale)}</TooltipContent>
                </Tooltip>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      className={cn(
                        'h-8 w-8 p-0 shrink-0 rounded-xl transition-all duration-200',
                        'hover:scale-105 active:scale-95',
                        inputValue.trim()
                          ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90'
                          : 'bg-muted text-muted-foreground/40 cursor-not-allowed',
                      )}
                      disabled={!inputValue.trim()}
                      onClick={() => sendPrompt(inputValue)}
                    >
                      <Send className="size-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">{t('aiPrompt.send', locale)}</TooltipContent>
                </Tooltip>
              )}
            </div>
            {/* Stop generating text button */}
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex justify-center mt-1.5"
              >
                <button
                  onClick={stopGenerating}
                  className="text-[10px] text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-1"
                >
                  <Square className="size-2.5 fill-current" />
                  {t('aiPrompt.stopGenerating', locale)}
                </button>
              </motion.div>
            )}
          </div>
        </>
      )}
    </div>
  );
}