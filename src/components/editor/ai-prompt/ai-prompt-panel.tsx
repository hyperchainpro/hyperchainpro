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
  ArrowDownToLine,
  Cpu,
  Globe,
  Settings,
  Bot,
  Loader2,
  CircleDot,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useAiPromptStore, type AiMessage } from '@/store/ai-prompt-store';
import { useCanvasStore } from '@/store/canvas-store';
import { t, type Locale } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { BoardElement } from '@/lib/types';

// ─── Neumorphism constants ────────────────────────────────────────────────────

const NEU_CARD =
  'shadow-[4px_4px_8px_rgba(0,0,0,0.06),-4px_-4px_8px_rgba(255,255,255,0.8)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.35),-4px_-4px_8px_rgba(30,30,30,0.08)]';
const NEU_FLAT =
  'shadow-[2px_2px_4px_rgba(0,0,0,0.04),-2px_-2px_4px_rgba(255,255,255,0.6)] dark:shadow-[2px_2px_4px_rgba(0,0,0,0.2),-2px_-2px_4px_rgba(30,30,30,0.05)]';
const NEU_PRESSED =
  'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.06),inset_-2px_-2px_4px_rgba(255,255,255,0.7)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(30,30,30,0.05)]';

// ─── Suggestion cards ────────────────────────────────────────────────────────

const SUGGESTION_CARDS = [
  { icon: '🔐', label: 'Create a login form with email and password', prompt: 'Create a login form with email and password fields, a login button, and a "Forgot password" link. Use a clean, modern style.' },
  { icon: '💳', label: 'Design a pricing card with 3 tiers', prompt: 'Design 3 pricing tier cards (Basic, Pro, Enterprise) side by side with feature lists, prices, and CTA buttons. Highlight the Pro tier.' },
  { icon: '🧭', label: 'Generate a navigation bar with logo', prompt: 'Generate a horizontal navigation bar with a logo on the left, navigation links in the center, and a CTA button on the right. Use a clean modern style.' },
  { icon: '📊', label: 'Create a dashboard chart layout', prompt: 'Create a dashboard layout with a sidebar, header, and 4 chart placeholder cards arranged in a 2x2 grid. Use professional colors.' },
  { icon: '📱', label: 'Design a mobile onboarding screen', prompt: 'Design a mobile onboarding screen (375×812) with a welcome illustration area, title, subtitle, and a "Get Started" button at the bottom.' },
  { icon: '📝', label: 'Design a contact form section', prompt: 'Design a contact form section with name, email, subject, and message fields, plus a submit button. Use proper spacing and labels.' },
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
      return <Globe className={cn('size-3.5', className)} />;
    case 'anthropic':
      return <Bot className={cn('size-3.5', className)} />;
    case 'google':
      return <Sparkles className={cn('size-3.5', className)} />;
    case 'cpu':
      return <Cpu className={cn('size-3.5', className)} />;
    case 'settings':
      return <Settings className={cn('size-3.5', className)} />;
    default:
      return <Bot className={cn('size-3.5', className)} />;
  }
}

// ─── Message bubble ──────────────────────────────────────────────────────────

function MessageBubble({
  message,
  locale,
  onApply,
  onSaveComponent,
  onRegenerate,
}: {
  message: AiMessage;
  locale: Locale;
  onApply: () => void;
  onSaveComponent: () => void;
  onRegenerate: () => void;
}) {
  const isUser = message.role === 'user';
  const hasElements = (message.elements?.length ?? 0) > 0;

  return (
    <div className={cn('flex flex-col gap-1.5', isUser ? 'items-end' : 'items-start')}>
      {/* Role indicator */}
      <div className="flex items-center gap-1.5 px-1">
        {isUser ? (
          <>
            <span className="text-[10px] text-muted-foreground font-medium">You</span>
            <div className="size-1.5 rounded-full bg-primary" />
          </>
        ) : (
          <>
            <Wand2 className="size-3 text-primary" />
            <span className="text-[10px] text-muted-foreground font-medium">AI Assist</span>
          </>
        )}
      </div>

      {/* Content */}
      <div
        className={cn(
          'max-w-[210px] rounded-xl px-3 py-2 text-[12px] leading-relaxed break-words whitespace-pre-wrap',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'neu-flat bg-background text-foreground rounded-bl-sm border border-border/40',
        )}
      >
        {message.content}
      </div>

      {/* Elements preview badge */}
      {hasElements && (
        <div className="flex items-center gap-1 px-1">
          <Layers className="size-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">
            {message.elements!.length} element{message.elements!.length > 1 ? 's' : ''} generated
          </span>
        </div>
      )}

      {/* Action buttons for assistant messages */}
      {!isUser && (
        <div className="flex items-center gap-1 px-1 mt-0.5">
          {hasElements && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[10px] gap-1"
                    onClick={onApply}
                  >
                    <ArrowDownToLine className="size-3" />
                    {t('aiPrompt.applyToCanvas', locale)}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">{t('aiPrompt.applyToCanvas', locale)}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[10px] gap-1"
                    onClick={onSaveComponent}
                  >
                    <Layers className="size-3" />
                    {t('aiPrompt.applyAsComponent', locale)}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">{t('aiPrompt.applyAsComponent', locale)}</TooltipContent>
              </Tooltip>
            </>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[10px] gap-1"
                onClick={onRegenerate}
              >
                <RefreshCw className="size-3" />
                {t('aiPrompt.regenerate', locale)}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">{t('aiPrompt.regenerate', locale)}</TooltipContent>
          </Tooltip>
        </div>
      )}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function AiPromptPanel() {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  const {
    messages,
    isGenerating,
    selectedModel,
    availableModels,
    addMessage,
    updateLastAssistantMessage,
    removeLastMessage,
    setGenerating,
    setModel,
    clearMessages,
  } = useAiPromptStore();

  const { elements: canvasElements, selectedIds, addElement, setElements, pushHistory } = useCanvasStore();

  const [inputValue, setInputValue] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // ── Send prompt ─────────────────────────────────────────────────────────

  const sendPrompt = useCallback(
    async (prompt: string) => {
      const trimmed = prompt.trim();
      if (!trimmed || isGenerating) return;

      // Add user message
      addMessage({ role: 'user', content: trimmed });
      setInputValue('');
      setGenerating(true);

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

        const res = await fetch('/api/ai/prompt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: trimmed, model: selectedModel, context }),
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
      } catch {
        updateLastAssistantMessage('Network error. Please check your connection and try again.');
      } finally {
        setGenerating(false);
      }
    },
    [isGenerating, addMessage, setGenerating, updateLastAssistantMessage, selectedModel, canvasElements, selectedIds],
  );

  // ── Apply elements to canvas ────────────────────────────────────────────

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

  // ── Save as component ───────────────────────────────────────────────────

  const saveAsComponent = useCallback(
    (msg: AiMessage) => {
      if (!msg.elements || msg.elements.length === 0) return;
      // Apply to canvas first, then the user can create a component manually
      applyToCanvas(msg);
    },
    [applyToCanvas],
  );

  // ── Regenerate last response ────────────────────────────────────────────

  const regenerate = useCallback(() => {
    // Find the last user message
    const lastUserIdx = [...messages].reverse().findIndex((m) => m.role === 'user');
    if (lastUserIdx === -1) return;
    const lastUserMsg = messages[messages.length - 1 - lastUserIdx];
    // Remove the placeholder assistant message and re-send
    removeLastMessage();
    sendPrompt(lastUserMsg.content);
  }, [messages, removeLastMessage, sendPrompt]);

  // ── Handle key down ────────────────────────────────────────────────────

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendPrompt(inputValue);
    }
  };

  // ── Handle quick action ─────────────────────────────────────────────────

  const handleQuickAction = (prompt: string) => {
    sendPrompt(prompt);
  };

  // ── Handle suggestion click ────────────────────────────────────────────

  const handleSuggestionClick = (prompt: string) => {
    sendPrompt(prompt);
  };

  // ── Get last assistant message ──────────────────────────────────────────

  const getLastAssistantMessage = () => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') return messages[i];
    }
    return null;
  };

  // ── Render ──────────────────────────────────────────────────────────────

  const lastAiMsg = getLastAssistantMessage();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/40 gap-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <Wand2 className="size-3.5 text-primary shrink-0" />
          <span className="text-xs font-semibold truncate">{t('aiPrompt.title', locale)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Select value={selectedModel} onValueChange={setModel}>
            <SelectTrigger className="h-6 w-auto min-w-0 max-w-[100px] text-[10px] px-1.5 border-0 shadow-none bg-transparent gap-0.5">
              <ModelIcon icon={availableModels.find((m) => m.id === selectedModel)?.icon ?? 'cpu'} />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="min-w-[140px]">
              {availableModels.map((model) => (
                <SelectItem key={model.id} value={model.id} className="text-xs">
                  <div className="flex items-center gap-2">
                    <ModelIcon icon={model.icon} />
                    <div className="flex flex-col">
                      <span>{model.name}</span>
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
                onClick={() => setCollapsed((c) => !c)}
              >
                <ChevronDown className={cn('size-3 transition-transform', collapsed && '-rotate-90')} />
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
          <div className="max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-thin scrollbar-thumb-muted flex-1">
            {messages.length === 0 ? (
              /* ── Empty state: suggestions ── */
              <div className="flex flex-col gap-3 p-3">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {t('aiPrompt.suggestions', locale)}
                </p>
                <div className="flex flex-col gap-2">
                  {SUGGESTION_CARDS.map((card, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(card.prompt)}
                      className={cn(
                        'neu-flat bg-background rounded-xl p-2.5 text-left border border-border/30',
                        'hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer group',
                      )}
                    >
                      <span className="text-sm mr-1.5">{card.icon}</span>
                      <span className="text-[11px] text-foreground/80 group-hover:text-foreground leading-snug">
                        {card.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* ── Chat messages ── */
              <div className="flex flex-col gap-3 p-3">
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    locale={locale}
                    onApply={() => applyToCanvas(msg)}
                    onSaveComponent={() => saveAsComponent(msg)}
                    onRegenerate={regenerate}
                  />
                ))}

                {/* Generating indicator */}
                {isGenerating && (
                  <div className="flex items-center gap-2 px-2 py-1">
                    <Loader2 className="size-3 animate-spin text-primary" />
                    <span className="text-[11px] text-muted-foreground">{t('aiPrompt.generating', locale)}</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* ── Quick actions ── */}
          <div className="px-2 py-1.5 border-t border-border/30">
            <div className="flex flex-wrap gap-1">
              {QUICK_ACTIONS.map((action) => (
                <Badge
                  key={action.key}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors text-[10px] gap-1 py-0 px-1.5"
                  onClick={() => handleQuickAction(action.prompt)}
                >
                  <action.icon className="size-2.5" />
                  {t(`aiPrompt.${action.key}`, locale)}
                </Badge>
              ))}
            </div>
          </div>

          {/* ── Input area ── */}
          <div className="p-2 pt-1 border-t border-border/40">
            <div className={cn('neu-flat bg-background rounded-xl flex items-end gap-1 p-1.5 border border-border/30')}>
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('aiPrompt.placeholder', locale)}
                rows={1}
                className="flex-1 resize-none bg-transparent text-xs outline-none placeholder:text-muted-foreground min-h-[28px] max-h-[80px] py-1 px-1.5 leading-relaxed"
                disabled={isGenerating}
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    className="h-7 w-7 p-0 shrink-0"
                    disabled={!inputValue.trim() || isGenerating}
                    onClick={() => sendPrompt(inputValue)}
                  >
                    {isGenerating ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Send className="size-3.5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">{t('aiPrompt.send', locale)}</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </>
      )}
    </div>
  );
}